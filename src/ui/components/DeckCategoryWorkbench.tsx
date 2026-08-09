import { useState } from 'react';
import type { CategoryDefinition } from '../../domain/category';
import type { TileDefinition } from '../../domain/tile';
import { Button } from './Button';
import { CategoryChip } from './CategoryChip';
import { ColorField, FormField, TextField } from './FormField';

export function DeckCategoryWorkbench({
  categories,
  tiles,
  onAddCategory,
  onUpdateCategory,
  onRemoveCategory,
}: {
  categories: CategoryDefinition[];
  tiles: TileDefinition[];
  onAddCategory: () => void;
  onUpdateCategory: (categoryId: string, patch: Partial<CategoryDefinition>) => void;
  onRemoveCategory: (categoryId: string) => void;
}) {
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
    categories[0]?.id ?? null,
  );
  const selectedCategory =
    categories.find((category) => category.id === selectedCategoryId) ?? categories[0] ?? null;
  const effectiveSelectedId = selectedCategory?.id ?? null;

  const usageCount = (categoryId: string) =>
    tiles.filter((tile) => tile.categories.includes(categoryId)).length;

  const removeSelectedCategory = () => {
    if (!selectedCategory) return;
    const currentIndex = categories.findIndex((category) => category.id === selectedCategory.id);
    const nextSelection =
      categories[currentIndex + 1]?.id ?? categories[currentIndex - 1]?.id ?? null;
    setSelectedCategoryId(nextSelection);
    onRemoveCategory(selectedCategory.id);
  };

  return (
    <section className="sp-category-workbench" aria-label="カテゴリ編集パレット">
      <header className="sp-category-workbench__header">
        <div>
          <h2>カテゴリパレット</h2>
          <span>{categories.length}種類 / 色見本を選んで編集</span>
        </div>
        <Button variant="ink" onClick={onAddCategory}>
          カテゴリを追加
        </Button>
      </header>

      <div className="sp-category-workbench__body">
        <div className="sp-category-workbench__palette" role="group" aria-label="編集するカテゴリを選ぶ">
          {categories.map((category) => {
            const selected = category.id === effectiveSelectedId;
            return (
              <button
                key={category.id}
                type="button"
                className="sp-category-workbench__choice"
                aria-label={`${category.name}を編集`}
                aria-pressed={selected}
                data-selected={selected || undefined}
                style={{ '--category-swatch': category.color } as React.CSSProperties}
                onClick={() => setSelectedCategoryId(category.id)}
              >
                <span className="sp-category-workbench__swatch" aria-hidden="true">
                  {category.icon ?? category.name.slice(0, 1)}
                </span>
                <CategoryChip
                  name={category.name}
                  color={category.color}
                  {...(category.icon !== undefined ? { icon: category.icon } : {})}
                />
                <span className="sp-category-workbench__usage">使用牌 {usageCount(category.id)}種</span>
              </button>
            );
          })}
        </div>

        {selectedCategory ? (
          <section
            className="sp-category-workbench__editor"
            aria-label={`${selectedCategory.name}の編集`}
          >
            <div
              className="sp-category-workbench__selected"
              style={{ '--category-swatch': selectedCategory.color } as React.CSSProperties}
            >
              <span className="sp-category-workbench__selected-swatch" aria-hidden="true">
                {selectedCategory.icon ?? selectedCategory.name.slice(0, 1)}
              </span>
              <div>
                <strong>{selectedCategory.name}</strong>
                <span>使用牌 {usageCount(selectedCategory.id)}種</span>
              </div>
            </div>

            <div className="sp-category-workbench__fields">
              <FormField label="カテゴリ名">
                <TextField
                  label="カテゴリ名"
                  value={selectedCategory.name}
                  maxLength={20}
                  onChange={(name) => onUpdateCategory(selectedCategory.id, { name })}
                />
              </FormField>
              <FormField label="色">
                <ColorField
                  label="カテゴリ色"
                  value={selectedCategory.color}
                  onChange={(color) => onUpdateCategory(selectedCategory.id, { color })}
                />
              </FormField>
              <FormField label="アイコン">
                <TextField
                  label="アイコン絵文字"
                  value={selectedCategory.icon ?? ''}
                  maxLength={4}
                  placeholder="絵文字"
                  onChange={(icon) =>
                    onUpdateCategory(
                      selectedCategory.id,
                      icon === '' ? { icon: undefined } : { icon },
                    )
                  }
                />
              </FormField>
            </div>

            <div className="sp-category-workbench__meta">
              <span>優先度 {selectedCategory.priority}</span>
              <span>ID {selectedCategory.id}</span>
            </div>

            <div className="sp-category-workbench__danger">
              {usageCount(selectedCategory.id) > 0 && (
                <span>削除すると使用中の牌が要修正になります</span>
              )}
              <Button variant="ghost" onClick={removeSelectedCategory}>
                このカテゴリを削除
              </Button>
            </div>
          </section>
        ) : (
          <div className="sp-category-workbench__empty" role="status">
            カテゴリがありません。「カテゴリを追加」から作成してください。
          </div>
        )}
      </div>
    </section>
  );
}
