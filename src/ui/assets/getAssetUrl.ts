import { isAssetSlotName, type AssetSlotName } from './slots';

// asset-slots.jsonの1エントリ。statusとfileだけがruntimeで意味を持つ。
export type AssetSlotEntry = {
  status: 'placeholder' | 'final';
  file: string | null;
  purpose: string;
  usedBy: string[];
  targetFile: string;
};

export type AssetSlotsManifest = Partial<Record<AssetSlotName, AssetSlotEntry>>;

export const ASSET_SLOTS_JSON_URL = '/assets/ui/soro-pon/asset-slots.json';
const FINAL_BASE = '/assets/ui/soro-pon/generated/final/';
const PLACEHOLDER_BASE = '/assets/ui/soro-pon/generated/placeholders/';

// 信頼できるapp所有manifestのみ読む。壊れていても落とさずfallback UIで動く。
export function parseAssetSlotsManifest(raw: unknown): AssetSlotsManifest {
  const manifest: AssetSlotsManifest = {};
  if (raw === null || typeof raw !== 'object' || Array.isArray(raw)) {
    return manifest;
  }
  const slots = (raw as Record<string, unknown>)['slots'];
  if (slots === null || typeof slots !== 'object' || Array.isArray(slots)) {
    return manifest;
  }
  for (const [key, value] of Object.entries(slots as Record<string, unknown>)) {
    if (!isAssetSlotName(key) || value === null || typeof value !== 'object') {
      continue;
    }
    const entry = value as Record<string, unknown>;
    const status = entry['status'];
    const file = entry['file'];
    if (status !== 'placeholder' && status !== 'final') {
      continue;
    }
    manifest[key] = {
      status,
      file: typeof file === 'string' ? file : null,
      purpose: typeof entry['purpose'] === 'string' ? entry['purpose'] : '',
      usedBy: Array.isArray(entry['usedBy'])
        ? entry['usedBy'].filter((v): v is string => typeof v === 'string')
        : [],
      targetFile: typeof entry['targetFile'] === 'string' ? entry['targetFile'] : '',
    };
  }
  return manifest;
}

// slotの画像URLを返す。画像が未作成(fileなし)ならnull = CSS/SVG fallbackで表示する。
export function getAssetUrl(
  manifest: AssetSlotsManifest,
  slot: AssetSlotName,
): string | null {
  const entry = manifest[slot];
  if (!entry || entry.file === null || entry.file === '') {
    return null;
  }
  const base = entry.status === 'final' ? FINAL_BASE : PLACEHOLDER_BASE;
  // manifest内のfile名のみ許可(パス区切りは拒否して外部参照を防ぐ)
  if (entry.file.includes('/') || entry.file.includes('\\') || entry.file.includes('..')) {
    return null;
  }
  return `${base}${entry.file}`;
}
