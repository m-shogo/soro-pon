import type { CSSProperties } from 'react';
import type { DeckProject } from '../../domain/deck';
import type { MatchState } from '../../domain/match';
import type { TileInstance } from '../../domain/tile';
import { Button } from '../components/Button';
import { LanternGlow } from '../primitives/LanternGlow';
import { InkDivider } from '../primitives/InkDivider';
import { PaperPanel } from '../components/PaperPanel';
import { ResultFrame } from '../components/ResultFrame';
import { ScoreBreakdown } from '../components/ScoreBreakdown';
import { TileCard } from '../components/TileCard';

const tileVars = {
  '--tile-w': 'clamp(42px, 3.4vw, 54px)',
  '--tile-h': 'clamp(56px, 4.5vw, 72px)',
} as CSSProperties;

// 対局の全牌からinstanceId->TileInstanceを引く(UIはIDの内部形式に依存しない)
function buildInstanceMap(state: MatchState): Map<string, TileInstance> {
  const map = new Map<string, TileInstance>();
  for (const tile of state.drawPile) map.set(tile.instanceId, tile);
  for (const player of state.players) {
    for (const tile of [...player.hand, ...player.discards]) map.set(tile.instanceId, tile);
  }
  if (state.lastDiscard) map.set(state.lastDiscard.tileInstance.instanceId, state.lastDiscard.tileInstance);
  return map;
}

export function ResultScreen({
  deck,
  state,
  coinsEarned,
  newlyUnlocked = [],
  onRematch,
  onBackToTop,
  onCollection,
}: {
  deck: DeckProject;
  state: MatchState;
  coinsEarned?: number;
  newlyUnlocked?: { id: string; title: string; description: string }[];
  onRematch: () => void;
  onBackToTop: () => void;
  onCollection: () => void;
}) {
  const result = state.result;
  const breakdown = result?.breakdown;
  const winner = state.players.find((player) => player.id === result?.winnerPlayerId);
  const instanceMap = buildInstanceMap(state);
  const categoryById = new Map(deck.categories.map((category) => [category.id, category]));
  const tileDefById = new Map(deck.tiles.map((tile) => [tile.id, tile]));
  const wildcardInstanceIds = new Set(
    breakdown?.wildcardAssignments.map((assignment) => assignment.wildcardTileInstanceId) ?? [],
  );
  const achievementPreview = newlyUnlocked.slice(0, 3);
  const hiddenAchievementCount = Math.max(0, newlyUnlocked.length - achievementPreview.length);

  return (
    <div className="sp-screen sp-result-screen">
      <div className="sp-screen__header">
        <h1 className="sp-screen__title">対戦結果</h1>
      </div>
      <div className="sp-screen__body sp-result-screen__stage sp-result-enter">
        <div className="sp-screen__col sp-screen__col--main sp-screen__col--scroll sp-result-screen__main">
          <ResultFrame
            title={
              result?.reason === 'draw' ? (
                '流局'
              ) : (
                <LanternGlow strength="strong">
                  {result?.reason === 'tsumo' ? 'ツモ' : 'ロン'} — {winner?.name ?? ''}
                </LanternGlow>
              )
            }
          >
            {result?.reason === 'draw' ? (
              <p className="sp-result-screen__draw-copy">山が尽きました。</p>
            ) : (
              breakdown && (
                <>
                  <div className="sp-result-screen__winning-groups">
                    {breakdown.groups.map((group, groupIndex) => (
                      <div key={group.groupId} className="sp-result-screen__winning-group" style={tileVars}>
                        <span>{groupIndex + 1}組目</span>
                        {group.tileInstanceIds.map((instanceId) => {
                          const instance = instanceMap.get(instanceId);
                          const def = instance ? tileDefById.get(instance.tileId) : undefined;
                          const category = def ? categoryById.get(def.primaryCategoryId) : undefined;
                          if (!def) return null;
                          return (
                            <TileCard
                              key={instanceId}
                              name={def.name}
                              {...(def.emoji !== undefined ? { emoji: def.emoji } : {})}
                              fallbackLabel={def.fallbackLabel}
                              {...(category
                                ? { categoryColor: category.color, categoryName: category.name }
                                : {})}
                              showName={false}
                              interactive={false}
                              {...(wildcardInstanceIds.has(instanceId)
                                ? { emphasis: 'tsumo' as const }
                                : {})}
                            />
                          );
                        })}
                      </div>
                    ))}
                  </div>
                  <InkDivider />
                  <ScoreBreakdown breakdown={breakdown} animateTotal />
                  {breakdown.warnings.length > 0 && (
                    <p className="sp-result-screen__warning-copy">
                      {breakdown.warnings.map((warning) => warning.message).join(' / ')}
                    </p>
                  )}
                </>
              )
            )}
          </ResultFrame>
        </div>

        <aside className="sp-screen__col sp-screen__col--side sp-result-screen__side">
          <div className="sp-result-screen__ledger">
            <PaperPanel variant="ink" title="順位">
              <ul className="sp-issue-list">
                {state.players.map((player) => (
                  <li key={player.id}>
                    {player.id === result?.winnerPlayerId ? '★' : '・'} {player.name}
                    {player.id === result?.loserPlayerId ? '(放銃)' : ''}
                  </li>
                ))}
              </ul>
            </PaperPanel>

            {newlyUnlocked.length > 0 && (
              <PaperPanel selected title={`実績解除 ${newlyUnlocked.length}`}>
                <ul className="sp-issue-list sp-result-screen__achievement-list">
                  {achievementPreview.map((achievement) => (
                    <li key={achievement.id}>★ {achievement.title}</li>
                  ))}
                </ul>
                {hiddenAchievementCount > 0 && (
                  <p className="sp-result-screen__more-achievements">
                    ほか {hiddenAchievementCount}件 — 記憶帳で確認
                  </p>
                )}
              </PaperPanel>
            )}

            {coinsEarned !== undefined && (
              <PaperPanel title="記憶コイン">
                <strong className="sp-result-screen__coin-value">+{coinsEarned}</strong>
                <p className="sp-result-screen__coin-note">記録用。対局性能には影響しません。</p>
              </PaperPanel>
            )}
          </div>

          <div className="sp-result-screen__actions" aria-label="対戦結果の次の操作">
            <Button variant="primary" onClick={onRematch}>
              もう一局
            </Button>
            <Button variant="ink" onClick={onCollection}>
              記憶帳を見る
            </Button>
            <Button variant="ink" onClick={onBackToTop}>
              TOPへ
            </Button>
          </div>
        </aside>
      </div>
    </div>
  );
}