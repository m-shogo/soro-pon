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
Multi-skin runtime baseline: complete
Skin-foundation hardening H1-H11: complete (docs/SKIN-FOUNDATION-HARDENING.md)
Image production pipeline: ready and proven; request 007 (cute-pop /
  badge.info.background) closed; 3 final assets exist on cute-pop, 0 on
  yorunoshirube
Active work: official asset production — see docs/ASSET-PRODUCTION-ROADMAP.md
  for slot classification, batches, and the single next task
Release/demo gates: docs/RELEASE-DEMO-GATES.md — Gate 3 (Skin Foundation
  Image-ready) is satisfied; Gates 4+ depend on asset-production batches
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

## Completed Hardening (H1-H11)

All 11 items are complete. Full requirement lists, documented exceptions,
and future-scope callouts live in `docs/SKIN-FOUNDATION-HARDENING.md`
(P0/P1/P2 sections) — this section is a status summary only.

### H1 — Token allowlist and typed validation

Status: **complete**. Explicit skinable token registry with structural
vs skinable separation and per-token type/range validation in place.
External skins cannot override spacing/font-size/line-height/z-index/
touch/layout/pointer behavior.

### H2 — Contract validator and CI

Status: **complete**. `pnpm skin:validate` (`vitest run
src/ui/skins/skinValidate.test.ts`) validates files, bytes, dimensions,
slice/safe-area geometry, trust-level file type, render-mode permission,
status/path consistency, and all official packages.

### H3 — Semantic contrast

Status: **complete**. Semantic text tokens, Cute Pop CTA correction, focus
contrast correction, and category foreground selection implemented.

### H4 — Skin selection

Status: **complete**. `SkinSelector`/`SkinPreviewCard` work in Component
Gallery and the normal user-facing flow, with loading/failure/default
states, no reload, and no match/editor/UI state loss.

### H5 — Layered SkinSurface and nine-slice proof

Status: **complete**. `panel.paper.default` and `button.primary.background`
proofs accepted at five sizes with separated source slice / rendered
border width.

### H6 — Central render-mode completion

Status: **complete with documented policy**. Policy is "implement an
additional render mode only when a real slot proves it necessary" — this
is not "implement every candidate mode unconditionally." No screen-local
render-mode implementations exist. Re-open only if a specific asset
requires a mode not yet supported.

### H7 — Shared component and CSS responsibility migration

Status: **complete**. `IconButton`, `Dialog`, `SectionHeader`,
`ValidationIssueList`, form fields, `EmptyState`/`ErrorState`,
`SkinSelector`/`SkinPreviewCard` are shared components. CSS is split into
foundations/components/layouts/screens/motion with cascade-layer
protection.

### H8 — DOM/accessibility/recovery

Status: **complete**. Component/interaction test environment, Modal focus
trap/return, Tabs keyboard model, Tile selected/emphasis ARIA,
`AppErrorBoundary`, recoverable `ErrorState`, missing-entity fallback,
visible local-data reset, and skin-driven browser color scheme are all
implemented.

### H9 — Visual regression and five-size QA

Status: **complete**. Playwright visual regression is implemented:
32 test cases total (30 screenshot cases across TOP/Gallery/MatchSetup x
2 skins x 5 sizes, plus 2 non-screenshot skin-asset-ready assertions) in
`tests/visual/`. Additional screens can be added to the matrix as asset
production reaches them (see docs/ASSET-PRODUCTION-ROADMAP.md batches).

### H10 — Installed/paid skin hardening

Status: **complete for engineering scope; marketplace/commerce remains
future scope**. Versioned/content-hashed asset URLs, preload, atomic
switching, and failure fallback (previous skin retained) are implemented.
Package identity/integrity/upgrade/rollback/uninstall design is documented
in `docs/SKIN-DISTRIBUTION.md`. Actual marketplace, payment, and
entitlement systems are not built and remain future scope — H10 is about
the loading/security mechanism, which is done.

### H11 — Match recording idempotency

Status: **complete for engineering scope; restore/replay feature is
non-MVP**. Persistent `matchSessionId`, recent-processed-ID tracking, a
pure recording builder with injected timestamp/ID, and backward-compatible
storage migration are implemented. The match restore/replay/resend
*feature* itself is out of current MVP scope (docs/MASTER-SPEC.md
"Not current MVP") — H11 exists so that feature can be built safely later,
not to ship it now.

## Image Production — Active

H1-H11 and all P0 gates are complete. Asset production is the current
phase.

```text
Codex CLI起点で画像を生成する
-> skins/<id>/generated/candidates
-> preview and screenshot review
-> human approval
-> generated/final
-> manifest update (skin.json + version bump)
```

Never generate directly into `final`. First proof-of-concept cycle
(request 007, cute-pop / badge.info.background) is closed — candidate B
promoted, A/C not-selected. Full slot classification, batch order, and the
current single next task: `docs/ASSET-PRODUCTION-ROADMAP.md`.

R1 (request 008/009: cute-pop tile.face.base / tile.back.base /
button.primary.background) is **closed** (2026-07-16). Round 1 candidates
(A/B/C) were rejected by human review (CSS-reproducible designs); round 2
candidates (D/E/F) were approved — tile.face.base: D, tile.back.base: E,
button.primary.background: D — and promoted to final, registered in
cute-pop/skin.json v4, and verified in production consumers. Decision
record and evidence: `docs/asset-requests/R1-APPROVAL-PACK.md`. Cute Pop
now has 6 of 21 contract slots final. Tile state slots (selected/ron/tsumo)
are composited over the base face per ADR-015 — do not generate separate
full-face art for them.

Batch 2 (request 010/011: cute-pop table.background / panel.modal.background
/ panel.result.frame) is **closed** (2026-07-16). Human review approved
table.background: A, panel.modal.background: B, panel.result.frame: B
(candidate A for panel.result.frame was rejected on technical grounds — a
9-slice stretch artifact under tall content, confirmed by the reviewer —
not preference). All three are promoted to final, registered in
cute-pop/skin.json (version 4 -> 5), and verified in production consumers
(GameTableLayout, Modal, ResultFrame) across 5 viewports plus real
modal/result content. A shared art direction
(`docs/asset-requests/BATCH-2-ART-DIRECTION.md`) governed all 3 slots as
one material family. Decision record and promotion evidence:
`docs/asset-requests/BATCH-2-APPROVAL-PACK.md`. Cute Pop now has 9 of 21
contract slots final — all 6 A-class slots targeted by Batch 1+2 are done.
Next fixed task: Batch 3 (Yorunoshirube core) — named, not started; see
`docs/ASSET-PRODUCTION-ROADMAP.md`.

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

### Before image production — passed

```text
all P0 items complete
typecheck/test/build/skin:validate green
both skins selectable without reload
state preserved through switch
contrast accepted
real nine-slice proof accepted
candidate-first workflow ready (proven via request 007)
```

### Before public demo — in progress (asset production, see docs/ASSET-PRODUCTION-ROADMAP.md)

```text
all applicable P1 items complete            done
component/DOM tests green                   done
visual regression accepted                  done for current 3-screen matrix; extends as new screens get final assets
accessibility/recovery/reset path accepted  done
release/demo checklist passed               pending — most slots still placeholder (see roadmap)
```

### Before installed/paid skins

```text
all P2 skin-distribution items complete     done (engineering scope; commerce is future scope)
trust-level policy enforced                 done
atomic/versioned loading accepted           done
integrity and lifecycle rules documented/tested  documented in docs/SKIN-DISTRIBUTION.md; marketplace/payment implementation is future scope
```

## Known Pending Areas

```text
extendedRoleSpan remains pending and blocked by E7008 (non-MVP, unchanged)
skin hardening H1-H11: complete (see above) — no longer pending
official skin final images: 9 of 21 contract slots done (all on cute-pop;
  Batch 1+2 closed 2026-07-16, all 6 A-class cute-pop slots final); 0 on
  yorunoshirube — see docs/ASSET-PRODUCTION-ROADMAP.md for batch plan
  (next: Batch 3, yorunoshirube core)
candidate/final validation: implemented and proven (request 007 closed);
  ongoing per-batch use is expected, not "unfinished"
match restore/replay/resend feature: non-MVP; H11 idempotency groundwork
  for it is complete but the feature itself is not built
```

## Work Rule

```text
one H item at a time
one purpose per commit
relevant tests and docs in the same change
commit and push before moving on
report local results separately from CI status
```
