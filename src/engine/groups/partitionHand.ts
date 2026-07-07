import type { AnalyzerWarning } from '../../domain/candidate';
import type { TileInstance } from '../../domain/tile';
import { ENGINE_LIMITS } from '../engineLimits';
import type { LabeledGroup } from './enumerateGroups';

export type HandPartition = {
  groups: [LabeledGroup, LabeledGroup, LabeledGroup];
  wildcardCount: number;
};

export type PartitionHandInput = {
  /** normalThreeGroupsの勝利判定はちょうど9枚 */
  handTiles: TileInstance[];
  groups: LabeledGroup[];
  maxPartitions?: number;
};

export type HandPartitionResult = {
  partitions: HandPartition[];
  warnings: AnalyzerWarning[];
};

// 9枚をラベル付き3グループへ、全インスタンスを1回ずつ使って分割する。
// 8枚や10枚は通常の完成形にならないため、partitionは空になる。
export function partitionHand(input: PartitionHandInput): HandPartitionResult {
  const warnings: AnalyzerWarning[] = [];
  const partitions: HandPartition[] = [];
  const maxPartitions = input.maxPartitions ?? ENGINE_LIMITS.maxPartitions;

  if (input.handTiles.length !== 9) {
    return { partitions, warnings };
  }

  const handIds = [...new Set(input.handTiles.map((t) => t.instanceId))].sort();
  if (handIds.length !== 9) {
    // 同一インスタンスの重複した手牌は不正
    return { partitions, warnings };
  }

  // 最小の未使用インスタンスを含むグループだけを試すことで、同じ分割を一度だけ列挙する
  const groupsByInstance = new Map<string, LabeledGroup[]>();
  for (const labeled of input.groups) {
    for (const instanceId of labeled.group.tileInstanceIds) {
      const list = groupsByInstance.get(instanceId) ?? [];
      list.push(labeled);
      groupsByInstance.set(instanceId, list);
    }
  }

  let capped = false;

  const search = (remaining: Set<string>, chosen: LabeledGroup[]): void => {
    if (capped) {
      return;
    }
    if (remaining.size === 0) {
      if (chosen.length === 3) {
        if (partitions.length >= maxPartitions) {
          capped = true;
          return;
        }
        const groups = [...chosen].sort((a, b) =>
          a.group.groupId.localeCompare(b.group.groupId),
        ) as [LabeledGroup, LabeledGroup, LabeledGroup];
        partitions.push({
          groups,
          wildcardCount: chosen.reduce((sum, g) => sum + g.wildcardCount, 0),
        });
      }
      return;
    }
    if (chosen.length >= 3) {
      return;
    }
    const pivot = [...remaining].sort()[0]!;
    for (const labeled of groupsByInstance.get(pivot) ?? []) {
      const ids = labeled.group.tileInstanceIds;
      if (!ids.every((id) => remaining.has(id))) {
        continue;
      }
      const next = new Set(remaining);
      for (const id of ids) {
        next.delete(id);
      }
      chosen.push(labeled);
      search(next, chosen);
      chosen.pop();
      if (capped) {
        return;
      }
    }
  };

  search(new Set(handIds), []);

  if (capped) {
    warnings.push({
      code: 'P8001',
      message: `分割候補が上限${maxPartitions}を超えたため打ち切りました。`,
      capped: true,
    });
  }

  // wildcardの少ない自然な分割を先に
  partitions.sort((a, b) => {
    if (a.wildcardCount !== b.wildcardCount) {
      return a.wildcardCount - b.wildcardCount;
    }
    const keyA = a.groups.map((g) => g.group.groupId).join('/');
    const keyB = b.groups.map((g) => g.group.groupId).join('/');
    return keyA.localeCompare(keyB);
  });

  return { partitions, warnings };
}
