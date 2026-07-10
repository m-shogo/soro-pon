// SkinPreviewCard用の代表色抽出(H4/P0-4)。
// スキンを適用せずに「そのスキンらしさ」を小さなスウォッチで見せるための純粋関数。

export type SkinPreviewSwatches = {
  background: string;
  surface: string;
  primary: string;
  accent: string;
};

// bundled tokens.css(ヨルノシルベ既定値)と同期したfallback。
// スキンが該当tokenを上書きしていない場合に使う。
export const DEFAULT_PREVIEW_SWATCHES: SkinPreviewSwatches = {
  background: '#120d08', // --sp-color-night
  surface: '#d9c9a6', // --sp-color-paper
  primary: '#7c2018', // --sp-color-crimson
  accent: '#e8a23c', // --sp-color-lantern-0
};

const PREVIEW_TOKEN_MAP: Record<keyof SkinPreviewSwatches, string> = {
  background: '--sp-color-night',
  surface: '--sp-color-paper',
  primary: '--sp-color-crimson',
  accent: '--sp-color-lantern-0',
};

// var()参照やgradient等スウォッチとして描けない値は採用しない
function isRenderableSwatch(value: string): boolean {
  return /^(#[0-9a-fA-F]{3,8}|rgba?\([^)]*\))$/.test(value.trim());
}

export function extractSkinPreviewSwatches(
  tokens: Record<string, string>,
): SkinPreviewSwatches {
  const result = { ...DEFAULT_PREVIEW_SWATCHES };
  for (const key of Object.keys(PREVIEW_TOKEN_MAP) as (keyof SkinPreviewSwatches)[]) {
    const value = tokens[PREVIEW_TOKEN_MAP[key]];
    if (value !== undefined && isRenderableSwatch(value)) {
      result[key] = value.trim();
    }
  }
  return result;
}
