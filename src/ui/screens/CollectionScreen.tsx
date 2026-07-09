import type { StoredDeck } from '../../schemas/storageSchema';
import type { RecordsPayload } from '../../schemas/storageSchema';
import { Badge } from '../components/Badge';
import { Button } from '../components/Button';
import { PaperPanel } from '../components/PaperPanel';
import { RoleCard } from '../components/RoleCard';

function formatDate(ms: number): string {
  const d = new Date(ms);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}/${pad(d.getMonth() + 1)}/${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

// コレクション: 記憶コイン / あがった役 / 高得点記録 / 最近の記録。
// コインは強さに影響しない(docs/29)。
export function CollectionScreen({
  records,
  decks,
  onBack,
}: {
  records: RecordsPayload;
  decks: StoredDeck[];
  onBack: () => void;
}) {
  const collectedRoles = records.roleCollection
    .map((key) => {
      const [deckId, roleId] = key.split(':');
      const deck = decks.find((d) => d.deck.id === deckId)?.deck;
      const role = deck?.variants
        .flatMap((v) => v.winRoles)
        .find((r) => r.id === roleId);
      return role ? { key, role, deckName: deck?.name ?? '' } : null;
    })
    .filter((entry): entry is NonNullable<typeof entry> => entry !== null);

  const topResults = [...records.records]
    .filter((r) => r.humanWon && r.totalPoints !== undefined)
    .sort((a, b) => (b.totalPoints ?? 0) - (a.totalPoints ?? 0))
    .slice(0, 10);

  return (
    <div className="sp-screen">
      <div className="sp-screen__header">
        <h1 className="sp-screen__title">記憶帳</h1>
        <Badge variant="info">記憶コイン {records.coins}</Badge>
        <div className="sp-screen__spacer" />
        <Button variant="ghost" onClick={onBack}>
          もどる
        </Button>
      </div>
      <div className="sp-screen__body">
        <div className="sp-screen__col sp-screen__col--main sp-screen__col--scroll">
          <PaperPanel title={`あがった役 (${collectedRoles.length})`}>
            {collectedRoles.length === 0 ? (
              <p style={{ margin: 0, fontSize: 'var(--sp-font-sm)' }}>
                まだ役であがっていません。最初の記憶を確定させましょう。
              </p>
            ) : (
              <div className="sp-screen__col" style={{ gap: 'var(--sp-space-6)' }}>
                {collectedRoles.map(({ key, role, deckName }) => (
                  <div key={key}>
                    <RoleCard
                      name={`${role.name}(${deckName})`}
                      basePoints={role.basePoints}
                      explanation={role.explanation}
                      state="completed"
                    />
                  </div>
                ))}
              </div>
            )}
          </PaperPanel>
          <PaperPanel variant="aged" title="高得点 Top 10">
            {topResults.length === 0 ? (
              <p style={{ margin: 0, fontSize: 'var(--sp-font-sm)' }}>勝利記録はまだありません。</p>
            ) : (
              <ul className="sp-issue-list">
                {topResults.map((record, i) => (
                  <li key={`${record.dateMs}-${i}`}>
                    {i + 1}位 {record.totalPoints}点 「{record.selectedWinRoleName ?? '-'}」
                    ({record.deckName} / {formatDate(record.dateMs)})
                  </li>
                ))}
              </ul>
            )}
          </PaperPanel>
        </div>
        <div className="sp-screen__col sp-screen__col--side sp-screen__col--scroll">
          <PaperPanel variant="ink" title="最近の記録">
            {records.records.length === 0 ? (
              <span style={{ fontSize: 'var(--sp-font-xs)' }}>まだ対局していません。</span>
            ) : (
              <ul className="sp-issue-list">
                {records.records.slice(0, 12).map((record, i) => (
                  <li key={`${record.dateMs}-${i}`}>
                    {formatDate(record.dateMs)}{' '}
                    {record.reason === 'draw'
                      ? '流局'
                      : `${record.winnerName}が${record.reason === 'tsumo' ? 'ツモ' : 'ロン'}`}
                    {record.humanWon ? `(+${record.coinsEarned})` : ''}
                  </li>
                ))}
              </ul>
            )}
          </PaperPanel>
        </div>
      </div>
    </div>
  );
}
