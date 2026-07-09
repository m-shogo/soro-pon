import type { ResultBreakdown } from '../../domain/score';
import './components.css';

// 得点内訳の表示。計算はengineのResultBreakdownを描画するだけ。
export function ScoreBreakdown({ breakdown }: { breakdown: ResultBreakdown }) {
  return (
    <div className="sp-score-breakdown">
      <div className="sp-score-breakdown__row">
        <span>役「{breakdown.selectedWinRoleName}」</span>
        <span className="sp-score-breakdown__points">{breakdown.basePoints}点</span>
      </div>
      {breakdown.wildcardAssignments.length > 0 && (
        <div className="sp-score-breakdown__row sp-score-breakdown__row--sub">
          <span>ワイルド使用 {breakdown.wildcardAssignments.length}枚</span>
          <span />
        </div>
      )}
      {breakdown.appliedSpecialBonuses.map((bonus) => (
        <div key={bonus.bonusId} className="sp-score-breakdown__row">
          <span>特別ボーナス「{bonus.name}」</span>
          <span className="sp-score-breakdown__points">+{bonus.points}点</span>
        </div>
      ))}
      {breakdown.appliedScoreBonuses.map((bonus) => (
        <div key={bonus.bonusId} className="sp-score-breakdown__row">
          <span>
            {bonus.name}
            {bonus.cappedByMaxPoints ? '(上限適用)' : ''}
          </span>
          <span className="sp-score-breakdown__points">+{bonus.points}点</span>
        </div>
      ))}
      <div className="sp-score-breakdown__total">
        <span>合計得点</span>
        <span className="sp-score-breakdown__total-points">{breakdown.totalPoints}</span>
      </div>
    </div>
  );
}
