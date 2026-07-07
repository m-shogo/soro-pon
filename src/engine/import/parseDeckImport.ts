import { CURRENT_DECK_SCHEMA_VERSION, type DeckProject } from '../../domain/deck';
import type { ValidationIssue } from '../../domain/validation';
import { deckProjectSchema } from '../../schemas/deckProjectSchema';
import { ENGINE_LIMITS } from '../engineLimits';
import { mapSchemaError } from './mapSchemaIssues';
import { migrateLegacyDeck, type MigrationNotice } from './migrateLegacyDeck';
import { scanUnsafeKeys } from './scanUnsafeKeys';

export type ParseDeckImportInput = {
  rawText: string;
};

export type ParseDeckImportResult =
  | {
      ok: true;
      deck: DeckProject;
      issues: ValidationIssue[];
      migrationNotice?: MigrationNotice;
    }
  | {
      ok: false;
      issues: ValidationIssue[];
    };

function byteLength(text: string): number {
  return new TextEncoder().encode(text).length;
}

// strict import flow (docs/74):
// 1. size check -> 2. JSON parse -> 3. unsafe key scan -> 4. strict Zod parse
// 移行が必要な旧versionは決定的に移行できる場合のみnotice付きで受け入れる。
export function parseDeckImport(input: ParseDeckImportInput): ParseDeckImportResult {
  const issues: ValidationIssue[] = [];

  const bytes = byteLength(input.rawText);
  if (bytes > ENGINE_LIMITS.maxImportJsonBytes) {
    return {
      ok: false,
      issues: [
        {
          code: 'I2001',
          severity: 'error',
          message: `ファイルが大きすぎます(${bytes}バイト、上限${ENGINE_LIMITS.maxImportJsonBytes}バイト)。`,
        },
      ],
    };
  }
  if (bytes > ENGINE_LIMITS.warnImportJsonBytes) {
    issues.push({
      code: 'I2001',
      severity: 'warning',
      message: `ファイルが大きめです(${bytes}バイト)。読み込みに時間がかかる場合があります。`,
    });
  }

  let raw: unknown;
  try {
    raw = JSON.parse(input.rawText) as unknown;
  } catch {
    return {
      ok: false,
      issues: [
        { code: 'I2002', severity: 'error', message: 'JSONとして読み込めませんでした。' },
      ],
    };
  }

  // 深いネスト・unsafe keyは高コストな検証より前に拒否する。
  const unsafeIssues = scanUnsafeKeys(raw);
  if (unsafeIssues.length > 0) {
    return { ok: false, issues: [...issues, ...unsafeIssues] };
  }

  if (raw === null || typeof raw !== 'object' || Array.isArray(raw)) {
    return {
      ok: false,
      issues: [
        { code: 'S1001', severity: 'error', message: 'デッキJSONの形が不正です。' },
      ],
    };
  }

  const version = (raw as Record<string, unknown>)['version'];
  if (version === undefined || typeof version !== 'number' || !Number.isInteger(version)) {
    return {
      ok: false,
      issues: [
        {
          code: 'I2009',
          severity: 'error',
          path: '$.version',
          message: 'versionがないか不正です。共有デッキJSONにはversionが必要です。',
        },
      ],
    };
  }

  if (version > CURRENT_DECK_SCHEMA_VERSION) {
    return {
      ok: false,
      issues: [
        {
          code: 'I2007',
          severity: 'error',
          path: '$.version',
          message: `このデッキはより新しいスキーマversion ${version} です。アプリの更新が必要です。`,
        },
      ],
    };
  }

  let toParse: unknown = raw;
  let migrationNotice: MigrationNotice | undefined;

  if (version < CURRENT_DECK_SCHEMA_VERSION) {
    const migration = migrateLegacyDeck(raw);
    if (!migration.ok) {
      return { ok: false, issues: [...issues, ...migration.issues] };
    }
    toParse = migration.migrated;
    migrationNotice = migration.notice;
    issues.push(...migration.notice.warnings);
  }

  const parsed = deckProjectSchema.safeParse(toParse);
  if (!parsed.success) {
    const schemaIssues = mapSchemaError(parsed.error);
    if (migrationNotice) {
      return {
        ok: false,
        issues: [
          ...issues,
          {
            code: 'I2009',
            severity: 'error',
            message: '旧スキーマを移行しましたが、現行スキーマとして不正なため取り込めません。',
          },
          ...schemaIssues,
        ],
      };
    }
    return { ok: false, issues: [...issues, ...schemaIssues] };
  }

  if (migrationNotice) {
    return { ok: true, deck: parsed.data, issues, migrationNotice };
  }
  return { ok: true, deck: parsed.data, issues };
}
