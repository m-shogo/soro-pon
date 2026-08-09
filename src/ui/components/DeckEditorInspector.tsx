import type { DeckProject } from '../../domain/deck';
import type { DeckValidationResult } from '../../domain/validation';
import { Badge } from './Badge';
import { PaperPanel } from './PaperPanel';
import { ValidationIssueList } from './ValidationIssueList';

export function DeckEditorInspector({
  deck,
  validation,
}: {
  deck: DeckProject;
  validation: DeckValidationResult;
}) {
  const activeVariant = deck.variants.find((variant) => variant.id === deck.activeVariantId);
  const totalTileCount = deck.tiles.reduce((total, tile) => total + tile.count, 0);
  const roleCount = activeVariant?.winRoles.length ?? 0;
  const bonusCount =
    (activeVariant?.specialBonuses.length ?? 0) + (activeVariant?.scoreBonuses.length ?? 0);
  const playable = validation.status === 'playable';
  const playableWithWarnings = validation.status === 'playableWithWarnings';

  return (
    <div className="sp-deck-editor-inspector">
      <PaperPanel variant="ink" title="構成">
        <div className="sp-deck-editor-inspector__status">
          <Badge variant={playable ? 'info' : 'warning'}>
            {playable ? '対局可' : playableWithWarnings ? '注意あり' : '要修正'}
          </Badge>
          <span>{validation.issues.length === 0 ? '問題なし' : `${validation.issues.length}件`}</span>
        </div>
        <dl className="sp-deck-editor-inspector__summary" aria-label="編集中デッキの構成">
          <div>
            <dt>牌</dt>
            <dd>{totalTileCount}<small>{deck.tiles.length}種</small></dd>
          </div>
          <div>
            <dt>カテゴリ</dt>
            <dd>{deck.categories.length}</dd>
          </div>
          <div>
            <dt>役</dt>
            <dd>{roleCount}</dd>
          </div>
          <div>
            <dt>ボーナス</dt>
            <dd>{bonusCount}</dd>
          </div>
        </dl>
      </PaperPanel>
      <PaperPanel variant="ink" title="検証">
        <ValidationIssueList issues={validation.issues} emptyMessage="問題なし。" />
      </PaperPanel>
    </div>
  );
}