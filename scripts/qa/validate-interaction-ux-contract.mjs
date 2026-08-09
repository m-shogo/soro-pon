import { readFile } from 'node:fs/promises';

const REQUIRED_FILES = {
  layers: 'src/ui/styles/layers.css',
  app: 'src/App.tsx',
  interaction: 'src/ui/styles/interaction-ux.css',
  base: 'src/ui/styles/base.css',
  motion: 'src/ui/styles/motion.css',
  landscape: 'src/ui/styles/batch14-landscape-game.css',
  match: 'src/ui/screens/MatchScreen.tsx',
  setup: 'src/ui/screens/MatchSetupScreen.tsx',
  setupCss: 'src/ui/styles/match-setup-authored.css',
  top: 'src/ui/screens/TopScreen.tsx',
  tabs: 'src/ui/components/Tab.tsx',
  editor: 'src/ui/screens/DeckEditorScreen.tsx',
  collection: 'src/ui/screens/CollectionScreen.tsx',
  collectionCss: 'src/ui/styles/collection-authored.css',
  docs: 'docs/design/SOROPON-INTERACTION-UX-CONTRACT.md',
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

requireText(
  'layers',
  '@layer foundations, layout, components, interaction, screens, motion;',
  'interaction behavior needs a stable cascade layer after components and before screen/motion layers',
);
requireText('app', "import './ui/styles/interaction-ux.css';", 'interaction contract CSS must stay loaded');
requireText('app', "import './ui/styles/match-setup-authored.css';", 'landscape setup lobby must stay loaded');
requireText('app', "import './ui/styles/collection-authored.css';", 'collection ledger treatment must stay loaded');

requireText('interaction', 'touch-action: manipulation', 'direct controls should use touch-appropriate manipulation behavior');
requireText('interaction', '.sp-match-action-zone .sp-button', 'frequent match actions need an explicit target contract');
requireText('interaction', 'min-height: var(--sp-touch-min)', 'frequent match actions must retain the 44px touch token');
requireText('interaction', '.sp-tab', 'editor navigation needs an explicit target contract');
requireText('interaction', 'min-height: 36px', 'compact secondary controls need a deliberate constrained target size');
requireText('interaction', '@media (hover: none), (pointer: coarse)', 'touch must not inherit desktop hover behavior');
requireText('interaction', ':not(:active)', 'sticky-hover neutralization must not erase press feedback');
requireText('interaction', '@media (hover: hover) and (pointer: fine)', 'hover feedback must be gated to precise pointers');
requireText('interaction', 'scroll-padding: 10px', 'scroll containers need room for focused controls');
requireText('interaction', 'scroll-margin: 10px', 'focused controls need room from clipped scroll edges');
requireText('interaction', 'filter: brightness(0.92)', 'custom controls need immediate visible press feedback');

requireText('base', '@media (prefers-reduced-motion: reduce)', 'system Reduce Motion preference must stay supported');
for (const selector of ['.sp-tile--drawn', '.sp-button--lantern', '.sp-result-enter', '.sp-rotate-prompt__icon']) {
  requireText('base', selector, `${selector} must stop nonessential motion under Reduce Motion`);
}
requireText('base', 'animation: none !important', 'Reduce Motion should fully stop nonessential animation rather than only accelerate it');

requireText('motion', 'transform: translateY(-6px)', 'drawn-tile arrival should stay restrained');
requireText('motion', 'opacity: 0.65', 'drawn-tile arrival should stay readable during motion');
requireText('motion', 'transform: translateY(4px)', 'result entrance should use minimal travel');
forbidText('motion', 'scale(', 'gameplay motion should not depend on scaling transitions');

requireText('landscape', 'right: max(5px, var(--sp-safe-right))', 'primary actions must respect the right safe area');
requireText('landscape', 'bottom: max(4px, var(--sp-safe-bottom))', 'primary actions must respect the bottom safe area');
forbidText('landscape', "[style*='border-bottom']", 'compact editor selectors must not depend on serialized inline-style text');

requireText('match', "const discardActionLabel = canDiscard ? '捨てる' : canSelect ? '牌を選ぶ' : '待機';", 'primary discard action must explain the next available step even when compact sublabels are hidden');
requireText('match', "variant={canDiscard ? 'primary' : 'ghost'}", 'discard action should only gain primary emphasis after a tile is selected');
requireText('match', "afterDrawAction: '選ぶ'", 'phase copy should use direct game language rather than form-like terminology');
forbidText('match', "subLabel: '牌を選択'", 'compact gameplay must not depend on a sublabel that disappears in landscape');

requireText('setup', 'className="sp-screen sp-match-setup"', 'match setup must keep its authored lobby hook');
requireText('setup', 'className="sp-match-setup__rule-rail"', 'setup needs scannable rule facts instead of explanatory prose');
requireText('setup', '{playerCount}人戦をはじめる', 'start CTA must echo the selected player count');
requireText('setup', 'aria-pressed={playerCount === count}', 'player-count selection must expose its selected state');
forbidText('setup', 'PLAYERS', 'setup must not add decorative English eyebrows');
forbidText('setup', 'TABLE', 'setup must not add decorative English eyebrows');
forbidText('setup', 'PaperPanel', 'setup should remain a game lobby rather than nested form panels');

requireText('setupCss', 'use the landscape canvas as a game lobby', 'setup CSS must retain the horizontal-lobby design intent');
requireText('setupCss', 'grid-template-columns: minmax(250px, 0.82fr) minmax(300px, 1.18fr)', 'desktop setup must use both halves of the landscape canvas');
requireText('setupCss', '.sp-match-setup__rule-rail', 'setup rule summary must stay visually scannable');
requireText('setupCss', '.sp-match-setup__actions', 'setup start action must have an explicit placement region');
forbidText('setupCss', 'radial-gradient(', 'setup lobby must not add decorative AI-style glow fields');
forbidText('setupCss', 'linear-gradient(', 'setup lobby must not depend on decorative gradients');

requireText('top', 'variant="primary"', 'TOP must retain one clear primary play action');
requireText('top', '>データ管理<', 'maintenance controls must stay grouped away from daily play navigation');
requireText('top', 'setDataModalOpen(false);', 'reset confirmation must close the maintenance modal before opening another modal');
requireText('top', 'setResetConfirmOpen(true);', 'reset confirmation must remain explicit');
requireText('top', 'returnToDataManagement', 'cancel/failure should preserve the maintenance context without stacking modals');

requireText('tabs', 'id={`sp-tab-${item.id}`}', 'tabs need stable ids so panels can name their controlling tab');
requireText('editor', 'aria-labelledby={`sp-tab-${tab}`}', 'active editor panel must be labelled by its active tab');
requireText('editor', 'disabled={!isDirty}', 'save CTA should be actionable only when there is a change to commit');
requireText('editor', 'className="sp-insight-strip" role="alert"', 'save validation failures must be announced immediately');

requireText('collection', '<dl className="sp-collection-summary"', 'collection summary should be semantic data, not decorative KPI badges');
requireText('collection', 'className="sp-collection-ranking"', 'high scores should remain a scan-friendly ordered ledger');
requireText('collection', 'className="sp-collection-recent-list"', 'recent matches should remain a compact chronological ledger');
forbidText('collection', "import { Badge }", 'collection header must not regress to dashboard badge metrics');
requireText('collectionCss', 'records should read like a game ledger', 'collection authored CSS must retain its ledger intent');
forbidText('collectionCss', 'radial-gradient(', 'collection should not regain decorative glow fields');
forbidText('collectionCss', 'linear-gradient(', 'collection should not depend on decorative gradients');

for (const phrase of [
  '44x44 pt',
  '24x24 CSS px',
  'Touch / coarse pointer',
  'Keyboard / switch access',
  'prefers-reduced-motion: reduce',
  '844x390',
]) {
  requireText('docs', phrase, 'the canonical UX contract must retain its researched usability boundary');
}

forbidText('interaction', 'transition: all', 'interaction states must not animate unrelated properties');
forbidText('interaction', 'animation: infinite', 'interaction layer must not introduce decorative infinite motion');

if (failures.length > 0) {
  console.error('Interaction UX contract drift detected:');
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log('Interaction UX contract: PASS');
console.log(`Checked ${Object.keys(REQUIRED_FILES).length} canonical files.`);
