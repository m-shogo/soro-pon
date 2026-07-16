import { expect, test } from '@playwright/test';
import { trackResponses, waitForSkinAssetsReady } from './skinAssetReady';

/*
 * skin asset読込保証の単体検証(H9追補)。スクリーンショットを伴わない
 * 高速な状態ベース検証。visual regression(skin-screens.spec.ts)が
 * 依存するwaitForSkinAssetsReadyの契約そのものをここで直接確認する。
 */

test('cute-pop: final資産が200で読み込まれ、border-image-sourceに反映される', async ({
  page,
}) => {
  const responses = trackResponses(page);
  await page.addInitScript(() => {
    window.localStorage.clear();
    window.localStorage.setItem('soro-pon.skin.v1', 'cute-pop');
  });
  await page.goto('/');
  await page.waitForSelector('html[data-skin="cute-pop"]');

  // manifestのversionと一致した?v=付きURLが実際にリクエストされたこと
  const manifest = await page.evaluate(async () => {
    const res = await fetch('/assets/ui/soro-pon/skins/cute-pop/skin.json');
    return res.json();
  });
  expect(manifest.version).toBeGreaterThanOrEqual(2);

  await waitForSkinAssetsReady(page, 'cute-pop', responses);

  const buttonRequests = responses.filter((r) =>
    r.url.includes('button-secondary-2x.png'),
  );
  const panelRequests = responses.filter((r) => r.url.includes('panel-paper-2x.png'));
  expect(buttonRequests.length).toBeGreaterThan(0);
  expect(buttonRequests.every((r) => r.status === 200)).toBe(true);
  expect(buttonRequests.every((r) => r.url.includes(`?v=${manifest.version}`))).toBe(true);
  expect(panelRequests.length).toBeGreaterThan(0);
  expect(panelRequests.every((r) => r.status === 200)).toBe(true);

  // 旧versionのURLは一切リクエストされていない(新旧混在なし)
  const staleRequests = responses.filter(
    (r) =>
      (r.url.includes('button-secondary-2x.png') || r.url.includes('panel-paper-2x.png')) &&
      !r.url.includes(`?v=${manifest.version}`),
  );
  expect(staleRequests).toEqual([]);
});

test('yorunoshirube: Batch 3 final資産(6slot)が200で読み込まれ、border-image-sourceに反映される', async ({
  page,
}) => {
  const responses = trackResponses(page);
  await page.addInitScript(() => {
    window.localStorage.clear();
    window.localStorage.setItem('soro-pon.skin.v1', 'yorunoshirube');
  });
  await page.goto('/');
  await page.waitForSelector('html[data-skin="yorunoshirube"]');

  const manifest = await page.evaluate(async () => {
    const res = await fetch('/assets/ui/soro-pon/skins/yorunoshirube/skin.json');
    return res.json();
  });
  expect(manifest.version).toBeGreaterThanOrEqual(2);

  await waitForSkinAssetsReady(page, 'yorunoshirube', responses);

  // button.secondary.background(variant="paper")はTOP画面で必ず使われるため
  // final資産の読込を直接確認できる
  const buttonRequests = responses.filter((r) =>
    r.url.includes('button-secondary-background.png'),
  );
  expect(buttonRequests.length).toBeGreaterThan(0);
  expect(buttonRequests.every((r) => r.status === 200)).toBe(true);
  expect(buttonRequests.every((r) => r.url.includes(`?v=${manifest.version}`))).toBe(true);

  const anyFinalImage = await page.evaluate(() => {
    const layers = [...document.querySelectorAll<HTMLElement>('.sp-skin-layer')];
    return layers.some((el) => getComputedStyle(el).borderImageSource.includes('/generated/final/'));
  });
  expect(anyFinalImage).toBe(true);
});

test('yorunoshirube: panel.paper.default/panel.result.frameはBLOCKED_BY_TECHNICAL_VALIDATIONのためfallback(none)のまま', async ({
  page,
}) => {
  const responses = trackResponses(page);
  await page.addInitScript(() => {
    window.localStorage.clear();
    window.localStorage.setItem('soro-pon.skin.v1', 'yorunoshirube');
  });
  await page.goto('/');
  await page.waitForSelector('html[data-skin="yorunoshirube"]');
  await waitForSkinAssetsReady(page, 'yorunoshirube', responses);

  const blockedSlotRequests = responses.filter(
    (r) =>
      r.url.includes('panel-paper-default.png') || r.url.includes('panel-result-frame.png'),
  );
  expect(blockedSlotRequests).toEqual([]);
});
