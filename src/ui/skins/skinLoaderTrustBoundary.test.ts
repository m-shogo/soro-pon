import { describe, expect, it, vi } from 'vitest';
import { createSkinLoader, type SkinPackageIo } from './skinRegistry';

function manifest(id: string, origin: 'official' | 'external', file = 'badge.png') {
  return {
    id,
    label: id,
    version: 1,
    skinContractVersion: 1,
    origin,
    inherits: 'base',
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

function baseManifest() {
  return {
    id: 'base',
    label: 'base',
    version: 1,
    skinContractVersion: 1,
    origin: 'official',
    tokensFile: 'tokens.css',
    slots: {},
  };
}

describe('skin loader trust boundary', () => {
  it('external packageがofficialを名乗ってもloaderが拒否し、assetを読み込まない', async () => {
    const loadTokens = vi.fn(async () => '');
    const io: SkinPackageIo = {
      async loadManifest(skinId) {
        return skinId === 'base'
          ? baseManifest()
          : manifest('untrusted', 'official', 'badge.svg');
      },
      loadTokens,
    };
    const loader = createSkinLoader(io, (skinId) => (skinId === 'base' ? 'official' : 'external'));

    const result = await loader.loadResolvedSkin('untrusted');

    expect(result.issues.some((issue) => issue.includes('一致しません'))).toBe(true);
    expect(result.resolved.chain).not.toContain('untrusted');
    expect(loadTokens).toHaveBeenCalledTimes(1); // accepted base only
  });

  it('built-in loaderのdefault trustはofficialで、external自己申告を拒否する', async () => {
    const io: SkinPackageIo = {
      async loadManifest(skinId) {
        return skinId === 'base' ? baseManifest() : manifest('spoofed', 'external');
      },
      async loadTokens() {
        return '';
      },
    };

    const result = await createSkinLoader(io).loadResolvedSkin('spoofed');

    expect(result.issues.some((issue) => issue.includes('一致しません'))).toBe(true);
    expect(result.resolved.chain).not.toContain('spoofed');
  });
});
