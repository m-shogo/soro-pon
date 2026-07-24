import { z } from 'zod';
import type { DeckProject, DeckSource } from '../domain/deck';
import { deckProjectSchema } from './deckProjectSchema';

export const MAX_STORED_DECKS = 200;
export const MAX_STORED_MATCH_RECORDS = 100;
export const MAX_ROLE_COLLECTION_ENTRIES = 500;
export const MAX_STORED_ACHIEVEMENTS = 100;
export const MAX_RECENT_MATCH_KEYS = 20;

const safeNonnegativeInteger = z.number().int().nonnegative().max(Number.MAX_SAFE_INTEGER);

export const storedDeckSchema = z
  .object({
    deck: deckProjectSchema,
    source: z.enum(['official', 'created', 'imported']),
    updatedAtMs: safeNonnegativeInteger,
  })
  .strict();

export const storedDecksPayloadSchema = z
  .object({
    version: z.literal(1),
    decks: z.array(storedDeckSchema).max(MAX_STORED_DECKS),
  })
  .strict()
  .superRefine((payload, ctx) => {
    const firstIndexById = new Map<string, number>();
    payload.decks.forEach((stored, index) => {
      const previousIndex = firstIndexById.get(stored.deck.id);
      if (previousIndex !== undefined) {
        ctx.addIssue({
          code: 'custom',
          path: ['decks', index, 'deck', 'id'],
          message: `保存デッキID "${stored.deck.id}" がdecks[${previousIndex}]と重複しています`,
        });
      } else {
        firstIndexById.set(stored.deck.id, index);
      }
    });
  });

export const settingsPayloadSchema = z
  .object({
    version: z.literal(1),
    insightMode: z.enum(['beginner', 'normal', 'advanced']),
    preferredPlayerCount: z.union([z.literal(3), z.literal(4)]),
  })
  .strict();

export type StoredDeck = {
  deck: DeckProject;
  source: DeckSource;
  updatedAtMs: number;
};
export type StoredDecksPayload = {
  version: 1;
  decks: StoredDeck[];
};
export type SettingsPayload = z.infer<typeof settingsPayloadSchema>;

export const DEFAULT_SETTINGS: SettingsPayload = {
  version: 1,
  insightMode: 'normal',
  preferredPlayerCount: 3,
};

export const matchRecordSchema = z
  .object({
    dateMs: safeNonnegativeInteger,
    deckId: z.string().min(1).max(64),
    deckName: z.string().min(1).max(80),
    reason: z.enum(['tsumo', 'ron', 'draw']),
    winnerName: z.string().max(80),
    humanWon: z.boolean(),
    selectedWinRoleId: z.string().max(64).optional(),
    selectedWinRoleName: z.string().max(80).optional(),
    totalPoints: safeNonnegativeInteger.optional(),
    coinsEarned: safeNonnegativeInteger,
  })
  .strict();

export const recordsPayloadSchema = z
  .object({
    version: z.literal(1),
    coins: safeNonnegativeInteger,
    records: z.array(matchRecordSchema).max(MAX_STORED_MATCH_RECORDS),
    roleCollection: z
      .array(z.string().min(1).max(160))
      .max(MAX_ROLE_COLLECTION_ENTRIES),
    achievements: z
      .array(z.string().min(1).max(64))
      .max(MAX_STORED_ACHIEVEMENTS)
      .optional(),
    totalMatches: safeNonnegativeInteger.optional(),
    lastMatchKey: z.string().min(1).max(160).optional(),
    recentMatchKeys: z
      .array(z.string().min(1).max(160))
      .max(MAX_RECENT_MATCH_KEYS)
      .optional(),
  })
  .strict();

export type MatchRecord = z.infer<typeof matchRecordSchema>;
export type RecordsPayload = z.infer<typeof recordsPayloadSchema>;

export const EMPTY_RECORDS: RecordsPayload = {
  version: 1,
  coins: 0,
  records: [],
  roleCollection: [],
  achievements: [],
  totalMatches: 0,
};

function uniqueInOrder(values: readonly string[]): string[] {
  return [...new Set(values)];
}

export function normalizeRecordsPayload(payload: RecordsPayload): RecordsPayload {
  const sourceRecentKeys =
    payload.recentMatchKeys ??
    (payload.lastMatchKey !== undefined ? [payload.lastMatchKey] : []);
  const recentMatchKeys = uniqueInOrder(
    payload.lastMatchKey !== undefined
      ? [payload.lastMatchKey, ...sourceRecentKeys]
      : sourceRecentKeys,
  ).slice(0, MAX_RECENT_MATCH_KEYS);

  return {
    ...payload,
    roleCollection: uniqueInOrder(payload.roleCollection),
    achievements: uniqueInOrder(payload.achievements ?? []),
    // recordsは最大100件でtruncateされるが、明示値がそれ未満なら矛盾なので下限補正する。
    totalMatches: Math.max(payload.totalMatches ?? payload.records.length, payload.records.length),
    recentMatchKeys,
  };
}
