import type { CandidateState, HandCandidate } from '../../domain/candidate';

const STATE_ORDER: Record<CandidateState, number> = {
  completed: 0,
  tenpai: 1,
  near: 2,
  bonusOnly: 3,
  invalidButExplainable: 4,
};

// 決定的な候補順序。プレイヤーの意図は表さない(RankScoreはUI表示順のみ)。
// 同点は入力順(=deck順)を保つ安定ソート。
export function rankCandidates(candidates: HandCandidate[]): HandCandidate[] {
  const ranked = [...candidates].sort((a, b) => {
    const stateDiff = STATE_ORDER[a.state] - STATE_ORDER[b.state];
    if (stateDiff !== 0) {
      return stateDiff;
    }
    if (a.totalEstimate !== b.totalEstimate) {
      return b.totalEstimate - a.totalEstimate;
    }
    if (a.wildcardAssignments.length !== b.wildcardAssignments.length) {
      return a.wildcardAssignments.length - b.wildcardAssignments.length;
    }
    return 0;
  });
  return ranked.map((candidate, index) => ({
    ...candidate,
    rankScore: ranked.length - index,
  }));
}
