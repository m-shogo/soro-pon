import type { TileId } from '../../domain/ids';
import type { TileDefinition, TileInstance } from '../../domain/tile';
import type { DeckIndex } from '../../engine/tiles/deckIndex';

// tileIdの並びから手牌インスタンスを作る。同じtileIdは #1, #2... と連番になる。
export function makeInstances(tileIds: TileId[]): TileInstance[] {
  const counters = new Map<TileId, number>();
  return tileIds.map((tileId) => {
    const n = (counters.get(tileId) ?? 0) + 1;
    counters.set(tileId, n);
    return {
      instanceId: `${tileId}#${n}`,
      tileId,
      location: 'hand' as const,
    };
  });
}

// DeckProjectを介さず、テスト用にtile定義から直接DeckIndexを作る。
export function makeTestIndex(tiles: TileDefinition[]): DeckIndex {
  return {
    tilesById: new Map(tiles.map((tile) => [tile.id, tile])),
    categoryNameById: new Map(),
  };
}
