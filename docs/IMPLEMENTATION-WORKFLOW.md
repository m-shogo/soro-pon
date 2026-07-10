# Soro-pon Implementation Workflow

## Purpose

This file tracks the real implementation state, completed phases, current next work, and completion gates.

Implementation guidance:

```text
docs/IMPLEMENTATION.md
```

Product/spec truth:

```text
docs/MASTER-SPEC.md
```

## Current Status

```text
Gameplay MVP phases 1-14: complete
Current next phase: Soro-pon multi-skin design-system foundation
Final image generation: not started and intentionally separate
Release/demo gates: after skin foundation and reviewed final assets
```

## Completed Phases

| Phase | Scope | Status | Representative commit |
|---|---|---|---|
| 1 | package setup | complete | `3a50861` |
| 2 | domain types + strict Zod schemas | complete | `0a64f59` |
| 3 | strict import + validation + fixtures | complete | `4663167` |
| 4 | group engine + wildcard partition | complete | `cd2d7db` |
| 5 | role analysis + waits + ranking | complete | `caca9cd` |
| 6 | tsumo/ron scoring + breakdown | complete | `1ad7dec` |
| 7 | insights + pure discard preview | complete | `4eea582` |
| 8 | match reducer + CPU + seeded RNG | complete | `1efe9fd` |
| 9 | localStorage parsing/recovery | complete | `8aa22c7` |
| 10 | UI foundation + asset slots + Component Gallery | complete | `452b54f` |
| 11 | main screens and playable flow | complete | `5645471` |
| 12 | Collection/editor expansion/asset requests/manual QA | complete | `9e1b244` |
| 13 | achievements/titles/bonus editor/specificSet/motion | complete | `6c5c858` |
| 14 | hardening: idempotent records, seed collision, specificSet feasibility, rapid-action tests | complete | `5f44ff4` |

## Phase 14 Hardening Summary

Implemented and verified:

```text
storage-level matchKey idempotency
newSeed collision protection
old records payload normalization
specificSet duplicate-tile feasibility fix
pure editor template builders
rapid double-dispatch reducer tests
engine independence from achievements/coins/records
asset-slot-only image contract retained
```

Last recorded verification:

```text
218 tests green
typecheck green
build green
browser flow and reload/idempotency QA passed
```

## Current Design Direction

Official skins:

```text
yorunoshirube
cute-pop
```

Current contract:

```text
one screen/component/layout implementation
multiple validated skins
no skin-specific screens
layout and hit areas are skin-invariant
shared reusable components
Unity/Godot-style nine-slice through shared SkinSurface
future paid skins are data/assets only, never code
```

Mandatory docs:

```text
docs/DESIGN-SYSTEM.md
docs/SKIN-SYSTEM.md
docs/UI-COMPONENT-CONTRACT.md
docs/SKIN-AUTHORING-GUIDE.md
docs/DESIGN-IMPLEMENTATION-POLICY.md
docs/ASSET-PIPELINE.md
```

## Next Work: Skin Foundation S0-S9

### S0 — Audit and Baseline

```text
capture current screenshots
inventory hardcoded visual values
inventory duplicated generic UI
record test/typecheck/build baseline
```

### S1 — Skin Contract and Packages

```text
base/yorunoshirube/cute-pop package structure
SKIN-MANIFEST and SKIN-CONTRACT
strict schema/version/inheritance/fallback
```

### S2 — Runtime Switching

```text
SkinProvider/useSkin/registry
no-reload switching
local selection and safe recovery
state-preservation tests
```

### S3 — Shared Skin Renderers

```text
SkinSurface
SkinBackground
SkinOverlay
SkinIcon
```

Supported modes:

```text
nine-slice-stretch
nine-slice-tile
three-slice-x
three-slice-y
stretch
repeat / repeat-x / repeat-y
cover
contain
overlay
mask
```

### S4 — Token Migration

```text
Primitive -> Semantic -> Component tokens
CSS cascade layers
remove remaining screen visual hardcoding
approved font presets
```

### S5 — Shared Component Migration

Priority:

```text
Button/IconButton
Dialog/Modal
PaperPanel/SkinSurface
ValidationIssueList
SectionHeader
shared form fields
Empty/Error states
Tile state overlays
SkinSelector/SkinPreviewCard
```

### S6 — Component Gallery and Preview

```text
instant official-skin switch
all common variants/states
long-text cases
compact and regular density
five review sizes
```

### S7 — Screen Migration

Connect all screens to shared components/tokens/skins without changing gameplay behavior.

### S8 — Validator and Regression

```text
pnpm skin:validate
strict manifest/slot/token/path/version tests
both official packages validate
visual screenshot regression when approved
```

### S9 — Foundation Completion

```text
both official skins usable with CSS/SVG fallback
all tests/typecheck/build green
no final PNG generation
future image slots/prompts/requests complete
manual QA updated
```

## Image Production — Later Separate Phase

Image generation is intentionally after S0-S9.

```text
generate/draw
-> skins/<id>/generated/candidates
-> preview and screenshot review
-> human approval
-> generated/final
-> manifest update
```

Do not generate directly into `final`.

## Release Phase — After Assets

```text
reviewed final skin assets
RELEASE-DEMO-GATES
README limitations/reset path
manual QA on target devices
production screenshots
```

## Verification Commands

```bash
pnpm typecheck
pnpm test
pnpm build
pnpm skin:validate
```

Use only scripts that exist in the current repository; add `skin:validate` during S8.

## Required Review Sizes

```text
844x390
852x393
932x430
1024x600
1366x768
```

Minimum visual matrix:

```text
all screens: 844x390
major screens: all five sizes
Component Gallery: both official skins
TOP / Deck Editor / Match / Result / Collection: both official skins
```

## Known Pending Areas

```text
extendedRoleSpan engine remains pending and blocked by E7008
final Yorunoshirube/Cute Pop PNG assets are not produced
Playwright screenshot automation is not yet guaranteed
release/demo gates remain after skin foundation/assets
```

## Standing Rules

```text
one commit per purpose
push after commit
docs and implementation updated together
no game-rule logic in UI
no UI/React/storage dependencies in engine
no image paths or generic visual components duplicated in screens
no image generation during foundation
```

## Final Completion Definition

```text
gameplay flow remains green
skin switch does not alter game/editor state
both official skins work without final images
shared components replace generic screen-local UI
all skin manifests validate
five-size visual QA passes
reviewed assets are integrated through slots only
release/demo gates pass
```