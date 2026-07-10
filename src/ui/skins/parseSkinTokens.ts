import { validateSkinTokenValue } from './skinTokenRegistry';
import { APPROVED_FONT_STACKS, SKIN_LIMITS } from './skinTypes';

// tokens.cssを「安全なtoken宣言の集合」として厳格にパースする(P0-1)。
// 1. 構文の安全性: `--sp-<name>: <value>;` のみ受理、url()/@import等を拒否
// 2. 型付きallowlist: skinTokenRegistryの定義テーブルで
//    未知token/structural token/種別・範囲外の値を拒否
// 外部スキンでも安全に読めるよう、公式スキンにも同じ制約を適用する。

export type ParseSkinTokensResult = {
  tokens: Record<string, string>;
  issues: string[];
};

export type SkinTokenTrust = 'official' | 'external';

const TOKEN_NAME_PATTERN = /^--sp-[a-z0-9-]+$/;

// 値に含めてよい文字。色/グラデーション/影/フォント/数値/単位をカバーする。
const TOKEN_VALUE_PATTERN = /^[A-Za-z0-9#%.,()\s\-+'"/*]*$/;

const FORBIDDEN_VALUE_PATTERNS = [
  /url\s*\(/i,
  /@import/i,
  /expression\s*\(/i,
  /javascript:/i,
  /<|>/,
  /\\/,
  /image-set/i,
  /element\s*\(/i,
  /var\s*\(\s*--(?!sp-)/i, // --sp-以外の変数参照は不可
];

function normalizeFontStack(value: string): string {
  return value.replace(/\s+/g, ' ').trim();
}

const APPROVED_FONTS_NORMALIZED = new Set(APPROVED_FONT_STACKS.map(normalizeFontStack));

export function isApprovedFontStack(value: string): boolean {
  return APPROVED_FONTS_NORMALIZED.has(normalizeFontStack(value));
}

export function parseSkinTokens(
  cssText: string,
  trust: SkinTokenTrust = 'official',
): ParseSkinTokensResult {
  const tokens: Record<string, string> = {};
  const issues: string[] = [];

  if (new TextEncoder().encode(cssText).length > SKIN_LIMITS.maxTokensFileBytes) {
    return { tokens: {}, issues: ['tokensファイルが大きすぎます'] };
  }

  // コメント・:rootセレクタ・波括弧を除去し、`;`区切りの宣言として読む
  // (宣言は複数行にまたがってよい。フォントスタック等)
  const withoutComments = cssText
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/:root\s*\{/g, '')
    .replace(/[{}]/g, '');

  for (const rawDeclaration of withoutComments.split(';')) {
    const cleaned = rawDeclaration.replace(/\s+/g, ' ').trim();
    if (cleaned === '') {
      continue;
    }
    const colonAt = cleaned.indexOf(':');
    if (colonAt === -1) {
      continue;
    }
    const name = cleaned.slice(0, colonAt).trim();
    const value = cleaned.slice(colonAt + 1).trim();

    if (!TOKEN_NAME_PATTERN.test(name)) {
      // token宣言以外(セレクタ等)は黙って無視せず記録する
      if (name.startsWith('--')) {
        issues.push(`不正なtoken名: ${name}`);
      }
      continue;
    }
    if (value.length === 0 || value.length > 400) {
      issues.push(`token ${name} の値が不正な長さです`);
      continue;
    }
    if (!TOKEN_VALUE_PATTERN.test(value)) {
      issues.push(`token ${name} の値に許可されない文字が含まれています`);
      continue;
    }
    if (FORBIDDEN_VALUE_PATTERNS.some((pattern) => pattern.test(value))) {
      issues.push(`token ${name} の値に許可されない構文が含まれています`);
      continue;
    }
    // フォントは許可済みセットのみ
    if (name === '--sp-font-family' || name === '--sp-font-family-num') {
      if (!isApprovedFontStack(value)) {
        issues.push(`token ${name} は許可済みフォントセット以外を指定できません`);
        continue;
      }
    }
    // 型付きallowlist検証(未知/structural/種別・範囲外を拒否)
    const validation = validateSkinTokenValue(name, value, trust);
    if (!validation.ok) {
      issues.push(validation.reason);
      continue;
    }
    tokens[name] = value;
  }

  return { tokens, issues };
}
