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
// Image生成・src代入が同期例外を投げる環境でもPromiseをrejectさせず、
// 呼び出し側が前のスキン/fallbackを維持できる結果へ落とす。
export function preloadImages(urls: string[], timeoutMs = 8000): Promise<boolean> {
  if (urls.length === 0 || typeof Image === 'undefined') {
    return Promise.resolve(true);
  }
  const loadOne = (url: string) =>
    new Promise<boolean>((resolve) => {
      let image: HTMLImageElement;
      try {
        image = new Image();
      } catch {
        resolve(false);
        return;
      }

      let settled = false;
      const finish = (result: boolean) => {
        if (settled) {
          return;
        }
        settled = true;
        clearTimeout(timer);
        image.onload = null;
        image.onerror = null;
        resolve(result);
      };
      const timer = setTimeout(() => finish(false), timeoutMs);
      image.onload = () => finish(true);
      image.onerror = () => finish(false);
      try {
        image.src = url;
      } catch {
        finish(false);
      }
    });
  return Promise.all(urls.map(loadOne)).then((results) => results.every(Boolean));
}
