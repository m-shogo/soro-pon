import { useEffect, useState } from 'react';
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
  const errorCount = validation.issues.filter((issue) => issue.severity === 'error').length;
  const warningCount = validation.issues.filter((issue) => issue.severity === 'warning').length;
  const infoCount = validation.issues.filter((issue) => issue.severity === 'info').length;
  const shouldOpenValidation = validation.status === 'blocked' || errorCount > 0;
  const [validationOpen, setValidationOpen] = useState(shouldOpenValidation);

  useEffect(() => {
    setValidationOpen(shouldOpenValidation);
  }, [shouldOpenValidation]);

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
            <dd>
              {totalTileCount}
              <small>{deck.tiles.length}種</small>
            </dd>
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
        <div className="sp-deck-editor-inspector__issue-counts" aria-label="検証問題の内訳">
          <span>
            エラー
            <strong>{errorCount}</strong>
          </span>
          <span>
            注意
            <strong>{warningCount}</strong>
          </span>
          <span>
            情報
            <strong>{infoCount}</strong>
          </span>
        </div>
      </PaperPanel>

      {validation.issues.length > 0 ? (
        <details
          className="sp-deck-editor-inspector__validation"
          open={validationOpen}
          onToggle={(event) => setValidationOpen(event.currentTarget.open)}
        >
          <summary>
            <span>検証詳細</span>
            <span>{validation.issues.length}件</span>
          </summary>
          <div className="sp-deck-editor-inspector__validation-body">
            <ValidationIssueList issues={validation.issues} emptyMessage="問題なし。" />
          </div>
        </details>
      ) : (
        <div className="sp-deck-editor-inspector__validation-clear">検証: 問題なし</div>
      )}
    </div>
  );
}
