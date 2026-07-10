import type { AssetSlotName } from '../assets/slots';
import type { ResolvedSkin, ResolvedSkinSlot } from './skinTypes';
import { isSafeSkinFileName } from './validateSkinManifest';

export const SKINS_BASE_PATH = '/assets/ui/soro-pon/skins';

// slotの画像URLを返す。fileがない(=CSS/SVG fallbackで描く)場合はnull。
// fileはvalidateSkinManifestで検証済みだが、多層防御として再度検証する。
export function getSkinAssetUrl(
  skin: ResolvedSkin,
  slot: AssetSlotName,
): string | null {
  const resolved = skin.slots[slot];
  if (!resolved) {
    return null;
  }
  return skinSlotUrl(resolved);
}

export function skinSlotUrl(resolved: ResolvedSkinSlot): string | null {
  const { def, sourceSkinId } = resolved;
  if (def.file === null || def.file === '') {
    return null;
  }
  if (!isSafeSkinFileName(def.file)) {
    return null;
  }
  if (!/^[a-z0-9][a-z0-9-]*$/.test(sourceSkinId)) {
    return null;
  }
  return `${SKINS_BASE_PATH}/${sourceSkinId}/generated/final/${def.file}`;
}
