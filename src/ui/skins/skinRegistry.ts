import { z } from 'zod';
import { parseSkinTokens } from './parseSkinTokens';
import { resolveSkin } from './resolveSkin';
import { BASE_SKIN_ID, type ResolvedSkin, type SkinManifest } from './skinTypes';
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

// SKIN-MANIFEST.jsonの取得に失敗してもアプリを起動させるための同梱定義。
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
    version: z.number().int().min(1),
    skinContractVersion: z.number().int().min(1),
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
  .strict();

export function parseSkinRegistry(raw: unknown): SkinRegistry | null {
  const parsed = registrySchema.safeParse(raw);
  if (!parsed.success) {
    return null;
  }
  const { defaultSkinId, skins } = parsed.data;
  if (!skins.some((s) => s.id === defaultSkinId)) {
    return null;
  }
  return { defaultSkinId, skins };
}

// localStorage等から来たskinIdを安全な既知IDへ正規化する。
// 未知ID・不正文字列はdefaultへ復旧する。
export function sanitizeSkinId(raw: string | null | undefined, registry: SkinRegistry): string {
  if (typeof raw !== 'string' || !/^[a-z0-9][a-z0-9-]*$/.test(raw)) {
    return registry.defaultSkinId;
  }
  return registry.skins.some((s) => s.id === raw) ? raw : registry.defaultSkinId;
}

// スキンパッケージの読み込みIO。テストではfake実装を注入する。
export type SkinPackageIo = {
  loadManifest(skinId: string): Promise<unknown | null>;
  loadTokens(skinId: string, tokensFile: string): Promise<string | null>;
};

const MAX_INHERITANCE_DEPTH = 5;

export type LoadResolvedSkinResult = {
  resolved: ResolvedSkin;
  issues: string[];
};

// skinIdの継承チェーン(+base)を読み込み、検証してresolveする。
// どこで失敗してもクラッシュせず、読めた範囲(最低でも空のbase)で返す。
export function createSkinLoader(io: SkinPackageIo) {
  async function loadOne(
    skinId: string,
  ): Promise<{ manifest: SkinManifest | null; tokens: Record<string, string>; issues: string[] }> {
    const issues: string[] = [];
    const rawManifest = await io.loadManifest(skinId).catch(() => null);
    if (rawManifest === null) {
      return { manifest: null, tokens: {}, issues: [`スキン ${skinId} のmanifestを読み込めません`] };
    }
    const validated = validateSkinManifest(rawManifest);
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

    // 常にbaseを読み込む(全fallbackの土台)
    const baseLoaded = await loadOne(BASE_SKIN_ID);
    issues.push(...baseLoaded.issues);
    if (baseLoaded.manifest) {
      manifests.set(BASE_SKIN_ID, baseLoaded.manifest);
      tokensBySkin.set(BASE_SKIN_ID, baseLoaded.tokens);
    }

    // 対象スキインの継承チェーンを深さ制限つきで読み込む
    let current: string | undefined = skinId;
    let depth = 0;
    while (current !== undefined && current !== BASE_SKIN_ID && depth < MAX_INHERITANCE_DEPTH) {
      if (manifests.has(current)) {
        break; // 循環はresolveSkin側でも検出される
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
    if (depth >= MAX_INHERITANCE_DEPTH) {
      issues.push(`継承が深すぎます(最大${MAX_INHERITANCE_DEPTH})`);
    }

    const resolved = resolveSkin({ skinId, manifests, tokensBySkin });
    return { resolved, issues: [...issues, ...resolved.issues] };
  }

  return { loadResolvedSkin };
}

// fetchベースの標準IO(ブラウザ用)
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
