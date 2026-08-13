import { readFile } from 'node:fs/promises';

const REQUIRED_FILES = {
  app: 'src/App.tsx',
  deckDetailScreen: 'src/ui/screens/DeckDetailScreen.tsx',
  compactCss: 'src/ui/styles/deck-detail-compact-command-rail.css',
  desktopCss: 'src/ui/styles/deck-detail-desktop-command-ledger.css',
  visual: 'tests/visual/batch61-deck-detail-desktop-command-ledger-review.spec.ts',
  visualWorkflow: '.github/workflows/batch14-visual-review.yml',
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

requireText('app', "import './ui/styles/deck-detail-desktop-command-ledger.css';", 'Batch 61 desktop command override must be loaded');

for (const needle of [
  'className="sp-deck-detail-stage__utility" aria-label="その他のデッキ操作"',
  '<Button variant="ghost" onClick={onExport}>',
  '書き出す',
  '<Button variant="ghost" onClick={() => setDeleteConfirmOpen(true)}>',
  '削除',
  '<Button variant="ghost" onClick={onBack}>',
  'もどる',
]) requireText('deckDetailScreen', needle, 'utility handlers, labels, and shared Button semantics must remain unchanged');

for (const needle of [
  'Batch 58: compact DeckDetail utility actions read as one command rail',
  '@media (max-width: 899px), (max-height: 430px)',
  'grid-template-columns: repeat(3, minmax(0, 1fr));',
  'gap: 0;',
  'border-radius: 0;',
  'background: transparent;',
  'box-shadow: none;',
]) requireText('compactCss', needle, 'Batch 58 compact command rail must remain intact');

for (const needle of [
  'Batch 61: desktop DeckDetail utility actions read as one command ledger',
  '@media (min-width: 900px) and (min-height: 431px)',
  '.sp-deck-detail-stage__utility {',
  'grid-template-columns: repeat(3, minmax(0, 1fr));',
  'gap: 0;',
  '.sp-deck-detail-stage__utility .sp-button {',
  'min-height: 36px;',
  'border-radius: 0;',
  'background: transparent;',
  'box-shadow: none;',
  'filter: none;',
]) requireText('desktopCss', needle, 'desktop utility actions must read as one flat command ledger');

for (const forbidden of ['!important', 'linear-gradient(', 'radial-gradient(', 'backdrop-filter:', 'position: fixed']) {
  forbidText('desktopCss', forbidden, 'Batch 61 must not add specificity hacks, decorative gradients/glass, or floating UI');
}

for (const needle of [
  "const SKINS = ['yorunoshirube', 'cute-pop'] as const;",
  "{ width: 844, height: 390, label: 'compact' }",
  "{ width: 1440, height: 900, label: 'desktop' }",
  "expect(geometry?.buttonCount).toBe(3);",
  "expect(geometry?.labels).toEqual(['書き出す', '削除', 'もどる']);",
  "expect(geometry?.columnCount).toBe(3);",
  "expect(geometry?.ledgerNeedsScroll).toBe(false);",
  "expect(geometry?.buttonOverflow).toEqual([]);",
  'toBeLessThanOrEqual(1);',
  "expect(geometry?.allShadowless).toBe(true);",
  "expect(geometry?.allTransparent).toBe(true);",
  'toBeGreaterThanOrEqual(36);',
  'toBeGreaterThanOrEqual(30);',
  'deck-detail-command-ledger-${skin}-${size.label}.png',
]) requireText('visual', needle, 'Batch 61 evidence must prove both skins and both viewport command-ledger geometry');

requireText('visualWorkflow', 'pnpm qa:batch14:review-capture', 'canonical Batch 14 review capture must remain unchanged');
requireText('visualWorkflow', 'pnpm exec playwright test tests/visual/batch61-deck-detail-desktop-command-ledger-review.spec.ts', 'Batch 61 visual geometry must run in Visual Review');
requireText('packageJson', '"qa:batch61:deck-detail-desktop-command-ledger-contract": "node scripts/qa/validate-batch61-deck-detail-desktop-command-ledger-contract.mjs"', 'Batch 61 contract must be runnable');
requireText('workflow', 'pnpm qa:batch61:deck-detail-desktop-command-ledger-contract', 'Batch 61 contract must block CI drift');

if (failures.length > 0) {
  console.error('Batch 61 DeckDetail desktop command ledger contract drift detected:');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}
console.log('Batch 61 DeckDetail desktop command ledger contract: PASS');
console.log(`Checked ${Object.keys(REQUIRED_FILES).length} canonical files.`);
