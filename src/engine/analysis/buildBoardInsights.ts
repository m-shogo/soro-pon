import type {
  BoardInsight,
  InsightDisplayMode,
  WaitContext,
} from '../../domain/candidate';
import type { DeckProject } from '../../domain/deck';
import type { TileInstance } from '../../domain/tile';
import type { DeckVariant } from '../../domain/variant';
import { ENGINE_LIMITS } from '../engineLimits';
import { analyzeHandDetailed } from './analyzeHand';

export type BuildBoardInsightsInput = {
  deck: DeckProject;
  variant: DeckVariant;
  handTiles: TileInstance[];
  context: WaitContext;
  mode: InsightDisplayMode;
  ronTileInstanceId?: string;
};

// 事実のみのinsightを優先度順に返す。
// 「最善手」「正しい捨て牌」「〜を狙うべき」は絶対に出さない。
export function buildBoardInsights(input: BuildBoardInsightsInput): BoardInsight[] {
  const { analyzed, result } = analyzeHandDetailed({
    deck: input.deck,
    variant: input.variant,
    handTiles: input.handTiles,
    context: input.context,
    ...(input.ronTileInstanceId !== undefined
      ? { ronTileInstanceId: input.ronTileInstanceId }
      : {}),
  });

  const insights: BoardInsight[] = [];
  const roleNameOf = (roleId: string | undefined): string =>
    input.variant.winRoles.find((r) => r.id === roleId)?.name ??
    input.variant.specialBonuses.find((b) => b.id === roleId)?.name ??
    '';

  for (const { candidate, waits } of analyzed) {
    switch (candidate.state) {
      case 'completed': {
        if (candidate.canTsumo || candidate.canRon) {
          insights.push({
            kind: 'canWin',
            priority: 100,
            message: `「${roleNameOf(candidate.winRoleId)}」であがれます。`,
            relatedCandidateId: candidate.candidateId,
          });
        }
        break;
      }
      case 'tenpai': {
        const waitMessage = waits[0]?.message ?? 'あと1枚';
        insights.push({
          kind: 'oneTileAway',
          priority: 80,
          message: `「${roleNameOf(candidate.winRoleId)}」まで${waitMessage}。`,
          relatedCandidateId: candidate.candidateId,
        });
        break;
      }
      case 'near': {
        const missing = candidate.missingRequirements[0]?.message;
        if (missing) {
          insights.push({
            kind: 'incompleteGroup',
            priority: 30,
            message: `「${roleNameOf(candidate.winRoleId)}」: ${missing}。`,
            relatedCandidateId: candidate.candidateId,
          });
        }
        break;
      }
      case 'bonusOnly': {
        insights.push({
          kind: 'bonusOnlyCannotWin',
          priority: 40,
          message: `「${roleNameOf(candidate.winRoleId)}」はボーナスなので、これだけではあがれません。`,
          relatedCandidateId: candidate.candidateId,
        });
        break;
      }
      case 'invalidButExplainable': {
        const reason = candidate.blockedReasons[0];
        if (reason) {
          insights.push({
            kind: 'actionBlocked',
            priority: 60,
            message: reason.message,
            relatedCandidateId: candidate.candidateId,
          });
        }
        break;
      }
    }

    for (const reason of candidate.explainReasons) {
      if (reason.code === 'wildcardUsedAs') {
        insights.push({
          kind: 'wildcardUsedAs',
          priority: 50,
          message: reason.message,
          relatedCandidateId: candidate.candidateId,
        });
      }
    }
  }

  if (result.analyzerWarnings.some((w) => w.capped)) {
    insights.push({
      kind: 'analysisCapped',
      priority: 20,
      message: '候補が多いため、一部の解析を省略しています。',
    });
  }

  insights.sort((a, b) => b.priority - a.priority);

  switch (input.mode) {
    case 'beginner':
      return insights.slice(0, 1);
    case 'normal':
      return insights.slice(0, ENGINE_LIMITS.maxPrimaryInsights);
    case 'advanced':
      return insights;
  }
}
