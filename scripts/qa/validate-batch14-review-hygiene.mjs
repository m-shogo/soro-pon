import { readFile } from 'node:fs/promises';

const REQUIRED_FILES = {
  packageJson: 'package.json',
  capture: 'tests/visual/batch14-review-capture.spec.ts',
  collectionCapture: 'tests/visual/batch22-collection-review.spec.ts',
  resultCapture: 'tests/visual/batch23-result-review.spec.ts',
  midgameCapture: 'tests/visual/batch26-midgame-review.spec.ts',
  topRackCapture: 'tests/visual/batch42-top-rack-review.spec.ts',
  matchSetupRackCapture: 'tests/visual/batch44-match-setup-rack-review.spec.ts',
  workflow: '.github/workflows/batch14-visual-review.yml',
  roleWorkbenchCss: 'src/ui/styles/deck-role-workbench.css',
  reviewDoc: 'docs/qa/BATCH-14-VISUAL-REVIEW.md',
};

const files = Object.fromEntries(
  await Promise.all(
    Object.entries(REQUIRED_FILES).map(async ([key, path]) => [key, await readFile(path, 'utf8')]),
  ),
);

const failures = [];

function requireText(fileKey, needle, reason) {
  if (!files[fileKey].includes(needle)) {
    failures.push(`${REQUIRED_FILES[fileKey]}: missing ${JSON.stringify(needle)} — ${reason}`);
  }
}

function forbidText(fileKey, needle, reason) {
  if (files[fileKey].includes(needle)) {
    failures.push(`${REQUIRED_FILES[fileKey]}: found forbidden ${JSON.stringify(needle)} — ${reason}`);
  }
}

const visualCommand =
  'playwright test tests/visual/batch14-review-capture.spec.ts tests/visual/batch22-collection-review.spec.ts tests/visual/batch23-result-review.spec.ts tests/visual/batch26-midgame-review.spec.ts tests/visual/batch42-top-rack-review.spec.ts tests/visual/batch44-match-setup-rack-review.spec.ts';
requireText('packageJson', `"test:visual": "${visualCommand}"`, 'default visual QA must include shell/editor/match, collection, Result, midgame, TOP rack and MatchSetup rack evidence');
requireText('packageJson', `"qa:batch14:review-capture": "${visualCommand}"`, 'current-head review command must include Result, midgame, TOP rack and MatchSetup rack evidence');
forbidText('packageJson', '"test:visual:update"', 'current visual review must not encourage refreshing a stale committed baseline');

for (const needle of [
  "{ width: 844, height: 390, label: 'compact' }",
  "{ width: 1440, height: 900, label: 'desktop' }",
  "const SKINS = ['yorunoshirube', 'cute-pop'] as const;",
  'const PLAYER_COUNTS = [3, 4] as const;',
  "const CAPTURE_DIR = 'test-results/batch14-review';",
  'page.screenshot({',
  'document.documentElement.dataset.skin',
  '.toBe(skin)',
  'deck-editor-categories-${skin}-${size.label}',
  'deck-editor-tiles-${skin}-${size.label}',
  'deck-editor-roles-${skin}-${size.label}',
  'deck-editor-bonuses-${skin}-${size.label}',
  'match-action-${skin}-4p-compact',
]) {
  requireText('capture', needle, 'core current-head visual matrix must stay complete');
}
forbidText('capture', 'toHaveScreenshot(', 'current-head review capture must not silently become a committed pixel-baseline gate');

for (const needle of [
  "getByRole('button', { name: /記憶帳/ })",
  "getByRole('heading', { name: '記憶帳' })",
  'collection-${skin}-${size.label}',
  "getByRole('button', { name: 'もどる' })",
]) {
  requireText('collectionCapture', needle, 'Collection must remain a real-route current-head review target');
}
forbidText('collectionCapture', 'toHaveScreenshot(', 'Collection evidence must stay current-head artifact based');

for (const needle of [
  'playRealMatchToResult',
  "getByRole('button', { name: /まず遊ぶ/ })",
  "getByRole('heading', { name: '対局設定' })",
  "getByRole('button', { name: '3人戦をはじめる' })",
  "getByRole('main', { name: '3人戦の対局卓' })",
  "getByRole('heading', { name: '対戦結果' })",
  'result-${skin}-${size.label}',
  'window.setTimeout =',
  "getByRole('button', { name: 'ツモ', exact: true })",
  "getByRole('button', { name: 'ロン', exact: true })",
  "getByRole('button', { name: '捨てる', exact: true })",
]) {
  requireText('resultCapture', needle, 'Result evidence must come from the real match route and real UI actions');
}
for (const forbidden of [
  'state.result =',
  "phase: 'result'",
  'SHOW_RESULT',
  'applyMatchAction(',
]) {
  forbidText('resultCapture', forbidden, 'visual evidence must not inject or synthesize Result state');
}
forbidText('resultCapture', 'toHaveScreenshot(', 'Result evidence must stay current-head artifact based');

for (const needle of [
  "const PLAYER_COUNTS = [3, 4] as const",
  'const TARGET_DISCARDS = 10',
  'playRealMatchToDiscardCount',
  'expect(geometry.outside).toEqual([])',
  'expect(geometry.riversNeedingScroll).toEqual([])',
  'match-midgame-${skin}-${playerCount}p-${size.label}.png',
]) {
  requireText('midgameCapture', needle, 'midgame evidence must stay in the canonical current-head matrix for both player counts and viewports');
}
forbidText('midgameCapture', 'toHaveScreenshot(', 'midgame evidence must stay current-head artifact based');
forbidText('midgameCapture', 'force: true', 'midgame evidence must use real pointer actions');

for (const needle of [
  "const SKINS = ['yorunoshirube', 'cute-pop'] as const;",
  "{ width: 844, height: 390, label: 'compact' }",
  "{ width: 1440, height: 900, label: 'desktop' }",
  'expect(rack?.tileCount).toBe(8);',
  'expect(rack?.visibleBands).toBe(0);',
  'expect(rack?.rowSpread).toBeLessThanOrEqual(1);',
  'expect(rack?.minTileWidth).toBeGreaterThanOrEqual(44);',
]) {
  requireText('topRackCapture', needle, 'TOP starter rack must remain measured current-head evidence for both skins and viewports');
}
forbidText('topRackCapture', 'toHaveScreenshot(', 'TOP rack evidence should measure current geometry without adding stale pixel baselines');

for (const needle of [
  "const PLAYER_COUNTS = [3, 4] as const;",
  "getByRole('heading', { name: '対局設定' })",
  'expect(rack?.tileCount).toBe(8);',
  'expect(rack?.visibleBands).toBe(0);',
  'expect(rack?.rowSpread).toBeLessThanOrEqual(1);',
  'expect(rack?.minTileWidth).toBeGreaterThanOrEqual(34);',
]) {
  requireText('matchSetupRackCapture', needle, 'MatchSetup deck rack must remain tile-led measured evidence for both player counts, skins and viewports');
}
forbidText('matchSetupRackCapture', 'toHaveScreenshot(', 'MatchSetup rack evidence should measure current geometry without stale pixel baselines');

requireText('workflow', 'name: Batch 14 Visual Review', 'artifact review needs a dedicated workflow');
requireText('workflow', "- 'tests/visual/**'", 'every visual-test change must refresh current-head review evidence');
requireText('workflow', 'pnpm qa:batch14:review-capture', 'workflow must run the canonical combined capture command');
requireText('workflow', 'actions/upload-artifact@043fb46d1a93c77aae656e7c1c64a875d1fc6a0a', 'artifact upload must remain pinned');
requireText('workflow', 'path: test-results/batch14-review', 'all current review evidence must share one artifact tree');
requireText('workflow', 'retention-days: 7', 'review artifacts should remain short-lived instead of becoming repository history');
requireText('workflow', 'if: always()', 'partial screenshots should survive a later layout assertion failure');

requireText('roleWorkbenchCss', 'selection-based', 'role editor must remain a selection-led game-building workbench');
requireText('roleWorkbenchCss', 'min-height: 44px;', 'roomy role choices must retain frequent-action touch sizing');
requireText('roleWorkbenchCss', 'transform: none', 'role choices must not regain hover lift');

for (const phrase of [
  'Batch 14 visual/UI review is **COMPLETE**',
  'reviewed PR HEAD',
  'main squash integration',
  'workflow artifact',
  '844x390',
  '1440x900',
  'weakest three',
  'squash-after-current-head-approval policy',
]) {
  requireText('reviewDoc', phrase, 'completed review handoff must preserve evidence and Git hygiene');
}

if (failures.length > 0) {
  console.error('Batch 14 visual review hygiene drift detected:');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log('Batch 14 visual review hygiene: PASS');
console.log(`Checked ${Object.keys(REQUIRED_FILES).length} canonical files.`);
