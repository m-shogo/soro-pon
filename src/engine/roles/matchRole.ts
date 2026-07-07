import type {
  BlockedReason,
  MissingRequirement,
  WildcardAssignment,
} from '../../domain/candidate';
import type { CandidateGroup, GroupRequirement } from '../../domain/group';
import type { CategoryId, TileId } from '../../domain/ids';
import type { WinRole } from '../../domain/role';
import type { TileInstance } from '../../domain/tile';
import { enumerateGroups, type LabeledGroup } from '../groups/enumerateGroups';
import { categoryNameOf, tileDefOf, type DeckIndex } from '../tiles/deckIndex';
import type { GroupLabelSpec } from '../wildcards/resolveWildcards';
import { evaluateRoleCondition } from './evaluateRoleCondition';

export type RoleWait = {
  kind: 'tile' | 'category' | 'tag' | 'any';
  tileIds?: TileId[];
  categoryId?: CategoryId;
  tag?: string;
  wildcardCanFill: boolean;
  incompleteGroupIndex: number;
  message: string;
};

export type RoleMatchResult =
  | {
      kind: 'completed';
      groups: CandidateGroup[];
      wildcardAssignments: WildcardAssignment[];
      wildcardCount: number;
    }
  | {
      kind: 'tenpai';
      groups: CandidateGroup[];
      wildcardAssignments: WildcardAssignment[];
      wildcardCount: number;
      waits: RoleWait[];
    }
  | {
      kind: 'near';
      completeSlotCount: number;
      groups: CandidateGroup[];
      wildcardAssignments: WildcardAssignment[];
      missingRequirements: MissingRequirement[];
    }
  | {
      kind: 'blocked';
      reason: BlockedReason;
    }
  | { kind: 'none' };

export type MatchRoleInput = {
  role: WinRole;
  handTiles: TileInstance[];
  index: DeckIndex;
  /** variant.ruleConfig.allowWildcard */
  ruleAllowsWildcard: boolean;
};

type Slot = {
  requirementIndex: number;
  requirement: GroupRequirement;
  label: GroupLabelSpec;
};

function slotsOf(role: WinRole): Slot[] {
  const slots: Slot[] = [];
  role.requiredGroups.forEach((requirement, requirementIndex) => {
    for (let i = 0; i < requirement.count; i++) {
      slots.push({ requirementIndex, requirement, label: labelOf(requirement) });
    }
  });
  return slots;
}

function labelOf(requirement: GroupRequirement): GroupLabelSpec {
  switch (requirement.groupType) {
    case 'sameTile':
      return { groupType: 'sameTile' };
    case 'sameCategory':
      return { groupType: 'sameCategory', categoryId: requirement.categoryId ?? '' };
    case 'sameTag':
      return { groupType: 'sameTag', tag: requirement.tag ?? '' };
    case 'specificSet':
      return { groupType: 'specificSet', tileIds: requirement.tileIds ?? [] };
    case 'freeSet':
      return { groupType: 'freeSet' };
  }
}

function groupSatisfiesLabel(group: LabeledGroup, label: GroupLabelSpec): boolean {
  const g = group.group;
  switch (label.groupType) {
    case 'sameTile':
      return g.groupType === 'sameTile';
    case 'sameCategory':
      return g.groupType === 'sameCategory' && g.categoryId === label.categoryId;
    case 'sameTag':
      return g.groupType === 'sameTag' && g.tag === label.tag;
    case 'specificSet':
      return (
        g.groupType === 'specificSet' &&
        [...(g.specificTileIds ?? [])].sort().join('+') === [...label.tileIds].sort().join('+')
      );
    case 'freeSet':
      return g.groupType === 'freeSet';
  }
}

function disjoint(a: LabeledGroup, b: LabeledGroup): boolean {
  return a.group.tileInstanceIds.every((id) => !b.group.tileInstanceIds.includes(id));
}

type Assignment = {
  groups: LabeledGroup[];
  wildcardCount: number;
};

// slotごとの候補groupから、重複なしで全slotを埋める割当を探す。
// wildcard合計が最少のものを返す。
function findAssignment(
  slots: Slot[],
  groupsPerSlot: LabeledGroup[][],
  maxWildcards: number,
): Assignment | null {
  let best: Assignment | null = null;

  const search = (slotIndex: number, chosen: LabeledGroup[], wildcards: number): void => {
    if (best !== null && best.wildcardCount === 0) {
      return;
    }
    if (wildcards > maxWildcards) {
      return;
    }
    if (slotIndex === slots.length) {
      if (best === null || wildcards < best.wildcardCount) {
        best = { groups: [...chosen], wildcardCount: wildcards };
      }
      return;
    }
    for (const candidate of groupsPerSlot[slotIndex]!) {
      if (chosen.some((g) => !disjoint(g, candidate))) {
        continue;
      }
      chosen.push(candidate);
      search(slotIndex + 1, chosen, wildcards + candidate.wildcardCount);
      chosen.pop();
    }
  };

  search(0, [], 0);
  return best;
}

function wildcardLimitOf(input: MatchRoleInput): number {
  if (!input.ruleAllowsWildcard || !input.role.allowWildcard) {
    return 0;
  }
  return input.role.maxWildcards;
}

// 手牌にwildcardとして使える牌が何枚あるか
function usableWildcardIds(input: MatchRoleInput): Set<string> {
  const ids = new Set<string>();
  for (const instance of input.handTiles) {
    const behavior = tileDefOf(input.index, instance).wildcard;
    if (behavior?.canCompleteWinRole) {
      ids.add(instance.instanceId);
    }
  }
  return ids;
}

// 1つのwin_roleを手牌(8or9枚)に対して判定する。
// 9枚: completed判定。8枚: tenpai(2組完成+2枚待ち)判定。
// どちらでもない場合はnear(完成slot数と不足)を返す。
export function matchRole(input: MatchRoleInput): RoleMatchResult {
  const { role, handTiles, index } = input;
  const slots = slotsOf(role);
  if (slots.length !== 3) {
    return {
      kind: 'blocked',
      reason: {
        code: 'R4010',
        message: `「${role.name}」はrequiredGroupsが3グループちょうどではないため判定できません。`,
      },
    };
  }

  const wildcardLimit = wildcardLimitOf(input);
  const specificSets = role.requiredGroups
    .filter((req) => req.groupType === 'specificSet')
    .map((req) => req.tileIds ?? []);
  const includeFreeSet = role.requiredGroups.some((req) => req.groupType === 'freeSet');

  const { groups } = enumerateGroups({
    handTiles,
    index,
    specificSets,
    allowWildcard: wildcardLimit > 0,
    maxWildcardsPerGroup: 1,
    includeFreeSet,
  });

  const groupsPerSlot = slots.map((slot) =>
    groups.filter((g) => groupSatisfiesLabel(g, slot.label)),
  );

  // wholeHandConditionは分割探索の前に確認する(満たさなければ完成しない)
  const wholeHandOk =
    role.wholeHandCondition === undefined ||
    evaluateRoleCondition({
      condition: role.wholeHandCondition,
      handTiles,
      index,
      wildcardBudget: wildcardLimit,
      purpose: 'winRole',
    }).ok;

  if (handTiles.length === 9 && wholeHandOk) {
    const assignment = findAssignment(slots, groupsPerSlot, wildcardLimit);
    if (assignment) {
      return {
        kind: 'completed',
        groups: assignment.groups.map((g) => g.group),
        wildcardAssignments: assignment.groups.flatMap((g) => g.wildcardAssignments),
        wildcardCount: assignment.wildcardCount,
      };
    }
    // wildcard上限だけが理由で完成しない場合はblocked(W5005)として説明する
    if (wildcardLimit < 9) {
      const relaxed = findAssignment(slots, groupsPerSlot, 9);
      if (relaxed !== null) {
        const wildcardsNeeded = relaxed.wildcardCount;
        if (wildcardsNeeded > wildcardLimit) {
          return {
            kind: 'blocked',
            reason: {
              code: 'W5005',
              message: `「${role.name}」はwildcardが${wildcardsNeeded}枚必要ですが、使えるのは${wildcardLimit}枚までです。`,
            },
          };
        }
      }
    }
  }

  if (handTiles.length === 8 && wholeHandOk) {
    const tenpai = findTenpai(input, slots, groupsPerSlot, wildcardLimit);
    if (tenpai) {
      return tenpai;
    }
  }

  return findNear(input, slots, groupsPerSlot, wildcardLimit);
}

// 8枚: 2slot完成 + 残り2枚が最後のslotの待ちになるか
function findTenpai(
  input: MatchRoleInput,
  slots: Slot[],
  groupsPerSlot: LabeledGroup[][],
  wildcardLimit: number,
): RoleMatchResult | null {
  const { handTiles, index } = input;
  const wildIds = usableWildcardIds(input);
  let best: {
    groups: CandidateGroup[];
    assignments: WildcardAssignment[];
    wildcardCount: number;
    waits: RoleWait[];
  } | null = null;

  for (let missingSlot = 0; missingSlot < 3; missingSlot++) {
    const otherSlots = [0, 1, 2].filter((i) => i !== missingSlot);
    for (const groupA of groupsPerSlot[otherSlots[0]!]!) {
      for (const groupB of groupsPerSlot[otherSlots[1]!]!) {
        if (!disjoint(groupA, groupB)) {
          continue;
        }
        const usedIds = new Set([
          ...groupA.group.tileInstanceIds,
          ...groupB.group.tileInstanceIds,
        ]);
        const pair = handTiles.filter((t) => !usedIds.has(t.instanceId));
        if (pair.length !== 2) {
          continue;
        }
        const baseWildcards = groupA.wildcardCount + groupB.wildcardCount;
        if (baseWildcards > wildcardLimit) {
          continue;
        }
        const wait = pairWait(
          pair,
          slots[missingSlot]!,
          index,
          wildIds,
          wildcardLimit - baseWildcards,
        );
        if (!wait) {
          continue;
        }
        const pairWildcards = pair.filter((t) => wildIds.has(t.instanceId)).length;
        const totalWildcards = baseWildcards + (wait.pairUsesWildcard ? pairWildcards : 0);
        const incompleteGroup: CandidateGroup = {
          groupId: `incomplete|${slots[missingSlot]!.requirementIndex}|${pair
            .map((t) => t.instanceId)
            .sort()
            .join(',')}`,
          groupType: slots[missingSlot]!.requirement.groupType,
          tileInstanceIds: pair.map((t) => t.instanceId).sort(),
          isComplete: false,
          wildcardAssignmentIds: [],
          ...(slots[missingSlot]!.requirement.categoryId
            ? { categoryId: slots[missingSlot]!.requirement.categoryId }
            : {}),
          ...(slots[missingSlot]!.requirement.tag
            ? { tag: slots[missingSlot]!.requirement.tag }
            : {}),
          ...(slots[missingSlot]!.requirement.tileIds
            ? { specificTileIds: slots[missingSlot]!.requirement.tileIds }
            : {}),
        };
        const candidate = {
          groups: [groupA.group, groupB.group, incompleteGroup],
          assignments: [...groupA.wildcardAssignments, ...groupB.wildcardAssignments],
          wildcardCount: totalWildcards,
          waits: [{ ...wait.wait, incompleteGroupIndex: 2 }],
        };
        if (best === null || candidate.wildcardCount < best.wildcardCount) {
          best = candidate;
        } else if (candidate.wildcardCount === best.wildcardCount) {
          // 同コストなら待ちをマージして情報を増やす
          const key = (w: RoleWait) =>
            `${w.kind}:${w.categoryId ?? ''}:${w.tag ?? ''}:${(w.tileIds ?? []).join('+')}`;
          const known = new Set(best.waits.map(key));
          for (const w of candidate.waits) {
            if (!known.has(key(w))) {
              best.waits.push(w);
            }
          }
        }
      }
    }
  }

  if (!best) {
    return null;
  }
  return {
    kind: 'tenpai',
    groups: best.groups,
    wildcardAssignments: best.assignments,
    wildcardCount: best.wildcardCount,
    waits: best.waits,
  };
}

// 2枚のペアがslotの要求をあと1枚で満たせるか。満たせるなら待ち情報を返す。
function pairWait(
  pair: TileInstance[],
  slot: Slot,
  index: DeckIndex,
  wildIds: Set<string>,
  remainingWildcardBudget: number,
): { wait: RoleWait; pairUsesWildcard: boolean } | null {
  const requirement = slot.requirement;
  const wildsInPair = pair.filter((t) => wildIds.has(t.instanceId));
  const naturals = pair.filter((t) => !wildIds.has(t.instanceId));

  // 1グループwildcard最大1枚 + role予算
  if (wildsInPair.length > 1 || wildsInPair.length > remainingWildcardBudget) {
    return null;
  }
  const pairUsesWildcard = wildsInPair.length > 0;
  // ペアにwildcardが入っている場合、待ち牌は自然牌でなければならない(1グループ1枚制限)
  const wildcardCanFill =
    !pairUsesWildcard && remainingWildcardBudget >= 1;

  const base = { wildcardCanFill, incompleteGroupIndex: 2 };

  switch (requirement.groupType) {
    case 'sameCategory': {
      const categoryId = requirement.categoryId ?? '';
      if (
        naturals.every((t) => tileDefOf(index, t).categories.includes(categoryId))
      ) {
        return {
          wait: {
            ...base,
            kind: 'category',
            categoryId,
            message: `${categoryNameOf(index, categoryId)}の牌があと1枚`,
          },
          pairUsesWildcard,
        };
      }
      return null;
    }
    case 'sameTag': {
      const tag = requirement.tag ?? '';
      if (naturals.every((t) => (tileDefOf(index, t).tags ?? []).includes(tag))) {
        return {
          wait: { ...base, kind: 'tag', tag, message: `タグ「${tag}」の牌があと1枚` },
          pairUsesWildcard,
        };
      }
      return null;
    }
    case 'sameTile': {
      const tileIds = new Set(naturals.map((t) => t.tileId));
      if (tileIds.size > 1) {
        return null;
      }
      const tileId = naturals[0]?.tileId;
      if (!tileId) {
        return null;
      }
      const name = index.tilesById.get(tileId)?.name ?? tileId;
      return {
        wait: {
          ...base,
          kind: 'tile',
          tileIds: [tileId],
          message: `「${name}」があと1枚`,
        },
        pairUsesWildcard,
      };
    }
    case 'specificSet': {
      const rest = [...(requirement.tileIds ?? [])];
      for (const t of naturals) {
        const at = rest.indexOf(t.tileId);
        if (at === -1) {
          return null;
        }
        rest.splice(at, 1);
      }
      // wildcardがペアにあるなら、残り2枚のうち1枚をwildcardが担当し、待ちは残る1枚ずつ
      const waitingTileIds = rest;
      if (waitingTileIds.length !== (pairUsesWildcard ? 2 : 1)) {
        return null;
      }
      const names = waitingTileIds
        .map((id) => index.tilesById.get(id)?.name ?? id)
        .join('か');
      return {
        wait: {
          ...base,
          kind: 'tile',
          tileIds: waitingTileIds,
          message: `「${names}」があと1枚`,
        },
        pairUsesWildcard,
      };
    }
    case 'freeSet': {
      return {
        wait: { ...base, kind: 'any', message: 'どの牌でもあと1枚' },
        pairUsesWildcard,
      };
    }
  }
}

// 完成slot数を最大化して、足りない要求を説明する
function findNear(
  input: MatchRoleInput,
  slots: Slot[],
  groupsPerSlot: LabeledGroup[][],
  wildcardLimit: number,
): RoleMatchResult {
  const { role, index } = input;
  let best: { chosen: (LabeledGroup | null)[]; completeCount: number; wildcards: number } = {
    chosen: [null, null, null],
    completeCount: 0,
    wildcards: 0,
  };

  const search = (
    slotIndex: number,
    chosen: (LabeledGroup | null)[],
    completeCount: number,
    wildcards: number,
  ): void => {
    if (slotIndex === slots.length) {
      if (
        completeCount > best.completeCount ||
        (completeCount === best.completeCount && wildcards < best.wildcards)
      ) {
        best = { chosen: [...chosen], completeCount, wildcards };
      }
      return;
    }
    // このslotを埋めない選択
    chosen[slotIndex] = null;
    search(slotIndex + 1, chosen, completeCount, wildcards);
    for (const candidate of groupsPerSlot[slotIndex]!) {
      if (wildcards + candidate.wildcardCount > wildcardLimit) {
        continue;
      }
      if (chosen.some((g) => g !== null && !disjoint(g, candidate))) {
        continue;
      }
      chosen[slotIndex] = candidate;
      search(slotIndex + 1, chosen, completeCount + 1, wildcards + candidate.wildcardCount);
      chosen[slotIndex] = null;
    }
  };
  search(0, [null, null, null], 0, 0);

  if (best.completeCount === 0) {
    return { kind: 'none' };
  }

  const missingByRequirement = new Map<number, number>();
  slots.forEach((slot, i) => {
    if (best.chosen[i] === null) {
      missingByRequirement.set(
        slot.requirementIndex,
        (missingByRequirement.get(slot.requirementIndex) ?? 0) + 1,
      );
    }
  });

  const missingRequirements: MissingRequirement[] = [...missingByRequirement.entries()].map(
    ([requirementIndex, missingGroupCount]) => {
      const requirement = role.requiredGroups[requirementIndex]!;
      return {
        requirementIndex,
        requirement,
        missingGroupCount,
        missingTileCount: missingGroupCount * 3,
        message: describeRequirement(requirement, missingGroupCount, index),
      };
    },
  );

  const chosenGroups = best.chosen.filter((g): g is LabeledGroup => g !== null);
  return {
    kind: 'near',
    completeSlotCount: best.completeCount,
    groups: chosenGroups.map((g) => g.group),
    wildcardAssignments: chosenGroups.flatMap((g) => g.wildcardAssignments),
    missingRequirements,
  };
}

function describeRequirement(
  requirement: GroupRequirement,
  missingGroupCount: number,
  index: DeckIndex,
): string {
  switch (requirement.groupType) {
    case 'sameCategory':
      return `${categoryNameOf(index, requirement.categoryId ?? '')}のグループがあと${missingGroupCount}組`;
    case 'sameTag':
      return `タグ「${requirement.tag ?? ''}」のグループがあと${missingGroupCount}組`;
    case 'sameTile':
      return `同じ牌3枚のグループがあと${missingGroupCount}組`;
    case 'specificSet': {
      const names = (requirement.tileIds ?? [])
        .map((id) => index.tilesById.get(id)?.name ?? id)
        .join('・');
      return `「${names}」のセットがあと${missingGroupCount}組`;
    }
    case 'freeSet':
      return `任意の3枚グループがあと${missingGroupCount}組`;
  }
}
