import { describe, expect, it } from 'vitest';
import { getSkinAssetUrl } from './getSkinAssetUrl';
import { parseSkinTokens } from './parseSkinTokens';
import { resolveInheritanceChain, resolveSkin } from './resolveSkin';
import { SKIN_CONTRACT_VERSION, type SkinManifest } from './skinTypes';
import { validateSkinManifest } from './validateSkinManifest';

function manifest(overrides: Partial<SkinManifest> & { id: string }): SkinManifest {
  return {
    label: overrides.id,
    version: 1,
    skinContractVersion: SKIN_CONTRACT_VERSION,
    origin: 'official',
    tokensFile: 'tokens.css',
    slots: {},
    ...overrides,
  };
}

describe('validateSkinManifest', () => {
  const validRaw = {
    id: 'yorunoshirube',
    label: 'ヨルノシルベ',
    version: 1,
    skinContractVersion: 1,
    origin: 'official',
    tokensFile: 'tokens.css',
    slots: {
      'tile.face.base': {
        file: 'tile-face-base.png',
        status: 'final',
        renderMode: 'stretch',
        intrinsicSize: { width: 300, height: 400 },
      },
    },
  };

  it('正しいmanifestを受理する', () => {
    const result = validateSkinManifest(validRaw);
    expect(result.ok).toBe(true);
  });

  it('未知のトップレベルフィールドを拒否する(strict)', () => {
    const result = validateSkinManifest({ ...validRaw, script: 'alert(1)' });
    expect(result.ok).toBe(false);
  });

  it('未知のasset slotを拒否する', () => {
    const result = validateSkinManifest({
      ...validRaw,
      slots: { 'evil.slot': { file: null, status: 'placeholder', renderMode: 'cover' } },
    });
    expect(result.ok).toBe(false);
  });

  it('パス区切り・親参照・URLスキームを含むfileを拒否する', () => {
    for (const file of ['../etc/passwd.png', 'a/b.png', 'https://evil.example/x.png', 'c:\\x.png', '.hidden.png']) {
      const result = validateSkinManifest({
        ...validRaw,
        slots: { 'tile.face.base': { file, status: 'final', renderMode: 'cover' } },
      });
      expect(result.ok, file).toBe(false);
    }
  });

  it('新しすぎるskinContractVersionを拒否する', () => {
    const result = validateSkinManifest({
      ...validRaw,
      skinContractVersion: SKIN_CONTRACT_VERSION + 1,
    });
    expect(result.ok).toBe(false);
  });

  it('自分自身の継承を拒否する', () => {
    const result = validateSkinManifest({ ...validRaw, inherits: 'yorunoshirube' });
    expect(result.ok).toBe(false);
  });

  it('nine-slice指定なしのnine-slice renderModeを拒否する', () => {
    const result = validateSkinManifest({
      ...validRaw,
      slots: {
        'panel.paper.default': { file: 'panel.png', status: 'final', renderMode: 'nine-slice' },
      },
    });
    expect(result.ok).toBe(false);
  });

  it('画像以外のファイル(css)をslotに指定できない', () => {
    const result = validateSkinManifest({
      ...validRaw,
      slots: {
        'tile.face.base': { file: 'evil.css', status: 'final', renderMode: 'cover' },
      },
    });
    expect(result.ok).toBe(false);
  });
});

describe('parseSkinTokens', () => {
  it('正しいtoken宣言をパースする', () => {
    const { tokens, issues } = parseSkinTokens(`
      /* コメント */
      :root {
        --sp-color-night: #120d08;
        --sp-color-paper: #d9c9a6; /* 紙 */
        --sp-shadow-panel: 0 2px 10px rgba(0, 0, 0, 0.55);
        --sp-radius-md: 6px;
      }
    `);
    expect(issues).toEqual([]);
    expect(tokens['--sp-color-night']).toBe('#120d08');
    expect(tokens['--sp-shadow-panel']).toBe('0 2px 10px rgba(0, 0, 0, 0.55)');
  });

  it('url()/@import/javascript:を含む値を拒否する', () => {
    const { tokens, issues } = parseSkinTokens(`
      --sp-color-a: url(https://evil.example/x.png);
      --sp-color-b: expression(alert(1));
    `);
    expect(tokens['--sp-color-a']).toBeUndefined();
    expect(tokens['--sp-color-b']).toBeUndefined();
    expect(issues.length).toBeGreaterThan(0);
  });

  it('--sp-以外のtoken名・変数参照を受理しない', () => {
    const { tokens } = parseSkinTokens(`
      --evil-token: red;
      --sp-color-x: var(--evil-token);
    `);
    expect(tokens['--evil-token']).toBeUndefined();
    expect(tokens['--sp-color-x']).toBeUndefined();
  });

  it('複数行にまたがる宣言(フォントスタック等)をパースできる', () => {
    const { tokens, issues } = parseSkinTokens(`:root {
      --sp-font-family:
        'Hiragino Mincho ProN', 'Yu Mincho', 'BIZ UDMincho', 'Noto Serif JP', serif;
      --sp-shadow-panel:
        0 2px 10px rgba(0, 0, 0, 0.55);
    }`);
    expect(issues).toEqual([]);
    expect(tokens['--sp-font-family']).toContain('Mincho');
    expect(tokens['--sp-shadow-panel']).toBe('0 2px 10px rgba(0, 0, 0, 0.55)');
  });

  it('フォントは許可済みセットのみ受理する', () => {
    const ok = parseSkinTokens(
      `--sp-font-family: 'Hiragino Maru Gothic ProN', 'BIZ UDGothic', 'Noto Sans JP', sans-serif;`,
    );
    expect(ok.tokens['--sp-font-family']).toContain('Maru Gothic');
    const bad = parseSkinTokens(`--sp-font-family: 'Evil Font', cursive;`);
    expect(bad.tokens['--sp-font-family']).toBeUndefined();
    expect(bad.issues.length).toBeGreaterThan(0);
  });
});

describe('resolveSkin / 継承', () => {
  const base = manifest({
    id: 'base',
    slots: {
      'tile.face.base': { file: null, status: 'placeholder', renderMode: 'stretch' },
      'table.background': { file: null, status: 'placeholder', renderMode: 'cover' },
    },
  });
  const yoru = manifest({
    id: 'yorunoshirube',
    inherits: 'base',
    slots: {
      'table.background': { file: 'desk.png', status: 'final', renderMode: 'cover' },
    },
  });

  const manifests = new Map([
    ['base', base],
    ['yorunoshirube', yoru],
  ]);
  const tokensBySkin = new Map<string, Record<string, string>>([
    ['base', { '--sp-color-night': '#111111', '--sp-color-paper': '#eeeeee' }],
    ['yorunoshirube', { '--sp-color-night': '#120d08' }],
  ]);

  it('base -> skinの順でtokens/slotsをmergeし、後段が優先される', () => {
    const resolved = resolveSkin({ skinId: 'yorunoshirube', manifests, tokensBySkin });
    expect(resolved.chain).toEqual(['base', 'yorunoshirube']);
    expect(resolved.tokens['--sp-color-night']).toBe('#120d08'); // 上書き
    expect(resolved.tokens['--sp-color-paper']).toBe('#eeeeee'); // 継承
    expect(resolved.slots['table.background']?.sourceSkinId).toBe('yorunoshirube');
    expect(resolved.slots['tile.face.base']?.sourceSkinId).toBe('base');
    expect(resolved.issues).toEqual([]);
  });

  it('存在しないスキンはbaseのみへfallbackしissueを返す', () => {
    const resolved = resolveSkin({ skinId: 'ghost', manifests, tokensBySkin });
    expect(resolved.chain).toEqual(['base']);
    expect(resolved.tokens['--sp-color-night']).toBe('#111111');
    expect(resolved.issues.length).toBeGreaterThan(0);
  });

  it('存在しない親を持つスキンはbase直下として解決される', () => {
    const orphan = manifest({ id: 'orphan', inherits: 'missing-parent' });
    const withOrphan = new Map(manifests);
    withOrphan.set('orphan', orphan);
    const resolved = resolveSkin({
      skinId: 'orphan',
      manifests: withOrphan,
      tokensBySkin,
    });
    expect(resolved.chain).toEqual(['base', 'orphan']);
    expect(resolved.issues.some((i) => i.includes('missing-parent'))).toBe(true);
  });

  it('継承の循環を検出して打ち切る', () => {
    const a = manifest({ id: 'skin-a', inherits: 'skin-b' });
    const b = manifest({ id: 'skin-b', inherits: 'skin-a' });
    const cyclic = new Map(manifests);
    cyclic.set('skin-a', a);
    cyclic.set('skin-b', b);
    const { issues } = resolveInheritanceChain('skin-a', cyclic);
    expect(issues.some((i) => i.includes('循環'))).toBe(true);
    // resolveSkinでもクラッシュしない
    const resolved = resolveSkin({ skinId: 'skin-a', manifests: cyclic, tokensBySkin });
    expect(resolved.chain[0]).toBe('base');
  });

  it('多段継承(base -> mid -> leaf)が正しくmergeされる', () => {
    const mid = manifest({
      id: 'mid',
      inherits: 'base',
      slots: {
        'tile.face.base': { file: 'mid-tile.png', status: 'final', renderMode: 'stretch' },
      },
    });
    const leaf = manifest({ id: 'leaf', inherits: 'mid' });
    const multi = new Map(manifests);
    multi.set('mid', mid);
    multi.set('leaf', leaf);
    const resolved = resolveSkin({ skinId: 'leaf', manifests: multi, tokensBySkin });
    expect(resolved.chain).toEqual(['base', 'mid', 'leaf']);
    expect(resolved.slots['tile.face.base']?.sourceSkinId).toBe('mid');
  });
});

describe('getSkinAssetUrl', () => {
  const base = manifest({
    id: 'base',
    slots: {
      'tile.face.base': { file: null, status: 'placeholder', renderMode: 'stretch' },
    },
  });
  const skin = manifest({
    id: 'cute-pop',
    inherits: 'base',
    slots: {
      'table.background': { file: 'bg.png', status: 'final', renderMode: 'cover' },
    },
  });
  const manifests = new Map([
    ['base', base],
    ['cute-pop', skin],
  ]);
  const resolved = resolveSkin({
    skinId: 'cute-pop',
    manifests,
    tokensBySkin: new Map(),
  });

  it('fileありのslotは所属スキンのパッケージURLになる', () => {
    expect(getSkinAssetUrl(resolved, 'table.background')).toBe(
      '/assets/ui/soro-pon/skins/cute-pop/generated/final/bg.png',
    );
  });

  it('fileなし(CSS fallback)のslotはnull', () => {
    expect(getSkinAssetUrl(resolved, 'tile.face.base')).toBeNull();
  });

  it('未定義slotはnull', () => {
    expect(getSkinAssetUrl(resolved, 'effect.score.pop')).toBeNull();
  });
});
