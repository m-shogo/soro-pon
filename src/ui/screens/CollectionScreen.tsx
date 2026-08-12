import { ACHIEVEMENTS, titleFor } from '../../app/achievements';
import type { StoredDeck } from '../../schemas/storageSchema';
import type { RecordsPayload } from '../../schemas/storageSchema';
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
      const role = deck?.variants.flatMap((v) => v.winRoles).find((r) => r.id === roleId);
      return role ? { key, role, deckName: deck?.name ?? '' } : null;
    })
    .filter((entry): entry is NonNullable<typeof entry> => entry !== null);

  const unlocked = new Set(records.achievements ?? []);
  const title = titleFor(unlocked.size);
  const topResults = [...records.records]
    .filter((record) => record.humanWon && record.totalPoints !== undefined)
    .sort((a, b) => (b.totalPoints ?? 0) - (a.totalPoints ?? 0))
    .slice(0, 10);
  const hasTopResults = topResults.length > 0;

  return (
    <div className="sp-screen sp-collection-screen">
      <div className="sp-screen__header">
        <h1 className="sp-screen__title">記憶帳</h1>
        <div className="sp-screen__spacer" />
        <Button variant="ghost" onClick={onBack}>
          もどる
        </Button>
      </div>

      <dl className="sp-collection-summary" aria-label="記憶帳の概要">
        <div>
          <dt>記憶コイン</dt>
          <dd>{records.coins}</dd>
        </div>
        <div>
          <dt>称号</dt>
          <dd>{title}</dd>
        </div>
        <div>
          <dt>実績</dt>
          <dd>
            {unlocked.size} / {ACHIEVEMENTS.length}
          </dd>
        </div>
        <div>
          <dt>あがった役</dt>
          <dd>{collectedRoles.length}</dd>
        </div>
      </dl>

      <div className="sp-screen__body sp-collection-screen__body">
        <div className="sp-screen__col sp-screen__col--main sp-screen__col--scroll sp-collection-screen__main">
          <PaperPanel
            variant="aged"
            title="高得点 Top 10"
            className={`sp-collection-scoreboard${hasTopResults ? '' : ' sp-collection-scoreboard--empty'}`}
          >
            {hasTopResults ? (
              <ol className="sp-collection-ranking">
                {topResults.map((record, index) => (
                  <li key={`${record.dateMs}-${index}`}>
                    <strong>{record.totalPoints}点</strong>
                    <span>{record.selectedWinRoleName ?? '-'}</span>
                    <small>
                      {record.deckName} / {formatDate(record.dateMs)}
                    </small>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="sp-collection-empty">勝利記録はまだありません。</p>
            )}
          </PaperPanel>

          <PaperPanel title="クリアボード">
            <div className="sp-clear-board">
              {ACHIEVEMENTS.map((achievement) => {
                const done = unlocked.has(achievement.id);
                return (
                  <div
                    key={achievement.id}
                    className={`sp-clear-board__cell${done ? ' sp-clear-board__cell--done' : ''}`}
                    title={achievement.description}
                  >
                    <span className="sp-clear-board__mark" aria-hidden="true">
                      {done ? '★' : '・'}
                    </span>
                    <span className="sp-clear-board__label">{achievement.title}</span>
                    <span className="sp-clear-board__desc">{achievement.description}</span>
                  </div>
                );
              })}
            </div>
          </PaperPanel>

          <PaperPanel title={`あがった役 ${collectedRoles.length}`}>
            {collectedRoles.length === 0 ? (
              <p className="sp-collection-empty">まだ役であがっていません。</p>
            ) : (
              <div className="sp-screen__col sp-collection-role-list">
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
        </div>

        <aside className="sp-screen__col sp-screen__col--side sp-screen__col--scroll sp-collection-screen__recent">
          <PaperPanel variant="ink" title="最近の記録">
            {records.records.length === 0 ? (
              <span className="sp-collection-empty">まだ対局していません。</span>
            ) : (
              <ol className="sp-collection-recent-list">
                {records.records.slice(0, 12).map((record, index) => (
                  <li key={`${record.dateMs}-${index}`}>
                    <time>{formatDate(record.dateMs)}</time>
                    <span>
                      {record.reason === 'draw'
                        ? '流局'
                        : `${record.winnerName} ${record.reason === 'tsumo' ? 'ツモ' : 'ロン'}`}
                    </span>
                    {record.humanWon ? <strong>+{record.coinsEarned}</strong> : null}
                  </li>
                ))}
              </ol>
            )}
          </PaperPanel>
        </aside>
      </div>
    </div>
  );
}
