import type { CategoryDefinition } from './category';
import type { DeckProjectId, VariantId } from './ids';
import type { TileDefinition } from './tile';
import type { DeckVariant } from './variant';

export const CURRENT_DECK_SCHEMA_VERSION = 1;

export type DeckProject = {
  version: number;
  id: DeckProjectId;
  name: string;
  description?: string;
  categories: CategoryDefinition[];
  tiles: TileDefinition[];
  activeVariantId: VariantId;
  variants: DeckVariant[];
};

// importされたdeckは決してofficial/trustedにならない。
export type DeckSource = 'official' | 'created' | 'imported';
