import { readFile } from 'node:fs/promises';

const REQUIRED_FILES = {
  app: 'src/App.tsx',
  component: 'src/ui/components/ScoreBreakdown.tsx',
  baseCss: 'src/ui/components/components.css',
  css: 'src/ui/styles/score-breakdown-semantic-contrast.css',
  visual: 'tests/visual/batch64-result-total-contrast-review.spec.ts',
  batch63: 'scripts/qa/validate-batch63-result-desktop-score-command-ledger-contract.mjs',
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
  "import './ui/styles/score-breakdown-semantic-contrast.css';",
  'Batch 64 semantic contrast guard must load after Result authored overrides',
);

for (const needle of [
  'className="sp-score-breakdown__total"',
  '<span>合計得点</span>',
  'className="sp-score-breakdown__total-points"',
  'useCountUp(animate ? value : 0)',
]) {
  requireText('component', needle, 'ScoreBreakdown DOM, label, total value, and count-up semantics must remain unchanged');
}
requireText(
  'baseCss',
  '.sp-score-breakdown__total {',
  'the shared total surface remains the canonical ScoreBreakdown dark surface',
);
requireText(
  'baseCss',
  'background: var(--sp-color-ink);',
  'Batch 64 changes text semantics only and must not silently redesign the total surface',
);

for (const needle of [
  'Batch 64: ScoreBreakdown total is a dark semantic surface',
  '@layer screens {',
  '.sp-result-screen .sp-score-breakdown__total {',
  'color: var(--sp-text-on-dark);',
]) {
  requireText('css', needle, 'Result total text must use the skin semantic on-dark token');
}
for (const forbidden of [
  '#',
  'rgb(',
  'rgba(',
  "data-skin='cute-pop'",
  "data-skin='yorunoshirube'",
  '!important',
  'linear-gradient(',
  'radial-gradient(',
]) {
  forbidText('css', forbidden, 'Batch 64 must be semantic-token driven, skin-neutral, and free of specificity/decorative hacks');
}

for (const needle of [
  "const SKINS = ['yorunoshirube', 'cute-pop'] as const;",
  "{ width: 844, height: 390, label: 'compact' }",
  "{ width: 1440, height: 900, label: 'desktop' }",
  'playRealMatchToResult',
  "semanticProbe.style.color = 'var(--sp-text-on-dark)';",
  'contrastRatio',
  "expect(total?.label).toBe('合計得点');",
  'expect(Number(total?.value ?? 0)).toBeGreaterThan(0);',
  'expect(total?.foreground).toBe(total?.semanticColor);',
  'expect(total?.contrast ?? 0).toBeGreaterThanOrEqual(4.5);',
  'result-total-contrast-${skin}-${size.label}.png',
]) {
  requireText('visual', needle, 'Batch 64 evidence must prove semantic-token equality and WCAG contrast on real Result UI for both skins/sizes');
}
for (const forbidden of ['state.result =', "phase: 'result'", 'SHOW_RESULT', 'applyMatchAction(']) {
  forbidText('visual', forbidden, 'Batch 64 contrast evidence must reach Result through real UI actions, not injected state');
}

for (const needle of [
  'expect(geometry.minLedgerTextLuma).toBeGreaterThanOrEqual(0.45);',
  'expect(geometry.minActionTextLuma).toBeGreaterThanOrEqual(0.45);',
  '- name: Verify Batch 63 Result desktop score command ledger',
]) {
  requireText(
    needle.startsWith('- name:') ? 'visualWorkflow' : 'batch63',
    needle,
    'Batch 63 side-rail geometry/readability ownership must remain intact',
  );
}

requireText(
  'visualWorkflow',
  '- name: Verify Batch 64 Result total contrast',
  'Batch 64 must have an explicit final visual proof step',
);
requireText(
  'visualWorkflow',
  'pnpm exec playwright test tests/visual/batch64-result-total-contrast-review.spec.ts',
  'Batch 64 real-match contrast proof must run before artifact upload',
);
requireText(
  'packageJson',
  '"qa:batch64:result-total-contrast-contract": "node scripts/qa/validate-batch64-result-total-contrast-contract.mjs"',
  'Batch 64 contract must be directly runnable',
);
requireText(
  'workflow',
  'pnpm qa:batch64:result-total-contrast-contract',
  'Batch 64 contract must block CI drift',
);

if (failures.length > 0) {
  console.error('Batch 64 Result total contrast contract drift detected:');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log('Batch 64 Result total contrast contract: PASS');
console.log(`Checked ${Object.keys(REQUIRED_FILES).length} canonical files.`);
