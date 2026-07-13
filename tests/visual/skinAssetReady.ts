import type { Page } from '@playwright/test';
import { expect } from '@playwright/test';

/*
 * visual regressionのskin asset読込保証(H9追補)。
 *
 * これまでの背景: SkinProvider(src/ui/skins/SkinProvider.tsx)は
 * documentへのapplyDocumentSkin(=`data-skin`属性を立てる)呼び出しを、
 * 可視アセットのpreload完了より後に行う(P2-2 atomic適用)。そのため
 * `waitForSelector('html[data-skin=...]')` は構造的にはpreload完了後
 * にしか満たされない。
 *
 * ただし、pixelmatch(Playwrightのスクリーンショット比較)は色距離の
 * perceptual threshold(既定0.2)で「同じ」と判定する。final PNG(白面+
 * 淡いベージュ枠)はCSS fallback(白系グラデーション+淡い枠)と意図的に
 * 近い見た目のため、fallback→final切替後もピクセル差分が
 * maxDiffPixelRatio(既定0.01)は元よりmaxDiffPixelRatio:0でも
 * 「差分ゼロ」と判定されうる。つまりスクリーンショット比較だけでは
 * 「実際にfinal資産が描画されたか」を証明できない。
 *
 * この関数は、スクリーンショット前に次を明示的に検証する:
 * - skin.jsonのfinal slotに対応するネットワークリクエストが200である
 * - 対応するDOM要素のborder-image-sourceが実際にfinal URL(?v=<version>
 *   付き)を指している
 * - ペイント確定のため2フレーム待つ
 */

type SkinSlotDef = {
  file: string | null;
  status: 'placeholder' | 'final';
  renderMode: string;
};

type SkinManifest = {
  id: string;
  version: number;
  slots: Record<string, SkinSlotDef>;
};

export type ResponseLog = { url: string; status: number; contentType: string };

// テスト冒頭(page生成直後、gotoより前)で呼ぶ。以後の全レスポンスを記録する。
//
// 注意(重要な既知の罠): `vite preview` はSPA fallbackにより、
// 存在しない静的ファイルへのGETでも200 + index.htmlを返す。
// status===200だけを見ると「欠落した最終PNGへのリクエストが
// 404にならず200のHTMLで応答された」ケースを見逃す。
// 必ずcontent-typeも記録し、image/*であることを確認すること。
export function trackResponses(page: Page): ResponseLog[] {
  const log: ResponseLog[] = [];
  page.on('response', (res) => {
    log.push({
      url: res.url(),
      status: res.status(),
      contentType: res.headers()['content-type'] ?? '',
    });
  });
  return log;
}

// data-skin確定後に呼ぶ。final資産が実際に読込・適用済みであることを
// ネットワーク結果とDOM computed styleの両方で確認してからresolveする。
export async function waitForSkinAssetsReady(
  page: Page,
  skinId: string,
  responses: ResponseLog[],
): Promise<void> {
  const manifest = (await page.evaluate(async (id) => {
    const res = await fetch(`/assets/ui/soro-pon/skins/${id}/skin.json`);
    return res.ok ? ((await res.json()) as unknown) : null;
  }, skinId)) as SkinManifest | null;
  expect(manifest, `skin.json for ${skinId} must be reachable`).not.toBeNull();
  if (!manifest) {
    return;
  }

  const finalFiles = Object.entries(manifest.slots)
    .filter(([, def]) => def.status === 'final' && def.file)
    .map(([slot, def]) => ({ slot, file: def.file as string }));

  for (const { slot, file } of finalFiles) {
    const expectedSuffix = `/skins/${skinId}/generated/final/${file}`;
    const expectedVersionParam = `v=${manifest.version}`;
    // status===200だけでは不十分(vite previewのSPA fallbackで欠落PNGでも
    // 200+text/htmlが返るケースがある)。content-typeがimage/*であることも
    // 確認して初めて「実際に画像が読み込まれた」とみなす。
    const matched = await expectWithRetry(
      () =>
        responses.some(
          (r) =>
            r.url.includes(expectedSuffix) &&
            r.url.includes(expectedVersionParam) &&
            r.status === 200 &&
            r.contentType.startsWith('image/'),
        ),
      3000,
    );
    expect(
      matched,
      `${skinId}/${slot}: expected a 200 image/* response for ${expectedSuffix}?${expectedVersionParam} ` +
        `(observed: ${responses
          .filter((r) => r.url.includes(file))
          .map((r) => `${r.status} ${r.contentType} ${r.url}`)
          .join(', ') || 'none'})`,
    ).toBe(true);
  }

  // DOM側: 実際にborder-image-sourceがfinal URLを指しているか
  // (fallback CSSのままでもネットワークは200になり得るため、この検証で
  // 「実際に描画に使われているか」まで確認する)
  const domCheck = await page.evaluate((expectedVersion) => {
    const layers = [...document.querySelectorAll<HTMLElement>('.sp-skin-layer')];
    const withFinalImage = layers.filter((el) => {
      const src = getComputedStyle(el).borderImageSource;
      return src.includes('/generated/final/') && src.includes(`?v=${expectedVersion}`);
    });
    return { total: layers.length, withFinalImage: withFinalImage.length };
  }, manifest.version);

  if (finalFiles.length > 0) {
    expect(
      domCheck.withFinalImage,
      `expected at least one .sp-skin-layer with border-image-source pointing at a final asset (?v=${manifest.version}); found ${domCheck.withFinalImage} of ${domCheck.total} layers`,
    ).toBeGreaterThan(0);
  }

  // ペイント確定を2フレーム待つ(preloadでdecode済みでも、実DOMへの
  // border-image適用ペイントは次フレーム以降になりうるため)
  await page.evaluate(
    () =>
      new Promise<void>((resolve) => {
        requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
      }),
  );
}

async function expectWithRetry(check: () => boolean, timeoutMs: number): Promise<boolean> {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    if (check()) {
      return true;
    }
    await new Promise((r) => setTimeout(r, 50));
  }
  return check();
}
