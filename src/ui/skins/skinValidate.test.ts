import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  CATEGORY_BAND_MIX_RATIO,
  categoryBandTone,
  contrastRatio,
  mixTowardBlack,
  parseHexColor,
  type Rgb,
} from './colorContrast';
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

  it('nine-slice slotのminRenderSize欠落を検出する(P0-5)', () => {
    const io = createFakeFs({
      'skins/base/skin.json': baseManifestWith({
        'panel.paper.default': {
          file: null,
          status: 'placeholder',
          renderMode: 'nine-slice',
          nineSlice: { top: 24, right: 24, bottom: 24, left: 24 },
        },
      }),
    });
    const report = validateSkinPackages(io);
    expect(report.issues.some((i) => i.includes('minRenderSize'))).toBe(true);
  });

  it('描画幅がminRenderSizeに収まらないと検出する(P0-5)', () => {
    const io = createFakeFs({
      'skins/base/skin.json': baseManifestWith({
        'panel.paper.default': {
          file: null,
          status: 'placeholder',
          renderMode: 'nine-slice',
          nineSlice: { top: 40, right: 40, bottom: 40, left: 40 },
          minRenderSize: { width: 64, height: 64 },
        },
      }),
    });
    const report = validateSkinPackages(io);
    expect(report.issues.some((i) => i.includes('収まりません'))).toBe(true);
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

// ================= 公式スキンのコントラスト検証(H3/P0-3) =================
// bundled tokens(fallback既定値)にスキンパッケージのtokensを重ねた
// 「実際に画面へ出る値」でWCAGコントラスト比を検証する。

const BUNDLED_TOKENS_PATH = join(__dirname, '..', 'styles', 'tokens.css');

function extractDeclarations(cssText: string): Map<string, string> {
  const map = new Map<string, string>();
  const noComments = cssText
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/:root\s*\{/g, '')
    .replace(/[{}]/g, '');
  for (const chunk of noComments.split(';')) {
    const cleaned = chunk.replace(/\s+/g, ' ').trim();
    const colonAt = cleaned.indexOf(':');
    if (colonAt === -1) {
      continue;
    }
    const name = cleaned.slice(0, colonAt).trim();
    if (name.startsWith('--sp-')) {
      map.set(name, cleaned.slice(colonAt + 1).trim());
    }
  }
  return map;
}

function loadResolvedTokens(skinId: string): Map<string, string> {
  const bundled = extractDeclarations(readFileSync(BUNDLED_TOKENS_PATH, 'utf-8'));
  const pkg = extractDeclarations(
    readFileSync(join(PUBLIC_ROOT, 'skins', skinId, 'tokens.css'), 'utf-8'),
  );
  return new Map([...bundled, ...pkg]);
}

// hex / rgba() を「背景に重ねた実効色」として解決する(半透明はbg上に合成)
function effectiveColor(tokens: Map<string, string>, name: string, background: Rgb): Rgb {
  let value = tokens.get(name);
  // var(--sp-x) 参照を有限回まで辿る
  for (let i = 0; i < 4 && value !== undefined; i += 1) {
    const ref = value.match(/^var\((--sp-[a-z0-9-]+)\)$/);
    if (!ref) {
      break;
    }
    value = tokens.get(ref[1]!);
  }
  if (value === undefined) {
    throw new Error(`token未定義: ${name}`);
  }
  const hex = parseHexColor(value);
  if (hex) {
    return hex;
  }
  const rgba = value.match(
    /^rgba?\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*(?:,\s*(0|1|0?\.\d{1,3})\s*)?\)$/,
  );
  if (rgba) {
    const alpha = rgba[4] === undefined ? 1 : Number.parseFloat(rgba[4]);
    const over = (fg: number, bg: number) => Math.round(fg * alpha + bg * (1 - alpha));
    return {
      r: over(Number(rgba[1]), background.r),
      g: over(Number(rgba[2]), background.g),
      b: over(Number(rgba[3]), background.b),
    };
  }
  throw new Error(`色として解決できません: ${name} = ${value}`);
}

describe.each(['yorunoshirube', 'cute-pop'])('コントラスト契約: %s', (skinId) => {
  const tokens = loadResolvedTokens(skinId);
  const solid = (name: string) => effectiveColor(tokens, name, { r: 0, g: 0, b: 0 });
  const expectContrast = (textName: string, surfaceName: string, min: number) => {
    const surface = solid(surfaceName);
    const text = effectiveColor(tokens, textName, surface);
    const ratio = contrastRatio(text, surface);
    expect(
      ratio,
      `${skinId}: ${textName} on ${surfaceName} = ${ratio.toFixed(2)} < ${min}`,
    ).toBeGreaterThanOrEqual(min);
  };

  it('主要CTAの文字はAA(4.5:1)を満たす', () => {
    expectContrast('--sp-text-on-primary', '--sp-color-crimson', 4.5);
    expectContrast('--sp-text-on-primary', '--sp-color-crimson-bright', 4.5);
  });

  it('紙面/暗面/補足文字はAA(4.5:1)を満たす', () => {
    expectContrast('--sp-text-on-surface', '--sp-color-paper', 4.5);
    expectContrast('--sp-text-on-surface', '--sp-color-paper-aged', 4.5);
    expectContrast('--sp-text-on-dark', '--sp-color-night', 4.5);
    expectContrast('--sp-text-on-dark', '--sp-color-ink-panel', 4.5);
    expectContrast('--sp-text-muted', '--sp-color-night', 4.5);
    // dangerは紙面上の警告文字としても使う
    expectContrast('--sp-color-danger', '--sp-color-paper', 4.5);
  });

  it('focusリングはring+haloの二重構成で明暗どちらの面でも3:1以上', () => {
    for (const surfaceName of ['--sp-color-night', '--sp-color-paper'] as const) {
      const surface = solid(surfaceName);
      const ring = effectiveColor(tokens, '--sp-focus-ring-color', surface);
      const halo = effectiveColor(tokens, '--sp-focus-ring-halo', surface);
      const best = Math.max(contrastRatio(ring, surface), contrastRatio(halo, surface));
      expect(
        best,
        `${skinId}: focus ring/halo on ${surfaceName} = ${best.toFixed(2)} < 3`,
      ).toBeGreaterThanOrEqual(3);
    }
  });

  it('カテゴリ帯は明暗自動選択で読める文字色になる', () => {
    // カテゴリ色はデッキデータ由来(任意)なので代表色でメカニズムを検証する。
    // 輝度境界付近の色は理論上どちらの文字色でも~4.4が上限のため閾値は4.0。
    const samples = [
      '#ffffff', '#000000', '#ff0000', '#00cc44', '#3366ff',
      '#ffff00', '#ff9d2e', '#808080', '#b06fc9', '#00cccc',
    ];
    for (const sample of samples) {
      const band = mixTowardBlack(parseHexColor(sample)!, CATEGORY_BAND_MIX_RATIO);
      const tone = categoryBandTone(sample);
      const chosen = effectiveColor(
        tokens,
        tone === 'light' ? '--sp-text-on-category-light' : '--sp-text-on-category-dark',
        band,
      );
      const other = effectiveColor(
        tokens,
        tone === 'light' ? '--sp-text-on-category-dark' : '--sp-text-on-category-light',
        band,
      );
      const chosenRatio = contrastRatio(chosen, band);
      expect(
        chosenRatio,
        `${skinId}: band ${sample}(tone=${tone}) = ${chosenRatio.toFixed(2)} < 4.0`,
      ).toBeGreaterThanOrEqual(4.0);
      // 自動選択は常に「逆toneより悪くない」こと
      expect(chosenRatio).toBeGreaterThanOrEqual(contrastRatio(other, band) - 0.01);
    }
  });
});
