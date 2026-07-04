# Group-backed Schema Override

## Purpose

This document overrides older count/span-first schema ideas in `docs/32-zod-schema-spec.md`.

Reason:

The previous schema allowed normal MVP win roles to be too count-based and vague.

Normal MVP must be group-backed so role evaluation, waits, scoring, and UI explanations are implementable.

Related docs:

```text
docs/62-mahjong-structure-scoring-core.md
docs/63-typescript-engine-implementation-blueprint.md
docs/64-breaking-risk-review-and-fixes.md
```

## 1. Evaluation Mode

Add evaluation mode to RuleConfig.

```ts
const evaluationModeSchema = z.enum([
  'normalThreeGroups',
  'extendedRoleSpan',
]);
```

MVP normal variant must use:

```json
"evaluationMode": "normalThreeGroups"
```

Extended variant may use:

```json
"evaluationMode": "extendedRoleSpan"
```

Do not mix both modes inside one variant.

## 2. Normal RuleConfig

Normal MVP fixed values:

```ts
const normalRuleConfigSchema = z.object({
  id: idSchema,
  name: displayNameSchema,
  evaluationMode: z.literal('normalThreeGroups'),
  supportedPlayerCounts: z.array(z.union([z.literal(3), z.literal(4)])).min(1).max(2),
  handSizeNormal: z.literal(8),
  handSizeAfterDraw: z.literal(9),
  winHandSize: z.literal(9),
  groupSize: z.literal(3),
  groupCount: z.literal(3),
  allowRon: z.boolean(),
  allowPon: z.literal(false),
  allowKan: z.literal(false),
  allowChi: z.literal(false),
  allowReach: z.boolean(),
  allowScoreBonus: z.boolean(),
  allowWildcard: z.boolean(),
}).strict();
```

`roleSpanMin` and `roleSpanMax` are not used for normal MVP.

## 3. Extended RuleConfig

Extended rules are reserved and must be clearly separate.

```ts
const extendedRuleConfigSchema = z.object({
  id: idSchema,
  name: displayNameSchema,
  evaluationMode: z.literal('extendedRoleSpan'),
  supportedPlayerCounts: z.array(z.union([z.literal(3), z.literal(4)])).min(1).max(2),
  handSizeNormal: z.literal(13),
  handSizeAfterDraw: z.literal(14),
  winHandSize: z.literal(14),
  roleSpanMin: z.number().int().min(2).max(14),
  roleSpanMax: z.number().int().min(2).max(14),
  allowRon: z.boolean(),
  allowPon: z.literal(false),
  allowKan: z.literal(false),
  allowChi: z.literal(false),
  allowReach: z.boolean(),
  allowScoreBonus: z.boolean(),
  allowWildcard: z.boolean(),
}).strict();
```

MVP implementation should parse extended shape but may leave engine support pending.

## 4. Group Requirement Schema

```ts
const groupRequirementSchema = z.object({
  groupType: z.enum(['sameTile', 'sameCategory', 'sameTag', 'specificSet', 'freeSet']),
  categoryId: idSchema.optional(),
  tag: z.string().min(1).max(40).optional(),
  tileIds: z.array(idSchema).min(1).max(3).optional(),
  count: z.number().int().min(1).max(3),
}).strict().superRefine((value, ctx) => {
  if (value.groupType === 'sameCategory' && !value.categoryId) {
    ctx.addIssue({ code: 'custom', message: 'sameCategory requires categoryId' });
  }
  if (value.groupType === 'sameTag' && !value.tag) {
    ctx.addIssue({ code: 'custom', message: 'sameTag requires tag' });
  }
  if (value.groupType === 'specificSet' && (!value.tileIds || value.tileIds.length !== 3)) {
    ctx.addIssue({ code: 'custom', message: 'specificSet requires exactly 3 tileIds' });
  }
});
```

## 5. RoleCondition Schema

RoleCondition still exists for whole-hand conditions and bonuses.

Use the newer grammar from docs/58:

```text
allOf
anyOf
countByCategory
countByTag
countByTileId
specificTileSet
distinctCategories
distinctTileNames
duplicateTile
sameCategorySet
sameTagSet
```

The older names below are deprecated for new implementation:

```text
contains_all
same_tile_count
same_name_count
same_category_count
all_different_categories
exact_group
choose_n_from
```

## 6. Normal WinRole Schema

Normal MVP win_role must be group-backed.

```ts
const normalWinRoleSchema = z.object({
  id: idSchema,
  name: displayNameSchema,
  kind: z.literal('win_role'),
  family: z.enum(['groupPattern', 'categoryMajority', 'specificCollection', 'allDifferent', 'allSameCategory', 'customTemplate']),
  basePoints: z.number().int().min(1).max(999),
  requiredGroups: z.array(groupRequirementSchema).min(1).max(3),
  wholeHandCondition: roleConditionSchema.optional(),
  allowWildcard: z.boolean(),
  maxWildcards: z.number().int().min(0).max(1),
  priority: z.number().int().min(0).max(999),
  explanation: z.string().min(1).max(300),
  canTsumo: z.boolean(),
  canRon: z.boolean(),
}).strict();
```

Validation:

```text
requiredGroups count sum must be <= 3
normal win_role must have canTsumo or canRon
normal win_role cannot be count-only
basePoints replaces points for win_role
```

## 7. SpecialBonus Schema

```ts
const specialBonusSchema = z.object({
  id: idSchema,
  name: displayNameSchema,
  kind: z.literal('special_bonus'),
  points: z.number().int().min(1).max(300),
  condition: roleConditionSchema,
  allowWildcard: z.boolean(),
  maxWildcards: z.number().int().min(0).max(1),
  explanation: z.string().min(1).max(300),
}).strict();
```

SpecialBonus cannot have `canTsumo` or `canRon`.

## 8. DeckVariant Role Arrays

Prefer explicit arrays.

```ts
const deckVariantSchema = z.object({
  id: idSchema,
  name: displayNameSchema,
  label: z.enum(['通常版', '拡張版']),
  ruleConfig: z.discriminatedUnion('evaluationMode', [
    normalRuleConfigSchema,
    extendedRuleConfigSchema,
  ]),
  winRoles: z.array(normalWinRoleSchema).min(1).max(200),
  specialBonuses: z.array(specialBonusSchema).max(100),
  scoreBonuses: z.array(scoreBonusSchema).max(100),
  isExperimental: z.boolean().optional(),
}).strict();
```

Older combined `roles: Role[]` is deprecated for new implementation.

## 9. Compatibility Decision

Implementation may support reading older docs only as migration references.

For new code, use:

```text
winRoles[]
specialBonuses[]
scoreBonuses[]
evaluationMode
requiredGroups
basePoints
```

Do not implement new normal MVP engine around:

```text
span
points on win_role
roles[] mixed kind
count-only win_role
roleSpanMin/roleSpanMax in normal variant
```

## 10. Required Schema Tests

```text
normal variant with evaluationMode normalThreeGroups parses
normal variant with handSizeNormal 8 parses
normal variant with handSizeAfterDraw 9 parses
normal variant with groupSize 3 and groupCount 3 parses
normal win_role without requiredGroups fails
normal win_role with count-only condition and no groups fails
specificSet group with not exactly 3 tileIds fails
special_bonus with canRon/canTsumo fails
mixed roles[] is rejected for new schema
extended variant parses but engine may mark as pending
```

## Final Decision

This file supersedes the role/rule portions of `docs/32-zod-schema-spec.md` for new implementation.

Normal MVP is group-backed first.

Extended span-based roles are separate and later.
