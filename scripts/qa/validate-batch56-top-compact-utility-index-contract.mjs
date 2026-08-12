import { readFile } from 'node:fs/promises';

const REQUIRED_FILES = {
  app: 'src/App.tsx',
  top: 'src/ui/screens/TopScreen.tsx',
  compactCss: 'src/ui/styles/top-compact-utility-index.css',
  desktopCss: 'src/ui/styles/desktop-top-index.css',
  visual: 'tests/visual/batch42-top-rack-review.spec.ts',
  packageJson: 'package.json',
  workflow: '.github/workflows/ci.yml',
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

requireText('app', "import './ui/styles/top-compact-utility-index.css';", 'Batch 56 compact utility override must be loaded after TOP index ownership');

for (const needle of [
  '<div className="sp-top-stage__utility" aria-label="その他の操作">',
  'JSONを読み込む',
  'きせかえ',
  'データ管理',
  'onClick={onImport}',
  'onClick={() => setSkinModalOpen(true)}',
  'onClick={() => setDataModalOpen(true)}',
]) requireText('top', needle, 'all three utility destinations and handlers must remain unchanged');

for (const needle of [
  'Batch 56: compact TOP utility commands belong to the same authored index',
  '@layer screens',
  '@media (max-width: 899px), (max-height: 430px)',
  '.sp-top-stage__utility {',
  'gap: 0;',
  'padding-top: 0;',
  'border-top: 1px solid',
  'border-bottom: 1px solid',
  '.sp-top-stage__utility .sp-button {',
  'min-height: 44px;',
  'border-radius: 0;',
  'background: transparent;',
  'box-shadow: none;',
  '.sp-top-stage__utility .sp-button:last-child {',
  'border-right: 0;',
  '.sp-top-stage__utility .sp-button > .sp-skin-layer {',
  'display: none;',
]) requireText('compactCss', needle, 'compact utility must be one shallow three-command index rail without pill chrome');

for (const forbidden of ['!important', 'linear-gradient(', 'radial-gradient(', 'backdrop-filter:', 'position: fixed']) {
  forbidText('compactCss', forbidden, 'Batch 56 must not introduce specificity hacks, decorative gradients/glass, or floating UI');
}

for (const needle of [
  '@media (min-width: 1000px) and (min-height: 600px)',
  '.sp-top-stage__utility .sp-button {',
  'min-height: 44px;',
]) requireText('desktopCss', needle, 'desktop Batch 51 utility ownership must remain intact');

for (const needle of [
  "utility: inspectButtonGroup('.sp-top-stage__utility')",
  'columnGap',
  'rowSpread',
  'expect(utilityNav?.count).toBe(3);',
  'expect(utilityNav?.groupNeedsScroll).toBe(false);',
  'expect(utilityNav?.allWithinGroup).toBe(true);',
  'expect(utilityNav?.minHeight ?? 0).toBeGreaterThanOrEqual(44);',
  'expect(utilityNav?.maxRadius ?? Number.POSITIVE_INFINITY).toBeLessThanOrEqual(1);',
  'expect(utilityNav?.allShadowless).toBe(true);',
  'expect(utilityNav?.columnGap ?? Number.POSITIVE_INFINITY).toBeLessThanOrEqual(0.5);',
  'expect(utilityNav?.rowSpread ?? Number.POSITIVE_INFINITY).toBeLessThanOrEqual(1);',
  'expect(utilityNav?.minHeight ?? 0).toBeGreaterThanOrEqual(40);',
]) requireText('visual', needle, 'canonical TOP evidence must prove compact utility rail geometry and preserve desktop coverage');

requireText('packageJson', '"qa:batch56:top-compact-utility-index-contract": "node scripts/qa/validate-batch56-top-compact-utility-index-contract.mjs"', 'Batch 56 contract must be runnable');
requireText('workflow', 'pnpm qa:batch56:top-compact-utility-index-contract', 'Batch 56 contract must block CI drift');

if (failures.length > 0) {
  console.error('Batch 56 TOP compact utility index contract drift detected:');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log('Batch 56 TOP compact utility index contract: PASS');
console.log(`Checked ${Object.keys(REQUIRED_FILES).length} canonical files.`);
