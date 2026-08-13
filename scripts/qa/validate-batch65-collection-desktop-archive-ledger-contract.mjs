import { readFile } from 'node:fs/promises';

const REQUIRED_FILES = {
  app: 'src/App.tsx',
  screen: 'src/ui/screens/CollectionScreen.tsx',
  authoredCss: 'src/ui/styles/collection-authored.css',
  stageCss: 'src/ui/styles/collection-ledger-stage.css',
  emptyCss: 'src/ui/styles/collection-empty-score-ledger.css',
  css: 'src/ui/styles/collection-desktop-archive-ledger.css',
  visual: 'tests/visual/batch65-collection-desktop-archive-ledger-review.spec.ts',
  batch22Visual: 'tests/visual/batch22-collection-review.spec.ts',
  packageJson: 'package.json',
  workflow: '.github/workflows/ci.yml',
  visualWorkflow: '.github/workflows/batch14-visual-review.yml',
};

const files = Object.fromEntries(
  await Promise.all(Object.entries(REQUIRED_FILES).map(async ([key, path]) => [key, await readFile(path, 'utf8')])),
);
const failures = [];

function requireText(fileKey, needle, reason) {
  if (!files[fileKey].includes(needle)) failures.push(`${REQUIRED_FILES[fileKey]}: missing ${JSON.stringify(needle)} — ${reason}`);
}
function forbidText(fileKey, needle, reason) {
  if (files[fileKey].includes(needle)) failures.push(`${REQUIRED_FILES[fileKey]}: forbidden ${JSON.stringify(needle)} — ${reason}`);
}

requireText(
  'app',
  "import './ui/styles/collection-desktop-archive-ledger.css';",
  'Batch 65 desktop Collection shell override must be loaded after prior Collection ownership',
);

for (const needle of [
  'className="sp-collection-summary"',
  'className="sp-screen__col sp-screen__col--main sp-screen__col--scroll sp-collection-screen__main"',
  'title="高得点 Top 10"',
  'title="クリアボード"',
  'title={`あがった役 ${collectedRoles.length}`}',
  'className="sp-screen__col sp-screen__col--side sp-screen__col--scroll sp-collection-screen__recent"',
  'variant="ink" title="最近の記録"',
  'onClick={onBack}',
]) {
  requireText('screen', needle, 'Collection section content, chronology, and navigation semantics must remain unchanged');
}

for (const needle of [
  '.sp-collection-summary {',
  'grid-template-columns: repeat(4, minmax(0, 1fr));',
  '.sp-collection-screen__main > .sp-paper-panel {',
  'background: color-mix(in srgb, var(--sp-color-paper) 92%, transparent);',
  '@media (max-width: 899px), (max-height: 430px)',
  'border-radius: 4px;',
]) {
  requireText('authoredCss', needle, 'summary, paper surface, and compact non-empty card shell ownership must remain intact');
}
for (const needle of [
  'width: min(1180px, 100%);',
  '.sp-collection-screen__main > .sp-paper-panel:first-child {',
  'border-top: 2px solid',
  'width: min(260px, 28%);',
  'grid-template-rows: minmax(0, 1fr) auto;',
  'max-height: 58px;',
]) {
  requireText('stageCss', needle, 'Batch 22 desktop stage and compact chronology geometry must remain intact');
}
for (const needle of [
  'Batch 53: an empty high-score panel is status, not content.',
  '.sp-collection-scoreboard--empty {',
  'border-radius: 2px;',
  'height: 34px;',
]) {
  requireText('emptyCss', needle, 'Batch 53 compact empty-score shell must remain a deliberate 2px-radius status row');
}

for (const needle of [
  'Batch 65: desktop Collection sections read as one archive ledger',
  '@media (min-width: 900px) and (min-height: 431px)',
  '.sp-collection-screen__main {',
  'gap: 0;',
  '.sp-collection-screen__main > .sp-paper-panel {',
  'border-radius: 0;',
  'box-shadow: none;',
  '.sp-collection-screen__main > .sp-paper-panel > .sp-skin-layer,',
  '.sp-collection-screen__recent > .sp-paper-panel > .sp-skin-layer {',
  'display: none;',
  '.sp-collection-screen__recent > .sp-paper-panel {',
]) {
  requireText('css', needle, 'Batch 65 must flatten only desktop Collection section shells into an archive ledger');
}
for (const forbidden of [
  '@media (max-width:',
  '!important',
  'background: transparent',
  'linear-gradient(',
  'radial-gradient(',
  'position: fixed',
  "data-skin='cute-pop'",
  "data-skin='yorunoshirube'",
]) {
  forbidText('css', forbidden, 'Batch 65 must not change compact ownership, erase paper surfaces, or introduce skin/specificity/decorative hacks');
}

for (const needle of [
  "const SKINS = ['yorunoshirube', 'cute-pop'] as const;",
  "{ width: 844, height: 390, label: 'compact' }",
  "{ width: 1440, height: 900, label: 'desktop' }",
  "expect(geometry?.mainPanelCount).toBe(3);",
  "expect(geometry?.mainGap).toBe(0);",
  'expect(geometry?.maxMainPanelRadius ?? Number.POSITIVE_INFINITY).toBeLessThanOrEqual(1);',
  'expect(geometry?.allMainPanelsShadowless).toBe(true);',
  'expect(geometry?.firstAccentWidth ?? 0).toBeGreaterThanOrEqual(2);',
  'expect(geometry?.recentRadius ?? Number.POSITIVE_INFINITY).toBeLessThanOrEqual(1);',
  'expect(geometry?.visibleDirectSkinLayers).toBe(0);',
  'expect(geometry?.emptyScoreboardRadius ?? 0).toBeGreaterThanOrEqual(1.5);',
  'expect(geometry?.emptyScoreboardRadius ?? Number.POSITIVE_INFINITY).toBeLessThanOrEqual(2.5);',
  'expect(geometry?.minNonEmptyMainPanelRadius ?? 0).toBeGreaterThanOrEqual(3.5);',
  'expect(geometry?.recentRadius ?? 0).toBeGreaterThanOrEqual(3.5);',
  'expect(geometry?.recentHeight ?? Number.POSITIVE_INFINITY).toBeLessThanOrEqual(64);',
  'expect(geometry?.emptyScoreboardHeight ?? Number.POSITIVE_INFINITY).toBeLessThanOrEqual(38);',
  'collection-archive-ledger-${skin}-${size.label}.png',
]) {
  requireText('visual', needle, 'Batch 65 evidence must prove desktop flattening and preserve Batch 53/22 compact shell distinctions');
}

for (const needle of [
  'expect((geometry?.mainWidth ?? 0) / (geometry?.bodyWidth ?? 1)).toBeGreaterThanOrEqual(0.95);',
  'expect(geometry?.recentHeight).toBeLessThanOrEqual(64);',
  'expect(geometry?.emptyScoreboardHeight ?? Number.POSITIVE_INFINITY).toBeLessThanOrEqual(38);',
  'expect(geometry?.clearCellCount).toBe(25);',
  'expect(geometry?.clearBoardColumnCount).toBe(5);',
]) {
  requireText('batch22Visual', needle, 'canonical Batch 22 compact Collection proof must remain independently intact');
}

requireText('visualWorkflow', 'pnpm qa:batch14:review-capture', 'canonical visual review must remain intact');
requireText(
  'visualWorkflow',
  '- name: Verify Batch 65 Collection desktop archive ledger',
  'Batch 65 must have a named final Collection visual proof step',
);
requireText(
  'visualWorkflow',
  'pnpm exec playwright test tests/visual/batch65-collection-desktop-archive-ledger-review.spec.ts',
  'Batch 65 dedicated geometry proof must run before artifact upload',
);
requireText(
  'packageJson',
  '"qa:batch65:collection-desktop-archive-ledger-contract": "node scripts/qa/validate-batch65-collection-desktop-archive-ledger-contract.mjs"',
  'Batch 65 contract must be directly runnable',
);
requireText(
  'workflow',
  'pnpm qa:batch65:collection-desktop-archive-ledger-contract',
  'Batch 65 contract must block CI drift',
);

if (failures.length > 0) {
  console.error('Batch 65 Collection desktop archive ledger contract drift detected:');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log('Batch 65 Collection desktop archive ledger contract: PASS');
console.log(`Checked ${Object.keys(REQUIRED_FILES).length} canonical files.`);
