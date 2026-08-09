import { readFile } from 'node:fs/promises';

const REQUIRED_FILES = {
  app: 'src/App.tsx',
  top: 'src/ui/screens/TopScreen.tsx',
  deckList: 'src/ui/screens/DeckListScreen.tsx',
  homeCss: 'src/ui/styles/home-loadout-stage.css',
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
  "import './ui/styles/home-loadout-stage.css';",
  'Batch 15 authored home/loadout composition must stay loaded after the earlier screen layers',
);

for (const needle of [
  "import starterRaw from '../../../samples/animal-starter.deck.json';",
  'const FEATURED_DECK = starterRaw as DeckProject;',
  "import { TileCard } from '../components/TileCard';",
  'className="sp-top-stage"',
  'className="sp-top-stage__rack"',
  'className="sp-top-stage__deck-spec"',
  'aria-label="ホームメニュー"',
  "{hasPlayableDeck ? 'まず遊ぶ' : 'デッキを準備'}",
  'JSONを読み込む',
]) {
  requireText('top', needle, 'TOP must stay deck-led while preserving its established user actions');
}

for (const needle of [
  'className="sp-deck-select__actions"',
  'className="sp-deck-select-card__body"',
  'className="sp-deck-select-card__preview"',
  'className="sp-deck-select-card__spec"',
  'className="sp-deck-select-card__stats"',
  'stored.deck.tiles.slice(0, 8)',
  "variant={decks.length === 0 ? 'primary' : 'ink'}",
]) {
  requireText('deckList', needle, 'deck selection must stay object-led and keep utility actions subordinate');
}

for (const needle of [
  'game spaces led by real tile objects',
  '.sp-top-stage {',
  'grid-template-columns: minmax(0, 1.28fr) minmax(290px, 0.72fr);',
  '.sp-top-stage__rack {',
  '.sp-top-stage__deck-spec {',
  '.sp-deck-select__grid {',
  'grid-template-columns: repeat(auto-fit, minmax(440px, 1fr));',
  'align-content: center;',
  '.sp-deck-select-card__body {',
  'grid-template-columns: minmax(280px, 1.35fr) minmax(190px, 0.65fr);',
  'height: min(590px, calc(100vh - 150px));',
  'grid-template-columns: minmax(0, 1.18fr) minmax(274px, 0.82fr);',
  'justify-content: space-between;',
  '.sp-deck-select-card:only-child {',
  'min-height: 260px;',
  'min-height: 44px;',
]) {
  requireText('homeCss', needle, 'Batch 15 must preserve its authored spatial hierarchy and avoid dead canvas space');
}

for (const forbidden of [
  'radial-gradient(',
  'linear-gradient(',
  'backdrop-filter:',
  'translateY(',
]) {
  forbidText('homeCss', forbidden, 'home/loadout polish must not regress to generic AI/SaaS decoration or hover lift');
}

forbidText('top', 'PaperPanel', 'TOP must not regress to a recent-record card beside a stacked web menu');
forbidText('deckList', 'DECK SELECT', 'deck selection must not add decorative English UI chrome');

if (failures.length > 0) {
  console.error('Batch 15 home/loadout contract drift detected:');
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log('Batch 15 home/loadout contract: PASS');
console.log(`Checked ${Object.keys(REQUIRED_FILES).length} canonical files.`);
