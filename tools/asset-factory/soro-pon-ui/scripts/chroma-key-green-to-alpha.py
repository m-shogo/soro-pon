#!/usr/bin/env python3
"""(互換用の薄いラッパー) 実体は chroma_key.py へ統合された。

旧実装(このファイルにあった2値判定: 緑チャンネルの単純な閾値一致のみで
削除)はdocs/IMAGE-ASSET-WORKFLOW.mdの透過処理契約(色距離+2段しきい値+
despill+決定的処理)を満たしていなかったため、chroma_key.pyへ置き換えた。
このファイルは名前の互換性のためだけに残し、実体はchroma_key.pyへ委譲する。

Usage:
  python3 chroma-key-green-to-alpha.py --input <raw.png> --output <out.png> \
    [--background-color '#00ff00'] [--hard-threshold 0.12] [--soft-threshold 0.35] \
    [--despill-strength 0.6]

自動検査・比較画像・生成記録・candidates配置まで一括で行う、より高機能な
Codex CLI起点コマンドは `pnpm asset:image:prepare` を使うこと。
"""

from __future__ import annotations

from chroma_key import main

if __name__ == "__main__":
    main()
