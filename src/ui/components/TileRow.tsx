import type { ReactNode } from 'react';
import './components.css';

// 牌の横並び。gapは--tile-gap(整数px)で管理し、スキンでは変わらない。
export function TileRow({ children, wrap = false }: { children: ReactNode; wrap?: boolean }) {
  return (
    <div className={`sp-tile-row${wrap ? ' sp-tile-row--wrap' : ''}`}>{children}</div>
  );
}
