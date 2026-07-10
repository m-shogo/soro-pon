import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { parseSkinTokens } from './parseSkinTokens';
import {
  MAX_SKIN_RADIUS_PX,
  SKIN_TOKEN_DEFINITIONS,
  SKIN_TOKEN_TABLE,
  validateSkinTokenValue,
} from './skinTokenRegistry';

const BUNDLED_TOKENS_PATH = join(__dirname, '..', 'styles', 'tokens.css');
const YORU_TOKENS_PATH = join(
  __dirname,
  '..',
  '..',
  '..',
  'public',
  'assets',
  'ui',
  'soro-pon',
  'skins',
  'yorunoshirube',
  'tokens.css',
);

// bundled tokens.cssから宣言を抽出する(テスト用の簡易パーサ)
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
    const value = cleaned.slice(colonAt + 1).trim();
    if (name.startsWith('--sp-')) {
      map.set(name, value);
    }
  }
  return map;
}

describe('skinTokenRegistry: 定義テーブルの完全性(P0-1 / token-source ownership)', () => {
  it('bundled tokens.cssの全tokenがregistryに定義されている', () => {
    const bundled = extractDeclarations(readFileSync(BUNDLED_TOKENS_PATH, 'utf-8'));
    const missing = [...bundled.keys()].filter((name) => !SKIN_TOKEN_TABLE.has(name));
    expect(missing, `registry未定義: ${missing.join(', ')}`).toEqual([]);
  });

  it('registryのskinable tokenは全てbundled tokens.cssに既定値を持つ', () => {
    const bundled = extractDeclarations(readFileSync(BUNDLED_TOKENS_PATH, 'utf-8'));
    const missing = SKIN_TOKEN_DEFINITIONS.filter(
      (def) => !def.structural && !bundled.has(def.name),
    ).map((def) => def.name);
    expect(missing, `bundled未定義: ${missing.join(', ')}`).toEqual([]);
  });

  it('yorunoshirubeパッケージはbundledのskinable subsetと完全一致する(drift防止)', () => {
    const bundled = extractDeclarations(readFileSync(BUNDLED_TOKENS_PATH, 'utf-8'));
    const yoru = extractDeclarations(readFileSync(YORU_TOKENS_PATH, 'utf-8'));
    const expected = new Map(
      [...bundled].filter(([name]) => {
        const def = SKIN_TOKEN_TABLE.get(name);
        return def !== undefined && !def.structural;
      }),
    );
    expect(Object.fromEntries(yoru)).toEqual(Object.fromEntries(expected));
  });
});

describe('skinTokenRegistry: structural tokenの拒否(P0-1)', () => {
  it.each([
    '--sp-touch-min',
    '--sp-touch-primary',
    '--sp-z-modal',
    '--sp-space-8',
    '--sp-font-md',
    '--sp-line-tight',
    '--sp-motion-micro',
  ])('%s はスキンから上書きできない', (name) => {
    const result = validateSkinTokenValue(name, '1px', 'official');
    expect(result.ok).toBe(false);
    // parseSkinTokens経由でも拒否される
    const parsed = parseSkinTokens(`${name}: 1px;`);
    expect(parsed.tokens[name]).toBeUndefined();
    expect(parsed.issues.length).toBeGreaterThan(0);
  });

  it('allowlist外の未知tokenを拒否する', () => {
    const parsed = parseSkinTokens('--sp-color-evil-unknown: #ff0000;');
    expect(parsed.tokens['--sp-color-evil-unknown']).toBeUndefined();
    expect(parsed.issues.some((i) => i.includes('allowlist外'))).toBe(true);
  });
});

describe('skinTokenRegistry: 種別・範囲の検証', () => {
  it('radiusは上限を超えると拒否する', () => {
    expect(validateSkinTokenValue('--sp-radius-lg', '20px', 'official').ok).toBe(true);
    expect(
      validateSkinTokenValue('--sp-radius-lg', `${MAX_SKIN_RADIUS_PX + 1}px`, 'official').ok,
    ).toBe(false);
    expect(validateSkinTokenValue('--sp-radius-lg', '50%', 'official').ok).toBe(false);
  });

  it('borderは幅4px以下+色のみ受理する', () => {
    expect(
      validateSkinTokenValue('--sp-border-ink', '1px solid rgba(36, 26, 16, 0.85)', 'official').ok,
    ).toBe(true);
    expect(validateSkinTokenValue('--sp-border-ink', '10px solid #000000', 'official').ok).toBe(
      false,
    );
    expect(validateSkinTokenValue('--sp-border-ink', '1px solid red', 'official').ok).toBe(false);
  });

  it('shadowはnone/長さ+色のコンマ列のみ受理する', () => {
    expect(
      validateSkinTokenValue(
        '--sp-shadow-panel',
        '0 2px 10px rgba(0, 0, 0, 0.55)',
        'official',
      ).ok,
    ).toBe(true);
    expect(validateSkinTokenValue('--sp-shadow-panel', 'none', 'official').ok).toBe(true);
    expect(
      validateSkinTokenValue(
        '--sp-shadow-panel',
        '0 0 12px var(--sp-color-lantern-glow)',
        'official',
      ).ok,
    ).toBe(true);
    expect(validateSkinTokenValue('--sp-shadow-panel', 'glow everywhere', 'official').ok).toBe(
      false,
    );
  });

  it('colorはhex/rgba/var/transparentのみ受理する', () => {
    expect(validateSkinTokenValue('--sp-color-paper', '#d9c9a6', 'official').ok).toBe(true);
    expect(
      validateSkinTokenValue('--sp-color-lantern-glow', 'rgba(232, 162, 60, 0.35)', 'official').ok,
    ).toBe(true);
    expect(validateSkinTokenValue('--sp-color-paper', 'papayawhip', 'official').ok).toBe(false);
  });

  it('gradientは許可関数のみで構成される', () => {
    expect(
      validateSkinTokenValue(
        '--sp-gradient-button-primary',
        'linear-gradient(160deg, var(--sp-color-crimson-bright), var(--sp-color-crimson))',
        'official',
      ).ok,
    ).toBe(true);
    expect(
      validateSkinTokenValue(
        '--sp-gradient-button-primary',
        'paint(evil-worklet)',
        'official',
      ).ok,
    ).toBe(false);
  });
});
