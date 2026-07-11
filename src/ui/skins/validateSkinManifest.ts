import { z } from 'zod';
import { ASSET_SLOTS, type AssetSlotName } from '../assets/slots';
import {
  ALLOWED_BLEND_MODES,
  SKIN_CONTRACT_VERSION,
  SKIN_LIMITS,
  type SkinAssetDefinition,
  type SkinManifest,
} from './skinTypes';

// パッケージ内ファイル名のみ許可。パス区切り・親参照・URLスキームは拒否する。
// (スキンから外部URL・任意パスを読み込ませないための防衛線)
export function isSafeSkinFileName(file: string): boolean {
  if (file.length === 0 || file.length > 120) {
    return false;
  }
  if (
    file.includes('/') ||
    file.includes('\\') ||
    file.includes('..') ||
    file.includes(':') ||
    file.startsWith('.')
  ) {
    return false;
  }
  return /^[A-Za-z0-9][A-Za-z0-9._-]*\.(png|webp|svg|css)$/.test(file);
}

const edgeInsetsSchema = z
  .object({
    top: z.number().int().min(0).max(SKIN_LIMITS.maxNineSlicePx),
    right: z.number().int().min(0).max(SKIN_LIMITS.maxNineSlicePx),
    bottom: z.number().int().min(0).max(SKIN_LIMITS.maxNineSlicePx),
    left: z.number().int().min(0).max(SKIN_LIMITS.maxNineSlicePx),
  })
  .strict();

const skinAssetDefinitionSchema = z
  .object({
    file: z.string().min(1).max(120).nullable(),
    status: z.enum(['placeholder', 'final']),
    renderMode: z.enum(['cover', 'contain', 'stretch', 'repeat', 'nine-slice', 'overlay']),
    intrinsicSize: z
      .object({
        width: z.number().int().min(1).max(SKIN_LIMITS.maxIntrinsicSizePx),
        height: z.number().int().min(1).max(SKIN_LIMITS.maxIntrinsicSizePx),
      })
      .strict()
      .optional(),
    transparent: z.boolean().optional(),
    nineSlice: edgeInsetsSchema.optional(),
    nineSliceRender: z
      .object({
        top: z.number().int().min(0).max(SKIN_LIMITS.maxNineSliceRenderPx),
        right: z.number().int().min(0).max(SKIN_LIMITS.maxNineSliceRenderPx),
        bottom: z.number().int().min(0).max(SKIN_LIMITS.maxNineSliceRenderPx),
        left: z.number().int().min(0).max(SKIN_LIMITS.maxNineSliceRenderPx),
      })
      .strict()
      .optional(),
    pixelDensity: z.number().int().min(1).max(SKIN_LIMITS.maxPixelDensity).optional(),
    minRenderSize: z
      .object({
        width: z.number().int().min(1).max(SKIN_LIMITS.maxIntrinsicSizePx),
        height: z.number().int().min(1).max(SKIN_LIMITS.maxIntrinsicSizePx),
      })
      .strict()
      .optional(),
    contentSafeArea: edgeInsetsSchema.optional(),
    opacity: z.number().min(0).max(1).optional(),
    blendMode: z.enum(ALLOWED_BLEND_MODES).optional(),
  })
  .strict();

const skinIdSchema = z
  .string()
  .min(1)
  .max(40)
  .regex(/^[a-z0-9][a-z0-9-]*$/, 'skin idは小文字英数字とハイフンのみ');

const skinManifestSchema = z
  .object({
    id: skinIdSchema,
    label: z.string().min(1).max(60),
    version: z.number().int().min(1),
    skinContractVersion: z.number().int().min(1),
    origin: z.enum(['official', 'external']),
    author: z.string().max(80).optional(),
    inherits: skinIdSchema.optional(),
    tokensFile: z.string().min(1).max(120),
    slots: z.record(z.string(), skinAssetDefinitionSchema),
  })
  .strict();

export type ValidateSkinManifestResult =
  | { ok: true; manifest: SkinManifest }
  | { ok: false; issues: string[] };

// 未知データからSkinManifestを厳格に検証する。
// 不正なmanifestは受理せずissuesを返す(呼び出し側がbase/defaultへfallbackする)。
export function validateSkinManifest(raw: unknown): ValidateSkinManifestResult {
  const parsed = skinManifestSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      ok: false,
      issues: parsed.error.issues.map(
        (issue) => `${issue.path.join('.') || '$'}: ${issue.message}`,
      ),
    };
  }
  const data = parsed.data;
  const issues: string[] = [];

  if (data.skinContractVersion > SKIN_CONTRACT_VERSION) {
    issues.push(
      `skinContractVersion ${data.skinContractVersion} はこのアプリ(${SKIN_CONTRACT_VERSION})より新しいため使用できません`,
    );
  }
  if (data.inherits === data.id) {
    issues.push('スキンは自分自身を継承できません');
  }
  if (!isSafeSkinFileName(data.tokensFile) || !data.tokensFile.endsWith('.css')) {
    issues.push(`tokensFileが不正です: ${data.tokensFile}`);
  }

  const knownSlots = new Set<string>(ASSET_SLOTS);
  const slots: Partial<Record<AssetSlotName, SkinAssetDefinition>> = {};
  for (const [slotName, def] of Object.entries(data.slots)) {
    if (!knownSlots.has(slotName)) {
      issues.push(`未知のasset slotです: ${slotName}`);
      continue;
    }
    if (def.file !== null && !isSafeSkinFileName(def.file)) {
      issues.push(`slot ${slotName} のfileが不正です: ${def.file}`);
      continue;
    }
    if (def.file !== null && def.file.endsWith('.css')) {
      issues.push(`slot ${slotName} に画像以外のファイルは指定できません: ${def.file}`);
      continue;
    }
    if (def.renderMode === 'nine-slice' && !def.nineSlice) {
      issues.push(`slot ${slotName} はnine-sliceですがnineSlice指定がありません`);
      continue;
    }
    if (def.renderMode !== 'nine-slice' && def.nineSliceRender) {
      issues.push(`slot ${slotName} はnine-slice以外なのでnineSliceRenderを持てません`);
      continue;
    }
    slots[slotName as AssetSlotName] = def;
  }

  if (issues.length > 0) {
    return { ok: false, issues };
  }

  return {
    ok: true,
    manifest: {
      id: data.id,
      label: data.label,
      version: data.version,
      skinContractVersion: data.skinContractVersion,
      origin: data.origin,
      ...(data.author !== undefined ? { author: data.author } : {}),
      ...(data.inherits !== undefined ? { inherits: data.inherits } : {}),
      tokensFile: data.tokensFile,
      slots,
    },
  };
}
