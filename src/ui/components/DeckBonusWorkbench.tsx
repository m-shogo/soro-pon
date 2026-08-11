import { useState } from 'react';
import type { CategoryDefinition } from '../../domain/category';
import type { ScoreBonus, SpecialBonus } from '../../domain/role';
import { Button } from './Button';
import { FormField, NumberField, SelectField, TextField } from './FormField';

type BonusSelection =
  | { kind: 'special'; id: string }
  | { kind: 'score'; id: string };

function selectionKey(selection: BonusSelection): string {
  return `${selection.kind}:${selection.id}`;
}

function scoreConditionLabel(bonus: ScoreBonus): string {
  switch (bonus.type) {
    case 'duplicate_tile':
      return `同じ牌を${bonus.minCount}枚以上`;
    case 'duplicate_name':
      return `同じ名前を${bonus.minCount}枚以上`;
    case 'duplicate_category':
      return `同じカテゴリを${bonus.minCount}枚以上`;
    default:
      return bonus.type;
  }
}

export function DeckBonusWorkbench({
  categories,
  specialBonuses,
  scoreBonuses,
  templateCategoryId,
  onTemplateCategoryChange,
  onAddSpecialBonus,
  onAddScoreBonus,
  onUpdateSpecialBonus,
  onRemoveSpecialBonus,
  onUpdateScoreBonus,
  onRemoveScoreBonus,
}: {
  categories: CategoryDefinition[];
  specialBonuses: SpecialBonus[];
  scoreBonuses: ScoreBonus[];
  templateCategoryId: string;
  onTemplateCategoryChange: (categoryId: string) => void;
  onAddSpecialBonus: (categoryId: string) => void;
  onAddScoreBonus: () => void;
  onUpdateSpecialBonus: (id: string, patch: Partial<SpecialBonus>) => void;
  onRemoveSpecialBonus: (id: string) => void;
  onUpdateScoreBonus: (id: string, patch: Partial<ScoreBonus>) => void;
  onRemoveScoreBonus: (id: string) => void;
}) {
  const allBonuses: BonusSelection[] = [
    ...specialBonuses.map((bonus) => ({ kind: 'special' as const, id: bonus.id })),
    ...scoreBonuses.map((bonus) => ({ kind: 'score' as const, id: bonus.id })),
  ];
  const [selectedKey, setSelectedKey] = useState<string | null>(
    allBonuses[0] ? selectionKey(allBonuses[0]) : null,
  );
  const selected =
    allBonuses.find((bonus) => selectionKey(bonus) === selectedKey) ?? allBonuses[0] ?? null;

  const selectedSpecial =
    selected?.kind === 'special'
      ? specialBonuses.find((bonus) => bonus.id === selected.id) ?? null
      : null;
  const selectedScore =
    selected?.kind === 'score'
      ? scoreBonuses.find((bonus) => bonus.id === selected.id) ?? null
      : null;

  const removeSelected = () => {
    if (!selected) return;
    const currentIndex = allBonuses.findIndex(
      (bonus) => selectionKey(bonus) === selectionKey(selected),
    );
    const next = allBonuses[currentIndex + 1] ?? allBonuses[currentIndex - 1] ?? null;
    setSelectedKey(next ? selectionKey(next) : null);
    if (selected.kind === 'special') onRemoveSpecialBonus(selected.id);
    else onRemoveScoreBonus(selected.id);
  };

  return (
    <section className="sp-bonus-workbench" aria-label="ボーナス編集ワークベンチ">
      <header className="sp-bonus-workbench__header">
        <div>
          <h2>ボーナス構成</h2>
          <span>{allBonuses.length}件 / プリセットから追加して1件ずつ調整</span>
        </div>
      </header>

      <div className="sp-bonus-workbench__presets" aria-label="ボーナスプリセット">
        <div className="sp-bonus-workbench__preset">
          <div className="sp-bonus-workbench__preset-copy">
            <strong>カテゴリ加点</strong>
            <span>単体ではあがれない特別ボーナス</span>
          </div>
          <div className="sp-bonus-workbench__preset-action">
            <SelectField
              label="ボーナス用カテゴリ"
              value={templateCategoryId}
              onChange={onTemplateCategoryChange}
              placeholder="カテゴリを選ぶ"
              options={categories.map((category) => ({ value: category.id, label: category.name }))}
            />
            <Button
              variant="ink"
              disabled={templateCategoryId === ''}
              onClick={() => onAddSpecialBonus(templateCategoryId)}
            >
              カテゴリ3枚以上 +20点
            </Button>
          </div>
        </div>
        <div className="sp-bonus-workbench__preset">
          <div className="sp-bonus-workbench__preset-copy">
            <strong>同牌加点</strong>
            <span>同じ牌3枚を見つけて機械的に加点</span>
          </div>
          <div className="sp-bonus-workbench__preset-action sp-bonus-workbench__preset-action--single">
            <Button variant="ink" onClick={onAddScoreBonus}>
              同じ牌3枚 +15点
            </Button>
          </div>
        </div>
      </div>

      <div className="sp-bonus-workbench__body">
        <div className="sp-bonus-workbench__list" role="group" aria-label="編集するボーナスを選ぶ">
          {specialBonuses.map((bonus) => {
            const key = selectionKey({ kind: 'special', id: bonus.id });
            const isSelected = selected?.kind === 'special' && selected.id === bonus.id;
            return (
              <button
                key={key}
                type="button"
                className="sp-bonus-workbench__choice"
                aria-label={`${bonus.name}を編集`}
                aria-pressed={isSelected}
                data-selected={isSelected || undefined}
                onClick={() => setSelectedKey(key)}
              >
                <span className="sp-bonus-workbench__kind">特別</span>
                <strong>{bonus.name}</strong>
                <span>{bonus.points}点</span>
                <small>{bonus.explanation}</small>
              </button>
            );
          })}
          {scoreBonuses.map((bonus) => {
            const key = selectionKey({ kind: 'score', id: bonus.id });
            const isSelected = selected?.kind === 'score' && selected.id === bonus.id;
            return (
              <button
                key={key}
                type="button"
                className="sp-bonus-workbench__choice"
                aria-label={`${bonus.name}を編集`}
                aria-pressed={isSelected}
                data-selected={isSelected || undefined}
                onClick={() => setSelectedKey(key)}
              >
                <span className="sp-bonus-workbench__kind">スコア</span>
                <strong>{bonus.name}</strong>
                <span>{bonus.points}点 / 上限 {bonus.maxPoints ?? bonus.points}点</span>
                <small>{scoreConditionLabel(bonus)}</small>
              </button>
            );
          })}
          {allBonuses.length === 0 && (
            <div className="sp-bonus-workbench__empty" role="status">
              まだボーナスがありません。上のプリセットから追加してください。
            </div>
          )}
        </div>

        {selectedSpecial && (
          <section className="sp-bonus-workbench__editor" aria-label={`${selectedSpecial.name}の編集`}>
            <div className="sp-bonus-workbench__selected-head">
              <span className="sp-bonus-workbench__kind">特別ボーナス</span>
              <strong>{selectedSpecial.name}</strong>
              <span>{selectedSpecial.explanation}</span>
            </div>
            <div className="sp-bonus-workbench__fields">
              <FormField label="ボーナス名">
                <TextField
                  label="ボーナス名"
                  value={selectedSpecial.name}
                  maxLength={30}
                  onChange={(name) => onUpdateSpecialBonus(selectedSpecial.id, { name })}
                />
              </FormField>
              <FormField label="点数">
                <NumberField
                  label="ボーナス点数"
                  min={1}
                  max={300}
                  value={selectedSpecial.points}
                  onChange={(points) => onUpdateSpecialBonus(selectedSpecial.id, { points })}
                />
              </FormField>
            </div>
            <div className="sp-bonus-workbench__meta">
              <span>条件は安全テンプレート固定</span>
              <span>ワイルドカード {selectedSpecial.allowWildcard ? '可' : '不可'}</span>
            </div>
            <Button variant="ghost" onClick={removeSelected}>
              このボーナスを削除
            </Button>
          </section>
        )}

        {selectedScore && (
          <section className="sp-bonus-workbench__editor" aria-label={`${selectedScore.name}の編集`}>
            <div className="sp-bonus-workbench__selected-head">
              <span className="sp-bonus-workbench__kind">スコアボーナス</span>
              <strong>{selectedScore.name}</strong>
              <span>{scoreConditionLabel(selectedScore)}</span>
            </div>
            <div className="sp-bonus-workbench__fields">
              <FormField label="ボーナス名">
                <TextField
                  label="スコアボーナス名"
                  value={selectedScore.name}
                  maxLength={30}
                  onChange={(name) => onUpdateScoreBonus(selectedScore.id, { name })}
                />
              </FormField>
              <FormField label="点数">
                <NumberField
                  label="スコアボーナス点数"
                  min={1}
                  max={300}
                  value={selectedScore.points}
                  onChange={(points) => onUpdateScoreBonus(selectedScore.id, { points })}
                />
              </FormField>
              <FormField label="上限">
                <NumberField
                  label="スコアボーナス上限"
                  min={1}
                  max={900}
                  value={selectedScore.maxPoints ?? selectedScore.points}
                  onChange={(maxPoints) => onUpdateScoreBonus(selectedScore.id, { maxPoints })}
                />
              </FormField>
            </div>
            {selectedScore.description && (
              <p className="sp-bonus-workbench__description">{selectedScore.description}</p>
            )}
            <Button variant="ghost" onClick={removeSelected}>
              このボーナスを削除
            </Button>
          </section>
        )}
      </div>
    </section>
  );
}
