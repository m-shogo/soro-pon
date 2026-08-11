import { existsSync, readFileSync } from 'node:fs';

const PATHS = {
  yorunoshirube: 'public/assets/ui/soro-pon/skins/yorunoshirube/skin.json',
  cutePop: 'public/assets/ui/soro-pon/skins/cute-pop/skin.json',
  retiredAsset: 'public/assets/ui/soro-pon/skins/yorunoshirube/generated/final/button-primary-background.png',
  button: 'src/ui/components/Button.tsx',
  visual: 'tests/visual/batch42-top-rack-review.spec.ts',
  packageJson: 'package.json',
  workflow: '.github/workflows/ci.yml',
};

const yoru = JSON.parse(readFileSync(PATHS.yorunoshirube, 'utf8'));
const cute = JSON.parse(readFileSync(PATHS.cutePop, 'utf8'));
const button = readFileSync(PATHS.button, 'utf8');
const visual = readFileSync(PATHS.visual, 'utf8');
const packageJson = readFileSync(PATHS.packageJson, 'utf8');
const workflow = readFileSync(PATHS.workflow, 'utf8');
const failures = [];

const yoruPrimary = yoru.slots?.['button.primary.background'];
if (yoru.version !== 5) failures.push(`${PATHS.yorunoshirube}: version must be 5 after primary asset retirement`);
if (!yoruPrimary) failures.push(`${PATHS.yorunoshirube}: missing button.primary.background slot`);
if (yoruPrimary?.file !== null) failures.push(`${PATHS.yorunoshirube}: primary file must be null so CSS fallback owns the surface`);
if (yoruPrimary?.status !== 'placeholder') failures.push(`${PATHS.yorunoshirube}: primary status must be placeholder`);
if (existsSync(PATHS.retiredAsset)) failures.push(`${PATHS.retiredAsset}: retired black-oval primary bitmap must not remain in canonical finals`);

const cutePrimary = cute.slots?.['button.primary.background'];
if (cutePrimary?.status !== 'final') failures.push(`${PATHS.cutePop}: Cute Pop primary asset must remain final`);
if (cutePrimary?.file !== 'button-primary-background-2x.png') failures.push(`${PATHS.cutePop}: Cute Pop primary bitmap must remain unchanged`);

for (const needle of [
  "case 'primary':",
  "return 'button.primary.background';",
  "const cssVariant = variant === 'danger' ? 'primary' : variant;",
  '<SkinLayer slot={slot} />',
]) {
  if (!button.includes(needle)) failures.push(`${PATHS.button}: missing ${JSON.stringify(needle)} — shared Button slot semantics must stay unchanged`);
}

for (const needle of [
  'async function inspectPrimarySurface',
  "document.querySelector<HTMLElement>('.sp-top-stage__hero > .sp-button--primary')",
  "primary.querySelectorAll<HTMLElement>(':scope > .sp-skin-layer')",
  "if (skin === 'yorunoshirube')",
  'expect(primary?.skinLayerCount).toBe(0);',
  'expect(primary?.skinLayerCount).toBe(1);',
  "expect(primary?.backgroundImage).not.toBe('none');",
  'expect(primary?.minHeight).toBeGreaterThanOrEqual(44);',
]) {
  if (!visual.includes(needle)) failures.push(`${PATHS.visual}: missing ${JSON.stringify(needle)} — primary surface ownership must be measured in real DOM`);
}

if (!packageJson.includes('"qa:batch43:yorunoshirube-primary-fallback-contract": "node scripts/qa/validate-batch43-yorunoshirube-primary-fallback-contract.mjs"')) {
  failures.push(`${PATHS.packageJson}: Batch 43 contract must be directly runnable`);
}
if (!workflow.includes('pnpm qa:batch43:yorunoshirube-primary-fallback-contract')) {
  failures.push(`${PATHS.workflow}: Batch 43 contract must block CI drift`);
}

if (failures.length > 0) {
  console.error('Batch 43 Yorunoshirube primary fallback contract drift detected:');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log('Batch 43 Yorunoshirube primary fallback contract: PASS');
console.log('Verified CSS fallback for Yorunoshirube, final bitmap retention for Cute Pop, and retired asset removal.');
