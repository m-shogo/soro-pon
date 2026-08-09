import { readFile } from 'node:fs/promises';

const REQUIRED_FILES = {
  app: 'src/App.tsx',
  inspector: 'src/ui/components/DeckEditorInspector.tsx',
  css: 'src/ui/styles/deck-editor-adaptive-inspector.css',
  editor: 'src/ui/screens/DeckEditorScreen.tsx',
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

requireText('app', "import './ui/styles/deck-editor-adaptive-inspector.css';", 'adaptive rail styles must stay loaded after editor workbench layers');
requireText('editor', '<DeckEditorInspector deck={draft} validation={validation} />', 'editor must continue using the canonical validation result');

for (const needle of [
  "issue.severity === 'error'",
  "issue.severity === 'warning'",
  "issue.severity === 'info'",
  "validation.status === 'blocked' || errorCount > 0",
  'aria-label="検証問題の内訳"',
  '<details',
  'open={validationOpen}',
  '<summary>',
  '<span>検証詳細</span>',
  '<ValidationIssueList issues={validation.issues}',
  '検証: 問題なし',
]) {
  requireText('inspector', needle, 'status, issue counts and disclosure semantics must remain explicit');
}
requireText('inspector', 'setValidationOpen(shouldOpenValidation)', 'blocked/error transitions must reopen validation details');
forbidText('inspector', 'validation.issues.map(', 'inspector must not duplicate ValidationIssueList rendering semantics');

requireText('css', 'width: min(158px, 21%);', 'compact rail must return horizontal space to the workbench');
requireText('css', 'min-width: 148px;', 'compact rail needs a readable lower width bound');
requireText('css', 'min-height: 32px;', 'details summary needs an explicit pointer target on roomy layouts');
requireText('css', 'min-height: 28px;', 'details summary must stay above WCAG 24px minimum in compact mode');
requireText('css', '.sp-deck-editor-inspector__issue-counts', 'issue severity counts must remain constantly scannable');
forbidText('css', 'linear-gradient(', 'adaptive inspector must not use decorative gradients');
forbidText('css', 'radial-gradient(', 'adaptive inspector must not use decorative gradients');
forbidText('css', 'backdrop-filter:', 'adaptive inspector must not add glass blur');

if (failures.length > 0) {
  console.error('Batch 21 adaptive inspector contract drift detected:');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log('Batch 21 adaptive inspector contract: PASS');
console.log(`Checked ${Object.keys(REQUIRED_FILES).length} canonical files.`);
