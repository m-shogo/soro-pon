import { useState } from 'react';
import type { CategoryDefinition } from '../../domain/category';
import type { TileDefinition } from '../../domain/tile';
import { Button } from './Button';
import { FormField, NumberField, SelectField, TextField, Toggle } from './FormField';
import { TileCard } from './TileCard';

export function DeckTileWorkbench({
  tiles,
  categories,
  onAddTile,
  onUpdateTile,
  onToggleCategory,
  onRemoveTile,
}: {
  tiles: TileDefinition[];
  categories: CategoryDefinition[];
  onAddTile: () => void;
  onUpdateTile: (tileId: string, patch: Partial<TileDefinition>) => void;
  onToggleCategory: (tile: TileDefinition, categoryId: string) => void;
  onRemoveTile: (tileId: string) => void;
}) {
  const [selectedTileId, setSelectedTileId] = useState<string | null>(tiles[0]?.id ?? null);
  const selectedTile = tiles.find((tile) => tile.id === selectedTileId) ?? tiles[0] ?? null;
  const effectiveSelectedTileId = selectedTile?.id ?? null;
  const categoryById = new Map(categories.map((category) => [category.id, category]));
  const selectedPrimaryCategory = selectedTile
    ? categoryById.get(selectedTile.primaryCategoryId)
    : undefined;

  const removeSelectedTile = () => {
    if (!selectedTile) {
      return;
    }
    const currentIndex = tiles.findIndex((tile) => tile.id === selectedTile.id);
    const nextSelection = tiles[currentIndex + 1]?.id ?? tiles[currentIndex - 1]?.id ?? null;
    setSelectedTileId(nextSelection);
    onRemoveTile(selectedTile.id);
  };

  return (
    <section className="sp-tile-workbench" aria-label="牌編集ワークベンチ">
      <header className="sp-tile-workbench__header">
        <div>
          <h2>牌棚</h2>
          <span>{tiles.length}種 / 牌を選んで編集</span>
        </div>
        <Button variant="ink" onClick={onAddTile} disabled={categories.length === 0}>
          牌を追加
        </Button>
      </header>

      <div className="sp-tile-workbench__body">
        <div className="sp-tile-workbench__shelf" role="group" aria-label="編集する牌を選ぶ">
          {tiles.map((tile) => {
            const category = categoryById.get(tile.primaryCategoryId);
            const selected = tile.id === effectiveSelectedTileId;
            return (
              <button
                key={tile.id}
                type="button"
                className="sp-tile-workbench__choice"
                aria-label={`${tile.name}を編集`}
                aria-pressed={selected}
                data-selected={selected || undefined}
                onClick={() => setSelectedTileId(tile.id)}
              >
                <TileCard
                  name={tile.name}
                  {...(tile.emoji !== undefined ? { emoji: tile.emoji } : {})}
                  fallbackLabel={tile.fallbackLabel}
                  {...(category
                    ? { categoryColor: category.color, categoryName: category.name }
                    : {})}
                  showName={false}
                  interactive={false}
                />
                <span className="sp-tile-workbench__choice-name">{tile.name}</span>
                <span className="sp-tile-workbench__choice-count">×{tile.count}</span>
              </button>
            );
          })}
        </div>

        {selectedTile ? (
          <section
            className="sp-tile-workbench__editor"
            aria-label={`${selectedTile.name}の編集`}
          >
            <div className="sp-tile-workbench__editor-head">
              <div className="sp-tile-workbench__selected-preview" aria-hidden="true">
                <TileCard
                  name={selectedTile.name}
                  {...(selectedTile.emoji !== undefined ? { emoji: selectedTile.emoji } : {})}
                  fallbackLabel={selectedTile.fallbackLabel}
                  {...(selectedPrimaryCategory
                    ? {
                        categoryColor: selectedPrimaryCategory.color,
                        categoryName: selectedPrimaryCategory.name,
                      }
                    : {})}
                  showName
                  interactive={false}
                />
              </div>
              <div>
                <strong>{selectedTile.name}</strong>
                <span>{selectedPrimaryCategory?.name ?? 'カテゴリ未設定'}</span>
              </div>
            </div>

            <div className="sp-tile-workbench__fields">
              <FormField label="牌名">
                <TextField
                  label="牌名"
                  value={selectedTile.name}
                  maxLength={20}
                  onChange={(name) => onUpdateTile(selectedTile.id, { name })}
                />
              </FormField>
              <FormField label="絵文字">
                <TextField
                  label="絵文字"
                  value={selectedTile.emoji ?? ''}
                  maxLength={4}
                  placeholder="絵文字"
                  onChange={(emoji) =>
                    onUpdateTile(
                      selectedTile.id,
                      emoji === '' ? { emoji: undefined } : { emoji },
                    )
                  }
                />
              </FormField>
              <FormField label="代替文字">
                <TextField
                  label="代替1文字"
                  value={selectedTile.fallbackLabel}
                  maxLength={4}
                  onChange={(fallbackLabel) =>
                    onUpdateTile(selectedTile.id, { fallbackLabel })
                  }
                />
              </FormField>
              <FormField label="枚数">
                <NumberField
                  label="枚数"
                  min={1}
                  max={10}
                  value={selectedTile.count}
                  onChange={(count) => onUpdateTile(selectedTile.id, { count })}
                />
              </FormField>
            </div>

            <div className="sp-tile-workbench__categories">
              <div className="sp-tile-workbench__category-list" aria-label="所属カテゴリ">
                {categories.map((category) => (
                  <Toggle
                    key={category.id}
                    label={category.name}
                    checked={selectedTile.categories.includes(category.id)}
                    onChange={() => onToggleCategory(selectedTile, category.id)}
                  />
                ))}
              </div>
              <FormField label="主カテゴリ">
                <SelectField
                  label="主カテゴリ"
                  value={selectedTile.primaryCategoryId}
                  onChange={(primaryCategoryId) =>
                    onUpdateTile(selectedTile.id, { primaryCategoryId })
                  }
                  options={selectedTile.categories.map((categoryId) => ({
                    value: categoryId,
                    label: categoryById.get(categoryId)?.name ?? categoryId,
                  }))}
                />
              </FormField>
            </div>

            <div className="sp-tile-workbench__danger">
              <Button variant="ghost" onClick={removeSelectedTile}>
                この牌を削除
              </Button>
            </div>
          </section>
        ) : (
          <div className="sp-tile-workbench__empty" role="status">
            牌がありません。カテゴリを用意して「牌を追加」から作成してください。
          </div>
        )}
      </div>
    </section>
  );
}
