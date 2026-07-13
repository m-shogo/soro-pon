# Skin Foundation Hardening

## Purpose

This is the execution source of truth for finishing the multi-skin foundation before final image production.

The current repository already has:

```text
base / yorunoshirube / cute-pop skin packages
manifest and contract schemas
safe token parsing baseline
inheritance and fallback
SkinProvider runtime switching
basic SkinSurface render modes
initial shared component integration
```

Do not create a second theme system. Harden and complete the existing one.

Final PNG/WebP generation must not start until all P0 gates in this document pass.

## Non-negotiable invariants

A skin must never change:

```text
game rules
engine output
match/editor/application state
screen structure responsibility
hit areas
minimum touch target
responsive layout
z-index architecture
focus meaning
selected/disabled/warning meaning
accessibility behavior
```

A skin may change only validated presentation:

```text
colors
approved font preset
visual radius within contract
borders and frames
shadows and light
textures
registered images
registered visual effects
```

## P0 — Required before image production

### P0-1 Explicit skin-token allowlist

Problem:

The current parser accepts any syntactically safe `--sp-*` token. This can allow an external skin to override structural values such as touch size, z-index, spacing, font size, or excessively long motion.

Required:

```text
introduce explicit token definitions
classify each token as structural or skinable
reject every token not in the skinable allowlist
validate values by token type and range
keep official and external trust rules explicit
```

Structural tokens must not be externally overridable:

```text
--sp-space-*
--sp-font-xs/sm/md/lg/xl
--sp-line-*
--sp-z-*
--sp-touch-*
layout/grid/position/pointer-event related values
```

External-skin allowed examples:

```text
semantic colors
on-surface text colors
approved font preset
visual border tokens
visual radius within limits
visual shadow tokens within limits
registered gradients/effect visuals
```

Do not use only a name regex. Use a typed definition table.

### P0-2 Enforce the full skin contract

Add `pnpm skin:validate`.

It must validate:

```text
registry/manifest/contract schema
skin contract version compatibility
known skin/token/slot IDs
inheritance cycle and maximum depth
safe package-local filenames
file existence
file type allowed for trust level
individual file byte limit
whole skin byte limit
actual image dimensions
intrinsicSize consistency
nine-slice coordinates inside image bounds
content safe area consistency
minimum render size
slot-specific allowed render modes
status/file consistency
candidate/final directory rules
all official skin packages
```

`status: final` with `file: null` is invalid.

The contract and base manifest must match complete geometry values, not only slot names.

Add the command to CI after implementation.

### P0-3 Semantic contrast contract

Create semantic foreground tokens instead of reusing general text colors:

```text
--sp-text-on-primary
--sp-text-on-surface
--sp-text-on-dark
--sp-text-muted
--sp-text-on-category-light
--sp-text-on-category-dark
--sp-focus-ring-color
```

Required:

```text
Cute Pop primary-button text contrast passes
focus ring contrast is visible on light and dark surfaces
category bands select readable light/dark text automatically
warning/info/success states remain distinguishable without color alone
```

Add contrast checks for official token sets to `skin:validate` where practical.

### P0-4 User-facing and Gallery skin selection

Implement shared:

```text
SkinSelector
SkinPreviewCard
skin loading state
skin load failure notice
restore default action
```

Required paths:

```text
Component Gallery instant switch
normal application user-facing switch
```

Switching must not reload the page and must preserve:

```text
current screen
match state
editor draft state
selected tiles
modal/form state where applicable
```

### P0-5 Nine-slice production proof

Before generating all assets, prove the renderer with only:

```text
panel.paper.default
button.primary.background
```

Required renderer changes:

```text
separate source image slice from rendered borderWidth
support high-density source images
validate minimum render dimensions
keep content safe area separate from layout padding
```

Test:

```text
short label
long Japanese label
two-line label
disabled
focused
minimum width
large panel
all five review sizes
both official skins
```

Only after this proof may broad image production start.

### P0-6 Layered surface rendering

Do not apply skin opacity or blend mode to the content element itself.

Use explicit layers:

```text
base fallback layer
skin image layer
visual overlay layer
content layer
state overlay layer
focus layer
```

Skin layers must use `pointer-events: none`.

Text, icons, children, focus rings, and hit areas must remain fully opaque and interactive.

### P0-7 Finish the central render contract

Central renderers may support:

```text
cover
contain
stretch
repeat
repeat-x
repeat-y
nine-slice-stretch
nine-slice-tile
three-slice-x
three-slice-y
overlay
mask/tint
```

Do not implement render modes inside screens.

Add only modes with tests and real Component Gallery examples.

## P1 — Required before public demo

### P1-1 DOM and interaction test layer

Keep pure engine tests in node environment.

Add a browser-like component test setup for:

```text
Button states and disabled behavior
Tile selected/emphasis accessibility state
Modal focus entry/trap/return
Tabs keyboard navigation
SkinSelector
skin switching without state loss
ErrorState and reset confirmation
```

Use an explicit dependency/ADR decision before adding test libraries.

### P1-2 Playwright visual regression

Minimum matrix:

```text
all screens at 844x390
TOP / Deck Editor / Match / Result / Collection at all five sizes
Component Gallery in yorunoshirube and cute-pop
```

Review sizes:

```text
844x390
852x393
932x430
1024x600
1366x768
```

Handle deterministic data, timestamps, motion, and fonts before recording baselines.

### P1-3 Accessibility completion

Modal:

```text
initial focus
focus trap
Escape close
focus return
aria-labelledby / aria-describedby
background interaction suppression
```

Tabs:

```text
roving tabindex
Left/Right/Home/End navigation
aria-controls
tabpanel relationship
```

TileCard:

```text
aria-pressed or equivalent selected state
clear win/emphasis label
color is never the only signal
```

### P1-4 Recovery UX

Implement:

```text
AppErrorBoundary
shared ErrorState
invalid/missing deck fallback
skin load failure fallback
visible local-data reset path
confirmation Dialog
reset decks/settings/records/all options as appropriate
```

Never return a blank screen for a recoverable missing entity.

### P1-5 Dynamic browser color scheme

Skin metadata must define:

```text
colorScheme: dark | light
themeColor
```

Apply it to the document and relevant meta tags when switching.

Cute Pop must not retain dark native controls solely because the initial HTML is dark.

### P1-6 Shared-component completion

Prioritize:

```text
IconButton
Dialog
SectionHeader
ValidationIssueList
FormField
TextField
NumberField
SelectField
Toggle
EmptyState
ErrorState
SkinSelector
SkinPreviewCard
```

Replace repeated screen-local generic controls after shared replacements are tested.

### P1-7 CSS responsibility split

Split the large mixed stylesheet by responsibility:

```text
styles/foundations
components/*
layouts/*
screens/*
motion/*
```

Keep shared component style, screen layout, and motion ownership separate.

Use cascade layers to prevent skin presentation from modifying layout.

### P1-8 CI/toolchain hardening

Add or confirm:

```text
packageManager declaration
Node engine/version policy
format/lint decision
skin:validate in CI
component tests in CI
visual regression policy
```

Do not claim CI passed when no workflow run is available. Local command results and CI results must be reported separately.

## P2 — Required before installed or paid skins

### P2-1 Trust-level file policy

```text
official reviewed skin: approved SVG may be allowed
external/paid skin: PNG/WebP only by default
```

Do not load arbitrary external SVG without a proven sanitization pipeline.

External skins never include executable CSS, JS, HTML, remote URLs, or external fonts.

### P2-2 Versioned and atomic asset switching

Required:

```text
asset URL includes version/content hash
preload required visible assets
apply tokens and assets atomically
keep previous skin on load failure
show actionable issue state
avoid flash of mixed skins
```

### P2-3 Installed-skin integrity and entitlement boundary

Before sales/distribution, define:

```text
package identity
contract version
content hash/signature strategy
ownership/source metadata
installation status
entitlement boundary
upgrade and rollback
uninstall behavior
```

Skins never gain engine, storage, records, payment, or network execution privileges.

### P2-4 Complete match-record idempotency

Before match restore/replay/resend features:

```text
create persistent matchSessionId with crypto.randomUUID or equivalent
store recent processed match IDs, not only the last key
make recording builders pure by injecting timestamp/ID
keep migration backward compatible
```

The current seed-based key and single last key are acceptable only for the current non-restorable local match flow.

## Token-source ownership

Avoid manual three-way drift between:

```text
src fallback tokens
base skin tokens
yorunoshirube tokens
```

Choose one:

```text
generate all derived token files from one source
or add exact synchronization tests
```

The bundled fallback should be the smallest safe visual fallback, not an accidental duplicate source of product identity.

## New feature gate

Every new screen, button, state, or reusable visual responsibility must follow:

```text
1. reuse an existing shared component
2. add a reusable central variant/component if needed
3. add semantic/component tokens
4. add a slot only for a genuinely new visual responsibility
5. define geometry/render/fallback contract
6. support base + yorunoshirube + cute-pop
7. add Gallery coverage
8. add component/visual tests
9. verify required sizes
10. integrate into the screen
```

A new feature is not complete when it works in only one skin.

## Implementation order

Use small commits in this order:

```text
H1 token allowlist and typed validation
H2 contract CLI and CI integration
H3 semantic contrast and Cute Pop corrections
H4 SkinSelector and Gallery switch
H5 layered SkinSurface and nine-slice proof
H6 render-mode completion where proven necessary
H7 shared component and CSS responsibility migration
H8 DOM/accessibility/recovery tests and fixes
H9 Playwright visual regression and five-size QA
H10 external/paid skin security and atomic loading
H11 complete match-record idempotency before restore/replay
```

Do not combine all items into one commit.

## Completion gate before image production

All must pass:

```text
P0 items complete
pnpm typecheck
pnpm test
pnpm build
pnpm skin:validate
both official skins selectable without reload
state preserved through switch
Cute Pop and Yorunoshirube contrast accepted
nine-slice proof accepted at five sizes
no final image generated directly
asset generation requests point to candidates first
image-generated assets follow docs/IMAGE-ASSET-WORKFLOW.md
```

## Reporting

Every implementation report includes:

```text
changed files
commit SHA
commands run
local pass/fail
CI pass/fail or not available
affected skins and screens
manual/visual proof
remaining risk
next hardening item
```
