import { readFile } from 'node:fs/promises';

const REQUIRED_FILES = {
  app: 'src/App.tsx',
  screen: 'src/ui/screens/DeckDetailScreen.tsx',
  css: 'src/ui/styles/deck-detail-stage.css',
};

const files = Object.fromEntries(
  await Promise.all(
    Object.entries(REQUIRED_FILES).map(async ([key, path]) => [key, await readFile(path, 'utf8')]),
  ),
);

const failures = [];

function requireText(fileKey, needle, reason) {
  if (!files[fileKey].includes(needle)) {
    failures.push(`${REQUIRED_FILES[fileKey]}: missing ${JSON.stringify(needle)} — ${reason}`);
  }
}

function forbidText(fileKey, needle, reason) {
  if (files[fileKey].includes(needle)) {
    failures.push(`${REQUIRED_FILES[fileKey]}: found forbidden ${JSON.stringify(needle)} — ${reason}`);
  }
}

requireText(
  'app',
  "import './ui/styles/deck-detail-stage.css';",
  'Batch 16 deck-detail stage must stay loaded after earlier shared screen layers',
);

for (const needle of [
  "playableWithWarnings: '注意あり'",
  "blocked: '要修正'",
  'className="sp-screen sp-deck-loadout sp-deck-detail-stage"',
  'className="sp-deck-detail-stage__primary-actions"',
  'className="sp-deck-detail-stage__main sp-screen__col--scroll"',
  'className="sp-deck-detail-stage__summary" aria-label="デッキ概要"',
  'className="sp-deck-detail-stage__validation" open={!canPlay}',
  '<summary>検証詳細 {validation.issues.length}件</summary>',
  'className="sp-deck-detail-stage__utility" aria-label="その他のデッキ操作"',
  'このデッキで対局',
  'デッキを編集',
]) {
  requireText('screen', needle, 'deck detail must remain a play-first loadout inspection screen with compact validation disclosure');
}

forbidText('screen', 'PaperPanel', 'validation must not regain a dominant panel/card treatment');
forbidText('screen', 'SectionHeader', 'all primary and destructive actions must not regress to one equal-emphasis header row');

for (const needle of [
  'deck is a game object to inspect before play',
  '.sp-deck-detail-stage__body {',
  'grid-template-columns: minmax(0, 1fr) minmax(250px, 0.31fr);',
  '.sp-deck-detail-stage .sp-deck-loadout__tile-grid {',
  'grid-template-columns: repeat(auto-fit, minmax(var(--tile-w), 1fr));',
  '.sp-deck-detail-stage__validation summary {',
  '.sp-deck-detail-stage__utility {',
  'height: min(630px, calc(100vh - 150px));',
  'grid-template-columns: minmax(0, 1fr) minmax(210px, 25%);',
  'min-height: 44px;',
]) {
  requireText('css', needle, 'deck detail must keep object-led desktop and compact spatial hierarchy');
}

for (const forbidden of ['radial-gradient(', 'linear-gradient(', 'backdrop-filter:', 'translateY(']) {
  forbidText('css', forbidden, 'Batch 16 must not use generic AI/SaaS decoration or hover lift to create hierarchy');
}

if (failures.length > 0) {
  console.error('Batch 16 deck-detail contract drift detected:');
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log('Batch 16 deck-detail contract: PASS');
console.log(`Checked ${Object.keys(REQUIRED_FILES).length} canonical files.`);
