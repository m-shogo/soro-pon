import { describe, expect, it } from 'vitest';
import { validateSkinManifest } from './validateSkinManifest';

function manifest(origin: 'official' | 'external', file: string) {
  return {
    id: 'test-skin',
    label: 'Test Skin',
    version: 1,
    skinContractVersion: 1,
    origin,
    tokensFile: 'tokens.css',
    slots: {
      'badge.info.background': {
        file,
        status: 'final',
        renderMode: 'stretch',
      },
    },
  };
}

describe('runtime skin trust policy', () => {
  it('external manifestのSVGをruntime validatorでも拒否する', () => {
    const result = validateSkinManifest(manifest('external', 'badge.svg'));

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.issues.some((issue) => issue.includes('SVG'))).toBe(true);
    }
  });

  it('external manifestのPNGは許可する', () => {
    expect(validateSkinManifest(manifest('external', 'badge.png')).ok).toBe(true);
  });

  it('レビュー対象であるofficial manifestのSVGはschema上許可する', () => {
    expect(validateSkinManifest(manifest('official', 'badge.svg')).ok).toBe(true);
  });

  it('unsafe integerのversionを拒否する', () => {
    const raw = { ...manifest('official', 'badge.png'), version: Number.MAX_SAFE_INTEGER + 1 };

    expect(validateSkinManifest(raw).ok).toBe(false);
  });
});
