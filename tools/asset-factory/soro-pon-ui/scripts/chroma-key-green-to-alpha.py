#!/usr/bin/env python3
"""Convert chroma green background to alpha for soro-pon UI parts.

Usage:
  python tools/asset-factory/soro-pon-ui/scripts/chroma-key-green-to-alpha.py \
    --input tools/asset-factory/soro-pon-ui/raw-green/button-primary.png \
    --output public/assets/ui/soro-pon/v1/buttons/button-primary.png

Notes:
  - Input images should use a flat #00ff00 background.
  - Avoid green in the subject when generating assets.
"""

from __future__ import annotations

import argparse
from pathlib import Path
from PIL import Image


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Remove chroma green background from a PNG.")
    parser.add_argument("--input", required=True, help="Input image path")
    parser.add_argument("--output", required=True, help="Output PNG path")
    parser.add_argument("--green-threshold", type=int, default=180, help="Minimum green channel value")
    parser.add_argument("--red-max", type=int, default=110, help="Maximum red channel value")
    parser.add_argument("--blue-max", type=int, default=110, help="Maximum blue channel value")
    parser.add_argument("--soft-edge", type=int, default=24, help="Soft alpha edge range in pixels/color distance")
    return parser.parse_args()


def is_green_pixel(r: int, g: int, b: int, green_threshold: int, red_max: int, blue_max: int) -> bool:
    return g >= green_threshold and r <= red_max and b <= blue_max and g > r * 1.35 and g > b * 1.35


def main() -> None:
    args = parse_args()
    input_path = Path(args.input)
    output_path = Path(args.output)

    if not input_path.exists():
        raise FileNotFoundError(f"Input file not found: {input_path}")

    image = Image.open(input_path).convert("RGBA")
    pixels = image.load()
    width, height = image.size

    for y in range(height):
        for x in range(width):
            r, g, b, a = pixels[x, y]
            if is_green_pixel(r, g, b, args.green_threshold, args.red_max, args.blue_max):
                pixels[x, y] = (r, g, b, 0)

    output_path.parent.mkdir(parents=True, exist_ok=True)
    image.save(output_path)
    print(f"Saved transparent PNG: {output_path}")


if __name__ == "__main__":
    main()
