import { mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import { expect, test, type Page } from '@playwright/test';

const SKINS = ['yorunoshirube', 'cute-pop'] as const;
const SIZES = [
  { width: 844, height: 390, label: 'compact' },
  { width: 1440, height: 900, label: 'desktop' },
] as const;
const STATES = ['clean', 'warning', 'blocked'] as const;
const CAPTURE_DIR = 'test-results/batch14-review';

type SkinId = (typeof SKINS)[number];
type CaptureSize = (typeof SIZES)[number];
type InspectorState = (typeof STATES)[number];

async function bootEditor(page: Page, skin: SkinId, size: CaptureSize) {
  await page.setViewportSize({ width: size.width, height: size.height });
  await page.addInitScript(({ skinId }) => {
    Date.now = () => 1_700_000_680_000;
    window.localStorage.clear();
    window.localStorage.setItem('soro-pon.skin.v1', skinId);
  }, { skinId: skin });
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'soro-pon' })).toBeVisible();
  await expect.poll(() => page.evaluate(() => document.documentElement.dataset.skin)).toBe(skin);

  await page.getByRole('button', { name: /デッキ一覧/ }).click();
  await expect(page.getByRole('heading', { name: 'デッキ選択' })).toBeVisible();
  await page.locator('.sp-deck-select-card').first().click();
  await page.getByRole('button', { name: 'デッキを編集' }).click();
  await expect(page.getByRole('heading', { name: 'デッキ編集' })).toBeVisible();
}

async function setInspectorState(page: Page, state: InspectorState) {
  if (state === 'clean') return;

  await page.getByRole('tab', { name: /^役/ }).click();
  const choices = page.locator('.sp-role-workbench__choice');
  const targetCount = state === 'warning' ? 2 : 0;

  while ((await choices.count()) > targetCount) {
    await page.getByRole('button', { name: 'この役を削除' }).click();
  }

  const status = page.locator('.sp-deck-editor-inspector__status');
  if (state === 'warning') {
    await expect(status).toContainText('注意あり');
  } else {
    await expect(status).toContainText('要修正');
  }
}

async function inspectLedger(page: Page) {
  return page.evaluate(() => {
    const main = document.querySelector<HTMLElement>('[role="tabpanel"][id^="sp-tabpanel-"]');
    const screen = main?.closest<HTMLElement>('.sp-screen') ?? null;
    const body = screen?.querySelector<HTMLElement>(':scope > .sp-screen__body') ?? null;
    const side = body?.querySelector<HTMLElement>(':scope > .sp-screen__col--side') ?? null;
    const inspector = side?.querySelector<HTMLElement>('.sp-deck-editor-inspector') ?? null;
    const panel = inspector?.querySelector<HTMLElement>(':scope > .sp-paper-panel') ?? null;
    const title = inspector?.querySelector<HTMLElement>('.sp-paper-panel__title') ?? null;
    const status = inspector?.querySelector<HTMLElement>('.sp-deck-editor-inspector__status') ?? null;
    const badge = status?.querySelector<HTMLElement>('.sp-badge') ?? null;
    const summary = inspector?.querySelector<HTMLElement>('.sp-deck-editor-inspector__summary') ?? null;
    const issueCounts = inspector?.querySelector<HTMLElement>('.sp-deck-editor-inspector__issue-counts') ?? null;
    const validation = inspector?.querySelector<HTMLElement>(
      '.sp-deck-editor-inspector__validation, .sp-deck-editor-inspector__validation-clear',
    ) ?? null;
    if (!main || !body || !side || !inspector || !panel || !title || !status || !badge || !summary || !issueCounts || !validation) {
      return null;
    }

    const visible = (element: HTMLElement) => {
      const rect = element.getBoundingClientRect();
      const style = getComputedStyle(element);
      return rect.width > 0 && rect.height > 0 && style.display !== 'none' && style.visibility !== 'hidden';
    };
    const font = (element: HTMLElement) => Number.parseFloat(getComputedStyle(element).fontSize);
    const rect = (element: HTMLElement) => element.getBoundingClientRect();

    const inspectorRect = rect(inspector);
    const sideRect = rect(side);
    const bodyRect = rect(body);
    const mainRect = rect(main);
    const titleRect = rect(title);
    const statusRect = rect(status);
    const summaryRect = rect(summary);
    const issueRect = rect(issueCounts);
    const validationRect = rect(validation);
    const midY = inspectorRect.top + inspectorRect.height / 2;

    const normalText = [
      title,
      status,
      badge,
      ...summary.querySelectorAll<HTMLElement>('dt'),
      ...summary.querySelectorAll<HTMLElement>('small'),
      ...issueCounts.querySelectorAll<HTMLElement>('span'),
      validation,
    ].filter(visible);
    const majorText = [
      ...summary.querySelectorAll<HTMLElement>('dd'),
      ...issueCounts.querySelectorAll<HTMLElement>('strong'),
    ].filter(visible);
    const validationSummary = validation.querySelector<HTMLElement>('summary');
    const issueValues = [...issueCounts.querySelectorAll<HTMLElement>('strong')].map((element) =>
      Number.parseInt(element.textContent ?? '0', 10),
    );

    return {
      statusText: status.textContent ?? '',
      validationText: validation.textContent ?? '',
      validationOpen: validation instanceof HTMLDetailsElement ? validation.open : false,
      issueValues,
      normalFontMin: normalText.length === 0 ? 0 : Math.min(...normalText.map(font)),
      majorFontMin: majorText.length === 0 ? 0 : Math.min(...majorText.map(font)),
      validationSummaryHeight: validationSummary ? rect(validationSummary).height : null,
      panelDisplay: getComputedStyle(panel).display,
      topRowAligned:
        titleRect.bottom <= midY + 2 && statusRect.bottom <= midY + 2 && summaryRect.bottom <= midY + 2,
      bottomRowAligned: issueRect.top >= midY - 2,
      validationSpansRail: validationRect.height >= inspectorRect.height - 2,
      sideHeight: sideRect.height,
      inspectorHeight: inspectorRect.height,
      sideBelowMain: sideRect.top >= mainRect.bottom - 1,
      sideRightOfMain: sideRect.left >= mainRect.right - 1,
      sideTopAlignedWithMain: Math.abs(sideRect.top - mainRect.top) <= 2,
      sideRatio: sideRect.width / bodyRect.width,
      inspectorOverflow:
        inspector.scrollWidth > inspector.clientWidth + 1 || inspector.scrollHeight > inspector.clientHeight + 1,
      sideOverflow:
        side.scrollWidth > side.clientWidth + 1 || side.scrollHeight > side.clientHeight + 1,
      viewportOverflow:
        document.documentElement.scrollWidth > document.documentElement.clientWidth + 1 ||
        document.documentElement.scrollHeight > document.documentElement.clientHeight + 1,
    };
  });
}

function expectState(geometry: Awaited<ReturnType<typeof inspectLedger>>, state: InspectorState) {
  expect(geometry).not.toBeNull();
  if (!geometry) return;

  if (state === 'clean') {
    expect(geometry.statusText).toContain('対局可');
    expect(geometry.validationText).toContain('問題なし');
    expect(geometry.issueValues[0]).toBe(0);
    expect(geometry.issueValues[1]).toBe(0);
  } else if (state === 'warning') {
    expect(geometry.statusText).toContain('注意あり');
    expect(geometry.issueValues[0]).toBe(0);
    expect(geometry.issueValues[1]).toBeGreaterThan(0);
  } else {
    expect(geometry.statusText).toContain('要修正');
    expect(geometry.issueValues[0]).toBeGreaterThan(0);
    expect(geometry.validationOpen).toBe(true);
  }
}

for (const skin of SKINS) {
  for (const size of SIZES) {
    for (const state of STATES) {
      test(`${skin} ${size.label} ${state} DeckEditor inspector stays readable`, async ({ page }) => {
        await bootEditor(page, skin, size);
        await setInspectorState(page, state);

        const geometry = await inspectLedger(page);
        expectState(geometry, state);
        expect(geometry?.viewportOverflow).toBe(false);
        expect(geometry?.inspectorOverflow).toBe(false);
        expect(geometry?.sideOverflow).toBe(false);

        if (size.label === 'compact') {
          expect(geometry?.sideBelowMain).toBe(true);
          expect(geometry?.sideHeight ?? Number.POSITIVE_INFINITY).toBeLessThanOrEqual(58);
          expect(geometry?.inspectorHeight ?? Number.POSITIVE_INFINITY).toBeLessThanOrEqual(55);
          expect(geometry?.panelDisplay).toBe('contents');
          expect(geometry?.normalFontMin ?? 0).toBeGreaterThanOrEqual(9);
          expect(geometry?.majorFontMin ?? 0).toBeGreaterThanOrEqual(11);
          expect(geometry?.topRowAligned).toBe(true);
          expect(geometry?.bottomRowAligned).toBe(true);
          expect(geometry?.validationSpansRail).toBe(true);
          if (geometry?.validationSummaryHeight !== null) {
            expect(geometry?.validationSummaryHeight ?? 0).toBeGreaterThanOrEqual(24);
          }
        } else {
          expect(geometry?.panelDisplay).not.toBe('contents');
          expect(geometry?.sideRightOfMain).toBe(true);
          expect(geometry?.sideTopAlignedWithMain).toBe(true);
          expect(geometry?.sideRatio ?? 0).toBeGreaterThanOrEqual(0.22);
          expect(geometry?.sideRatio ?? 1).toBeLessThanOrEqual(0.28);
        }

        await mkdir(CAPTURE_DIR, { recursive: true });
        await page.screenshot({
          path: join(CAPTURE_DIR, `deck-editor-readable-inspector-${skin}-${state}-${size.label}.png`),
          fullPage: false,
          animations: 'disabled',
          caret: 'hide',
        });
      });
    }
  }
}
