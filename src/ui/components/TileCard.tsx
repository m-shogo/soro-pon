import type { ButtonHTMLAttributes, CSSProperties } from 'react';
import { useSkinSurfaceStyle } from '../skins/SkinSurface';
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

function slotFor(faceDown: boolean, selected: boolean, emphasis?: TileEmphasis): AssetSlotName {
  if (faceDown) {
    return 'tile.back.base';
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
  return 'tile.face.base';
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
  const assetStyle = useSkinSurfaceStyle(slotFor(faceDown, selected, emphasis));
  const classes = [
    'sp-tile',
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
    ...assetStyle,
    ...(categoryColor ? ({ '--tile-category-color': categoryColor } as CSSProperties) : {}),
  };
  if (faceDown) {
    return (
      <button type="button" className={classes} style={mergedStyle} aria-label="伏せ牌" {...rest}>
        <span className="sp-tile__back-mark">◆</span>
      </button>
    );
  }
  return (
    <button type="button" className={classes} style={mergedStyle} aria-label={name} {...rest}>
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
