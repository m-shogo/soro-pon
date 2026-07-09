import './primitives.css';

// 黒インクの区切り線。中央に小さな菱形マークを置く。
export function InkDivider() {
  return (
    <div className="sp-ink-divider" role="separator">
      <span className="sp-ink-divider__mark">◆</span>
    </div>
  );
}
