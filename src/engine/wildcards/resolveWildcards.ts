import type { WildcardAssignment } from '../../domain/candidate';
import type { CategoryId, TileId } from '../../domain/ids';
import type { TileInstance } from '../../domain/tile';
import { tileDefOf, type DeckIndex } from '../tiles/deckIndex';

// groupの目標ラベル。roleのGroupRequirementから導出する。
export type GroupLabelSpec =
  | { groupType: 'sameTile'; tileId?: TileId }
  | { groupType: 'sameCategory'; categoryId: CategoryId }
  | { groupType: 'sameTag'; tag: string }
  | { groupType: 'specificSet'; tileIds: TileId[] }
  | { groupType: 'freeSet' };

export type WildcardPurpose = 'winRole' | 'specialBonus';

export type ResolveWildcardsInput = {
  instances: TileInstance[];
  label: GroupLabelSpec;
  index: DeckIndex;
  allowWildcard: boolean;
  maxWildcardsPerGroup: number;
  purpose: WildcardPurpose;
};

export type PendingWildcardAssignment = Omit<WildcardAssignment, 'id' | 'groupId'>;

export type WildcardResolution =
  | {
      ok: true;
      wildcardCount: number;
      assignments: PendingWildcardAssignment[];
      resolvedTileId?: TileId;
    }
  | { ok: false };

function multisetSubtract(from: TileId[], remove: TileId[]): TileId[] | null {
  const rest = [...from];
  for (const tileId of remove) {
    const at = rest.indexOf(tileId);
    if (at === -1) {
      return null;
    }
    rest.splice(at, 1);
  }
  return rest;
}

function canUseAsWildcard(
  input: ResolveWildcardsInput,
  instance: TileInstance,
): boolean {
  const behavior = tileDefOf(input.index, instance).wildcard;
  if (!behavior || !input.allowWildcard) {
    return false;
  }
  return input.purpose === 'winRole'
    ? behavior.canCompleteWinRole
    : behavior.canCompleteSpecialBonus;
}

// 牌の組がラベルを満たすかを判定する。
// まず自然成立(wildcard 0枚)を試し、だめならwildcard代用を試す。
// wildcard割当はこの候補グループ限りのもので、最終結果まで確定しない。
export function resolveWildcards(input: ResolveWildcardsInput): WildcardResolution {
  const natural = checkNatural(input);
  if (natural.ok) {
    return natural;
  }

  const wilds = input.instances.filter((instance) => canUseAsWildcard(input, instance));
  if (wilds.length === 0 || wilds.length > input.maxWildcardsPerGroup) {
    return { ok: false };
  }
  const wildIds = new Set(wilds.map((w) => w.instanceId));
  const naturals = input.instances.filter((instance) => !wildIds.has(instance.instanceId));

  const label = input.label;
  switch (label.groupType) {
    case 'sameTile': {
      const tileIds = new Set(naturals.map((t) => t.tileId));
      if (tileIds.size > 1) {
        return { ok: false };
      }
      const resolvedTileId = label.tileId ?? naturals[0]?.tileId;
      if (!resolvedTileId) {
        // 全員wildcardで正体が決められない場合は不成立
        return { ok: false };
      }
      if (naturals.some((t) => t.tileId !== resolvedTileId)) {
        return { ok: false };
      }
      return {
        ok: true,
        wildcardCount: wilds.length,
        resolvedTileId,
        assignments: wilds.map((w) => ({
          wildcardTileInstanceId: w.instanceId,
          usedAsTileId: resolvedTileId,
          source: 'auto',
        })),
      };
    }
    case 'sameCategory': {
      if (
        naturals.some((t) => !tileDefOf(input.index, t).categories.includes(label.categoryId))
      ) {
        return { ok: false };
      }
      return {
        ok: true,
        wildcardCount: wilds.length,
        assignments: wilds.map((w) => ({
          wildcardTileInstanceId: w.instanceId,
          usedAsCategoryId: label.categoryId,
          source: 'auto',
        })),
      };
    }
    case 'sameTag': {
      if (
        naturals.some((t) => !(tileDefOf(input.index, t).tags ?? []).includes(label.tag))
      ) {
        return { ok: false };
      }
      return {
        ok: true,
        wildcardCount: wilds.length,
        assignments: wilds.map((w) => ({
          wildcardTileInstanceId: w.instanceId,
          usedAsTag: label.tag,
          source: 'auto',
        })),
      };
    }
    case 'specificSet': {
      const missing = multisetSubtract(
        [...label.tileIds],
        naturals.map((t) => t.tileId),
      );
      if (missing === null || missing.length !== wilds.length) {
        return { ok: false };
      }
      return {
        ok: true,
        wildcardCount: wilds.length,
        assignments: wilds.map((w, i) => ({
          wildcardTileInstanceId: w.instanceId,
          usedAsTileId: missing[i]!,
          source: 'auto',
        })),
      };
    }
    case 'freeSet': {
      // freeSetはwildcardの代用を必要としない(自然成立で処理済み)
      return { ok: false };
    }
  }
}

function checkNatural(input: ResolveWildcardsInput): WildcardResolution {
  const { instances, label, index } = input;
  switch (label.groupType) {
    case 'sameTile': {
      const first = instances[0];
      if (!first) {
        return { ok: false };
      }
      const tileId = label.tileId ?? first.tileId;
      if (instances.every((t) => t.tileId === tileId)) {
        return { ok: true, wildcardCount: 0, assignments: [], resolvedTileId: tileId };
      }
      return { ok: false };
    }
    case 'sameCategory': {
      if (
        instances.every((t) => tileDefOf(index, t).categories.includes(label.categoryId))
      ) {
        return { ok: true, wildcardCount: 0, assignments: [] };
      }
      return { ok: false };
    }
    case 'sameTag': {
      if (instances.every((t) => (tileDefOf(index, t).tags ?? []).includes(label.tag))) {
        return { ok: true, wildcardCount: 0, assignments: [] };
      }
      return { ok: false };
    }
    case 'specificSet': {
      const rest = multisetSubtract(
        [...label.tileIds],
        instances.map((t) => t.tileId),
      );
      if (rest !== null && rest.length === label.tileIds.length - instances.length) {
        return { ok: true, wildcardCount: 0, assignments: [] };
      }
      return { ok: false };
    }
    case 'freeSet': {
      return { ok: true, wildcardCount: 0, assignments: [] };
    }
  }
}
