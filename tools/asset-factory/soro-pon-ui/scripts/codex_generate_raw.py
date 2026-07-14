#!/usr/bin/env python3
"""Codex CLIから画像生成を実行し、raw-green/へ保存するラッパー(工程1-2)。

docs/IMAGE-ASSET-WORKFLOW.md「Codex CLIからの起動契約」の実装:
  - `codex exec` を子プロセスとして起動し、画像生成の呼び出し自体を
    Codex CLIから行う(手動で別環境から生成して持ち込まない)
  - Codexは実際の生成画像を ~/.codex/generated_images/<session>/*.png に
    保存するので、そのファイルを本ツールの監査保存領域(raw-green/)へ
    コピーする
  - 実行コマンド・session id・promptファイルパスをmetadataとして返す

このスクリプト自体は非決定的(画像生成API呼び出しのため)。
raw画像が保存された後の処理(chroma_key.py以降)は決定的。

監査schema契約(record_schema.py):
  - Codex execのsession idはgenerationSessionIdとして記録する。seedとは
    別物(Codex CLIは実際のseedを提供しないため、seedへsession idを
    代入してはならない)
  - generationCommand は本スクリプト自身を再実行可能な形
    (`pnpm asset:image:generate --prompt-file ... --output-name ...`)で
    記録する(内部のcodex exec呼び出しは、巨大なprompt本文を1引数として
    埋め込む必要がありシェル上での再実行に適さないため、別フィールド
    `codexInvocation` に参考情報として記録するのみ)
"""

from __future__ import annotations

import argparse
import json
import re
import subprocess
import sys
import tempfile
from datetime import datetime, timezone
from pathlib import Path

from record_schema import GENERATION_COMMAND_PREFIX, build_shell_command

SCRIPT_DIR = Path(__file__).resolve().parent
FACTORY_ROOT = SCRIPT_DIR.parent
RAW_GREEN_DIR = FACTORY_ROOT / "raw-green"

SESSION_ID_RE = re.compile(r"session id:\s*([0-9a-f-]+)")
MODEL_RE = re.compile(r"^model:\s*(\S+)", re.MULTILINE)
PROVIDER_RE = re.compile(r"^provider:\s*(\S+)", re.MULTILINE)
GENERATED_IMAGE_RE = re.compile(r"(/Users/[^\s\"']+?generated_images/[^\s\"']+?\.png)")


def _build_arg_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        description="Codex CLIから画像を生成し、raw-green/へ保存する(正式ラッパー)"
    )
    parser.add_argument("--prompt-file", required=True, help="prompt本文が書かれたファイル")
    parser.add_argument("--output-name", required=True, help="raw-green/内の保存ファイル名")
    parser.add_argument(
        "--workdir",
        default=None,
        help=(
            "codex execの作業ディレクトリ(既定: リポジトリ外の一時ディレクトリ)。"
            "重要: リポジトリ内を指定するとCodexがCLAUDE.md/AGENTS.mdの方針文書を"
            "拾い、asset production phaseの是非を検討し始めて生成を実行しない"
            "ことがあるため、既定はリポジトリ外にしている(実際に遭遇した挙動)"
        ),
    )
    parser.add_argument("--timeout", type=int, default=180, help="タイムアウト秒")
    parser.add_argument(
        "--codex-log",
        default=None,
        help="codex execの生ログ保存先(既定: raw-green/<output-name>.codex-log.txt)",
    )
    return parser


def main() -> int:
    args = _build_arg_parser().parse_args()
    prompt_path = Path(args.prompt_file)
    if not prompt_path.is_file():
        print(f"ERROR: promptファイルが見つかりません: {prompt_path}", file=sys.stderr)
        return 1
    prompt_text = prompt_path.read_text(encoding="utf-8")

    RAW_GREEN_DIR.mkdir(parents=True, exist_ok=True)
    if args.workdir:
        workdir = Path(args.workdir)
        workdir.mkdir(parents=True, exist_ok=True)
    else:
        # リポジトリ外(既定: システムの一時領域)。理由は--workdirのhelp参照。
        workdir = Path(tempfile.mkdtemp(prefix="soro-pon-codex-image-"))

    invocation = [
        "codex",
        "exec",
        "--sandbox",
        "workspace-write",
        "--skip-git-repo-check",
        "--cd",
        str(workdir),
        prompt_text,
    ]

    result = subprocess.run(
        invocation,
        stdin=subprocess.DEVNULL,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        text=True,
        timeout=args.timeout,
    )
    log_text = result.stdout

    log_path = Path(args.codex_log) if args.codex_log else RAW_GREEN_DIR / f"{args.output_name}.codex-log.txt"
    log_path.write_text(log_text, encoding="utf-8")

    session_match = SESSION_ID_RE.search(log_text)
    session_id = session_match.group(1) if session_match else None
    model_match = MODEL_RE.search(log_text)
    model = model_match.group(1) if model_match else None
    provider_match = PROVIDER_RE.search(log_text)
    provider = provider_match.group(1) if provider_match else "openai"

    image_matches = GENERATED_IMAGE_RE.findall(log_text)
    generated_path = Path(image_matches[-1]) if image_matches else None

    if result.returncode != 0 or generated_path is None or not generated_path.is_file():
        print("ERROR: Codex CLIによる画像生成に失敗しました", file=sys.stderr)
        print(f"  exit code: {result.returncode}", file=sys.stderr)
        print(f"  session id: {session_id}", file=sys.stderr)
        print(f"  log: {log_path}", file=sys.stderr)
        return 1

    dest = RAW_GREEN_DIR / args.output_name
    dest.write_bytes(generated_path.read_bytes())

    # 本スクリプト自身を再実行可能な形(shlexで安全にescape済み)。
    # --workdirは毎回リポジトリ外の一時ディレクトリが既定で振られるため
    # 再実行コマンドには含めない(むしろ固定すると陳腐化する)。
    generation_command = build_shell_command(
        GENERATION_COMMAND_PREFIX,
        ["--prompt-file", str(prompt_path), "--output-name", args.output_name],
    )

    record = {
        "outputName": args.output_name,
        "rawPath": str(dest),
        "codexGeneratedImagePath": str(generated_path),
        "generationCommand": generation_command,
        "codexInvocation": (
            "codex exec --sandbox workspace-write --skip-git-repo-check --cd "
            f"{workdir} <promptファイル: {prompt_path}の内容>"
        ),
        "provider": provider,
        "model": model,
        "generationSessionId": session_id,
        "promptFile": str(prompt_path),
        "codexLog": str(log_path),
        "generatedAt": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
    }

    sidecar_path = RAW_GREEN_DIR / f"{args.output_name}.generation.json"
    sidecar_path.write_text(json.dumps(record, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")

    print(json.dumps(record, indent=2, ensure_ascii=False))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
