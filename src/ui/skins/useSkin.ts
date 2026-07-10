import { useContext } from 'react';
import type { AssetSlotName } from '../assets/slots';
import { getSkinAssetUrl } from './getSkinAssetUrl';
import { SkinContext, type SkinContextValue } from './SkinProvider';
import type { SkinAssetDefinition } from './skinTypes';

export function useSkin(): SkinContextValue {
  return useContext(SkinContext);
}

export type SkinAsset = {
  url: string;
  def: SkinAssetDefinition;
};

// slotのスキンasset。画像がない(=CSS/SVG fallbackで描く)場合はnull。
export function useSkinAsset(slot: AssetSlotName | null): SkinAsset | null {
  const { resolvedSkin } = useContext(SkinContext);
  if (slot === null || resolvedSkin === null) {
    return null;
  }
  const resolved = resolvedSkin.slots[slot];
  if (!resolved) {
    return null;
  }
  const url = getSkinAssetUrl(resolvedSkin, slot);
  if (url === null) {
    return null;
  }
  return { url, def: resolved.def };
}
