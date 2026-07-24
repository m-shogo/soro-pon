import { describe, expect, it } from 'vitest';
import { createSkinLoader, type SkinPackageIo } from './skinRegistry';

function manifest(id: string, inherits?: string) {
  return {
    id,
    label: id,
    version: 1,
    skinContractVersion: 1,
    origin: 'official',
    ...(inherits !== undefined ? { inherits } : {}),
    tokensFile: 'tokens.css',
    slots: {},
  };
}

function ioFor(manifests: Record<string, unknown>): SkinPackageIo {
  return {
    async loadManifest(skinId) {
      return manifests[skinId] ?? null;
    },
    async loadTokens() {
      return '';
    },
  };
}

describe('skin inheritance depth', () => {
  it('baseを除く3段ちょうどの継承は許可する', async () => {
    const loader = createSkinLoader(
      ioFor({
        base: manifest('base'),
        a: manifest('a', 'base'),
        b: manifest('b', 'a'),
        c: manifest('c', 'b'),
      }),
    );

    const result = await loader.loadResolvedSkin('c');

    expect(result.resolved.chain).toEqual(['base', 'a', 'b', 'c']);
    expect(result.issues.some((issue) => issue.includes('継承が深すぎます'))).toBe(false);
  });

  it('baseを除く4段目が必要な場合だけ上限超過を報告する', async () => {
    const loader = createSkinLoader(
      ioFor({
        base: manifest('base'),
        a: manifest('a', 'base'),
        b: manifest('b', 'a'),
        c: manifest('c', 'b'),
        d: manifest('d', 'c'),
      }),
    );

    const result = await loader.loadResolvedSkin('d');

    expect(result.issues.some((issue) => issue.includes('継承が深すぎます'))).toBe(true);
  });
});
