import type { ValidationIssue } from '../../domain/validation';
import { Badge } from './Badge';
import './components.css';

// 検証issueの共通一覧。DeckDetail/DeckEditor等で同じ表示を使う。
export function ValidationIssueList({
  issues,
  emptyMessage = '問題は見つかりませんでした。',
}: {
  issues: ValidationIssue[];
  emptyMessage?: string;
}) {
  if (issues.length === 0) {
    return <span style={{ fontSize: 'var(--sp-font-xs)' }}>{emptyMessage}</span>;
  }
  return (
    <ul className="sp-issue-list">
      {issues.map((issue, i) => (
        <li key={`${issue.code}-${i}`}>
          {/* severityは色だけでなくラベル文字でも区別する(H3) */}
          <Badge variant={issue.severity === 'info' ? 'info' : 'warning'}>
            {issue.severity === 'info' ? 'INFO' : 'WARN'} {issue.code}
          </Badge>{' '}
          {issue.message}
        </li>
      ))}
    </ul>
  );
}
