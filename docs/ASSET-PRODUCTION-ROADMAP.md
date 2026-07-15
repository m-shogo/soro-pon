# Asset Production Roadmap

## Purpose

This is the canonical doc for: full asset-slot classification, production batch
order with completion gates, the three completion tiers, progress/timeline
estimates, and the single next asset-production task.

It does not own operational process detail — that stays in:

```text
docs/ASSET-PIPELINE.md        candidate/final operational process (slot contract, formats, budgets)
docs/IMAGE-ASSET-WORKFLOW.md  Codex CLI generation / chroma-key / audit execution contract
docs/SKIN-DISTRIBUTION.md     post-final version/hash/distribution contract
```

Read those first if you are about to run a generation command. This doc tells
you **which slot to work on next and why**, not **how to run the pipeline**.

## Ground truth as of this roadmap (verified from code, not docs)

```text
public/assets/ui/soro-pon/SKIN-CONTRACT.json: 21 slots total
Runtime resolver: getSkinAssetUrl() / useSkinAsset() / SkinLayer (src/ui/skins/)
All 21 slots are declared; 18 are wired into a component; 3 are dead
  (effect.result.burst, effect.wildcard.glow, effect.score.pop have zero
  component references in src/ as of this audit)
Cute Pop final assets: 3 (button.secondary.background, panel.paper.default,
  badge.info.background) — version 3
Yorunoshirube final assets: 0 — version 1, slots: {} (CSS/token fallback only)
button.primary.background (the main CTA) is still placeholder on BOTH skins
Playwright visual regression: tests/visual/skin-screens.spec.ts (30 screenshot
  cases: 3 screens x 2 skins x 5 sizes) + tests/visual/skinAssetReady.spec.ts
  (2 non-screenshot assertions) = 32 total test cases
```

## Slot classification table

Classification buckets:

```text
A. final image required (defines product identity, fallback insufficient)
B. fallback/deterministic generation sufficient
C. shared overlay (not a full duplicated face image)
D. defer / not needed for current MVP (reason + re-evaluation condition required)
```

Generation method is one of: Codex CLI image generation / deterministic
Python-SDF / CSS-token / shared overlay / existing final / defer.

| Slot | Runtime usage | Cute Pop class | Yorunoshirube class | Generation method | Priority | Current status | Reason |
|---|---|---|---|---|---|---|---|
| table.background | `GameTableLayout` -> MatchScreen (cover) | A | A | Codex CLI | High | placeholder (both) | Table atmosphere is core to both skins' identity; CSS gradient reads as unfinished for demo tier 1/2 |
| table.overlay.ink | `GameTableLayout` -> MatchScreen (overlay, 0.5) | D | B | CSS-token (yoru) / defer (cute-pop) | Low | placeholder (both) | Ink texture is yorunoshirube-specific lore (黒インク); cute-pop's bright/pop language has no ink motif. Re-eval cute-pop only if art direction adds a paper-ink accent |
| table.overlay.light | `GameTableLayout` -> MatchScreen (overlay, 0.6) | D | B | CSS-token (yoru) / defer (cute-pop) | Low | placeholder (both) | Lantern-light overlay is yorunoshirube lore (ランタン光); CSS radial-gradient is sufficient until batch 4 decoration pass. Re-eval cute-pop if a light/glow accent is added to its palette |
| panel.paper.default | `PaperPanel` (default) -> most screens, Gallery | existing final | A | existing final (cute-pop) / Codex CLI (yoru) | High (yoru) | final v3 (cute-pop) / placeholder (yoru) | Cute Pop already done (request 006). Yorunoshirube's paper panel is central to its "night desk / memory book" identity |
| panel.paper.emphasis | `PaperPanel` (selected variant) -> same consumers | C | C | shared overlay | Medium | placeholder (both) | This is a tint/emphasis variant of panel.paper.default, not a distinct surface. A shared highlight overlay avoids a second full nine-slice asset per skin |
| panel.modal.background | `Modal.tsx` -> `Dialog`, `AppRoot`, `TopScreen`, Gallery | A | A | Codex CLI | Medium-High | placeholder (both) | High-frequency surface (every dialog/modal); fallback token panel is functional but reads generic in a finished demo |
| panel.result.frame | `ResultFrame.tsx` -> `ResultScreen` | A | A | Codex CLI | High (cute-pop) | placeholder (both) | Result screen visual completeness is an explicit tier-1 requirement |
| button.primary.background | `Button.tsx` -> nearly every screen (main CTA) | A | A | Codex CLI | Highest | placeholder (both) | Primary CTA is explicitly required for tier 1 ("primary CTA... unified") and is currently the only core button still unstyled on cute-pop despite 3 other finals existing |
| button.secondary.background | `Button.tsx` (paper variant) | existing final | A | existing final (cute-pop) / Codex CLI (yoru) | High (yoru) | final v3 (cute-pop) / placeholder (yoru) | Cute Pop done (request 006) |
| button.danger.background | `Button.tsx` -> destructive actions | B | B | CSS-token | Low | placeholder (both) | Low-frequency, destructive-action button; a clear token-driven solid/border style is safer for readability than illustrated art and does not block any completion tier |
| button.disabled.background | `Button.tsx` -> disabled state of any button | C | C | shared overlay | Low | placeholder (both) | Disabled is a state modifier (opacity/desaturation) of whichever background variant is active, not an independent surface identity |
| tile.face.base | `TileCard.tsx` (`slotFor`) -> DeckDetail/Match/Result/Gallery | A | A | Codex CLI | Highest | placeholder (both) | Tile identity is the single most product-defining asset; this is the fixed "next task" (see below) |
| tile.face.selected | `TileCard.tsx` (`slotFor`) — currently a **separate full face image**, not an overlay | C (recommended refactor) | C (recommended refactor) | shared overlay (after code change) | Deferred pending overlay implementation | placeholder (both) | Investigation confirms `slotFor()` currently resolves this to a fully distinct slot per state (one `<SkinLayer>` per card, not base+overlay composite). Generating 3 extra full tile illustrations per skin (9 total incl. tsumo/ron) triples the tile art burden and risks state legibility (task explicitly flags this). Recommendation: implement a CSS/DOM state indicator drawn over `tile.face.base` instead of new art. This is an engineering change, not an asset-generation task — do not generate final art for this slot until that decision is made |
| tile.face.ronAvailable | `TileCard.tsx` (`slotFor`) — same as above | C (recommended refactor) | C (recommended refactor) | shared overlay (after code change) | Deferred pending overlay implementation | placeholder (both) | Same reasoning as tile.face.selected |
| tile.face.tsumoAvailable | `TileCard.tsx` (`slotFor`) — same as above | C (recommended refactor) | C (recommended refactor) | shared overlay (after code change) | Deferred pending overlay implementation | placeholder (both) | Same reasoning as tile.face.selected |
| tile.back.base | `TileCard.tsx` (`slotFor`) -> same consumers | A | A | Codex CLI | Highest | placeholder (both) | Tile back is visible for every opponent tile and the discard/draw pile; part of the same "tile identity" batch as tile.face.base |
| badge.warning.background | `Badge.tsx` -> DeckEditor/DeckDetail/Collection/DeckList/AppRoot, Gallery | B | B | CSS-token | Low | placeholder (both) | Warning legibility (contrast, icon, text) matters more than illustrated art; a token-driven badge surface is sufficient and lower-risk for a state that must stay readable |
| badge.info.background | `Badge.tsx` -> same consumers | existing final | A | existing final (cute-pop) / Codex CLI (yoru) | Medium (yoru) | final v3 (cute-pop, request 007) / placeholder (yoru) | Cute Pop done. For visual parity between skins, yorunoshirube should eventually get an equivalent, but it is not tier-1 blocking (batch 4) |
| effect.result.burst | **no component reference found in src/** | D | D | defer | None | placeholder (both), unwired | Dead slot — no consumer exists. Re-evaluate only after `ResultScreen` implements a celebratory-burst render call for this slot; generating art for an unconsumed slot would be wasted production |
| effect.wildcard.glow | **no component reference found in src/** | D | D | defer (shared overlay when implemented) | None | placeholder (both), unwired | Dead slot — no consumer exists. When a wildcard indicator UI is implemented, recommend a CSS/shared-overlay glow (class C) rather than a standalone image, for the same legibility/economy reasons as the tile-state slots. Re-evaluate when wildcard UI is implemented |
| effect.score.pop | **no component reference found in src/** | D | D | defer | None | placeholder (both), unwired | Dead slot — no consumer exists. Re-evaluate only after a score-reveal animation feature consumes this slot |

### Classification summary

```text
A  (final image required):        table.background, panel.modal.background,
   panel.result.frame, button.primary.background, tile.face.base,
   tile.back.base  (both skins, 6 slots)
   + panel.paper.default, button.secondary.background, badge.info.background
     for yorunoshirube only (already final on cute-pop) — 3 slots

B  (fallback/deterministic sufficient): button.danger.background,
   badge.warning.background (both skins)
   + table.overlay.ink, table.overlay.light for yorunoshirube only
     (CSS token gradient acceptable near-term)

C  (shared overlay, not a duplicated image): panel.paper.emphasis,
   button.disabled.background (both skins)
   + tile.face.selected, tile.face.ronAvailable, tile.face.tsumoAvailable
     (both skins — recommended refactor target, currently implemented as
     full duplicate images; no new art should be generated for these until
     the overlay refactor is decided)

D  (defer, not needed for current MVP): table.overlay.ink, table.overlay.light
     for cute-pop (no ink/lantern motif in cute-pop's visual language)
   + effect.result.burst, effect.wildcard.glow, effect.score.pop for both
     skins (dead slots, zero component consumers as of this audit)
```

Per-skin differences: yorunoshirube needs real art for slots cute-pop has
already resolved (panel.paper.default, button.secondary.background,
badge.info.background are class A only for yorunoshirube — cute-pop already
has finals). table.overlay.ink/light are B for yorunoshirube (lore-relevant,
CSS-sufficient for now) but D for cute-pop (not part of its visual language
at all).

## Current final-asset inventory (verified from skin.json + files on disk)

| Skin | Slot | Version | Filename | Render mode | Intrinsic size | Density | Fallback when missing | Request ID | Approved |
|---|---|---|---|---|---|---|---|---|---|
| cute-pop | button.secondary.background | v3 | button-secondary-2x.png | nine-slice | 480x144 | 2x | token/CSS nine-slice panel | 006 | yes |
| cute-pop | panel.paper.default | v3 | panel-paper-2x.png | nine-slice | 768x512 | 2x | token/CSS nine-slice panel | 006 | yes |
| cute-pop | badge.info.background | v3 | badge-info-background.png | nine-slice | 240x80 | 2x | token/CSS nine-slice badge | 007 | yes (candidate B promoted; A/C not-selected) |
| yorunoshirube | (none) | v1 | — | — | — | — | CSS/token fallback for all 21 slots | — | n/a |

Both skins additionally have non-manifest nine-slice proof images under
`generated/candidates/` (`proof-button-primary-2x.png`,
`proof-panel-paper-2x.png`) — these are H5 proof artifacts, not
manifest-registered final assets, and are correctly excluded from the
inventory above.

## Production batches

Common completion pipeline for every batch (see docs/IMAGE-ASSET-WORKFLOW.md
for full parameter/record detail):

```text
asset request created (docs/asset-requests/, TEMPLATE.md format)
-> Codex CLI image generation (green-screen background) OR deterministic
   scripts/ generation for CSS-token/geometric slots
-> pnpm asset:image:prepare (chroma-key transparency + despill + validation,
   archive/record written) for image-generated assets
-> candidates placed under generated/candidates/ (not manifest-registered)
-> Gallery and/or real-screen review
-> human approval
-> final promotion: file moved/registered under generated/final/,
   skin.json slot updated to status: final, skin version bumped
-> pnpm skin:validate
-> preload/atomic-switch/versioned-URL check (manual or via existing tests)
-> pnpm test:visual (only intended screens diff; unrelated screens zero-diff)
-> commit + push, CI green
```

Direct-to-final generation remains prohibited in every batch. No batch below
authorizes skipping candidates review.

### Batch 1 — Cute Pop tile identity

```text
Target slots: tile.face.base, tile.back.base
Target skin: cute-pop
Screens used: DeckDetailScreen, MatchScreen, ResultScreen (via TileRow), Gallery
Generation method: Codex CLI image generation
Planned asset-request ID: 008 (next available; 001-007 exist)
Max candidates: 3 per slot
Human review checklist: legible at 844x390 minimum tile render size, reads
  correctly at all 5 review sizes, transparent edges clean (no green fringe),
  visually distinct face vs back, consistent with cute-pop's bright/pop
  palette and existing button/panel finals, no baked-in text
Final-promotion criteria: human approval recorded, skin:validate passes,
  visual regression accepted with zero unrelated-screen diff
Manifest/version update: cute-pop skin.json version 3 -> 4 on promotion
Visual regression targets: TOP/Gallery/MatchSetup at all 5 sizes (existing
  matrix); DeckDetail/Match/Result screens should be added to the visual
  regression matrix before or alongside this batch if not already covered
Rollback conditions: any P0 contrast/legibility regression, any visual-regression
  diff outside the tile slots, skin:validate failure
Gate to next batch: tile.face.base + tile.back.base promoted to final on
  cute-pop, skin:validate/test/build green, visual regression accepted
```

Blocker check performed for this roadmap: no code blocker found for
cute-pop/tile.face.base — `TileCard.tsx` already resolves the slot correctly
through `SkinLayer`, so this remains the correct starting candidate.

### Batch 2 — Cute Pop main screens

```text
Target slots: button.primary.background, panel.modal.background,
  panel.result.frame, table.background
Target skin: cute-pop
Screens used: all screens (primary CTA is global), AppRoot/TopScreen/Dialog
  (modal), ResultScreen (result frame), MatchScreen (table)
Generation method: Codex CLI image generation
Planned asset-request ID: 009-012 (one per slot, or grouped if visual
  language is shared — decide at request-creation time)
Max candidates: 3 per slot
Human review checklist: CTA contrast/legibility at all button states
  (default/hover/disabled), modal readability with real dialog content,
  result frame does not crowd score breakdown text, table background does
  not reduce tile/hand legibility
Final-promotion criteria: same as batch 1
Manifest/version update: cute-pop skin.json version bump per promotion batch
Visual regression targets: full screen matrix (all screens x 5 sizes per
  P1-2 minimum matrix)
Rollback conditions: same as batch 1, plus any regression in the tier-1
  "match/create/result flow visually complete" criterion
Gate to next batch: cute-pop reaches Tier 1 (Cute Pop Demo Ready, see below)
```

### Batch 3 — Yorunoshirube core

```text
Target slots: panel.paper.default, button.primary.background,
  button.secondary.background, tile.face.base, tile.back.base,
  panel.modal.background, panel.result.frame, table.background
Target skin: yorunoshirube
Screens used: same as batches 1-2, mirrored for yorunoshirube
Generation method: Codex CLI image generation (night-desk/paper/ink/lantern
  visual language per docs/MASTER-SPEC.md skin contract)
Planned asset-request ID: next available after batch 1/2 requests are filed
Max candidates: 3 per slot
Human review checklist: same as batches 1-2, plus explicit dark colorScheme
  contrast check (yorunoshirube colorScheme: dark) and consistency with
  docs/design-targets/generated/soro-pon-landscape-vampon-ui-v1/ reference
Final-promotion criteria: same as batch 1
Manifest/version update: yorunoshirube skin.json version 1 -> 2 (first
  final assets)
Visual regression targets: full screen matrix, yorunoshirube column
Rollback conditions: same as batch 1
Gate to next batch: yorunoshirube reaches parity with cute-pop's core-slot
  coverage; both-skins comparison accepted
```

### Batch 4 — Yorunoshirube decoration/effects

```text
Target slots: badge.info.background, badge.warning.background (if upgraded
  from B), table.overlay.ink, table.overlay.light (if upgraded from B),
  panel.paper.emphasis (if the C/overlay refactor is not adopted)
Target skin: yorunoshirube
Screens used: same consumers as listed in the classification table
Generation method: Codex CLI image generation, or CSS-token if the
  classification in this doc is not revised
Planned asset-request ID: next available
Max candidates: 3 per slot
Human review checklist: decoration does not compete with primary content
  legibility; overlays remain subtle at opacity settings defined in
  SKIN-CONTRACT.json (0.5 / 0.6)
Final-promotion criteria: same as batch 1
Manifest/version update: yorunoshirube skin.json version bump
Visual regression targets: full screen matrix
Rollback conditions: same as batch 1
Gate to next batch: Two Official Skins Demo Ready (Tier 2, see below)
```

### Batch 5 — Full-screen integration pass

```text
Target slots: none new — this batch is integration/QA, not generation
Target skin: both
Screens used: all screens
Generation method: n/a (QA pass; may spawn small touch-up requests for
  slots that fail integration review)
Planned asset-request ID: n/a unless a touch-up request is needed
Max candidates: n/a
Human review checklist: full manual QA at all 5 review sizes per
  docs/MANUAL-QA.md and docs/RELEASE-DEMO-GATES.md Gate 4/5 checklists;
  cross-skin consistency; no CSS/skin regressions from earlier batches
Final-promotion criteria: n/a (no new promotions; existing finals only)
Manifest/version update: none expected
Visual regression targets: full matrix, both skins, all screens, all sizes
Rollback conditions: any Gate 4/5 requirement in
  docs/RELEASE-DEMO-GATES.md failing
Gate to next batch: Release Candidate track begins (docs/RELEASE-DEMO-GATES.md
  Gate 6 onward — outside this roadmap's asset-production scope)
```

## Completion tiers

### Tier 1 — Cute Pop Demo Ready

```text
Cute Pop main screens do not look like placeholder art
Tile face/back, primary CTA, table background are unified (Batch 1 + Batch 2 done)
Legible at all 5 review sizes
Match/create/result flow is visually complete
Yorunoshirube may stay hidden/in-dev
```

### Tier 2 — Two Official Skins Demo Ready

```text
Both skins selectable, world-consistent on all major screens (Batch 3 + Batch 4 done)
Shared layout/hit-area/state-meaning preserved (already true — H1-H11 complete)
Fallback does not look broken for any remaining B/C/D slot
Manual QA + visual regression pass for both skins
```

### Tier 3 — Release Candidate

```text
Real device/browser QA
Storage/import error UX, recovery, reset verified
Performance and accessibility basics accepted
Cache/version/rollback behavior accepted (H10 mechanisms already implemented;
  this tier verifies them under real asset load)
Known-issues doc current
README/demo limitations noted
No IP violations
CI green
Maps to docs/RELEASE-DEMO-GATES.md Gate 5/6
```

## Progress estimates (explicitly estimates, not measured percentages)

```text
Gameplay/engine:                    ~90-95%  (Phases 1-14 complete; extendedRoleSpan out of MVP scope)
Storage/import/idempotency:         ~90-95%  (H8/H11 complete; restore/replay feature itself is out of MVP scope)
UI/skin foundation (H1-H11):        ~95-100% (all 11 items complete; H6 additional render modes intentionally not pursued beyond proven need)
Image generation/audit pipeline:    ~95-100% (transactional prepare/rollback, chroma-key, record schema, one closed request cycle proven end-to-end)
Cute Pop final assets:              3 of 21 contract slots (18 wired; button.primary.background, the main CTA, still placeholder)
Yorunoshirube final assets:         0 of 21 contract slots
Public demo overall (Tier 1+2):     ~35-45%  (foundation done, but the highest-visibility slots — primary CTA, tile art, table background,
                                                modal/result frames — are still placeholder on both skins; Tier 1 alone requires Batch 1+2)
Release Candidate overall (Tier 3): ~25-35%  (depends on Tier 1/2 completion first, plus untouched Gate 5/6 QA items)
```

Note: the reference figures suggested when this roadmap was scoped
(~65-70% public demo, ~50-60% Release Candidate) assumed a smaller remaining
asset gap than what this audit found. The technical-foundation and pipeline
percentages match the suggested range, but visual completion is lower than
suggested because button.primary.background — the single most-used surface
in the app — has no final asset on either skin, and only 3 of 21 slots have
any final asset at all (all on one skin). Public-demo and Release-Candidate
percentages above are adjusted down accordingly and should be treated as
this audit's estimate, not the original suggested figures.

## Timeline estimates (non-binding)

Assumptions: max 3 candidates per slot, human review same-day to next-day
turnaround, no major pivots, no new features, stable Codex CLI generation,
no engine logic changes.

```text
Cute Pop only public demo (Tier 1):        8-12 business days
Two official skins public demo (Tier 2):   15-25 business days
General-user Release Candidate (Tier 3):   25-40 business days
```

## Next task

Next: Create asset request for cute-pop / tile.face.base. Generate up to 3
candidates through the canonical Codex CLI pipeline
(docs/IMAGE-ASSET-WORKFLOW.md). Stop before final promotion for human review.

No asset request was created, no prompt was written, no image was generated,
and no candidate/final/manifest/skin-version file was touched by this
roadmap doc itself — this is a planning document only.

Cross-referenced from docs/IMPLEMENTATION-WORKFLOW.md.
