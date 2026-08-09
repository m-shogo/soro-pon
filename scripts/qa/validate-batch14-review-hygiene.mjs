import { readFile } from 'node:fs/promises';

const REQUIRED_FILES = {
  packageJson: 'package.json',
  capture: 'tests/visual/batch14-review-capture.spec.ts',
  collectionCapture: 'tests/visual/batch22-collection-review.spec.ts',
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
  'playwright test tests/visual/batch14-review-capture.spec.ts tests/visual/batch22-collection-review.spec.ts';
requireText('packageJson', `"test:visual": "${visualCommand}"`, 'default visual QA must include shell/match/editor and collection evidence');
requireText('packageJson', `"qa:batch14:review-capture": "${visualCommand}"`, 'current-head capture command must include collection evidence');
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
  "const SKINS = ['yorunoshirube', 'cute-pop'] as const;",
  "{ width: 844, height: 390, label: 'compact' }",
  "{ width: 1440, height: 900, label: 'desktop' }",
  "getByRole('button', { name: /記憶帳/ })",
  "getByRole('heading', { name: '記憶帳' })",
  'collection-${skin}-${size.label}',
  "getByRole('button', { name: 'もどる' })",
  "document.documentElement.dataset.skin",
  "summary'",
]) {
  requireText('collectionCapture', needle, 'collection must remain a real-route, both-skin current-head review target');
}
forbidText('collectionCapture', 'toHaveScreenshot(', 'collection evidence must stay current-head artifact based');

requireText('workflow', 'name: Batch 14 Visual Review', 'artifact review needs a dedicated workflow');
requireText('workflow', "- 'tests/visual/**'", 'every visual-test change must refresh current-head review evidence');
requireText('workflow', 'pnpm qa:batch14:review-capture', 'workflow must run the canonical combined capture command');
requireText('workflow', 'actions/upload-artifact@043fb46d1a93c77aae656e7c1c64a875d1fc6a0a', 'artifact upload must remain pinned');
requireText('workflow', 'path: test-results/batch14-review', 'all current review evidence must share one artifact tree');
requireText('workflow', 'retention-days: 7', 'review artifacts should remain short-lived instead of becoming repository history');
requireText('workflow', 'if: always()', 'partial screenshots should survive a later layout assertion failure');

requireText('roleWorkbenchCss', 'selection-based', 'role editor must remain a selection-led game-building workbench');
requireText('roleWorkbenchCss', 'min-height: 44px;', 'roomy role choices must retain frequent-action touch sizing');
requireText('roleWorkbenchCss', 'grid-template-columns: repeat(2, minmax(0, 1fr));', 'compact role presets must remain readable');
requireText('roleWorkbenchCss', 'transform: none', 'role choices must not regain hover lift');
forbidText('roleWorkbenchCss', 'linear-gradient(', 'role workbench must not use decorative gradients');
forbidText('roleWorkbenchCss', 'radial-gradient(', 'role workbench must not use decorative gradients');

for (const phrase of [
  'Batch 14 visual/UI review is **COMPLETE**',
  'reviewed PR HEAD',
  'main squash integration',
  'workflow artifact',
  '844x390',
  '1440x900',
  'deck editor tile workspace',
  'deck editor role composer',
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
