import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { parseSkinTokens } from './parseSkinTokens';
import { createSkinLoader, parseSkinRegistry, sanitizeSkinId, BUILTIN_SKIN_REGISTRY } from './skinRegistry';
import { validateSkinManifest } from './validateSkinManifest';

const PUBLIC_ROOT = join(__dirname, '..', '..', '..', 'public', 'assets', 'ui', 'soro-pon');

function readJson(relativePath: string): unknown {
  return JSON.parse(readFileSync(join(PUBLIC_ROOT, relativePath), 'utf-8')) as unknown;
}

function readText(relativePath: string): string {
  return readFileSync(join(PUBLIC_ROOT, relativePath), 'utf-8');
}

// 実ファイルのIO(node)。fetch実装の代わりにテストで使う。
function createFsSkinIo() {
  return {
    loadManifest: (skinId: string) =>
      Promise.resolve(readJson(`skins/${skinId}/skin.json`)).catch(() => null),
    loadTokens: (skinId: string, tokensFile: string) =>
      Promise.resolve(readText(`skins/${skinId}/${tokensFile}`)).catch(() => null),
  };
}

describe('公式skinパッケージ(実ファイル)', () => {
  const OFFICIAL_IDS = ['base', 'yorunoshirube', 'cute-pop'];

  it('SKIN-MANIFEST.jsonがvalidationを通る', () => {
    const registry = parseSkinRegistry(readJson('SKIN-MANIFEST.json'));
    expect(registry).not.toBeNull();
    expect(registry?.defaultSkinId).toBe('yorunoshirube');
    expect(registry?.skins.map((s) => s.id)).toEqual(OFFICIAL_IDS);
  });

  it.each(OFFICIAL_IDS)('%s のskin.jsonがvalidationを通る', (skinId) => {
    const result = validateSkinManifest(readJson(`skins/${skinId}/skin.json`));
    expect(result.ok, JSON.stringify(!result.ok ? result.issues : [])).toBe(true);
  });

  it.each(OFFICIAL_IDS)('%s のtokens.cssが安全パースを通る(issueゼロ)', (skinId) => {
    const { tokens, issues } = parseSkinTokens(readText(`skins/${skinId}/tokens.css`));
    expect(issues, issues.join(' / ')).toEqual([]);
    // baseはbundled fallbackを使うため上書きゼロ。他スキンはskinable tokenを持つ
    if (skinId === 'base') {
      expect(Object.keys(tokens)).toHaveLength(0);
    } else {
      expect(Object.keys(tokens).length).toBeGreaterThan(10);
    }
  });

  it('cute-popのtokensは外部(販売)スキン相当のtrustでも全て通る', () => {
    const { tokens, issues } = parseSkinTokens(readText('skins/cute-pop/tokens.css'), 'external');
    expect(issues, issues.join(' / ')).toEqual([]);
    expect(Object.keys(tokens).length).toBeGreaterThan(10);
  });

  it('yorunoshirube / cute-pop がbaseを継承して完全に解決できる', async () => {
    const loader = createSkinLoader(createFsSkinIo());
    for (const skinId of ['yorunoshirube', 'cute-pop']) {
      const { resolved, issues } = await loader.loadResolvedSkin(skinId);
      expect(issues, issues.join(' / ')).toEqual([]);
      expect(resolved.chain).toEqual(['base', skinId]);
      // baseの全slot契約を継承している
      expect(Object.keys(resolved.slots).length).toBe(21);
      // tokenが揃っている
      expect(resolved.tokens['--sp-color-paper']).toBeDefined();
      expect(resolved.tokens['--sp-font-family']).toBeDefined();
    }
  });

  it('cute-popは明るい配色・丸ゴシックへ切り替わる', async () => {
    const loader = createSkinLoader(createFsSkinIo());
    const { resolved } = await loader.loadResolvedSkin('cute-pop');
    expect(resolved.tokens['--sp-color-paper']).toBe('#ffffff');
    expect(resolved.tokens['--sp-font-family']).toContain('Maru Gothic');
    expect(resolved.tokens['--sp-radius-lg']).toBe('20px');
  });

  it('SKIN-CONTRACT.jsonのslot契約がbase skin.jsonと一致する', () => {
    const contract = readJson('SKIN-CONTRACT.json') as { slots: Record<string, unknown> };
    const base = readJson('skins/base/skin.json') as { slots: Record<string, unknown> };
    expect(Object.keys(contract.slots).sort()).toEqual(Object.keys(base.slots).sort());
  });
});

describe('sanitizeSkinId', () => {
  it('未知ID・不正文字列・null/undefinedはdefaultへ復旧する', () => {
    expect(sanitizeSkinId('ghost-skin', BUILTIN_SKIN_REGISTRY)).toBe('yorunoshirube');
    expect(sanitizeSkinId('../evil', BUILTIN_SKIN_REGISTRY)).toBe('yorunoshirube');
    expect(sanitizeSkinId('', BUILTIN_SKIN_REGISTRY)).toBe('yorunoshirube');
    expect(sanitizeSkinId(null, BUILTIN_SKIN_REGISTRY)).toBe('yorunoshirube');
    expect(sanitizeSkinId(undefined, BUILTIN_SKIN_REGISTRY)).toBe('yorunoshirube');
  });

  it('既知IDはそのまま通す', () => {
    expect(sanitizeSkinId('cute-pop', BUILTIN_SKIN_REGISTRY)).toBe('cute-pop');
    expect(sanitizeSkinId('base', BUILTIN_SKIN_REGISTRY)).toBe('base');
  });
});
