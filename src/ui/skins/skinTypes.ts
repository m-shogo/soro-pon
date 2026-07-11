import type { AssetSlotName } from '../assets/slots';

// スキン契約バージョン。slot追加などの互換性が壊れる変更で上げる。
// これより新しいcontractVersionを要求するスキンは受理しない。
export const SKIN_CONTRACT_VERSION = 1;

export const BASE_SKIN_ID = 'base';

// アプリ側の許可済みフォントセット。スキンはこの中からのみ選択できる
// (外部フォント読み込み・任意フォント指定は不可)。
export const APPROVED_FONT_STACKS: readonly string[] = [
  // 明朝(ヨルノシルベ系)
  "'Hiragino Mincho ProN', 'Yu Mincho', 'BIZ UDMincho', 'Noto Serif JP', serif",
  "'Hiragino Mincho ProN', 'Yu Mincho', serif",
  // 丸ゴシック(Cute Pop系)
  "'Hiragino Maru Gothic ProN', 'BIZ UDGothic', 'Noto Sans JP', sans-serif",
  // 標準ゴシック
  "'Hiragino Kaku Gothic ProN', 'Yu Gothic', 'Noto Sans JP', sans-serif",
];

export const ALLOWED_BLEND_MODES = [
  'normal',
  'multiply',
  'screen',
  'overlay',
  'soft-light',
] as const;

export type SkinBlendMode = (typeof ALLOWED_BLEND_MODES)[number];

export type SkinRenderMode =
  | 'cover'
  | 'contain'
  | 'stretch'
  | 'repeat'
  | 'nine-slice'
  | 'overlay';

export type SkinEdgeInsets = {
  top: number;
  right: number;
  bottom: number;
  left: number;
};

// 各assetの描画契約。単なるファイル名ではなく描画方法まで持つ。
export type SkinAssetDefinition = {
  file: string | null;
  status: 'placeholder' | 'final';
  renderMode: SkinRenderMode;
  intrinsicSize?: { width: number; height: number };
  transparent?: boolean;
  /** nine-sliceのソース画像側スライス(source px) */
  nineSlice?: SkinEdgeInsets;
  /**
   * nine-sliceの描画borderWidth(CSS px)。ソースslice(source px)とは独立(P0-5)。
   * 未指定時は nineSlice / pixelDensity で導出する。
   */
  nineSliceRender?: SkinEdgeInsets;
  /** 高密度ソース画像の倍率(source px / CSS px)。既定1 */
  pixelDensity?: number;
  /** これ未満のCSSサイズでは画像を描かずfallbackに落とす(枠潰れ防止) */
  minRenderSize?: { width: number; height: number };
  /** 文字・子要素を置ける安全領域(source px)。レイアウトpaddingとは別契約 */
  contentSafeArea?: SkinEdgeInsets;
  opacity?: number;
  blendMode?: SkinBlendMode;
};

export type SkinOrigin = 'official' | 'external';

export type SkinManifest = {
  id: string;
  label: string;
  version: number;
  skinContractVersion: number;
  origin: SkinOrigin;
  author?: string;
  inherits?: string;
  tokensFile: string;
  /** ブラウザネイティブUI(フォーム/スクロールバー)の明暗(P1-5) */
  colorScheme?: 'dark' | 'light';
  /** ブラウザUI(meta theme-color)へ渡す代表色(P1-5) */
  themeColor?: string;
  slots: Partial<Record<AssetSlotName, SkinAssetDefinition>>;
};

// 継承をmergeし終えた実行時スキン。
export type ResolvedSkinSlot = {
  def: SkinAssetDefinition;
  /** 画像URLの起点になるスキン(fileはこのスキンのパッケージ内にある) */
  sourceSkinId: string;
};

export type ResolvedSkin = {
  id: string;
  label: string;
  /** base -> ... -> id の順の継承チェーン */
  chain: string[];
  tokens: Record<string, string>;
  slots: Partial<Record<AssetSlotName, ResolvedSkinSlot>>;
  /** 継承チェーンをmergeしたブラウザ配色(未指定はdark既定) */
  colorScheme: 'dark' | 'light';
  themeColor?: string;
  /** 解決中に発生した非致命の問題(fallback理由の説明用) */
  issues: string[];
};

// サイズ/容量の上限(SKIN-CONTRACT.jsonにも記載)
export const SKIN_LIMITS = {
  maxAssetFileBytes: 2 * 1024 * 1024,
  maxSkinTotalBytes: 16 * 1024 * 1024,
  maxIntrinsicSizePx: 2048,
  maxNineSlicePx: 256,
  /** 描画borderWidth(CSS px)の上限。タッチ領域を覆い潰す枠を防ぐ */
  maxNineSliceRenderPx: 128,
  maxPixelDensity: 3,
  maxTokensFileBytes: 32 * 1024,
  maxManifestBytes: 64 * 1024,
} as const;
