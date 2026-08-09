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
import { validateDeckForUse } from '../../engine/validation/validateDeckForUse';
import { deckProjectSchema } from '../../schemas/deckProjectSchema';
import { Badge } from '../components/Badge';
import { Button } from '../components/Button';
import { CategoryChip } from '../components/CategoryChip';
import { DeckEditorInspector } from '../components/DeckEditorInspector';
import { Dialog } from '../components/Dialog';
import {
  ColorField,
  FormField,
  NumberField,
  SelectField,
  TextField,
  Toggle,
} from '../components/FormField';
import { PaperPanel } from '../components/PaperPanel';
import { Tabs } from '../components/Tab';
import { TileCard } from '../components/TileCard';

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
  const validation = useMemo(() => validateDeckForUse(draft), [draft]);
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
        <div
          className="sp-screen__col sp-screen__col--main sp-screen__col--scroll"
          role="tabpanel"
          id={`sp-tabpanel-${tab}`}
        >
          {tab === 'basic' && (
            <PaperPanel title="基本情報">
              <FormField label="デッキ名">
                <TextField
                  label="デッキ名"
                  value={draft.name}
                  maxLength={80}
                  onChange={(name) => setDraft({ ...draft, name })}
                />
              </FormField>
              <div style={{ marginTop: 'var(--sp-space-8)' }}>
                <FormField label="説明">
                  <TextField
                    label="説明"
                    multiline
                    rows={2}
                    maxLength={500}
                    value={draft.description ?? ''}
                    onChange={(description) => setDraft({ ...draft, description })}
                  />
                </FormField>
              </div>
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
                    <TextField
                      label="カテゴリ名"
                      value={category.name}
                      maxLength={20}
                      width="9em"
                      onChange={(name) => updateCategory(category.id, { name })}
                    />
                    <ColorField
                      label="カテゴリ色"
                      value={category.color}
                      onChange={(color) => updateCategory(category.id, { color })}
                    />
                    <TextField
                      label="アイコン絵文字"
                      value={category.icon ?? ''}
                      maxLength={4}
                      placeholder="絵文字"
                      width="4em"
                      onChange={(icon) =>
                        updateCategory(category.id, icon === '' ? { icon: undefined } : { icon })
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
                {draft.tiles.map((tile) => {
                  const primaryCategory = draft.categories.find(
                    (category) => category.id === tile.primaryCategoryId,
                  );
                  return (
                    <div
                      key={tile.id}
                      style={{
                        borderBottom: 'var(--sp-border-divider-ink)',
                        paddingBottom: 'var(--sp-space-8)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 'var(--sp-space-4)',
                      }}
                    >
                      <div style={{ display: 'flex', gap: 'var(--sp-space-8)', alignItems: 'center', flexWrap: 'wrap' }}>
                        <div className="sp-deck-editor-tile-preview" aria-label={`${tile.name}のプレビュー`}>
                          <TileCard
                            name={tile.name}
                            {...(tile.emoji !== undefined ? { emoji: tile.emoji } : {})}
                            fallbackLabel={tile.fallbackLabel}
                            {...(primaryCategory
                              ? {
                                  categoryColor: primaryCategory.color,
                                  categoryName: primaryCategory.name,
                                }
                              : {})}
                            showName={false}
                            interactive={false}
                          />
                          <span aria-hidden="true">×{tile.count}</span>
                        </div>
                        <TextField
                          label="牌名"
                          value={tile.name}
                          maxLength={20}
                          width="8em"
                          onChange={(name) => updateTile(tile.id, { name })}
                        />
                        <TextField
                          label="絵文字"
                          value={tile.emoji ?? ''}
                          maxLength={4}
                          placeholder="絵文字"
                          width="4em"
                          onChange={(emoji) =>
                            updateTile(tile.id, emoji === '' ? { emoji: undefined } : { emoji })
                          }
                        />
                        <TextField
                          label="代替1文字"
                          value={tile.fallbackLabel}
                          maxLength={4}
                          width="3em"
                          onChange={(fallbackLabel) => updateTile(tile.id, { fallbackLabel })}
                        />
                        <FormField label="枚数" inline>
                          <NumberField
                            label="枚数"
                            min={1}
                            max={10}
                            value={tile.count}
                            onChange={(count) => updateTile(tile.id, { count })}
                          />
                        </FormField>
                        <Button variant="ghost" onClick={() => removeTile(tile.id)}>
                          削除
                        </Button>
                      </div>
                      <div style={{ display: 'flex', gap: 'var(--sp-space-8)', flexWrap: 'wrap', fontSize: 'var(--sp-font-xs)' }}>
                        {draft.categories.map((category) => (
                          <Toggle
                            key={category.id}
                            label={category.name}
                            checked={tile.categories.includes(category.id)}
                            onChange={() => toggleTileCategory(tile, category.id)}
                          />
                        ))}
                        <FormField label="主カテゴリ" inline>
                          <SelectField
                            label="主カテゴリ"
                            value={tile.primaryCategoryId}
                            onChange={(primaryCategoryId) => updateTile(tile.id, { primaryCategoryId })}
                            options={tile.categories.map((categoryId) => ({
                              value: categoryId,
                              label: draft.categories.find((c) => c.id === categoryId)?.name ?? categoryId,
                            }))}
                          />
                        </FormField>
                      </div>
                    </div>
                  );
                })}
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
                  <SelectField
                    label="テンプレート用カテゴリ"
                    value={templateCategoryId}
                    onChange={setTemplateCategoryId}
                    placeholder="カテゴリを選ぶ"
                    options={draft.categories.map((category) => ({
                      value: category.id,
                      label: category.name,
                    }))}
                  />
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
                    <SelectField
                      key={slot}
                      label={`セット牌${slot + 1}`}
                      value={setTileIds[slot]}
                      onChange={(tileId) => {
                        const next: [string, string, string] = [...setTileIds];
                        next[slot] = tileId;
                        setSetTileIds(next);
                      }}
                      placeholder={`牌${slot + 1}を選ぶ`}
                      options={draft.tiles.map((tile) => ({ value: tile.id, label: tile.name }))}
                    />
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
                      <TextField
                        label="役名"
                        value={role.name}
                        maxLength={30}
                        width="9em"
                        onChange={(name) => updateRole(role.id, { name })}
                      />
                      <NumberField
                        label="点数"
                        min={1}
                        max={999}
                        value={role.basePoints}
                        onChange={(basePoints) => updateRole(role.id, { basePoints })}
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
                  <SelectField
                    label="ボーナス用カテゴリ"
                    value={templateCategoryId}
                    onChange={setTemplateCategoryId}
                    placeholder="カテゴリを選ぶ"
                    options={draft.categories.map((category) => ({
                      value: category.id,
                      label: category.name,
                    }))}
                  />
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
                      <TextField
                        label="ボーナス名"
                        value={bonus.name}
                        maxLength={30}
                        width="11em"
                        onChange={(name) => updateSpecialBonus(bonus.id, { name })}
                      />
                      <NumberField
                        label="ボーナス点数"
                        min={1}
                        max={300}
                        value={bonus.points}
                        onChange={(points) => updateSpecialBonus(bonus.id, { points })}
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
                      <TextField
                        label="スコアボーナス名"
                        value={bonus.name}
                        maxLength={30}
                        width="11em"
                        onChange={(name) => updateScoreBonus(bonus.id, { name })}
                      />
                      <FormField label="点数" inline>
                        <NumberField
                          label="スコアボーナス点数"
                          min={1}
                          max={300}
                          value={bonus.points}
                          onChange={(points) => updateScoreBonus(bonus.id, { points })}
                        />
                      </FormField>
                      <FormField label="上限" inline>
                        <NumberField
                          label="スコアボーナス上限"
                          min={1}
                          max={900}
                          value={bonus.maxPoints ?? bonus.points}
                          onChange={(maxPoints) => updateScoreBonus(bonus.id, { maxPoints })}
                        />
                      </FormField>
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
          <DeckEditorInspector deck={draft} validation={validation} />
        </div>
      </div>
      <Dialog
        open={leaveConfirm}
        title="保存していない変更があります"
        message="もどると編集内容は失われます。"
        confirmLabel="破棄してもどる"
        cancelLabel="編集をつづける"
        danger
        onConfirm={onBack}
        onCancel={() => setLeaveConfirm(false)}
      />
    </div>
  );
}