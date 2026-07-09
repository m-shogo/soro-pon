import type { AssetSlotName } from './slots';

// slotごとのfallback定義。PNG未作成でもUIはこのCSSクラスで成立する。
// クラス実体はtokens.cssのtokenだけで作られている(components.css / screens.css)。
export const ASSET_FALLBACK_CLASS: Record<AssetSlotName, string> = {
  'table.background': 'sp-fallback-table-bg',
  'table.overlay.ink': 'sp-fallback-table-ink',
  'table.overlay.light': 'sp-fallback-table-light',

  'panel.paper.default': 'sp-paper-panel',
  'panel.paper.emphasis': 'sp-paper-panel sp-paper-panel--selected',
  'panel.modal.background': 'sp-paper-panel',
  'panel.result.frame': 'sp-paper-panel',

  'button.primary.background': 'sp-button--primary',
  'button.secondary.background': 'sp-button--paper',
  'button.danger.background': 'sp-button--primary',
  'button.disabled.background': '',

  'tile.face.base': 'sp-tile',
  'tile.face.selected': 'sp-tile--selected',
  'tile.face.ronAvailable': 'sp-tile--win',
  'tile.face.tsumoAvailable': 'sp-tile--win',
  'tile.back.base': 'sp-tile--back',

  'badge.warning.background': 'sp-badge--warning',
  'badge.info.background': 'sp-badge--info',

  'effect.result.burst': 'sp-lantern-glow--strong',
  'effect.wildcard.glow': 'sp-lantern-glow--soft',
  'effect.score.pop': '',
};
