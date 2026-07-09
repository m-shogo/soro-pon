import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { AnalyzeHandResult, BoardInsight } from '../../domain/candidate';
import type { DeckProject } from '../../domain/deck';
import type { MatchAction, MatchState } from '../../domain/match';
import type { DeckVariant } from '../../domain/variant';
import { analyzeHand } from '../../engine/analysis/analyzeHand';
import { buildBoardInsights } from '../../engine/analysis/buildBoardInsights';
import { applyMatchAction, type MatchContext } from '../../engine/match/applyMatchAction';
import { createInitialMatchState } from '../../engine/match/createInitialMatchState';
import { chooseCpuAction } from '../../engine/cpu/chooseCpuAction';

export type MatchControllerInput = {
  deck: DeckProject;
  variant: DeckVariant;
  playerCount: 3 | 4;
  seed: number;
  insightMode: 'beginner' | 'normal' | 'advanced';
};

export type MatchController = {
  state: MatchState;
  humanPlayerId: string;
  isHumanTurn: boolean;
  /** 人間のロン判定待ちか */
  humanRonPending: boolean;
  humanCanRon: boolean;
  humanCanTsumo: boolean;
  humanAnalysis: AnalyzeHandResult | null;
  insights: BoardInsight[];
  lastError: string | null;
  selectTile: (tileInstanceId: string) => void;
  discardSelected: () => void;
  declareTsumo: () => void;
  declareRon: () => void;
  passRon: () => void;
};

const HUMAN_ID = 'you';
const CPU_NAMES = ['トモリ', 'ナギ', 'ミチル'];
const CPU_DELAY_MS = 550;
const FLOW_DELAY_MS = 250;

function buildInitialState(input: MatchControllerInput, context: MatchContext): MatchState {
  const players = [
    { id: HUMAN_ID, name: 'あなた', kind: 'human' as const },
    ...CPU_NAMES.slice(0, input.playerCount - 1).map((name, i) => ({
      id: `cpu${i + 1}`,
      name,
      kind: 'cpu' as const,
    })),
  ];
  let state = createInitialMatchState({
    deck: input.deck,
    variant: input.variant,
    players,
    seed: input.seed,
  });
  const started = applyMatchAction(state, { type: 'START_MATCH' }, context);
  if (started.ok) {
    state = started.state;
    const dealt = applyMatchAction(state, { type: 'DEAL_COMPLETE' }, context);
    if (dealt.ok) {
      state = dealt.state;
    }
  }
  return state;
}

// 対局進行のUIドライバ。gameplay stateの変更はすべてapplyMatchAction経由。
// UIは役判定/点数計算をせず、engineの解析結果を描画するだけ。
export function useMatchController(input: MatchControllerInput): MatchController {
  const context = useMemo<MatchContext>(
    () => ({ deck: input.deck, variant: input.variant }),
    [input.deck, input.variant],
  );
  const [state, setState] = useState<MatchState>(() => buildInitialState(input, context));
  const [lastError, setLastError] = useState<string | null>(null);
  const timerRef = useRef<number | null>(null);

  const dispatch = useCallback(
    (action: MatchAction) => {
      setState((current) => {
        const result = applyMatchAction(current, action, context);
        if (!result.ok) {
          setLastError(result.error.message);
          return current;
        }
        setLastError(null);
        return result.state;
      });
    },
    [context],
  );

  const humanPlayer = state.players.find((p) => p.id === HUMAN_ID);
  const currentPlayer = state.players[state.currentPlayerIndex];
  const isHumanTurn = currentPlayer?.id === HUMAN_ID;
  const reactionHead = state.reaction?.pendingPlayerIds[0];
  const humanRonPending = state.phase === 'reactionRon' && reactionHead === HUMAN_ID;

  // 人間の手牌解析(表示・ボタン活性用)
  const humanAnalysis = useMemo<AnalyzeHandResult | null>(() => {
    if (!humanPlayer || humanPlayer.hand.length === 0) {
      return null;
    }
    if (humanRonPending && state.reaction) {
      return analyzeHand({
        deck: input.deck,
        variant: input.variant,
        handTiles: [...humanPlayer.hand, state.reaction.discardedTile],
        context: 'ronCheckNineTiles',
        ronTileInstanceId: state.reaction.discardedTile.instanceId,
      });
    }
    const context9 = humanPlayer.hand.length === 9;
    return analyzeHand({
      deck: input.deck,
      variant: input.variant,
      handTiles: humanPlayer.hand,
      context: context9 ? 'afterDrawNineTiles' : 'afterDiscardEightTiles',
    });
  }, [humanPlayer, humanRonPending, state.reaction, input.deck, input.variant]);

  const humanCanTsumo =
    isHumanTurn &&
    state.phase === 'afterDrawAction' &&
    (humanAnalysis?.candidates.some((c) => c.canTsumo) ?? false);
  const humanCanRon =
    humanRonPending && (humanAnalysis?.candidates.some((c) => c.canRon) ?? false);

  const insights = useMemo<BoardInsight[]>(() => {
    if (!humanPlayer || humanPlayer.hand.length === 0 || state.phase === 'result') {
      return [];
    }
    return buildBoardInsights({
      deck: input.deck,
      variant: input.variant,
      handTiles: humanPlayer.hand,
      context: humanPlayer.hand.length === 9 ? 'afterDrawNineTiles' : 'afterDiscardEightTiles',
      mode: input.insightMode,
    });
  }, [humanPlayer, state.phase, input.deck, input.variant, input.insightMode]);

  // 自動進行: CPUの手番/リアクション、フェーズの機械的遷移
  useEffect(() => {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    const schedule = (action: MatchAction, delay: number) => {
      timerRef.current = window.setTimeout(() => dispatch(action), delay);
    };

    switch (state.phase) {
      case 'turnStart':
        schedule({ type: 'START_TURN' }, FLOW_DELAY_MS);
        return;
      case 'draw':
        // 人間も自動で1枚引く(ドンジャラ流: 引いて9枚になってから選ぶ)
        schedule({ type: 'DRAW_TILE' }, isHumanTurn ? FLOW_DELAY_MS : CPU_DELAY_MS);
        return;
      case 'afterDrawAction':
      case 'discardSelect': {
        if (!isHumanTurn && currentPlayer) {
          schedule(
            chooseCpuAction({
              state,
              deck: input.deck,
              variant: input.variant,
              playerId: currentPlayer.id,
            }),
            CPU_DELAY_MS,
          );
        }
        return;
      }
      case 'reactionRon': {
        if (!reactionHead) {
          return;
        }
        if (reactionHead !== HUMAN_ID) {
          schedule(
            chooseCpuAction({
              state,
              deck: input.deck,
              variant: input.variant,
              playerId: reactionHead,
            }),
            CPU_DELAY_MS,
          );
        } else if (!humanCanRon) {
          // ロンできないなら自動でパス(待たせない)
          schedule({ type: 'PASS_RON', playerId: HUMAN_ID }, FLOW_DELAY_MS);
        }
        return;
      }
      case 'turnEnd':
        schedule(
          state.drawPile.length === 0 ? { type: 'DRAW_PILE_EMPTY' } : { type: 'NEXT_TURN' },
          FLOW_DELAY_MS,
        );
        return;
      case 'roundEnd':
        schedule({ type: 'SHOW_RESULT' }, 900);
        return;
      default:
        return;
    }
  }, [state, isHumanTurn, currentPlayer, reactionHead, humanCanRon, dispatch, input.deck, input.variant]);

  useEffect(
    () => () => {
      if (timerRef.current !== null) {
        window.clearTimeout(timerRef.current);
      }
    },
    [],
  );

  return {
    state,
    humanPlayerId: HUMAN_ID,
    isHumanTurn,
    humanRonPending,
    humanCanRon,
    humanCanTsumo,
    humanAnalysis,
    insights,
    lastError,
    selectTile: (tileInstanceId) => {
      dispatch(
        state.phase === 'afterDrawAction'
          ? { type: 'SELECT_TILE', playerId: HUMAN_ID, tileInstanceId }
          : { type: 'CHANGE_SELECTED_TILE', playerId: HUMAN_ID, tileInstanceId },
      );
    },
    discardSelected: () => dispatch({ type: 'DISCARD_TILE', playerId: HUMAN_ID }),
    declareTsumo: () => dispatch({ type: 'DECLARE_TSUMO', playerId: HUMAN_ID }),
    declareRon: () => dispatch({ type: 'DECLARE_RON', playerId: HUMAN_ID }),
    passRon: () => dispatch({ type: 'PASS_RON', playerId: HUMAN_ID }),
  };
}
