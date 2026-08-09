# CLAUDE.md

Claude Code向け補足。共通ルールの正本は `AGENTS.md`。このファイルはClaudeが作業開始時に誤った旧Batchへ戻らないための短い運用補助。

## Current Status — 2026-08-09

```text
MVP 1-14 / multi-skin / H1-H11: complete
official finals: 18
RC: LIMITED READY
Batch 11: COMPLETE on frozen SHA 7548964
Batch 12: CONDITIONAL on frozen SHA 555c02d
Batch 13: CONDITIONAL; real-environment/deploy residual gates remain
Batch 14 authored game UI/UX: COMPLETE
  PR #10 squash-merged to main as 30c6e84393a216ae5f561e955886595d12c89f8f
  Issue #12 closed
  reviewed PR HEAD: f134755fb961b455f751c661c98018233dbd76cb
  Visual Review 31314974844 / CI 31314974888 / Integrity 31314974887: SUCCESS
  artifact 9038478453
Physical iPhone Safari: KNOWN UNVERIFIED / post-release / non-blocking
```

`PR #10 ACTIVE`、`Issue #12 OPEN`、`Batch 14 next` は古い指示。次の作業は最新mainから始める。

## Read First

```text
AGENTS.md
docs/MASTER-SPEC.md
docs/IMPLEMENTATION-WORKFLOW.md
docs/RELEASE-DEMO-GATES.md
docs/design/SOROPON-VISUAL-QUALITY-LEARNINGS.md
docs/design/SOROPON-INTERACTION-UX-CONTRACT.md
docs/qa/BATCH-14-VISUAL-REVIEW.md
docs/release/STORAGE-RECOVERY-POLICY.md
docs/SKIN-DISTRIBUTION.md
```

## Immediate Execution Order

```text
1. Stop concurrent writers.
2. Start from current main unless the task explicitly names another branch.
3. Record exact target SHA and relevant toolchain/browser/Python versions.
4. pnpm install --frozen-lockfile
5. Run .github/workflows/integrity.yml equivalent.
6. Run visual + interaction UX + review-hygiene contract guards declared in CI.
7. pnpm typecheck
8. pnpm test
9. pnpm skin:validate
10. pnpm build
11. Run Python asset fixtures when asset tooling is in scope.
12. For UI/UX changes, run current-head Batch 14 Visual Review and review the Actions artifact.
13. If product/test/workflow changes, discard old final evidence and restart verification on the new SHA.
14. Run remaining real-environment release gates only when in scope; never substitute WebKit/Simulator/local preview for a named target.
```

## Integrity Contract

```text
storage read denial:
  L9005 display fallback
  mutation/export fail closed

write boundary:
  strict runtime parse immediately before persistence
  nested IDs/memberships/group fields/score caps checked
  stale observed deck update/delete rejected

match result:
  record/coins/roles/achievements in one write
  MatchSession React identity uses matchSessionId, not seed

recovery:
  preserve valid deck bodies and valid progress where safely identifiable
  dedupe set-like legacy values before retention caps
  backup raw payload when possible
  export forensic raw bundle without reinterpretation
  failed export never removes source backup or claims success
  unknown versions are not guessed

import/editor:
  migration and same-ID overwrite need visible unchanged-state review
  unsafe diagnostics are bounded but import remains rejected
  live Editor uses the production integrated validator

reset/destructive UI:
  full known-key deletion required before reload
  reset points to forensic export first
  danger Dialog focuses cancel and describes irreversible copy

skin:
  failed/unmounted load cannot replace current UI
  duplicate/future registry rejected
  external-evaluated SVG rejected
  manifest text cannot elevate trust above loader-owned origin
  loader-owned origin is not a cryptographic signature

supply chain:
  Main CI / Integrity actions use immutable commit SHAs
  Python asset install runs exact top-level pins + pip check
```

Fingerprint guards are not transactional multi-tab CAS. Raw forensic export is not a restore feature.

## UI / Skin Contract

```text
one shared layout/component system
no skin-specific screens
layout/hit areas/focus/z-index/game meaning are skin-invariant
skins change typed allowlisted presentation values only
shared renderers/components before screen-local implementations
```

### Batch 14 Visual Quality Contract

Treat these as durable design lessons, not one-off taste notes:

```text
GOAL
  The app must read as a purpose-built game, not an admin dashboard or a
  collection of generic web cards. CI green is necessary but never sufficient.

MATCH
  table/tiles/discard river/hand/turn/action are the visual hierarchy
  player metadata and utility chrome are subordinate
  discard placement should evoke a mahjong river without changing DOM order
  self hand owns the lower edge; drawn tile and selected tile must read instantly
  do not solve hierarchy by adding more panels, labels, badges, or decoration

DECK UX
  browsing should feel like choosing a loadout/deck, not opening settings
  show actual tile faces/previews early; prefer visual inventory over text metadata
  editor presentation should feel like a game workspace
  validation remains an inspector rather than the main content
  role presets must stay visible and operable in compact landscape

ANTI-PATTERNS
  no generic AI ensemble/collage look
  no glossy gacha-style over-polish
  no excessive bloom, neon/cyberpunk treatment, gradient-for-gradient's-sake,
  crowded symmetry, repeated rounded cards, or dashboard KPI-card composition
  no decorative layer that competes with text or reduces readability

ART DIRECTION
  Yorunoshirube: night desk / paper / black ink / lantern light / memory notebook
  Cute Pop: bright / cute / friendly / pop, but still authored and coherent
  use controlled saturation, clear occlusion, strong silhouette and thumbnail readability

ITERATION
  judge actual landscape targets: 844x390 and 1440x900
  identify the weakest 3 visual problems first and fix those before adding polish
  compare hierarchy/spacing/occlusion, not only pixel stability
  review the current HEAD Actions artifact; older snapshots are not current approval
  keep current polish screenshots out of Git history; historical evidence stays immutable
  do not let an older screenshot or prior design constrain a clearly better solution
```

### Batch 14 Interaction UX Contract

Source of truth: `docs/design/SOROPON-INTERACTION-UX-CONTRACT.md`.

```text
TARGETS
  frequent gameplay CTA: keep ~44px target height
  enabled pointer target floor: 24px
  compact secondary controls: 32-36px when 44px would steal critical board space
  checkbox/radio label may be the actual target and must satisfy the target contract

INPUT MODE
  touch gets immediate pressed feedback and no sticky desktop hover state
  hover-only treatment is gated to fine pointers
  focus ring stays visible; scroll regions reserve focus margin/padding

ACTION HIERARCHY
  strongest treatment belongs to an action executable now
  instruction/wait states remain visually quieter than actionable CTA
  echo important selections into the commit CTA before acting
  routine play navigation dominates maintenance/destructive operations

MOTION
  one-time, state-explaining motion only
  restrained travel; avoid scale/depth/parallax/blur choreography
  prefers-reduced-motion disables nonessential draw/pulse/result/rotate animation
```

## Release / Git Boundaries

```text
local preview != deploy
Playwright WebKit != Safari
emulation != physical device
automated accessibility tree != real screen reader
old SHA PASS != current SHA verification
older visual artifact/snapshot != current HEAD visual approval
successful push != CI success
workflow definition != workflow PASS
raw forensic export != validated restore
loader-owned origin != cryptographic package identity
long working-branch history != final mainline history; use squash after approval
```

For future UI work, preserve the Batch 14 visual/interaction contracts but do not reopen Batch 14 itself. Report exact SHA, verification, Actions/artifact status, remaining risks and RC state.
