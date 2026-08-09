import { useState } from 'react';
import type { CategoryDefinition } from '../../domain/category';
import type { WinRole } from '../../domain/role';
import type { TileDefinition } from '../../domain/tile';
import { Button } from './Button';
import { FormField, NumberField, SelectField, TextField } from './FormField';

const FAMILY_LABEL: Record<WinRole['family'], string> = {
  groupPattern: '組み合わせ',
  categoryMajority: 'カテゴリ',
  specificCollection: '指定セット',
  allDifferent: 'バラバラ',
  allSameCategory: '同カテゴリ',
  customTemplate: 'テンプレート',
};

export function DeckRoleWorkbench({
  categories,
  tiles,
  roles,
  templateCategoryId,
  onTemplateCategoryChange,
  onAddRoleFromTemplate,
  onAddSpecificSetRole,
  onUpdateRole,
  onRemoveRole,
}: {
  categories: CategoryDefinition[];
  tiles: TileDefinition[];
  roles: WinRole[];
  templateCategoryId: string;
  onTemplateCategoryChange: (categoryId: string) => void;
  onAddRoleFromTemplate: (
    template: 'threeSameCategory' | 'threeDifferentCategories' | 'threeSameTile',
    categoryId?: string,
  ) => void;
  onAddSpecificSetRole: (categoryId: string, tileIds: [string, string, string]) => void;
  onUpdateRole: (roleId: string, patch: Partial<WinRole>) => void;
  onRemoveRole: (roleId: string) => void;
}) {
  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(roles[0]?.id ?? null);
  const [setTileIds, setSetTileIds] = useState<[string, string, string]>(['', '', '']);
  const selectedRole = roles.find((role) => role.id === selectedRoleId) ?? roles[0] ?? null;
  const duplicateTileSelection =
    setTileIds.some((id) => id !== '') &&
    new Set(setTileIds.filter((id) => id !== '')).size !== setTileIds.filter((id) => id !== '').length;
  const canAddSpecificSetRole =
    templateCategoryId !== '' && setTileIds.every((id) => id !== '') && new Set(setTileIds).size === 3;

  const removeSelected = () => {
    if (!selectedRole) return;
    const currentIndex = roles.findIndex((role) => role.id === selectedRole.id);
    const next = roles[currentIndex + 1] ?? roles[currentIndex - 1] ?? null;
    setSelectedRoleId(next?.id ?? null);
    onRemoveRole(selectedRole.id);
  };

  return (
    <section className="sp-role-workbench" aria-label="役編集ワークベンチ">
      <header className="sp-role-workbench__header">
        <div>
          <h2>役を組む</h2>
          <span>{roles.length}役 / 安全プリセットから追加して1役ずつ調整</span>
        </div>
      </header>

      <div className="sp-role-workbench__presets" aria-label="役プリセット">
        <div className="sp-role-workbench__preset-main">
          <SelectField
            label="テンプレート用カテゴリ"
            value={templateCategoryId}
            onChange={onTemplateCategoryChange}
            placeholder="カテゴリを選ぶ"
            options={categories.map((category) => ({ value: category.id, label: category.name }))}
          />
          <Button
            variant="ink"
            disabled={templateCategoryId === ''}
            onClick={() => onAddRoleFromTemplate('threeSameCategory', templateCategoryId)}
          >
            同カテゴリ3組 60点
          </Button>
          <Button
            variant="ink"
            disabled={categories.length < 3}
            onClick={() => onAddRoleFromTemplate('threeDifferentCategories')}
          >
            3カテゴリ1組ずつ 80点
          </Button>
          <Button variant="ink" onClick={() => onAddRoleFromTemplate('threeSameTile')}>
            同じ牌3枚×3組 120点
          </Button>
        </div>

        <div className="sp-role-workbench__specific">
          {([0, 1, 2] as const).map((slot) => (
            <SelectField
              key={slot}
              label={`セット牌${slot + 1}`}
              value={setTileIds[slot]}
              onChange={(tileId) => {
                const next: [string, string, string] = [...setTileIds];
                next[slot] = tileId;
                setSetTileIds(next);
              }}
              placeholder={`牌${slot + 1}`}
              options={tiles.map((tile) => ({ value: tile.id, label: tile.name }))}
            />
          ))}
          <Button
            variant="ink"
            disabled={!canAddSpecificSetRole}
            onClick={() => onAddSpecificSetRole(templateCategoryId, setTileIds)}
          >
            指定3枚 + 同カテゴリ2組 100点
          </Button>
          {duplicateTileSelection && (
            <span className="sp-role-workbench__warning" role="status">
              指定3枚はすべて別の牌を選んでください。
            </span>
          )}
        </div>
      </div>

      <div className="sp-role-workbench__body">
        <div className="sp-role-workbench__list" role="group" aria-label="編集する役を選ぶ">
          {roles.map((role) => {
            const selected = role.id === selectedRole?.id;
            return (
              <button
                key={role.id}
                type="button"
                className="sp-role-workbench__choice"
                aria-label={`${role.name}を編集`}
                aria-pressed={selected}
                data-selected={selected || undefined}
                onClick={() => setSelectedRoleId(role.id)}
              >
                <span className="sp-role-workbench__points">{role.basePoints}点</span>
                <strong>{role.name}</strong>
                <small>{role.explanation}</small>
              </button>
            );
          })}
          {roles.length === 0 && (
            <div className="sp-role-workbench__empty" role="status">
              まだ役がありません。上の安全プリセットから追加してください。
            </div>
          )}
        </div>

        {selectedRole && (
          <section className="sp-role-workbench__editor" aria-label={`${selectedRole.name}の編集`}>
            <div className="sp-role-workbench__selected-head">
              <span>{FAMILY_LABEL[selectedRole.family]}</span>
              <strong>{selectedRole.name}</strong>
              <p>{selectedRole.explanation}</p>
            </div>

            <div className="sp-role-workbench__fields">
              <FormField label="役名">
                <TextField
                  label="役名"
                  value={selectedRole.name}
                  maxLength={30}
                  onChange={(name) => onUpdateRole(selectedRole.id, { name })}
                />
              </FormField>
              <FormField label="基本点">
                <NumberField
                  label="点数"
                  min={1}
                  max={999}
                  value={selectedRole.basePoints}
                  onChange={(basePoints) => onUpdateRole(selectedRole.id, { basePoints })}
                />
              </FormField>
            </div>

            <dl className="sp-role-workbench__rule-ledger">
              <div>
                <dt>組</dt>
                <dd>{selectedRole.requiredGroups.length}</dd>
              </div>
              <div>
                <dt>ツモ</dt>
                <dd>{selectedRole.canTsumo ? '可' : '不可'}</dd>
              </div>
              <div>
                <dt>ロン</dt>
                <dd>{selectedRole.canRon ? '可' : '不可'}</dd>
              </div>
              <div>
                <dt>ワイルド</dt>
                <dd>{selectedRole.allowWildcard ? `最大${selectedRole.maxWildcards}` : '不可'}</dd>
              </div>
            </dl>

            <p className="sp-role-workbench__locked-note">
              条件構造は安全テンプレート固定。ここでは役名と基本点だけ調整できます。
            </p>
            <Button variant="ghost" onClick={removeSelected}>
              この役を削除
            </Button>
          </section>
        )}
      </div>
    </section>
  );
}
