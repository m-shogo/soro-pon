import { readFile } from 'node:fs/promises';

const REQUIRED_FILES = {
  packageJson: 'package.json',
  capture: 'tests/visual/batch14-review-capture.spec.ts',
  workflow: '.github/workflows/batch14-visual-review.yml',
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

requireText(
  'packageJson',
  '"test:visual": "playwright test tests/visual/batch14-review-capture.spec.ts"',
  'default visual QA must evaluate the current Batch 14 capture suite',
);
requireText(
  'packageJson',
  '"qa:batch14:review-capture": "playwright test tests/visual/batch14-review-capture.spec.ts"',
  'the current-head capture command must remain explicit',
);
forbidText(
  'packageJson',
  '"test:visual:update"',
  'current visual review must not encourage refreshing a stale committed baseline',
);

for (const needle of [
  "{ width: 844, height: 390, label: 'compact' }",
  "{ width: 1440, height: 900, label: 'desktop' }",
  "const SKINS = ['yorunoshirube', 'cute-pop'] as const;",
  'const PLAYER_COUNTS = [3, 4] as const;',
  "const CAPTURE_DIR = 'test-results/batch14-review';",
  'page.screenshot({',
  'smallerThanWcagMinimum',
  'smallFrequentMatchActions',
  'match-action-${skin}-4p-compact',
]) {
  requireText('capture', needle, 'the visual review matrix and usability probes must stay complete');
}
forbidText(
  'capture',
  'toHaveScreenshot(',
  'current-head review capture must not silently become a committed pixel-baseline gate',
);

requireText('workflow', 'name: Batch 14 Visual Review', 'artifact review needs a dedicated workflow');
requireText('workflow', 'pnpm qa:batch14:review-capture', 'workflow must run the canonical capture command');
requireText(
  'workflow',
  'actions/upload-artifact@043fb46d1a93c77aae656e7c1c64a875d1fc6a0a',
  'artifact upload must remain pinned to the reviewed action commit',
);
requireText('workflow', 'path: test-results/batch14-review', 'workflow must upload only current review evidence');
requireText('workflow', 'retention-days: 7', 'review artifacts should remain short-lived instead of becoming repository history');
requireText('workflow', 'if: always()', 'partial screenshots should survive a later layout assertion failure');

for (const phrase of [
  'current PR HEAD',
  'workflow artifact',
  '844x390',
  '1440x900',
  'weakest three',
  'final merge to `main` should use squash',
]) {
  requireText('reviewDoc', phrase, 'the review handoff must preserve the clean evidence and merge policy');
}

if (failures.length > 0) {
  console.error('Batch 14 visual review hygiene drift detected:');
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log('Batch 14 visual review hygiene: PASS');
console.log(`Checked ${Object.keys(REQUIRED_FILES).length} canonical files.`);
