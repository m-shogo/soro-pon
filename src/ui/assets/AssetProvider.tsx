import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import {
  ASSET_SLOTS_JSON_URL,
  getAssetUrl,
  parseAssetSlotsManifest,
  type AssetSlotsManifest,
} from './getAssetUrl';
import type { AssetSlotName } from './slots';

const AssetContext = createContext<AssetSlotsManifest>({});

// app所有のasset manifestを1回だけ読み込む。
// 読み込み失敗時は全slotがfallback表示になるだけで、操作は止まらない。
export function AssetProvider({ children }: { children: ReactNode }) {
  const [manifest, setManifest] = useState<AssetSlotsManifest>({});
  useEffect(() => {
    let cancelled = false;
    fetch(ASSET_SLOTS_JSON_URL)
      .then((res) => (res.ok ? res.json() : null))
      .then((raw: unknown) => {
        if (!cancelled && raw !== null) {
          setManifest(parseAssetSlotsManifest(raw));
        }
      })
      .catch(() => {
        // fallback UIで続行
      });
    return () => {
      cancelled = true;
    };
  }, []);
  return <AssetContext.Provider value={manifest}>{children}</AssetContext.Provider>;
}

// slotの画像URL。nullならコンポーネントのCSS/SVG fallbackが使われる。
// slot自体がnullの場合(そのvariantに画像を使わない)もnullを返す。
export function useAssetSlot(slot: AssetSlotName | null): string | null {
  const manifest = useContext(AssetContext);
  if (slot === null) {
    return null;
  }
  return getAssetUrl(manifest, slot);
}

// 画像があればbackground-imageとして重ねるstyleを返す。
// レイアウト・当たり判定は画像に依存しない(背景としてのみ使う)。
export function useAssetBackgroundStyle(
  slot: AssetSlotName | null,
): { backgroundImage: string; backgroundSize: string } | undefined {
  const url = useAssetSlot(slot);
  if (url === null) {
    return undefined;
  }
  return { backgroundImage: `url("${url}")`, backgroundSize: '100% 100%' };
}
