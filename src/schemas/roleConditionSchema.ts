import { z } from 'zod';
import type { RoleCondition } from '../domain/role';
import { idSchema, tagSchema } from './commonSchema';

const minCountSchema = z.number().int().min(1).max(9);

// データのみの条件文法。カスタムJSは受け付けない。
export const roleConditionSchema: z.ZodType<RoleCondition> = z.lazy(() =>
  z.discriminatedUnion('type', [
    z
      .object({
        type: z.literal('allOf'),
        conditions: z.array(roleConditionSchema).min(1).max(10),
      })
      .strict(),
    z
      .object({
        type: z.literal('anyOf'),
        conditions: z.array(roleConditionSchema).min(1).max(10),
      })
      .strict(),
    z
      .object({
        type: z.literal('countByCategory'),
        categoryId: idSchema,
        minCount: minCountSchema,
      })
      .strict(),
    z
      .object({
        type: z.literal('countByTag'),
        tag: tagSchema,
        minCount: minCountSchema,
      })
      .strict(),
    z
      .object({
        type: z.literal('countByTileId'),
        tileId: idSchema,
        minCount: minCountSchema,
      })
      .strict(),
    z
      .object({
        type: z.literal('specificTileSet'),
        tileIds: z.array(idSchema).min(1).max(9),
        allowExtra: z.boolean().optional(),
      })
      .strict(),
    z
      .object({
        type: z.literal('distinctCategories'),
        minCount: minCountSchema,
      })
      .strict(),
    z
      .object({
        type: z.literal('distinctTileNames'),
        minCount: minCountSchema,
      })
      .strict(),
    z
      .object({
        type: z.literal('duplicateTile'),
        minCount: minCountSchema,
      })
      .strict(),
    z
      .object({
        type: z.literal('sameCategorySet'),
        setSize: z.number().int().min(2).max(9),
      })
      .strict(),
    z
      .object({
        type: z.literal('sameTagSet'),
        tag: tagSchema,
        setSize: z.number().int().min(2).max(9),
      })
      .strict(),
  ]),
) as z.ZodType<RoleCondition>;
