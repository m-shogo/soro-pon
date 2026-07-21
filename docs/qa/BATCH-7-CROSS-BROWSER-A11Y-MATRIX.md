# Batch 7 — Cross-Browser & Screen Reader Acceptance Matrix

Not a new feature Gate. Gate 6 (Release Candidate) remains PASS
unchanged. Batch 7 extends the RC's verified browser/accessibility
scope beyond Gate 6's Chromium-only baseline. Canonical Gate 6
definition: [docs/RELEASE-DEMO-GATES.md](../RELEASE-DEMO-GATES.md).

Date: 2026-07-21.

## Scope

```text
Batch 7 name: Cross-Browser & Screen Reader Acceptance
Purpose: extend RC readiness's verified browser/accessibility scope
Not in scope: Gate 7/8 features, new gameplay rules, new browsers
  beyond Firefox/WebKit, new devices, refactors unrelated to found
  defects
```

## Browser scope (precise — do not blur these categories)

```text
Validated this batch (real browser-engine automation, Playwright):
  Chromium (Desktop Chrome)  — carried over from Gate 4/5/6, re-confirmed
  Firefox                    — NEW this batch
  Playwright WebKit          — NEW this batch (Playwright's WebKit
                                 engine build, NOT real Safari)

NOT validated (explicitly, no claim made):
  Real Safari (macOS, actual Safari.app)
  iOS Safari on a physical iPhone/iPad
  Android Chrome on a physical device
  Any other physical mobile/tablet device
```

"Playwright WebKit" and "real Safari" are different things: Playwright
bundles its own WebKit build (version 26.5 / Playwright webkit v2311 as
installed this batch) that is close to, but not identical to, the
WebKit shipped in a real macOS/iOS Safari release (different build
flags, no Apple-specific extensions, no real Safari privacy/security
policies, no real device constraints like memory pressure or touch
input). Do not describe Batch 7's WebKit results as "Safari validated."

## Functional QA scope (per browser)

```text
fresh boot (both skins)
corrupt data recovery
invalid skin ID fallback
deck JSON import: valid / invalid JSON / unsafe field rejection
Deck Editor: category add, unsaved-changes warning
Gallery load (both skins)
skin switching
Match Setup: 2-player not selectable
3-player match to Result
4-player match to Result
Result: rematch/TOP options present
Modal open/close (reset confirmation)
reload on TOP
```

## Visual regression scope (Tier A, per browser)

```text
TOP
Deck List
Deck Editor
Gallery
Match Setup
きせかえ (SkinSelector) Modal
Corrupted-storage recovery (partial salvage toast)
Quota-exceeded save toast
```

Both skins. Priority viewports (narrowest / standard smartphone
landscape / widest desktop, per instruction):

```text
844x390   (narrowest, reference size)
852x393   (standard smartphone landscape)
1366x768  (widest desktop)
```

The remaining two of the 5 standard viewports (932x430, 1024x600) were
not added to the Tier A cross-browser suite this batch — scope
reduction, documented here per the "record the reason" convention
established in Batch 5/6: this is a genuine reduction of visual
coverage relative to the Chromium suite's full 5 viewports, done to
keep the cross-browser suite's runtime and baseline count proportionate
to what a first cross-browser pass needs (8 screens × 2 skins × 3
viewports × 2 browsers = 96 cases, already comparable in size to the
Chromium suite's 70). Result/Match were also not added to the
cross-browser visual suite (same reason as Batch 5/6's Chromium suite:
match seed is non-deterministic — functional QA above proves Result
reachability instead of pixel-diffing it).

## Accessibility scope (per browser)

```text
heading hierarchy (exactly one h1)
every button has an accessible name
dialog role/aria-modal/aria-labelledby
import textarea aria-label
import rejection reasons: visible + live-region wrapped
game tile accessible names + aria-pressed
keyboard: Tab moves focus, Enter opens modal, Escape closes + returns focus
200%-zoom-equivalent viewport: no horizontal overflow
reduced motion: full content renders, no console errors
```

Semantic/programmatic DOM inspection only — same methodology as Gate
6's `scripts/gate6-qa-04-accessibility-acceptance.mjs`, parameterized
to run under Firefox and WebKit via
`scripts/batch7-cross-browser-accessibility.mjs`.

## Screen reader scope

```text
macOS VoiceOver: ATTEMPTED, BLOCKED — see BATCH-7-CROSS-BROWSER-A11Y-REPORT.md
  "Screen Reader Acceptance" section for the exact reason (user denied
  the computer-use browser-access grant required to drive Safari under
  VoiceOver).
NVDA: not used (Windows-only, no Windows environment available)
JAWS: not used (Windows-only, no Windows environment available)
```

## P0-P3 classification (same scheme as Gate 6, extended)

```text
P0: data destruction, cannot boot, public-demo-stopping
P1: primary flow impossible in a target browser, screen-reader-primary-
    flow-impossible if accessibility is a public-demo requirement
P2: avoidable but should be fixed before broader RC claim
P3: cosmetic / improvement candidate
By design: matches documented/intended behavior
Browser engine limitation: a real, verified difference in how an
  engine behaves (e.g. Safari/WebKit's default Tab order excludes
  buttons unless Full Keyboard Access is enabled) — not a product bug,
  not fixable by this app, does not block RC unless it makes a primary
  flow actually impossible (verified: it does not, since VoiceOver/
  click-based navigation remain available)
Screen reader limitation: could not be verified due to environment access
Test script defect: the QA script's assumption/technique was wrong
Documentation defect: docs/evidence text was wrong
Environment limitation: cannot be verified in this environment
```

## Decision criteria

**COMPLETE**: all planned functional/visual/accessibility scope executed,
P0/P1 = 0 across all validated browsers, VoiceOver either genuinely
completed or genuinely BLOCKED-and-documented (not silently skipped).

**CONDITIONAL**: P0/P1 = 0, but a scoped P2 remains with documented
impact/workaround, or a planned scope item was reduced with a recorded
reason (this batch already reduced viewport/screen coverage for the
cross-browser visual suite, documented above — that reduction alone
does not force CONDITIONAL if functional coverage is complete and P0/P1
are both 0).

**BLOCKED**: P0/P1 open in any validated browser, or a target browser
cannot complete primary flows at all.

RC readiness terms (unchanged from Gate 6's scheme):
`READY` / `LIMITED READY` / `NOT READY` — see the Report for the actual
decision and reasoning.
