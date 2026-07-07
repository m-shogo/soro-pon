import type { ValidationIssue } from '../../domain/validation';
import {
  PROTOTYPE_POLLUTION_KEYS,
  UNSAFE_IMPORT_KEYS,
} from '../../schemas/importSchema';
import { ENGINE_LIMITS } from '../engineLimits';

const IMAGE_KEYS = new Set([
  'image',
  'images',
  'imageurl',
  'imagebase64',
  'remoteimageurl',
  'localimageid',
]);

const URL_PATH_KEYS = new Set([
  'bloburl',
  'filepath',
  'assetpath',
  'url',
  'href',
  'src',
  'remoteruleurl',
]);

const SCRIPT_HTML_STYLE_KEYS = new Set([
  'html',
  'innerhtml',
  'style',
  'css',
  'script',
  'scripts',
  'code',
  'eval',
  'function',
  'plugin',
  'plugins',
]);

function issueCodeForKey(key: string): string {
  if (PROTOTYPE_POLLUTION_KEYS.includes(key)) {
    return 'I2003';
  }
  const lower = key.toLowerCase();
  if (IMAGE_KEYS.has(lower)) {
    return 'I2004';
  }
  if (URL_PATH_KEYS.has(lower)) {
    return 'I2005';
  }
  if (SCRIPT_HTML_STYLE_KEYS.has(lower)) {
    return 'I2006';
  }
  return 'I2003';
}

function isUnsafeKey(key: string): boolean {
  return (
    PROTOTYPE_POLLUTION_KEYS.includes(key) || UNSAFE_IMPORT_KEYS.includes(key.toLowerCase())
  );
}

// strict Zod parseの前に再帰的にunsafe keyを検出する。
// 共有deck importに例外はない。unsafe keyは除去ではなく拒否。
export function scanUnsafeKeys(value: unknown): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  walk(value, '$', 0, issues);
  return issues;
}

function walk(value: unknown, path: string, depth: number, issues: ValidationIssue[]): void {
  if (depth > ENGINE_LIMITS.maxJsonDepth) {
    issues.push({
      code: 'I2010',
      severity: 'error',
      path,
      message: `JSONのネストが深すぎます(最大${ENGINE_LIMITS.maxJsonDepth})`,
    });
    return;
  }
  if (Array.isArray(value)) {
    value.forEach((item, index) => {
      walk(item, `${path}[${index}]`, depth + 1, issues);
    });
    return;
  }
  if (value !== null && typeof value === 'object') {
    for (const key of Object.keys(value)) {
      const childPath = `${path}.${key}`;
      if (isUnsafeKey(key)) {
        issues.push({
          code: issueCodeForKey(key),
          severity: 'error',
          path: childPath,
          message: `安全でないフィールド "${key}" が含まれています。共有デッキJSONには入れられません。`,
        });
      }
      walk((value as Record<string, unknown>)[key], childPath, depth + 1, issues);
    }
  }
}
