// WCAG相対輝度・コントラスト比の計算(H3/P0-3)。
// skin:validateのコントラスト検証と、カテゴリ帯の文字色自動選択で共有する。
// engineには依存しない純粋関数のみ。

export type Rgb = { r: number; g: number; b: number };

// #rgb / #rrggbb / #rrggbbaa を受理する(alphaは輝度計算では無視)
export function parseHexColor(value: string): Rgb | null {
  const hex = value.trim().replace(/^#/, '');
  if (/^[0-9a-fA-F]{3}$/.test(hex)) {
    return {
      r: parseInt(hex[0]! + hex[0]!, 16),
      g: parseInt(hex[1]! + hex[1]!, 16),
      b: parseInt(hex[2]! + hex[2]!, 16),
    };
  }
  if (/^[0-9a-fA-F]{6}([0-9a-fA-F]{2})?$/.test(hex)) {
    return {
      r: parseInt(hex.slice(0, 2), 16),
      g: parseInt(hex.slice(2, 4), 16),
      b: parseInt(hex.slice(4, 6), 16),
    };
  }
  return null;
}

function channelLuminance(channel: number): number {
  const v = channel / 255;
  return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
}

export function relativeLuminance(rgb: Rgb): number {
  return (
    0.2126 * channelLuminance(rgb.r) +
    0.7152 * channelLuminance(rgb.g) +
    0.0722 * channelLuminance(rgb.b)
  );
}

export function contrastRatio(a: Rgb, b: Rgb): number {
  const la = relativeLuminance(a);
  const lb = relativeLuminance(b);
  const [hi, lo] = la >= lb ? [la, lb] : [lb, la];
  return (hi + 0.05) / (lo + 0.05);
}

export function contrastRatioHex(hexA: string, hexB: string): number | null {
  const a = parseHexColor(hexA);
  const b = parseHexColor(hexB);
  if (!a || !b) {
    return null;
  }
  return contrastRatio(a, b);
}

// components.css の .sp-tile__band と同じ混合比:
// color-mix(in srgb, category CATEGORY_BAND_MIX_RATIO, black)
export const CATEGORY_BAND_MIX_RATIO = 0.78;

export function mixTowardBlack(rgb: Rgb, ratio: number): Rgb {
  return {
    r: Math.round(rgb.r * ratio),
    g: Math.round(rgb.g * ratio),
    b: Math.round(rgb.b * ratio),
  };
}

export type CategoryBandTone = 'light' | 'dark';

// カテゴリ帯の実背景(黒と混合後)に対して、明帯用(暗い文字)か
// 暗帯用(明るい文字)かを自動選択する。輝度0.179は白文字と黒文字の
// コントラスト比が等しくなる境界値(WCAG式から導出)。
export function categoryBandTone(categoryColor: string | undefined): CategoryBandTone {
  const rgb = categoryColor !== undefined ? parseHexColor(categoryColor) : null;
  if (!rgb) {
    // 未指定/不正値は --sp-color-chip-fallback 系の暗い帯になる
    return 'dark';
  }
  const band = mixTowardBlack(rgb, CATEGORY_BAND_MIX_RATIO);
  return relativeLuminance(band) >= 0.179 ? 'light' : 'dark';
}
