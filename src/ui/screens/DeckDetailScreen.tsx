import { useState } from 'react';
import type { DeckProject } from '../../domain/deck';
import type { DeckValidationResult } from '../../domain/validation';
import { Badge } from '../components/Badge';
import { Button } from '../components/Button';
import { CategoryChip } from '../components/CategoryChip';
import { Dialog } from '../components/Dialog';
import { RoleCard } from '../components/RoleCard';
import { ValidationIssueList } from '../components/ValidationIssueList';
import { TileCard } from '../components/TileCard';

const STATUS_LABEL: Record<DeckValidationResult['status'], string> = {
  playable: '対局可',
  playableWithWarnings: '注意あり',
  draft: '下書き',
  blocked: '要修正',
};

export function DeckDetailScreen({
  deck,
  validation,
  onBack,
  onStartSetup,
  onEdit,
  onExport,
  onDelete,
}: {
  deck: DeckProject;
  validation: DeckValidationResult;
  onBack: () => void;
  onStartSetup: () => void;
  onEdit: () => void;
  onExport: () => void;
  onDelete: () => void;
}) {
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const normalVariant = deck.variants.find((v) => v.id === deck.activeVariantId);
  const canPlay = validation.status === 'playable' || validation.status === 'playableWithWarnings';
  const categoryById = new Map(deck.categories.map((c) => [c.id, c]));
  const totalTileCount = deck.tiles.reduce((total, tile) => total + tile.count, 0);
  const roleCount = normalVariant?.winRoles.length ?? 0;
  const actionableIssueCount = validation.issues.filter(
    (issue) => issue.severity === 'error' || issue.severity === 'warning',
  ).length;

  return (
    <div className="sp-screen sp-deck-loadout sp-deck-detail-stage">
      <header className="sp-deck-detail-stage__header">
        <div className="sp-deck-detail-stage__identity">
          <div className="sp-deck-detail-stage__title-line">
            <h1 className="sp-screen__title">{deck.name}</h1>
            <Badge variant={canPlay ? 'info' : 'warning'}>{STATUS_LABEL[validation.status]}</Badge>
          </div>
          <p>{deck.description || '説明なし'}</p>
        </div>

        <div className="sp-deck-detail-stage__primary-actions" aria-label="デッキの主要操作">
          <Button variant="primary" onClick={onStartSetup} disabled={!canPlay}>
            このデッキで対局
          </Button>
          <Button variant="ink" onClick={onEdit}>
            デッキを編集
          </Button>
        </div>
      </header>

      <div className="sp-deck-detail-stage__body">
        <main className="sp-deck-detail-stage__main sp-screen__col--scroll">
          <section className="sp-deck-loadout__tiles" aria-label={`牌 ${deck.tiles.length}種`}>
            <div className="sp-deck-loadout__section-head">
              <h2>牌セット</h2>
              <span>{deck.tiles.length}種 / 合計{totalTileCount}枚</span>
            </div>
            <div className="sp-deck-loadout__tile-grid">
              {deck.tiles.map((tile) => {
                const category = categoryById.get(tile.primaryCategoryId);
                return (
                  <div key={tile.id} className="sp-deck-loadout__tile-item">
                    <TileCard
                      name={tile.name}
                      {...(tile.emoji !== undefined ? { emoji: tile.emoji } : {})}
                      fallbackLabel={tile.fallbackLabel}
                      {...(category ? { categoryColor: category.color, categoryName: category.name } : {})}
                      showName
                      interactive={false}
                    />
                    <span aria-label={`${tile.name}は${tile.count}枚`}>×{tile.count}</span>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="sp-deck-loadout__roles" aria-label={`役 ${roleCount}件`}>
            <div className="sp-deck-loadout__section-head">
              <h2>役</h2>
              <span>{roleCount}役</span>
            </div>
            <div className="sp-deck-loadout__role-grid">
              {normalVariant?.winRoles.map((role) => (
                <RoleCard
                  key={role.id}
                  name={role.name}
                  basePoints={role.basePoints}
                  explanation={role.explanation}
                />
              ))}
            </div>
          </section>
        </main>

        <aside className="sp-deck-detail-stage__side sp-screen__col--scroll">
          <section className="sp-deck-detail-stage__summary" aria-label="デッキ概要">
            <div className="sp-deck-detail-stage__status-line">
              <strong>{STATUS_LABEL[validation.status]}</strong>
              <span>
                {actionableIssueCount > 0 ? `要確認 ${actionableIssueCount}件` : '対局条件を満たしています'}
              </span>
            </div>

            <dl className="sp-deck-detail-stage__spec">
              <div>
                <dt>牌</dt>
                <dd>{totalTileCount}<small>{deck.tiles.length}種</small></dd>
              </div>
              <div>
                <dt>カテゴリ</dt>
                <dd>{deck.categories.length}<small>種類</small></dd>
              </div>
              <div>
                <dt>役</dt>
                <dd>{roleCount}<small>登録</small></dd>
              </div>
              <div>
                <dt>検証</dt>
                <dd>{actionableIssueCount}<small>要確認</small></dd>
              </div>
            </dl>

            <div className="sp-deck-detail-stage__categories" aria-label="カテゴリ">
              {deck.categories.map((category) => (
                <CategoryChip
                  key={category.id}
                  name={category.name}
                  color={category.color}
                  {...(category.icon !== undefined ? { icon: category.icon } : {})}
                />
              ))}
            </div>

            {validation.issues.length > 0 && (
              <details className="sp-deck-detail-stage__validation" open={!canPlay}>
                <summary>検証詳細 {validation.issues.length}件</summary>
                <ValidationIssueList issues={validation.issues} />
              </details>
            )}
          </section>

          <nav className="sp-deck-detail-stage__utility" aria-label="その他のデッキ操作">
            <Button variant="ghost" onClick={onExport}>
              書き出す
            </Button>
            <Button variant="ghost" onClick={() => setDeleteConfirmOpen(true)}>
              削除
            </Button>
            <Button variant="ghost" onClick={onBack}>
              もどる
            </Button>
          </nav>
        </aside>
      </div>

      <Dialog
        open={deleteConfirmOpen}
        title="デッキを削除"
        message={`「${deck.name}」を削除します。この操作は取り消せず、現在は削除済みデッキを復元する画面もありません。必要なら先にエクスポートしてください。`}
        confirmLabel="削除する"
        cancelLabel="やめる"
        danger
        onConfirm={() => {
          setDeleteConfirmOpen(false);
          onDelete();
        }}
        onCancel={() => setDeleteConfirmOpen(false)}
      />
    </div>
  );
}
