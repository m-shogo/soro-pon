import { readFile } from 'node:fs/promises';

const REQUIRED_FILES = {
  app: 'src/App.tsx',
  screen: 'src/ui/screens/CollectionScreen.tsx',
  authoredCss: 'src/ui/styles/collection-authored.css',
  stageCss: 'src/ui/styles/collection-ledger-stage.css',
  visual: 'tests/visual/batch22-collection-review.spec.ts',
  packageJson: 'package.json',
};

const files = Object.fromEntries(
  await Promise.all(
    Object.entries(REQUIRED_FILES).map(async ([key, path]) => [key, await readFile(path, 'utf8')]),
  ),
);
const failures = [];

function requireText(fileKey, needle, reason) {
  if (!files[fileKey].includes(needle)) failures.push(`${REQUIRED_FILES[fileKey]}: missing ${JSON.stringify(needle)} — ${reason}`);
}
function forbidText(fileKey, needle, reason) {
  if (files[fileKey].includes(needle)) failures.push(`${REQUIRED_FILES[fileKey]}: found forbidden ${JSON.stringify(needle)} — ${reason}`);
}

requireText('app', "import './ui/styles/collection-ledger-stage.css';", 'collection ledger stage must stay loaded');
requireText('screen', 'className="sp-screen sp-collection-screen"', 'collection must keep its authored screen hook');
requireText('screen', 'title="高得点 Top 10"', 'match records must stay first in the main ledger');
requireText('screen', 'title="クリアボード"', 'achievement history must remain available after match records');
requireText('screen', 'title={`あがった役 ${collectedRoles.length}`}', 'role collection must remain available');
requireText('screen', 'title="最近の記録"', 'recent match chronology must remain in the DOM');

requireText('authoredCss', 'game ledger, not a KPI dashboard', 'anti-dashboard thesis must remain explicit');
requireText('stageCss', 'match ledger, not a dashboard', 'Batch22 stage thesis must remain explicit');
requireText('stageCss', 'width: min(1180px, 100%);', 'desktop collection should read as a centered ledger stage');
requireText('stageCss', 'width: min(260px, 28%);', 'desktop recent chronology must remain a quiet side rail');
for (const needle of [
  '@layer screens',
  'grid-template-columns: minmax(0, 1fr);',
  'grid-template-rows: minmax(0, 1fr) auto;',
  '.sp-collection-screen__recent {',
  'width: 100%;',
  'max-height: 58px;',
  'border-left: 0;',
  'grid-template-columns: auto minmax(0, 1fr);',
  'display: flex;',
  'overflow: hidden auto;',
]) {
  requireText('stageCss', needle, 'compact collection must promote the main ledger to full width and move chronology below it');
}
forbidText('stageCss', 'width: min(190px, 24%);', 'the obsolete compact right chronology rail must not return');
forbidText('stageCss', 'linear-gradient(', 'collection ledger must not use decorative gradients');
forbidText('stageCss', 'radial-gradient(', 'collection ledger must not use decorative gradients');
forbidText('stageCss', 'backdrop-filter:', 'collection ledger must not add glass blur');

for (const needle of [
  "getByRole('button', { name: /記憶帳/ })",
  "getByRole('heading', { name: '記憶帳' })",
  'collection-${skin}-${size.label}',
  "const SKINS = ['yorunoshirube', 'cute-pop'] as const;",
  "{ width: 844, height: 390, label: 'compact' }",
  "{ width: 1440, height: 900, label: 'desktop' }",
  'async function expectCompactCollectionGeometry',
  'toBeGreaterThanOrEqual(0.95)',
  'toBeLessThanOrEqual(64)',
  'recentBelowMain',
]) {
  requireText('visual', needle, 'collection must stay in both-skin evidence and compact chronology geometry must be measured');
}
requireText('packageJson', 'tests/visual/batch22-collection-review.spec.ts', 'canonical visual command must include the collection review');

if (failures.length > 0) {
  console.error('Batch 22 collection ledger contract drift detected:');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log('Batch 22 collection ledger contract: PASS');
console.log(`Checked ${Object.keys(REQUIRED_FILES).length} canonical files.`);
