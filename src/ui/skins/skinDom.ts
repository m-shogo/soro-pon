import { buildTokensStyleText } from './applySkinTokens';

export const SKIN_STYLE_ELEMENT_ID = 'sp-skin-tokens';
export const THEME_COLOR_META_ID = 'sp-theme-color';

export type SkinDomMeta = {
  colorScheme: 'dark' | 'light';
  themeColor?: string;
};

// documentへスキンを適用する唯一の場所。
// bundled tokens.css(base相当)の上に、検証済みtokenだけを上書きする。
// P1-5: ブラウザネイティブUIの明暗(color-scheme)とmeta theme-colorも
// スキンと一緒に切り替える(Cute Popでフォームが暗いまま残らないように)。
export function applyDocumentSkin(
  skinId: string,
  tokens: Record<string, string>,
  meta?: SkinDomMeta,
): void {
  if (typeof document === 'undefined') {
    return;
  }
  let styleElement = document.getElementById(SKIN_STYLE_ELEMENT_ID);
  if (!styleElement) {
    styleElement = document.createElement('style');
    styleElement.id = SKIN_STYLE_ELEMENT_ID;
    document.head.appendChild(styleElement);
  }
  styleElement.textContent = buildTokensStyleText(tokens);
  document.documentElement.dataset['skin'] = skinId;

  if (meta) {
    document.documentElement.style.colorScheme = meta.colorScheme;
    let metaElement = document.getElementById(THEME_COLOR_META_ID) as HTMLMetaElement | null;
    if (!metaElement) {
      metaElement = document.createElement('meta');
      metaElement.id = THEME_COLOR_META_ID;
      metaElement.name = 'theme-color';
      document.head.appendChild(metaElement);
    }
    metaElement.content = meta.themeColor ?? (meta.colorScheme === 'dark' ? '#120d08' : '#ffffff');
  }
}
