import type { ReactNode } from 'react';
import './primitives.css';

// ランタン光の強調。勝負どころ(ロン/ツモ/選択牌)だけに使う。常時使用は禁止。
export function LanternGlow({
  children,
  strength = 'soft',
}: {
  children: ReactNode;
  strength?: 'soft' | 'strong';
}) {
  return <span className={`sp-lantern-glow sp-lantern-glow--${strength}`}>{children}</span>;
}
