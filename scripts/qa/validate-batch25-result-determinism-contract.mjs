import { readFile } from 'node:fs/promises';

const REQUIRED_FILES = {
  visual: 'tests/visual/batch23-result-review.spec.ts',
  rng: 'src/engine/rng/createSeededRng.ts',
  cpu: 'src/engine/cpu/chooseCpuAction.ts',
  appRoot: 'src/app/AppRoot.tsx',
};

const files = Object.fromEntries(
  await Promise.all(
    Object.entries(REQUIRED_FILES).map(async ([key, path]) => [key, await readFile(path, 'utf8')]),
  ),
);
const failures = [];

function requireText(fileKey, needle, reason) {
  if (!files[fileKey].includes(needle)) failures.push(`${REQUIRED_FILES[fileKey]}: missing ${JSON.stringify(needle)} — ${reason}`);
}
function forbidText(fileKey, needle, reason) {
  if (files[fileKey].includes(needle)) failures.push(`${REQUIRED_FILES[fileKey]}: found forbidden ${JSON.stringify(needle)} — ${reason}`);
}

for (const needle of [
  "type ReadyAction = 'result' | 'tsumo' | 'ron' | 'discard' | 'tile'",
  'async function waitForReadyAction',
  "if (hasButton('ツモ')) return 'tsumo'",
  "if (hasButton('ロン')) return 'ron'",
  "if (hasButton('捨てる')) return 'discard'",
  "return 'tile'",
  "if (action === 'discard')",
  'fixed seed repeats the same semantic Result through real UI actions',
  'const first = await readResultSignature(page)',
  'const second = await readResultSignature(page)',
  'expect(second).toEqual(first)',
  'FIXED_NOW_MS',
]) {
  requireText('visual', needle, 'Result evidence must synchronize on a deterministic ready-action policy and verify repeatability');
}
for (const forbidden of [
  'force: true',
  'state.result =',
  "phase: 'result'",
  'SHOW_RESULT',
  'applyMatchAction(',
  'Math.random =',
]) {
  forbidText('visual', forbidden, 'determinism proof must not bypass pointer, engine, or RNG boundaries');
}

requireText('rng', 'engineはMath.randomを直接使わない。seedからの決定的RNGのみ。', 'engine RNG must remain seed-driven');
requireText('rng', 'createSeededRng(seed: number)', 'canonical seeded RNG must remain unchanged');
forbidText('rng', 'Math.random()', 'engine RNG implementation must not fall back to global randomness');
requireText('cpu', 'const rng = createSeededRng(state.seed + state.turnCount * 31);', 'CPU tie-break must stay deterministic from match state');
requireText('appRoot', 'seed: newSeed()', 'production AppRoot must remain the source of match seed input');

if (failures.length > 0) {
  console.error('Batch 25 result determinism contract drift detected:');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log('Batch 25 result determinism contract: PASS');
console.log(`Checked ${Object.keys(REQUIRED_FILES).length} canonical files.`);
