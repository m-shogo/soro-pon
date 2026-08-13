import { readFile } from 'node:fs/promises';

const REQUIRED_FILES = {
  app: 'src/App.tsx',
  screen: 'src/ui/screens/MatchSetupScreen.tsx',
  authoredCss: 'src/ui/styles/match-setup-authored.css',
  css: 'src/ui/styles/match-setup-player-count-ledger.css',
  visual: 'tests/visual/batch66-match-setup-player-count-ledger-review.spec.ts',
  batch29: 'scripts/qa/validate-batch29-match-setup-lobby-contract.mjs',
  batch44: 'tests/visual/batch44-match-setup-rack-review.spec.ts',
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
  "import './ui/styles/match-setup-player-count-ledger.css';",
  'Batch 66 selector override must load after authored MatchSetup ownership',
);

for (const needle of [
  'const supported = variant.ruleConfig.supportedPlayerCounts;',
  'const [playerCount, setPlayerCount] = useState<3 | 4>(supported[0] ?? 3);',
  'className="sp-match-setup__count-options" aria-label="対局人数"',
  "variant={playerCount === count ? 'paper' : 'ghost'}",
  'aria-pressed={playerCount === count}',
  'disabled={!supported.includes(count)}',
  'onClick={() => setPlayerCount(count)}',
  '<strong>{playerCount}人戦</strong>',
  'data-player-count={playerCount}',
  'onClick={() => onStart(playerCount)}',
]) {
  requireText('screen', needle, 'player-count state, accessibility, lobby sync, and start semantics must remain unchanged');
}
for (const forbidden of ['Math.random', 'createInitialMatchState', 'applyMatchAction']) {
  forbidText('screen', forbidden, 'MatchSetup presentation must not absorb engine responsibility');
}

for (const needle of [
  '.sp-match-setup__count-options {',
  'grid-template-columns: repeat(2, minmax(0, 1fr));',
  'gap: var(--sp-space-8);',
  '.sp-match-setup__lobby {',
  '.sp-match-setup__deck-face {',
  '.sp-match-setup__rule-rail {',
  '.sp-match-setup__actions .sp-button {',
]) {
  requireText('authoredCss', needle, 'authored MatchSetup composition remains the base contract beneath Batch 66');
}

for (const needle of [
  'Batch 66: player-count selection is one connected selector ledger',
  '.sp-match-setup__count-options {',
  'gap: 0;',
  'overflow: hidden;',
  '.sp-match-setup__count-options .sp-button {',
  'min-height: 40px;',
  'border-radius: 0;',
  'background: transparent;',
  'box-shadow: none;',
  'filter: none;',
  '.sp-match-setup__count-options .sp-button > .sp-skin-layer {',
  'display: none;',
  ".sp-match-setup__count-options .sp-button[aria-pressed='true'] {",
  'border-bottom-width: 2px;',
  '@media (max-width: 899px), (max-height: 430px)',
  'min-height: 32px;',
]) {
  requireText('css', needle, 'player-count choice must remain a flat two-cell selector ledger');
}
for (const forbidden of [
  '!important',
  'linear-gradient(',
  'radial-gradient(',
  'backdrop-filter:',
  'position: fixed',
  "data-skin='cute-pop'",
  "data-skin='yorunoshirube'",
]) {
  forbidText('css', forbidden, 'Batch 66 must stay skin-neutral and avoid specificity/decorative escape hatches');
}

for (const needle of [
  "const SKINS = ['yorunoshirube', 'cute-pop'] as const;",
  'const PLAYER_COUNTS = [3, 4] as const;',
  "{ width: 844, height: 390, label: 'compact' }",
  "{ width: 1440, height: 900, label: 'desktop' }",
  "expect(geometry?.labels).toEqual(['3人戦', '4人戦']);",
  'expect(geometry?.pressedCount).toBe(1);',
  'expect(geometry?.pressedLabel).toBe(`${playerCount}人戦`);',
  'expect(geometry?.pressedAccentWidth ?? 0).toBeGreaterThanOrEqual(2);',
  'expect(geometry?.gap).toBe(0);',
  'expect(geometry?.maxRadius ?? Number.POSITIVE_INFINITY).toBeLessThanOrEqual(1);',
  'expect(geometry?.minTargetHeight ?? 0).toBeGreaterThanOrEqual(32);',
  'expect(geometry?.allShadowless).toBe(true);',
  'expect(geometry?.allTransparent).toBe(true);',
  'expect(geometry?.visibleSkinLayerCount).toBe(0);',
  'expect(geometry?.lobbySeatCount).toBe(playerCount);',
  'expect(geometry?.centerText).toBe(`${playerCount}人戦`);',
  'expect(geometry?.startLabel).toBe(`${playerCount}人戦をはじめる`);',
  'match-setup-player-count-ledger-${skin}-${playerCount}p-${size.label}.png',
]) {
  requireText('visual', needle, 'Batch 66 evidence must cover selector geometry and state synchronization across both skins/counts/sizes');
}

for (const needle of [
  'disabled={!supported.includes(count)}',
  'onClick={() => onStart(playerCount)}',
  "type LobbySeatPosition = 'self' | 'left' | 'top' | 'right'",
]) {
  requireText('batch29', needle, 'Batch 29 lobby/state ownership must remain independently enforced');
}
for (const needle of [
  'const PLAYER_COUNTS = [3, 4] as const;',
  'expect(seats?.count).toBe(playerCount);',
  'expect(seats?.centerPanelCollisions).toEqual([]);',
  'expect(seats?.allShadowless).toBe(true);',
]) {
  requireText('batch44', needle, 'Batch 44 rack/seat geometry proof must remain intact');
}

requireText('visualWorkflow', 'pnpm qa:batch14:review-capture', 'canonical visual review must remain intact');
requireText(
  'visualWorkflow',
  '- name: Verify Batch 66 MatchSetup player-count ledger',
  'Batch 66 must have a named final MatchSetup visual proof step',
);
requireText(
  'visualWorkflow',
  'pnpm exec playwright test tests/visual/batch66-match-setup-player-count-ledger-review.spec.ts',
  'Batch 66 dedicated proof must run before artifact upload',
);
requireText(
  'packageJson',
  '"qa:batch66:match-setup-player-count-ledger-contract": "node scripts/qa/validate-batch66-match-setup-player-count-ledger-contract.mjs"',
  'Batch 66 contract must be directly runnable',
);
requireText(
  'workflow',
  'pnpm qa:batch66:match-setup-player-count-ledger-contract',
  'Batch 66 contract must block CI drift',
);

if (failures.length > 0) {
  console.error('Batch 66 MatchSetup player-count ledger contract drift detected:');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log('Batch 66 MatchSetup player-count ledger contract: PASS');
console.log(`Checked ${Object.keys(REQUIRED_FILES).length} canonical files.`);
