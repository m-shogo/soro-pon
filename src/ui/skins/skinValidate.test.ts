import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { readPngDimensions } from './imageDimensions';
import { validateSkinPackages, type SkinPackageFs } from './validateSkinPackages';

// pnpm skin:validate の実体。実ファイル(public/assets/ui/soro-pon)を検証する。
// CIでも実行される(P0-2)。

const PUBLIC_ROOT = join(__dirname, '..', '..', '..', 'public', 'assets', 'ui', 'soro-pon');

function createRealFs(): SkinPackageFs {
  const abs = (p: string) => join(PUBLIC_ROOT, p);
  return {
    readJson: (p) => {
      try {
        return JSON.parse(readFileSync(abs(p), 'utf-8')) as unknown;
      } catch {
        return null;
      }
    },
    readText: (p) => {
      try {
        return readFileSync(abs(p), 'utf-8');
      } catch {
        return null;
      }
    },
    fileExists: (p) => existsSync(abs(p)),
    fileSize: (p) => {
      try {
        return statSync(abs(p)).size;
      } catch {
        return null;
      }
    },
    listFiles: (dir) => {
      try {
        return readdirSync(abs(dir));
      } catch {
        return [];
      }
    },
    readBytes: (p, maxBytes) => {
      try {
        const buffer = readFileSync(abs(p));
        return new Uint8Array(buffer.subarray(0, maxBytes));
      } catch {
        return null;
      }
    },
  };
}

describe('skin:validate(実パッケージ)', () => {
  it('全公式スキンパッケージが契約検証を通る', () => {
    const report = validateSkinPackages(createRealFs());
    expect(report.checkedSkins).toEqual(['base', 'yorunoshirube', 'cute-pop']);
    expect(report.issues, report.issues.join('\n')).toEqual([]);
    expect(report.ok).toBe(true);
  });
});

// fake IOでの異常系(実ファイルを汚さずに検証ロジック自体をテストする)
function createFakeFs(overrides: Partial<Record<string, unknown>>): SkinPackageFs {
  const real = createRealFs();
  const files = new Map(Object.entries(overrides));
  return {
    readJson: (p) => (files.has(p) ? (files.get(p) as unknown) : real.readJson(p)),
    readText: (p) => (files.has(p) ? (files.get(p) as string) : real.readText(p)),
    fileExists: (p) => (files.has(p) ? files.get(p) !== undefined : real.fileExists(p)),
    fileSize: (p) => (files.has(`size:${p}`) ? (files.get(`size:${p}`) as number) : real.fileSize(p)),
    listFiles: (dir) =>
      files.has(`list:${dir}`) ? (files.get(`list:${dir}`) as string[]) : real.listFiles(dir),
    readBytes: (p, n) =>
      files.has(`bytes:${p}`) ? (files.get(`bytes:${p}`) as Uint8Array) : real.readBytes(p, n),
  };
}

function baseManifestWith(slots: Record<string, unknown>): unknown {
  const raw = createRealFs().readJson('skins/base/skin.json') as { slots: Record<string, unknown> };
  return { ...raw, slots: { ...raw.slots, ...slots } };
}

describe('skin:validate(異常系)', () => {
  it('status finalでfile:nullは不正', () => {
    const io = createFakeFs({
      'skins/base/skin.json': baseManifestWith({
        'tile.face.base': { file: null, status: 'final', renderMode: 'stretch' },
      }),
    });
    const report = validateSkinPackages(io);
    expect(report.ok).toBe(false);
    expect(report.issues.some((i) => i.includes('finalなのにfileがありません'))).toBe(true);
  });

  it('存在しないファイル参照を検出する', () => {
    const io = createFakeFs({
      'skins/base/skin.json': baseManifestWith({
        'tile.face.base': { file: 'ghost.png', status: 'final', renderMode: 'stretch' },
      }),
    });
    const report = validateSkinPackages(io);
    // contractとの不一致も同時に出るが、存在チェックを確認
    expect(report.issues.some((i) => i.includes('ファイルが存在しません'))).toBe(true);
  });

  it('画像実寸とintrinsicSizeの不一致を検出する', () => {
    // 2x2のPNGを作る(実寸検証用)
    const png = new Uint8Array([
      0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, // signature
      0x00, 0x00, 0x00, 0x0d, 0x49, 0x48, 0x44, 0x52, // len + IHDR
      0x00, 0x00, 0x00, 0x02, 0x00, 0x00, 0x00, 0x02, // 2x2
      0x08, 0x06, 0x00, 0x00, 0x00,
    ]);
    expect(readPngDimensions(png)).toEqual({ width: 2, height: 2 });
    const io = createFakeFs({
      'skins/base/skin.json': baseManifestWith({
        'tile.face.base': {
          file: 'proof.png',
          status: 'final',
          renderMode: 'stretch',
          intrinsicSize: { width: 300, height: 400 },
        },
      }),
      'skins/base/generated/final/proof.png': 'exists',
      'size:skins/base/generated/final/proof.png': 100,
      'bytes:skins/base/generated/final/proof.png': png,
      'list:skins/base/generated/final': ['proof.png'],
    });
    const report = validateSkinPackages(io);
    expect(report.issues.some((i) => i.includes('一致しません') && i.includes('実画像'))).toBe(true);
  });

  it('nine-sliceが画像境界を超えると検出する', () => {
    const png = new Uint8Array([
      0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
      0x00, 0x00, 0x00, 0x0d, 0x49, 0x48, 0x44, 0x52,
      0x00, 0x00, 0x00, 0x14, 0x00, 0x00, 0x00, 0x14, // 20x20
      0x08, 0x06, 0x00, 0x00, 0x00,
    ]);
    const io = createFakeFs({
      'skins/base/skin.json': baseManifestWith({
        'panel.paper.default': {
          file: 'panel.png',
          status: 'final',
          renderMode: 'nine-slice',
          nineSlice: { top: 12, right: 12, bottom: 12, left: 12 }, // 12+12 >= 20
        },
      }),
      'skins/base/generated/final/panel.png': 'exists',
      'size:skins/base/generated/final/panel.png': 100,
      'bytes:skins/base/generated/final/panel.png': png,
      'list:skins/base/generated/final': ['panel.png'],
    });
    const report = validateSkinPackages(io);
    expect(report.issues.some((i) => i.includes('nine-sliceが画像境界を超えています'))).toBe(true);
  });

  it('external originのスキンはSVGを使えない', () => {
    const cute = createRealFs().readJson('skins/cute-pop/skin.json') as Record<string, unknown>;
    const io = createFakeFs({
      'skins/cute-pop/skin.json': {
        ...cute,
        origin: 'external',
        slots: {
          'badge.info.background': { file: 'icon.svg', status: 'final', renderMode: 'stretch' },
        },
      },
      'skins/cute-pop/generated/final/icon.svg': '<svg/>',
      'size:skins/cute-pop/generated/final/icon.svg': 10,
      'list:skins/cute-pop/generated/final': ['icon.svg'],
    });
    const report = validateSkinPackages(io);
    expect(report.issues.some((i) => i.includes('許可されないファイル形式'))).toBe(true);
  });

  it('final/にmanifest未参照の孤児ファイルがあると検出する', () => {
    const io = createFakeFs({
      'list:skins/base/generated/final': ['orphan.png'],
    });
    const report = validateSkinPackages(io);
    expect(report.issues.some((i) => i.includes('manifest未参照のファイル'))).toBe(true);
  });

  it('壊れたSKIN-MANIFEST.jsonでもクラッシュしない', () => {
    const io = createFakeFs({ 'SKIN-MANIFEST.json': { broken: true } });
    const report = validateSkinPackages(io);
    expect(report.ok).toBe(false);
    expect(report.issues[0]).toContain('SKIN-MANIFEST.json');
  });
});
