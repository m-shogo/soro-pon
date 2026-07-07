import type { z } from 'zod';
import type { ValidationIssue } from '../../domain/validation';

function pathToString(path: (string | number)[]): string {
  return path.length === 0 ? '$' : `$.${path.map(String).join('.')}`;
}

// ZodのissueをERROR-CODES.mdの安定コードへマップする。
// テストはメッセージ文字列ではなくコードをassertする。
export function mapSchemaIssue(issue: z.ZodIssue): ValidationIssue {
  const path = pathToString(issue.path);
  const base = { severity: 'error' as const, path, message: issue.message };

  if (issue.code === 'unrecognized_keys') {
    return {
      ...base,
      code: 'S1002',
      message: `未知のフィールドが含まれています: ${issue.keys.join(', ')}`,
      fixHint: '現行スキーマの許可フィールドのみ使用してください。',
    };
  }

  const pathText = issue.path.map(String).join('.');

  if (issue.code === 'invalid_type' && issue.received === 'undefined') {
    if (issue.path[issue.path.length - 1] === 'scoreBudget') {
      return { ...base, code: 'S1006', message: '現行スキーマではscoreBudgetが必須です。' };
    }
    if (issue.path[issue.path.length - 1] === 'requiredGroups') {
      return {
        ...base,
        code: 'S1007',
        message: '通常のwin_roleにはrequiredGroupsが必須です。',
      };
    }
    return { ...base, code: 'S1003', message: `必須フィールドがありません: ${pathText}` };
  }

  if (issue.code === 'custom') {
    if (issue.message.includes('specificSet')) {
      return { ...base, code: 'S1008' };
    }
    if (issue.message.includes('>=')) {
      return { ...base, code: 'S1005' };
    }
    return { ...base, code: 'S1004' };
  }

  if (pathText.includes('requiredGroups') && issue.code === 'too_small') {
    return { ...base, code: 'S1007', message: '通常のwin_roleにはrequiredGroupsが必須です。' };
  }

  if (
    issue.code === 'invalid_literal' ||
    issue.code === 'invalid_enum_value' ||
    issue.code === 'invalid_union' ||
    issue.code === 'invalid_union_discriminator'
  ) {
    return { ...base, code: 'S1004' };
  }

  return { ...base, code: 'S1001' };
}

export function mapSchemaError(error: z.ZodError): ValidationIssue[] {
  return error.issues.map(mapSchemaIssue);
}
