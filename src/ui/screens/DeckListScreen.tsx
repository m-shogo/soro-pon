import type { DeckValidationResult } from '../../domain/validation';
import type { StoredDeck } from '../../schemas/storageSchema';
import { Badge } from '../components/Badge';
import { Button } from '../components/Button';
import { CategoryChip } from '../components/CategoryChip';
import { TileCard } from '../components/TileCard';

const STATUS_LABEL: Record<DeckValidationResult['status'], string> = {
  playable: '対局可',
  playableWithWarnings: '注意あり',
  draft: '下書き',
  blocked: '使用不可',
};

const SOURCE_LABEL: Record<StoredDeck['source'], string> = {
  official: '公式',
  created: '自作',
  imported: '読み込み',
};

export function DeckListScreen({
  decks,
  validations,
  onBack,
  onSelect,
  onImport,
  onCreate,
}: {
  decks: StoredDeck[];
  validations: Map<string, DeckValidationResult>;
  onBack: () => void;
  onSelect: (deckId: string) => void;
  onImport: () => void;
  onCreate: () => void;
}) {
  const readyCount = decks.filter((stored) => {
    const status = validations.get(stored.deck.id)?.status;
    return status === 'playable' || status === 'playableWithWarnings';
  }).length;

  return (
    <div className="sp-screen sp-deck-select">
      <div className="sp-screen__header sp-deck-select__header">
        <div className="sp-deck-select__title-block">
          <h1 className="sp-screen__title">デッキ選択</h1>
          <div className="sp-deck-select__summary" aria-label="デッキ一覧の状態">
            <span><strong>{decks.length}</strong>デッキ</span>
            <span><strong>{readyCount}</strong>対局可</span>
          </div>
        </div>
        <div className="sp-screen__spacer" />
        <div className="sp-deck-select__actions" aria-label="デッキ管理">
          <Button variant={decks.length === 0 ? 'primary' : 'ink'} onClick={onCreate}>
            新しいデッキ
          </Button>
          <Button variant="ghost" onClick={onImport}>
            デッキを読み込む
          </Button>
          <Button variant="ghost" onClick={onBack}>
            TOPへ
          </Button>
        </div>
      </div>

      <div
        className="sp-deck-grid sp-deck-select__grid"
        data-deck-count={decks.length}
        aria-label="デッキのロードアウト一覧"
      >
        {decks.map((stored) => {
          const validation = validations.get(stored.deck.id);
          const status = validation?.status ?? 'draft';
          const canPlay = status === 'playable' || status === 'playableWithWarnings';
          const totalTiles = stored.deck.tiles.reduce((sum, tile) => sum + tile.count, 0);
          const previewTiles = stored.deck.tiles.slice(0, 8);
          const categoryById = new Map(stored.deck.categories.map((category) => [category.id, category]));
          const activeVariant = stored.deck.variants.find(
            (variant) => variant.id === stored.deck.activeVariantId,
          );

          return (
            <button
              key={stored.deck.id}
              type="button"
              className="sp-deck-card sp-deck-select-card"
              data-status={status}
              onClick={() => onSelect(stored.deck.id)}
              aria-label={`${stored.deck.name}、${STATUS_LABEL[status]}、牌${totalTiles}枚`}
            >
              <div className="sp-deck-select-card__top">
                <div className="sp-deck-select-card__title-wrap">
                  <span className="sp-deck-select-card__source">{SOURCE_LABEL[stored.source]}</span>
                  <strong className="sp-deck-select-card__title">{stored.deck.name}</strong>
                </div>
                <Badge variant={canPlay ? 'info' : 'warning'}>{STATUS_LABEL[status]}</Badge>
              </div>

              <div className="sp-deck-select-card__body">
                <div className="sp-deck-select-card__preview" aria-hidden="true">
                  {previewTiles.map((tile) => {
                    const category = categoryById.get(tile.primaryCategoryId);
                    return (
                      <TileCard
                        key={tile.id}
                        name={tile.name}
                        {...(tile.emoji !== undefined ? { emoji: tile.emoji } : {})}
                        fallbackLabel={tile.fallbackLabel}
                        {...(category ? { categoryColor: category.color, categoryName: category.name } : {})}
                        showName={false}
                        interactive={false}
                      />
                    );
                  })}
                </div>

                <div className="sp-deck-select-card__spec">
                  <p className="sp-deck-select-card__description">
                    {stored.deck.description || '説明なし'}
                  </p>

                  <dl className="sp-deck-select-card__stats" aria-label={`${stored.deck.name}の構成`}>
                    <div>
                      <dt>牌</dt>
                      <dd>{totalTiles}枚</dd>
                    </div>
                    <div>
                      <dt>種類</dt>
                      <dd>{stored.deck.tiles.length}種</dd>
                    </div>
                    <div>
                      <dt>役</dt>
                      <dd>{activeVariant?.winRoles.length ?? 0}組</dd>
                    </div>
                    <div>
                      <dt>カテゴリ</dt>
                      <dd>{stored.deck.categories.length}</dd>
                    </div>
                  </dl>

                  <div className="sp-deck-select-card__categories">
                    {stored.deck.categories.slice(0, 4).map((category) => (
                      <CategoryChip
                        key={category.id}
                        name={category.name}
                        color={category.color}
                        {...(category.icon !== undefined ? { icon: category.icon } : {})}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
