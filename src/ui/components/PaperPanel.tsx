import type { HTMLAttributes, ReactNode } from 'react';
import { SkinLayer } from '../skins/SkinSurface';
import type { AssetSlotName } from '../assets/slots';
import './components.css';

export type PaperPanelVariant = 'paper' | 'aged' | 'ink';

export type PaperPanelProps = Omit<HTMLAttributes<HTMLDivElement>, 'title'> & {
  variant?: PaperPanelVariant;
  title?: ReactNode;
  selected?: boolean;
  /** slot上書き(Modal/ResultFrameが指定する)。通常はvariantから自動決定。 */
  assetSlot?: AssetSlotName;
};

export function PaperPanel({
  variant = 'paper',
  title,
  selected = false,
  assetSlot,
  className,
  children,
  style,
  ...rest
}: PaperPanelProps) {
  const slot: AssetSlotName | null =
    assetSlot ??
    (variant === 'ink'
      ? null
      : selected
        ? 'panel.paper.emphasis'
        : 'panel.paper.default');
  const classes = [
    'sp-paper-panel',
    'sp-skin-host',
    variant !== 'paper' ? `sp-paper-panel--${variant}` : '',
    selected ? 'sp-paper-panel--selected' : '',
    className ?? '',
  ]
    .filter(Boolean)
    .join(' ');
  return (
    <div className={classes} style={style} {...rest}>
      {/* スキン画像はfallback背景の上・内容の下の独立レイヤー(P0-6) */}
      <SkinLayer slot={slot} />
      {title !== undefined && <h2 className="sp-paper-panel__title">{title}</h2>}
      {children}
    </div>
  );
}
