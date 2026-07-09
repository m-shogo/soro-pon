import type { DeckValidationResult } from '../../domain/validation';
import type { StoredDeck } from '../../schemas/storageSchema';
import { Badge } from '../components/Badge';
import { Button } from '../components/Button';
import { CategoryChip } from '../components/CategoryChip';
import { PaperPanel } from '../components/PaperPanel';

const STATUS_LABEL: Record<DeckValidationResult['status'], string> = {
  playable: '遊べる',
  playableWithWarnings: '注意あり',
  draft: '下書き',
  blocked: '使用不可',
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
  return (
    <div className="sp-screen">
      <div className="sp-screen__header">
        <h1 className="sp-screen__title">記憶札デッキリスト</h1>
        <span className="sp-screen__subtitle">{decks.length}件</span>
        <div className="sp-screen__spacer" />
        <Button variant="ink" onClick={onCreate}>
          新しいデッキを作る
        </Button>
        <Button variant="ink" onClick={onImport}>
          JSONを読み込む
        </Button>
        <Button variant="ghost" onClick={onBack}>
          TOPへ
        </Button>
      </div>
      <div className="sp-deck-grid">
        {decks.map((stored) => {
          const validation = validations.get(stored.deck.id);
          const status = validation?.status ?? 'draft';
          return (
            <button
              key={stored.deck.id}
              type="button"
              className="sp-deck-card"
              onClick={() => onSelect(stored.deck.id)}
            >
              <PaperPanel variant={status === 'playable' ? 'paper' : 'aged'} title={stored.deck.name}>
                <div style={{ fontSize: 'var(--sp-font-xs)', minHeight: '2.4em' }}>
                  {stored.deck.description ?? ''}
                </div>
                <div className="sp-deck-card__meta">
                  <Badge variant={status === 'playable' ? 'info' : 'warning'}>
                    {STATUS_LABEL[status]}
                  </Badge>
                  <span>牌{stored.deck.tiles.reduce((sum, t) => sum + t.count, 0)}枚</span>
                  <span>
                    {stored.source === 'official'
                      ? '公式'
                      : stored.source === 'imported'
                        ? 'インポート'
                        : '自作'}
                  </span>
                </div>
                <div className="sp-deck-card__meta">
                  {stored.deck.categories.slice(0, 4).map((category) => (
                    <CategoryChip
                      key={category.id}
                      name={category.name}
                      color={category.color}
                      {...(category.icon !== undefined ? { icon: category.icon } : {})}
                    />
                  ))}
                </div>
              </PaperPanel>
            </button>
          );
        })}
      </div>
    </div>
  );
}
