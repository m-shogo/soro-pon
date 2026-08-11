import { readFile } from 'node:fs/promises';

const REQUIRED_FILES = {
  screen: 'src/ui/screens/DeckDetailScreen.tsx',
  css: 'src/ui/styles/deck-detail-stage.css',
  visual: 'tests/visual/batch14-review-capture.spec.ts',
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
  if (files[fileKey].includes(needle)) failures.push(`${REQUIRED_FILES[fileKey]}: found forbidden ${JSON.stringify(needle)} — ${reason}`);
}

for (const needle of [
  'onClick={onStartSetup}',
  'disabled={!canPlay}',
  'onClick={onEdit}',
  'onClick={onExport}',
  'onClick={() => setDeleteConfirmOpen(true)}',
  'onClick={onBack}',
  'className="sp-deck-detail-stage__validation" open={!canPlay}',
  'ValidationIssueList issues={validation.issues}',
  'title="デッキを削除"',
  'onDelete();',
]) {
  requireText('screen', needle, 'Batch 39 must preserve play, edit, validation and destructive-action semantics');
}

for (const needle of [
  '@media (max-width: 899px), (max-height: 430px)',
  'grid-template-columns: minmax(0, 1fr);',
  'grid-template-rows: minmax(0, 1fr) auto;',
  '.sp-deck-detail-stage__side {',
  'grid-template-columns: minmax(0, 1fr) auto;',
  'border-top: 1px solid color-mix(in srgb, var(--sp-color-cream) 8%, transparent);',
  'grid-template-columns: repeat(4, minmax(0, 1fr));',
  '--tile-w: 40px;',
  'grid-template-columns: repeat(auto-fit, minmax(44px, 1fr));',
  '.sp-deck-detail-stage__categories {\n      display: none;',
  'grid-template-columns: repeat(3, minmax(64px, 1fr));',
  'min-height: 30px;',
]) {
  requireText('css', needle, 'compact deck detail must use the bottom status rail and preserve readable game-object density');
}
for (const forbidden of ['radial-gradient(', 'linear-gradient(', 'backdrop-filter:', 'position: fixed', '!important', 'translateY(']) {
  forbidText('css', forbidden, 'compact rail must remain flat authored game UI without forceful layout escapes');
}

for (const needle of [
  'deck-detail-${skin}-${size.label}',
  "{ width: 844, height: 390, label: 'compact' }",
  "{ width: 1440, height: 900, label: 'desktop' }",
  "getByRole('button', { name: 'デッキを編集' })",
]) {
  requireText('visual', needle, 'canonical deck detail evidence must cover both skins and both target viewports');
}

requireText('packageJson', '"qa:batch39:deck-detail-compact-rail-contract": "node scripts/qa/validate-batch39-deck-detail-compact-rail-contract.mjs"', 'Batch 39 contract must be runnable directly');
requireText('workflow', 'pnpm qa:batch39:deck-detail-compact-rail-contract', 'Batch 39 contract must block CI drift');

if (failures.length > 0) {
  console.error('Batch 39 compact deck detail rail contract drift detected:');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log('Batch 39 compact deck detail rail contract: PASS');
console.log(`Checked ${Object.keys(REQUIRED_FILES).length} canonical files.`);
