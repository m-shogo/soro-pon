import { readFile } from 'node:fs/promises';

const REQUIRED_FILES = {
  coachCss: 'src/ui/styles/match-coach.css',
  visual: 'tests/visual/batch26-midgame-review.spec.ts',
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

for (const needle of [
  'Batch 48: desktop guidance must sit apart from the direct manipulation',
  '@media (min-width: 900px) and (min-height: 431px)',
  '.sp-match-layout .sp-match-message-zone {',
  'var(--sp-touch-primary) +',
  'var(--sp-space-24)',
]) {
  requireText('coachCss', needle, 'desktop coach must reserve explicit space above the hand');
}

const start = files.coachCss.indexOf('/* Batch 48: desktop guidance must sit apart');
const end = files.coachCss.indexOf('@media (max-width: 899px)', start);
const block = start >= 0 && end > start ? files.coachCss.slice(start, end) : '';
for (const forbidden of ['!important', 'linear-gradient(', 'radial-gradient(', 'backdrop-filter:']) {
  if (block.includes(forbidden)) failures.push(`${REQUIRED_FILES.coachCss}: Batch 48 block contains forbidden ${JSON.stringify(forbidden)}`);
}

for (const needle of [
  'coachHandGap',
  'hand.getBoundingClientRect().top - coach.getBoundingClientRect().bottom',
  'expect(geometry.coachHandGap).not.toBeNull();',
  'expect(geometry.coachHandGap ?? Number.NEGATIVE_INFINITY).toBeGreaterThanOrEqual(10);',
  'expect(geometry.coachOverlaps).toEqual([]);',
]) {
  requireText('visual', needle, 'real desktop midgame evidence must prove a measurable coach-hand safety gap');
}

requireText('packageJson', '"qa:batch48:desktop-coach-clearance-contract": "node scripts/qa/validate-batch48-desktop-coach-clearance-contract.mjs"', 'Batch 48 contract must be runnable');
requireText('workflow', 'pnpm qa:batch48:desktop-coach-clearance-contract', 'Batch 48 contract must block CI drift');

if (failures.length > 0) {
  console.error('Batch 48 desktop coach clearance contract drift detected:');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log('Batch 48 desktop coach clearance contract: PASS');
console.log(`Checked ${Object.keys(REQUIRED_FILES).length} canonical files.`);
