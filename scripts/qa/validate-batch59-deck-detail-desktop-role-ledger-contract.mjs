import { readFile } from 'node:fs/promises';

const REQUIRED_FILES = {
  app: 'src/App.tsx',
  roleCard: 'src/ui/components/RoleCard.tsx',
  deckDetail: 'src/ui/styles/deck-detail-stage.css',
  compactCss: 'src/ui/styles/deck-detail-compact-role-ledger.css',
  desktopCss: 'src/ui/styles/deck-detail-desktop-role-ledger.css',
  visual: 'tests/visual/batch59-deck-detail-desktop-role-ledger-review.spec.ts',
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

requireText('app', "import './ui/styles/deck-detail-desktop-role-ledger.css';", 'Batch 59 desktop role ledger must be loaded after DeckDetail role styles');

for (const needle of [
  'className={`sp-role-card${state === \'completed\' ? \' sp-role-card--completed\' : \'\'}`}',
  'className="sp-role-card__name"',
  'className="sp-role-card__points"',
  'className="sp-role-card__explanation"',
  '{basePoints}点',
]) requireText('roleCard', needle, 'shared RoleCard DOM/data/semantics must remain unchanged');

for (const needle of [
  '.sp-deck-detail-stage .sp-deck-loadout__role-grid {',
  'grid-template-columns: repeat(2, minmax(0, 1fr));',
]) requireText('deckDetail', needle, 'base desktop two-column role ownership must remain available');

requireText('compactCss', 'Batch 57: compact DeckDetail roles read as one recipe ledger', 'compact Batch 57 ledger must remain independently intact');

for (const needle of [
  'Batch 59: desktop DeckDetail roles read as one two-column recipe ledger',
  '@media (min-width: 900px) and (min-height: 431px)',
  'grid-template-columns: repeat(2, minmax(0, 1fr));',
  'gap: 0;',
  '.sp-deck-detail-stage .sp-deck-loadout__role-grid .sp-role-card {',
  'border-radius: 0;',
  'background: transparent;',
  'box-shadow: none;',
  '.sp-deck-detail-stage .sp-role-card__name {',
  '.sp-deck-detail-stage .sp-role-card__points {',
  '.sp-deck-detail-stage .sp-role-card__explanation {',
]) requireText('desktopCss', needle, 'desktop roles must read as a connected two-column ledger without detached card chrome');

for (const forbidden of ['!important', 'linear-gradient(', 'radial-gradient(', 'backdrop-filter:', 'position: fixed']) {
  forbidText('desktopCss', forbidden, 'Batch 59 must not introduce specificity hacks, decorative gradients/glass, or floating UI');
}

for (const needle of [
  "const SKINS = ['yorunoshirube', 'cute-pop'] as const;",
  "{ width: 844, height: 390, label: 'compact' }",
  "{ width: 1440, height: 900, label: 'desktop' }",
  'expect(geometry?.roleCount).toBe(4);',
  'expect(geometry?.roleOverflow).toBe(0);',
  'expect(geometry?.allContentVisible).toBe(true);',
  'expect(geometry?.allTransparent).toBe(true);',
  'expect(geometry?.columnCount).toBe(4);',
  'expect(geometry?.columnCount).toBe(2);',
  'expect(geometry?.gap).toBe(0);',
  'deck-detail-desktop-role-ledger-${skin}-${size.label}.png',
]) requireText('visual', needle, 'Batch 59 evidence must prove desktop ledger and compact Batch 57 non-regression');

requireText('visualWorkflow', 'pnpm qa:batch14:review-capture', 'canonical Batch 14 capture must remain intact');
requireText('visualWorkflow', 'pnpm exec playwright test tests/visual/batch58-deck-detail-command-rail-review.spec.ts', 'Batch 58 proof must remain connected');
requireText('visualWorkflow', 'pnpm exec playwright test tests/visual/batch59-deck-detail-desktop-role-ledger-review.spec.ts', 'Batch 59 proof must run as an additional Visual Review step');
requireText('packageJson', '"qa:batch59:deck-detail-desktop-role-ledger-contract": "node scripts/qa/validate-batch59-deck-detail-desktop-role-ledger-contract.mjs"', 'Batch 59 contract must be runnable');
requireText('workflow', 'pnpm qa:batch59:deck-detail-desktop-role-ledger-contract', 'Batch 59 contract must block CI drift');

if (failures.length > 0) {
  console.error('Batch 59 DeckDetail desktop role ledger contract drift detected:');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}
console.log('Batch 59 DeckDetail desktop role ledger contract: PASS');
console.log(`Checked ${Object.keys(REQUIRED_FILES).length} canonical files.`);
