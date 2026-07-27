import './components.css';

export function PlayerPanel({
  name,
  kind,
  discardCount,
  handCount,
  active = false,
  self = false,
}: {
  name: string;
  kind: 'human' | 'cpu';
  discardCount: number;
  handCount: number;
  active?: boolean;
  self?: boolean;
}) {
  const label = `${self ? '自分' : '相手'}、${name}、${active ? '現在の手番' : '待機中'}、手牌${handCount}枚、捨て牌${discardCount}枚`;
  return (
    <div
      className={`sp-player-panel${active ? ' sp-player-panel--active' : ''}${self ? ' sp-player-panel--self' : ''}`}
      role="group"
      aria-label={label}
      {...(active ? { 'aria-current': 'true' as const } : {})}
    >
      <span className="sp-player-panel__seal" aria-hidden="true">
        {kind === 'human' ? '君' : '灯'}
      </span>
      <span className="sp-player-panel__info">
        <span className="sp-player-panel__name" title={name}>{name}</span>
        <span className="sp-player-panel__meta">
          手牌 {handCount} / 捨て牌 {discardCount}
        </span>
      </span>
      <span className="sp-player-panel__state">{active ? '手番' : '待機'}</span>
    </div>
  );
}
