import type {
  DiscardImpactResult,
  ExplainReason,
} from '../../domain/candidate';
import type { DeckProject } from '../../domain/deck';
import type { TileInstance } from '../../domain/tile';
import type { DeckVariant } from '../../domain/variant';
import { buildDeckIndex, tileDefOf } from '../tiles/deckIndex';
import { analyzeHandDetailed } from './analyzeHand';
import { analyzeWaits } from './analyzeWaits';

export type AnalyzeDiscardImpactInput = {
  deck: DeckProject;
  variant: DeckVariant;
  /** draw後の9枚 */
  handTiles: TileInstance[];
  /** 指定がなければ全牌をプレビューする */
  tileInstanceIds?: string[];
};

// 「この牌を捨てたら何が変わるか」の純粋な分析。
// match stateには一切触れない。UIのプレビュー専用。
export function analyzeDiscardImpact(
  input: AnalyzeDiscardImpactInput,
): DiscardImpactResult[] {
  const { deck, variant, handTiles } = input;
  const index = buildDeckIndex(deck);

  const current = analyzeHandDetailed({
    deck,
    variant,
    handTiles,
    context: 'afterDrawNineTiles',
  });
  const completedCandidates = current.result.candidates.filter(
    (c) => c.roleKind === 'win_role' && c.state === 'completed',
  );

  const targets =
    input.tileInstanceIds ?? handTiles.map((t) => t.instanceId);

  return targets.map((tileInstanceId) => {
    const remaining = handTiles.filter((t) => t.instanceId !== tileInstanceId);
    const after = analyzeHandDetailed({
      deck,
      variant,
      handTiles: remaining,
      context: 'afterDiscardEightTiles',
    });
    // 捨てた後にtenpaiで残る役 = 待ちが維持される候補
    const keepsCandidateIds = after.result.candidates
      .filter((c) => c.roleKind === 'win_role' && c.state === 'tenpai')
      .map((c) => c.candidateId);

    // 現在の完成形は、その使用牌を捨てると必ず崩れる
    const breaksCandidateIds = completedCandidates
      .filter((c) => c.usedTileInstanceIds.includes(tileInstanceId))
      .map((c) => c.candidateId);

    // 「浮いている牌」= 完成形に使われておらず、捨てても待ちが残る
    const usedByCompleted = completedCandidates.some((c) =>
      c.usedTileInstanceIds.includes(tileInstanceId),
    );
    const usedByLiveCandidate = usedByCompleted || keepsCandidateIds.length === 0;

    const resultingWaits = analyzeWaits({
      deck,
      variant,
      handTiles: remaining,
      context: 'afterDiscardEightTiles',
    });

    const tile = handTiles.find((t) => t.instanceId === tileInstanceId);
    const tileName = tile ? (tileDefOf(index, tile).name ?? tile.tileId) : tileInstanceId;
    const facts: ExplainReason[] = [];
    if (breaksCandidateIds.length > 0) {
      facts.push({
        code: 'discardBreaks',
        message: `「${tileName}」を捨てると候補${breaksCandidateIds.length}件が崩れます。`,
      });
    }
    if (keepsCandidateIds.length > 0) {
      facts.push({
        code: 'discardKeepsWait',
        message: `「${tileName}」を捨てても待ちが${keepsCandidateIds.length}件残ります。`,
      });
    }
    if (!usedByLiveCandidate) {
      facts.push({
        code: 'discardUnusedTile',
        message: `「${tileName}」は現在の主要候補に使われていません。`,
      });
    }

    return {
      tileInstanceId,
      breaksCandidateIds,
      keepsCandidateIds,
      removesUnusedTile: !usedByLiveCandidate,
      resultingWaits,
      facts,
    };
  });
}
