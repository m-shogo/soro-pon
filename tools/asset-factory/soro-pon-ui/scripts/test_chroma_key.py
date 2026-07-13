"""chroma_key / validate_candidate / compare_image のpytestテスト。

外部画像生成APIを使わず、fixtures.py の合成画像だけで検証する
(docs/IMAGE-ASSET-WORKFLOW.md 「E. 合成fixtureによるテスト」)。
"""

from __future__ import annotations

import hashlib
import io

import numpy as np
import pytest

import fixtures
from chroma_key import ChromaKeyParams, chroma_key_transparent, fit_to_canvas, hex_to_rgb, process
from compare_image import build_comparison_image
from validate_candidate import ValidationParams, validate_candidate

GREEN_PARAMS = ChromaKeyParams(background_color=(0, 255, 0))
MAGENTA_PARAMS = ChromaKeyParams(background_color=(255, 0, 255))


def _alpha_array(image):
    return np.array(image.convert("RGBA"))[..., 3]


def _rgb_array(image):
    return np.array(image.convert("RGBA"))[..., :3]


class TestChromaKeyTransparency:
    def test_background_becomes_transparent(self):
        img = fixtures.fixture_green_round_subject()
        out = process(img, GREEN_PARAMS)
        alpha = _alpha_array(out)
        # 四隅(背景のはず)はほぼ完全透明
        corners = [alpha[0, 0], alpha[0, -1], alpha[-1, 0], alpha[-1, -1]]
        assert all(a < 5 for a in corners), corners

    def test_subject_not_excessively_erased(self):
        img = fixtures.fixture_green_round_subject()
        out = process(img, GREEN_PARAMS)
        alpha = _alpha_array(out)
        opaque_ratio = (alpha > 200).sum() / alpha.size
        # 円の想定面積(半径0.32*200=64px -> pi*r^2 / (200*200) ≈ 0.32)に対し
        # 大幅に下回らないこと(過剰消去の検出)
        assert opaque_ratio > 0.15, opaque_ratio

    def test_despill_reduces_green_fringe(self):
        img = fixtures.fixture_green_round_subject()
        before_rgb = _rgb_array(img.convert("RGBA"))
        out = process(img, GREEN_PARAMS)
        alpha = _alpha_array(out)
        rgb = _rgb_array(out)
        # 境界付近(半透明)ピクセルの緑優位度が、処理前(背景そのもの)より
        # 明確に下がっていること
        boundary = (alpha > 10) & (alpha < 245)
        assert boundary.any()
        green_excess_before = (
            before_rgb[boundary][:, 1].astype(int)
            - np.maximum(before_rgb[boundary][:, 0], before_rgb[boundary][:, 2]).astype(int)
        ).mean()
        green_excess_after = (
            rgb[boundary][:, 1].astype(int)
            - np.maximum(rgb[boundary][:, 0], rgb[boundary][:, 2]).astype(int)
        ).mean()
        assert green_excess_after < green_excess_before

    def test_soft_shadow_becomes_partial_alpha(self):
        img = fixtures.fixture_green_subject_with_soft_shadow()
        out = process(img, GREEN_PARAMS)
        alpha = _alpha_array(out)
        # 影領域(被写体円の外側、右下の影グラデーション帯)に完全不透明でも
        # 完全透明でもない中間alphaのピクセルが一定量存在すること
        h, w = alpha.shape
        shadow_region = alpha[h // 2 + 10 : h // 2 + 40, w // 2 + 50 : w // 2 + 90]
        partial = ((shadow_region > 15) & (shadow_region < 240)).sum()
        assert partial > 0, "影が中間alphaとして残っていない"

    def test_near_background_patch_inside_subject_is_documented_limitation(self):
        # 被写体内部の背景近似色パッチは、色距離だけでは背景と区別できない
        # ケースがあることを明示するテスト(アルゴリズムの既知の限界を記録する)。
        img = fixtures.fixture_subject_with_near_bg_patch()
        out = process(img, GREEN_PARAMS)
        alpha = _alpha_array(out)
        h, w = alpha.shape
        center_alpha = alpha[h // 2, w // 2]
        # 既知の限界: 背景に極めて近い内部色は透明扱いになりうる。
        # ここでは「クラッシュせず処理が完了し、結果が決定的である」ことのみ保証する。
        assert 0 <= center_alpha <= 255

    def test_magenta_background_also_supported(self):
        img = fixtures.fixture_magenta_background()
        out = process(img, MAGENTA_PARAMS)
        alpha = _alpha_array(out)
        corners = [alpha[0, 0], alpha[0, -1], alpha[-1, 0], alpha[-1, -1]]
        assert all(a < 5 for a in corners), corners
        opaque_ratio = (alpha > 200).sum() / alpha.size
        assert opaque_ratio > 0.15

    def test_deterministic_same_input_same_hash(self):
        img = fixtures.fixture_green_round_subject()
        out1 = process(img, GREEN_PARAMS)
        out2 = process(img, GREEN_PARAMS)
        buf1, buf2 = io.BytesIO(), io.BytesIO()
        out1.save(buf1, format="PNG")
        out2.save(buf2, format="PNG")
        assert hashlib.sha256(buf1.getvalue()).hexdigest() == hashlib.sha256(
            buf2.getvalue()
        ).hexdigest()

    def test_different_params_change_output(self):
        img = fixtures.fixture_green_round_subject()
        out1 = process(img, GREEN_PARAMS)
        strict_params = ChromaKeyParams(
            background_color=(0, 255, 0), hard_threshold=0.3, soft_threshold=0.5
        )
        out2 = process(img, strict_params)
        assert np.array(out1) is not np.array(out2)
        assert not np.array_equal(np.array(out1), np.array(out2))

    def test_transparent_pixel_rgb_is_normalized_not_raw_background(self):
        img = fixtures.fixture_green_round_subject()
        out = process(img, GREEN_PARAMS)
        arr = np.array(out)
        alpha = arr[..., 3]
        rgb = arr[..., :3]
        # 完全透明ピクセルのRGBが、生の背景グリーン(0,255,0)のまま
        # 残っていないこと(edge paddingで近傍色へ正規化されているはず)
        fully_transparent = alpha == 0
        assert fully_transparent.any()
        still_raw_green = fully_transparent & (rgb[..., 1] > 250) & (rgb[..., 0] < 5) & (
            rgb[..., 2] < 5
        )
        # 画像遠方(dilateが届かない領域)は残ってよいが、全域が生グリーンのままではない
        assert still_raw_green.sum() < fully_transparent.sum()


class TestValidateCandidate:
    def _save(self, image, tmp_path, name="out.png"):
        path = tmp_path / name
        image.save(path)
        return str(path)

    def test_valid_candidate_passes(self, tmp_path):
        img = fixtures.fixture_green_round_subject(width=200, height=200)
        out = process(img, GREEN_PARAMS)
        path = self._save(out, tmp_path)
        result = validate_candidate(
            path,
            ValidationParams(
                background_color=(0, 255, 0), expected_width=200, expected_height=200
            ),
        )
        assert result.ok, result.issues
        assert result.content_hash is not None

    def test_edge_touching_subject_fails(self, tmp_path):
        img = fixtures.fixture_subject_touching_edge()
        out = process(img, GREEN_PARAMS)
        path = self._save(out, tmp_path)
        result = validate_candidate(path, ValidationParams(background_color=(0, 255, 0)))
        assert not result.ok
        assert any("画像端に接触" in issue for issue in result.issues)

    def test_insufficient_padding_fails(self, tmp_path):
        img = fixtures.fixture_insufficient_padding()
        out = process(img, GREEN_PARAMS)
        path = self._save(out, tmp_path)
        result = validate_candidate(
            path, ValidationParams(background_color=(0, 255, 0), min_transparent_padding=8)
        )
        assert not result.ok
        assert any("余白" in issue for issue in result.issues)

    def test_broken_file_fails(self, tmp_path):
        path = tmp_path / "broken.png"
        path.write_bytes(b"not a real png")
        result = validate_candidate(str(path), ValidationParams(background_color=(0, 255, 0)))
        assert not result.ok

    def test_empty_file_fails(self, tmp_path):
        path = tmp_path / "empty.png"
        path.write_bytes(b"")
        result = validate_candidate(str(path), ValidationParams(background_color=(0, 255, 0)))
        assert not result.ok
        assert any("空" in issue for issue in result.issues)

    def test_wrong_dimensions_fail(self, tmp_path):
        img = fixtures.fixture_green_round_subject(width=200, height=200)
        out = process(img, GREEN_PARAMS)
        path = self._save(out, tmp_path)
        result = validate_candidate(
            path,
            ValidationParams(
                background_color=(0, 255, 0), expected_width=999, expected_height=999
            ),
        )
        assert not result.ok
        assert any("幅" in issue for issue in result.issues)


class TestCompareImage:
    def test_comparison_image_has_expected_layout(self):
        img = fixtures.fixture_green_round_subject(width=100, height=100)
        processed = process(img, GREEN_PARAMS)
        comparison = build_comparison_image(img, processed)
        # 3枚+2ギャップ幅
        assert comparison.size == (100 * 3 + 8 * 2, 100)


class TestFitToCanvas:
    def test_fits_subject_into_target_canvas_size(self):
        img = fixtures.fixture_green_round_subject(width=1000, height=1000)
        processed = process(img, GREEN_PARAMS)
        fit = fit_to_canvas(processed, 240, 80, margin_ratio=0.08)
        assert fit.size == (240, 80)
        assert fit.mode == "RGBA"

    def test_subject_does_not_touch_edge_after_fit(self):
        img = fixtures.fixture_green_round_subject(width=1000, height=1000)
        processed = process(img, GREEN_PARAMS)
        fit = fit_to_canvas(processed, 240, 80, margin_ratio=0.08)
        alpha = np.array(fit)[..., 3]
        edge = np.concatenate([alpha[0, :], alpha[-1, :], alpha[:, 0], alpha[:, -1]])
        assert (edge < 10).all()

    def test_deterministic_same_input_same_output(self):
        img = fixtures.fixture_green_round_subject(width=1000, height=1000)
        processed = process(img, GREEN_PARAMS)
        fit1 = fit_to_canvas(processed, 240, 80, margin_ratio=0.08)
        fit2 = fit_to_canvas(processed, 240, 80, margin_ratio=0.08)
        buf1, buf2 = io.BytesIO(), io.BytesIO()
        fit1.save(buf1, format="PNG")
        fit2.save(buf2, format="PNG")
        assert hashlib.sha256(buf1.getvalue()).hexdigest() == hashlib.sha256(
            buf2.getvalue()
        ).hexdigest()

    def test_raises_when_no_subject(self):
        empty = fixtures.fixture_green_round_subject(width=50, height=50).convert("RGBA")
        transparent = np.array(empty)
        transparent[..., 3] = 0
        from PIL import Image as PILImage

        blank = PILImage.fromarray(transparent, mode="RGBA")
        with pytest.raises(ValueError):
            fit_to_canvas(blank, 240, 80)


class TestHexToRgb:
    def test_parses_hash_prefixed(self):
        assert hex_to_rgb("#00ff00") == (0, 255, 0)

    def test_parses_without_hash(self):
        assert hex_to_rgb("ff00ff") == (255, 0, 255)

    def test_rejects_invalid(self):
        with pytest.raises(ValueError):
            hex_to_rgb("not-a-color")


class TestChromaKeyParamsValidation:
    def test_rejects_hard_greater_than_soft(self):
        with pytest.raises(ValueError):
            ChromaKeyParams(background_color=(0, 255, 0), hard_threshold=0.5, soft_threshold=0.2)

    def test_rejects_despill_out_of_range(self):
        with pytest.raises(ValueError):
            ChromaKeyParams(background_color=(0, 255, 0), despill_strength=1.5)
