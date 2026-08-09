import type { ReactNode } from 'react';
import { useSkinSurfaceStyle } from '../skins/SkinSurface';
import './components.css';

export type TableSeatPosition = 'self' | 'left' | 'top' | 'right';

export type TableSeat = {
  id: string;
  position: TableSeatPosition;
  content: ReactNode;
};

export function GameTableLayout({
  playerCount,
  utility,
  center,
  seats,
  hand,
  actions,
  messages,
}: {
  playerCount: 3 | 4;
  utility: ReactNode;
  center: ReactNode;
  seats: TableSeat[];
  hand: ReactNode;
  actions: ReactNode;
  messages?: ReactNode;
}) {
  const backgroundStyle = useSkinSurfaceStyle('table.background');
  const inkStyle = useSkinSurfaceStyle('table.overlay.ink');
  const lightStyle = useSkinSurfaceStyle('table.overlay.light');

  return (
    <main
      className="sp-match-layout sp-fallback-table-bg"
      style={backgroundStyle}
      data-player-count={playerCount}
      aria-label={`${playerCount}人戦の対局卓`}
    >
      <div className="sp-match-layout__overlay sp-fallback-table-ink" style={inkStyle} />
      <div className="sp-match-layout__overlay sp-fallback-table-light" style={lightStyle} />

      <header className="sp-match-utility">{utility}</header>

      <section
        className={`sp-table-stage sp-table-stage--${playerCount}`}
        aria-label="対局状況"
      >
        <div className="sp-table-center">{center}</div>
        {seats.map((seat) => (
          <section
            key={seat.id}
            className="sp-table-seat"
            data-seat-position={seat.position}
            aria-label={seat.position === 'self' ? '自分の席' : '相手の席'}
          >
            {seat.content}
          </section>
        ))}
      </section>

      <section className="sp-self-hand-zone" aria-label="自分の手牌">
        {hand}
      </section>

      <section className="sp-match-action-zone" aria-label="対局の操作">
        {actions}
      </section>

      {messages !== undefined && (
        <aside className="sp-match-message-zone" aria-label="対局のヒントと通知">
          {messages}
        </aside>
      )}
    </main>
  );
}
