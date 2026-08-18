import { readFile } from 'node:fs/promises';

const REQUIRED_FILES = {
  app: 'src/App.tsx',
  screen: 'src/ui/screens/MatchSetupScreen.tsx',
  button: 'src/ui/components/Button.tsx',
  css: 'src/ui/styles/match-setup-header-command-cell.css',
  visual: 'tests/visual/batch71-match-setup-header-command-cell-review.spec.ts',
  packageJson: 'package.json',
  workflow: '.github/workflows/ci.yml',
  visualWorkflow: '.github/workflows/batch14-visual-review.yml',
};

const files = Object.fromEntries(
  await Promise.all(Object.entries(REQUIRED_FILES).map(async ([key, path]) => [key, await readFile(path, 'utf8')])),
);
const failures = [];

function requireText(fileKey, needle, reason) {
  if (!files[fileKey].includes(needle)) failures.push(`${REQUIRED_FILES[fileKey]}: missing ${JSON.stringify(needle)} — ${reason}`);
}
function forbidText(fileKey, needle, reason) {
  if (files[fileKey].includes(needle)) failures.push(`${REQUIRED_FILES[fileKey]}: forbidden ${JSON.stringify(needle)} — ${reason}`);
}

requireText(
  'app',
  "import './ui/styles/match-setup-header-command-cell.css';",
  'Batch 71 screen-local override must be loaded',
);

for (const needle of [
  'export function MatchSetupScreen({',
  'onBack: () => void;',
  '<Button variant="ghost" onClick={onBack}>',
  'もどる',
  '<Button variant="primary" onClick={() => onStart(playerCount)}>',
]) {
  requireText('screen', needle, 'MatchSetup navigation and primary action semantics must remain unchanged');
}
for (const forbidden of ['Math.random', 'createInitialMatchState', 'applyMatchAction']) {
  forbidText('screen', forbidden, 'MatchSetup presentation must not absorb engine responsibility');
}
requireText('button', "if (disabled) {\n    return 'button.disabled.background';", 'shared Button ownership remains unchanged');

for (const needle of [
  'Batch 71: MatchSetup leave navigation is a flat header command cell',
  '.sp-match-setup > .sp-screen__header > .sp-button--ghost {',
  'min-width: 104px;',
  'min-height: 40px;',
  'border-radius: 0;',
  'background: transparent;',
  'box-shadow: none;',
  'filter: none;',
  '.sp-match-setup > .sp-screen__header > .sp-button--ghost > .sp-skin-layer {',
  'display: none;',
  '@media (max-width: 899px), (max-height: 430px)',
  'min-width: 76px;',
  'min-height: 32px;',
]) {
  requireText('css', needle, 'MatchSetup leave action must remain a flat screen-local command cell');
}
for (const forbidden of [
  '!important',
  'linear-gradient(',
  'radial-gradient(',
  'backdrop-filter:',
  'position: fixed',
  "data-skin='cute-pop'",
  "data-skin='yorunoshirube'",
  ':focus-visible',
]) {
  forbidText('css', forbidden, 'Batch 71 must stay skin-neutral and must not suppress or replace the global focus halo');
}

for (const needle of [
  "const SKINS = ['yorunoshirube', 'cute-pop'] as const;",
  "{ width: 844, height: 390, label: 'compact' }",
  "{ width: 1440, height: 900, label: 'desktop' }",
  "page.getByRole('button', { name: 'もどる', exact: true })",
  "expect(focusShadow).not.toBe('none');",
  'await back.evaluate((element) => element.blur());',
  "expect(geometry?.label).toBe('もどる');",
  'expect(geometry?.enabled).toBe(true);',
  "expect(geometry?.shadow).toBe('none');",
  'expect(geometry?.maxRadius ?? Number.POSITIVE_INFINITY).toBeLessThanOrEqual(1);',
  'expect(geometry?.visibleSkinLayers).toBe(0);',
  'expect(geometry?.viewportOverflow).toBe(false);',
  'match-setup-header-command-${skin}-${size.label}.png',
]) {
  requireText('visual', needle, 'Visual proof must cover both skins/viewports and separate focus from resting decoration');
}

requireText(
  'packageJson',
  '"qa:batch71:match-setup-header-command-cell-contract": "node scripts/qa/validate-batch71-match-setup-header-command-cell-contract.mjs"',
  'Batch 71 contract must be directly runnable',
);
requireText(
  'workflow',
  'pnpm qa:batch71:match-setup-header-command-cell-contract',
  'Batch 71 contract must block CI drift',
);
requireText(
  'visualWorkflow',
  '- name: Verify Batch 71 MatchSetup header command cell',
  'Batch 71 must have a named visual proof step',
);
requireText(
  'visualWorkflow',
  'pnpm exec playwright test tests/visual/batch71-match-setup-header-command-cell-review.spec.ts',
  'Batch 71 dedicated proof must run immediately before artifact upload',
);

if (failures.length > 0) {
  console.error('Batch 71 MatchSetup header command cell contract drift detected:');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log('Batch 71 MatchSetup header command cell contract: PASS');
console.log(`Checked ${Object.keys(REQUIRED_FILES).length} canonical files.`);
