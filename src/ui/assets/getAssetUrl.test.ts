import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { getAssetUrl, parseAssetSlotsManifest } from './getAssetUrl';
import { ASSET_SLOTS } from './slots';

function loadRealManifest(): unknown {
  return JSON.parse(
    readFileSync(
      join(__dirname, '..', '..', '..', 'public', 'assets', 'ui', 'soro-pon', 'asset-slots.json'),
      'utf-8',
    ),
  ) as unknown;
}

describe('asset slots', () => {
  it('asset-slots.jsonは全slotを定義している', () => {
    const manifest = parseAssetSlotsManifest(loadRealManifest());
    for (const slot of ASSET_SLOTS) {
      expect(manifest[slot], slot).toBeDefined();
    }
  });

  it('placeholder(fileなし)はnull = CSS/SVG fallbackで表示する', () => {
    const manifest = parseAssetSlotsManifest(loadRealManifest());
    expect(getAssetUrl(manifest, 'tile.face.base')).toBeNull();
  });

  it('finalのfileはgenerated/final/のURLになる', () => {
    const manifest = parseAssetSlotsManifest({
      slots: {
        'tile.face.base': {
          status: 'final',
          file: 'tile-face-base.png',
          purpose: '',
          usedBy: [],
          targetFile: '',
        },
      },
    });
    expect(getAssetUrl(manifest, 'tile.face.base')).toBe(
      '/assets/ui/soro-pon/generated/final/tile-face-base.png',
    );
  });

  it('パス区切りを含むfileは拒否してfallbackにする', () => {
    const manifest = parseAssetSlotsManifest({
      slots: {
        'tile.face.base': {
          status: 'final',
          file: '../../../etc/passwd',
          purpose: '',
          usedBy: [],
          targetFile: '',
        },
      },
    });
    expect(getAssetUrl(manifest, 'tile.face.base')).toBeNull();
  });

  it('壊れたmanifestでも空として扱い、落ちない', () => {
    expect(parseAssetSlotsManifest('broken')).toEqual({});
    expect(parseAssetSlotsManifest({ slots: 'broken' })).toEqual({});
    expect(parseAssetSlotsManifest({ slots: { 'unknown.slot': { status: 'final' } } })).toEqual(
      {},
    );
  });
});
