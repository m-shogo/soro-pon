# Soro-pon Implementation Workflow

## Purpose

This file tracks the real repository state, completed phases, active work, and completion gates.

```text
Product/spec truth: docs/MASTER-SPEC.md
Implementation guide: docs/IMPLEMENTATION.md
Active hardening plan: docs/SKIN-FOUNDATION-HARDENING.md
```

## Current Status

```text
Gameplay MVP phases 1-14: complete
Multi-skin runtime baseline: implemented / partial
Active work: H1 -> H11 skin-foundation hardening
Final PNG/WebP production: blocked until all P0 gates pass
Release/demo gates: after P0/P1 completion and reviewed assets where required
```

## Completed Gameplay Phases

| Phase | Scope | Status | Representative commit |
|---|---|---|---|
| 1 | package setup | complete | `3a50861` |
| 2 | domain types + strict schemas | complete | `0a64f59` |
| 3 | strict import + validation + fixtures | complete | `4663167` |
| 4 | group engine + wildcard partition | complete | `cd2d7db` |
| 5 | role analysis + waits + ranking | complete | `caca9cd` |
| 6 | tsumo/ron scoring + breakdown | complete | `1ad7dec` |
| 7 | insights + pure discard preview | complete | `4eea582` |
| 8 | match reducer + CPU + seeded RNG | complete | `1efe9fd` |
| 9 | localStorage parsing/recovery | complete | `8aa22c7` |
| 10 | first UI foundation + asset slots + Gallery | complete | `452b54f` |
| 11 | main screens and playable flow | complete | `5645471` |
| 12 | Collection/editor expansion/asset requests/manual QA | complete | `9e1b244` |
| 13 | achievements/titles/bonus editor/specificSet/motion | complete | `6c5c858` |
| 14 | record/seed/specificSet/reducer hardening | complete | `5f44ff4` |

Last recorded gameplay hardening:

```text
218 tests green
typecheck green
build green
browser flow and reload/idempotency QA passed
```

Later skin work added additional tests, but every implementation report must state its own exact current count and commands.

## Existing Multi-skin Baseline

Present:

```text
docs/DESIGN-SYSTEM.md
docs/SKIN-SYSTEM.md
docs/SKIN-AUTHORING-GUIDE.md
docs/UI-COMPONENT-CONTRACT.md
public/assets/ui/soro-pon/SKIN-MANIFEST.json
public/assets/ui/soro-pon/SKIN-CONTRACT.json
public/assets/ui/soro-pon/skins/base
public/assets/ui/soro-pon/skins/yorunoshirube
public/assets/ui/soro-pon/skins/cute-pop
src/ui/skins/*
SkinProvider runtime switching
basic SkinSurface
initial shared component slot integration
core/package skin tests
```

This baseline must be preserved and hardened, not replaced.

## Active Workflow

### H1 — Token allowlist and typed validation

Status: **next / not complete**

Required:

```text
explicit skinable token registry
structural vs skinable separation
per-token type/range validation
external skins cannot override spacing/font-size/line-height/z-index/touch/layout/pointer behavior
```

### H2 — Contract validator and CI

Status: **pending**

Required:

```bash
pnpm skin:validate
```

Must validate actual files, bytes, dimensions, slice/safe-area geometry, trust-level file type, render-mode permission, status/path consistency, and all official packages.

### H3 — Semantic contrast

Status: **pending**

Required:

```text
on-primary/on-surface/on-category semantic text tokens
Cute Pop CTA correction
focus contrast correction
category foreground selection
contrast validation where practical
```

### H4 — Skin selection

Status: **pending**

Required:

```text
SkinSelector
SkinPreviewCard
Gallery instant switch
normal user-facing switch
loading/failure/default states
no reload
no match/editor/UI state loss
```

### H5 — Layered SkinSurface and nine-slice proof

Status: **pending**

Required:

```text
skin image and opacity never affect content
separate source slice and rendered border width
panel.paper.default proof
button.primary.background proof
five-size and long-text verification
```

### H6 — Central render-mode completion

Status: **pending / only as proven necessary**

Candidate modes:

```text
repeat-x / repeat-y
nine-slice-tile
three-slice-x / three-slice-y
mask/tint
```

No screen-local implementations.

### H7 — Shared component and CSS responsibility migration

Status: **partial / pending**

Required shared components:

```text
IconButton
Dialog
SectionHeader
ValidationIssueList
FormField/TextField/NumberField/SelectField/Toggle
EmptyState/ErrorState
SkinSelector/SkinPreviewCard
```

Split mixed CSS into foundations/components/layouts/screens/motion with cascade-layer protection.

### H8 — DOM/accessibility/recovery

Status: **pending**

Required:

```text
component/interaction test environment
Modal focus trap and return
Tabs keyboard model
Tile selected/emphasis ARIA
AppErrorBoundary
recoverable ErrorState
missing entity fallback
visible local-data reset
skin-driven browser color scheme
```

### H9 — Visual regression and five-size QA

Status: **pending**

Required after ADR/dependency decision:

```text
Playwright user flows
both official skins
all screens at 844x390
major screens at five sizes
stable screenshot baselines
```

### H10 — Installed/paid skin hardening

Status: **future / required before distribution**

```text
external PNG/WebP-only default
official reviewed SVG policy
versioned or content-hashed asset URLs
preload and atomic switching
package identity/integrity/upgrade/rollback/uninstall
no execution privileges
```

### H11 — Match recording idempotency

Status: **future / required before match restore, replay, or resend**

```text
persistent matchSessionId
recent processed ID set
pure recording builder with injected timestamp/ID
backward-compatible storage migration
```

## Image Production — Separate Later Phase

Do not generate final images during H1-H9.

After every P0 gate in `SKIN-FOUNDATION-HARDENING.md` passes and the user explicitly starts asset production:

```text
generate/draw
-> skins/<id>/generated/candidates
-> preview and screenshot review
-> human approval
-> generated/final
-> manifest update
```

Never generate directly into `final`.

## Verification Commands

Currently available:

```bash
pnpm typecheck
pnpm test
pnpm build
```

Required after H2:

```bash
pnpm skin:validate
```

Required after H8/H9 according to ADR:

```text
component/DOM tests
Playwright flow and screenshot tests
```

## Review Sizes

```text
844x390
852x393
932x430
1024x600
1366x768
```

Minimum matrix:

```text
all screens: 844x390
major screens: all five sizes
Component Gallery: both official skins
TOP / Deck Editor / Match / Result / Collection: both official skins
```

## Completion Gates

### Before image production

```text
all P0 items complete
typecheck/test/build/skin:validate green
both skins selectable without reload
state preserved through switch
contrast accepted
real nine-slice proof accepted
candidate-first workflow ready
```

### Before public demo

```text
all applicable P1 items complete
component/DOM tests green
visual regression accepted
accessibility/recovery/reset path accepted
release/demo checklist passed
```

### Before installed/paid skins

```text
all P2 skin-distribution items complete
trust-level policy enforced
atomic/versioned loading accepted
integrity and lifecycle rules documented/tested
```

## Known Pending Areas

```text
extendedRoleSpan remains pending and blocked by E7008
skin hardening H1-H10 remains unfinished
final official skin images remain placeholder/null
candidate/final validation is unfinished
complete match-record idempotency is required before restore/replay
```

## Work Rule

```text
one H item at a time
one purpose per commit
relevant tests and docs in the same change
commit and push before moving on
report local results separately from CI status
```
