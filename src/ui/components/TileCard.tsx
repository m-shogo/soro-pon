import type { ButtonHTMLAttributes, CSSProperties } from 'react';
import { SkinLayer } from '../skins/SkinSurface';
import { categoryBandTone } from '../skins/colorContrast';
import type { AssetSlotName } from '../assets/slots';
import './components.css';

export type TileEmphasis = 'ron' | 'tsumo';

export type TileCardProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  name: string;
  emoji?: string;
  fallbackLabel: string;
  /** primaryカテゴリの色。deckのカテゴリ定義から渡す。 */
  categoryColor?: string;
  categoryName?: string;
  selected?: boolean;
  dimmed?: boolean;
  /** ロン/ツモの勝負どころ強調のみ */
  emphasis?: TileEmphasis;
  faceDown?: boolean;
  showName?: boolean;
};

// 牌のslotは「base面 + 状態レイヤー」の合成(ADR-015)。
// 状態slotをbaseの置き換えにすると、baseだけfinal化した時に
// 選択中の牌だけ画像が消える(slot間fallbackは存在しない)。
export function baseSlotFor(faceDown: boolean): AssetSlotName {
  return faceDown ? 'tile.back.base' : 'tile.face.base';
}

// 状態優先度: faceDown(状態なし) > ron > tsumo > selected > なし
export function stateSlotFor(
  faceDown: boolean,
  selected: boolean,
  emphasis?: TileEmphasis,
): AssetSlotName | null {
  if (faceDown) {
    return null;
  }
  if (emphasis === 'ron') {
    return 'tile.face.ronAvailable';
  }
  if (emphasis === 'tsumo') {
    return 'tile.face.tsumoAvailable';
  }
  if (selected) {
    return 'tile.face.selected';
  }
  return null;
}

// 牌カード。aspect-ratio固定、サイズは--tile-w/--tile-hで外から渡す。
// 画像はslot経由の背景としてのみ使い、当たり判定と文字は画像に依存しない。
export function TileCard({
  name,
  emoji,
  fallbackLabel,
  categoryColor,
  categoryName,
  selected = false,
  dimmed = false,
  emphasis,
  faceDown = false,
  showName = true,
  className,
  style,
  ...rest
}: TileCardProps) {
  const baseSlot = baseSlotFor(faceDown);
  const stateSlot = stateSlotFor(faceDown, selected, emphasis);
  const classes = [
    'sp-tile',
    'sp-skin-host',
    selected ? 'sp-tile--selected' : '',
    dimmed ? 'sp-tile--dimmed' : '',
    emphasis !== undefined ? 'sp-tile--win' : '',
    faceDown ? 'sp-tile--back' : '',
    className ?? '',
  ]
    .filter(Boolean)
    .join(' ');
  const mergedStyle: CSSProperties = {
    ...style,
    ...(categoryColor
      ? ({
          '--tile-category-color': categoryColor,
          // 帯背景の明暗に応じて読める文字色を自動選択する(H3)
          '--tile-band-text':
            categoryBandTone(categoryColor) === 'light'
              ? 'var(--sp-text-on-category-light)'
              : 'var(--sp-text-on-category-dark)',
        } as CSSProperties)
      : {}),
  };
  if (faceDown) {
    return (
      <button type="button" className={classes} style={mergedStyle} aria-label="伏せ牌" {...rest}>
        <SkinLayer slot={baseSlot} />
        <span className="sp-tile__back-mark">◆</span>
      </button>
    );
  }
  // 選択・勝負どころは色や画像だけでなくaria状態と文言でも伝える(P1-3)
  const accessibleName =
    emphasis === 'ron'
      ? `${name}(ロンできる)`
      : emphasis === 'tsumo'
        ? `${name}(ツモできる)`
        : name;
  return (
    <button
      type="button"
      className={classes}
      style={mergedStyle}
      aria-label={accessibleName}
      aria-pressed={selected}
      {...rest}
    >
      {/* スキン画像はfallback背景の上・文字の下の独立レイヤー(P0-6)。
          base面の上へ状態レイヤーを合成する(ADR-015)。 */}
      <SkinLayer slot={baseSlot} />
      {stateSlot !== null && <SkinLayer slot={stateSlot} />}
      <span className="sp-tile__band" title={categoryName}>
        {categoryName ?? ''}
      </span>
      <span className="sp-tile__face" aria-hidden="true">
        {emoji ?? fallbackLabel}
      </span>
      {showName && <span className="sp-tile__name">{name}</span>}
    </button>
  );
}
