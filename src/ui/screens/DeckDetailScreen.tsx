import { useState } from 'react';
import type { DeckProject } from '../../domain/deck';
import type { DeckValidationResult } from '../../domain/validation';
import { Badge } from '../components/Badge';
import { Button } from '../components/Button';
import { CategoryChip } from '../components/CategoryChip';
import { Dialog } from '../components/Dialog';
import { PaperPanel } from '../components/PaperPanel';
import { RoleCard } from '../components/RoleCard';
import { SectionHeader } from '../components/SectionHeader';
import { ValidationIssueList } from '../components/ValidationIssueList';
import { TileCard } from '../components/TileCard';

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

  return (
    <div className="sp-screen sp-deck-loadout">
      <SectionHeader
        title={deck.name}
        badges={
          <Badge variant={canPlay ? 'info' : 'warning'}>
            {canPlay ? '対局できます' : '対局できません(要修正)'}
          </Badge>
        }
        actions={
          <>
            <Button variant="primary" onClick={onStartSetup} disabled={!canPlay}>
              このデッキで対局
            </Button>
            <Button variant="ink" onClick={onEdit}>
              デッキを編集
            </Button>
            <Button variant="ghost" onClick={onExport}>
              書き出す
            </Button>
            <Button variant="ghost" onClick={() => setDeleteConfirmOpen(true)}>
              削除
            </Button>
            <Button variant="ghost" onClick={onBack}>
              もどる
            </Button>
          </>
        }
      />

      <section className="sp-deck-loadout__summary" aria-label="デッキ概要">
        <div className="sp-deck-loadout__metric">
          <span>牌</span>
          <strong>{totalTileCount}</strong>
          <small>{deck.tiles.length}種</small>
        </div>
        <div className="sp-deck-loadout__metric">
          <span>カテゴリ</span>
          <strong>{deck.categories.length}</strong>
          <small>種類</small>
        </div>
        <div className="sp-deck-loadout__metric">
          <span>役</span>
          <strong>{roleCount}</strong>
          <small>登録</small>
        </div>
        <div className="sp-deck-loadout__metric">
          <span>チェック</span>
          <strong>{validation.issues.length}</strong>
          <small>{canPlay ? '対局可' : '要修正'}</small>
        </div>
        <div className="sp-deck-loadout__categories">
          {deck.categories.map((category) => (
            <CategoryChip
              key={category.id}
              name={category.name}
              color={category.color}
              {...(category.icon !== undefined ? { icon: category.icon } : {})}
            />
          ))}
        </div>
      </section>

      <div className="sp-screen__body sp-deck-loadout__body">
        <div className="sp-screen__col sp-screen__col--main sp-screen__col--scroll sp-deck-loadout__main">
          <section className="sp-deck-loadout__tiles" aria-label={`牌 ${deck.tiles.length}種`}>
            <div className="sp-deck-loadout__section-head">
              <div>
                <span className="sp-deck-loadout__eyebrow">TILE SET</span>
                <h2>牌セット</h2>
              </div>
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
              <div>
                <span className="sp-deck-loadout__eyebrow">WIN ROLES</span>
                <h2>このデッキの役</h2>
              </div>
              <span>{roleCount}件</span>
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
        </div>

        <aside className="sp-screen__col sp-screen__col--side sp-screen__col--scroll sp-deck-loadout__side">
          <PaperPanel variant="ink" title="デッキ状態">
            <p className="sp-deck-loadout__description">{deck.description || '説明はまだありません。'}</p>
            <ValidationIssueList issues={validation.issues} />
          </PaperPanel>
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
