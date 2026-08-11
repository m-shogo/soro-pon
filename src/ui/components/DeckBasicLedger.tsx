import type { DeckProject } from '../../domain/deck';
import { FormField, TextField } from './FormField';
import { PaperPanel } from './PaperPanel';
import { TileCard } from './TileCard';

export function DeckBasicLedger({
  deck,
  onChange,
}: {
  deck: DeckProject;
  onChange: (updated: DeckProject) => void;
}) {
  const activeVariant = deck.variants.find((variant) => variant.id === deck.activeVariantId);
  const categoryById = new Map(deck.categories.map((category) => [category.id, category]));
  const previewTiles = deck.tiles.slice(0, 8);
  const totalTiles = deck.tiles.reduce((sum, tile) => sum + tile.count, 0);
  const bonusCount =
    (activeVariant?.specialBonuses.length ?? 0) + (activeVariant?.scoreBonuses.length ?? 0);

  return (
    <PaperPanel title="デッキ台帳">
      <div className="sp-deck-basic-ledger">
        <div className="sp-deck-basic-ledger__form">
          <FormField label="デッキ名">
            <TextField
              label="デッキ名"
              value={deck.name}
              maxLength={80}
              onChange={(name) => onChange({ ...deck, name })}
            />
          </FormField>
          <FormField label="説明">
            <TextField
              label="説明"
              multiline
              rows={2}
              maxLength={500}
              value={deck.description ?? ''}
              onChange={(description) => onChange({ ...deck, description })}
            />
          </FormField>
        </div>

        <section className="sp-deck-basic-ledger__identity" aria-label="現在のデッキ構成">
          <div className="sp-deck-basic-ledger__identity-head">
            <span>DECK FACE</span>
            <strong>{deck.name || '名称未設定'}</strong>
          </div>
          <div className="sp-deck-basic-ledger__rack" aria-hidden="true">
            {previewTiles.map((tile) => {
              const category = categoryById.get(tile.primaryCategoryId);
              return (
                <TileCard
                  key={tile.id}
                  name={tile.name}
                  {...(tile.emoji !== undefined ? { emoji: tile.emoji } : {})}
                  fallbackLabel={tile.fallbackLabel}
                  {...(category
                    ? { categoryColor: category.color, categoryName: category.name }
                    : {})}
                  showName={false}
                  interactive={false}
                />
              );
            })}
          </div>
          <dl className="sp-deck-basic-ledger__metrics">
            <div><dt>牌</dt><dd>{totalTiles}</dd></div>
            <div><dt>種類</dt><dd>{deck.tiles.length}</dd></div>
            <div><dt>カテゴリ</dt><dd>{deck.categories.length}</dd></div>
            <div><dt>役</dt><dd>{activeVariant?.winRoles.length ?? 0}</dd></div>
            <div><dt>ボーナス</dt><dd>{bonusCount}</dd></div>
          </dl>
        </section>
      </div>
    </PaperPanel>
  );
}
