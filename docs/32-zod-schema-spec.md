# Zod Schema Spec

## Purpose

TypeScript型と共有JSON/localStorageの検証仕様を固定する。

## Core Decision

```text
外部入力は必ずZodでparseする。
共有JSONに画像情報が入っていたら拒否する。
localStorageもschemaVersionを見てparseする。
```

## Schema Files

実装時は以下を作る。

```text
src/schemas/category.schema.ts
src/schemas/tile.schema.ts
src/schemas/rule-config.schema.ts
src/schemas/role.schema.ts
src/schemas/deck-project.schema.ts
src/schemas/match-result.schema.ts
src/schemas/progression.schema.ts
src/schemas/validation-issue.schema.ts
```

## Common ID Rules

```ts
const idSchema = z
  .string()
  .min(1)
  .max(80)
  .regex(/^[a-z0-9][a-z0-9_-]*$/);
```

表示名:

```ts
const displayNameSchema = z.string().min(1).max(40);
```

説明:

```ts
const descriptionSchema = z.string().max(300).optional();
```

色:

```ts
const colorSchema = z.string().regex(/^#[0-9a-fA-F]{6}$/);
```

## Forbidden Image Fields

共有JSONでは以下を禁止する。

```text
image
imageUrl
imageBase64
remoteImage
remoteImageUrl
localImageId
blobUrl
filePath
assetUrl
externalAssetUrl
```

DeckProject import時には、深い階層も含めてこれらのkeyがあれば拒否する。

## Category Schema

```ts
const tileCategorySchema = z.object({
  id: idSchema,
  name: displayNameSchema,
  color: colorSchema,
  priority: z.number().int().min(0).max(999).optional(),
  icon: z.string().max(8).optional(),
  description: descriptionSchema,
}).strict();
```

## Wildcard Schema

```ts
const wildcardRuleSchema = z.object({
  kind: z.enum(['any_tile', 'category_limited', 'specific_tiles']),
  categories: z.array(idSchema).optional(),
  tileIds: z.array(idSchema).optional(),
  maxUsePerRole: z.number().int().min(1).max(3).optional(),
  canCompleteWinRole: z.boolean(),
  canCompleteSpecialBonus: z.boolean(),
  canTriggerRonWhenDiscarded: z.boolean(),
  countsForScoreBonus: z.boolean(),
}).strict().superRefine((value, ctx) => {
  if (value.kind === 'category_limited' && (!value.categories || value.categories.length === 0)) {
    ctx.addIssue({ code: 'custom', message: 'category_limited wildcard requires categories' });
  }
  if (value.kind === 'specific_tiles' && (!value.tileIds || value.tileIds.length === 0)) {
    ctx.addIssue({ code: 'custom', message: 'specific_tiles wildcard requires tileIds' });
  }
});
```

## Tile Schema

```ts
const tileSchema = z.object({
  id: idSchema,
  name: displayNameSchema,
  categories: z.array(idSchema).min(1).max(20),
  primaryCategoryId: idSchema.optional(),
  emoji: z.string().max(8).optional(),
  fallbackLabel: z.string().min(1).max(4).optional(),
  count: z.number().int().min(1).max(20),
  wildcard: wildcardRuleSchema.optional(),
}).strict();
```

追加検証:

```text
primaryCategoryIdがcategoriesに含まれていなければerror
```

## RuleConfig Schema

```ts
const ruleConfigSchema = z.object({
  id: idSchema,
  name: displayNameSchema,
  handSizeNormal: z.number().int().min(1).max(20),
  handSizeAfterDraw: z.number().int().min(2).max(21),
  winHandSize: z.number().int().min(2).max(21),
  roleSpanMin: z.number().int().min(2).max(14),
  roleSpanMax: z.number().int().min(2).max(14),
  allowRon: z.boolean(),
  allowPon: z.literal(false),
  allowReach: z.boolean(),
  allowScoreBonus: z.boolean(),
  allowWildcard: z.boolean(),
  allowKan: z.literal(false),
  allowChi: z.literal(false),
}).strict().superRefine((value, ctx) => {
  if (value.handSizeAfterDraw !== value.handSizeNormal + 1) {
    ctx.addIssue({ code: 'custom', message: 'handSizeAfterDraw must be handSizeNormal + 1' });
  }
  if (value.winHandSize !== value.handSizeAfterDraw) {
    ctx.addIssue({ code: 'custom', message: 'winHandSize must equal handSizeAfterDraw' });
  }
  if (value.roleSpanMin > value.roleSpanMax) {
    ctx.addIssue({ code: 'custom', message: 'roleSpanMin must be <= roleSpanMax' });
  }
});
```

## RoleCondition Schema

```ts
const roleConditionSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('contains_all'), tileIds: z.array(idSchema).min(1) }).strict(),
  z.object({ type: z.literal('same_tile_count'), count: z.number().int().min(2).max(20) }).strict(),
  z.object({ type: z.literal('same_name_count'), name: displayNameSchema, count: z.number().int().min(2).max(20) }).strict(),
  z.object({ type: z.literal('same_category_count'), category: idSchema, count: z.number().int().min(1).max(20) }).strict(),
  z.object({ type: z.literal('all_different_categories'), count: z.number().int().min(2).max(20) }).strict(),
  z.object({ type: z.literal('exact_group'), tileIds: z.array(idSchema).min(1) }).strict(),
  z.object({ type: z.literal('choose_n_from'), tileIds: z.array(idSchema).min(1), choose: z.number().int().min(1).max(20) }).strict(),
]);
```

## Role Schema

```ts
const roleSchema = z.object({
  id: idSchema,
  name: displayNameSchema,
  kind: z.enum(['win_role', 'special_bonus', 'score_bonus']),
  points: z.number().int().min(0).max(9999),
  span: z.number().int().min(2).max(14),
  condition: roleConditionSchema,
  description: descriptionSchema,
  canTsumo: z.boolean(),
  canRon: z.boolean(),
  allowWildcard: z.boolean().optional(),
  maxWildcardUse: z.number().int().min(0).max(3).optional(),
  matchMode: z.enum(['contains_pattern', 'exact_hand']).optional(),
  coveragePolicy: z.enum(['allow_extra_tiles', 'must_cover_full_hand']).optional(),
}).strict().superRefine((value, ctx) => {
  if (value.kind !== 'win_role' && (value.canTsumo || value.canRon)) {
    ctx.addIssue({ code: 'custom', message: 'special_bonus and score_bonus cannot be tsumo/ron candidates' });
  }
  if (value.kind === 'win_role' && !value.canTsumo && !value.canRon) {
    ctx.addIssue({ code: 'custom', message: 'win_role should allow tsumo or ron' });
  }
});
```

## ScoreBonus Schema

```ts
const scoreBonusSchema = z.object({
  id: idSchema,
  name: displayNameSchema,
  type: z.enum(['duplicate_tile', 'duplicate_name', 'duplicate_category']),
  minCount: z.number().int().min(2).max(20),
  points: z.number().int().min(0).max(9999),
  maxPoints: z.number().int().min(0).max(9999).optional(),
  description: descriptionSchema,
  allowWildcard: z.boolean().optional(),
}).strict();
```

## DeckVariant Schema

```ts
const deckVariantSchema = z.object({
  id: idSchema,
  name: displayNameSchema,
  label: z.enum(['通常版', '拡張版']),
  ruleConfig: ruleConfigSchema,
  roles: z.array(roleSchema).min(1).max(300),
  scoreBonuses: z.array(scoreBonusSchema).max(100).optional(),
  isExperimental: z.boolean().optional(),
}).strict();
```

## DeckProject Schema

```ts
const deckProjectSchema = z.object({
  version: z.literal(1),
  id: idSchema,
  name: displayNameSchema,
  description: descriptionSchema,
  categories: z.array(tileCategorySchema).min(1).max(100),
  tiles: z.array(tileSchema).min(1).max(300),
  variants: z.array(deckVariantSchema).min(1).max(4),
  activeVariantId: idSchema,
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional(),
}).strict().superRefine((value, ctx) => {
  const variantIds = new Set(value.variants.map((variant) => variant.id));
  if (!variantIds.has(value.activeVariantId)) {
    ctx.addIssue({ code: 'custom', message: 'activeVariantId must exist in variants' });
  }

  const categoryIds = new Set(value.categories.map((category) => category.id));
  for (const tile of value.tiles) {
    if (tile.primaryCategoryId && !categoryIds.has(tile.primaryCategoryId)) {
      ctx.addIssue({ code: 'custom', message: `unknown primaryCategoryId: ${tile.primaryCategoryId}` });
    }
    for (const categoryId of tile.categories) {
      if (!categoryIds.has(categoryId)) {
        ctx.addIssue({ code: 'custom', message: `unknown tile category: ${categoryId}` });
      }
    }
  }
});
```

## Validation Mode

共有JSON import:

```text
strict parse
forbidden image field check
unknown fieldはerror
```

localStorage migration:

```text
versionを確認
古いversionはmigration
migration不能なら破棄前に確認
```

## Final Decision

- Zod schemaはTypeScript型より先に整備する
- 共有JSONはstrictに検証する
- 画像系fieldは拒否する
- special_bonus/score_bonusがロン候補になったらerror
- allowPon/allowKan/allowChiはliteral false
- DeckProject import後に参照整合性を検証する
