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
Cute Pop final assets: 9 (button.secondary.background, panel.paper.default,
  badge.info.background, tile.face.base, tile.back.base,
  button.primary.background, table.background, panel.modal.background,
  panel.result.frame) — version 5 (R1 closed 2026-07-16, Batch 2 closed
  2026-07-16)
Yorunoshirube final assets: 0 — version 1, slots: {} (CSS/token fallback only)
button.primary.background (the main CTA) is now final on cute-pop
  (R1, candidate D "jelly candy CTA")
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
| table.background | `GameTableLayout` -> MatchScreen (cover) | A | A | Codex CLI | High | final v5 (cute-pop) / placeholder (yoru) | Table atmosphere is core to both skins' identity; CSS gradient reads as unfinished for demo tier 1/2 |
| table.overlay.ink | `GameTableLayout` -> MatchScreen (overlay, 0.5) | D | B | CSS-token (yoru) / defer (cute-pop) | Low | placeholder (both) | Ink texture is yorunoshirube-specific lore (黒インク); cute-pop's bright/pop language has no ink motif. Re-eval cute-pop only if art direction adds a paper-ink accent |
| table.overlay.light | `GameTableLayout` -> MatchScreen (overlay, 0.6) | D | B | CSS-token (yoru) / defer (cute-pop) | Low | placeholder (both) | Lantern-light overlay is yorunoshirube lore (ランタン光); CSS radial-gradient is sufficient until batch 4 decoration pass. Re-eval cute-pop if a light/glow accent is added to its palette |
| panel.paper.default | `PaperPanel` (default) -> most screens, Gallery | existing final | A | existing final (cute-pop) / Codex CLI (yoru) | High (yoru) | final v3 (cute-pop) / placeholder (yoru) | Cute Pop already done (request 006). Yorunoshirube's paper panel is central to its "night desk / memory book" identity |
| panel.paper.emphasis | `PaperPanel` (selected variant) -> same consumers | C | C | shared overlay | Medium | placeholder (both) | This is a tint/emphasis variant of panel.paper.default, not a distinct surface. A shared highlight overlay avoids a second full nine-slice asset per skin |
| panel.modal.background | `Modal.tsx` -> `Dialog`, `AppRoot`, `TopScreen`, Gallery | A | A | Codex CLI | Medium-High | final v5 (cute-pop) / placeholder (yoru) | High-frequency surface (every dialog/modal); fallback token panel is functional but reads generic in a finished demo |
| panel.result.frame | `ResultFrame.tsx` -> `ResultScreen` | A | A | Codex CLI | High (cute-pop) | final v5 (cute-pop) / placeholder (yoru) | Result screen visual completeness is an explicit tier-1 requirement |
| button.primary.background | `Button.tsx` -> nearly every screen (main CTA) | A | A | Codex CLI | Highest | placeholder (both) | Primary CTA is explicitly required for tier 1 ("primary CTA... unified") and is currently the only core button still unstyled on cute-pop despite 3 other finals existing |
| button.secondary.background | `Button.tsx` (paper variant) | existing final | A | existing final (cute-pop) / Codex CLI (yoru) | High (yoru) | final v3 (cute-pop) / placeholder (yoru) | Cute Pop done (request 006) |
| button.danger.background | `Button.tsx` -> destructive actions | B | B | CSS-token | Low | placeholder (both) | Low-frequency, destructive-action button; a clear token-driven solid/border style is safer for readability than illustrated art and does not block any completion tier |
| button.disabled.background | `Button.tsx` -> disabled state of any button | C | C | shared overlay | Low | placeholder (both) | Disabled is a state modifier (opacity/desaturation) of whichever background variant is active, not an independent surface identity |
| tile.face.base | `TileCard.tsx` (`slotFor`) -> DeckDetail/Match/Result/Gallery | A | A | Codex CLI | Highest | placeholder (both) | Tile identity is the single most product-defining asset; this is the fixed "next task" (see below) |
| tile.face.selected | `TileCard.tsx` (`stateSlotFor`) — composited over base (ADR-015) | C | C | shared overlay | No art planned | placeholder (both) | Decision made and implemented (ADR-015, R1): TileCard now composites the state slot over `tile.face.base` as a second SkinLayer; state meaning is already carried by CSS + aria. No separate full-face state art will be generated. The slot remains in the contract as an optional overlay-style layer |
| tile.face.ronAvailable | `TileCard.tsx` (`stateSlotFor`) — composited over base (ADR-015) | C | C | shared overlay | No art planned | placeholder (both) | Same as tile.face.selected (ADR-015) |
| tile.face.tsumoAvailable | `TileCard.tsx` (`stateSlotFor`) — composited over base (ADR-015) | C | C | shared overlay | No art planned | placeholder (both) | Same as tile.face.selected (ADR-015) |
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
   tile.back.base  (both skins, 6 slots; all 6 are final on cute-pop as of
   2026-07-16 — Batch 1 closed the CTA/tile pair, Batch 2 closed the
   remaining 3; yorunoshirube's 6 remain placeholder, target of Batch 3)
   + panel.paper.default, button.secondary.background, badge.info.background
     for yorunoshirube only (already final on cute-pop) — 3 slots

B  (fallback/deterministic sufficient): button.danger.background,
   badge.warning.background (both skins)
   + table.overlay.ink, table.overlay.light for yorunoshirube only
     (CSS token gradient acceptable near-term)

C  (shared overlay, not a duplicated image): panel.paper.emphasis,
   button.disabled.background (both skins)
   + tile.face.selected, tile.face.ronAvailable, tile.face.tsumoAvailable
     (both skins — ADR-015 decided & implemented: composited over the base
     face as an optional second layer; no separate full-face art planned)

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
| cute-pop | button.secondary.background | v4 | button-secondary-2x.png | nine-slice | 480x144 | 2x | token/CSS nine-slice panel | 006 | yes |
| cute-pop | panel.paper.default | v4 | panel-paper-2x.png | nine-slice | 768x512 | 2x | token/CSS nine-slice panel | 006 | yes |
| cute-pop | badge.info.background | v4 | badge-info-background.png | nine-slice | 240x80 | 2x | token/CSS nine-slice badge | 007 | yes (candidate B promoted; A/C not-selected) |
| cute-pop | tile.face.base | v4 | tile-face-base.png | stretch | 600x800 | 2x | CSS gradient tile face | 008 | yes (round 2 candidate D promoted; round 1 A/B/C + round 2 E/F not-selected) |
| cute-pop | tile.back.base | v4 | tile-back-base.png | stretch | 600x800 | 2x | CSS gradient tile back | 008 | yes (round 2 candidate E promoted; round 1 A/B/C + round 2 D/F not-selected) |
| cute-pop | button.primary.background | v4 | button-primary-background-2x.png | nine-slice | 480x96 | 2x | token/CSS gradient button | 009 | yes (round 2 candidate D promoted; round 1 A/B/C + round 2 E/F not-selected) |
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

**Batch 1 status (R1): COMPLETE.** Round 1 candidates (A/B/C) were rejected
by human review on 2026-07-16 (CSS-reproducible flat designs; direction
changed to image-generation-only texture/depth). Round 2 candidates (D/E/F)
were regenerated, and on 2026-07-16 the human reviewer approved:
tile.face.base -> D (icing cookie frame), tile.back.base -> E (quilted
cushion), button.primary.background -> D (jelly candy CTA — pulled forward
from Batch 2 because the primary CTA was the largest visible gap). All
three are promoted to `generated/final/`, registered in cute-pop/skin.json
(version 3 -> 4), and verified in production consumers (TOP, MatchSetup,
Match screen hand/discard, selected-tile state) across 5 viewports. Full
decision record and promotion evidence: `docs/asset-requests/R1-APPROVAL-PACK.md`.
One integration blocker was found and fixed before generation: the runtime
resolved tile state slots as full-face replacements with no cross-slot
fallback, so promoting only tile.face.base would have made selected tiles
lose their face image. ADR-015 changed TileCard to composite state slots
over the base face; no separate full-face state art was generated for
tile.face.selected/ronAvailable/tsumoAvailable.

### Batch 2 — Cute Pop main screens

```text
Target slots: panel.modal.background, panel.result.frame, table.background
  (button.primary.background completed as part of R1/Batch 1 — see above)
Target skin: cute-pop
Screens used: AppRoot/TopScreen/Dialog (modal), ResultScreen (result frame),
  MatchScreen (table)
Generation method: Codex CLI image generation
Planned asset-request ID: 010-012 (one per slot, or grouped if visual
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

**Batch 2 status: COMPLETE (2026-07-16).** A shared art direction
(`docs/asset-requests/BATCH-2-ART-DIRECTION.md`) was written before
generation so the 3 slots read as one background/panel material family
(table = quietest/lowest density, modal = mid-density/readability-first,
result = most festive) rather than unrelated images. Request 010
(table.background) and 011 (panel.modal.background + panel.result.frame,
grouped because both are nine-slice paper-panel-contract slots) each
produced 3 candidates (9 total), all passing automated validation. Human
review selected table.background: A, panel.modal.background: B,
panel.result.frame: B; all three are promoted to `generated/final/`,
registered in cute-pop/skin.json (version 4 -> 5), and verified in
production consumers (GameTableLayout, Modal, ResultFrame) across 5
viewports plus real modal/result content. Full decision record and
promotion evidence: `docs/asset-requests/BATCH-2-APPROVAL-PACK.md`.

Two blockers were found and resolved during this batch, not by touching
production code:
- table.background is an *opaque* `cover` slot (SKIN-CONTRACT.json has no
  `transparent` field for it) — fundamentally different from every prior
  isolated-object candidate. The pipeline gained `cover_to_canvas()`
  (chroma_key.py) and `--opaque-background`/`--cover-width`/
  `--cover-height` (prepare_asset.py / validate_candidate.py), covered by
  new unit tests, rather than forcing a transparent-margin candidate onto
  a slot that must be fully opaque.
- `skinAssetStyle()`'s nine-slice output sets `border-image-*` but not
  `border-width`; `PaperPanel`'s own CSS class doesn't declare a border at
  all (unlike `Button`, which does), so injecting only the production
  style into a Gallery-only preview silently failed to render any visible
  border-image. The Gallery-only candidate-review helper was fixed to add
  an explicit `borderWidth` for review purposes; production's actual slot
  resolution path is unaffected. This surfaced a genuine 9-slice concern
  in candidate A for panel.result.frame (ribbon corners visibly deform
  when the panel is stretched tall) — recorded in the Approval Pack as a
  known concern rather than silently promoted. The human reviewer
  confirmed this concern and rejected candidate A for panel.result.frame
  on technical grounds (not preference); candidate B was approved instead.

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

**Batch 3 status: candidates ready — human review pending (2026-07-16).**
A shared art direction (`docs/asset-requests/BATCH-3-YORUNOSHIRUBE-ART-DIRECTION.md`)
was written before generation, establishing yorunoshirube's material family
(night atlas / paper / ink / lantern-light — explicitly not a recolor of
Cute Pop's icing/jelly/quilt vocabulary) and a distinct material role per
slot. Requests 012 (table.background), 013 (panel.paper.default +
panel.modal.background + panel.result.frame), 014 (button.primary +
button.secondary), and 015 (tile.face.base + tile.back.base) each produced
up to 3 candidates (24 total across all 8 slots), all passing automated
validation. Review material and the post-approval promotion procedure:
`docs/asset-requests/BATCH-3-YORUNOSHIRUBE-APPROVAL-PACK.md`.

Two candidates were caught and regenerated by machine content review before
being shown for human review (not just automated file-level validation):
table.background candidate B's first generation included torii-gate/pagoda
architecture (an explicitly forbidden wafu motif); panel.result.frame
candidate C's first generation read as a raised black-and-gold bezel with
gem/rivet accents (the explicitly forbidden "black-gold luxury UI"
impression); tile.back.base candidate C's first generation was an all-over
diamond-quilt pattern that both read as CSS-reproducible and duplicated
Cute Pop's quilted-cushion motif. All three were rejected with a recorded
reason and replaced by a revised-prompt regeneration before candidate
placement. Yorunoshirube remains at **version 1, `slots: {}`** — zero
candidates are promoted.

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
Cute Pop main screens do not look like placeholder art        done
Tile face/back, primary CTA, table background, modal, result  done
  frame are unified (Batch 1 + Batch 2 both closed 2026-07-16)
Legible at all 5 review sizes                                  verified for
  promoted slots; visual regression 32/32 green
Match/create/result flow is visually complete                  9 of 21
  contract slots final; remaining 12 are B/C/D-class (fallback/
  overlay/deferred by design, not blocking) — see classification
  table above for exactly which slots those are
Yorunoshirube may stay hidden/in-dev                            true (0 final)
```

Tier 1's asset-production scope (the A-class slots targeted by Batch 1+2)
is now complete on cute-pop. This is not a claim that every one of the 21
contract slots has final art — B/C/D-class slots are intentionally
fallback/overlay/deferred per the classification table, not gaps.

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
Cute Pop final assets:              9 of 21 contract slots (18 wired; R1 closed the primary CTA + tile
                                       face/back gap; Batch 2 closed table.background/
                                       panel.modal.background/panel.result.frame — all 6 A-class
                                       cute-pop slots targeted by Batch 1+2 are now final)
Yorunoshirube final assets:         0 of 21 contract slots
Public demo overall (Tier 1+2):     ~60-65%  (Tier 1's asset-production scope is complete on cute-pop
                                                as of Batch 2's close; Tier 2 is entirely gated on
                                                Batch 3/4 (yorunoshirube), which have not started)
Release Candidate overall (Tier 3): ~35-45%  (depends on Tier 1/2 completion first, plus untouched Gate 5/6 QA items)
```

Note: the reference figures suggested when this roadmap was scoped
(~65-70% public demo, ~50-60% Release Candidate) assumed a smaller remaining
asset gap than what this audit found. Batch 1 (primary CTA + tile face/back)
and Batch 2 (table/modal/result), both closed 2026-07-16, complete Tier 1's
asset-production scope on cute-pop. Public demo readiness is not being
inflated to 100%: Tier 2 (yorunoshirube parity) has not started, and Tier
1/2's remaining B/C/D-class slots (fallback/overlay/deferred by design) are
unaffected by this batch. Percentages above are this audit's estimate, not
the original suggested figures.

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

**R1 is complete** (2026-07-16): tile.face.base (D), tile.back.base (E),
button.primary.background (D) are human-approved, promoted to final,
registered in cute-pop/skin.json v4, and verified in production. Full
record: `docs/asset-requests/R1-APPROVAL-PACK.md`.

**Batch 2 is complete** (2026-07-16): table.background (A),
panel.modal.background (B), and panel.result.frame (B) are human-approved,
promoted to final, registered in cute-pop/skin.json (version 4 -> 5), and
verified in production consumers (GameTableLayout, Modal, ResultFrame)
across 5 viewports plus real modal/result content. panel.result.frame
candidate A was rejected on technical grounds (9-slice stretch artifact
under tall content), not preference. Full record:
`docs/asset-requests/BATCH-2-APPROVAL-PACK.md`.

**All 6 A-class cute-pop slots targeted by Batch 1+2 are now final.**
Cute Pop's Tier 1 asset-production scope is closed; the remaining 12 of 21
contract slots are B/C/D-class (fallback/shared-overlay/deferred by
design, not gaps — see classification table above).

**Batch 3 machine work is complete** (2026-07-16): all 8 yorunoshirube core
slots (table.background, panel.paper.default, panel.modal.background,
panel.result.frame, button.primary.background, button.secondary.background,
tile.face.base, tile.back.base) each have up to 3 human-review-ready
candidates (24 total), all passing automated validation, with a shared art
direction, Gallery comparison UI, production-context previews, and visual
evidence. **Zero candidates are promoted; yorunoshirube skin.json remains
at version 1 with `slots: {}`.** Full record, machine review, and the two
content-review rejections (wafu architecture on a table.background
candidate, black-gold-luxury bezel on a panel.result.frame candidate, and
a Cute-Pop-quilt-resembling pattern on a tile.back.base candidate — all
regenerated before being shown for review):
`docs/asset-requests/BATCH-3-YORUNOSHIRUBE-APPROVAL-PACK.md`.

Next (human): Review and approve/reject the Batch 3 candidates (one
decision per slot: a candidate letter or REJECT). Next (machine, after
approval): promote approved candidates per the Approval Pack procedure —
final move, record updates, yorunoshirube skin.json version 1 -> 2 (first
final assets), skin:validate, visual regression, remove the temporary
Gallery review section — then begin Batch 4 (Yorunoshirube
decoration/effects) or a Batch 3 touch-up cycle for any rejected slot.
This roadmap does not authorize starting Batch 4 generation work; it only
names it as the batch after Batch 3's promotion.

Cross-referenced from docs/IMPLEMENTATION-WORKFLOW.md.
