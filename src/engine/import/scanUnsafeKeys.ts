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

// UIは先頭12件のみ表示する。拒否判定に数万件の長い診断文字列は不要なので、
// 49件の具体例 + 1件のtruncated通知で上限化する。
export const MAX_IMPORT_SCAN_ISSUES = 50;

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

type ScanState = {
  issues: ValidationIssue[];
  truncated: boolean;
};

function addIssue(state: ScanState, issue: ValidationIssue): void {
  if (state.truncated) {
    return;
  }
  if (state.issues.length < MAX_IMPORT_SCAN_ISSUES - 1) {
    state.issues.push(issue);
    return;
  }
  state.issues.push({
    code: 'I2011',
    severity: 'error',
    message: `安全でないフィールドまたは構造上の問題が多数あるため、最初の${MAX_IMPORT_SCAN_ISSUES - 1}件のみ表示しました。`,
  });
  state.truncated = true;
}

// strict Zod parseの前に再帰的にunsafe keyを検出する。
// 共有deck importに例外はない。unsafe keyは除去ではなく拒否。
export function scanUnsafeKeys(value: unknown): ValidationIssue[] {
  const state: ScanState = { issues: [], truncated: false };
  walk(value, '$', 0, state);
  return state.issues;
}

function walk(value: unknown, path: string, depth: number, state: ScanState): void {
  if (state.truncated) {
    return;
  }
  if (depth > ENGINE_LIMITS.maxJsonDepth) {
    addIssue(state, {
      code: 'I2010',
      severity: 'error',
      path,
      message: `JSONのネストが深すぎます(最大${ENGINE_LIMITS.maxJsonDepth})`,
    });
    return;
  }
  if (Array.isArray(value)) {
    for (let index = 0; index < value.length && !state.truncated; index += 1) {
      walk(value[index], `${path}[${index}]`, depth + 1, state);
    }
    return;
  }
  if (value !== null && typeof value === 'object') {
    for (const key of Object.keys(value)) {
      if (state.truncated) {
        return;
      }
      const childPath = `${path}.${key}`;
      if (isUnsafeKey(key)) {
        addIssue(state, {
          code: issueCodeForKey(key),
          severity: 'error',
          path: childPath,
          message: `安全でないフィールド "${key}" が含まれています。共有デッキJSONには入れられません。`,
        });
      }
      walk((value as Record<string, unknown>)[key], childPath, depth + 1, state);
    }
  }
}
