import type { DeckProject } from '../../domain/deck';
import type {
  EngineError,
  MatchAction,
  MatchActionResult,
  MatchEvent,
  MatchState,
  PlayerState,
} from '../../domain/match';
import type { TileInstance } from '../../domain/tile';
import type { DeckVariant } from '../../domain/variant';
import { analyzeHand } from '../analysis/analyzeHand';
import { calculateScore } from '../scoring/calculateScore';
import { createSeededRng, shuffleWithRng } from '../rng/createSeededRng';
import { createTileInstances } from '../tiles/createTileInstances';

// reducerが解析に使う静的な対局コンテキスト。
// MatchStateはID参照のみを持ち、deck本体はここから渡す。
export type MatchContext = {
  deck: DeckProject;
  variant: DeckVariant;
};

function fail(state: MatchState, code: string, message: string, action?: string): MatchActionResult {
  const error: EngineError = { code, message, ...(action !== undefined ? { action } : {}) };
  return { ok: false, state, error };
}

function invalidPhase(state: MatchState, action: MatchAction): MatchActionResult {
  return fail(
    state,
    'E7001',
    `phase "${state.phase}" では ${action.type} は実行できません。`,
    action.type,
  );
}

function currentPlayer(state: MatchState): PlayerState {
  return state.players[state.currentPlayerIndex]!;
}

// 捨てた人の次の席から順のロン判定順序(MVP: 最初に成立した1人だけ)
function ronCheckOrder(state: MatchState, discardOwnerIndex: number): string[] {
  const order: string[] = [];
  for (let i = 1; i < state.players.length; i++) {
    order.push(state.players[(discardOwnerIndex + i) % state.players.length]!.id);
  }
  return order;
}

// gameplay stateを変更できる唯一の入口。
// 不正なactionはok:falseと元のstateを返し、絶対にmutateしない。
export function applyMatchAction(
  state: MatchState,
  action: MatchAction,
  context: MatchContext,
): MatchActionResult {
  switch (action.type) {
    case 'START_MATCH': {
      if (state.phase !== 'setup') {
        return invalidPhase(state, action);
      }
      const playerCount = state.players.length;
      if (playerCount === 2) {
        return fail(state, 'E7005', 'soro-ponは3〜4人用です。2人戦はできません。');
      }
      if (playerCount < 3 || playerCount > 4) {
        return fail(state, 'E7005', `${playerCount}人では対局できません。3人か4人で始めてください。`);
      }
      const supported = context.variant.ruleConfig.supportedPlayerCounts as number[];
      if (!supported.includes(playerCount)) {
        return fail(
          state,
          'V3004',
          `このvariantは${supported.join('/')}人戦のみ対応です。`,
        );
      }
      if (context.variant.ruleConfig.evaluationMode !== 'normalThreeGroups') {
        return fail(state, 'E7008', '拡張ルールのエンジンは未対応です。');
      }
      const handSize = context.variant.ruleConfig.handSizeNormal;
      const allInstances = createTileInstances({ tiles: context.deck.tiles });
      if (allInstances.length < playerCount * handSize + 1) {
        return fail(
          state,
          'V3002',
          `牌が${allInstances.length}枚しかなく、${playerCount}人に配れません。`,
        );
      }
      const rng = createSeededRng(state.seed);
      const shuffled = shuffleWithRng(allInstances, rng);
      const players = state.players.map((player, i) => ({
        ...player,
        hand: shuffled
          .slice(i * handSize, (i + 1) * handSize)
          .map((t) => ({ ...t, location: 'hand' as const, ownerPlayerId: player.id })),
        discards: [],
      }));
      const drawPile = shuffled.slice(playerCount * handSize);
      const events: MatchEvent[] = [{ type: 'matchStarted' }];
      return {
        ok: true,
        state: { ...state, players, drawPile, phase: 'deal', turnCount: 0, currentPlayerIndex: 0 },
        events,
      };
    }

    case 'DEAL_COMPLETE': {
      if (state.phase !== 'deal') {
        return invalidPhase(state, action);
      }
      return {
        ok: true,
        state: { ...state, phase: 'turnStart' },
        events: [{ type: 'handsDealt' }],
      };
    }

    case 'START_TURN': {
      if (state.phase !== 'turnStart') {
        return invalidPhase(state, action);
      }
      return {
        ok: true,
        state: { ...state, phase: 'draw' },
        events: [{ type: 'turnStarted', playerId: currentPlayer(state).id }],
      };
    }

    case 'DRAW_TILE': {
      if (state.phase !== 'draw') {
        return invalidPhase(state, action);
      }
      const player = currentPlayer(state);
      if (player.hand.length >= context.variant.ruleConfig.handSizeAfterDraw) {
        return fail(state, 'E7001', 'すでに9枚持っています。');
      }
      const drawn = state.drawPile[0];
      if (!drawn) {
        return fail(state, 'E7006', '山が空です。流局処理が必要です。');
      }
      const drawnInHand: TileInstance = {
        ...drawn,
        location: 'hand',
        ownerPlayerId: player.id,
      };
      const players = state.players.map((p) =>
        p.id === player.id ? { ...p, hand: [...p.hand, drawnInHand] } : p,
      );
      const nextState: MatchState = {
        ...state,
        players,
        drawPile: state.drawPile.slice(1),
        phase: 'afterDrawAction',
        lastDrawnTileInstanceId: drawn.instanceId,
      };
      const events: MatchEvent[] = [
        { type: 'tileDrawn', playerId: player.id, tileInstanceId: drawn.instanceId },
      ];
      const analysis = analyzeHand({
        deck: context.deck,
        variant: context.variant,
        handTiles: players.find((p) => p.id === player.id)!.hand,
        context: 'afterDrawNineTiles',
      });
      if (analysis.candidates.some((c) => c.canTsumo)) {
        events.push({ type: 'tsumoAvailable', playerId: player.id });
      }
      return { ok: true, state: nextState, events };
    }

    case 'DECLARE_TSUMO': {
      if (state.phase !== 'afterDrawAction') {
        return invalidPhase(state, action);
      }
      const player = currentPlayer(state);
      if (action.playerId !== player.id) {
        return fail(state, 'E7001', '自分の番ではありません。');
      }
      const score = calculateScore({
        deck: context.deck,
        variant: context.variant,
        handTiles: player.hand,
        winMethod: 'tsumo',
        winnerPlayerId: player.id,
      });
      if (!score.ok) {
        return fail(state, score.error.code, score.error.message, action.type);
      }
      return {
        ok: true,
        state: {
          ...state,
          phase: 'roundEnd',
          result: {
            reason: 'tsumo',
            winnerPlayerId: player.id,
            breakdown: score.breakdown,
          },
        },
        events: [{ type: 'roundEnded', reason: 'tsumo' }],
      };
    }

    case 'SELECT_TILE':
    case 'CHANGE_SELECTED_TILE': {
      const validPhase =
        action.type === 'SELECT_TILE' ? 'afterDrawAction' : 'discardSelect';
      if (state.phase !== validPhase) {
        return invalidPhase(state, action);
      }
      const player = currentPlayer(state);
      if (action.playerId !== player.id) {
        return fail(state, 'E7001', '自分の番ではありません。');
      }
      if (!player.hand.some((t) => t.instanceId === action.tileInstanceId)) {
        return fail(state, 'E7002', '選択した牌が手牌にありません。');
      }
      return {
        ok: true,
        state: {
          ...state,
          phase: 'discardSelect',
          selectedTileInstanceId: action.tileInstanceId,
        },
        events: [
          { type: 'tileSelected', playerId: player.id, tileInstanceId: action.tileInstanceId },
        ],
      };
    }

    case 'DISCARD_TILE': {
      if (state.phase !== 'discardSelect') {
        return invalidPhase(state, action);
      }
      const player = currentPlayer(state);
      if (action.playerId !== player.id) {
        return fail(state, 'E7001', '自分の番ではありません。');
      }
      const selectedId = state.selectedTileInstanceId;
      const tile = player.hand.find((t) => t.instanceId === selectedId);
      if (!selectedId || !tile) {
        return fail(state, 'E7002', '捨てる牌が選択されていません。');
      }
      const discarded: TileInstance = { ...tile, location: 'discard' };
      const players = state.players.map((p) =>
        p.id === player.id
          ? {
              ...p,
              hand: p.hand.filter((t) => t.instanceId !== selectedId),
              discards: [...p.discards, discarded],
            }
          : p,
      );
      const pending = ronCheckOrder(state, state.currentPlayerIndex);
      const nextState: MatchState = {
        ...state,
        players,
        phase: 'reactionRon',
        lastDiscard: { tileInstance: discarded, ownerPlayerId: player.id },
        reaction: {
          type: 'ron',
          discardOwnerId: player.id,
          discardedTile: discarded,
          pendingPlayerIds: pending,
        },
      };
      delete (nextState as Partial<MatchState>).selectedTileInstanceId;
      const events: MatchEvent[] = [
        { type: 'tileDiscarded', playerId: player.id, tileInstanceId: discarded.instanceId },
      ];
      // 席順に各プレイヤーのロン可否を通知(UI/CPU用の事実。最初の成立者だけがロンできる)
      for (const candidateId of pending) {
        const reactor = players.find((p) => p.id === candidateId)!;
        const score = calculateScore({
          deck: context.deck,
          variant: context.variant,
          handTiles: [...reactor.hand, discarded],
          winMethod: 'ron',
          winnerPlayerId: reactor.id,
          ronTileInstanceId: discarded.instanceId,
        });
        if (score.ok) {
          events.push({ type: 'ronAvailable', playerId: reactor.id });
        }
      }
      return { ok: true, state: nextState, events };
    }

    case 'DECLARE_RON': {
      if (state.phase !== 'reactionRon' || !state.reaction) {
        return invalidPhase(state, action);
      }
      const head = state.reaction.pendingPlayerIds[0];
      if (action.playerId !== head) {
        return fail(state, 'E7001', 'ロン判定の順番ではありません。');
      }
      const reactor = state.players.find((p) => p.id === action.playerId)!;
      const score = calculateScore({
        deck: context.deck,
        variant: context.variant,
        handTiles: [...reactor.hand, state.reaction.discardedTile],
        winMethod: 'ron',
        winnerPlayerId: reactor.id,
        ronTileInstanceId: state.reaction.discardedTile.instanceId,
      });
      if (!score.ok) {
        return fail(state, score.error.code, score.error.message, action.type);
      }
      return {
        ok: true,
        state: {
          ...state,
          phase: 'roundEnd',
          result: {
            reason: 'ron',
            winnerPlayerId: reactor.id,
            loserPlayerId: state.reaction.discardOwnerId,
            breakdown: score.breakdown,
          },
        },
        events: [{ type: 'roundEnded', reason: 'ron' }],
      };
    }

    case 'PASS_RON': {
      if (state.phase !== 'reactionRon' || !state.reaction) {
        return invalidPhase(state, action);
      }
      const head = state.reaction.pendingPlayerIds[0];
      if (action.playerId !== head) {
        return fail(state, 'E7001', 'ロン判定の順番ではありません。');
      }
      const remaining = state.reaction.pendingPlayerIds.slice(1);
      if (remaining.length > 0) {
        return {
          ok: true,
          state: {
            ...state,
            reaction: { ...state.reaction, pendingPlayerIds: remaining },
          },
          events: [],
        };
      }
      const nextState: MatchState = { ...state, phase: 'turnEnd' };
      delete (nextState as Partial<MatchState>).reaction;
      return { ok: true, state: nextState, events: [] };
    }

    case 'NEXT_TURN': {
      if (state.phase !== 'turnEnd') {
        return invalidPhase(state, action);
      }
      if (state.drawPile.length === 0) {
        return fail(state, 'E7006', '山が空です。DRAW_PILE_EMPTYで流局してください。');
      }
      return {
        ok: true,
        state: {
          ...state,
          phase: 'turnStart',
          currentPlayerIndex: (state.currentPlayerIndex + 1) % state.players.length,
          turnCount: state.turnCount + 1,
        },
        events: [],
      };
    }

    case 'DRAW_PILE_EMPTY': {
      if (state.phase !== 'turnEnd') {
        return invalidPhase(state, action);
      }
      if (state.drawPile.length > 0) {
        return fail(state, 'E7001', '山がまだ残っています。');
      }
      return {
        ok: true,
        state: { ...state, phase: 'roundEnd', result: { reason: 'draw' } },
        events: [{ type: 'roundEnded', reason: 'draw' }],
      };
    }

    case 'SHOW_RESULT': {
      if (state.phase !== 'roundEnd') {
        return invalidPhase(state, action);
      }
      return {
        ok: true,
        state: { ...state, phase: 'result' },
        events: [{ type: 'resultShown' }],
      };
    }

    case 'NEW_MATCH': {
      if (state.phase !== 'result') {
        return invalidPhase(state, action);
      }
      // 同じ面子で新しい対局へ。seedを進めて次のシャッフルを変える
      const reset: MatchState = {
        deckProjectId: state.deckProjectId,
        variantId: state.variantId,
        seed: state.seed + 1,
        players: state.players.map((p) => ({ ...p, hand: [], discards: [] })),
        drawPile: [],
        currentPlayerIndex: 0,
        turnCount: 0,
        phase: 'setup',
      };
      return { ok: true, state: reset, events: [] };
    }
  }
}
