import { z } from 'zod';
import { parseSkinTokens } from './parseSkinTokens';
import { resolveSkin } from './resolveSkin';
import {
  BASE_SKIN_ID,
  SKIN_CONTRACT_VERSION,
  type ResolvedSkin,
  type SkinManifest,
} from './skinTypes';
import { validateSkinManifest } from './validateSkinManifest';

export const SKIN_REGISTRY_URL = '/assets/ui/soro-pon/SKIN-MANIFEST.json';
export const SKINS_ROOT_URL = '/assets/ui/soro-pon/skins';
export const SKIN_STORAGE_KEY = 'soro-pon.skin.v1';

export type SkinRegistryEntry = {
  id: string;
  label: string;
  /** falseはfallback専用(選択UIに出さない) */
  selectable: boolean;
};

export type SkinRegistry = {
  defaultSkinId: string;
  skins: SkinRegistryEntry[];
};

export const BUILTIN_SKIN_REGISTRY: SkinRegistry = {
  defaultSkinId: 'yorunoshirube',
  skins: [
    { id: 'base', label: 'ベース(無画像フォールバック)', selectable: false },
    { id: 'yorunoshirube', label: 'ヨルノシルベ', selectable: true },
    { id: 'cute-pop', label: 'Cute Pop', selectable: true },
  ],
};

const registrySchema = z
  .object({
    version: z.number().int().min(1).max(Number.MAX_SAFE_INTEGER),
    skinContractVersion: z.number().int().min(1).max(Number.MAX_SAFE_INTEGER),
    defaultSkinId: z.string().regex(/^[a-z0-9][a-z0-9-]*$/),
    skins: z
      .array(
        z
          .object({
            id: z.string().regex(/^[a-z0-9][a-z0-9-]*$/),
            label: z.string().min(1).max(60),
            selectable: z.boolean(),
          })
          .strict(),
      )
      .min(1)
      .max(50),
  })
  .strict()
  .superRefine((registry, ctx) => {
    const seen = new Set<string>();
    registry.skins.forEach((skin, index) => {
      if (seen.has(skin.id)) {
        ctx.addIssue({
          code: 'custom',
          path: ['skins', index, 'id'],
          message: `skin id "${skin.id}" が重複しています`,
        });
      }
      seen.add(skin.id);
    });
  });

export function parseSkinRegistry(raw: unknown): SkinRegistry | null {
  const parsed = registrySchema.safeParse(raw);
  if (!parsed.success) {
    return null;
  }
  const { defaultSkinId, skinContractVersion, skins } = parsed.data;
  if (skinContractVersion > SKIN_CONTRACT_VERSION) {
    return null;
  }
  if (!skins.some((s) => s.id === defaultSkinId)) {
    return null;
  }
  return { defaultSkinId, skins };
}

export function sanitizeSkinId(raw: string | null | undefined, registry: SkinRegistry): string {
  if (typeof raw !== 'string' || !/^[a-z0-9][a-z0-9-]*$/.test(raw)) {
    return registry.defaultSkinId;
  }
  return registry.skins.some((s) => s.id === raw) ? raw : registry.defaultSkinId;
}

export type SkinPackageIo = {
  loadManifest(skinId: string): Promise<unknown | null>;
  loadTokens(skinId: string, tokensFile: string): Promise<string | null>;
};

export type TrustedSkinOriginResolver = (skinId: string) => SkinManifest['origin'];

const MAX_INHERITANCE_DEPTH = 3;

export type LoadResolvedSkinResult = {
  resolved: ResolvedSkin;
  issues: string[];
};

/**
 * resolveTrustedOriginはmanifest本文より外側のinstaller/registryが決める。
 * built-in fetch経路はdefaultで全件officialとして扱い、manifestの自己申告で
 * external制限を回避できないようにする。
 */
export function createSkinLoader(
  io: SkinPackageIo,
  resolveTrustedOrigin: TrustedSkinOriginResolver = () => 'official',
) {
  async function loadOne(
    skinId: string,
  ): Promise<{ manifest: SkinManifest | null; tokens: Record<string, string>; issues: string[] }> {
    const issues: string[] = [];
    const rawManifest = await io.loadManifest(skinId).catch(() => null);
    if (rawManifest === null) {
      return { manifest: null, tokens: {}, issues: [`スキン ${skinId} のmanifestを読み込めません`] };
    }
    const validated = validateSkinManifest(rawManifest, resolveTrustedOrigin(skinId));
    if (!validated.ok) {
      return {
        manifest: null,
        tokens: {},
        issues: validated.issues.map((i) => `スキン ${skinId}: ${i}`),
      };
    }
    if (validated.manifest.id !== skinId) {
      return {
        manifest: null,
        tokens: {},
        issues: [`スキン ${skinId} のmanifest idが一致しません: ${validated.manifest.id}`],
      };
    }
    const tokensText = await io
      .loadTokens(skinId, validated.manifest.tokensFile)
      .catch(() => null);
    if (tokensText === null) {
      issues.push(`スキン ${skinId} のtokensを読み込めません(tokenなしで続行)`);
      return { manifest: validated.manifest, tokens: {}, issues };
    }
    const parsedTokens = parseSkinTokens(
      tokensText,
      validated.manifest.origin === 'external' ? 'external' : 'official',
    );
    issues.push(...parsedTokens.issues.map((i) => `スキン ${skinId}: ${i}`));
    return { manifest: validated.manifest, tokens: parsedTokens.tokens, issues };
  }

  async function loadResolvedSkin(skinId: string): Promise<LoadResolvedSkinResult> {
    const issues: string[] = [];
    const manifests = new Map<string, SkinManifest>();
    const tokensBySkin = new Map<string, Record<string, string>>();

    const baseLoaded = await loadOne(BASE_SKIN_ID);
    issues.push(...baseLoaded.issues);
    if (baseLoaded.manifest) {
      manifests.set(BASE_SKIN_ID, baseLoaded.manifest);
      tokensBySkin.set(BASE_SKIN_ID, baseLoaded.tokens);
    }

    let current: string | undefined = skinId;
    let depth = 0;
    while (current !== undefined && current !== BASE_SKIN_ID && depth < MAX_INHERITANCE_DEPTH) {
      if (manifests.has(current)) {
        break;
      }
      const loaded = await loadOne(current);
      issues.push(...loaded.issues);
      if (!loaded.manifest) {
        break;
      }
      manifests.set(current, loaded.manifest);
      tokensBySkin.set(current, loaded.tokens);
      current = loaded.manifest.inherits ?? BASE_SKIN_ID;
      depth += 1;
    }
    if (
      depth >= MAX_INHERITANCE_DEPTH &&
      current !== undefined &&
      current !== BASE_SKIN_ID &&
      !manifests.has(current)
    ) {
      issues.push(`継承が深すぎます(最大${MAX_INHERITANCE_DEPTH})`);
    }

    const resolved = resolveSkin({ skinId, manifests, tokensBySkin });
    return { resolved, issues: [...issues, ...resolved.issues] };
  }

  return { loadResolvedSkin };
}

export function createFetchSkinIo(): SkinPackageIo {
  return {
    async loadManifest(skinId: string): Promise<unknown | null> {
      const res = await fetch(`${SKINS_ROOT_URL}/${skinId}/skin.json`);
      return res.ok ? ((await res.json()) as unknown) : null;
    },
    async loadTokens(skinId: string, tokensFile: string): Promise<string | null> {
      const res = await fetch(`${SKINS_ROOT_URL}/${skinId}/${tokensFile}`);
      return res.ok ? await res.text() : null;
    },
  };
}

export async function fetchSkinRegistry(): Promise<SkinRegistry> {
  try {
    const res = await fetch(SKIN_REGISTRY_URL);
    if (!res.ok) {
      return BUILTIN_SKIN_REGISTRY;
    }
    return parseSkinRegistry((await res.json()) as unknown) ?? BUILTIN_SKIN_REGISTRY;
  } catch {
    return BUILTIN_SKIN_REGISTRY;
  }
}
