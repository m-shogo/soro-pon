import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { useSkinSurfaceStyle } from '../skins/SkinSurface';
import type { AssetSlotName } from '../assets/slots';
import './components.css';

export type ButtonVariant = 'paper' | 'ink' | 'primary' | 'danger' | 'ghost';

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  /** 勝負どころ(ロン/ツモ)だけtrueにする。常時使用は禁止。 */
  lantern?: boolean;
  subLabel?: ReactNode;
};

// variant/状態 -> asset slot。画像未作成時はCSS fallbackで成立する。
function slotFor(variant: ButtonVariant, disabled: boolean): AssetSlotName | null {
  if (disabled) {
    return 'button.disabled.background';
  }
  switch (variant) {
    case 'primary':
      return 'button.primary.background';
    case 'danger':
      return 'button.danger.background';
    case 'paper':
      return 'button.secondary.background';
    case 'ink':
    case 'ghost':
      return null;
  }
}

export function Button({
  variant = 'paper',
  lantern = false,
  subLabel,
  className,
  children,
  style,
  disabled,
  ...rest
}: ButtonProps) {
  const assetStyle = useSkinSurfaceStyle(slotFor(variant, disabled === true));
  const cssVariant = variant === 'danger' ? 'primary' : variant;
  const classes = [
    'sp-button',
    `sp-button--${cssVariant}`,
    lantern ? 'sp-button--lantern' : '',
    className ?? '',
  ]
    .filter(Boolean)
    .join(' ');
  return (
    <button
      type="button"
      className={classes}
      disabled={disabled}
      style={{ ...style, ...assetStyle }}
      {...rest}
    >
      <span>{children}</span>
      {subLabel !== undefined && <span className="sp-button__sub">{subLabel}</span>}
    </button>
  );
}
