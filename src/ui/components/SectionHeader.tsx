import type { ReactNode } from 'react';
import './components.css';

// 画面ヘッダの共通形。タイトル+サブ+右寄せアクション。
// 画面ごとにヘッダ構造を再実装しない。
export function SectionHeader({
  title,
  subtitle,
  badges,
  actions,
}: {
  title: ReactNode;
  subtitle?: ReactNode;
  badges?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <div className="sp-screen__header">
      <h1 className="sp-screen__title">{title}</h1>
      {subtitle !== undefined && <span className="sp-screen__subtitle">{subtitle}</span>}
      {badges}
      <div className="sp-screen__spacer" />
      {actions}
    </div>
  );
}
