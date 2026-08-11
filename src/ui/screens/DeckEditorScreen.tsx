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
import { DeckBonusWorkbench } from '../components/DeckBonusWorkbench';
import { DeckCategoryWorkbench } from '../components/DeckCategoryWorkbench';
import { DeckEditorInspector } from '../components/DeckEditorInspector';
import { DeckRoleWorkbench } from '../components/DeckRoleWorkbench';
import { DeckTileWorkbench } from '../components/DeckTileWorkbench';
import { Dialog } from '../components/Dialog';
import { FormField, TextField } from '../components/FormField';
import { PaperPanel } from '../components/PaperPanel';
import { Tabs } from '../components/Tab';
import { TileCard } from '../components/TileCard';

const CATEGORY_COLORS = ['#EF4444', '#3B82F6', '#22C55E', '#F59E0B', '#7C3AED', '#06B6D4', '#EC4899', '#84CC16'];

function nextId(prefix: string, existing: string[]): string {
  let n = existing.length + 1;
  while (existing.includes(`${prefix}${n}`)) n += 1;
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
  const [templateCategoryId, setTemplateCategoryId] = useState('');

  const validation = useMemo(() => validateDeckForUse(draft), [draft]);
  const activeVariant = draft.variants.find((variant) => variant.id === draft.activeVariantId);
  const isDirty = useMemo(() => JSON.stringify(draft) !== JSON.stringify(deck), [draft, deck]);
  const categoryById = new Map(draft.categories.map((category) => [category.id, category]));
  const previewTiles = draft.tiles.slice(0, 8);
  const totalTiles = draft.tiles.reduce((sum, tile) => sum + tile.count, 0);
  const bonusCount =
    (activeVariant?.specialBonuses.length ?? 0) + (activeVariant?.scoreBonuses.length ?? 0);

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

  const addCategory = () => {
    const id = nextId('cat', draft.categories.map((category) => category.id));
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
      categories: draft.categories.map((category) =>
        category.id === id ? { ...category, ...patch } : category,
      ),
    });
  };
  const removeCategory = (id: string) => {
    setDraft({ ...draft, categories: draft.categories.filter((category) => category.id !== id) });
  };

  const addTile = () => {
    const firstCategory = draft.categories[0];
    if (!firstCategory) return;
    const id = nextId('tile', draft.tiles.map((tile) => tile.id));
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
      tiles: draft.tiles.map((tile) => (tile.id === id ? { ...tile, ...patch } : tile)),
    });
  };
  const toggleTileCategory = (tile: TileDefinition, categoryId: string) => {
    const has = tile.categories.includes(categoryId);
    const categories = has
      ? tile.categories.filter((current) => current !== categoryId)
      : [...tile.categories, categoryId];
    if (categories.length === 0) return;
    const primaryCategoryId = categories.includes(tile.primaryCategoryId)
      ? tile.primaryCategoryId
      : categories[0]!;
    updateTile(tile.id, { categories, primaryCategoryId });
  };
  const removeTile = (id: string) => {
    setDraft({ ...draft, tiles: draft.tiles.filter((tile) => tile.id !== id) });
  };

  const addRoleFromTemplate = (
    template: 'threeSameCategory' | 'threeDifferentCategories' | 'threeSameTile',
    categoryId?: string,
  ) => {
    updateVariant((variant) => {
      const existingIds = variant.winRoles.map((role) => role.id);
      let role: WinRole | null = null;
      if (template === 'threeSameCategory' && categoryId) {
        const category = draft.categories.find((current) => current.id === categoryId);
        if (category) role = buildSameCategoryRoleTemplate(category, existingIds);
      }
      if (template === 'threeDifferentCategories') {
        role = buildThreeDifferentCategoriesRoleTemplate(draft.categories.slice(0, 3), existingIds);
      }
      if (template === 'threeSameTile') role = buildSameTileRoleTemplate(existingIds);
      if (!role) return variant;
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
  const addSpecificSetRole = (categoryId: string, tileIds: [string, string, string]) => {
    const category = draft.categories.find((current) => current.id === categoryId);
    if (!category) return;
    const tiles = tileIds.map((tileId) => {
      const tile = draft.tiles.find((current) => current.id === tileId);
      return { id: tileId, name: tile?.name ?? tileId };
    });
    updateVariant((variant) => {
      const role = buildSpecificSetRoleTemplate(
        { tiles, category },
        variant.winRoles.map((current) => current.id),
      );
      if (!role) return variant;
      return { ...variant, winRoles: [...variant.winRoles, role] };
    });
  };

  const addSpecialBonus = (categoryId: string) => {
    const category = draft.categories.find((current) => current.id === categoryId);
    if (!category) return;
    updateVariant((variant) => {
      const bonus = buildSpecialBonusTemplate(
        category,
        variant.specialBonuses.map((current) => current.id),
      );
      return { ...variant, specialBonuses: [...variant.specialBonuses, bonus] };
    });
  };
  const updateSpecialBonus = (
    id: string,
    patch: Partial<ReturnType<typeof buildSpecialBonusTemplate>>,
  ) => {
    updateVariant((variant) => ({
      ...variant,
      specialBonuses: variant.specialBonuses.map((bonus) =>
        bonus.id === id ? { ...bonus, ...patch } : bonus,
      ),
    }));
  };
  const removeSpecialBonus = (id: string) => {
    updateVariant((variant) => ({
      ...variant,
      specialBonuses: variant.specialBonuses.filter((bonus) => bonus.id !== id),
    }));
  };
  const addScoreBonus = () => {
    updateVariant((variant) => {
      const bonus = buildScoreBonusTemplate(variant.scoreBonuses.map((current) => current.id));
      return { ...variant, scoreBonuses: [...variant.scoreBonuses, bonus] };
    });
  };
  const updateScoreBonus = (
    id: string,
    patch: Partial<ReturnType<typeof buildScoreBonusTemplate>>,
  ) => {
    updateVariant((variant) => ({
      ...variant,
      scoreBonuses: variant.scoreBonuses.map((bonus) =>
        bonus.id === id ? { ...bonus, ...patch } : bonus,
      ),
    }));
  };
  const removeScoreBonus = (id: string) => {
    updateVariant((variant) => ({
      ...variant,
      scoreBonuses: variant.scoreBonuses.filter((bonus) => bonus.id !== id),
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
        <Button variant="primary" onClick={handleSave} disabled={!isDirty}>
          保存する
        </Button>
        <Button variant="ghost" onClick={() => (isDirty ? setLeaveConfirm(true) : onBack())}>
          もどる
        </Button>
      </div>

      {saveError !== null && (
        <div className="sp-insight-strip" role="alert">
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
            label: `ボーナス (${bonusCount})`,
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
          aria-labelledby={`sp-tab-${tab}`}
        >
          {tab === 'basic' && (
            <PaperPanel title="デッキ台帳">
              <div className="sp-deck-basic-ledger">
                <div className="sp-deck-basic-ledger__form">
                  <FormField label="デッキ名">
                    <TextField
                      label="デッキ名"
                      value={draft.name}
                      maxLength={80}
                      onChange={(name) => setDraft({ ...draft, name })}
                    />
                  </FormField>
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

                <section className="sp-deck-basic-ledger__identity" aria-label="現在のデッキ構成">
                  <div className="sp-deck-basic-ledger__identity-head">
                    <span>DECK FACE</span>
                    <strong>{draft.name || '名称未設定'}</strong>
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
                    <div><dt>種類</dt><dd>{draft.tiles.length}</dd></div>
                    <div><dt>カテゴリ</dt><dd>{draft.categories.length}</dd></div>
                    <div><dt>役</dt><dd>{activeVariant?.winRoles.length ?? 0}</dd></div>
                    <div><dt>ボーナス</dt><dd>{bonusCount}</dd></div>
                  </dl>
                </section>
              </div>
            </PaperPanel>
          )}

          {tab === 'categories' && (
            <DeckCategoryWorkbench
              categories={draft.categories}
              tiles={draft.tiles}
              onAddCategory={addCategory}
              onUpdateCategory={updateCategory}
              onRemoveCategory={removeCategory}
            />
          )}

          {tab === 'tiles' && (
            <DeckTileWorkbench
              tiles={draft.tiles}
              categories={draft.categories}
              onAddTile={addTile}
              onUpdateTile={updateTile}
              onToggleCategory={toggleTileCategory}
              onRemoveTile={removeTile}
            />
          )}

          {tab === 'roles' && activeVariant && (
            <DeckRoleWorkbench
              categories={draft.categories}
              tiles={draft.tiles}
              roles={activeVariant.winRoles}
              templateCategoryId={templateCategoryId}
              onTemplateCategoryChange={setTemplateCategoryId}
              onAddRoleFromTemplate={addRoleFromTemplate}
              onAddSpecificSetRole={addSpecificSetRole}
              onUpdateRole={updateRole}
              onRemoveRole={removeRole}
            />
          )}

          {tab === 'bonuses' && activeVariant && (
            <DeckBonusWorkbench
              categories={draft.categories}
              specialBonuses={activeVariant.specialBonuses}
              scoreBonuses={activeVariant.scoreBonuses}
              templateCategoryId={templateCategoryId}
              onTemplateCategoryChange={setTemplateCategoryId}
              onAddSpecialBonus={addSpecialBonus}
              onAddScoreBonus={addScoreBonus}
              onUpdateSpecialBonus={updateSpecialBonus}
              onRemoveSpecialBonus={removeSpecialBonus}
              onUpdateScoreBonus={updateScoreBonus}
              onRemoveScoreBonus={removeScoreBonus}
            />
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
