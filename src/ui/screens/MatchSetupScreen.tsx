import { useState } from 'react';
import type { DeckProject } from '../../domain/deck';
import type { DeckVariant } from '../../domain/variant';
import { Button } from '../components/Button';
import { PaperPanel } from '../components/PaperPanel';
import { PlayerPanel } from '../components/PlayerPanel';

export function MatchSetupScreen({
  deck,
  variant,
  onStart,
  onBack,
}: {
  deck: DeckProject;
  variant: DeckVariant;
  onStart: (playerCount: 3 | 4) => void;
  onBack: () => void;
}) {
  const supported = variant.ruleConfig.supportedPlayerCounts;
  const [playerCount, setPlayerCount] = useState<3 | 4>(supported[0] ?? 3);
  const cpuNames = ['トモリ', 'ナギ', 'ミチル'].slice(0, playerCount - 1);
  const totalTiles = deck.tiles.reduce((sum, t) => sum + t.count, 0);

  return (
    <div className="sp-screen">
      <div className="sp-screen__header">
        <h1 className="sp-screen__title">対局設定</h1>
        <span className="sp-screen__subtitle">{deck.name} / {variant.name}</span>
        <div className="sp-screen__spacer" />
        <Button variant="ghost" onClick={onBack}>
          もどる
        </Button>
      </div>
      <div className="sp-screen__body" style={{ alignItems: 'stretch' }}>
        <div
          className="sp-screen__col sp-screen__col--scroll"
          style={{ width: 'min(380px, 44%)' }}
        >
          <PaperPanel title="人数">
            <div style={{ display: 'flex', gap: 'var(--sp-space-8)' }}>
              {([3, 4] as const).map((count) => (
                <Button
                  key={count}
                  variant={playerCount === count ? 'paper' : 'ghost'}
                  disabled={!supported.includes(count)}
                  onClick={() => setPlayerCount(count)}
                >
                  {count}人戦
                </Button>
              ))}
            </div>
            <p style={{ fontSize: 'var(--sp-font-xs)', color: 'var(--sp-color-ink-soft)' }}>
              手牌8枚 / 引いて9枚 / 3枚グループ×3組であがり。山 {totalTiles - playerCount * 8} 枚。
            </p>
          </PaperPanel>
          <PaperPanel variant="aged" title="面子">
            <div className="sp-screen__col" style={{ gap: 'var(--sp-space-6)' }}>
              <PlayerPanel name="あなた" kind="human" handCount={8} discardCount={0} active />
              {cpuNames.map((name) => (
                <PlayerPanel key={name} name={name} kind="cpu" handCount={8} discardCount={0} />
              ))}
            </div>
          </PaperPanel>
          <Button variant="primary" onClick={() => onStart(playerCount)}>
            対局開始
          </Button>
        </div>
        <div className="sp-screen__spacer" />
      </div>
    </div>
  );
}
