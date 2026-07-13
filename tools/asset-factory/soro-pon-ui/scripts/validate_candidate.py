#!/usr/bin/env python3
"""透過処理済み候補画像の自動検査(docs/IMAGE-ASSET-WORKFLOW.md 契約)。

検査に失敗した画像はcandidatesへ配置してはならない
(呼び出し側であるprepare_asset.pyが本モジュールの結果を見て配置可否を決める)。
"""

from __future__ import annotations

import hashlib
from dataclasses import dataclass, field

from PIL import Image
import numpy as np

from chroma_key import Rgb, _color_distance  # noqa: F401 (内部関数の再利用)


@dataclass(frozen=True)
class ValidationParams:
    background_color: Rgb
    expected_width: int | None = None
    expected_height: int | None = None
    min_transparent_padding: int = 4
    min_opaque_ratio: float = 0.01
    edge_opaque_alpha_threshold: int = 10
    fringe_distance_threshold: float = 0.25


@dataclass
class ValidationResult:
    ok: bool
    issues: list[str] = field(default_factory=list)
    content_hash: str | None = None
    width: int = 0
    height: int = 0


def _compute_hash(path: str) -> str:
    with open(path, "rb") as f:
        return hashlib.sha256(f.read()).hexdigest()


def validate_candidate(image_path: str, params: ValidationParams) -> ValidationResult:
    issues: list[str] = []

    try:
        with open(image_path, "rb") as f:
            data = f.read()
    except OSError as e:
        return ValidationResult(ok=False, issues=[f"出力ファイルを読み込めません: {e}"])

    if len(data) == 0:
        return ValidationResult(ok=False, issues=["出力ファイルが空です"])

    try:
        image = Image.open(image_path)
        image.load()  # 破損検出のため強制デコード
    except Exception as e:  # noqa: BLE001 - 破損画像は何が起きるか特定できないため広く捕捉
        return ValidationResult(ok=False, issues=[f"出力ファイルが破損しています: {e}"])

    content_hash = hashlib.sha256(data).hexdigest()
    width, height = image.size

    if image.mode != "RGBA":
        issues.append(f"RGBA形式ではありません(mode={image.mode})")
        image = image.convert("RGBA")

    if params.expected_width is not None and width != params.expected_width:
        issues.append(f"幅が期待値と異なります: {width} != {params.expected_width}")
    if params.expected_height is not None and height != params.expected_height:
        issues.append(f"高さが期待値と異なります: {height} != {params.expected_height}")

    arr = np.array(image)
    rgb = arr[..., :3]
    alpha = arr[..., 3].astype(np.float64)
    alpha_norm = alpha / 255.0

    # 完全透明領域が存在すること
    if not (alpha == 0).any():
        issues.append("完全透明(alpha=0)のピクセルが存在しません(背景が除去されていない可能性)")

    # 不透明な本体領域が消失していないこと
    opaque_ratio = float((alpha > 200).sum()) / (width * height)
    if opaque_ratio < params.min_opaque_ratio:
        issues.append(
            f"不透明な本体領域が少なすぎます(opaque比率 {opaque_ratio:.4%} < "
            f"{params.min_opaque_ratio:.4%})。被写体が消失した可能性"
        )

    # 四辺に不透明ピクセルが接触していないこと(被写体が画像端に接触)
    edge_alpha = np.concatenate(
        [alpha[0, :], alpha[-1, :], alpha[:, 0], alpha[:, -1]]
    )
    if (edge_alpha > params.edge_opaque_alpha_threshold).any():
        issues.append(
            "画像四辺に不透明ピクセルが接触しています(被写体が画像端に接触している可能性)"
        )

    # 四辺に背景色が残っていないこと(alpha>0かつ背景色に極めて近い、は透過漏れ)
    edge_rgb = np.concatenate(
        [rgb[0, :, :], rgb[-1, :, :], rgb[:, 0, :], rgb[:, -1, :]], axis=0
    )
    edge_a = np.concatenate([alpha[0, :], alpha[-1, :], alpha[:, 0], alpha[:, -1]])
    edge_dist = _color_distance(edge_rgb, params.background_color)
    residual_bg = (edge_a > params.edge_opaque_alpha_threshold) & (edge_dist < 0.08)
    if residual_bg.any():
        issues.append("画像四辺に背景色が不透明のまま残っています")

    # 指定した透明余白があること(各辺から内側へmin_transparent_padding分は
    # 実質的に透明であること)
    pad = params.min_transparent_padding
    if pad > 0 and pad * 2 < min(width, height):
        bands = [
            alpha[:pad, :],
            alpha[-pad:, :],
            alpha[:, :pad],
            alpha[:, -pad:],
        ]
        for label, band in zip(("top", "bottom", "left", "right"), bands):
            if (band > params.edge_opaque_alpha_threshold).any():
                issues.append(
                    f"{label}側の透明余白({pad}px)が不足しています(不透明ピクセルが含まれる)"
                )

    # 背景色に近いフリンジ: 主に見えている(alpha>0.5)ピクセルの色が、
    # despill後もなお背景色へ極端に近いままなら色かぶりが残っている
    visible = alpha_norm > 0.5
    if visible.any():
        visible_dist = _color_distance(rgb, params.background_color)[visible]
        min_visible_dist = float(visible_dist.min())
        if min_visible_dist < params.fringe_distance_threshold:
            issues.append(
                "可視ピクセル(alpha>0.5)に背景色へ極端に近いフリンジが残っています"
                f"(最小色距離 {min_visible_dist:.4f} < {params.fringe_distance_threshold})"
            )

    return ValidationResult(
        ok=len(issues) == 0, issues=issues, content_hash=content_hash, width=width, height=height
    )
