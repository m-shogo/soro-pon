import type { ReactNode } from 'react';
import { useSkinSurfaceStyle } from '../skins/SkinSurface';
import './components.css';

// 対局画面の卓レイアウト。docs/48 §5のgrid契約に従う。
// 背景はasset slot(table.*)経由。未作成時はCSSグラデーションfallback。
// 必須操作(hand/actions)はPC外側へ逃がさず、常にこのgrid内に置く。
export function GameTableLayout({
  left,
  top,
  board,
  hand,
  actions,
}: {
  left: ReactNode;
  top: ReactNode;
  board: ReactNode;
  hand: ReactNode;
  actions: ReactNode;
}) {
  const backgroundStyle = useSkinSurfaceStyle('table.background');
  const inkStyle = useSkinSurfaceStyle('table.overlay.ink');
  const lightStyle = useSkinSurfaceStyle('table.overlay.light');
  return (
    <div className="sp-match-layout sp-fallback-table-bg" style={backgroundStyle}>
      <div className="sp-match-layout__overlay sp-fallback-table-ink" style={inkStyle} />
      <div className="sp-match-layout__overlay sp-fallback-table-light" style={lightStyle} />
      <div className="sp-match-layout__area sp-match-layout__area--left">{left}</div>
      <div className="sp-match-layout__area sp-match-layout__area--top">{top}</div>
      <div className="sp-match-layout__area sp-match-layout__area--board">{board}</div>
      <div className="sp-match-layout__area sp-match-layout__area--hand">{hand}</div>
      <div className="sp-match-layout__area sp-match-layout__area--actions">{actions}</div>
    </div>
  );
}
