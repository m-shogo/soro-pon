import { useMemo, useState } from 'react';
import type { CSSProperties } from 'react';
import type { DeckProject } from '../../domain/deck';
import type { PlayerState } from '../../domain/match';
import type { TileInstance } from '../../domain/tile';
import { Button } from '../components/Button';
import { ActionPanel } from '../components/ActionPanel';
import { GameTableLayout } from '../components/GameTableLayout';
import { Modal } from '../components/Modal';
import { PaperPanel } from '../components/PaperPanel';
import { PlayerPanel } from '../components/PlayerPanel';
import { TileCard } from '../components/TileCard';
import { useResponsiveMetrics } from '../layout/useResponsiveMetrics';
import type { MatchController } from '../hooks/useMatchController';

function TileView({
  tile,
  deck,
  small = false,
  ...tileProps
}: {
  tile: TileInstance;
  deck: DeckProject;
  small?: boolean;
} & Partial<Parameters<typeof TileCard>[0]>) {
  const def = deck.tiles.find((t) => t.id === tile.tileId);
  const category = deck.categories.find((c) => c.id === def?.primaryCategoryId);
  if (!def) {
    return null;
  }
  return (
    <TileCard
      name={def.name}
      {...(def.emoji !== undefined ? { emoji: def.emoji } : {})}
      fallbackLabel={def.fallbackLabel}
      {...(category ? { categoryColor: category.color, categoryName: category.name } : {})}
      showName={!small}
      {...tileProps}
    />
  );
}

const PHASE_LABEL: Record<string, string> = {
  turnStart: '手番の開始',
  draw: '山から1枚引く',
  afterDrawAction: '捨てる牌を選ぶ',
  discardSelect: '捨てる牌を選ぶ',
  reactionRon: 'ロン判定中',
  turnEnd: '次の手番へ',
  roundEnd: '決着',
  result: '結果',
};

export function MatchScreen({
  deck,
  controller,
  onExit,
}: {
  deck: DeckProject;
  controller: MatchController;
  onExit: () => void;
}) {
  const metrics = useResponsiveMetrics();
  const [exitConfirm, setExitConfirm] = useState(false);
  const { state } = controller;
  const human = state.players.find((p) => p.id === controller.humanPlayerId)!;
  const opponents = state.players.filter((p) => p.id !== controller.humanPlayerId);
  const currentPlayer = state.players[state.currentPlayerIndex];

  const layoutVars = useMemo(
    () =>
      ({
        '--tile-w': `${metrics.tileWidth}px`,
        '--tile-h': `${metrics.tileHeight}px`,
        '--tile-gap': `${metrics.tileGap}px`,
      }) as CSSProperties,
    [metrics.tileWidth, metrics.tileHeight, metrics.tileGap],
  );
  const smallTileVars = {
    '--tile-w': `${Math.floor(metrics.tileWidth * 0.55)}px`,
    '--tile-h': `${Math.floor(metrics.tileHeight * 0.55)}px`,
  } as CSSProperties;

  const canSelect =
    controller.isHumanTurn &&
    (state.phase === 'afterDrawAction' || state.phase === 'discardSelect');
  const canDiscard =
    controller.isHumanTurn &&
    state.phase === 'discardSelect' &&
    state.selectedTileInstanceId !== undefined;
  const ronTileId =
    controller.humanRonPending && state.reaction
      ? state.reaction.discardedTile.instanceId
      : undefined;

  const discardBoard = (
    <div
      className={`sp-discard-board${state.players.length === 3 ? ' sp-discard-board--three' : ''}`}
      style={smallTileVars}
    >
      {state.players.map((player: PlayerState) => (
        <div key={player.id} className="sp-discard-pile">
          <span className="sp-discard-pile__label">
            {player.name}の捨て牌 {player.discards.length}
          </span>
          <div className="sp-discard-pile__tiles">
            {player.discards.map((tile) => (
              <TileView
                key={tile.instanceId}
                tile={tile}
                deck={deck}
                small
                disabled
                {...(tile.instanceId === ronTileId ? { emphasis: 'ron' as const } : {})}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div style={layoutVars} data-density={metrics.density}>
      <GameTableLayout
        left={
          <>
            <PaperPanel variant="ink" title="対局">
              <div style={{ fontSize: 'var(--sp-font-xs)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span>残り牌 {state.drawPile.length}</span>
                <span>手番 {currentPlayer?.name ?? '-'}</span>
                <span>{PHASE_LABEL[state.phase] ?? state.phase}</span>
              </div>
            </PaperPanel>
            {controller.insights.length > 0 && (
              <div className="sp-insight-strip">
                {controller.insights.map((insight, i) => (
                  <span key={`${insight.kind}-${i}`} className="sp-insight-strip__item">
                    {insight.message}
                  </span>
                ))}
              </div>
            )}
            {controller.lastError !== null && (
              <div className="sp-insight-strip">
                <span className="sp-insight-strip__item">{controller.lastError}</span>
              </div>
            )}
          </>
        }
        top={
          <>
            {opponents.map((player) => (
              <PlayerPanel
                key={player.id}
                name={player.name}
                kind={player.kind}
                handCount={player.hand.length}
                discardCount={player.discards.length}
                active={player.id === currentPlayer?.id}
              />
            ))}
          </>
        }
        board={discardBoard}
        hand={
          <>
            {human.hand.map((tile) => (
              <TileView
                key={tile.instanceId}
                tile={tile}
                deck={deck}
                selected={tile.instanceId === state.selectedTileInstanceId}
                dimmed={!canSelect}
                disabled={!canSelect}
                onClick={() => controller.selectTile(tile.instanceId)}
              />
            ))}
          </>
        }
        actions={
          <ActionPanel>
            {controller.humanCanTsumo && (
              <Button variant="primary" lantern subLabel="引いた9枚であがる" onClick={controller.declareTsumo}>
                ツモ
              </Button>
            )}
            {controller.humanRonPending && controller.humanCanRon && (
              <>
                <Button variant="primary" lantern subLabel="8枚+捨て牌であがる" onClick={controller.declareRon}>
                  ロン
                </Button>
                <Button variant="ink" subLabel="あがらない" onClick={controller.passRon}>
                  パス
                </Button>
              </>
            )}
            {!controller.humanRonPending && (
              <Button
                variant="primary"
                subLabel="選んだ牌を捨てる"
                disabled={!canDiscard}
                onClick={controller.discardSelected}
              >
                捨てる
              </Button>
            )}
            <Button variant="ghost" onClick={() => setExitConfirm(true)}>
              中断
            </Button>
          </ActionPanel>
        }
      />
      <Modal open={exitConfirm} title="対戦を中断しますか?" onClose={() => setExitConfirm(false)}>
        <p style={{ marginTop: 0, fontSize: 'var(--sp-font-sm)' }}>
          TOPへ戻ると現在の対戦は失われます。
        </p>
        <div style={{ display: 'flex', gap: 'var(--sp-space-8)' }}>
          <Button variant="primary" onClick={onExit}>
            中断してTOPへ
          </Button>
          <Button variant="ghost" onClick={() => setExitConfirm(false)}>
            つづける
          </Button>
        </div>
      </Modal>
    </div>
  );
}
