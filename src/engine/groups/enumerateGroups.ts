import type { AnalyzerWarning, WildcardAssignment } from '../../domain/candidate';
import type { CandidateGroup } from '../../domain/group';
import type { CategoryId, TileId } from '../../domain/ids';
import type { TileInstance } from '../../domain/tile';
import { ENGINE_LIMITS } from '../engineLimits';
import { tileDefOf, type DeckIndex } from '../tiles/deckIndex';
import {
  resolveWildcards,
  type GroupLabelSpec,
  type WildcardPurpose,
} from '../wildcards/resolveWildcards';

// ラベル付き完成グループ。partition/role判定の材料になる。
export type LabeledGroup = {
  group: CandidateGroup;
  wildcardAssignments: WildcardAssignment[];
  wildcardCount: number;
  /** 使用インスタンス集合の同一性キー(ソート済みinstanceId結合) */
  instanceKey: string;
};

export type EnumerateGroupsInput = {
  handTiles: TileInstance[];
  index: DeckIndex;
  /** role由来のspecificSet(このセットのみ判定する) */
  specificSets?: TileId[][];
  allowWildcard: boolean;
  maxWildcardsPerGroup?: number;
  purpose?: WildcardPurpose;
  /** freeSetグループも列挙するか(roleにfreeSet要求がある場合のみ有効化推奨) */
  includeFreeSet?: boolean;
};

export type EnumerateGroupsResult = {
  groups: LabeledGroup[];
  warnings: AnalyzerWarning[];
};

function labelKey(label: GroupLabelSpec): string {
  switch (label.groupType) {
    case 'sameTile':
      return `sameTile:${label.tileId ?? ''}`;
    case 'sameCategory':
      return `sameCategory:${label.categoryId}`;
    case 'sameTag':
      return `sameTag:${label.tag}`;
    case 'specificSet':
      return `specificSet:${[...label.tileIds].sort().join('+')}`;
    case 'freeSet':
      return 'freeSet';
  }
}

export function buildLabeledGroup(
  combo: TileInstance[],
  label: GroupLabelSpec,
  input: Pick<
    EnumerateGroupsInput,
    'index' | 'allowWildcard' | 'maxWildcardsPerGroup' | 'purpose'
  >,
): LabeledGroup | null {
  const resolution = resolveWildcards({
    instances: combo,
    label,
    index: input.index,
    allowWildcard: input.allowWildcard,
    maxWildcardsPerGroup: input.maxWildcardsPerGroup ?? 1,
    purpose: input.purpose ?? 'winRole',
  });
  if (!resolution.ok) {
    return null;
  }
  const instanceIds = combo.map((t) => t.instanceId).sort();
  const instanceKey = instanceIds.join(',');
  const groupId = `${labelKey(label)}|${instanceKey}`;
  const assignments: WildcardAssignment[] = resolution.assignments.map((pending, i) => ({
    ...pending,
    id: `${groupId}|w${i}`,
    groupId,
  }));
  const group: CandidateGroup = {
    groupId,
    groupType: label.groupType,
    tileInstanceIds: instanceIds,
    isComplete: true,
    wildcardAssignmentIds: assignments.map((a) => a.id),
    ...(label.groupType === 'sameCategory' ? { categoryId: label.categoryId } : {}),
    ...(label.groupType === 'sameTag' ? { tag: label.tag } : {}),
    ...(label.groupType === 'sameTile' && resolution.resolvedTileId
      ? { tileId: resolution.resolvedTileId }
      : {}),
    ...(label.groupType === 'specificSet' ? { specificTileIds: [...label.tileIds] } : {}),
  };
  return {
    group,
    wildcardAssignments: assignments,
    wildcardCount: resolution.wildcardCount,
    instanceKey,
  };
}

function* combinationsOf3(tiles: TileInstance[]): Generator<TileInstance[]> {
  for (let i = 0; i < tiles.length - 2; i++) {
    for (let j = i + 1; j < tiles.length - 1; j++) {
      for (let k = j + 1; k < tiles.length; k++) {
        yield [tiles[i]!, tiles[j]!, tiles[k]!];
      }
    }
  }
}

// 手牌から可能な3枚完成グループをラベル付きで列挙する。
// 自然成立を先に、wildcard補助を後に並べる(naturalを優先する方針)。
export function enumerateGroups(input: EnumerateGroupsInput): EnumerateGroupsResult {
  const warnings: AnalyzerWarning[] = [];
  const groups: LabeledGroup[] = [];
  const seen = new Set<string>();
  let wildcardBranches = 0;
  let wildcardCapped = false;

  const sortedHand = [...input.handTiles].sort((a, b) =>
    a.instanceId.localeCompare(b.instanceId),
  );

  for (const combo of combinationsOf3(sortedHand)) {
    // このcomboが名乗れるラベル候補を集める
    const labels: GroupLabelSpec[] = [];

    labels.push({ groupType: 'sameTile' });

    // カテゴリ/タグ候補は非wildcard牌の共通部分から作る(wildcardは何にでもなれるため)
    const naturalDefs = combo
      .filter((t) => tileDefOf(input.index, t).wildcard === undefined)
      .map((t) => tileDefOf(input.index, t));
    const defsForIntersection = naturalDefs.length > 0
      ? naturalDefs
      : combo.map((t) => tileDefOf(input.index, t));

    const categoryCandidates = defsForIntersection
      .map((def) => new Set(def.categories))
      .reduce((acc, set) => new Set([...acc].filter((c) => set.has(c))));
    for (const categoryId of [...categoryCandidates].sort()) {
      labels.push({ groupType: 'sameCategory', categoryId: categoryId as CategoryId });
    }

    const tagCandidates = defsForIntersection
      .map((def) => new Set(def.tags ?? []))
      .reduce((acc, set) => new Set([...acc].filter((t) => set.has(t))));
    for (const tag of [...tagCandidates].sort()) {
      labels.push({ groupType: 'sameTag', tag });
    }

    for (const tileIds of input.specificSets ?? []) {
      labels.push({ groupType: 'specificSet', tileIds });
    }

    if (input.includeFreeSet) {
      labels.push({ groupType: 'freeSet' });
    }

    for (const label of labels) {
      const labeled = buildLabeledGroup(combo, label, input);
      if (!labeled) {
        continue;
      }
      if (seen.has(labeled.group.groupId)) {
        continue;
      }
      if (labeled.wildcardCount > 0) {
        wildcardBranches += 1;
        if (wildcardBranches > ENGINE_LIMITS.maxWildcardBranches) {
          wildcardCapped = true;
          continue;
        }
      }
      seen.add(labeled.group.groupId);
      groups.push(labeled);
    }
  }

  if (wildcardCapped) {
    warnings.push({
      code: 'P8002',
      message: `wildcard分岐が上限${ENGINE_LIMITS.maxWildcardBranches}を超えたため一部を打ち切りました。`,
      capped: true,
    });
  }

  // 自然グループ優先、次にwildcard数、最後はID順で決定的に
  groups.sort((a, b) => {
    if (a.wildcardCount !== b.wildcardCount) {
      return a.wildcardCount - b.wildcardCount;
    }
    return a.group.groupId.localeCompare(b.group.groupId);
  });

  return { groups, warnings };
}
