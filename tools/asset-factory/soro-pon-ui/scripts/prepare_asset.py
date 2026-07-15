#!/usr/bin/env python3
"""Codex CLIから実行する正式コマンド(画像生成後の一連処理)。

pnpm asset:image:prepare --skin <id> --slot <slot> --input <raw-file> ...
(docs/IMAGE-ASSET-WORKFLOW.md 8工程のうち3〜7を一括実行する)

このコマンドは画像生成API自体は呼ばない。将来、Codex CLIから承認済みの
画像生成ラッパー(prompts/配下)を呼んだ後、その出力(単色背景の元画像)を
`--input` として本コマンドへ渡せば、そのまま透過〜candidates配置まで
つながる構造になっている。

実行内容(トランザクション化されている):
  1. asset request(任意)の存在確認・入力元画像の存在確認
  2. Python透過処理(chroma_key.process)・比較画像生成(compare_image)を
     一時作業領域(tempfile)へ出力する
  3. 自動検査(validate_candidate)を一時領域上で実行する
  4. 最終的に使用するarchive/public/recordパスを決定し、record内容を組み立てる
  5. record schemaの論理検証(validate_record_shape)を実行する
  6. 一時領域上のファイルと最終予定パスの対応でファイル検証
     (validate_record_files + path_exists注入)を実行する
  7. すべて成功した場合のみ、archive/public/recordへ確定配置する
     (同一ディレクトリ内の一時名へコピーしてからos.replace()で原子的に確定。
      途中で失敗した場合は今回追加したファイルをrollbackし、
      永続領域へ変更を残さない)

失敗の区別:
  - record schema違反(不正license等): 永続変更を一切残さず終了コード1
  - 自動画像検査の不合格: approval=rejected-validation として
    archive監査物(raw/candidate/compare)とrecordを確定保存し、
    publicへは配置せず終了コード1

archiveの世代(attempt)一意性:
  archive/<skin>/<slot>/candidate-<id>/attempt-<key>/{raw,candidate,compare}.png
  <key>は (1)generationSessionId → (2)candidate content hash短縮値 →
  (3)UUID の優先順位で決まる。同一candidate IDを再実行しても旧attemptを
  上書きしない。同一attempt keyで内容も完全一致する再実行はdedupe
  (既存archive/recordを再利用)し、内容が異なる場合はエラーで停止する。

public candidatesの同名衝突:
  既定ではエラーで停止する(内容が完全一致する場合のみ冪等成功)。
  明示的に--replace-public-candidateを指定した場合のみ差し替え、
  差し替え前のattempt archiveは保持し、置き換えられた旧candidate recordは
  approval=not-selected(superseded)へ更新して「現在のpublic candidateが
  どのattemptか」をrecordから一意に辿れる状態を保つ。
"""

from __future__ import annotations

import argparse
import hashlib
import json
import os
import re
import shutil
import sys
import tempfile
import uuid
from datetime import datetime, timezone
from pathlib import Path

from PIL import Image

from chroma_key import ChromaKeyParams, fit_to_canvas, hex_to_rgb, process
from compare_image import build_comparison_image
from record_schema import (
    CANDIDATE_LIKE_STATES,
    PROCESSING_COMMAND_PREFIX,
    build_shell_command,
    validate_record_files,
    validate_record_shape,
)
from validate_candidate import ValidationParams, validate_candidate

SCRIPT_DIR = Path(__file__).resolve().parent
FACTORY_ROOT = SCRIPT_DIR.parent  # tools/asset-factory/soro-pon-ui
REPO_ROOT = FACTORY_ROOT.parent.parent.parent  # repo root
RAW_GREEN_DIR = FACTORY_ROOT / "raw-green"
PROCESSED_DIR = FACTORY_ROOT / "processed"
RECORDS_DIR = FACTORY_ROOT / "records"
ARCHIVE_ROOT = FACTORY_ROOT / "archive"
ASSET_REQUESTS_DIR = REPO_ROOT / "docs" / "asset-requests"
SKINS_ROOT = REPO_ROOT / "public" / "assets" / "ui" / "soro-pon" / "skins"

DEFAULT_LICENSE = "original project asset generated via Codex CLI"


def _default_output_name(slot: str) -> str:
    return slot.replace(".", "-") + ".png"


def _candidate_archive_id(output_name: str) -> str:
    """archive/<skin>/<slot>/candidate-<id>/ の<id>を出力ファイル名から導出する。

    既存の命名規則(`<slot>-candidate-<id>.png`)からは末尾の`<id>`を
    そのまま使う。その規則に合致しない出力名は、stem全体をidとして使う
    (どんな出力名でも一意なarchiveディレクトリになる)。
    """
    stem = Path(output_name).stem
    marker = "-candidate-"
    idx = stem.rfind(marker)
    if idx != -1:
        return stem[idx + len(marker) :]
    return stem


def _attempt_key(generation_session_id: str | None, content_hash: str | None) -> str:
    """attemptディレクトリを一意化するキーを決める。

    優先順位: (1)generationSessionIdを安全なファイル名へ正規化した値 →
    (2)candidate content hashの短縮値 → (3)衝突しないUUID。
    """
    if generation_session_id:
        normalized = re.sub(r"[^a-z0-9-]+", "-", str(generation_session_id).lower()).strip("-")
        if normalized:
            return normalized
    if content_hash:
        return content_hash[:12]
    return uuid.uuid4().hex[:12]


def _sha256(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


class _Transaction:
    """永続領域への確定配置をrollback可能にする最小トランザクション。

    - place(): 同一ディレクトリ内の一時名へコピーしてからos.replace()で確定
      (同一ファイルシステム内のrenameなので原子的)。既定では既存ファイルの
      上書きを拒否する(overwrite=True指定時のみ、元内容を退避して差し替える)
    - write_text(): recordなどテキストの原子的書き込み(同上)
    - rollback(): 今回追加したファイルの削除・上書きしたファイルの復元・
      今回作成したディレクトリの削除(空の場合のみ)を行う
    """

    def __init__(self) -> None:
        self._created_files: list[Path] = []
        self._overwritten: list[tuple[Path, bytes]] = []
        self._created_dirs: list[Path] = []

    def _ensure_parent(self, dest: Path) -> None:
        missing: list[Path] = []
        current = dest.parent
        while not current.exists():
            missing.append(current)
            current = current.parent
        for directory in reversed(missing):
            directory.mkdir()
            self._created_dirs.append(directory)

    def _atomic_put(self, temp_write, dest: Path, overwrite: bool) -> None:
        if dest.exists():
            if not overwrite:
                raise FileExistsError(f"refusing to overwrite existing file: {dest}")
            self._overwritten.append((dest, dest.read_bytes()))
        else:
            self._created_files.append(dest)
        self._ensure_parent(dest)
        tmp = dest.with_name(f".{dest.name}.tmp-{os.getpid()}")
        try:
            temp_write(tmp)
            os.replace(tmp, dest)
        finally:
            tmp.unlink(missing_ok=True)

    def place(self, src: Path, dest: Path, overwrite: bool = False) -> None:
        self._atomic_put(lambda tmp: shutil.copy2(src, tmp), dest, overwrite)

    def write_text(self, text: str, dest: Path, overwrite: bool = False) -> None:
        self._atomic_put(
            lambda tmp: tmp.write_text(text, encoding="utf-8"), dest, overwrite
        )

    def rollback(self) -> None:
        for path in reversed(self._created_files):
            path.unlink(missing_ok=True)
        for path, original in reversed(self._overwritten):
            path.write_bytes(original)
        for directory in reversed(self._created_dirs):
            try:
                directory.rmdir()
            except OSError:
                pass  # 中に既存物が残っている場合は消さない


def _build_arg_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        description="画像生成後の透過〜candidates配置までを一括実行する(Codex CLI起点コマンド)"
    )
    parser.add_argument("--skin", required=True, help="skin id (例: cute-pop)")
    parser.add_argument("--slot", required=True, help="asset slot名 (例: badge.info.background)")
    parser.add_argument("--input", required=True, help="単色背景の元画像パス")
    parser.add_argument("--request", default=None, help="asset requestのid(docs/asset-requests/<id>.md)")
    parser.add_argument("--output-name", default=None, help="出力ファイル名(既定: slot名から生成)")
    parser.add_argument("--background-color", default="#00ff00")
    parser.add_argument("--hard-threshold", type=float, default=0.12)
    parser.add_argument("--soft-threshold", type=float, default=0.35)
    parser.add_argument("--despill-strength", type=float, default=0.6)
    parser.add_argument("--expected-width", type=int, default=None)
    parser.add_argument("--expected-height", type=int, default=None)
    parser.add_argument("--min-padding", type=int, default=4)
    parser.add_argument(
        "--fit-width",
        type=int,
        default=None,
        help=(
            "透過後、被写体の外接矩形基準でこの幅x高さのキャンバスへ決定的に"
            "収める(Codex CLI生成画像は生成側都合のサイズになるため)。"
            "指定時は--fit-heightも必須。fit後にexpected-width/heightの検査対象になる"
        ),
    )
    parser.add_argument("--fit-height", type=int, default=None)
    parser.add_argument(
        "--fit-margin-ratio",
        type=float,
        default=0.08,
        help="--fit-width/height指定時の片側余白比率(既定0.08)",
    )
    parser.add_argument("--prompt", default=None, help="生成に使ったprompt")
    parser.add_argument("--prompt-file", default=None, help="promptをファイルから読む")
    parser.add_argument("--tool", default="codex-cli")
    parser.add_argument("--provider", default=None, help="画像生成provider(例: openai)")
    parser.add_argument("--model", default=None)
    parser.add_argument(
        "--seed",
        default=None,
        help=(
            "実際のseed値のみ指定する(Codexのsession idは指定しないこと。"
            "session idは--generation-session-idを使う)"
        ),
    )
    parser.add_argument(
        "--generation-session-id",
        default=None,
        help="Codex execのsession id(seedとは別フィールドで保持する。attempt keyにも使われる)",
    )
    parser.add_argument(
        "--generation-command",
        default=None,
        help="raw画像生成に使った`pnpm asset:image:generate ...`コマンド(再実行可能な形で記録する)",
    )
    parser.add_argument(
        "--approval",
        default=None,
        choices=["candidate", "approved", "rejected", "not-selected", "promoted"],
        help=(
            "人間の判断による承認状態の明示指定(既定: 自動検査結果から導出。"
            "自動検査不合格時は常にrejected-validationになり、この指定は無視される)"
        ),
    )
    parser.add_argument("--rejection-reason", default=None, help="不採用の場合の理由")
    parser.add_argument(
        "--replace-public-candidate",
        action="store_true",
        help=(
            "public generated/candidates内に同名の候補が既に存在する場合に差し替えを"
            "許可する(既定では内容が完全一致しない限りエラーで停止する)。"
            "差し替え前のattempt archiveとrecordは保持され、旧recordは"
            "not-selected(superseded)へ更新される"
        ),
    )
    parser.add_argument(
        "--license",
        default=DEFAULT_LICENSE,
        help="生成由来・権利情報のみを記述する(承認状態を示す語は含めないこと)",
    )
    return parser


def _resolve_raw_source(input_path: Path, skin: str, slot: str) -> tuple[Path, Path | None]:
    """読み取り元raw画像と、raw-green/への配置予定先(不要ならNone)を返す。

    ここではコピーしない(コピーはトランザクション確定時に行う)。
    """
    resolved_input = input_path.resolve()
    try:
        resolved_input.relative_to(RAW_GREEN_DIR.resolve())
        return resolved_input, None  # 既にraw-green配下
    except ValueError:
        pass
    dest = RAW_GREEN_DIR / f"{skin}-{slot.replace('.', '-')}-{input_path.name}"
    return resolved_input, dest


def _find_superseded_records(
    public_rel: str, new_record_path: Path
) -> list[tuple[Path, dict]]:
    """placedAtが同じpublic candidateを指すcandidate/approved recordを列挙する。"""
    superseded: list[tuple[Path, dict]] = []
    if not RECORDS_DIR.is_dir():
        return superseded
    for path in sorted(RECORDS_DIR.glob("*.json")):
        if path == new_record_path:
            continue
        try:
            record = json.loads(path.read_text(encoding="utf-8"))
        except (OSError, json.JSONDecodeError):
            continue
        if record.get("placedAt") == public_rel and record.get("approval") in CANDIDATE_LIKE_STATES:
            superseded.append((path, record))
    return superseded


def main() -> int:
    args = _build_arg_parser().parse_args()
    # shlex.joinで各引数を安全にescapeする(素朴な空白結合だと`--background-color #00ff00`の
    # `#`以降がシェル上でコメント化され、記録したコマンドが再実行不能になる)
    processing_command = build_shell_command(PROCESSING_COMMAND_PREFIX, sys.argv[1:])

    input_path = Path(args.input)
    if not input_path.is_file():
        print(f"ERROR: 入力画像が見つかりません: {input_path}", file=sys.stderr)
        return 1

    if args.request:
        request_path = ASSET_REQUESTS_DIR / f"{args.request}.md"
        if not request_path.is_file():
            print(
                f"WARNING: asset request {request_path} が見つかりません(続行しますが、"
                "先にrequestを作成することを推奨します)",
                file=sys.stderr,
            )

    prompt = args.prompt
    if args.prompt_file:
        prompt = Path(args.prompt_file).read_text(encoding="utf-8")

    output_name = args.output_name or _default_output_name(args.slot)
    output_stem = Path(output_name).stem

    raw_source, raw_green_dest = _resolve_raw_source(input_path, args.skin, args.slot)

    # codex_generate_raw.pyが残したサイドカー記録(<raw>.generation.json)があれば
    # provider/model/generationSessionId/generationCommandを自動補完する
    # (明示的なCLI引数があればそちらを優先する)
    generation_sidecar_path = raw_source.with_name(raw_source.name + ".generation.json")
    generation_sidecar: dict = {}
    if generation_sidecar_path.is_file():
        generation_sidecar = json.loads(generation_sidecar_path.read_text(encoding="utf-8"))
    provider = args.provider or generation_sidecar.get("provider")
    model = args.model or generation_sidecar.get("model")
    generation_session_id = args.generation_session_id or generation_sidecar.get(
        "generationSessionId"
    )
    generation_command = args.generation_command or generation_sidecar.get("generationCommand")

    original_image = Image.open(raw_source)
    params = ChromaKeyParams(
        background_color=hex_to_rgb(args.background_color),
        hard_threshold=args.hard_threshold,
        soft_threshold=args.soft_threshold,
        despill_strength=args.despill_strength,
    )
    processed_image = process(original_image, params)

    if args.fit_width is not None or args.fit_height is not None:
        if args.fit_width is None or args.fit_height is None:
            print("ERROR: --fit-widthと--fit-heightは両方指定してください", file=sys.stderr)
            return 1
        processed_image = fit_to_canvas(
            processed_image, args.fit_width, args.fit_height, args.fit_margin_ratio
        )

    with tempfile.TemporaryDirectory(prefix="soro-pon-prepare-") as tmp_str:
        tmp = Path(tmp_str)
        staged_candidate = tmp / output_name
        processed_image.save(staged_candidate)
        staged_compare = tmp / (output_stem + ".compare.png")
        build_comparison_image(original_image, processed_image).save(staged_compare)

        validation_params = ValidationParams(
            background_color=params.background_color,
            expected_width=args.expected_width,
            expected_height=args.expected_height,
            min_transparent_padding=args.min_padding,
        )
        result = validate_candidate(str(staged_candidate), validation_params)

        if not result.ok:
            # schema違反ではなく画像検査の不合格。監査のためrecordとarchiveは
            # 残す(rejected-validation)。--approval指定があっても無視する。
            if args.approval is not None:
                print(
                    "WARNING: 自動検査に失敗しているため--approval指定は無視し"
                    " rejected-validation とします",
                    file=sys.stderr,
                )
            approval = "rejected-validation"
            rejection_reason = args.rejection_reason or (
                "自動画像検査に不合格: " + " / ".join(result.issues)
            )
        elif args.approval is not None:
            approval = args.approval
            rejection_reason = args.rejection_reason
        else:
            approval = "candidate"
            rejection_reason = args.rejection_reason

        attempt_key = _attempt_key(generation_session_id, result.content_hash)
        attempt_dir = (
            ARCHIVE_ROOT
            / args.skin
            / args.slot
            / f"candidate-{_candidate_archive_id(output_name)}"
            / f"attempt-{attempt_key}"
        )
        archive_raw = attempt_dir / "raw.png"
        archive_candidate = attempt_dir / "candidate.png"
        archive_compare = attempt_dir / "compare.png"

        placed_at: str | None = None
        public_dest: Path | None = None
        if approval in CANDIDATE_LIKE_STATES:
            public_dest = SKINS_ROOT / args.skin / "generated" / "candidates" / output_name
            placed_at = str(public_dest.relative_to(REPO_ROOT))

        today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
        record = {
            "skinId": args.skin,
            "slot": args.slot,
            "assetRequest": args.request,
            "sourceFile": str(archive_raw.relative_to(REPO_ROOT)),
            "prompt": prompt,
            "tool": args.tool,
            "provider": provider,
            "model": model,
            "seed": args.seed,
            "generationSessionId": generation_session_id,
            "generationCommand": generation_command,
            "processingCommand": processing_command,
            "backgroundColor": args.background_color,
            "method": "codex-cli-chroma-key",
            "processedFile": str(archive_candidate.relative_to(REPO_ROOT)),
            "compareFile": str(archive_compare.relative_to(REPO_ROOT)),
            "processParams": {
                "hardThreshold": args.hard_threshold,
                "softThreshold": args.soft_threshold,
                "despillStrength": args.despill_strength,
                "minPadding": args.min_padding,
            },
            "dimensions": {"width": result.width, "height": result.height},
            "contentHash": result.content_hash,
            "attemptKey": attempt_key,
            "placedAt": placed_at,
            "promotedTo": None,
            "generatedAt": today,
            "approval": approval,
            "rejectionReason": rejection_reason,
            "promotedAt": None,
            "skinVersionAtPromotion": None,
            "archivedAt": today,
            "validation": {"ok": result.ok, "issues": result.issues},
            "license": args.license,
        }

        # 5. ファイル配置以外のschema検証(論理検証)。違反なら永続変更ゼロで終了
        shape_issues = validate_record_shape(record)
        if shape_issues:
            print("ERROR: 生成記録が監査schemaに違反しています(何も保存していません):", file=sys.stderr)
            for issue in shape_issues:
                print(f"  - {issue}", file=sys.stderr)
            return 1

        # 6. 一時領域上のファイルと最終予定パスの対応で完全検証する
        staged_by_final_rel: dict[str, Path] = {
            record["sourceFile"]: raw_source,
            record["processedFile"]: staged_candidate,
            record["compareFile"]: staged_compare,
        }
        if placed_at is not None:
            staged_by_final_rel[placed_at] = staged_candidate

        def staged_path_exists(relative_path: str) -> bool:
            staged = staged_by_final_rel.get(relative_path)
            if staged is not None:
                return staged.is_file()
            return (REPO_ROOT / relative_path).is_file()

        file_issues = validate_record_files(record, path_exists=staged_path_exists)
        if file_issues:
            print("ERROR: 生成記録のファイル配置検証に失敗しました(何も保存していません):", file=sys.stderr)
            for issue in file_issues:
                print(f"  - {issue}", file=sys.stderr)
            return 1

        # attempt世代の衝突検査(無言上書き禁止):
        # 同一attempt keyのarchiveが既にあり内容も完全一致する場合のみdedupe。
        # 内容が異なる場合はエラーで停止する(旧attemptを上書きしない)。
        dedupe_archive = False
        if attempt_dir.exists():
            existing = {
                "raw.png": archive_raw,
                "candidate.png": archive_candidate,
                "compare.png": archive_compare,
            }
            staged_for = {
                "raw.png": raw_source,
                "candidate.png": staged_candidate,
                "compare.png": staged_compare,
            }
            identical = all(
                dest.is_file() and _sha256(dest) == _sha256(staged_for[name])
                for name, dest in existing.items()
            )
            if not identical:
                print(
                    f"ERROR: attempt archiveが既に存在し内容が一致しません(上書き拒否): {attempt_dir}",
                    file=sys.stderr,
                )
                return 1
            dedupe_archive = True

        # public candidatesの同名衝突検査(無言上書き禁止)
        record_path = (
            RECORDS_DIR
            / f"{args.skin}-{args.slot.replace('.', '-')}-{output_stem}-attempt-{attempt_key}.json"
        )
        public_replace_needed = False
        superseded_records: list[tuple[Path, dict]] = []
        if public_dest is not None and public_dest.exists():
            if _sha256(public_dest) == _sha256(staged_candidate):
                public_dest = None  # 内容が完全一致するため配置不要(冪等)
            elif not args.replace_public_candidate:
                print(
                    f"ERROR: 同名のpublic candidateが既に存在します: {placed_at}\n"
                    "  内容が異なるため上書きしません。差し替える場合は"
                    "--replace-public-candidateを明示指定してください",
                    file=sys.stderr,
                )
                return 1
            else:
                public_replace_needed = True
                superseded_records = _find_superseded_records(placed_at, record_path)

        # record自体の衝突検査
        skip_record_write = False
        if record_path.exists():
            if dedupe_archive:
                # 同一attemptの完全一致再実行: 既存recordを保持する(上書きしない)
                skip_record_write = True
            else:
                print(
                    f"ERROR: 同名のrecordが既に存在します(上書き拒否): {record_path}",
                    file=sys.stderr,
                )
                return 1

        # 7. 確定配置(rollback可能なトランザクション)
        txn = _Transaction()
        try:
            if raw_green_dest is not None and not raw_green_dest.exists():
                txn.place(raw_source, raw_green_dest)
            # processed/はローカル作業領域(gitignore)への利便性コピー。
            # 監査recordはarchive側のみを参照する
            txn.place(staged_candidate, PROCESSED_DIR / output_name, overwrite=True)
            txn.place(
                staged_compare, PROCESSED_DIR / (output_stem + ".compare.png"), overwrite=True
            )
            if not dedupe_archive:
                txn.place(raw_source, archive_raw)
                txn.place(staged_candidate, archive_candidate)
                txn.place(staged_compare, archive_compare)
            if public_dest is not None:
                txn.place(staged_candidate, public_dest, overwrite=public_replace_needed)
            if public_replace_needed:
                for superseded_path, superseded in superseded_records:
                    superseded["approval"] = "not-selected"
                    superseded["placedAt"] = None
                    superseded["rejectionReason"] = (
                        "public candidateをattempt "
                        f"{attempt_key} (--replace-public-candidate) で差し替えたため退役"
                    )
                    superseded["supersededByAttempt"] = attempt_key
                    txn.write_text(
                        json.dumps(superseded, indent=2, ensure_ascii=False) + "\n",
                        superseded_path,
                        overwrite=True,
                    )
            if not skip_record_write:
                txn.write_text(
                    json.dumps(record, indent=2, ensure_ascii=False) + "\n", record_path
                )
        except BaseException:
            txn.rollback()
            print(
                "ERROR: 確定配置中に失敗したため、今回の変更をすべてrollbackしました",
                file=sys.stderr,
            )
            raise

    print(f"content hash: {result.content_hash}")
    print(f"attempt: {attempt_key}")
    print(f"archive: {attempt_dir}")
    print(f"metadata: {record_path}")
    if result.ok:
        if placed_at is not None:
            if public_replace_needed:
                print(f"OK: public candidateを差し替えました: {placed_at}")
            else:
                print(f"OK: candidatesへ配置しました: {placed_at}")
        else:
            print(f"OK: approval={approval} のためpublicへは配置せずarchiveへのみ保存しました")
        return 0
    print(
        "FAILED: 自動検査に失敗したため rejected-validation として監査記録のみ保存しました"
        "(publicへは配置していません):",
        file=sys.stderr,
    )
    for issue in result.issues:
        print(f"  - {issue}", file=sys.stderr)
    return 1


if __name__ == "__main__":
    raise SystemExit(main())
