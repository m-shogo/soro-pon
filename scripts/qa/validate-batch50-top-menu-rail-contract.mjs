import { readFile } from 'node:fs/promises';

const REQUIRED_FILES = {
  app: 'src/App.tsx',
  css: 'src/ui/styles/top-menu-rail.css',
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

requireText('app', "import './ui/styles/top-menu-rail.css';", 'Batch 50 screens-layer override must be loaded');

for (const needle of [
  'Batch 50: compact TOP secondary navigation should read as a game menu rail',
  '.sp-top-stage__nav-main {',
  'gap: 0;',
  '.sp-top-stage__nav-main .sp-button {',
  'min-height: 48px;',
  'border-left: 2px solid',
  'border-radius: 0;',
  'background: transparent;',
  'box-shadow: none;',
  '.sp-top-stage__nav-main .sp-button__label',
  'font-size: 12px;',
  '.sp-top-stage__nav-main .sp-button__sub',
  'font-size: 8px;',
]) {
  requireText('css', needle, 'compact secondary navigation must retain touch area while shedding card chrome');
}

for (const forbidden of ['!important', 'linear-gradient(', 'radial-gradient(', 'backdrop-filter:']) {
  if (files.css.includes(forbidden)) {
    failures.push(`${REQUIRED_FILES.css}: forbidden ${JSON.stringify(forbidden)} in Batch 50 rail styling`);
  }
}

for (const needle of [
  '<nav className="sp-top-stage__nav" aria-label="ホームメニュー">',
  '<div className="sp-top-stage__nav-main">',
  'subLabel="保存したデッキを選ぶ・編集"',
  'デッキ一覧',
  '記憶帳',
  'onClick={onDeckList}',
  'onClick={onCollection}',
]) {
  requireText('top', needle, 'existing navigation semantics and destinations must remain unchanged');
}

for (const needle of [
  'inspectTopNavigation',
  "secondary: inspectButtonGroup('.sp-top-stage__nav-main')",
  'minHeight',
  'maxRadius',
  'allShadowless',
  'allWithinGroup',
  'groupNeedsScroll',
  'expect(secondaryNav?.count).toBe(2);',
  'expect(secondaryNav?.groupNeedsScroll).toBe(false);',
  'expect(secondaryNav?.allWithinGroup).toBe(true);',
  'expect(secondaryNav?.minHeight ?? 0).toBeGreaterThanOrEqual(44);',
  'expect(secondaryNav?.maxRadius ?? Number.POSITIVE_INFINITY).toBeLessThanOrEqual(2);',
  'expect(secondaryNav?.allShadowless).toBe(true);',
  'expect(secondaryNav?.minHeight ?? 0).toBeGreaterThanOrEqual(64);',
]) {
  requireText('visual', needle, 'TOP evidence must preserve Batch 50 compact rail geometry while allowing the stronger Batch 51 desktop bound');
}

requireText(
  'packageJson',
  '"qa:batch50:top-menu-rail-contract": "node scripts/qa/validate-batch50-top-menu-rail-contract.mjs"',
  'Batch 50 contract must be directly runnable',
);
requireText('workflow', 'pnpm qa:batch50:top-menu-rail-contract', 'Batch 50 contract must block CI drift');

if (failures.length > 0) {
  console.error('Batch 50 TOP menu rail contract drift detected:');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log('Batch 50 TOP menu rail contract: PASS');
console.log(`Checked ${Object.keys(REQUIRED_FILES).length} canonical files.`);
