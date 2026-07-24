import { describe, expect, it } from 'vitest';
import { MAX_IMPORT_SCAN_ISSUES, scanUnsafeKeys } from './scanUnsafeKeys';

describe('scanUnsafeKeys', () => {
  it('安全なオブジェクトは空配列を返す', () => {
    expect(
      scanUnsafeKeys({ version: 1, name: 'ok', tiles: [{ id: 't', count: 3 }] }),
    ).toEqual([]);
  });

  it('ネストしたimageUrlをI2004で検出する', () => {
    const issues = scanUnsafeKeys({ tiles: [{ id: 't', imageUrl: 'https://x' }] });
    expect(issues.map((i) => i.code)).toContain('I2004');
    expect(issues[0]?.path).toBe('$.tiles[0].imageUrl');
  });

  it('url/href/src/filePath/blobUrlをI2005で検出する', () => {
    for (const key of ['url', 'href', 'src', 'filePath', 'blobUrl', 'assetPath']) {
      const issues = scanUnsafeKeys({ nested: { [key]: 'x' } });
      expect(issues.map((i) => i.code)).toContain('I2005');
    }
  });

  it('html/style/script/code/functionをI2006で検出する', () => {
    for (const key of ['html', 'innerHTML', 'style', 'css', 'script', 'code', 'eval', 'function']) {
      const issues = scanUnsafeKeys({ deep: [{ [key]: 'x' }] });
      expect(issues.map((i) => i.code)).toContain('I2006');
    }
  });

  it('prototype pollutionキーをI2003で検出する', () => {
    const raw = JSON.parse('{"__proto__": {"polluted": true}}') as unknown;
    const issues = scanUnsafeKeys(raw);
    expect(issues.map((i) => i.code)).toContain('I2003');
  });

  it('大文字小文字の変化も検出する', () => {
    const issues = scanUnsafeKeys({ ImageURL: 'x' });
    expect(issues.map((i) => i.code)).toContain('I2004');
  });

  it('深すぎるネストをI2010で拒否する', () => {
    let value: unknown = 'leaf';
    for (let i = 0; i < 40; i++) {
      value = { child: value };
    }
    const issues = scanUnsafeKeys(value);
    expect(issues.map((i) => i.code)).toContain('I2010');
  });

  it('大量unsafe keyは診断を上限化しI2011で省略を明示する', () => {
    const value = Object.fromEntries(
      Array.from({ length: 200 }, (_, index) => [`unsafe-${index}`, { imageUrl: 'x' }]),
    );

    const issues = scanUnsafeKeys(value);

    expect(issues).toHaveLength(MAX_IMPORT_SCAN_ISSUES);
    expect(issues.at(-1)?.code).toBe('I2011');
    expect(issues.at(-1)?.message).toContain('最初の49件のみ');
  });
});
