// asset slotの正本。UIコンポーネントはslot名だけを知る。
// 画像パスの直書きは禁止。差し替えはasset-slots.jsonとgenerated/final/で行う。

export const ASSET_SLOTS = [
  'table.background',
  'table.overlay.ink',
  'table.overlay.light',

  'panel.paper.default',
  'panel.paper.emphasis',
  'panel.modal.background',
  'panel.result.frame',

  'button.primary.background',
  'button.secondary.background',
  'button.danger.background',
  'button.disabled.background',

  'tile.face.base',
  'tile.face.selected',
  'tile.face.ronAvailable',
  'tile.face.tsumoAvailable',
  'tile.back.base',

  'badge.warning.background',
  'badge.info.background',

  'effect.result.burst',
  'effect.wildcard.glow',
  'effect.score.pop',
] as const;

export type AssetSlotName = (typeof ASSET_SLOTS)[number];

export function isAssetSlotName(value: string): value is AssetSlotName {
  return (ASSET_SLOTS as readonly string[]).includes(value);
}
