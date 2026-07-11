import type { AssetSlotName } from '../assets/slots';
import {
  BASE_SKIN_ID,
  type ResolvedSkin,
  type ResolvedSkinSlot,
  type SkinManifest,
} from './skinTypes';

export type ResolveSkinInput = {
  skinId: string;
  manifests: ReadonlyMap<string, SkinManifest>;
  tokensBySkin: ReadonlyMap<string, Record<string, string>>;
};

// 継承チェーン(base -> ... -> skin)を解決する。
// 循環・自分自身継承・存在しない親は拒否し、その時点までのチェーンで打ち切って
// issueとして記録する(クラッシュさせない)。
export function resolveInheritanceChain(
  skinId: string,
  manifests: ReadonlyMap<string, SkinManifest>,
): { chain: string[]; issues: string[] } {
  const issues: string[] = [];
  const reversed: string[] = [];
  const visited = new Set<string>();
  let current: string | undefined = skinId;

  while (current !== undefined) {
    if (visited.has(current)) {
      issues.push(`継承が循環しています: ${[...visited].join(' -> ')} -> ${current}`);
      break;
    }
    const manifest = manifests.get(current);
    if (!manifest) {
      if (current === skinId) {
        issues.push(`スキン ${current} が見つかりません`);
      } else {
        issues.push(`継承先スキン ${current} が見つかりません(baseへfallback)`);
      }
      break;
    }
    visited.add(current);
    reversed.push(current);
    if (current === BASE_SKIN_ID) {
      break;
    }
    current = manifest.inherits ?? BASE_SKIN_ID;
  }

  const chain = [...reversed].reverse();
  // 常にbaseを土台にする(baseが手に入らない場合でもchainは空にしない)
  if (chain[0] !== BASE_SKIN_ID) {
    if (manifests.has(BASE_SKIN_ID)) {
      chain.unshift(BASE_SKIN_ID);
    } else {
      issues.push('base skinが見つかりません');
    }
  }
  return { chain, issues };
}

// 継承チェーンに沿ってtokensとslotsをmergeする。
// 後段(より具体的なスキン)の定義が優先。slotのfileがnullでも定義自体は上書きとして扱う。
export function resolveSkin(input: ResolveSkinInput): ResolvedSkin {
  const { chain, issues } = resolveInheritanceChain(input.skinId, input.manifests);

  const tokens: Record<string, string> = {};
  const slots: Partial<Record<AssetSlotName, ResolvedSkinSlot>> = {};
  let colorScheme: 'dark' | 'light' = 'dark';
  let themeColor: string | undefined;

  for (const skinIdInChain of chain) {
    const manifest = input.manifests.get(skinIdInChain);
    const skinTokens = input.tokensBySkin.get(skinIdInChain);
    if (skinTokens) {
      Object.assign(tokens, skinTokens);
    }
    if (manifest) {
      for (const [slotName, def] of Object.entries(manifest.slots)) {
        if (def) {
          slots[slotName as AssetSlotName] = { def, sourceSkinId: skinIdInChain };
        }
      }
      if (manifest.colorScheme !== undefined) {
        colorScheme = manifest.colorScheme;
      }
      if (manifest.themeColor !== undefined) {
        themeColor = manifest.themeColor;
      }
    }
  }

  const topManifest = input.manifests.get(input.skinId);
  return {
    id: chain[chain.length - 1] ?? BASE_SKIN_ID,
    label: topManifest?.label ?? input.skinId,
    chain,
    tokens,
    slots,
    colorScheme,
    ...(themeColor !== undefined ? { themeColor } : {}),
    issues,
  };
}
