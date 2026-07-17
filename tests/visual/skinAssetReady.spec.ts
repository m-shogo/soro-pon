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

test('yorunoshirube: Batch 3 core final資産(8slot)が200で読み込まれ、border-image-sourceに反映される', async ({
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
  expect(manifest.version).toBeGreaterThanOrEqual(3);

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

test('yorunoshirube: panel.paper.default/panel.result.frameのremediation後finalが?v=3で読み込まれ、blocked状態が解消していること', async ({
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
  expect(manifest.version).toBeGreaterThanOrEqual(3);
  // Batch 3 core 8slot(かつてBLOCKED_BY_TECHNICAL_VALIDATIONだった2slotを含む)が
  // 全てfinal登録されていること(Batch 4のbadge.info.background追加後は9slotになるため
  // 下限のみ確認し、厳密な件数はBatch 4専用testで検証する)
  expect(Object.keys(manifest.slots).length).toBeGreaterThanOrEqual(8);
  expect(manifest.slots['panel.paper.default']?.status).toBe('final');
  expect(manifest.slots['panel.result.frame']?.status).toBe('final');

  await waitForSkinAssetsReady(page, 'yorunoshirube', responses);

  const correctedSlotRequests = responses.filter(
    (r) =>
      r.url.includes('panel-paper-default.png') || r.url.includes('panel-result-frame.png'),
  );
  // remediation前はCSS fallbackのため0件だったが、v3公開後は両方とも
  // requestが発生しHTTP 200でversioned URL(?v=3)から解決されること
  expect(correctedSlotRequests.length).toBeGreaterThan(0);
  expect(correctedSlotRequests.every((r) => r.status === 200)).toBe(true);
  expect(correctedSlotRequests.every((r) => r.url.includes(`?v=${manifest.version}`))).toBe(true);
});

test('yorunoshirube: Batch 4 badge.info.background昇格後、v4で9final全てが解決し、candidate requestが発生しないこと', async ({
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
  expect(manifest.version).toBeGreaterThanOrEqual(4);
  // Batch 3の8core + Batch 4のbadge.info.backgroundで9slot全てfinal登録
  expect(Object.keys(manifest.slots)).toHaveLength(9);
  expect(manifest.slots['badge.info.background']?.status).toBe('final');
  expect(manifest.slots['badge.info.background']?.file).toBe('badge-info-background.png');

  await waitForSkinAssetsReady(page, 'yorunoshirube', responses);

  // DeckListScreenのinfo badge("遊べる")がbadge.info.background finalを
  // versioned URL(?v=4)で読み込むこと
  const badgeRequests = responses.filter((r) => r.url.includes('badge-info-background.png'));
  expect(badgeRequests.length).toBeGreaterThan(0);
  expect(badgeRequests.every((r) => r.status === 200)).toBe(true);
  expect(badgeRequests.every((r) => r.url.includes(`?v=${manifest.version}`))).toBe(true);
  expect(badgeRequests.every((r) => r.url.includes('/generated/final/'))).toBe(true);

  // Batch 3の8核 final全て(panel.paper.default/panel.result.frameを含む)が
  // 同一version(?v=4)で解決されること(atomic publish確認)
  const coreFiles = [
    'table-background.png',
    'panel-paper-default.png',
    'panel-modal-background.png',
    'panel-result-frame.png',
    'button-primary-background.png',
    'button-secondary-background.png',
    'tile-face-base.png',
    'tile-back-base.png',
  ];
  for (const file of coreFiles) {
    const reqs = responses.filter((r) => r.url.includes(file));
    expect(reqs.length).toBeGreaterThan(0);
    expect(reqs.every((r) => r.status === 200)).toBe(true);
    expect(reqs.every((r) => r.url.includes(`?v=${manifest.version}`))).toBe(true);
  }

  // candidateパス(badge-info-background-candidate-*.png)は一切requestされないこと
  // (Gallery専用review UIは撤去済み、production resolverはfinalしか参照しない)
  const candidateRequests = responses.filter((r) =>
    r.url.includes('badge-info-background-candidate'),
  );
  expect(candidateRequests).toEqual([]);

  // B/C分類のslot(badge.warning.background/table.overlay.ink/table.overlay.light/
  // panel.paper.emphasis)は画像化されていないため、対応する画像requestが発生しないこと
  const bcSlotFiles = [
    'badge-warning-background',
    'table-overlay-ink',
    'table-overlay-light',
    'panel-paper-emphasis',
  ];
  for (const stem of bcSlotFiles) {
    const reqs = responses.filter((r) => r.url.includes(stem));
    expect(reqs).toEqual([]);
  }
});
