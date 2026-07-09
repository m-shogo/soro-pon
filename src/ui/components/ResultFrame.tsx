import type { ReactNode } from 'react';
import { PaperPanel } from './PaperPanel';
import './components.css';

// Result画面の記憶帳フレーム。asset slot panel.result.frame経由で差し替え可能。
export function ResultFrame({ title, children }: { title?: ReactNode; children: ReactNode }) {
  return (
    <PaperPanel
      assetSlot="panel.result.frame"
      className="sp-result-frame"
      {...(title !== undefined ? { title } : {})}
    >
      {children}
    </PaperPanel>
  );
}
