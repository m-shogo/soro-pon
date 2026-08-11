import { readFile } from 'node:fs/promises';

const REQUIRED_FILES = {
  app: 'src/App.tsx',
  coach: 'src/ui/components/MatchCoach.tsx',
  match: 'src/ui/screens/MatchScreen.tsx',
  css: 'src/ui/styles/match-coach.css',
  visual: 'tests/visual/batch26-midgame-review.spec.ts',
  engine: 'src/engine/analysis/buildBoardInsights.ts',
  packageJson: 'package.json',
  workflow: '.github/workflows/ci.yml',
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

requireText('app', "import './ui/styles/match-coach.css';", 'coach presentation layer must be loaded after table composition');
for (const needle of [
  'export function MatchCoach',
  'const primary = insights[0]',
  'const rest = insights.slice(1)',
  '<details className="sp-match-coach sp-match-coach--expandable">',
  '<summary>',
  'role="alert"',
  'aria-live="polite"',
  'ほか${rest.length}件',
]) {
  requireText('coach', needle, 'insights must remain available through a compact accessible disclosure and errors must remain urgent');
}
for (const forbidden of ['insights.slice(0, 1)', 'display: none']) {
  forbidText('coach', forbidden, 'the coach must not discard analysis information');
}

requireText('match', 'messages={<MatchCoach insights={controller.insights} error={controller.lastError} />}', 'MatchScreen must render the canonical coach instead of stacked message spans');
forbidText('match', 'controller.insights.map(', 'MatchScreen must not reintroduce stacked insight prose');

for (const needle of [
  '.sp-match-coach--expandable > summary',
  'pointer-events: auto;',
  'bottom: calc(var(--tile-h) + 7px);',
  'width: min(250px, 31vw);',
  '-webkit-line-clamp: 2;',
]) {
  requireText('css', needle, 'compact coach must stay short, operable and clear of the hand');
}

for (const needle of [
  'coachOverlaps',
  "document.querySelector<HTMLElement>('.sp-match-coach')",
  "document.querySelectorAll<HTMLElement>('.sp-self-hand-zone, .sp-match-action-zone')",
  'expect(geometry.coachOverlaps).toEqual([])',
]) {
  requireText('visual', needle, 'current-head evidence must reject coach collisions with hand or actions');
}

for (const needle of [
  'insights.sort((a, b) => b.priority - a.priority);',
  "case 'beginner':",
  "case 'normal':",
  "case 'advanced':",
]) {
  requireText('engine', needle, 'Batch 28 must preserve BoardInsight priority/display-mode semantics');
}

requireText('packageJson', '"qa:batch28:match-coach-contract": "node scripts/qa/validate-batch28-match-coach-contract.mjs"', 'Batch 28 contract must be runnable directly');
requireText('workflow', 'pnpm qa:batch28:match-coach-contract', 'Batch 28 contract must block CI drift');

if (failures.length > 0) {
  console.error('Batch 28 match coach contract drift detected:');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log('Batch 28 match coach contract: PASS');
console.log(`Checked ${Object.keys(REQUIRED_FILES).length} canonical files.`);
