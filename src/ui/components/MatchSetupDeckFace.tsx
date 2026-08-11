import type { DeckProject } from '../../domain/deck';
import { TileCard } from './TileCard';

export function MatchSetupDeckFace({ deck }: { deck: DeckProject }) {
  const categories = deck.categories ?? [];
  const tiles = deck.tiles ?? [];
  const previewTiles = tiles.slice(0, 8);
  const totalTiles = tiles.reduce((sum, tile) => sum + tile.count, 0);

  return (
    <section className="sp-match-setup__deck-face" aria-label="使用デッキ">
      <div className="sp-match-setup__deck-face-head">
        <span>使用デッキ</span>
        <strong>{deck.name}</strong>
      </div>
      <div className="sp-match-setup__deck-rack" aria-hidden="true">
        {previewTiles.map((tile) => (
          <TileCard
            key={tile.id}
            name={tile.name}
            {...(tile.emoji !== undefined ? { emoji: tile.emoji } : {})}
            fallbackLabel={tile.fallbackLabel}
            showName={false}
            interactive={false}
          />
        ))}
      </div>
      <div className="sp-match-setup__deck-meta">
        <span>{totalTiles}枚</span>
        <span>{tiles.length}種</span>
        <span>{categories.length}カテゴリ</span>
      </div>
    </section>
  );
}
