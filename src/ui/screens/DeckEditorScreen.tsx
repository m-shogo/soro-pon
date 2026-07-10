import { useMemo, useState } from 'react';
import type { CategoryDefinition } from '../../domain/category';
import type { DeckProject } from '../../domain/deck';
import type { TileDefinition } from '../../domain/tile';
import type { WinRole } from '../../domain/role';
import {
  buildSameCategoryRoleTemplate,
  buildSameTileRoleTemplate,
  buildScoreBonusTemplate,
  buildSpecialBonusTemplate,
  buildSpecificSetRoleTemplate,
  buildThreeDifferentCategoriesRoleTemplate,
} from '../../app/editorTemplates';
import { validateDeckProject } from '../../engine/validation/validateDeckProject';
import { deckProjectSchema } from '../../schemas/deckProjectSchema';
import { Badge } from '../components/Badge';
import { Button } from '../components/Button';
import { CategoryChip } from '../components/CategoryChip';
import { Modal } from '../components/Modal';
import { PaperPanel } from '../components/PaperPanel';
import { Tabs } from '../components/Tab';

// 安全テンプレートのみで構造編集する(count-onlyの通常役は作れない)。
// docs/70 §18 の推奨点数を使う。

const CATEGORY_COLORS = ['#EF4444', '#3B82F6', '#22C55E', '#F59E0B', '#7C3AED', '#06B6D4', '#EC4899', '#84CC16'];

function nextId(prefix: string, existing: string[]): string {
  let n = existing.length + 1;
  while (existing.includes(`${prefix}${n}`)) {
    n += 1;
  }
  return `${prefix}${n}`;
}

export function DeckEditorScreen({
  deck,
  onSave,
  onBack,
}: {
  deck: DeckProject;
  onSave: (updated: DeckProject) => void;
  onBack: () => void;
}) {
  const [draft, setDraft] = useState<DeckProject>(() => structuredClone(deck));
  const [tab, setTab] = useState('basic');
  const [leaveConfirm, setLeaveConfirm] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // 保存前にschemaを通す。schema不正なデッキを保存するとstore読み込みが
  // 破損扱いになるため、保存自体をブロックして理由を表示する。
  const handleSave = () => {
    const parsed = deckProjectSchema.safeParse(draft);
    if (!parsed.success) {
      const first = parsed.error.issues[0];
      setSaveError(
        `保存できません: ${first?.path.join('.') ?? ''} ${first?.message ?? '入力を確認してください'}`,
      );
      return;
    }
    setSaveError(null);
    onSave(parsed.data);
  };
  const validation = useMemo(() => validateDeckProject({ deck: draft }), [draft]);
  const activeVariant = draft.variants.find((v) => v.id === draft.activeVariantId);
  const isDirty = useMemo(() => JSON.stringify(draft) !== JSON.stringify(deck), [draft, deck]);

  const updateVariant = (
    update: (variant: NonNullable<typeof activeVariant>) => NonNullable<typeof activeVariant>,
  ) => {
    setDraft((current) => ({
      ...current,
      variants: current.variants.map((variant) =>
        variant.id === current.activeVariantId ? update(variant) : variant,
      ),
    }));
  };

  // ---- カテゴリ操作 ----
  const addCategory = () => {
    const id = nextId('cat', draft.categories.map((c) => c.id));
    setDraft({
      ...draft,
      categories: [
        ...draft.categories,
        {
          id,
          name: `カテゴリ${draft.categories.length + 1}`,
          color: CATEGORY_COLORS[draft.categories.length % CATEGORY_COLORS.length]!,
          priority: 50,
        },
      ],
    });
  };
  const updateCategory = (id: string, patch: Partial<CategoryDefinition>) => {
    setDraft({
      ...draft,
      categories: draft.categories.map((c) => (c.id === id ? { ...c, ...patch } : c)),
    });
  };
  const removeCategory = (id: string) => {
    setDraft({
      ...draft,
      categories: draft.categories.filter((c) => c.id !== id),
    });
  };

  // ---- 牌操作 ----
  const addTile = () => {
    const firstCategory = draft.categories[0];
    if (!firstCategory) {
      return;
    }
    const id = nextId('tile', draft.tiles.map((t) => t.id));
    setDraft({
      ...draft,
      tiles: [
        ...draft.tiles,
        {
          id,
          name: `新しい牌${draft.tiles.length + 1}`,
          categories: [firstCategory.id],
          primaryCategoryId: firstCategory.id,
          fallbackLabel: '新',
          count: 3,
        },
      ],
    });
  };
  const updateTile = (id: string, patch: Partial<TileDefinition>) => {
    setDraft({
      ...draft,
      tiles: draft.tiles.map((t) => (t.id === id ? { ...t, ...patch } : t)),
    });
  };
  const toggleTileCategory = (tile: TileDefinition, categoryId: string) => {
    const has = tile.categories.includes(categoryId);
    const categories = has
      ? tile.categories.filter((c) => c !== categoryId)
      : [...tile.categories, categoryId];
    if (categories.length === 0) {
      return; // 牌は最低1カテゴリ必要
    }
    const primaryCategoryId = categories.includes(tile.primaryCategoryId)
      ? tile.primaryCategoryId
      : categories[0]!;
    updateTile(tile.id, { categories, primaryCategoryId });
  };
  const removeTile = (id: string) => {
    setDraft({ ...draft, tiles: draft.tiles.filter((t) => t.id !== id) });
  };

  // ---- 役テンプレート(docs/70 §18): 構築ロジックはsrc/app/editorTemplates.tsの純関数 ----
  const addRoleFromTemplate = (
    template: 'threeSameCategory' | 'threeDifferentCategories' | 'threeSameTile',
    categoryId?: string,
  ) => {
    updateVariant((variant) => {
      const existingIds = variant.winRoles.map((r) => r.id);
      let role: WinRole | null = null;
      if (template === 'threeSameCategory' && categoryId) {
        const category = draft.categories.find((c) => c.id === categoryId);
        if (category) {
          role = buildSameCategoryRoleTemplate(category, existingIds);
        }
      }
      if (template === 'threeDifferentCategories') {
        role = buildThreeDifferentCategoriesRoleTemplate(draft.categories.slice(0, 3), existingIds);
      }
      if (template === 'threeSameTile') {
        role = buildSameTileRoleTemplate(existingIds);
      }
      if (!role) {
        return variant;
      }
      return { ...variant, winRoles: [...variant.winRoles, role] };
    });
  };
  const updateRole = (roleId: string, patch: Partial<WinRole>) => {
    updateVariant((variant) => ({
      ...variant,
      winRoles: variant.winRoles.map((role) =>
        role.id === roleId ? { ...role, ...patch } : role,
      ),
    }));
  };
  const removeRole = (roleId: string) => {
    updateVariant((variant) => ({
      ...variant,
      winRoles: variant.winRoles.filter((role) => role.id !== roleId),
    }));
  };

  const [templateCategoryId, setTemplateCategoryId] = useState('');
  const [setTileIds, setSetTileIds] = useState<[string, string, string]>(['', '', '']);
  // 同じ牌を複数スロットで選んでいないか(重複はテンプレート生成を許可しない)
  const setTileIdsHaveDuplicate =
    setTileIds.some((id) => id !== '') &&
    new Set(setTileIds.filter((id) => id !== '')).size !== setTileIds.filter((id) => id !== '').length;
  const canAddSpecificSetRole =
    setTileIds.every((id) => id !== '') &&
    new Set(setTileIds).size === 3 &&
    templateCategoryId !== '';

  // specificSet + 同カテゴリ2組 (100点) テンプレート
  const addSpecificSetRole = () => {
    const category = draft.categories.find((c) => c.id === templateCategoryId);
    if (!category) {
      return;
    }
    const tiles = setTileIds.map((tileId) => {
      const tile = draft.tiles.find((t) => t.id === tileId);
      return { id: tileId, name: tile?.name ?? tileId };
    });
    updateVariant((variant) => {
      const role = buildSpecificSetRoleTemplate(
        { tiles, category },
        variant.winRoles.map((r) => r.id),
      );
      if (!role) {
        return variant;
      }
      return { ...variant, winRoles: [...variant.winRoles, role] };
    });
  };

  // ---- ボーナス操作(構築ロジックはsrc/app/editorTemplates.ts) ----
  const addSpecialBonus = (categoryId: string) => {
    const category = draft.categories.find((c) => c.id === categoryId);
    if (!category) {
      return;
    }
    updateVariant((variant) => {
      const bonus = buildSpecialBonusTemplate(
        category,
        variant.specialBonuses.map((b) => b.id),
      );
      return { ...variant, specialBonuses: [...variant.specialBonuses, bonus] };
    });
  };
  const updateSpecialBonus = (id: string, patch: Partial<ReturnType<typeof buildSpecialBonusTemplate>>) => {
    updateVariant((variant) => ({
      ...variant,
      specialBonuses: variant.specialBonuses.map((b) => (b.id === id ? { ...b, ...patch } : b)),
    }));
  };
  const removeSpecialBonus = (id: string) => {
    updateVariant((variant) => ({
      ...variant,
      specialBonuses: variant.specialBonuses.filter((b) => b.id !== id),
    }));
  };
  const addScoreBonus = () => {
    updateVariant((variant) => {
      const bonus = buildScoreBonusTemplate(variant.scoreBonuses.map((b) => b.id));
      return { ...variant, scoreBonuses: [...variant.scoreBonuses, bonus] };
    });
  };
  const updateScoreBonus = (id: string, patch: Partial<ReturnType<typeof buildScoreBonusTemplate>>) => {
    updateVariant((variant) => ({
      ...variant,
      scoreBonuses: variant.scoreBonuses.map((b) => (b.id === id ? { ...b, ...patch } : b)),
    }));
  };
  const removeScoreBonus = (id: string) => {
    updateVariant((variant) => ({
      ...variant,
      scoreBonuses: variant.scoreBonuses.filter((b) => b.id !== id),
    }));
  };

  return (
    <div className="sp-screen">
      <div className="sp-screen__header">
        <h1 className="sp-screen__title">デッキ編集</h1>
        <Badge variant={validation.status === 'playable' ? 'info' : 'warning'}>
          {validation.status === 'playable'
            ? '遊べる'
            : validation.status === 'playableWithWarnings'
              ? '注意あり'
              : '要修正(対局不可)'}
        </Badge>
        <div className="sp-screen__spacer" />
        <Button variant="primary" onClick={handleSave}>
          保存する
        </Button>
        <Button
          variant="ghost"
          onClick={() => (isDirty ? setLeaveConfirm(true) : onBack())}
        >
          もどる
        </Button>
      </div>
      {saveError !== null && (
        <div className="sp-insight-strip">
          <span className="sp-insight-strip__item">{saveError}</span>
        </div>
      )}
      <Tabs
        items={[
          { id: 'basic', label: '基本' },
          { id: 'categories', label: `カテゴリ (${draft.categories.length})` },
          { id: 'tiles', label: `牌 (${draft.tiles.length})` },
          { id: 'roles', label: `役 (${activeVariant?.winRoles.length ?? 0})` },
          {
            id: 'bonuses',
            label: `ボーナス (${(activeVariant?.specialBonuses.length ?? 0) + (activeVariant?.scoreBonuses.length ?? 0)})`,
          },
        ]}
        activeId={tab}
        onSelect={setTab}
      />
      <div className="sp-screen__body">
        <div className="sp-screen__col sp-screen__col--main sp-screen__col--scroll">
          {tab === 'basic' && (
            <PaperPanel title="基本情報">
              <label className="sp-field">
                デッキ名
                <input
                  type="text"
                  value={draft.name}
                  maxLength={80}
                  onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                />
              </label>
              <label className="sp-field" style={{ marginTop: 'var(--sp-space-8)' }}>
                説明
                <textarea
                  rows={2}
                  maxLength={500}
                  value={draft.description ?? ''}
                  onChange={(e) => setDraft({ ...draft, description: e.target.value })}
                />
              </label>
            </PaperPanel>
          )}

          {tab === 'categories' && (
            <PaperPanel title="カテゴリ">
              <div className="sp-screen__col" style={{ gap: 'var(--sp-space-8)' }}>
                {draft.categories.map((category) => (
                  <div
                    key={category.id}
                    style={{ display: 'flex', gap: 'var(--sp-space-8)', alignItems: 'center', flexWrap: 'wrap' }}
                  >
                    <CategoryChip
                      name={category.name}
                      color={category.color}
                      {...(category.icon !== undefined ? { icon: category.icon } : {})}
                    />
                    <input
                      type="text"
                      aria-label="カテゴリ名"
                      value={category.name}
                      maxLength={20}
                      style={{ width: '9em' }}
                      onChange={(e) => updateCategory(category.id, { name: e.target.value })}
                    />
                    <input
                      type="color"
                      aria-label="カテゴリ色"
                      value={category.color}
                      onChange={(e) => updateCategory(category.id, { color: e.target.value })}
                    />
                    <input
                      type="text"
                      aria-label="アイコン絵文字"
                      value={category.icon ?? ''}
                      maxLength={4}
                      placeholder="絵文字"
                      style={{ width: '4em' }}
                      onChange={(e) =>
                        updateCategory(
                          category.id,
                          e.target.value === '' ? { icon: undefined } : { icon: e.target.value },
                        )
                      }
                    />
                    <Button variant="ghost" onClick={() => removeCategory(category.id)}>
                      削除
                    </Button>
                  </div>
                ))}
                <Button variant="ink" onClick={addCategory}>
                  カテゴリを追加
                </Button>
              </div>
            </PaperPanel>
          )}

          {tab === 'tiles' && (
            <PaperPanel title="牌">
              <div className="sp-screen__col" style={{ gap: 'var(--sp-space-12)' }}>
                {draft.tiles.map((tile) => (
                  <div
                    key={tile.id}
                    style={{
                      borderBottom: '1px solid rgba(36,26,16,0.25)',
                      paddingBottom: 'var(--sp-space-8)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 'var(--sp-space-4)',
                    }}
                  >
                    <div style={{ display: 'flex', gap: 'var(--sp-space-8)', alignItems: 'center', flexWrap: 'wrap' }}>
                      <input
                        type="text"
                        aria-label="牌名"
                        value={tile.name}
                        maxLength={20}
                        style={{ width: '8em' }}
                        onChange={(e) => updateTile(tile.id, { name: e.target.value })}
                      />
                      <input
                        type="text"
                        aria-label="絵文字"
                        value={tile.emoji ?? ''}
                        maxLength={4}
                        placeholder="絵文字"
                        style={{ width: '4em' }}
                        onChange={(e) =>
                          updateTile(
                            tile.id,
                            e.target.value === '' ? { emoji: undefined } : { emoji: e.target.value },
                          )
                        }
                      />
                      <input
                        type="text"
                        aria-label="代替1文字"
                        value={tile.fallbackLabel}
                        maxLength={4}
                        style={{ width: '3em' }}
                        onChange={(e) => updateTile(tile.id, { fallbackLabel: e.target.value })}
                      />
                      <label className="sp-field" style={{ flexDirection: 'row', alignItems: 'center', gap: '4px' }}>
                        枚数
                        <input
                          type="number"
                          min={1}
                          max={10}
                          value={tile.count}
                          onChange={(e) => {
                            const value = Number.parseInt(e.target.value, 10);
                            if (Number.isInteger(value) && value >= 1 && value <= 10) {
                              updateTile(tile.id, { count: value });
                            }
                          }}
                        />
                      </label>
                      <Button variant="ghost" onClick={() => removeTile(tile.id)}>
                        削除
                      </Button>
                    </div>
                    <div style={{ display: 'flex', gap: 'var(--sp-space-8)', flexWrap: 'wrap', fontSize: 'var(--sp-font-xs)' }}>
                      {draft.categories.map((category) => (
                        <label key={category.id} style={{ display: 'inline-flex', gap: '3px', alignItems: 'center' }}>
                          <input
                            type="checkbox"
                            checked={tile.categories.includes(category.id)}
                            onChange={() => toggleTileCategory(tile, category.id)}
                          />
                          {category.name}
                        </label>
                      ))}
                      <label style={{ display: 'inline-flex', gap: '3px', alignItems: 'center' }}>
                        主カテゴリ
                        <select
                          value={tile.primaryCategoryId}
                          onChange={(e) => updateTile(tile.id, { primaryCategoryId: e.target.value })}
                        >
                          {tile.categories.map((categoryId) => (
                            <option key={categoryId} value={categoryId}>
                              {draft.categories.find((c) => c.id === categoryId)?.name ?? categoryId}
                            </option>
                          ))}
                        </select>
                      </label>
                    </div>
                  </div>
                ))}
                <Button variant="ink" onClick={addTile} disabled={draft.categories.length === 0}>
                  牌を追加
                </Button>
              </div>
            </PaperPanel>
          )}

          {tab === 'roles' && (
            <>
              <PaperPanel variant="aged" title="役を追加(安全テンプレート)">
                <div style={{ display: 'flex', gap: 'var(--sp-space-8)', flexWrap: 'wrap', alignItems: 'center' }}>
                  <select
                    aria-label="テンプレート用カテゴリ"
                    value={templateCategoryId}
                    onChange={(e) => setTemplateCategoryId(e.target.value)}
                  >
                    <option value="">カテゴリを選ぶ</option>
                    {draft.categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                  <Button
                    variant="ink"
                    disabled={templateCategoryId === ''}
                    onClick={() => addRoleFromTemplate('threeSameCategory', templateCategoryId)}
                  >
                    同カテゴリ3組 (60点)
                  </Button>
                  <Button
                    variant="ink"
                    disabled={draft.categories.length < 3}
                    onClick={() => addRoleFromTemplate('threeDifferentCategories')}
                  >
                    3カテゴリ1組ずつ (80点)
                  </Button>
                  <Button variant="ink" onClick={() => addRoleFromTemplate('threeSameTile')}>
                    同じ牌3枚×3組 (120点)
                  </Button>
                </div>
                <div
                  style={{
                    display: 'flex',
                    gap: 'var(--sp-space-8)',
                    flexWrap: 'wrap',
                    alignItems: 'center',
                    marginTop: 'var(--sp-space-8)',
                  }}
                >
                  {([0, 1, 2] as const).map((slot) => (
                    <select
                      key={slot}
                      aria-label={`セット牌${slot + 1}`}
                      value={setTileIds[slot]}
                      onChange={(e) => {
                        const next: [string, string, string] = [...setTileIds];
                        next[slot] = e.target.value;
                        setSetTileIds(next);
                      }}
                    >
                      <option value="">牌{slot + 1}を選ぶ</option>
                      {draft.tiles.map((tile) => (
                        <option key={tile.id} value={tile.id}>
                          {tile.name}
                        </option>
                      ))}
                    </select>
                  ))}
                  <Button
                    variant="ink"
                    disabled={!canAddSpecificSetRole}
                    onClick={addSpecificSetRole}
                  >
                    指定3枚+同カテゴリ2組 (100点)
                  </Button>
                </div>
                {setTileIdsHaveDuplicate && (
                  <p style={{ fontSize: 'var(--sp-font-xs)', color: 'var(--sp-color-danger)', margin: '4px 0 0' }}>
                    同じ牌が複数のスロットで選ばれています。3枚とも別の牌を選んでください。
                  </p>
                )}
                <p style={{ fontSize: 'var(--sp-font-xs)', color: 'var(--sp-color-ink-soft)', margin: '4px 0 0' }}>
                  指定セットは上のカテゴリ選択も使います(残り2組のカテゴリ)。
                </p>
              </PaperPanel>
              <PaperPanel title="役の一覧">
                <div className="sp-screen__col" style={{ gap: 'var(--sp-space-8)' }}>
                  {activeVariant?.winRoles.map((role) => (
                    <div key={role.id} style={{ display: 'flex', gap: 'var(--sp-space-8)', alignItems: 'center', flexWrap: 'wrap' }}>
                      <input
                        type="text"
                        aria-label="役名"
                        value={role.name}
                        maxLength={30}
                        style={{ width: '9em' }}
                        onChange={(e) => updateRole(role.id, { name: e.target.value })}
                      />
                      <input
                        type="number"
                        aria-label="点数"
                        min={1}
                        max={999}
                        value={role.basePoints}
                        onChange={(e) => {
                          const value = Number.parseInt(e.target.value, 10);
                          if (Number.isInteger(value) && value >= 1 && value <= 999) {
                            updateRole(role.id, { basePoints: value });
                          }
                        }}
                      />
                      <span style={{ fontSize: 'var(--sp-font-xs)', color: 'var(--sp-color-ink-soft)', flex: 1, minWidth: '10em' }}>
                        {role.explanation}
                      </span>
                      <Button variant="ghost" onClick={() => removeRole(role.id)}>
                        削除
                      </Button>
                    </div>
                  ))}
                </div>
              </PaperPanel>
            </>
          )}
          {tab === 'bonuses' && (
            <>
              <PaperPanel variant="aged" title="特別ボーナス(単体ではあがれない)">
                <div style={{ display: 'flex', gap: 'var(--sp-space-8)', alignItems: 'center', flexWrap: 'wrap', marginBottom: 'var(--sp-space-8)' }}>
                  <select
                    aria-label="ボーナス用カテゴリ"
                    value={templateCategoryId}
                    onChange={(e) => setTemplateCategoryId(e.target.value)}
                  >
                    <option value="">カテゴリを選ぶ</option>
                    {draft.categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                  <Button
                    variant="ink"
                    disabled={templateCategoryId === ''}
                    onClick={() => addSpecialBonus(templateCategoryId)}
                  >
                    カテゴリ3枚以上で加点 (20点)
                  </Button>
                </div>
                <div className="sp-screen__col" style={{ gap: 'var(--sp-space-6)' }}>
                  {activeVariant?.specialBonuses.map((bonus) => (
                    <div key={bonus.id} style={{ display: 'flex', gap: 'var(--sp-space-8)', alignItems: 'center', flexWrap: 'wrap' }}>
                      <input
                        type="text"
                        aria-label="ボーナス名"
                        value={bonus.name}
                        maxLength={30}
                        style={{ width: '11em' }}
                        onChange={(e) => updateSpecialBonus(bonus.id, { name: e.target.value })}
                      />
                      <input
                        type="number"
                        aria-label="ボーナス点数"
                        min={1}
                        max={300}
                        value={bonus.points}
                        onChange={(e) => {
                          const value = Number.parseInt(e.target.value, 10);
                          if (Number.isInteger(value) && value >= 1 && value <= 300) {
                            updateSpecialBonus(bonus.id, { points: value });
                          }
                        }}
                      />
                      <span style={{ fontSize: 'var(--sp-font-xs)', color: 'var(--sp-color-ink-soft)', flex: 1, minWidth: '10em' }}>
                        {bonus.explanation}
                      </span>
                      <Button variant="ghost" onClick={() => removeSpecialBonus(bonus.id)}>
                        削除
                      </Button>
                    </div>
                  ))}
                </div>
              </PaperPanel>
              <PaperPanel title="スコアボーナス(機械的な加点)">
                <div style={{ marginBottom: 'var(--sp-space-8)' }}>
                  <Button variant="ink" onClick={addScoreBonus}>
                    同じ牌3枚ボーナスを追加 (15点)
                  </Button>
                </div>
                <div className="sp-screen__col" style={{ gap: 'var(--sp-space-6)' }}>
                  {activeVariant?.scoreBonuses.map((bonus) => (
                    <div key={bonus.id} style={{ display: 'flex', gap: 'var(--sp-space-8)', alignItems: 'center', flexWrap: 'wrap' }}>
                      <input
                        type="text"
                        aria-label="スコアボーナス名"
                        value={bonus.name}
                        maxLength={30}
                        style={{ width: '11em' }}
                        onChange={(e) => updateScoreBonus(bonus.id, { name: e.target.value })}
                      />
                      <label className="sp-field" style={{ flexDirection: 'row', alignItems: 'center', gap: '4px' }}>
                        点数
                        <input
                          type="number"
                          aria-label="スコアボーナス点数"
                          min={1}
                          max={300}
                          value={bonus.points}
                          onChange={(e) => {
                            const value = Number.parseInt(e.target.value, 10);
                            if (Number.isInteger(value) && value >= 1 && value <= 300) {
                              updateScoreBonus(bonus.id, { points: value });
                            }
                          }}
                        />
                      </label>
                      <label className="sp-field" style={{ flexDirection: 'row', alignItems: 'center', gap: '4px' }}>
                        上限
                        <input
                          type="number"
                          aria-label="スコアボーナス上限"
                          min={1}
                          max={900}
                          value={bonus.maxPoints ?? bonus.points}
                          onChange={(e) => {
                            const value = Number.parseInt(e.target.value, 10);
                            if (Number.isInteger(value) && value >= 1 && value <= 900) {
                              updateScoreBonus(bonus.id, { maxPoints: value });
                            }
                          }}
                        />
                      </label>
                      <Button variant="ghost" onClick={() => removeScoreBonus(bonus.id)}>
                        削除
                      </Button>
                    </div>
                  ))}
                </div>
              </PaperPanel>
            </>
          )}
        </div>
        <div className="sp-screen__col sp-screen__col--side sp-screen__col--scroll">
          <PaperPanel variant="ink" title="検証">
            {validation.issues.length === 0 ? (
              <span style={{ fontSize: 'var(--sp-font-xs)' }}>問題なし。</span>
            ) : (
              <ul className="sp-issue-list">
                {validation.issues.map((issue, i) => (
                  <li key={`${issue.code}-${i}`}>
                    <Badge variant={issue.severity === 'info' ? 'info' : 'warning'}>
                      {issue.code}
                    </Badge>{' '}
                    {issue.message}
                  </li>
                ))}
              </ul>
            )}
          </PaperPanel>
        </div>
      </div>
      <Modal open={leaveConfirm} title="保存していない変更があります" onClose={() => setLeaveConfirm(false)}>
        <p style={{ marginTop: 0, fontSize: 'var(--sp-font-sm)' }}>
          もどると編集内容は失われます。
        </p>
        <div style={{ display: 'flex', gap: 'var(--sp-space-8)' }}>
          <Button variant="primary" onClick={onBack}>
            破棄してもどる
          </Button>
          <Button variant="ghost" onClick={() => setLeaveConfirm(false)}>
            編集をつづける
          </Button>
        </div>
      </Modal>
    </div>
  );
}
