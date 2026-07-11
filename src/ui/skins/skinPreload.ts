import { skinSlotUrl } from './getSkinAssetUrl';
import type { ResolvedSkin } from './skinTypes';

// スキン切り替え前に読み込むべき画像URL一覧(P2-2)。
// fileを持つslotだけが対象。重複は除去する。
export function collectSkinAssetUrls(skin: ResolvedSkin): string[] {
  const urls = new Set<string>();
  for (const resolved of Object.values(skin.slots)) {
    if (!resolved) {
      continue;
    }
    const url = skinSlotUrl(resolved);
    if (url !== null) {
      urls.add(url);
    }
  }
  return [...urls];
}

// 全URLをpreloadする。1枚でも失敗/タイムアウトしたらfalse。
// 呼び出し側は失敗時に「前のスキンを維持」する(混在フラッシュ防止)。
export function preloadImages(urls: string[], timeoutMs = 8000): Promise<boolean> {
  if (urls.length === 0 || typeof Image === 'undefined') {
    return Promise.resolve(true);
  }
  const loadOne = (url: string) =>
    new Promise<boolean>((resolve) => {
      const image = new Image();
      const timer = setTimeout(() => resolve(false), timeoutMs);
      image.onload = () => {
        clearTimeout(timer);
        resolve(true);
      };
      image.onerror = () => {
        clearTimeout(timer);
        resolve(false);
      };
      image.src = url;
    });
  return Promise.all(urls.map(loadOne)).then((results) => results.every(Boolean));
}
