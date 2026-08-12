import { readFile } from 'node:fs/promises';

const REQUIRED_FILES = {
  app: 'src/App.tsx',
  css: 'src/ui/styles/desktop-top-index.css',
  top: 'src/ui/screens/TopScreen.tsx',
  visual: 'tests/visual/batch42-top-rack-review.spec.ts',
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

requireText('app', "import './ui/styles/desktop-top-index.css';", 'Batch 51 desktop screens-layer override must be loaded');

for (const needle of [
  'Batch 51: the wide TOP side column is a game index',
  '@media (min-width: 1000px) and (min-height: 600px)',
  '.sp-top-stage__nav-main {',
  'gap: 0;',
  '.sp-top-stage__nav-main .sp-button {',
  'min-height: 72px;',
  'border-left: 3px solid',
  'border-radius: 0;',
  'background: transparent;',
  'box-shadow: none;',
  '.sp-top-stage__nav-main .sp-button__label',
  'font-size: 20px;',
  '.sp-top-stage__utility {',
  '.sp-top-stage__utility .sp-button {',
  'min-height: 44px;',
]) {
  requireText('css', needle, 'desktop TOP navigation must read as an authored index rail rather than cards/pills');
}

for (const forbidden of ['!important', 'linear-gradient(', 'radial-gradient(', 'backdrop-filter:']) {
  if (files.css.includes(forbidden)) {
    failures.push(`${REQUIRED_FILES.css}: forbidden ${JSON.stringify(forbidden)} in Batch 51 index styling`);
  }
}

for (const needle of [
  '<nav className="sp-top-stage__nav" aria-label="ホームメニュー">',
  'デッキ一覧',
  '記憶帳',
  'JSONを読み込む',
  'きせかえ',
  'データ管理',
]) {
  requireText('top', needle, 'desktop visual re-composition must preserve existing navigation and utility functions');
}

for (const needle of [
  'inspectTopNavigation',
  "secondary: inspectButtonGroup('.sp-top-stage__nav-main')",
  "utility: inspectButtonGroup('.sp-top-stage__utility')",
  'expect(secondaryNav?.minHeight ?? 0).toBeGreaterThanOrEqual(64);',
  'expect(secondaryNav?.maxRadius ?? Number.POSITIVE_INFINITY).toBeLessThanOrEqual(2);',
  'expect(secondaryNav?.allShadowless).toBe(true);',
  'expect(utilityNav?.minHeight ?? 0).toBeGreaterThanOrEqual(40);',
  'expect(utilityNav?.maxRadius ?? Number.POSITIVE_INFINITY).toBeLessThanOrEqual(2);',
  'expect(utilityNav?.allShadowless).toBe(true);',
  'expect(secondaryNav?.minHeight ?? 0).toBeGreaterThanOrEqual(44);',
]) {
  requireText('visual', needle, 'TOP evidence must prove desktop index geometry while retaining compact Batch 50 coverage');
}

requireText(
  'packageJson',
  '"qa:batch51:desktop-top-index-contract": "node scripts/qa/validate-batch51-desktop-top-index-contract.mjs"',
  'Batch 51 contract must be directly runnable',
);
requireText('workflow', 'pnpm qa:batch51:desktop-top-index-contract', 'Batch 51 contract must block CI drift');

if (failures.length > 0) {
  console.error('Batch 51 desktop TOP index contract drift detected:');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log('Batch 51 desktop TOP index contract: PASS');
console.log(`Checked ${Object.keys(REQUIRED_FILES).length} canonical files.`);
