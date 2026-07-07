import type { TileDefinition, TileInstance } from '../../domain/tile';

export type CreateTileInstancesInput = {
  tiles: TileDefinition[];
};

// TileDefinition.countを物理牌インスタンスへ展開する。
// instanceIdは決定的("tileId#n")で、テスト・リプレイで安定する。
export function createTileInstances(input: CreateTileInstancesInput): TileInstance[] {
  const instances: TileInstance[] = [];
  for (const tile of input.tiles) {
    for (let n = 1; n <= tile.count; n++) {
      instances.push({
        instanceId: `${tile.id}#${n}`,
        tileId: tile.id,
        location: 'drawPile',
      });
    }
  }
  return instances;
}
