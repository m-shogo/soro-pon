import type { ReactNode } from 'react';
import './components.css';

// 対局中の右側アクション領域。必須操作はPC外側へ逃がさず常にここに置く。
export function ActionPanel({ children }: { children: ReactNode }) {
  return <div className="sp-action-panel">{children}</div>;
}
