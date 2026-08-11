import { mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import { expect, test } from '@playwright/test';
import {
  bootRealMatchEvidence,
  countVisibleDiscards,
  expectEvidenceViewportContract,
  playRealMatchToDiscardCount,
  type EvidenceSize,
  type EvidenceSkinId,
} from './helpers/real-match-evidence';

const SKINS: EvidenceSkinId[] = ['yorunoshirube', 'cute-pop'];
const PLAYER_COUNTS = [3, 4] as const;
const SIZES: EvidenceSize[] = [
  { width: 844, height: 390, label: 'compact' },
  { width: 1440, height: 900, label: 'desktop' },
];
const TARGET_DISCARDS = 10;
const CAPTURE_DIR = 'test-results/batch14-review';

for (const skin of SKINS) {
  for (const playerCount of PLAYER_COUNTS) {
    for (const size of SIZES) {
      test(`${skin} ${playerCount}p ${size.label} real midgame review`, async ({ page }) => {
        test.setTimeout(45_000);
        await bootRealMatchEvidence(page, skin, size);
        const reached = await playRealMatchToDiscardCount(page, playerCount, TARGET_DISCARDS);

        await expect(page.getByRole('main', { name: `${playerCount}人戦の対局卓` })).toBeVisible();
        expect(reached).toBeGreaterThanOrEqual(TARGET_DISCARDS);
        expect(await countVisibleDiscards(page)).toBeGreaterThanOrEqual(TARGET_DISCARDS);
        await expectEvidenceViewportContract(page);

        const geometry = await page.evaluate(() => {
          const viewport = {
            width: document.documentElement.clientWidth,
            height: document.documentElement.clientHeight,
          };
          const elements = [
            ...document.querySelectorAll<HTMLElement>(
              '.sp-seat-played, .sp-seat-played__tiles, .sp-table-center, .sp-self-hand-zone, .sp-match-action-zone, .sp-match-coach',
            ),
          ].filter((element) => {
            const rect = element.getBoundingClientRect();
            const style = getComputedStyle(element);
            return rect.width > 0 && rect.height > 0 && style.visibility !== 'hidden';
          });
          const seatRiverCollisions = [
            ...document.querySelectorAll<HTMLElement>('.sp-table-seat'),
          ].flatMap((seat) => {
            const panel = seat.querySelector<HTMLElement>('.sp-player-panel');
            const river = seat.querySelector<HTMLElement>('.sp-seat-played');
            if (panel === null || river === null) return [];
            const panelRect = panel.getBoundingClientRect();
            const riverRect = river.getBoundingClientRect();
            const overlapWidth = Math.min(panelRect.right, riverRect.right) - Math.max(panelRect.left, riverRect.left);
            const overlapHeight = Math.min(panelRect.bottom, riverRect.bottom) - Math.max(panelRect.top, riverRect.top);
            return overlapWidth > 1 && overlapHeight > 1
              ? [seat.dataset.seatPosition ?? 'unknown']
              : [];
          });
          const selfSeat = document.querySelector<HTMLElement>(".sp-table-seat[data-seat-position='self']");
          const selfPanel = selfSeat?.querySelector<HTMLElement>('.sp-player-panel') ?? null;
          const selfName = selfPanel?.querySelector<HTMLElement>('.sp-player-panel__name') ?? null;
          const selfPanelStyle = selfPanel === null ? null : getComputedStyle(selfPanel);
          const coach = document.querySelector<HTMLElement>('.sp-match-coach');
          const coachOverlaps = coach === null
            ? []
            : [...document.querySelectorAll<HTMLElement>('.sp-self-hand-zone, .sp-match-action-zone')]
                .filter((target) => {
                  const coachRect = coach.getBoundingClientRect();
                  const targetRect = target.getBoundingClientRect();
                  const overlapWidth = Math.min(coachRect.right, targetRect.right) - Math.max(coachRect.left, targetRect.left);
                  const overlapHeight = Math.min(coachRect.bottom, targetRect.bottom) - Math.max(coachRect.top, targetRect.top);
                  return overlapWidth > 1 && overlapHeight > 1;
                })
                .map((target) => target.className);
          const taxonomyBands = [
            ...document.querySelectorAll<HTMLElement>('.sp-match-screen .sp-tile__band'),
          ].filter((band) => {
            const rect = band.getBoundingClientRect();
            const style = getComputedStyle(band);
            return rect.width > 0 && rect.height > 0 && style.display !== 'none';
          });
          const taxonomyBandsOutsideTiles = taxonomyBands
            .filter((band) => {
              const tile = band.closest<HTMLElement>('.sp-tile');
              if (tile === null) return true;
              const bandRect = band.getBoundingClientRect();
              const tileRect = tile.getBoundingClientRect();
              return (
                bandRect.left < tileRect.left - 0.5 ||
                bandRect.top < tileRect.top - 0.5 ||
                bandRect.right > tileRect.right + 0.5 ||
                bandRect.bottom > tileRect.bottom + 0.5
              );
            })
            .map((band) => band.className);
          return {
            outside: elements
              .filter((element) => {
                const rect = element.getBoundingClientRect();
                return (
                  rect.left < -0.5 ||
                  rect.top < -0.5 ||
                  rect.right > viewport.width + 0.5 ||
                  rect.bottom > viewport.height + 0.5
                );
              })
              .map((element) => element.className),
            riversNeedingScroll: [
              ...document.querySelectorAll<HTMLElement>('.sp-seat-played__tiles'),
            ]
              .filter(
                (element) =>
                  element.scrollWidth > element.clientWidth + 1 ||
                  element.scrollHeight > element.clientHeight + 1,
              )
              .map((element) => element.className),
            seatRiverCollisions,
            selfPanelWidth: selfPanel?.getBoundingClientRect().width ?? null,
            selfPanelHeight: selfPanel?.getBoundingClientRect().height ?? null,
            selfPanelDisplay: selfPanelStyle?.display ?? null,
            selfPanelVisibility: selfPanelStyle?.visibility ?? null,
            selfPanelClipPath: selfPanelStyle?.clipPath ?? null,
            selfPanelAriaLabel: selfPanel?.getAttribute('aria-label') ?? null,
            selfNameInDom: selfName !== null,
            coachOverlaps,
            coachWidth: coach?.getBoundingClientRect().width ?? null,
            taxonomyBandCount: taxonomyBands.length,
            taxonomyBandMaxHeight:
              taxonomyBands.length === 0
                ? null
                : Math.max(...taxonomyBands.map((band) => band.getBoundingClientRect().height)),
            taxonomyBandMaxFontSize:
              taxonomyBands.length === 0
                ? null
                : Math.max(...taxonomyBands.map((band) => Number.parseFloat(getComputedStyle(band).fontSize))),
            taxonomyBandsOutsideTiles,
          };
        });

        expect(geometry.outside).toEqual([]);
        expect(geometry.riversNeedingScroll).toEqual([]);
        expect(geometry.coachOverlaps).toEqual([]);
        expect(geometry.coachWidth).not.toBeNull();
        expect(geometry.coachWidth ?? 0).toBeGreaterThanOrEqual(size.label === 'compact' ? 200 : 300);
        expect(geometry.taxonomyBandCount).toBeGreaterThan(0);
        expect(geometry.taxonomyBandMaxHeight).not.toBeNull();
        expect(geometry.taxonomyBandMaxHeight ?? Number.POSITIVE_INFINITY).toBeLessThanOrEqual(4.5);
        expect(geometry.taxonomyBandMaxFontSize).not.toBeNull();
        expect(geometry.taxonomyBandMaxFontSize ?? Number.POSITIVE_INFINITY).toBeLessThanOrEqual(0.5);
        expect(geometry.taxonomyBandsOutsideTiles).toEqual([]);
        expect(geometry.selfPanelWidth).not.toBeNull();
        expect(geometry.selfPanelHeight).not.toBeNull();
        expect(geometry.selfPanelAriaLabel).toBeTruthy();
        expect(geometry.selfNameInDom).toBe(true);
        if (size.label === 'compact') {
          expect(geometry.selfPanelWidth ?? Number.POSITIVE_INFINITY).toBeLessThanOrEqual(2);
          expect(geometry.selfPanelHeight ?? Number.POSITIVE_INFINITY).toBeLessThanOrEqual(2);
          expect(geometry.selfPanelDisplay).not.toBe('none');
          expect(geometry.selfPanelVisibility).not.toBe('hidden');
          expect(geometry.selfPanelClipPath).not.toBe('none');
        }
        if (size.label === 'desktop') {
          expect(geometry.selfPanelWidth ?? 0).toBeGreaterThanOrEqual(100);
          expect(geometry.selfPanelHeight ?? 0).toBeGreaterThanOrEqual(30);
          expect(geometry.seatRiverCollisions).toEqual([]);
        }

        await mkdir(CAPTURE_DIR, { recursive: true });
        await page.screenshot({
          path: join(CAPTURE_DIR, `match-midgame-${skin}-${playerCount}p-${size.label}.png`),
          fullPage: false,
          animations: 'disabled',
          caret: 'hide',
        });
      });
    }
  }
}
