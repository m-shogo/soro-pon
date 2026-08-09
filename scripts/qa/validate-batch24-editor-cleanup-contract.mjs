import { readFile } from 'node:fs/promises';

const REQUIRED_FILES = {
  app: 'src/App.tsx',
  authored: 'src/ui/styles/authored-visual-polish.css',
  workspace: 'src/ui/styles/deck-editor-authored-workspace.css',
  landscape: 'src/ui/styles/batch14-landscape-game.css',
  category: 'src/ui/styles/deck-category-workbench.css',
  tile: 'src/ui/styles/deck-tile-workbench.css',
  role: 'src/ui/styles/deck-role-workbench.css',
  bonus: 'src/ui/styles/deck-bonus-workbench.css',
  inspector: 'src/ui/styles/deck-editor-adaptive-inspector.css',
  visualContract: 'scripts/qa/validate-batch14-visual-contract.mjs',
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

forbidText('app', 'deck-role-composer.css', 'obsolete role-composer stylesheet must never be loaded again');
for (const fileKey of ['authored', 'workspace', 'landscape']) {
  for (const stale of [
    '.sp-deck-editor-tile-preview',
    '#sp-tabpanel-tiles > .sp-paper-panel',
    '#sp-tabpanel-roles > .sp-paper-panel',
    '#sp-tabpanel-bonuses > .sp-paper-panel',
    "[style*='border-bottom']",
  ]) {
    forbidText(fileKey, stale, 'legacy repeated-form/PaperPanel selector must stay deleted');
  }
}

requireText('authored', 'Tab-specific visuals live in the current workbench', 'generic authored layer must explicitly delegate tab visuals');
requireText('workspace', 'tab visuals belong to their dedicated current workbench layers', 'editor shell must not reclaim tab-specific styling');
requireText('landscape', 'Editor tab-specific compact layout now lives in the dedicated current', 'compact global layer must not own old tab DOM');

for (const [key, selector] of [
  ['category', '.sp-category-workbench'],
  ['tile', '.sp-tile-workbench'],
  ['role', '.sp-role-workbench'],
  ['bonus', '.sp-bonus-workbench'],
  ['inspector', '.sp-deck-editor-inspector__validation'],
]) {
  requireText(key, selector, 'current workbench/inspector layer must remain the canonical owner');
}

for (const stale of [
  "requireText('landscapeCss', '#sp-tabpanel-roles'",
  "requireText('workspaceCss', 'transform: none'",
  'legacy role PaperPanel DOM must remain',
]) {
  forbidText('visualContract', stale, 'visual contract must not encode removed DOM expectations');
}
for (const needle of [
  "forbidText('landscapeCss', '#sp-tabpanel-roles'",
  "forbidText('workspaceCss', '.sp-deck-editor-tile-preview'",
  "['DeckRoleWorkbench', 'sp-role-workbench']",
  "['DeckBonusWorkbench', 'sp-bonus-workbench']",
]) {
  requireText('visualContract', needle, 'visual contract must guard the current workbench architecture');
}

if (failures.length > 0) {
  console.error('Batch 24 editor cleanup contract drift detected:');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log('Batch 24 editor cleanup contract: PASS');
console.log(`Checked ${Object.keys(REQUIRED_FILES).length} canonical files.`);
