import { CURRENT_DECK_SCHEMA_VERSION } from '../../domain/deck';
import type { ValidationIssue } from '../../domain/validation';

export type MigrationNotice = {
  fromVersion: number;
  toVersion: number;
  changed: string[];
  warnings: ValidationIssue[];
};

export type MigrateLegacyDeckResult =
  | { ok: true; migrated: unknown; notice: MigrationNotice }
  | { ok: false; issues: ValidationIssue[] };

const NORMAL_DEFAULT_SCORE_BUDGET = {
  expectedBaseMin: 30,
  expectedBaseMax: 130,
  expectedResultMin: 40,
  expectedResultMax: 220,
  softResultCap: 300,
  hardResultCap: 500,
  maxSpecialBonusTotal: 80,
  maxScoreBonusTotal: 60,
} as const;

const EXTENDED_DEFAULT_SCORE_BUDGET = {
  expectedBaseMin: 50,
  expectedBaseMax: 220,
  expectedResultMin: 70,
  expectedResultMax: 350,
  softResultCap: 500,
  hardResultCap: 800,
  maxSpecialBonusTotal: 120,
  maxScoreBonusTotal: 100,
} as const;

// 既知の旧安全スキーマ(version 0)のみを決定的に移行する。
// 許可される自動fixはscoreBudget defaultの適用のみ。
// count-onlyのwin_roleは黙って変換しない。
export function migrateLegacyDeck(raw: unknown): MigrateLegacyDeckResult {
  if (raw === null || typeof raw !== 'object' || Array.isArray(raw)) {
    return {
      ok: false,
      issues: [
        { code: 'I2002', severity: 'error', message: 'デッキJSONがオブジェクトではありません。' },
      ],
    };
  }
  const deck = raw as Record<string, unknown>;
  const version = deck['version'];

  if (typeof version !== 'number' || !Number.isInteger(version)) {
    return {
      ok: false,
      issues: [
        {
          code: 'I2009',
          severity: 'error',
          path: '$.version',
          message: 'versionがないか不正なため、安全に移行できません。',
        },
      ],
    };
  }

  if (version !== 0) {
    return {
      ok: false,
      issues: [
        {
          code: 'I2009',
          severity: 'error',
          path: '$.version',
          message: `version ${version} は既知の移行可能な旧スキーマではありません。`,
        },
      ],
    };
  }

  const variants = deck['variants'];
  if (!Array.isArray(variants)) {
    return {
      ok: false,
      issues: [
        {
          code: 'I2009',
          severity: 'error',
          path: '$.variants',
          message: '旧スキーマのvariantsが読めないため移行できません。',
        },
      ],
    };
  }

  const changed: string[] = [];
  const warnings: ValidationIssue[] = [];
  const migratedVariants = variants.map((variant, index) => {
    if (variant === null || typeof variant !== 'object' || Array.isArray(variant)) {
      return variant;
    }
    const v = { ...(variant as Record<string, unknown>) };

    // 旧count-only win_roleは自動変換禁止。移行不能として拒否する。
    const winRoles = v['winRoles'];
    if (Array.isArray(winRoles)) {
      for (const role of winRoles) {
        if (
          role !== null &&
          typeof role === 'object' &&
          !Array.isArray(role) &&
          (role as Record<string, unknown>)['requiredGroups'] === undefined
        ) {
          warnings.push({
            code: 'R4001',
            severity: 'error',
            path: `$.variants[${index}].winRoles`,
            message:
              'count-onlyの旧win_roleはgroup-backed roleへ自動変換できません。手動での再作成が必要です。',
          });
        }
      }
    }

    if (v['scoreBudget'] === undefined) {
      const ruleConfig = v['ruleConfig'];
      const evaluationMode =
        ruleConfig !== null && typeof ruleConfig === 'object' && !Array.isArray(ruleConfig)
          ? (ruleConfig as Record<string, unknown>)['evaluationMode']
          : undefined;
      v['scoreBudget'] =
        evaluationMode === 'extendedRoleSpan'
          ? { ...EXTENDED_DEFAULT_SCORE_BUDGET }
          : { ...NORMAL_DEFAULT_SCORE_BUDGET };
      changed.push(`variants[${index}].scoreBudget にdefaultを適用`);
    }
    return v;
  });

  if (warnings.some((issue) => issue.severity === 'error')) {
    return { ok: false, issues: warnings };
  }

  const migrated: Record<string, unknown> = {
    ...deck,
    version: CURRENT_DECK_SCHEMA_VERSION,
    variants: migratedVariants,
  };
  changed.push(`version 0 -> ${CURRENT_DECK_SCHEMA_VERSION}`);

  return {
    ok: true,
    migrated,
    notice: {
      fromVersion: 0,
      toVersion: CURRENT_DECK_SCHEMA_VERSION,
      changed,
      warnings: [
        {
          code: 'I2008',
          severity: 'warning',
          message: '旧スキーマ(version 0)から移行しました。scoreBudgetにはdefault値を適用しています。',
        },
      ],
    },
  };
}
