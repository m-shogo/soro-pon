# Batch 8 — macOS VoiceOver Acceptance Matrix

Not a new feature Gate. Gate 6 remains PASS, unchanged. Batch 7's RC
readiness (LIMITED READY, browser scope extended to Chromium + Firefox
+ Playwright WebKit) remains unchanged. Batch 8 attempts to close one
specific open item from Batch 7's "Next fixed task" list: real
screen-reader acceptance.

Date: 2026-07-21.

## Scope

```text
Batch 8 name: macOS VoiceOver Acceptance
Purpose: exercise the app with a real screen reader (VoiceOver), not
  just semantic/programmatic DOM inspection, to close one specific
  Batch 7 open item
Not in scope: new features, Gate 7/8, NVDA/JAWS, Android physical
  devices, real deploy-target rollback, extended memory soak, large
  UI redesign
```

## Planned 20-flow walkthrough (per Batch 8 instructions)

```text
A. TOP: page title, main heading, button order, button-name/purpose
   match, current skin state (5 flows)
B. JSON Import: reach import screen, textarea label, trigger a
   validation error, error recognizability, successful import (5 flows)
C. Deck List/Deck Editor: deck-name/button relationship, open editor,
   tab/section structure, form control labels, unsaved-changes dialog,
   focus return after closing it (6 flows)
D. Match Setup/Match: player-count/deck-selection/start understanding,
   start a match, recognize turn/actionable-state/hand/selection during
   play, understand win/rank/score on Result (4 flows)
```

## Environment (planned)

```text
macOS: 26.4.1 (build 25E253) — confirmed via sw_vers
Safari: 26.4 — confirmed via bundle version lookup
VoiceOver: macOS-bundled (no separate version to query)
Browser actually used: Chrome (per explicit user decision — see
  "Method" in the Report; Safari access via computer-use is read-only
  for all browsers, making a Safari-driven walkthrough impossible in
  this environment; Chrome was chosen as the closest achievable
  alternative because VoiceOver operates via the OS accessibility API
  and does work with Chrome, not only Safari — but this means Batch 8's
  attempt, had it succeeded, would have produced "VoiceOver + Chrome"
  evidence, not "VoiceOver + Safari" evidence)
Quick Nav: not reached (blocked before any navigation mode was tested)
Skins seeded: yorunoshirube (only skin actually loaded before the block)
Deck fixture: samples/animal-starter.deck.json (seeded via
  Claude-in-Chrome javascript_tool before the block occurred)
Dev server: http://localhost:5199 (Vite dev server, already running)
```

## Actual outcome

**Attempts 1-3 (2026-07-21): BLOCKED** before any of the 20 flows could
be exercised, across 3 independent same-day attempts using 2 different
toolchains. Evidence: `docs/qa/evidence/batch-8/attempt-log.json`
(attempts 1-2) and `attempt-3-claude-code-only.json` (attempt 3).

**Attempt 4 (2026-07-23): CONDITIONAL** — after the user granted the
macOS TCC Accessibility + Automation permissions via System Settings
(the exact blocker from attempt 3), real VoiceOver was driven and
observed for the first time. The 20 flows were reclassified from the
recorded evidence as `VOICEOVER_PASS: 9`, `SUPPLEMENTAL_ONLY: 5`,
`BLOCKED: 6`, `NOT_APPLICABLE: 0`. The real-VoiceOver passes cover the
observed portions of TOP, JSON import, Deck Editor, and the
unsaved-changes dialog. Match Setup was reached but not cleanly
VoiceOver-traversed; Match and Result were not reached under a clean
VoiceOver cursor due to a CDP-vs-VoiceOver focus-sync tooling
limitation. Evidence:
`docs/qa/evidence/batch-8/attempt-4-tcc-granted-observations.json`. Full
detail in the "Attempt 4" section of
[BATCH-8-VOICEOVER-ACCEPTANCE-REPORT.md](./BATCH-8-VOICEOVER-ACCEPTANCE-REPORT.md).
The dialog opening and initial focus were observed with real VoiceOver;
Escape cancellation and focus return were supplemental source/unit-test
checks and are not included in the 9 VoiceOver passes. RC status remains
LIMITED READY (game-play screens' real-screen-reader
traversal still open).

**Attempt 5 (2026-07-23): CONDITIONAL** — real VoiceOver navigated
TOP → Match Setup → Match without an external click after activation.
Match Setup controls, selected deck name, and start action were
reached. Match exposed turn/remaining-tile/player/role information and
named hand-tile toggle controls. One tile changed AX selected value
`0 → 1` and was discarded with `VO+Space`; the remaining-tile and
discard counts changed afterward.

The player-count toggle did not announce its current selection. This
confirmed P2 was fixed with `aria-pressed` and a component regression
test, but the fixed state was not re-run under real VoiceOver. Result
was populated through the existing QA route while VoiceOver was off,
but replay unexpectedly activated during VoiceOver focus
resynchronization; Result comprehension remains blocked. `cute-pop`
has automated parity evidence only.

Attempt 5 exact classification: `VOICEOVER_PASS: 13`,
`SUPPLEMENTAL_ONLY: 3`, `BLOCKED: 3`, `NOT_APPLICABLE: 1`.
P0/P1 open: 0. P2 found/fixed/open: 1/1/0. Batch 8 and RC remain
`CONDITIONAL` and `LIMITED READY`.

**Attempt 6 (2026-07-23): CONDITIONAL** — scope-limited to the three
items needed to try to close Batch 8. (1) The Match Setup 人数 buttons
were re-verified under real VoiceOver as `AXCheckBox` with a value that
reflects selection (3人戦=1/4人戦=0), and VO+Space flipped the roving
selection live — promoting the `aria-pressed` fix (`bbb378e`) from
SUPPLEMENTAL_ONLY to VOICEOVER_PASS. (2) The match was auto-played to
Result via CDP **while VoiceOver was OFF**, then VoiceOver was turned ON
for read-only traversal (no button activation — the Attempt-5 accidental
replay did not recur); the result `AXHeading` "対戦結果" and all three
action buttons (もう一局/記憶帳を見る/TOPへ) were confirmed via
AXFocusedUIElement, but the win/rank/score static text stays
SUPPLEMENTAL_ONLY (structure verified via AX-tree read — h2 win method,
semantic ranking list with a text ★ winner marker, score text — while
VoiceOver's spoken output of that non-focusable text is not
mechanically capturable: no AX-queryable caption panel, static text not
AXFocusedUIElement-trackable = tooling limitation, not a product
defect). (3) Cute Pop parity was confirmed under real VoiceOver: Match
Setup 人数 `AXCheckBox` values and a Match hand tile (`AXCheckBox`,
description "ワシ", selected value 0→1 on VO+Space) are identical to
yorunoshirube.

Attempt 6 cleared all 3 previously-BLOCKED items. **Cumulative Batch 8
final classification: `VOICEOVER_PASS: 13`, `SUPPLEMENTAL_ONLY: 6`,
`BLOCKED: 0`, `NOT_APPLICABLE: 1`.** P0/P1/P2 open: 0. In the range
actually traversed under real VoiceOver, plus the range supplementally
confirmed via semantic structure and existing automated tests, open
product defects are 0; 1 tooling limitation (Result static-text caption
capture). VoiceOver was turned OFF at session end. Batch 8 and RC remain
`CONDITIONAL` and `LIMITED READY` (the strict COMPLETE bar requires
capturing VoiceOver's spoken win/rank/score, blocked only by tooling).

**Precise real-VoiceOver validation scope:** Yorunoshirube — TOP, JSON
Import, Deck Editor, Match Setup, Match, and the Result heading + action
controls were traversed under real VoiceOver; the Result win/rank/score
static text is supplemental only. Cute Pop — only the Match Setup and
Match key controls (人数 buttons, hand tile) were confirmed for
real-VoiceOver parity; Cute Pop's Result was NOT traversed under real
VoiceOver. Not claimed: "both skins' Result validated" or "all game
screens fully traversed".

Full Attempt 6 evidence:
`docs/qa/evidence/batch-8/attempt-6-gameplay-result-parity.json`,
`attempt-6-focus-log.json`.

## P0-P3 classification (unchanged scheme from Batch 6/7, extended)

```text
P0: data destruction, cannot boot, public-demo-stopping
P1: VoiceOver-primary-flow-impossible, match cannot start, Result
    cannot be understood, focus trap
P2: avoidable but should be fixed before a stronger accessibility claim
P3: verbosity, reading-order, minor wording issues
By design: matches documented/intended behavior
Safari limitation: a real, verified Safari-specific behavior
VoiceOver limitation: a real, verified VoiceOver-specific behavior
Test script defect: the QA script's assumption/technique was wrong
Documentation defect: docs/evidence text was wrong
Environment limitation: cannot be verified in this environment —
  this is the category that applies to this entire batch's core
  objective, since VoiceOver itself could never be reached
```

No P0-P3 finding was observed in the Attempt 4 traversal scope.
Attempt 5 found and fixed one P2 selected-state defect in Match Setup.
No P0/P1 is open. Result and second-skin real-VoiceOver coverage remain
unverified; automated checks do not close those gaps.

## Decision criteria

**COMPLETE**: all planned VoiceOver flows executed (or genuinely
completed with documented partial gaps), P0/P1 = 0, RC decision made
honestly from real walkthrough data.

**CONDITIONAL**: some flows completed with real VoiceOver signal, but
others were blocked or left P2s — used only when partial real data
exists.

**BLOCKED**: VoiceOver itself could not be exercised at all (this
batch's actual outcome), or a primary flow was found genuinely
impossible for a VoiceOver user, or P0/P1 remain open.

RC readiness terms (unchanged scheme): `READY` / `LIMITED READY` /
`NOT READY` — see the Report for the actual decision.
