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

**BLOCKED before any of the 20 flows could be exercised.** See
[BATCH-8-VOICEOVER-ACCEPTANCE-REPORT.md](./BATCH-8-VOICEOVER-ACCEPTANCE-REPORT.md)
for the full attempt log and exact blocker. Full attempt log (every
step tried, in order): `docs/qa/evidence/batch-8/attempt-log.json`.

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

No P0-P3 findings exist this batch because no walkthrough occurred to
produce any. This is explicitly different from "0 found because
verified clean" — it is "0 found because 0 verified."

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
