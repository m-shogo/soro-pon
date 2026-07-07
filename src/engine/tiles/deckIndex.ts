import type { DeckProject } from '../../domain/deck';
import type { CategoryId, TileId } from '../../domain/ids';
import type { TileDefinition, TileInstance, WildcardBehavior } from '../../domain/tile';

// 解析中に何度も引くdeck情報の索引。純データで副作用なし。
export type DeckIndex = {
  tilesById: Map<TileId, TileDefinition>;
  categoryNameById: Map<CategoryId, string>;
};

export function buildDeckIndex(deck: DeckProject): DeckIndex {
  return {
    tilesById: new Map(deck.tiles.map((tile) => [tile.id, tile])),
    categoryNameById: new Map(deck.categories.map((category) => [category.id, category.name])),
  };
}

export function tileDefOf(index: DeckIndex, instance: TileInstance): TileDefinition {
  const def = index.tilesById.get(instance.tileId);
  if (!def) {
    throw new Error(`tile definition not found: ${instance.tileId}`);
  }
  return def;
}

export function isWildcardInstance(index: DeckIndex, instance: TileInstance): boolean {
  return tileDefOf(index, instance).wildcard !== undefined;
}

export function wildcardBehaviorOf(
  index: DeckIndex,
  instance: TileInstance,
): WildcardBehavior | undefined {
  return tileDefOf(index, instance).wildcard;
}

export function categoryNameOf(index: DeckIndex, categoryId: CategoryId): string {
  return index.categoryNameById.get(categoryId) ?? categoryId;
}
