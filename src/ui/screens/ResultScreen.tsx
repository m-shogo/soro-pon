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

const tileVars = { '--tile-w': '42px', '--tile-h': '56px' } as CSSProperties;

// 対局の全牌からinstanceId->TileInstanceを引く(UIはIDの内部形式に依存しない)
function buildInstanceMap(state: MatchState): Map<string, TileInstance> {
  const map = new Map<string, TileInstance>();
  for (const tile of state.drawPile) {
    map.set(tile.instanceId, tile);
  }
  for (const player of state.players) {
    for (const tile of [...player.hand, ...player.discards]) {
      map.set(tile.instanceId, tile);
    }
  }
  if (state.lastDiscard) {
    map.set(state.lastDiscard.tileInstance.instanceId, state.lastDiscard.tileInstance);
  }
  return map;
}

export function ResultScreen({
  deck,
  state,
  onRematch,
  onBackToTop,
}: {
  deck: DeckProject;
  state: MatchState;
  onRematch: () => void;
  onBackToTop: () => void;
}) {
  const result = state.result;
  const breakdown = result?.breakdown;
  const winner = state.players.find((p) => p.id === result?.winnerPlayerId);
  const instanceMap = buildInstanceMap(state);
  const categoryById = new Map(deck.categories.map((c) => [c.id, c]));
  const tileDefById = new Map(deck.tiles.map((t) => [t.id, t]));
  const wildcardInstanceIds = new Set(
    breakdown?.wildcardAssignments.map((a) => a.wildcardTileInstanceId) ?? [],
  );

  return (
    <div className="sp-screen">
      <div className="sp-screen__header">
        <h1 className="sp-screen__title">対戦結果</h1>
        <span className="sp-screen__subtitle">
          夜の帳が下りた。記憶を積み重ねし者が、今宵の勝者となる。
        </span>
      </div>
      <div className="sp-screen__body">
        <div className="sp-screen__col sp-screen__col--main sp-screen__col--scroll">
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
              <p style={{ fontSize: 'var(--sp-font-sm)' }}>
                山が尽きました。誰の記憶も確定しませんでした。
              </p>
            ) : (
              breakdown && (
                <>
                  <div className="sp-screen__col" style={{ gap: 'var(--sp-space-8)' }}>
                    {breakdown.groups.map((group, groupIndex) => (
                      <div
                        key={group.groupId}
                        style={{ display: 'flex', gap: '6px', alignItems: 'center', ...tileVars }}
                      >
                        <span style={{ fontSize: 'var(--sp-font-xs)', width: '4.5em', color: 'var(--sp-color-ink-soft)' }}>
                          {groupIndex + 1}組目
                        </span>
                        {group.tileInstanceIds.map((instanceId) => {
                          const instance = instanceMap.get(instanceId);
                          const def = instance ? tileDefById.get(instance.tileId) : undefined;
                          const category = def ? categoryById.get(def.primaryCategoryId) : undefined;
                          if (!def) {
                            return null;
                          }
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
                              disabled
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
                  <ScoreBreakdown breakdown={breakdown} />
                  {breakdown.warnings.length > 0 && (
                    <p style={{ fontSize: 'var(--sp-font-xs)', color: 'var(--sp-color-ink-soft)' }}>
                      {breakdown.warnings.map((w) => w.message).join(' / ')}
                    </p>
                  )}
                </>
              )
            )}
          </ResultFrame>
        </div>
        <div className="sp-screen__col sp-screen__col--side">
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
          <Button variant="primary" onClick={onRematch} subLabel="同じメンバーで再戦する">
            もう一局
          </Button>
          <Button variant="ink" onClick={onBackToTop}>
            TOPへ
          </Button>
        </div>
      </div>
    </div>
  );
}
