import { z } from 'zod';
import { CURRENT_DECK_SCHEMA_VERSION } from '../domain/deck';
import {
  colorSchema,
  displayNameSchema,
  explanationSchema,
  idSchema,
  shortGlyphSchema,
  tagSchema,
} from './commonSchema';
import { roleConditionSchema } from './roleConditionSchema';

export const categoryDefinitionSchema = z
  .object({
    id: idSchema,
    name: displayNameSchema,
    color: colorSchema,
    priority: z.number().int().min(0).max(999),
    icon: shortGlyphSchema.optional(),
  })
  .strict();

export const wildcardBehaviorSchema = z
  .object({
    kind: z.literal('any_tile'),
    maxUsePerRole: z.number().int().min(0).max(1),
    canCompleteWinRole: z.boolean(),
    canCompleteSpecialBonus: z.boolean(),
    canTriggerRonWhenDiscarded: z.boolean(),
    countsForScoreBonus: z.boolean(),
  })
  .strict();

export const tileDefinitionSchema = z
  .object({
    id: idSchema,
    name: displayNameSchema,
    categories: z.array(idSchema).min(1).max(10),
    primaryCategoryId: idSchema,
    emoji: shortGlyphSchema.optional(),
    fallbackLabel: z.string().min(1).max(4),
    count: z.number().int().min(1).max(10),
    tags: z.array(tagSchema).max(10).optional(),
    wildcard: wildcardBehaviorSchema.optional(),
  })
  .strict();

export const groupRequirementSchema = z
  .object({
    groupType: z.enum(['sameTile', 'sameCategory', 'sameTag', 'specificSet', 'freeSet']),
    categoryId: idSchema.optional(),
    tag: tagSchema.optional(),
    tileIds: z.array(idSchema).min(1).max(3).optional(),
    count: z.number().int().min(1).max(3),
  })
  .strict()
  .superRefine((value, ctx) => {
    if (value.groupType === 'sameCategory' && !value.categoryId) {
      ctx.addIssue({ code: 'custom', message: 'sameCategoryにはcategoryIdが必要です' });
    }
    if (value.groupType === 'sameTag' && !value.tag) {
      ctx.addIssue({ code: 'custom', message: 'sameTagにはtagが必要です' });
    }
    if (value.groupType === 'specificSet' && (!value.tileIds || value.tileIds.length !== 3)) {
      ctx.addIssue({
        code: 'custom',
        message: 'specificSetにはちょうど3個のtileIdsが必要です',
      });
    }
  });

export const normalWinRoleSchema = z
  .object({
    id: idSchema,
    name: displayNameSchema,
    kind: z.literal('win_role'),
    family: z.enum([
      'groupPattern',
      'categoryMajority',
      'specificCollection',
      'allDifferent',
      'allSameCategory',
      'customTemplate',
    ]),
    basePoints: z.number().int().min(1).max(999),
    requiredGroups: z.array(groupRequirementSchema).min(1).max(3),
    wholeHandCondition: roleConditionSchema.optional(),
    allowWildcard: z.boolean(),
    maxWildcards: z.number().int().min(0).max(1),
    priority: z.number().int().min(0).max(999),
    explanation: explanationSchema,
    canTsumo: z.boolean(),
    canRon: z.boolean(),
  })
  .strict()
  .superRefine((value, ctx) => {
    const totalGroups = value.requiredGroups.reduce((sum, req) => sum + req.count, 0);
    if (totalGroups < 1 || totalGroups > 3) {
      ctx.addIssue({
        code: 'custom',
        message: 'requiredGroupsのcount合計は1〜3である必要があります',
      });
    }
    if (!value.canTsumo && !value.canRon) {
      ctx.addIssue({
        code: 'custom',
        message: 'win_roleはcanTsumoまたはcanRonのどちらかが必要です',
      });
    }
  });

export const specialBonusSchema = z
  .object({
    id: idSchema,
    name: displayNameSchema,
    kind: z.literal('special_bonus'),
    points: z.number().int().min(1).max(300),
    condition: roleConditionSchema,
    allowWildcard: z.boolean(),
    maxWildcards: z.number().int().min(0).max(1),
    explanation: explanationSchema,
  })
  .strict();

export const scoreBonusSchema = z
  .object({
    id: idSchema,
    name: displayNameSchema,
    type: z.enum(['duplicate_tile', 'duplicate_name', 'duplicate_category']),
    minCount: z.number().int().min(2).max(9),
    points: z.number().int().min(1).max(300),
    maxPoints: z.number().int().min(1).max(900).optional(),
    description: explanationSchema.optional(),
    allowWildcard: z.boolean().optional(),
    condition: roleConditionSchema.optional(),
  })
  .strict();

export const scoreBudgetSchema = z
  .object({
    expectedBaseMin: z.number().int().min(1),
    expectedBaseMax: z.number().int().min(1),
    expectedResultMin: z.number().int().min(1),
    expectedResultMax: z.number().int().min(1),
    softResultCap: z.number().int().min(1),
    hardResultCap: z.number().int().min(1),
    maxSpecialBonusTotal: z.number().int().min(0),
    maxScoreBonusTotal: z.number().int().min(0),
  })
  .strict()
  .superRefine((value, ctx) => {
    if (value.expectedBaseMax < value.expectedBaseMin) {
      ctx.addIssue({ code: 'custom', message: 'expectedBaseMax >= expectedBaseMin が必要です' });
    }
    if (value.expectedResultMin < value.expectedBaseMin) {
      ctx.addIssue({
        code: 'custom',
        message: 'expectedResultMin >= expectedBaseMin が必要です',
      });
    }
    if (value.expectedResultMax < value.expectedResultMin) {
      ctx.addIssue({
        code: 'custom',
        message: 'expectedResultMax >= expectedResultMin が必要です',
      });
    }
    if (value.softResultCap < value.expectedResultMax) {
      ctx.addIssue({ code: 'custom', message: 'softResultCap >= expectedResultMax が必要です' });
    }
    if (value.hardResultCap < value.softResultCap) {
      ctx.addIssue({ code: 'custom', message: 'hardResultCap >= softResultCap が必要です' });
    }
  });

const supportedPlayerCountsSchema = z
  .array(z.union([z.literal(3), z.literal(4)]))
  .min(1)
  .max(2);

export const normalRuleConfigSchema = z
  .object({
    id: idSchema,
    name: displayNameSchema,
    evaluationMode: z.literal('normalThreeGroups'),
    supportedPlayerCounts: supportedPlayerCountsSchema,
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
  })
  .strict();

export const extendedRuleConfigSchema = z
  .object({
    id: idSchema,
    name: displayNameSchema,
    evaluationMode: z.literal('extendedRoleSpan'),
    supportedPlayerCounts: supportedPlayerCountsSchema,
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
  })
  .strict();

export const deckVariantSchema = z
  .object({
    id: idSchema,
    name: displayNameSchema,
    label: z.enum(['通常版', '拡張版']),
    isExperimental: z.boolean().optional(),
    ruleConfig: z.discriminatedUnion('evaluationMode', [
      normalRuleConfigSchema,
      extendedRuleConfigSchema,
    ]),
    scoreBudget: scoreBudgetSchema,
    winRoles: z.array(normalWinRoleSchema).max(200),
    specialBonuses: z.array(specialBonusSchema).max(100),
    scoreBonuses: z.array(scoreBonusSchema).max(100),
    engineStatus: z.literal('pending').optional(),
  })
  .strict()
  .superRefine((value, ctx) => {
    if (value.ruleConfig.evaluationMode === 'extendedRoleSpan' && value.engineStatus !== 'pending') {
      ctx.addIssue({
        code: 'custom',
        message: 'extendedRoleSpan variantはengineStatus: pending が必要です',
      });
    }
    if (value.ruleConfig.evaluationMode === 'normalThreeGroups' && value.engineStatus === 'pending') {
      ctx.addIssue({
        code: 'custom',
        message: 'normalThreeGroups variantにengineStatusは指定できません',
      });
    }
  });

export const deckProjectSchema = z
  .object({
    version: z.literal(CURRENT_DECK_SCHEMA_VERSION),
    id: idSchema,
    name: displayNameSchema,
    description: z.string().max(500).optional(),
    categories: z.array(categoryDefinitionSchema).min(1).max(100),
    tiles: z.array(tileDefinitionSchema).min(1).max(200),
    activeVariantId: idSchema,
    variants: z.array(deckVariantSchema).min(1).max(4),
  })
  .strict();

export type ParsedDeckProject = z.infer<typeof deckProjectSchema>;
