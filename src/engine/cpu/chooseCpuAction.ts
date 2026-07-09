import type { DeckProject } from '../../domain/deck';
import type { MatchAction, MatchState } from '../../domain/match';
import type { PlayerId } from '../../domain/ids';
import type { DeckVariant } from '../../domain/variant';
import { analyzeDiscardImpact } from '../analysis/analyzeDiscardImpact';
import { analyzeHand } from '../analysis/analyzeHand';
import { calculateScore } from '../scoring/calculateScore';
import { createSeededRng } from '../rng/createSeededRng';
import { tileDefOf, buildDeckIndex } from '../tiles/deckIndex';

export type ChooseCpuActionInput = {
  state: MatchState;
  deck: DeckProject;
  variant: DeckVariant;
  playerId: PlayerId;
};

// CPUの最小方針(docs/27):
// 1. ツモであがれるならあがる 2. ロンできるならロンする
// 3. 待ちが残る捨て牌を選ぶ 4. wildcardはできるだけ残す 5. 同点はseed付きランダム
// CPUは自分の手牌と公開情報だけを使う。相手の手牌は見ない。
export function chooseCpuAction(input: ChooseCpuActionInput): MatchAction {
  const { state, deck, variant, playerId } = input;
  const player = state.players.find((p) => p.id === playerId);
  if (!player) {
    throw new Error(`unknown player: ${playerId}`);
  }

  switch (state.phase) {
    case 'draw': {
      return { type: 'DRAW_TILE' };
    }

    case 'afterDrawAction': {
      const analysis = analyzeHand({
        deck,
        variant,
        handTiles: player.hand,
        context: 'afterDrawNineTiles',
      });
      if (analysis.candidates.some((c) => c.canTsumo)) {
        return { type: 'DECLARE_TSUMO', playerId };
      }
      const tileInstanceId = chooseDiscard(input, player.hand);
      return { type: 'SELECT_TILE', playerId, tileInstanceId };
    }

    case 'discardSelect': {
      return { type: 'DISCARD_TILE', playerId };
    }

    case 'reactionRon': {
      const reaction = state.reaction;
      if (!reaction) {
        throw new Error('reactionRon phase without reaction state');
      }
      const score = calculateScore({
        deck,
        variant,
        handTiles: [...player.hand, reaction.discardedTile],
        winMethod: 'ron',
        winnerPlayerId: playerId,
        ronTileInstanceId: reaction.discardedTile.instanceId,
      });
      if (score.ok) {
        return { type: 'DECLARE_RON', playerId };
      }
      return { type: 'PASS_RON', playerId };
    }

    default:
      throw new Error(`chooseCpuAction does not handle phase: ${state.phase}`);
  }
}

function chooseDiscard(
  input: ChooseCpuActionInput,
  hand: MatchState['players'][number]['hand'],
): string {
  const { state, deck, variant } = input;
  const index = buildDeckIndex(deck);
  const impacts = analyzeDiscardImpact({ deck, variant, handTiles: hand });

  // 各捨て牌候補を評価: 残る待ちが多い > 崩す候補が少ない > wildcardでない
  let bestScore = -Infinity;
  let bestIds: string[] = [];
  for (const impact of impacts) {
    const tile = hand.find((t) => t.instanceId === impact.tileInstanceId)!;
    const isWildcard = tileDefOf(index, tile).wildcard !== undefined;
    const score =
      impact.keepsCandidateIds.length * 100 -
      impact.breaksCandidateIds.length * 10 -
      (isWildcard ? 1000 : 0);
    if (score > bestScore) {
      bestScore = score;
      bestIds = [impact.tileInstanceId];
    } else if (score === bestScore) {
      bestIds.push(impact.tileInstanceId);
    }
  }

  // 同点はseed付きで決定的に選ぶ
  const sorted = [...bestIds].sort();
  const rng = createSeededRng(state.seed + state.turnCount * 31);
  return sorted[rng.nextInt(sorted.length)]!;
}
