#!/usr/bin/env python3
"""外部画像生成APIを使わない、決定的な合成テストfixture。

docs/IMAGE-ASSET-WORKFLOW.mdの透過処理契約をテストするための最小画像群。
乱数は一切使わない(同じ関数呼び出しは常に同じピクセルを返す)。
"""

from __future__ import annotations

import math

from PIL import Image
import numpy as np

GREEN: tuple[int, int, int] = (0, 255, 0)
MAGENTA: tuple[int, int, int] = (255, 0, 255)
WARM_SUBJECT: tuple[int, int, int] = (224, 130, 60)  # 暖色(オレンジ寄り)


def _canvas(width: int, height: int, bg: tuple[int, int, int]) -> np.ndarray:
    arr = np.zeros((height, width, 3), dtype=np.float64)
    arr[..., 0] = bg[0]
    arr[..., 1] = bg[1]
    arr[..., 2] = bg[2]
    return arr


def _draw_aa_circle(
    arr: np.ndarray,
    cx: float,
    cy: float,
    radius: float,
    color: tuple[int, int, int],
    alpha: np.ndarray | None = None,
) -> np.ndarray:
    """アンチエイリアス付きの円を合成する。alphaは0..1の追加マスク(影表現用)。"""
    height, width = arr.shape[:2]
    yy, xx = np.mgrid[0:height, 0:width]
    dist = np.sqrt((xx - cx) ** 2 + (yy - cy) ** 2)
    # 円の境界1pxをAA(distがradius付近で0..1に遷移)
    coverage = np.clip(radius + 0.5 - dist, 0.0, 1.0)
    if alpha is not None:
        coverage = coverage * alpha
    color_arr = np.array(color, dtype=np.float64)
    out = arr.copy()
    for c in range(3):
        out[..., c] = arr[..., c] * (1 - coverage) + color_arr[c] * coverage
    return out


def fixture_green_round_subject(width: int = 200, height: int = 200) -> Image.Image:
    """1. グリーン背景+暖色の丸い被写体(2はこのAA境界そのもの)。"""
    arr = _canvas(width, height, GREEN)
    arr = _draw_aa_circle(arr, width / 2, height / 2, min(width, height) * 0.32, WARM_SUBJECT)
    return Image.fromarray(arr.astype(np.uint8), mode="RGB")


def fixture_green_subject_with_soft_shadow(width: int = 200, height: int = 200) -> Image.Image:
    """3. 半透明の影(背景へブレンドされた柔らかい影)を持つ被写体。"""
    arr = _canvas(width, height, GREEN)
    # 影: 被写体の右下に、背景へ50%程度ブレンドされた暗い楕円
    shadow_yy, shadow_xx = np.mgrid[0:height, 0:width]
    sdist = np.sqrt(
        ((shadow_xx - (width / 2 + 14)) / 1.3) ** 2 + ((shadow_yy - (height / 2 + 14)) / 0.9) ** 2
    )
    shadow_alpha = np.clip((min(width, height) * 0.34 - sdist) / 22.0, 0.0, 1.0) * 0.45
    dark = np.array([0, 90, 0], dtype=np.float64)  # 緑背景上の影(暗い緑寄り)
    for c in range(3):
        arr[..., c] = arr[..., c] * (1 - shadow_alpha) + dark[c] * shadow_alpha
    arr = _draw_aa_circle(arr, width / 2, height / 2, min(width, height) * 0.3, WARM_SUBJECT)
    return Image.fromarray(arr.astype(np.uint8), mode="RGB")


def fixture_subject_with_near_bg_patch(width: int = 200, height: int = 200) -> Image.Image:
    """4. 被写体内部に背景色へ近い色(誤って透過されうる色)を含む。"""
    arr = _canvas(width, height, GREEN)
    arr = _draw_aa_circle(arr, width / 2, height / 2, min(width, height) * 0.32, WARM_SUBJECT)
    # 被写体中央に、背景グリーンへかなり近い(だが完全一致ではない)小さな斑点
    near_bg = (40, 210, 40)
    arr = _draw_aa_circle(arr, width / 2, height / 2, min(width, height) * 0.08, near_bg)
    return Image.fromarray(arr.astype(np.uint8), mode="RGB")


def fixture_magenta_background(width: int = 200, height: int = 200) -> Image.Image:
    """5. マゼンタ背景ケース(緑以外の背景色の一般化確認)。"""
    arr = _canvas(width, height, MAGENTA)
    arr = _draw_aa_circle(arr, width / 2, height / 2, min(width, height) * 0.32, WARM_SUBJECT)
    return Image.fromarray(arr.astype(np.uint8), mode="RGB")


def fixture_subject_touching_edge(width: int = 200, height: int = 200) -> Image.Image:
    """6. 被写体が画像端に接触して失敗するケース。"""
    arr = _canvas(width, height, GREEN)
    radius = min(width, height) * 0.32
    # 中心をradius分だけ右へずらし、右端に接触させる
    arr = _draw_aa_circle(arr, width - radius * 0.6, height / 2, radius, WARM_SUBJECT)
    return Image.fromarray(arr.astype(np.uint8), mode="RGB")


def fixture_insufficient_padding(width: int = 200, height: int = 200) -> Image.Image:
    """7. 余白不足で失敗するケース(端には接触しないが規定余白未満)。"""
    arr = _canvas(width, height, GREEN)
    radius = min(width, height) * 0.32
    # 上端から radius + 2px 程度しか余白がない位置に配置(既定min_paddingを下回る想定)
    arr = _draw_aa_circle(arr, width / 2, radius + 2, radius, WARM_SUBJECT)
    return Image.fromarray(arr.astype(np.uint8), mode="RGB")


ALL_FIXTURES = {
    "green_round_subject": fixture_green_round_subject,
    "green_subject_with_soft_shadow": fixture_green_subject_with_soft_shadow,
    "subject_with_near_bg_patch": fixture_subject_with_near_bg_patch,
    "magenta_background": fixture_magenta_background,
    "subject_touching_edge": fixture_subject_touching_edge,
    "insufficient_padding": fixture_insufficient_padding,
}


def main() -> None:
    import argparse
    from pathlib import Path

    parser = argparse.ArgumentParser(description="fixture画像をディレクトリへ書き出す(デバッグ用)")
    parser.add_argument("--out-dir", required=True)
    args = parser.parse_args()
    out_dir = Path(args.out_dir)
    out_dir.mkdir(parents=True, exist_ok=True)
    for name, factory in ALL_FIXTURES.items():
        factory().save(out_dir / f"{name}.png")
        print(f"wrote {out_dir / f'{name}.png'}")


if __name__ == "__main__":
    main()
