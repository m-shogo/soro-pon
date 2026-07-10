# Soro-pon Implementation Workflow

## Purpose

This file tracks the real repository state, completed phases, current next work, and completion gates.

```text
Product/spec truth: docs/MASTER-SPEC.md
Implementation guide: docs/IMPLEMENTATION.md
```

## Current Status

```text
Gameplay MVP phases 1-14: complete
Multi-skin foundation: in progress; core package/runtime baseline already implemented
Final PNG/WebP production: not started
Release/demo gates: after skin foundation and reviewed assets
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

## Multi-skin Foundation — Actual Repository State

### SF1 — Design Audit and Skin Contract

Status: **baseline complete**

Present:

```text
docs/SKIN-SYSTEM.md
public/assets/ui/soro-pon/SKIN-MANIFEST.json
public/assets/ui/soro-pon/SKIN-CONTRACT.json
```

Registered official packages:

```text
base
yorunoshirube
cute-pop
```

### SF2 — Package Loading, Validation, Inheritance and Fallback

Status: **baseline implemented**

Present under `src/ui/skins/`:

```text
skinTypes
skinRegistry
validateSkinManifest
parseSkinTokens
resolveSkin
getSkinAssetUrl
```

Existing tests cover the core skin/package path.

### SF3 — Runtime Skin Switching

Status: **implemented baseline**

Present:

```text
SkinProvider
useSkin
skinDom/apply tokens
localStorage selection/recovery
no-reload asynchronous switching
stale-request protection
```

`App.tsx` already wraps the application with `SkinProvider`.

### SF4 — Initial Shared Skin Rendering

Status: **partially complete**

Current `SkinSurface` baseline supports:

```text
cover
contain
stretch
repeat
nine-slice stretch
overlay
```

Core components already reference skin slots.

Remaining renderer contract:

```text
nine-slice tile
three-slice-x
three-slice-y
repeat-x / repeat-y
mask/tint renderer
separate source slice from rendered borderWidth
candidate asset status/path validation
```

### SF5 — Token Migration

Status: **started / partial**

Already present:

```text
base skin tokens
yorunoshirube tokens
cute-pop tokens
several previous hardcoded values moved to tokens
```

Still required:

```text
Primitive -> Semantic -> Component token structure
cascade-layer enforcement
remaining visual hardcode audit
layout-token vs skin-token enforcement
approved external-skin token allowlist alignment
```

### SF6 — Shared Component Migration

Status: **pending / partial**

Core `Button`, `PaperPanel`, `TileCard`, `Badge`, and table assets are connected to the skin resolver.

Still required:

```text
IconButton
Dialog abstraction for repeated confirmations
ValidationIssueList
SectionHeader
shared form fields
EmptyState / ErrorState
SkinSelector / SkinPreviewCard
state overlay normalization
remove remaining screen-local generic UI
```

### SF7 — Component Gallery and User-facing Skin Selection

Status: **pending**

Current Gallery does not yet provide the required instant skin selector or the full expanded state/long-text matrix.

Required:

```text
yorunoshirube / cute-pop switch in Gallery
all shared states and variants
long Japanese/English/score/emoji cases
compact and regular density
five review sizes
```

A normal user-facing skin selection path must also be defined before completion.

### SF8 — Skin Validator Command and Regression

Status: **pending**

Core validation functions/tests exist, but `package.json` does not yet expose:

```bash
pnpm skin:validate
```

Still required:

```text
filesystem package validation command
file existence/byte/dimension checks
slice and safe-area checks
candidate/final path checks
visual screenshot regression decision and implementation
```

### SF9 — Full Screen Migration and Foundation Completion

Status: **pending**

Completion gate:

```text
all existing screens use shared components/tokens/skin resolver
skin switch preserves gameplay/editor state
both official skins usable without final artwork
all tests/typecheck/build green
manual five-size QA updated
future image requests/prompts complete
```

## Official Design Direction

```text
yorunoshirube
- night desk / paper / black ink / lantern light / memory book

cute-pop
- bright / cute / friendly / pop / readable category colors
```

Both use the same screen, DOM responsibility, layout, hit areas, state meaning, and game logic.

## Image Production — Later Separate Phase

No final artwork is produced during the foundation.

Before production, create candidate directories and validation.

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

Required before SF8 completion:

```bash
pnpm skin:validate
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

## Known Pending Areas

```text
extendedRoleSpan remains pending and blocked by E7008
multi-skin foundation back half remains unfinished
final official skin images are all placeholder/null
candidate directories and candidate status are not fully implemented
Playwright screenshot regression is not yet implemented
release/demo gates remain pending
```

## Standing Rules

```text
one purpose per commit
push after commit
docs and implementation together
no rule/scoring logic in UI
no UI dependencies in engine
no skin-specific screen copies
no final image generation during foundation
```

## Final Completion Definition

```text
gameplay stays green
skin switching does not mutate app state
shared components replace generic screen-local UI
all official packages and files validate
both official skins work without final images
five-size visual QA passes
reviewed candidate assets later integrate through slots only
release/demo gates pass
```