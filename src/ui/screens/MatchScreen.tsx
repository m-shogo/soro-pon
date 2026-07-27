import { useMemo, useState } from 'react';
import type { CSSProperties } from 'react';
import type { DeckProject } from '../../domain/deck';
import type { PlayerState } from '../../domain/match';
import type { TileInstance } from '../../domain/tile';
import { Button } from '../components/Button';
import { ActionPanel } from '../components/ActionPanel';
import { Dialog } from '../components/Dialog';
import {
  GameTableLayout,
  type TableSeat,
  type TableSeatPosition,
} from '../components/GameTableLayout';
import { PlayerPanel } from '../components/PlayerPanel';
import { TileCard } from '../components/TileCard';
import { useResponsiveMetrics } from '../layout/useResponsiveMetrics';
import { useSkin } from '../skins/useSkin';
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
  const def = deck.tiles.find((item) => item.id === tile.tileId);
  const category = deck.categories.find((item) => item.id === def?.primaryCategoryId);
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
  turnStart: '手番を準備しています',
  draw: '山から1枚引いています',
  afterDrawAction: 'あがるか、捨てる牌を選びます',
  discardSelect: '選んだ牌を捨てます',
  reactionRon: 'ロンできるか確認しています',
  turnEnd: '次の手番へ進みます',
  roundEnd: '対局が決着しました',
  result: '結果を表示します',
};

const FOUR_PLAYER_POSITIONS: TableSeatPosition[] = ['left', 'top', 'right'];
const THREE_PLAYER_POSITIONS: TableSeatPosition[] = ['left', 'right'];

function PlayedTiles({
  player,
  deck,
  ronTileId,
}: {
  player: PlayerState;
  deck: DeckProject;
  ronTileId?: string;
}) {
  return (
    <div className="sp-seat-played" aria-label={`${player.name}の捨て牌`}>
      <div className="sp-seat-played__head">
        <span>捨て牌</span>
        <span>{player.discards.length}枚</span>
      </div>
      <div className="sp-seat-played__tiles">
        {player.discards.length === 0 ? (
          <span className="sp-seat-played__empty">まだありません</span>
        ) : (
          player.discards.map((tile, index) => {
            const newest = index === player.discards.length - 1;
            return (
              <TileView
                key={tile.instanceId}
                tile={tile}
                deck={deck}
                small
                disabled
                className={newest ? 'sp-tile--latest' : undefined}
                aria-label={`${deck.tiles.find((item) => item.id === tile.tileId)?.name ?? '牌'}${newest ? '、最新の捨て牌' : ''}`}
                {...(tile.instanceId === ronTileId ? { emphasis: 'ron' as const } : {})}
              />
            );
          })
        )}
      </div>
    </div>
  );
}

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
  const { activeSkinId } = useSkin();
  const [exitConfirm, setExitConfirm] = useState(false);
  const { state } = controller;
  const human = state.players.find((player) => player.id === controller.humanPlayerId)!;
  const opponents = state.players.filter((player) => player.id !== controller.humanPlayerId);
  const currentPlayer = state.players[state.currentPlayerIndex];
  const playerCount = state.players.length as 3 | 4;

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
    '--tile-w': `${Math.max(24, Math.floor(metrics.tileWidth * 0.48))}px`,
    '--tile-h': `${Math.max(32, Math.floor(metrics.tileHeight * 0.48))}px`,
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

  const positions =
    playerCount === 3 ? THREE_PLAYER_POSITIONS : FOUR_PLAYER_POSITIONS;
  const seats: TableSeat[] = [
    ...opponents.map((player, index) => ({
      id: player.id,
      position: positions[index]!,
      content: (
        <>
          <PlayerPanel
            name={player.name}
            kind={player.kind}
            handCount={player.hand.length}
            discardCount={player.discards.length}
            active={player.id === currentPlayer?.id}
          />
          <div style={smallTileVars}>
            <PlayedTiles player={player} deck={deck} ronTileId={ronTileId} />
          </div>
        </>
      ),
    })),
    {
      id: human.id,
      position: 'self',
      content: (
        <>
          <PlayerPanel
            name={human.name}
            kind={human.kind}
            handCount={human.hand.length}
            discardCount={human.discards.length}
            active={human.id === currentPlayer?.id}
            self
          />
          <div style={smallTileVars}>
            <PlayedTiles player={human} deck={deck} ronTileId={ronTileId} />
          </div>
        </>
      ),
    },
  ];

  const phaseLabel = PHASE_LABEL[state.phase] ?? state.phase;
  const turnLabel = currentPlayer?.name ?? '確認中';

  return (
    <div className="sp-match-screen" style={layoutVars} data-density={metrics.density}>
      <GameTableLayout
        playerCount={playerCount}
        utility={
          <>
            <div className="sp-match-utility__identity">
              <strong>そろぽん対局</strong>
              <span>{playerCount}人戦</span>
              <span>{activeSkinId === 'cute-pop' ? 'Cute Pop' : 'ヨルノシルベ'}</span>
            </div>
            <Button variant="ghost" onClick={() => setExitConfirm(true)}>
              中断
            </Button>
          </>
        }
        center={
          <div className="sp-table-status" role="status" aria-live="polite" aria-atomic="true">
            <span className="sp-table-status__eyebrow">第{state.turnCount + 1}手</span>
            <strong className="sp-table-status__turn">{turnLabel}の手番</strong>
            <span>山 残り{state.drawPile.length}枚</span>
            <span className="sp-table-status__phase">{phaseLabel}</span>
          </div>
        }
        seats={seats}
        hand={human.hand.map((tile) => (
          <TileView
            key={tile.instanceId}
            tile={tile}
            deck={deck}
            selected={tile.instanceId === state.selectedTileInstanceId}
            dimmed={!canSelect}
            disabled={!canSelect}
            className={
              controller.isHumanTurn && tile.instanceId === state.lastDrawnTileInstanceId
                ? 'sp-tile--drawn'
                : undefined
            }
            onClick={() => controller.selectTile(tile.instanceId)}
          />
        ))}
        actions={
          <ActionPanel>
            {controller.humanCanTsumo && (
              <Button
                variant="primary"
                lantern
                subLabel="引いた9枚であがる"
                onClick={controller.declareTsumo}
              >
                ツモ
              </Button>
            )}
            {controller.humanRonPending && controller.humanCanRon && (
              <>
                <Button
                  variant="primary"
                  lantern
                  subLabel="8枚と捨て牌であがる"
                  onClick={controller.declareRon}
                >
                  ロン
                </Button>
                <Button variant="ink" subLabel="今回はあがらない" onClick={controller.passRon}>
                  パス
                </Button>
              </>
            )}
            {!controller.humanRonPending && (
              <Button
                variant="primary"
                subLabel={canDiscard ? '選んだ牌を捨てる' : '先に手牌を選ぶ'}
                disabled={!canDiscard}
                onClick={controller.discardSelected}
              >
                捨てる
              </Button>
            )}
          </ActionPanel>
        }
        messages={
          <>
            {controller.insights.map((insight, index) => (
              <span key={`${insight.kind}-${index}`} className="sp-match-message">
                {insight.message}
              </span>
            ))}
            {controller.lastError !== null && (
              <span className="sp-match-message sp-match-message--error" role="alert">
                {controller.lastError}
              </span>
            )}
          </>
        }
      />
      <Dialog
        open={exitConfirm}
        title="対戦を中断しますか?"
        message="TOPへ戻ると現在の対戦は失われます。"
        confirmLabel="中断してTOPへ"
        cancelLabel="つづける"
        danger
        onConfirm={onExit}
        onCancel={() => setExitConfirm(false)}
      />
    </div>
  );
}
