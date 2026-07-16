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
    # table.backgroundのようなbackground-size:cover全面素材向け。
    # isolated object契約(透明ピクセル必須/端の透明余白/端への不透明接触禁止)を
    # 逆転させる: 全面が不透明であることを要求し、端の不透明接触・余白不足は
    # 不合格にしない。緑残り・フリンジ・寸法一致の検査はopaqueでも維持する。
    opaque_background: bool = False
    # nine-slice/stretchのisolated object向け: 被写体(alpha>200)の外接矩形が
    # canvasに対してどれだけの比率を占めるべきかの下限/上限。Noneなら検査しない
    # (既定は全アセット非適用。table.backgroundのようなopaque cover素材には
    # 適用しない別種の検査)。Batch 3 panel.paper.default/panel.result.frameの
    # shrunken-card欠陥(portrait被写体がlandscape canvas中央に浮く)を
    # 寸法一致検査だけでは検出できなかったことの再発防止として追加。
    min_content_width_ratio: float | None = None
    max_content_width_ratio: float | None = None
    min_content_height_ratio: float | None = None
    max_content_height_ratio: float | None = None
    max_content_center_offset_ratio: float | None = None


@dataclass
class ValidationResult:
    ok: bool
    issues: list[str] = field(default_factory=list)
    content_hash: str | None = None
    width: int = 0
    height: int = 0
    content_bounds: dict | None = None


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

    if params.opaque_background:
        # cover背景は全面不透明が正しい状態。透明ピクセルが残っていたら
        # 逆にチロマキー処理で意図せず穴が空いた可能性がある
        transparent_ratio = float((alpha < 250).sum()) / (width * height)
        if transparent_ratio > 0.01:
            issues.append(
                f"opaque background契約なのに非不透明ピクセルが{transparent_ratio:.4%}"
                "あります(生成物に背景色に近い色が含まれ誤って透過された可能性)"
            )
    else:
        # 完全透明領域が存在すること
        if not (alpha == 0).any():
            issues.append(
                "完全透明(alpha=0)のピクセルが存在しません(背景が除去されていない可能性)"
            )

    # 不透明な本体領域が消失していないこと
    opaque_ratio = float((alpha > 200).sum()) / (width * height)
    if opaque_ratio < params.min_opaque_ratio:
        issues.append(
            f"不透明な本体領域が少なすぎます(opaque比率 {opaque_ratio:.4%} < "
            f"{params.min_opaque_ratio:.4%})。被写体が消失した可能性"
        )

    # content occupancy(alpha bounding-box): 被写体がcanvasに対して十分な
    # 面積を占めているか。寸法一致検査(expected_width/height)はcanvas自体の
    # サイズしか見ないため、canvas寸法は正しいのに被写体がその中央に小さく
    # 浮いている(portrait被写体がlandscape canvasの中央にfitされた等)ケースを
    # 検出できない。ここではopaque(alpha>200)ピクセルの外接矩形を計測し、
    # nine-slice/stretch isolated objectがcanvas幅・高さに対して十分な比率を
    # 占め、かつ中央に配置されていることを別軸で検査する。
    content_bounds: dict | None = None
    if not params.opaque_background:
        opaque_mask = alpha > 200
        if opaque_mask.any():
            rows = np.any(opaque_mask, axis=1)
            cols = np.any(opaque_mask, axis=0)
            y0, y1 = int(np.argmax(rows)), int(len(rows) - 1 - np.argmax(rows[::-1]))
            x0, x1 = int(np.argmax(cols)), int(len(cols) - 1 - np.argmax(cols[::-1]))
            content_w = x1 - x0 + 1
            content_h = y1 - y0 + 1
            width_ratio = content_w / width
            height_ratio = content_h / height
            content_center_x = (x0 + x1 + 1) / 2.0
            content_center_y = (y0 + y1 + 1) / 2.0
            center_offset_x_ratio = abs(content_center_x - width / 2.0) / width
            center_offset_y_ratio = abs(content_center_y - height / 2.0) / height
            content_bounds = {
                "widthRatio": round(width_ratio, 4),
                "heightRatio": round(height_ratio, 4),
                "centerOffsetXRatio": round(center_offset_x_ratio, 4),
                "centerOffsetYRatio": round(center_offset_y_ratio, 4),
            }

            if params.min_content_width_ratio is not None and width_ratio < params.min_content_width_ratio:
                issues.append(
                    f"被写体がcanvas幅に対して小さすぎます(width比率 {width_ratio:.4%} < "
                    f"{params.min_content_width_ratio:.4%})。nine-slice fill描画で"
                    "縮小したカードが浮いて見える可能性(shrunken-card欠陥)"
                )
            if params.max_content_width_ratio is not None and width_ratio > params.max_content_width_ratio:
                issues.append(
                    f"被写体がcanvas幅に対して大きすぎます(width比率 {width_ratio:.4%} > "
                    f"{params.max_content_width_ratio:.4%})。透明余白が不足する可能性"
                )
            if params.min_content_height_ratio is not None and height_ratio < params.min_content_height_ratio:
                issues.append(
                    f"被写体がcanvas高さに対して小さすぎます(height比率 {height_ratio:.4%} < "
                    f"{params.min_content_height_ratio:.4%})。nine-slice fill描画で"
                    "縮小したカードが浮いて見える可能性(shrunken-card欠陥)"
                )
            if params.max_content_height_ratio is not None and height_ratio > params.max_content_height_ratio:
                issues.append(
                    f"被写体がcanvas高さに対して大きすぎます(height比率 {height_ratio:.4%} > "
                    f"{params.max_content_height_ratio:.4%})。透明余白が不足する可能性"
                )
            if params.max_content_center_offset_ratio is not None:
                if center_offset_x_ratio > params.max_content_center_offset_ratio:
                    issues.append(
                        f"被写体の中心がcanvas中心からX方向にずれすぎています"
                        f"(offset比率 {center_offset_x_ratio:.4%} > "
                        f"{params.max_content_center_offset_ratio:.4%})"
                    )
                if center_offset_y_ratio > params.max_content_center_offset_ratio:
                    issues.append(
                        f"被写体の中心がcanvas中心からY方向にずれすぎています"
                        f"(offset比率 {center_offset_y_ratio:.4%} > "
                        f"{params.max_content_center_offset_ratio:.4%})"
                    )

    if not params.opaque_background:
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
    # 実質的に透明であること)。opaque backgroundは余白概念そのものが無い
    pad = params.min_transparent_padding
    if not params.opaque_background and pad > 0 and pad * 2 < min(width, height):
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
        ok=len(issues) == 0,
        issues=issues,
        content_hash=content_hash,
        width=width,
        height=height,
        content_bounds=content_bounds,
    )
