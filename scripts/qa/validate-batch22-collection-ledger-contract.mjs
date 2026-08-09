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
requireText('screen', 'title="最近の記録"', 'recent match ledger must remain visible as the side chronology');

requireText('authoredCss', 'game ledger, not a KPI dashboard', 'anti-dashboard thesis must remain explicit');
requireText('stageCss', 'match ledger, not a dashboard', 'Batch22 stage thesis must remain explicit');
requireText('stageCss', 'width: min(1180px, 100%);', 'desktop collection should read as a centered ledger stage');
requireText('stageCss', 'width: min(190px, 24%);', 'compact recent rail must leave the main match ledger dominant');
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
]) {
  requireText('visual', needle, 'collection must stay in real-route both-skin current-head evidence');
}
requireText('packageJson', 'tests/visual/batch22-collection-review.spec.ts', 'canonical visual command must include the collection review');

if (failures.length > 0) {
  console.error('Batch 22 collection ledger contract drift detected:');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log('Batch 22 collection ledger contract: PASS');
console.log(`Checked ${Object.keys(REQUIRED_FILES).length} canonical files.`);
