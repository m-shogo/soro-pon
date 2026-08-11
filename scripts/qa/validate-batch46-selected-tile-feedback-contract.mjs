import { readFile } from 'node:fs/promises';

const REQUIRED_FILES = {
  screenCss: 'src/ui/styles/screens.css',
  motionCss: 'src/ui/styles/motion.css',
  components: 'src/ui/components/components.css',
  capture: 'tests/visual/batch14-review-capture.spec.ts',
  packageJson: 'package.json',
  workflow: '.github/workflows/ci.yml',
};

const files = Object.fromEntries(
  await Promise.all(Object.entries(REQUIRED_FILES).map(async ([key, path]) => [key, await readFile(path, 'utf8')])),
);
const failures = [];

function requireText(fileKey, needle, reason) {
  if (!files[fileKey].includes(needle)) {
    failures.push(`${REQUIRED_FILES[fileKey]}: missing ${JSON.stringify(needle)} — ${reason}`);
  }
}

for (const needle of [
  'Batch 46: selected discard intent must read immediately',
  '.sp-match-screen .sp-self-hand-zone .sp-tile--selected {',
  'transform: translateY(-4px);',
  'z-index: 4;',
  'outline: 3px solid',
  'outline-offset: -1px;',
  'var(--sp-shadow-tile-raised)',
]) {
  requireText('screenCss', needle, 'MatchScreen selection needs a restrained lift plus strong visual state');
}

for (const needle of [
  'Batch 46: direct user intent outranks the transient arrival motion',
  '.sp-match-screen .sp-self-hand-zone .sp-tile--drawn.sp-tile--selected {',
  'animation: none;',
]) {
  requireText('motionCss', needle, 'selected state must immediately override a just-drawn tile animation');
}

for (const needle of [
  '.sp-tile--selected {',
  'transform: translateY(calc(var(--tile-h, 64px) * -0.18));',
]) {
  requireText('components', needle, 'generic TileCard selected behavior must remain unchanged outside the match screen');
}

for (const needle of [
  'async function expectSelectedTileFeedback(page: Page)',
  'expect(geometry?.lift ?? 0).toBeGreaterThanOrEqual(3);',
  'toBeLessThanOrEqual(6);',
  'expect(geometry?.outlineWidth ?? 0).toBeGreaterThanOrEqual(2.5);',
  "expect(geometry?.boxShadow).not.toBe('none');",
  'expect(geometry?.coachOverlapArea).toBe(0);',
  "getByRole('button', { name: '捨てる', exact: true })).toBeEnabled();",
]) {
  requireText('capture', needle, 'compact 4p real action capture must prove clear selection without coach collision');
}

requireText(
  'packageJson',
  '"qa:batch46:selected-tile-feedback-contract": "node scripts/qa/validate-batch46-selected-tile-feedback-contract.mjs"',
  'Batch 46 contract must be directly runnable',
);
requireText('workflow', 'pnpm qa:batch46:selected-tile-feedback-contract', 'Batch 46 contract must block CI drift');

if (failures.length > 0) {
  console.error('Batch 46 selected tile feedback contract drift detected:');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log('Batch 46 selected tile feedback contract: PASS');
console.log(`Checked ${Object.keys(REQUIRED_FILES).length} canonical files.`);
