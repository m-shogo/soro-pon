# Batch 9 — Extended Memory & Runtime Stability Soak Report

Date: 2026-07-23. Design contract (fixed before running):
[BATCH-9-EXTENDED-SOAK-MATRIX.md](./BATCH-9-EXTENDED-SOAK-MATRIX.md).
Harness: `scripts/qa/run-batch9-soak.mjs`. Runbook (CI decision):
[docs/release/SOAK-RUNBOOK.md](../release/SOAK-RUNBOOK.md).

Not a new feature Gate. Gate 6 remains PASS unchanged. Batch 9 targets
the one RC "LIMITED READY" open item tracked since Batch 6: extended
memory / long-running runtime stability soak.

## Method

All numbers below come from real browser automation against the Vite
dev server (localhost:5199), not from human manual play. Chromium is
the authoritative memory run per the matrix: post-GC
`JSHeapUsedSize` via CDP `Performance.getMetrics` (unquantized) with a
forced `HeapProfiler.collectGarbage` before every sample, plus
`Memory.getDOMCounters` (nodes / documents / jsEventListeners), a
page-init timer/rAF counter shim (measurement artifact, not shipped
code), and localStorage key/byte tracking. One JSONL line per cycle,
flushed incrementally; screenshots only at boundary times / failure /
final.

Firefox and WebKit run the same scenario rotation as auxiliary
**stability-only** soaks (crash / pageerror / console error / request
failure / functional completion). They do not expose the CDP memory
domain, so no memory numbers are recorded for them and **no
cross-browser memory-parity claim is made** (same scoping rule as
Batch 7; "WebKit" is Playwright's WebKit build, not real Safari).

## Harness smoke validation (before the real run)

A 13-cycle smoke (one full scenario rotation, 11.7 min) validated the
harness first: 13/13 cycles ran, 5/5 matches reached Result, 0
page/console errors. It found **2 harness defects, both fixed before
the primary run** (S10 `getByLabel` resolving both the modal dialog and
the textarea; `読み込む` substring-matching TOP's `JSONを読み込む` —
the same getByRole-substring pitfall class as Batch 7). Product code:
0 changes. Evidence: `soak-smoke.jsonl` / `soak-smoke-summary.json`
(the cycle-5 failure note is the record of that discovery).

## Primary run (Chromium) — results

```text
Duration: 62.3 min continuous (target >=60 min: MET)
Cycles: 74 (all 13 scenarios x 5-6 rotations; 100-cycle alternative
  not needed — the 60-min OR 100-cycle target is disjunctive)
Matches driven to Result: 28 of 29 attempted (yoru/cute-pop x 3p/4p
  + replay double-matches)
Page errors: 0. Console errors: 0. Aborts: 0. Crashes: 0.
Cycle exceptions after harness fixes: 0 (cyclesWithNote = 0)
```

Evidence: `soak-chromium-primary.jsonl` (74 lines),
`soak-chromium-primary-summary.json`, `shots/chromium-primary-*.png`
(start / 15 / 30 / 45 / 60 min / final — no failure shots were taken
because no cycle failed).

### Threshold judgments (matrix contract vs. measured)

| Metric | first-10 vs last-10 | Matrix band | Resolution |
|---|---|---|---|
| Heap (post-GC) | 6.45 MB → 8.26 MB (+28%) | INVESTIGATE (20-50%) | **PASS after investigation** — see below |
| DOM nodes | 197 → 222 (+12.7%) | INVESTIGATE (10-25%) | **PASS after investigation** — bounded oscillation |
| jsEventListeners | 184 → 186 (+1.1%) | PASS | **PASS** (range 182-194 all run) |
| Live timers (shim) | 1 → 1 (0%) | PASS | **PASS** (constant 1 app-level interval) |
| localStorage | 19.2 KB → 24.9 KB (+29.5%) | expected-by-design band | **PASS** — bounded by design, see below |
| Match cycle p95 | 240 s → 321 s (+33.4%) | INVESTIGATE (25-60%) | **PASS after investigation** — game-length variance, see below |

**Heap +28% is a windowing artifact, not a leak.** 8-cycle bucket
medians across the whole run: 7.59 → 7.77 → 6.06 → 7.58 → 7.61 → 7.81 →
7.87 → 7.72 → 7.88 → 7.89 MB. The series oscillates in a tight 5.80-8.09
MB absolute band with a mid-run *dip*, and the last four buckets are flat
(7.72-7.89). The matrix's FAIL condition (monotonic climb, no plateau)
is demonstrably absent; the first-10/last-10 delta comes from which
resting states those windows happened to sample (TOP renders a
最近の記録 panel — capped at 3 entries by `records.slice(0, 3)` in
AppRoot — only after matches have accumulated).

**DOM +12.7% is the same bounded oscillation.** Nodes range 126-498
depending on the resting state (TOP with/without the 3-entry records
panel, post-modal states), with bucket medians oscillating 197↔260 and
no monotonic trend. Listeners stay in a 12-count band all hour —
detached-DOM retention would drag listeners up with it, and does not.

**localStorage growth is the by-design match-record accumulation.**
Key count stayed 3-4 the entire run; byte growth (9.0 KB → 25.5 KB over
28 recorded matches) is `soro-pon.records.v1`, which the store caps at
100 records / 20 recent-match keys (`localStorageRecordsStore.ts`
`slice(0, 100)` / `slice(0, 20)`), i.e. a bounded plateau the run had
not yet reached. This is exactly the matrix's "expected-by-design,
bounded" category.

**Match p95 +33.4% is game-outcome variance, not runtime degradation.**
Match autoplay duration is dominated by how many turns the random game
takes (observed 12 s - 321 s in both halves of the run). The
deterministic scenarios — the honest runtime-slowdown indicators — are
completely flat across the hour: modalChurn 114→109 ms, skinSwitch
82→74 ms, setupReentry 41→45 ms, deckRoundTrip 168→167 ms, reload
65→64 ms, resetCancel 55→54 ms. There is no runtime slowdown.

### Non-defect findings

```text
1 match not reaching Result (cycle 16, yoru 4p): hit the harness's own
  4-minute autoplay cap while the game was still progressing normally
  (no error, no stall signature). Classification: harness cap
  limitation, not a product defect. The same S2 scenario completed in
  5 other rotations (14 s - 167 s).
45 failed requests, all ERR_ABORTED, all inside S13 (corrupted-fixture
  double reload): in-flight skin-asset fetches cancelled by the
  navigation/reload. Same benign navigation-abort pattern already
  classified in Batch 7. 0 request failures in all other 69 cycles.
  Classification: browser navigation behavior, not a product defect.
```

### Primary run verdict

Product defects found: **0** (P0/P1/P2/P3 = 0/0/0/0). No memory leak,
no DOM/listener/timer growth, no storage unboundedness, no performance
degradation, no crash, in 62.3 min of continuous mixed-scenario
operation across both skins and both player counts.

## Auxiliary runs (Firefox / WebKit) — stability only

Both ran the same 13-scenario rotation for 20 cycles (≥20-cycle target
met), in parallel with each other after the Chromium run had finished
(never concurrent with the authoritative memory run).

```text
Firefox: 20/20 cycles, 14.6 min. Matches to Result: 8/8. Page errors 0,
  console errors 0, aborts/crashes 0, cycle exceptions 0. 3 failed
  requests, all NS_BINDING_ABORTED (Firefox's name for a fetch cancelled
  by navigation/skin switch) — same benign class as Chromium's
  ERR_ABORTED. Verdict: STABLE.
WebKit (Playwright's WebKit build, NOT real Safari): 20/20 cycles,
  19.8 min. Matches to Result: 7/8 — the 1 non-completion (cycle 19,
  cute-pop 3p, 240 s) hit the same harness 4-minute autoplay cap as
  Chromium's cycle 16, with no error and normal game progress: harness
  cap limitation, not a product defect. Page/console errors within
  cycles: 0. 2 failed requests ("cancelled", inside S13's reload) plus
  2 fetch-cancellation events that WebKit reports as "Fetch API cannot
  load … due to access control checks" during reload teardown — these
  landed in the boundary window between cycles (hence cycle totals of
  0) and are the same WebKit navigation-cancellation reporting pattern
  already classified as benign in Batch 7; every affected cycle
  completed and the app booted normally. Verdict: STABLE.
```

Evidence: `soak-firefox-aux.jsonl` / `-summary.json`,
`soak-webkit-aux.jsonl` / `-summary.json`, `shots/*-aux-*.png`. Per the
matrix, these runs support only a stability claim (no crash, no error,
functional completion); they say nothing about memory, and no
Chromium-equivalent memory claim is made for them.

## Decision

### Finding classification (matrix P0-P3 scheme)

```text
Product defects (P0/P1/P2/P3): 0 / 0 / 0 / 0 — nothing to fix.
Harness defects: 2 (S10 getByLabel double-resolution, 読み込む substring
  match) — both found in the pre-run smoke and fixed in the harness
  before the primary run. Product code: 0 changes in all of Batch 9.
Harness limitations: 1 (4-minute per-match autoplay cap; hit by 2 of 37
  total match attempts across the three runs, both with normal game
  progress and no error).
Browser/environment (benign): navigation-cancelled asset fetches
  (Chromium ERR_ABORTED x45 all in S13, Firefox NS_BINDING_ABORTED x3,
  WebKit "cancelled"/access-control-styled cancellation x4) — the same
  navigation-abort class already classified in Batch 7.
```

### Batch 9 decision: **COMPLETE**

Against the matrix's criteria: the primary duration target was met
(62.3 min ≥ 60 min continuous; the 100-cycle alternative was not needed
as the targets are disjunctive), every acceptance threshold lands PASS
(the three INVESTIGATE-band readings were each resolved with data —
plateaued heap oscillation, bounded DOM oscillation, by-design-capped
localStorage, flat deterministic-scenario timings), and P0/P1 = 0 with
zero product defects of any severity.

Scope of the claim (precise): "no memory leak / no DOM-listener-timer
growth / no runtime degradation" is demonstrated for **Chromium** over
62.3 min of mixed-scenario operation on the dev server; Firefox and
WebKit are additionally shown **stable** (no crash/error, functional
completion) over 20 cycles each, without memory instrumentation. Not
claimed: real-Safari/mobile-device soak, production-build soak longer
than this run, or anything about environments not exercised here.

### RC readiness

`LIMITED READY` (unchanged as a status), with the **extended
memory-soak open item now closed** — the item tracked since Batch 6's
"未実施: 長時間memory soak test" is done with real long-run data.
Remaining open items are unchanged and are what keep RC at LIMITED
READY: real iPhone/iPad Safari and Android devices, real
deploy-environment rollback, Safari+VoiceOver, NVDA/JAWS, and the
Batch 8 tooling-limited Result static-text speech capture. Per the
matrix, Batch 9 does not by itself promote RC to READY.

### CI decision

The extended soak is **not** added to CI (60+ min runtime is
incompatible with the ~1-min PR pipeline, and the trend-based pass/fail
needs sample counts a CI-sized run cannot provide). It is a manual
pre-release gate; the trigger conditions and exact commands are recorded
in [docs/release/SOAK-RUNBOOK.md](../release/SOAK-RUNBOOK.md).
