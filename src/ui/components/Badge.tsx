import type { ReactNode } from 'react';
import { useAssetBackgroundStyle } from '../assets/AssetProvider';
import './components.css';

export type BadgeVariant = 'warning' | 'info';

// 検証結果などの小さなバッジ。状態は色だけでなく文言でも伝える。
export function Badge({ variant, children }: { variant: BadgeVariant; children: ReactNode }) {
  const assetStyle = useAssetBackgroundStyle(
    variant === 'warning' ? 'badge.warning.background' : 'badge.info.background',
  );
  return (
    <span className={`sp-badge sp-badge--${variant}`} style={assetStyle}>
      {children}
    </span>
  );
}
