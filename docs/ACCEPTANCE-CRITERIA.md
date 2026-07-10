# Acceptance Criteria

## Purpose

This document defines when gameplay, skin foundation, public demo, and future installed-skin work are complete.

Do not call a phase done because code exists or the UI looks good.

## Gameplay MVP

Gameplay phases 1-14 are implemented. Their continuing acceptance gates remain:

```text
strict schema/import boundaries
valid group-backed win evaluation
explainable scoring
seeded deterministic engine behavior
invalid reducer actions preserve state
localStorage parse/recovery
record/achievement immediate duplicate prevention
animal starter playable in 3-player and 4-player modes
```

Any UI or skin refactor must keep all gameplay tests green.

## Skin Foundation Baseline

Baseline exists when:

```text
base / yorunoshirube / cute-pop packages exist
registry/manifest/contract parse strictly
inheritance and fallback work
SkinProvider switches without reload
basic SkinSurface works
core components use skin slots
both official skins work without final images
```

Current status: implemented / partial.

This baseline is not the final skin-foundation acceptance gate.

## H1: Token Boundary Ready

Complete when:

```text
explicit skinable token registry exists
structural and presentation tokens are separate
unknown tokens reject
external skins cannot override spacing/font size/line height/z-index/touch/layout/pointer behavior
per-token type and range tests pass
```

## H2: Skin Contract Validator Ready

Complete when:

```text
pnpm skin:validate exists
all official packages validate
files/bytes/dimensions validate
slice/safe area/minimum render geometry validates
trust-level file policy validates
status/file/candidate/final rules validate
CI runs skin:validate
```

## H3: Semantic Contrast Ready

Complete when:

```text
on-primary/on-surface/on-category/focus tokens exist
Cute Pop primary CTA contrast accepted
focus visible on light and dark surfaces
category foreground selection works
warning/info/success do not rely only on color
official-token tests and manual review pass
```

## H4: Skin Selection Ready

Complete when:

```text
shared SkinSelector and SkinPreviewCard exist
Gallery can switch official skins instantly
normal user path can switch official skins
loading/failure/default states exist
unknown/corrupt selection recovers
switch requires no reload
match/editor/screen/UI state remains unchanged
```

## H5: Skin Surface / Nine-slice Ready

Complete when:

```text
skin layer is separated from content/state/focus layers
opacity/blend never fades content or hit areas
source slice and rendered border width are separate
minimum render size is enforced
panel.paper.default proof accepted
button.primary.background proof accepted
long/two-line/min/max/focus/disabled cases pass
five-size review passes
```

This is the final technical gate before broad image generation.

## H6: Renderer Contract Ready

Complete when every enabled mode:

```text
is centralized
has schema/contract support
has tests
has Gallery example
has fallback
is not reimplemented in a screen
```

Do not implement unused modes solely to claim completeness.

## H7: Shared UI System Ready

Complete when:

```text
repeated generic UI uses shared components
required Dialog/Form/Error/Skin components exist
state overlays are normalized
large mixed CSS responsibilities are split
cascade layers protect layout from skin overrides
new-feature gate is documented and followed
```

## H8: Interaction / Accessibility / Recovery Ready

Complete when:

```text
DOM/component test environment exists
Modal focus entry/trap/return works
Tabs keyboard model works
Tile selected/emphasis state is accessible
AppErrorBoundary exists
recoverable ErrorState replaces blank screens
visible reset path and confirmation work
active skin updates browser color scheme
```

## H9: Visual Regression Ready

Complete when:

```text
browser flow tests cover critical paths
all screens reviewed at 844x390
major screens reviewed at all five sizes
Component Gallery covered in both official skins
visual baselines are deterministic and reviewed
manual QA report is current
```

## Image Production Ready

Complete only when all P0 items in `docs/SKIN-FOUNDATION-HARDENING.md` pass:

```text
typecheck green
tests green
build green
skin:validate green
both skins switch without state loss
contrast accepted
real nine-slice proof accepted
candidate-first asset workflow ready
```

No broad/final image generation before this gate.

## Public Demo Ready

Complete when:

```text
all applicable P1 items complete
CI and build pass
component/DOM tests pass
visual regression accepted
manual QA passes target browsers/sizes
ErrorBoundary/ErrorState/reset path work
skin failure cannot brick app
README limitations are current
no existing IP/remote user-deck image risk
```

## Installed / Paid Skin Ready

Complete when:

```text
external trust-level file policy enforced
arbitrary CSS/JS/HTML/URL/font/SVG execution blocked
asset URL versioning/content hash exists
required assets preload and switch atomically
previous skin remains on failure
package identity/integrity/version/upgrade/rollback/uninstall defined
skin has no engine/storage/records/network execution privilege
```

## Match Restore / Replay Ready

Before restore/replay/resend features:

```text
persistent matchSessionId exists
recent processed IDs prevent non-adjacent duplicates
recording builder receives timestamp/ID explicitly
storage migration is backward compatible
tests cover A -> B -> duplicate A
```

## Definition Of Done For Any Task

A task is complete only when its report includes:

```text
changed files
commit SHA
commands run
local pass/fail
CI status or unavailable
affected skins/screens
visual/manual proof where relevant
remaining risk
next hardening item
```

## Final Decision

Completion means verified behavior across rules, state, both skins, accessibility, recovery, and required viewports—not merely written code.
