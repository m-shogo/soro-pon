import type { ExplainReason, HandCandidate } from '../../domain/candidate';
import type { WinRole } from '../../domain/role';
import type { TileInstance } from '../../domain/tile';
import { categoryNameOf, type DeckIndex } from '../tiles/deckIndex';

export type ExplainCandidateInput = {
  candidate: Pick<
    HandCandidate,
    'state' | 'wildcardAssignments' | 'missingRequirements' | 'blockedReasons'
  >;
  role?: WinRole;
  handTiles: TileInstance[];
  index: DeckIndex;
};

// 候補の事実説明を作る。「best move」「〜すべき」は書かない。
export function explainCandidate(input: ExplainCandidateInput): ExplainReason[] {
  const { candidate, role, index } = input;
  const reasons: ExplainReason[] = [];
  const tileNameOf = (instanceId: string): string => {
    const instance = input.handTiles.find((t) => t.instanceId === instanceId);
    if (!instance) {
      return instanceId;
    }
    return index.tilesById.get(instance.tileId)?.name ?? instance.tileId;
  };

  switch (candidate.state) {
    case 'completed':
      if (role) {
        reasons.push({
          code: 'roleComplete',
          message: `「${role.name}」がそろっています。`,
        });
      }
      break;
    case 'tenpai':
      if (role) {
        reasons.push({
          code: 'oneTileAway',
          message: `「${role.name}」まであと1枚。`,
        });
      }
      break;
    case 'near':
      if (role) {
        const missing = candidate.missingRequirements
          .map((req) => req.message)
          .join(' / ');
        reasons.push({
          code: 'missingGroups',
          message: `「${role.name}」に足りない: ${missing}`,
        });
      }
      break;
    case 'bonusOnly':
      reasons.push({
        code: 'bonusCannotWinAlone',
        message: 'ボーナスだけではあがれません。',
      });
      break;
    case 'invalidButExplainable':
      for (const blocked of candidate.blockedReasons) {
        reasons.push({ code: blocked.code, message: blocked.message });
      }
      break;
  }

  for (const assignment of candidate.wildcardAssignments) {
    const wildcardName = tileNameOf(assignment.wildcardTileInstanceId);
    if (assignment.usedAsTileId) {
      const asName = index.tilesById.get(assignment.usedAsTileId)?.name ?? assignment.usedAsTileId;
      reasons.push({
        code: 'wildcardUsedAs',
        message: `「${wildcardName}」を「${asName}」として使用。`,
      });
    } else if (assignment.usedAsCategoryId) {
      reasons.push({
        code: 'wildcardUsedAs',
        message: `「${wildcardName}」を${categoryNameOf(index, assignment.usedAsCategoryId)}として使用。`,
      });
    } else if (assignment.usedAsTag) {
      reasons.push({
        code: 'wildcardUsedAs',
        message: `「${wildcardName}」をタグ「${assignment.usedAsTag}」として使用。`,
      });
    }
  }

  return reasons;
}
