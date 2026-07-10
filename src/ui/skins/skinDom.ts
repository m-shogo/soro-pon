import { buildTokensStyleText } from './applySkinTokens';

export const SKIN_STYLE_ELEMENT_ID = 'sp-skin-tokens';

// documentへスキンを適用する唯一の場所。
// bundled tokens.css(base相当)の上に、検証済みtokenだけを上書きする。
export function applyDocumentSkin(skinId: string, tokens: Record<string, string>): void {
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
}
