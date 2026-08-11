import { readFile } from 'node:fs/promises';

const REQUIRED_FILES = {
  app: 'src/App.tsx',
  css: 'src/ui/styles/desktop-top-stage.css',
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

requireText('app', "import './ui/styles/desktop-top-stage.css';", 'desktop TOP layer must load after the shared home composition');

for (const needle of [
  '@media (min-width: 1000px) and (min-height: 600px)',
  'width: min(100%, 1400px);',
  'width: min(1260px, 100%);',
  'height: min(700px, calc(100vh - 100px));',
  'min-height: 560px;',
  'grid-template-columns: minmax(0, 1.38fr) minmax(300px, 0.62fr);',
  '--tile-w: clamp(60px, 5.3vw, 78px);',
  '--tile-h: clamp(80px, 7vw, 104px);',
  'width: min(440px, 68%);',
  'min-height: 68px;',
  'min-height: 70px;',
  'margin-top: auto;',
]) {
  requireText('css', needle, 'desktop TOP must use the wide canvas and preserve a strong hero/CTA hierarchy');
}

for (const forbidden of [
  '@media (max-width:',
  '@media (max-height:',
  'radial-gradient(',
  'linear-gradient(',
  'backdrop-filter',
  'translateY(',
  '!important',
]) {
  forbidText('css', forbidden, 'Batch 32 must remain desktop-only and avoid promo-card/glass/lift escape hatches');
}

for (const needle of [
  "capture(page, `top-${skin}-${size.label}`)",
  "{ width: 844, height: 390, label: 'compact' }",
  "{ width: 1440, height: 900, label: 'desktop' }",
  'await expectViewportContract(page);',
]) {
  requireText('visual', needle, 'canonical shell-flow evidence must continue capturing TOP at compact and desktop sizes');
}

requireText('packageJson', '"qa:batch32:desktop-top-stage-contract": "node scripts/qa/validate-batch32-desktop-top-stage-contract.mjs"', 'Batch 32 contract must be runnable directly');
requireText('workflow', 'pnpm qa:batch32:desktop-top-stage-contract', 'Batch 32 contract must block CI drift');

if (failures.length > 0) {
  console.error('Batch 32 desktop TOP stage contract drift detected:');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log('Batch 32 desktop TOP stage contract: PASS');
console.log(`Checked ${Object.keys(REQUIRED_FILES).length} canonical files.`);
