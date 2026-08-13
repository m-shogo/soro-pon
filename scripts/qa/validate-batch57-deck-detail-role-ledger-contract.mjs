import { readFile } from 'node:fs/promises';

const REQUIRED_FILES = {
  app: 'src/App.tsx',
  roleCard: 'src/ui/components/RoleCard.tsx',
  deckDetail: 'src/ui/styles/deck-detail-stage.css',
  compactCss: 'src/ui/styles/deck-detail-compact-role-ledger.css',
  visual: 'tests/visual/batch57-deck-detail-role-ledger-review.spec.ts',
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
  "import './ui/styles/deck-detail-compact-role-ledger.css';",
  'Batch 57 compact role ledger override must load after the DeckDetail stage stylesheet',
);

for (const needle of [
  'className={`sp-role-card${state === \'completed\' ? \' sp-role-card--completed\' : \'\'}`}',
  'className="sp-role-card__name"',
  'className="sp-role-card__points"',
  'className="sp-role-card__explanation"',
  '{basePoints}点',
]) {
  requireText('roleCard', needle, 'RoleCard DOM, data, and semantics must remain the existing shared component');
}

for (const needle of [
  '.sp-deck-detail-stage .sp-deck-loadout__role-grid {',
  'grid-template-columns: repeat(2, minmax(0, 1fr));',
  '@media (max-width: 899px), (max-height: 430px)',
  'grid-template-columns: repeat(4, minmax(0, 1fr));',
]) {
  requireText('deckDetail', needle, 'existing DeckDetail desktop two-column and compact four-column ownership must remain available');
}

for (const needle of [
  'Batch 57: compact DeckDetail roles read as one recipe ledger',
  '@media (max-width: 899px), (max-height: 430px)',
  '.sp-deck-detail-stage .sp-deck-loadout__role-grid {',
  'grid-template-columns: repeat(4, minmax(0, 1fr));',
  'gap: 0;',
  'border-radius: 1px;',
  '.sp-deck-detail-stage .sp-deck-loadout__role-grid .sp-role-card {',
  'border-radius: 0;',
  'background: transparent;',
  'box-shadow: none;',
  '.sp-deck-detail-stage .sp-role-card__name {',
  '.sp-deck-detail-stage .sp-role-card__points {',
  '.sp-deck-detail-stage .sp-role-card__explanation {',
  '-webkit-line-clamp: unset;',
]) {
  requireText('compactCss', needle, 'compact roles must render as a shallow four-column recipe ledger without card chrome');
}

for (const forbidden of ['!important', 'linear-gradient(', 'radial-gradient(', 'backdrop-filter:', 'position: fixed']) {
  forbidText('compactCss', forbidden, 'Batch 57 must not introduce specificity hacks, decorative gradients/glass, or floating UI');
}

for (const needle of [
  "const SKINS = ['yorunoshirube', 'cute-pop'] as const;",
  "{ width: 844, height: 390, label: 'compact' }",
  "{ width: 1440, height: 900, label: 'desktop' }",
  "expect(geometry?.roleCount).toBe(4);",
  "expect(geometry?.allContentVisible).toBe(true);",
  "expect(geometry?.gridNeedsScroll).toBe(false);",
  "expect(geometry?.roleOverflow).toEqual([]);",
  "expect(geometry?.sectionWithinViewport).toBe(true);",
  "expect(geometry?.columnCount).toBe(4);",
  'toBeLessThanOrEqual(1);',
  "expect(geometry?.allShadowless).toBe(true);",
  "expect(geometry?.columnCount).toBe(2);",
  'deck-detail-role-ledger-${skin}-${size.label}.png',
]) {
  requireText('visual', needle, 'Batch 57 evidence must prove both skins, compact ledger geometry, and preserved desktop two-column layout');
}

requireText(
  'visualWorkflow',
  'pnpm qa:batch14:review-capture',
  'the canonical review capture must remain intact',
);
requireText(
  'visualWorkflow',
  'pnpm exec playwright test tests/visual/batch57-deck-detail-role-ledger-review.spec.ts',
  'Batch 57 geometry proof must run in the canonical Visual Review workflow without mutating the Batch 14 command contract',
);
requireText(
  'packageJson',
  '"qa:batch57:deck-detail-role-ledger-contract": "node scripts/qa/validate-batch57-deck-detail-role-ledger-contract.mjs"',
  'Batch 57 contract must be runnable',
);
requireText(
  'workflow',
  'pnpm qa:batch57:deck-detail-role-ledger-contract',
  'Batch 57 contract must block CI drift',
);

if (failures.length > 0) {
  console.error('Batch 57 DeckDetail role ledger contract drift detected:');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log('Batch 57 DeckDetail role ledger contract: PASS');
console.log(`Checked ${Object.keys(REQUIRED_FILES).length} canonical files.`);
