import { readFile } from 'node:fs/promises';

const REQUIRED_FILES = {
  app: 'src/App.tsx',
  screen: 'src/ui/screens/DeckDetailScreen.tsx',
  deckDetail: 'src/ui/styles/deck-detail-stage.css',
  compactCss: 'src/ui/styles/deck-detail-compact-command-rail.css',
  roleCss: 'src/ui/styles/deck-detail-compact-role-ledger.css',
  visual: 'tests/visual/batch58-deck-detail-command-rail-review.spec.ts',
  visualWorkflow: '.github/workflows/batch14-visual-review.yml',
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

function forbidText(fileKey, needle, reason) {
  if (files[fileKey].includes(needle)) {
    failures.push(`${REQUIRED_FILES[fileKey]}: forbidden ${JSON.stringify(needle)} — ${reason}`);
  }
}

requireText(
  'app',
  "import './ui/styles/deck-detail-compact-command-rail.css';",
  'Batch 58 compact command rail override must be loaded after DeckDetail styles',
);

for (const needle of [
  'className="sp-deck-detail-stage__utility"',
  '>書き出す<',
  '>削除<',
  '>もどる<',
  'onClick={onExport}',
  'onClick={() => setDeleteConfirmOpen(true)}',
  'onClick={onBack}',
]) {
  requireText('screen', needle, 'DeckDetail utility labels, handlers, and shared Button DOM must remain unchanged');
}

for (const needle of [
  '.sp-deck-detail-stage__utility {',
  'grid-template-columns: repeat(3, minmax(0, 1fr));',
  'gap: 4px;',
  '.sp-deck-detail-stage__utility .sp-button {',
  'border-radius: 4px;',
]) {
  requireText('deckDetail', needle, 'desktop DeckDetail utility composition must remain the existing detached three-button layout');
}

for (const needle of [
  'Batch 58: compact DeckDetail utility actions read as one command rail',
  '@media (max-width: 899px), (max-height: 430px)',
  '.sp-deck-detail-stage__utility {',
  'grid-template-columns: repeat(3, minmax(0, 1fr));',
  'gap: 0;',
  'overflow: hidden;',
  '.sp-deck-detail-stage__utility .sp-button {',
  'min-height: 32px;',
  'border-radius: 0;',
  'background: transparent;',
  'box-shadow: none;',
]) {
  requireText('compactCss', needle, 'compact utility must remain one shallow three-command rail without web-button chrome');
}

for (const forbidden of ['!important', 'linear-gradient(', 'radial-gradient(', 'backdrop-filter:', 'position: fixed']) {
  forbidText('compactCss', forbidden, 'Batch 58 must not introduce specificity hacks, decorative gradients/glass, or floating UI');
}

requireText(
  'roleCss',
  'Batch 57: compact DeckDetail roles read as one recipe ledger',
  'Batch 57 role ledger must remain independently loaded and intact',
);

for (const needle of [
  "const SKINS = ['yorunoshirube', 'cute-pop'] as const;",
  "{ width: 844, height: 390, label: 'compact' }",
  "{ width: 1440, height: 900, label: 'desktop' }",
  "expect(geometry?.buttonCount).toBe(3);",
  "expect(geometry?.labels).toEqual(['書き出す', '削除', 'もどる']);",
  "expect(geometry?.railNeedsScroll).toBe(false);",
  "expect(geometry?.allButtonsWithinRail).toBe(true);",
  "expect(geometry?.roleWithinViewport).toBe(true);",
  "expect(geometry?.gap).toBe(0);",
  'toBeGreaterThanOrEqual(32);',
  'toBeLessThanOrEqual(1);',
  "expect(geometry?.allShadowless).toBe(true);",
  'deck-detail-command-rail-${skin}-${size.label}.png',
]) {
  requireText('visual', needle, 'Batch 58 evidence must cover both skins, compact command geometry, and surrounding DeckDetail non-regression');
}

requireText('visualWorkflow', 'pnpm qa:batch14:review-capture', 'canonical Batch 14 capture command must remain intact');
requireText(
  'visualWorkflow',
  'pnpm exec playwright test tests/visual/batch57-deck-detail-role-ledger-review.spec.ts',
  'Batch 57 exact geometry proof must remain in Visual Review',
);
requireText(
  'visualWorkflow',
  'pnpm exec playwright test tests/visual/batch58-deck-detail-command-rail-review.spec.ts',
  'Batch 58 geometry proof must run as an additional Visual Review step',
);
requireText(
  'packageJson',
  '"qa:batch58:deck-detail-command-rail-contract": "node scripts/qa/validate-batch58-deck-detail-command-rail-contract.mjs"',
  'Batch 58 contract must be runnable',
);
requireText(
  'workflow',
  'pnpm qa:batch58:deck-detail-command-rail-contract',
  'Batch 58 contract must block CI drift',
);

if (failures.length > 0) {
  console.error('Batch 58 DeckDetail command rail contract drift detected:');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log('Batch 58 DeckDetail command rail contract: PASS');
console.log(`Checked ${Object.keys(REQUIRED_FILES).length} canonical files.`);
