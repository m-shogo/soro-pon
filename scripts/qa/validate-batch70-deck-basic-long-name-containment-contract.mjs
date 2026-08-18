import { readFile } from 'node:fs/promises';

const REQUIRED_FILES = {
  ledger: 'src/ui/components/DeckBasicLedger.tsx',
  css: 'src/ui/styles/deck-basic-ledger.css',
  visual: 'tests/visual/batch70-deck-basic-long-name-containment-review.spec.ts',
  packageJson: 'package.json',
  workflow: '.github/workflows/ci.yml',
  visualWorkflow: '.github/workflows/batch14-visual-review.yml',
};

const files = Object.fromEntries(
  await Promise.all(
    Object.entries(REQUIRED_FILES).map(async ([key, path]) => [key, await readFile(path, 'utf8')]),
  ),
);
const failures = [];
const requireText = (key, needle, reason) => {
  if (!files[key].includes(needle)) {
    failures.push(`${REQUIRED_FILES[key]}: missing ${JSON.stringify(needle)} — ${reason}`);
  }
};
const forbidText = (key, needle, reason) => {
  if (files[key].includes(needle)) {
    failures.push(`${REQUIRED_FILES[key]}: forbidden ${JSON.stringify(needle)} — ${reason}`);
  }
};

for (const needle of [
  'maxLength={80}',
  'onChange={(name) => onChange({ ...deck, name })}',
  '<strong>{deck.name || \'名称未設定\'}</strong>',
  'const previewTiles = deck.tiles.slice(0, 8);',
]) requireText('ledger', needle, 'full input value, real rack and five metrics must remain canonical');

for (const needle of [
  '.sp-deck-basic-ledger__identity-head {',
  'min-width: 0;',
  'overflow: hidden;',
  '.sp-deck-basic-ledger__identity-head > span {',
  'flex: 0 0 auto;',
  'white-space: nowrap;',
  '.sp-deck-basic-ledger__identity-head > strong {',
  'flex: 1 1 auto;',
  'text-overflow: ellipsis;',
  'text-align: end;',
  'grid-template-columns: repeat(5, minmax(0, 1fr));',
]) requireText('css', needle, 'long identity must yield to its reserved label without changing the input value');
for (const forbidden of [
  '!important',
  'linear-gradient(',
  'radial-gradient(',
  'backdrop-filter:',
  "data-skin='cute-pop'",
  "data-skin='yorunoshirube'",
]) forbidText('css', forbidden, 'Batch 70 stays skin-neutral and structural');

for (const needle of [
  "const SKINS = ['yorunoshirube', 'cute-pop'] as const;",
  "id: 'japanese'",
  "id: 'latin'",
  "{ width: 844, height: 390, label: 'compact' }",
  "{ width: 1440, height: 900, label: 'desktop' }",
  'await expect(input).toHaveValue(longName.value);',
  'expect(geometry?.labelFullyVisible).toBe(true);',
  'expect(geometry?.nameActuallyClipped).toBe(true);',
  'expect(geometry?.rackTileCount).toBe(8);',
  'expect(geometry?.metricCellCount).toBe(5);',
  'expect(geometry?.viewportOverflow).toBe(false);',
  'deck-basic-long-name-${skin}-${longName.id}-${size.label}.png',
]) requireText('visual', needle, 'current-head proof must cover long Japanese/Latin identity at both target sizes');

requireText(
  'packageJson',
  '"qa:batch70:deck-basic-long-name-containment-contract": "node scripts/qa/validate-batch70-deck-basic-long-name-containment-contract.mjs"',
  'Batch 70 contract must be directly runnable',
);
requireText('workflow', 'pnpm qa:batch70:deck-basic-long-name-containment-contract', 'Batch 70 contract must block CI drift');
requireText('visualWorkflow', '- name: Verify Batch 70 DeckBasicLedger long-name containment', 'Batch 70 gets a named visual proof step');
requireText(
  'visualWorkflow',
  'pnpm exec playwright test tests/visual/batch70-deck-basic-long-name-containment-review.spec.ts',
  'dedicated long-name proof must run before artifact upload',
);

if (failures.length > 0) {
  console.error('Batch 70 DeckBasicLedger long-name containment contract drift detected:');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}
console.log('Batch 70 DeckBasicLedger long-name containment contract: PASS');
console.log(`Checked ${Object.keys(REQUIRED_FILES).length} canonical files.`);
