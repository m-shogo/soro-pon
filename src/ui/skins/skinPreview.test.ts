import { describe, expect, it } from 'vitest';
import {
  DEFAULT_PREVIEW_SWATCHES,
  extractSkinPreviewSwatches,
} from './skinPreview';

describe('skinPreview: 代表色スウォッチ抽出(H4)', () => {
  it('tokenがない場合はbundled既定値(ヨルノシルベ)に落ちる', () => {
    expect(extractSkinPreviewSwatches({})).toEqual(DEFAULT_PREVIEW_SWATCHES);
  });

  it('上書きされた代表色だけ差し替える', () => {
    const swatches = extractSkinPreviewSwatches({
      '--sp-color-night': '#fff3e2',
      '--sp-color-crimson': '#c22f57',
    });
    expect(swatches.background).toBe('#fff3e2');
    expect(swatches.primary).toBe('#c22f57');
    expect(swatches.surface).toBe(DEFAULT_PREVIEW_SWATCHES.surface);
    expect(swatches.accent).toBe(DEFAULT_PREVIEW_SWATCHES.accent);
  });

  it('スウォッチとして描けない値(var参照/gradient/url)は採用しない', () => {
    const swatches = extractSkinPreviewSwatches({
      '--sp-color-night': 'var(--sp-color-paper)',
      '--sp-color-paper': 'linear-gradient(#fff, #000)',
      '--sp-color-crimson': 'url(https://evil.example/x.png)',
      '--sp-color-lantern-0': 'rgba(255, 179, 71, 0.9)',
    });
    expect(swatches.background).toBe(DEFAULT_PREVIEW_SWATCHES.background);
    expect(swatches.surface).toBe(DEFAULT_PREVIEW_SWATCHES.surface);
    expect(swatches.primary).toBe(DEFAULT_PREVIEW_SWATCHES.primary);
    expect(swatches.accent).toBe('rgba(255, 179, 71, 0.9)');
  });
});
