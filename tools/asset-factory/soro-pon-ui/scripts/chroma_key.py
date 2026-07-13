#!/usr/bin/env python3
"""Chroma-key transparency processing for soro-pon UI assets.

正本契約: docs/IMAGE-ASSET-WORKFLOW.md の「Python透過処理の契約」を実装する。

固定禁止事項:
  - 背景色と完全一致したピクセルだけを消す実装(2値判定)は使わない

実装している契約:
  - 色距離ベースの背景判定(完全一致比較は使わない)
  - hard threshold / soft threshold の2段階、間はアルファを線形補間
  - 半透明境界のグリーンスピル(色かぶり)除去(despill)。背景色に
    応じて一般化(green/magenta/blueいずれの背景でも動作する)
  - 元画像のアルファチャンネルがあれば合成して考慮する
  - 完全透明ピクセルのRGBを近傍色で正規化する(edge padding。理由は
    normalize_transparent_rgb() のdocstring参照)
  - 同じ入力・同じパラメータから同じ出力が得られる決定的処理

CLIとしても、他モジュールから呼ぶモジュールとしても使える。
"""

from __future__ import annotations

import argparse
import math
from dataclasses import dataclass

from PIL import Image
import numpy as np

Rgb = tuple[int, int, int]


def hex_to_rgb(value: str) -> Rgb:
    v = value.strip().lstrip("#")
    if len(v) != 6:
        raise ValueError(f"背景色は#rrggbb形式で指定してください: {value}")
    return (int(v[0:2], 16), int(v[2:4], 16), int(v[4:6], 16))


@dataclass(frozen=True)
class ChromaKeyParams:
    background_color: Rgb
    hard_threshold: float = 0.12
    soft_threshold: float = 0.35
    despill_strength: float = 0.6

    def __post_init__(self) -> None:
        if not (0.0 <= self.hard_threshold < self.soft_threshold <= 1.0):
            raise ValueError(
                "0 <= hard_threshold < soft_threshold <= 1 を満たす必要があります: "
                f"hard={self.hard_threshold} soft={self.soft_threshold}"
            )
        if not (0.0 <= self.despill_strength <= 1.0):
            raise ValueError(f"despill_strengthは0..1: {self.despill_strength}")


def _color_distance(rgb: np.ndarray, bg: Rgb) -> np.ndarray:
    """正規化RGBユークリッド距離(0..1)。0=背景色と同一、1=最大距離。

    Lab/HSVの方が知覚的に正確な場合もあるが、単色クロマキー背景
    (グリーン/マゼンタ/ブルー等)に対してはRGB距離で実用上十分であり、
    実装・デバッグ・決定性の単純さを優先した。将来、本体色と背景色が
    近い彩度域で誤判定が出る場合はLab距離への切替を検討する。
    """
    bg_arr = np.array(bg, dtype=np.float64)
    diff = (rgb.astype(np.float64) - bg_arr) / 255.0
    dist = np.sqrt((diff**2).sum(axis=-1)) / math.sqrt(3.0)
    return dist


def _alpha_from_distance(dist: np.ndarray, hard: float, soft: float) -> np.ndarray:
    """hard以下は透明(0)、soft以上は不透明(1)、間は線形補間。"""
    span = soft - hard
    alpha = (dist - hard) / span
    return np.clip(alpha, 0.0, 1.0)


def _despill(rgb: np.ndarray, bg: Rgb, alpha: np.ndarray, strength: float) -> np.ndarray:
    """半透明境界のグリーン(または指定背景色)スピルを除去する。

    背景色のうち平均より明るい("heavy")チャンネルを背景由来の色かぶり源とみなし、
    それ以外("light")チャンネルの平均へ向けて、透明度が高いピクセルほど強く
    引き寄せる。green(0,255,0)ならheavy=G、magenta(255,0,255)ならheavy=R,B、
    blue(0,0,255)ならheavy=Bとなり、任意の単色背景に一般化されている。
    """
    if strength <= 0:
        return rgb
    bg_arr = np.array(bg, dtype=np.float64)
    bg_avg = bg_arr.mean()
    heavy = [i for i in range(3) if bg_arr[i] > bg_avg + 20]
    if not heavy:
        return rgb
    light = [i for i in range(3) if i not in heavy]
    out = rgb.astype(np.float64).copy()
    light_avg = out[..., light].mean(axis=-1) if light else out.mean(axis=-1)
    # 透明に近いほど(alphaが低いほど)強くdespillする
    weight = (1.0 - alpha) * strength
    for ch in heavy:
        spill = out[..., ch] - light_avg
        spill = np.clip(spill, 0, None)
        out[..., ch] -= spill * weight
    return np.clip(out, 0, 255)


def chroma_key_transparent(image: Image.Image, params: ChromaKeyParams) -> Image.Image:
    """背景を透過したRGBA画像を返す。同一入力・同一paramsで決定的。"""
    rgba = image.convert("RGBA")
    arr = np.array(rgba)
    rgb = arr[..., :3]
    existing_alpha = arr[..., 3].astype(np.float64) / 255.0

    dist = _color_distance(rgb, params.background_color)
    chroma_alpha = _alpha_from_distance(dist, params.hard_threshold, params.soft_threshold)
    final_alpha = existing_alpha * chroma_alpha

    despilled_rgb = _despill(rgb, params.background_color, final_alpha, params.despill_strength)

    out = np.empty_like(arr)
    out[..., :3] = despilled_rgb.astype(np.uint8)
    out[..., 3] = np.clip(final_alpha * 255.0, 0, 255).astype(np.uint8)
    return Image.fromarray(out, mode="RGBA")


def normalize_transparent_rgb(image: Image.Image, iterations: int = 6) -> Image.Image:
    """alpha=0ピクセルのRGBを、隣接する不透明色のedge paddingで置き換える。

    採用理由: alpha=0ピクセルのRGBを無処理のまま残すと、そこに背景色
    (緑等)が残る。ブラウザやツールがリサイズ/圧縮で線形補間する際、
    alpha=0の"色"も补间に混ざり、輪郭に緑や不自然な色のにじみが出る
    (プリマルチプライドアルファ境界の汚れ)。単純な色差分ベースの
    "spill除去"だけでは alpha=0 领域そのものの色は変わらないため、
    別途この正規化が必要。近傍(3x3)の不透明ピクセルの平均色を
    透明ピクセルへ反復的に広げる("dilate")方式を採用した
    ("最近傍1色のコピー"より滑らかで、方向依存のアーティファクトが
    出にくいため)。
    """
    rgba = image.convert("RGBA")
    arr = np.array(rgba).astype(np.float64)
    rgb = arr[..., :3]
    alpha = arr[..., 3]
    opaque_mask = alpha > 0

    if opaque_mask.all() or not opaque_mask.any():
        return rgba

    rgb = rgb.copy()
    mask = opaque_mask.copy()
    for _ in range(iterations):
        if mask.all():
            break
        # 3x3近傍の平均色(不透明ピクセルのみ寄与)を1回分だけ拡張する
        weight = mask.astype(np.float64)
        weighted_rgb = rgb * weight[..., None]
        sum_rgb = np.zeros_like(weighted_rgb)
        sum_w = np.zeros_like(weight)
        for dy in (-1, 0, 1):
            for dx in (-1, 0, 1):
                sum_rgb += np.roll(np.roll(weighted_rgb, dy, axis=0), dx, axis=1)
                sum_w += np.roll(np.roll(weight, dy, axis=0), dx, axis=1)
        newly_fillable = (~mask) & (sum_w > 0)
        avg = np.divide(
            sum_rgb, sum_w[..., None], out=np.zeros_like(sum_rgb), where=sum_w[..., None] > 0
        )
        rgb[newly_fillable] = avg[newly_fillable]
        mask = mask | newly_fillable

    out = np.empty_like(np.array(rgba))
    out[..., :3] = np.clip(rgb, 0, 255).astype(np.uint8)
    out[..., 3] = alpha.astype(np.uint8)
    return Image.fromarray(out, mode="RGBA")


def process(image: Image.Image, params: ChromaKeyParams) -> Image.Image:
    """透過処理+透明ピクセルRGB正規化までの一括処理(決定的)。"""
    keyed = chroma_key_transparent(image, params)
    return normalize_transparent_rgb(keyed)


def fit_to_canvas(
    image: Image.Image,
    target_width: int,
    target_height: int,
    margin_ratio: float = 0.08,
    alpha_threshold: int = 8,
) -> Image.Image:
    """透過後の画像を、被写体の外接矩形基準でslot契約サイズへ決定的に収める。

    Codex CLIの画像生成は正方形など生成側の都合サイズになりやすく、
    asset slotの契約寸法(例: badge.info.background 240x80)とは一致しない。
    この関数は次を決定的に行う:
      1. alpha>thresholdの外接矩形(被写体)を求める
      2. その矩形を、target内の余白(margin_ratio)を除いた領域に収まる
         ようアスペクト比を保って等比縮小する
      3. target_width x target_height の透明キャンバス中央へ貼り付ける
    """
    rgba = image.convert("RGBA")
    arr = np.array(rgba)
    alpha = arr[..., 3]
    ys, xs = np.where(alpha > alpha_threshold)
    if len(xs) == 0:
        raise ValueError("被写体(不透明ピクセル)が見つかりません")
    x0, x1 = int(xs.min()), int(xs.max()) + 1
    y0, y1 = int(ys.min()), int(ys.max()) + 1
    subject = rgba.crop((x0, y0, x1, y1))

    usable_w = target_width * (1 - 2 * margin_ratio)
    usable_h = target_height * (1 - 2 * margin_ratio)
    scale = min(usable_w / subject.width, usable_h / subject.height)
    new_w = max(1, round(subject.width * scale))
    new_h = max(1, round(subject.height * scale))
    resized = subject.resize((new_w, new_h), Image.LANCZOS)

    canvas = Image.new("RGBA", (target_width, target_height), (0, 0, 0, 0))
    paste_x = (target_width - new_w) // 2
    paste_y = (target_height - new_h) // 2
    canvas.paste(resized, (paste_x, paste_y), resized)
    return canvas


def _build_arg_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        description="単色背景(グリーン等)を色距離ベースで透過するクロマキー処理"
    )
    parser.add_argument("--input", required=True, help="入力画像パス")
    parser.add_argument("--output", required=True, help="出力PNGパス")
    parser.add_argument("--background-color", default="#00ff00", help="背景色(#rrggbb)")
    parser.add_argument("--hard-threshold", type=float, default=0.12)
    parser.add_argument("--soft-threshold", type=float, default=0.35)
    parser.add_argument("--despill-strength", type=float, default=0.6)
    return parser


def main() -> None:
    args = _build_arg_parser().parse_args()
    params = ChromaKeyParams(
        background_color=hex_to_rgb(args.background_color),
        hard_threshold=args.hard_threshold,
        soft_threshold=args.soft_threshold,
        despill_strength=args.despill_strength,
    )
    image = Image.open(args.input)
    result = process(image, params)
    result.save(args.output)
    print(f"Saved transparent PNG: {args.output}")


if __name__ == "__main__":
    main()
