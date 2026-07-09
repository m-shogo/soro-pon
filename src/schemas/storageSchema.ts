import { z } from 'zod';
import type { DeckProject, DeckSource } from '../domain/deck';
import { deckProjectSchema } from './deckProjectSchema';

// localStorageに保存するペイロードのstrictスキーマ。
// 読み込みは必ずここを通す。未知フィールドは破損として扱う。

export const storedDeckSchema = z
  .object({
    deck: deckProjectSchema,
    source: z.enum(['official', 'created', 'imported']),
    updatedAtMs: z.number().int().nonnegative(),
  })
  .strict();

export const storedDecksPayloadSchema = z
  .object({
    version: z.literal(1),
    decks: z.array(storedDeckSchema).max(200),
  })
  .strict();

export const settingsPayloadSchema = z
  .object({
    version: z.literal(1),
    insightMode: z.enum(['beginner', 'normal', 'advanced']),
    preferredPlayerCount: z.union([z.literal(3), z.literal(4)]),
  })
  .strict();

// schema出力(version: literal 1)はdomain型(version: number)へ代入可能。
// storage層のAPIはdomain型で扱う。
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
