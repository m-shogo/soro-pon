import './components.css';

export function PlayerPanel({
  name,
  kind,
  discardCount,
  handCount,
  active = false,
}: {
  name: string;
  kind: 'human' | 'cpu';
  discardCount: number;
  handCount: number;
  active?: boolean;
}) {
  return (
    <div className={`sp-player-panel${active ? ' sp-player-panel--active' : ''}`}>
      <span className="sp-player-panel__seal" aria-hidden="true">
        {kind === 'human' ? '君' : '灯'}
      </span>
      <span className="sp-player-panel__info">
        <span className="sp-player-panel__name">{name}</span>
        <span className="sp-player-panel__meta">
          手牌 {handCount} / 捨て牌 {discardCount}
        </span>
      </span>
    </div>
  );
}
