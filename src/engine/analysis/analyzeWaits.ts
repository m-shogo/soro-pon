import type { WaitAnalysis } from '../../domain/candidate';
import { analyzeHandDetailed, type AnalyzeHandInput } from './analyzeHand';

export type AnalyzeWaitsInput = AnalyzeHandInput;

// tenpai候補の「どのグループが不完全で、何が来れば埋まるか」を返す。
// 事実のみ。最善手は示さない。
export function analyzeWaits(input: AnalyzeWaitsInput): WaitAnalysis[] {
  const { analyzed } = analyzeHandDetailed(input);
  const waits: WaitAnalysis[] = [];
  for (const { candidate, waits: roleWaits } of analyzed) {
    if (candidate.state !== 'tenpai') {
      continue;
    }
    for (const wait of roleWaits) {
      waits.push({
        context: input.context,
        candidateId: candidate.candidateId,
        ...(candidate.winRoleId !== undefined ? { winRoleId: candidate.winRoleId } : {}),
        incompleteGroupIndex: wait.incompleteGroupIndex,
        kind: wait.kind,
        ...(wait.tileIds ? { tileIds: wait.tileIds } : {}),
        ...(wait.categoryId !== undefined ? { categoryId: wait.categoryId } : {}),
        ...(wait.tag !== undefined ? { tag: wait.tag } : {}),
        wildcardCanFill: wait.wildcardCanFill,
        message: wait.message,
      });
    }
  }
  return waits;
}
