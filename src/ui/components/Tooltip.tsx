import type { ReactNode } from 'react';
import './components.css';

// 軽量tooltip。ホバー/フォーカスで補足を出す。重要情報はtooltipだけに置かない。
export function Tooltip({ text, children }: { text: string; children: ReactNode }) {
  return (
    <span className="sp-tooltip" tabIndex={0} data-tooltip={text}>
      {children}
    </span>
  );
}
