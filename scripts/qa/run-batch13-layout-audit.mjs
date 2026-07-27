import { chromium } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';

const argument = (name, fallback) => {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : fallback;
};

const baseUrl = argument(
  '--base-url',
  process.env.PLAYWRIGHT_BASE_URL ?? 'http://127.0.0.1:4173',
);
const phase = argument('--phase', 'after');
const outputDirectory = argument(
  '--output',
  `docs/qa/evidence/batch-13/visual-review/${phase}`,
);
const sourceSha = argument('--source-sha', 'working-tree');

const viewports = [
  [844, 390],
  [812, 375],
  [932, 430],
  [1024, 576],
  [1280, 720],
  [1440, 900],
];
const skins = ['yorunoshirube', 'cute-pop'];
const playerCounts = [3, 4];

fs.mkdirSync(outputDirectory, { recursive: true });
const browser = await chromium.launch({ headless: true });
const results = [];

for (const skin of skins) {
  for (const playerCount of playerCounts) {
    for (const [width, height] of viewports) {
      const page = await browser.newPage({
        viewport: { width, height },
        reducedMotion: 'reduce',
      });
      await page.addInitScript(
        ({ skinId, nowMs }) => {
          Date.now = () => nowMs;
          window.localStorage.clear();
          window.localStorage.setItem('soro-pon.skin.v1', skinId);
        },
        {
          skinId: skin,
          nowMs:
            playerCount === 3 ? 1_700_000_000_077 : 1_700_000_000_239,
        },
      );
      await page.goto(baseUrl);
      await page.getByRole('button', { name: /まず遊ぶ/ }).click();
      await page.getByRole('button', { name: `${playerCount}人戦` }).click();
      await page.getByRole('button', { name: '対局開始' }).click();
      await page.waitForTimeout(850);

      const audit = await page.evaluate(() => {
        const selectors = [
          '.sp-match-layout',
          '.sp-match-utility',
          '.sp-table-stage',
          '.sp-table-seat',
          '.sp-table-center',
          '.sp-self-hand-zone',
          '.sp-match-action-zone',
          '.sp-player-panel',
          '.sp-seat-played',
          '.sp-tile',
          '.sp-button',
        ];
        const elements = [
          ...document.querySelectorAll(selectors.join(',')),
        ].filter((element) => {
          const style = getComputedStyle(element);
          const rect = element.getBoundingClientRect();
          return (
            style.display !== 'none' &&
            style.visibility !== 'hidden' &&
            rect.width > 0 &&
            rect.height > 0
          );
        });
        const viewport = {
          width: document.documentElement.clientWidth,
          height: document.documentElement.clientHeight,
        };
        const collisions = [];
        const collisionElements = [
          ...document.querySelectorAll(
            '.sp-match-utility, .sp-table-seat, .sp-table-center, .sp-self-hand-zone, .sp-match-action-zone',
          ),
        ];
        for (let leftIndex = 0; leftIndex < collisionElements.length; leftIndex += 1) {
          for (
            let rightIndex = leftIndex + 1;
            rightIndex < collisionElements.length;
            rightIndex += 1
          ) {
            const left = collisionElements[leftIndex];
            const right = collisionElements[rightIndex];
            if (left.contains(right) || right.contains(left)) continue;
            const a = left.getBoundingClientRect();
            const b = right.getBoundingClientRect();
            if (
              Math.min(a.right, b.right) - Math.max(a.left, b.left) > 1 &&
              Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top) > 1
            ) {
              collisions.push(`${left.className} <> ${right.className}`);
            }
          }
        }
        return {
          documentOverflow:
            document.documentElement.scrollWidth > viewport.width + 1 ||
            document.documentElement.scrollHeight > viewport.height + 1,
          overflow: elements
            .filter(
              (element) =>
                element.scrollWidth > element.clientWidth + 1 ||
                element.scrollHeight > element.clientHeight + 1,
            )
            .map((element) => ({
              selector: element.className,
              scroll: [element.scrollWidth, element.scrollHeight],
              client: [element.clientWidth, element.clientHeight],
            })),
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
          smallTargets: [
            ...document.querySelectorAll('button:not([disabled])'),
          ]
            .filter((element) => {
              const rect = element.getBoundingClientRect();
              return (
                rect.width > 0 &&
                rect.height > 0 &&
                (rect.width < 44 || rect.height < 44)
              );
            })
            .map(
              (element) =>
                element.getAttribute('aria-label') ??
                element.textContent?.trim().slice(0, 60),
            ),
          collisions,
        };
      });

      const id = `${skin}-${playerCount}p-${width}x${height}`;
      results.push({ id, ...audit });
      if (
        (width === 844 && height === 390) ||
        (width === 1440 && height === 900)
      ) {
        await page.screenshot({
          path: path.join(outputDirectory, `${id}.jpg`),
          type: 'jpeg',
          quality: 84,
        });
      }
      await page.close();
    }
  }
}

await browser.close();

const counts = results.reduce(
  (summary, result) => ({
    documentOverflow:
      summary.documentOverflow + (result.documentOverflow ? 1 : 0),
    overflow: summary.overflow + result.overflow.length,
    outside: summary.outside + result.outside.length,
    smallTargets: summary.smallTargets + result.smallTargets.length,
    collisions: summary.collisions + result.collisions.length,
  }),
  {
    documentOverflow: 0,
    overflow: 0,
    outside: 0,
    smallTargets: 0,
    collisions: 0,
  },
);

const summary = {
  schemaVersion: 1,
  phase,
  sourceSha,
  baseUrlScope: new URL(baseUrl).hostname === '127.0.0.1' ? 'loopback' : 'external',
  viewports,
  cases: results.length,
  counts,
  pass: Object.values(counts).every((count) => count === 0),
  results,
};

fs.writeFileSync(
  path.join(outputDirectory, 'automated-layout-audit.json'),
  `${JSON.stringify(summary, null, 2)}\n`,
);
console.log(JSON.stringify({ cases: results.length, counts, pass: summary.pass }));
process.exitCode = summary.pass ? 0 : 1;
