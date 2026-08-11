import type { BoardInsight } from '../../domain/candidate';

export function MatchCoach({
  insights,
  error,
}: {
  insights: BoardInsight[];
  error: string | null;
}) {
  if (error !== null) {
    return (
      <div className="sp-match-coach sp-match-coach--error" role="alert">
        <span className="sp-match-coach__label">エラー</span>
        <span className="sp-match-coach__primary">{error}</span>
      </div>
    );
  }

  const primary = insights[0];
  if (primary === undefined) {
    return null;
  }

  const rest = insights.slice(1);
  if (rest.length === 0) {
    return (
      <div className="sp-match-coach" role="status" aria-live="polite" aria-atomic="true">
        <span className="sp-match-coach__label">ヒント</span>
        <span className="sp-match-coach__primary">{primary.message}</span>
      </div>
    );
  }

  return (
    <details className="sp-match-coach sp-match-coach--expandable">
      <summary>
        <span className="sp-match-coach__label">ヒント</span>
        <span className="sp-match-coach__primary" aria-live="polite" aria-atomic="true">
          {primary.message}
        </span>
        <span className="sp-match-coach__count" aria-label={`ほか${rest.length}件`}>
          +{rest.length}
        </span>
      </summary>
      <div className="sp-match-coach__details" aria-label="ほかのヒント">
        {rest.map((insight, index) => (
          <p key={`${insight.kind}-${index}`}>{insight.message}</p>
        ))}
      </div>
    </details>
  );
}
