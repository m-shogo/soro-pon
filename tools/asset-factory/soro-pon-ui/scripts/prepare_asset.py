#!/usr/bin/env python3
"""Codex CLIから実行する正式コマンド(画像生成後の一連処理)。

pnpm asset:image:prepare --skin <id> --slot <slot> --input <raw-file> ...
(docs/IMAGE-ASSET-WORKFLOW.md 8工程のうち3〜7を一括実行する)

このコマンドは画像生成API自体は呼ばない。将来、Codex CLIから承認済みの
画像生成ラッパー(prompts/配下)を呼んだ後、その出力(単色背景の元画像)を
`--input` として本コマンドへ渡せば、そのまま透過〜candidates配置まで
つながる構造になっている。

実行内容:
  1. asset request(任意)の存在確認
  2. 入力元画像の存在確認
  3. Python透過処理(chroma_key.process)
  4. 自動検査(validate_candidate)
  5. 比較画像生成(compare_image)
  6. metadata + content hash 生成・保存
  7. 検査成功時のみ generated/candidates/ へ配置(失敗時は配置しない)
"""

from __future__ import annotations

import argparse
import json
import shutil
import sys
from datetime import datetime, timezone
from pathlib import Path

from PIL import Image

from chroma_key import ChromaKeyParams, hex_to_rgb, process
from compare_image import build_comparison_image
from validate_candidate import ValidationParams, validate_candidate

SCRIPT_DIR = Path(__file__).resolve().parent
FACTORY_ROOT = SCRIPT_DIR.parent  # tools/asset-factory/soro-pon-ui
REPO_ROOT = FACTORY_ROOT.parent.parent.parent  # repo root
RAW_GREEN_DIR = FACTORY_ROOT / "raw-green"
PROCESSED_DIR = FACTORY_ROOT / "processed"
RECORDS_DIR = FACTORY_ROOT / "records"
ASSET_REQUESTS_DIR = REPO_ROOT / "docs" / "asset-requests"
SKINS_ROOT = REPO_ROOT / "public" / "assets" / "ui" / "soro-pon" / "skins"


def _default_output_name(slot: str) -> str:
    return slot.replace(".", "-") + ".png"


def _ensure_raw_copy(input_path: Path, skin: str, slot: str) -> Path:
    """--inputがraw-green/配下になければ、監査保存領域へコピーする。"""
    RAW_GREEN_DIR.mkdir(parents=True, exist_ok=True)
    try:
        input_path.relative_to(RAW_GREEN_DIR)
        return input_path  # 既にraw-green配下
    except ValueError:
        pass
    dest = RAW_GREEN_DIR / f"{skin}-{slot.replace('.', '-')}-{input_path.name}"
    shutil.copy2(input_path, dest)
    return dest


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
    parser.add_argument("--prompt", default=None, help="生成に使ったprompt")
    parser.add_argument("--prompt-file", default=None, help="promptをファイルから読む")
    parser.add_argument("--tool", default="codex-cli")
    parser.add_argument("--model", default=None)
    parser.add_argument("--seed", default=None)
    parser.add_argument("--license", default="original project asset (Codex CLI generation, pending human review)")
    return parser


def main() -> int:
    args = _build_arg_parser().parse_args()
    invocation_command = "pnpm asset:image:prepare " + " ".join(sys.argv[1:])

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

    raw_copy = _ensure_raw_copy(input_path, args.skin, args.slot)

    original_image = Image.open(input_path)
    params = ChromaKeyParams(
        background_color=hex_to_rgb(args.background_color),
        hard_threshold=args.hard_threshold,
        soft_threshold=args.soft_threshold,
        despill_strength=args.despill_strength,
    )
    processed_image = process(original_image, params)

    PROCESSED_DIR.mkdir(parents=True, exist_ok=True)
    processed_path = PROCESSED_DIR / output_name
    processed_image.save(processed_path)

    compare_path = PROCESSED_DIR / (Path(output_name).stem + ".compare.png")
    build_comparison_image(original_image, processed_image).save(compare_path)

    validation_params = ValidationParams(
        background_color=params.background_color,
        expected_width=args.expected_width,
        expected_height=args.expected_height,
        min_transparent_padding=args.min_padding,
    )
    result = validate_candidate(str(processed_path), validation_params)

    candidates_dir = SKINS_ROOT / args.skin / "generated" / "candidates"
    placed_at: str | None = None
    if result.ok:
        candidates_dir.mkdir(parents=True, exist_ok=True)
        dest = candidates_dir / output_name
        shutil.copy2(processed_path, dest)
        placed_at = str(dest.relative_to(REPO_ROOT))

    record = {
        "skinId": args.skin,
        "slot": args.slot,
        "assetRequest": args.request,
        "sourceFile": str(raw_copy.relative_to(REPO_ROOT)) if raw_copy.is_relative_to(REPO_ROOT) else str(raw_copy),
        "prompt": prompt,
        "tool": args.tool,
        "model": args.model,
        "invocationCommand": invocation_command,
        "seed": args.seed,
        "backgroundColor": args.background_color,
        "method": "codex-cli-chroma-key",
        "processedFile": str(processed_path.relative_to(REPO_ROOT)),
        "compareFile": str(compare_path.relative_to(REPO_ROOT)),
        "processParams": {
            "hardThreshold": args.hard_threshold,
            "softThreshold": args.soft_threshold,
            "despillStrength": args.despill_strength,
            "minPadding": args.min_padding,
        },
        "dimensions": {"width": result.width, "height": result.height},
        "contentHash": result.content_hash,
        "placedAt": placed_at,
        "generatedAt": datetime.now(timezone.utc).strftime("%Y-%m-%d"),
        "approval": "candidate" if result.ok else "rejected-validation",
        "validation": {"ok": result.ok, "issues": result.issues},
        "license": args.license,
    }

    RECORDS_DIR.mkdir(parents=True, exist_ok=True)
    record_path = RECORDS_DIR / f"{args.skin}-{args.slot.replace('.', '-')}.json"
    record_path.write_text(json.dumps(record, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")

    print(f"content hash: {result.content_hash}")
    print(f"comparison image: {compare_path}")
    print(f"metadata: {record_path}")
    if result.ok:
        print(f"OK: candidatesへ配置しました: {placed_at}")
        return 0
    print("FAILED: 自動検査に失敗したため candidates へは配置していません:", file=sys.stderr)
    for issue in result.issues:
        print(f"  - {issue}", file=sys.stderr)
    return 1


if __name__ == "__main__":
    raise SystemExit(main())
