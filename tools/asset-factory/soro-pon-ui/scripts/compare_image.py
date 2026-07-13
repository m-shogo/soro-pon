#!/usr/bin/env python3
"""透過処理の処理前後を人間が確認できる比較画像を生成する。

構成: 左=単色背景の元画像 / 中=市松模様上の透過後画像 / 右=暗背景上の透過後画像。
1枚で輪郭フリンジ(色かぶりの残り)を判断できる構成にする。
production manifestからは参照しない監査用出力。
"""

from __future__ import annotations

from PIL import Image
import numpy as np


def _checkerboard(width: int, height: int, cell: int = 8) -> Image.Image:
    yy, xx = np.mgrid[0:height, 0:width]
    pattern = (((xx // cell) + (yy // cell)) % 2 == 0)
    arr = np.where(pattern[..., None], 220, 180).astype(np.uint8)
    arr = np.repeat(arr, 3, axis=2)
    return Image.fromarray(arr, mode="RGB")


def _composite_on(background: Image.Image, foreground_rgba: Image.Image) -> Image.Image:
    base = background.convert("RGBA")
    return Image.alpha_composite(base, foreground_rgba).convert("RGB")


def build_comparison_image(
    original: Image.Image,
    processed_rgba: Image.Image,
    dark_bg_color: tuple[int, int, int] = (24, 24, 28),
) -> Image.Image:
    width, height = processed_rgba.size
    original_resized = original.convert("RGB").resize((width, height))

    checker = _checkerboard(width, height)
    on_checker = _composite_on(checker, processed_rgba)

    dark = Image.new("RGB", (width, height), dark_bg_color)
    on_dark = _composite_on(dark, processed_rgba)

    gap = 8
    strip_width = width * 3 + gap * 2
    strip = Image.new("RGB", (strip_width, height), (255, 255, 255))
    strip.paste(original_resized, (0, 0))
    strip.paste(on_checker, (width + gap, 0))
    strip.paste(on_dark, (width * 2 + gap * 2, 0))
    return strip


def main() -> None:
    import argparse

    parser = argparse.ArgumentParser(description="処理前後の比較画像を生成する")
    parser.add_argument("--original", required=True)
    parser.add_argument("--processed", required=True)
    parser.add_argument("--output", required=True)
    args = parser.parse_args()

    original = Image.open(args.original)
    processed = Image.open(args.processed).convert("RGBA")
    build_comparison_image(original, processed).save(args.output)
    print(f"Saved comparison image: {args.output}")


if __name__ == "__main__":
    main()
