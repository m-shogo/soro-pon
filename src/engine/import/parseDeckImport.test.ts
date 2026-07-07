import { describe, expect, it } from 'vitest';
import {
  loadFixtureText,
  loadSampleText,
} from '../../test-support/fixtures/loadFixture';
import { parseDeckImport } from './parseDeckImport';

function codesOf(result: ReturnType<typeof parseDeckImport>): string[] {
  return result.issues.map((issue) => issue.code);
}

describe('parseDeckImport: 正常系', () => {
  it('animal starterをstrict importできる', () => {
    const result = parseDeckImport({ rawText: loadSampleText('animal-starter.deck.json') });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.deck.id).toBe('official-animal-starter');
      expect(result.migrationNotice).toBeUndefined();
      expect(result.issues.filter((i) => i.severity === 'error')).toEqual([]);
    }
  });

  it('安全な最小デッキをimportできる', () => {
    const result = parseDeckImport({
      rawText: loadFixtureText('imports/safe/import-safe-minimal.json'),
    });
    expect(result.ok).toBe(true);
  });
});

describe('parseDeckImport: unsafeフィールド拒否', () => {
  const unsafeCases: [string, string][] = [
    ['imports/unsafe/import-unsafe-image-url.json', 'I2004'],
    ['imports/unsafe/import-unsafe-image-base64.json', 'I2004'],
    ['imports/unsafe/import-unsafe-file-path.json', 'I2005'],
    ['imports/unsafe/import-unsafe-blob-url.json', 'I2005'],
    ['imports/unsafe/import-unsafe-url.json', 'I2005'],
    ['imports/unsafe/import-unsafe-src.json', 'I2005'],
    ['imports/unsafe/import-unsafe-html.json', 'I2006'],
    ['imports/unsafe/import-unsafe-style.json', 'I2006'],
    ['imports/unsafe/import-unsafe-script.json', 'I2006'],
    ['imports/unsafe/import-unsafe-nested-code.json', 'I2006'],
    ['imports/unsafe/import-unsafe-prototype-pollution.json', 'I2003'],
  ];

  it.each(unsafeCases)('%s を %s で拒否する', (fixture, expectedCode) => {
    const result = parseDeckImport({ rawText: loadFixtureText(fixture) });
    expect(result.ok).toBe(false);
    expect(codesOf(result)).toContain(expectedCode);
  });

  it('unsafeフィールドは保存されない(importそのものが失敗する)', () => {
    const result = parseDeckImport({
      rawText: loadFixtureText('imports/unsafe/import-unsafe-image-url.json'),
    });
    expect(result.ok).toBe(false);
    expect('deck' in result).toBe(false);
  });
});

describe('parseDeckImport: 不正入力', () => {
  it('壊れたJSONをI2002で拒否する', () => {
    const result = parseDeckImport({
      rawText: loadFixtureText('imports/unsafe/import-corrupt.json'),
    });
    expect(result.ok).toBe(false);
    expect(codesOf(result)).toContain('I2002');
  });

  it('大きすぎるファイルをI2001で拒否する', () => {
    const huge = `{"version":1,"padding":"${'a'.repeat(600 * 1024)}"}`;
    const result = parseDeckImport({ rawText: huge });
    expect(result.ok).toBe(false);
    expect(codesOf(result)).toContain('I2001');
  });

  it('未知トップレベルフィールドをS1002で拒否する', () => {
    const result = parseDeckImport({
      rawText: loadFixtureText('decks/invalid/invalid-unknown-field.deck.json'),
    });
    expect(result.ok).toBe(false);
    expect(codesOf(result)).toContain('S1002');
  });

  it('現行スキーマでscoreBudgetがないとS1006で拒否する', () => {
    const result = parseDeckImport({
      rawText: loadFixtureText('decks/invalid/invalid-missing-score-budget.deck.json'),
    });
    expect(result.ok).toBe(false);
    expect(codesOf(result)).toContain('S1006');
  });

  it('requiredGroupsのないwin_roleをS1007で拒否する', () => {
    const result = parseDeckImport({
      rawText: loadFixtureText('decks/invalid/invalid-count-only-normal-role.deck.json'),
    });
    expect(result.ok).toBe(false);
    expect(codesOf(result)).toContain('S1007');
  });

  it('specificSetのサイズ違反をS1008で拒否する', () => {
    const result = parseDeckImport({
      rawText: loadFixtureText('decks/invalid/invalid-specific-set-wrong-size.deck.json'),
    });
    expect(result.ok).toBe(false);
    expect(codesOf(result)).toContain('S1008');
  });
});

describe('parseDeckImport: version/migration', () => {
  it('新しいversionをI2007で拒否する', () => {
    const result = parseDeckImport({
      rawText: loadFixtureText('decks/migration/migration-newer-version-reject.deck.json'),
    });
    expect(result.ok).toBe(false);
    expect(codesOf(result)).toContain('I2007');
  });

  it('versionがないとI2009で拒否する', () => {
    const result = parseDeckImport({
      rawText: loadFixtureText('decks/migration/migration-missing-version-reject.deck.json'),
    });
    expect(result.ok).toBe(false);
    expect(codesOf(result)).toContain('I2009');
  });

  it('既知の旧安全スキーマ(v0)はscoreBudget defaultを適用して通知付きで移行する', () => {
    const result = parseDeckImport({
      rawText: loadFixtureText('decks/migration/migration-v0-safe-add-score-budget.deck.json'),
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.migrationNotice?.fromVersion).toBe(0);
      expect(result.migrationNotice?.toVersion).toBe(1);
      expect(result.migrationNotice?.changed.length).toBeGreaterThan(0);
      expect(codesOf(result)).toContain('I2008');
      const variant = result.deck.variants[0]!;
      expect(variant.scoreBudget.softResultCap).toBe(300);
    }
  });

  it('旧count-only win_roleは自動変換せず拒否する', () => {
    const result = parseDeckImport({
      rawText: loadFixtureText('decks/migration/migration-v0-count-only-reject.deck.json'),
    });
    expect(result.ok).toBe(false);
    expect(codesOf(result)).toContain('R4001');
  });
});
