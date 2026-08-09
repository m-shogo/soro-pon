import { useState } from 'react';
import type { DeckProject } from '../../domain/deck';
import type { DeckVariant } from '../../domain/variant';
import { Button } from '../components/Button';
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
  const totalTiles = deck.tiles.reduce((sum, tile) => sum + tile.count, 0);
  const drawPileCount = totalTiles - playerCount * 8;

  return (
    <div className="sp-screen sp-match-setup">
      <div className="sp-screen__header">
        <h1 className="sp-screen__title">対局設定</h1>
        <span className="sp-screen__subtitle">{deck.name} / {variant.name}</span>
        <div className="sp-screen__spacer" />
        <Button variant="ghost" onClick={onBack}>
          もどる
        </Button>
      </div>

      <div className="sp-screen__body sp-match-setup__body">
        <section className="sp-match-setup__config" aria-labelledby="sp-match-setup-count-title">
          <div className="sp-match-setup__section-head">
            <h2 id="sp-match-setup-count-title">人数を選ぶ</h2>
            <strong>{playerCount}人戦</strong>
          </div>

          <div className="sp-match-setup__count-options" aria-label="対局人数">
            {([3, 4] as const).map((count) => (
              <Button
                key={count}
                variant={playerCount === count ? 'paper' : 'ghost'}
                aria-pressed={playerCount === count}
                disabled={!supported.includes(count)}
                onClick={() => setPlayerCount(count)}
              >
                {count}人戦
              </Button>
            ))}
          </div>

          <dl className="sp-match-setup__rule-rail" aria-label="対局ルール概要">
            <div>
              <dt>手牌</dt>
              <dd>8枚</dd>
            </div>
            <div>
              <dt>あがり</dt>
              <dd>3組</dd>
            </div>
            <div>
              <dt>山</dt>
              <dd>{drawPileCount}枚</dd>
            </div>
          </dl>
        </section>

        <section className="sp-match-setup__players" aria-labelledby="sp-match-setup-members-title">
          <div className="sp-match-setup__section-head">
            <h2 id="sp-match-setup-members-title">面子</h2>
            <span>{playerCount}席</span>
          </div>
          <div className="sp-match-setup__player-grid">
            <PlayerPanel name="あなた" kind="human" handCount={8} discardCount={0} active />
            {cpuNames.map((name) => (
              <PlayerPanel key={name} name={name} kind="cpu" handCount={8} discardCount={0} />
            ))}
          </div>
        </section>

        <div className="sp-match-setup__actions">
          <Button variant="primary" onClick={() => onStart(playerCount)}>
            {playerCount}人戦をはじめる
          </Button>
        </div>
      </div>
    </div>
  );
}
