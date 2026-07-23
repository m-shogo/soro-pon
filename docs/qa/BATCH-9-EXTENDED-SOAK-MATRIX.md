# Batch 9 — Extended Memory & Runtime Stability Soak Matrix

Not a new feature Gate. Gate 6 remains PASS, unchanged. This batch closes
one specific open item carried in the RC "LIMITED READY" list since
Batch 6: **extended memory / long-running runtime stability soak**. Its
purpose is to gather real, long-run evidence that the app does not leak
memory, DOM nodes, event listeners, or timers, and does not corrupt state
or crash over sustained repeated use.

Date: 2026-07-23.

> This matrix is fixed **before** any soak run, per the Batch 9
> instruction to define duration, scenarios, metrics, and acceptance
> thresholds up front. The harness and thresholds below are the contract
> the run is judged against; the run does not get to move the goalposts
> after seeing its own numbers.

## Scope

```text
Batch 9 name: Extended Memory & Runtime Stability Soak
Purpose: prove (with real long-run measurement) that repeated match /
  replay / navigation / storage / modal / skin-switch operation does not
  leak heap, DOM nodes, event listeners, or timers, does not corrupt
  persisted or in-memory state, and does not crash — in both official
  skins, 3p and 4p.
In scope: Chromium primary soak (authoritative memory numbers) + Firefox
  and WebKit auxiliary stability soak (crash/error/functional stability
  only, NOT memory-parity claims).
Not in scope: new features, Gate 7/8, VoiceOver caption mechanical
  capture (a tooling limitation, not a product item), Safari/iOS/Android
  physical-device validation, real deploy-target rollback rehearsal, any
  large UI redesign.
```

## Why Chromium is authoritative for memory

`performance.memory` (JS-exposed) is intentionally quantized/noised by
modern Chromium for fingerprinting protection, so it cannot see small
heap deltas. Batch 9 reads **real, unquantized** numbers over the Chrome
DevTools Protocol instead:

```text
CDP Performance.getMetrics  -> JSHeapUsedSize (real used heap, bytes)
CDP Memory.getDOMCounters   -> nodes, documents, jsEventListeners
window instrumentation      -> live setTimeout/setInterval/rAF balance,
                               localStorage key count + serialized bytes
```

Firefox and WebKit (via Playwright) do not expose the same CDP memory
domain, so their soak records **crashes, page errors, console errors,
failed requests, and functional completion only**. No cross-browser
memory-equality claim is made from them — that mirrors the Batch 7 rule.

## Forced GC before every heap sample

A raw heap number right after activity is dominated by not-yet-collected
garbage and is meaningless for leak detection. Before every heap sample
the harness forces collection via CDP `HeapProfiler.collectGarbage`
(falling back to `Performance` idle settle if unavailable) and then reads
`JSHeapUsedSize`. Leak judgments use **post-GC** heap only. A single
post-GC spike is not a leak; a monotonic post-GC climb across the run is.

## Timer / listener instrumentation

Because CDP `jsEventListeners` counts DOM listeners but not JS timers,
the harness installs a tiny counter shim at page-init time (before app
scripts run) that increments on `setTimeout`/`setInterval`/
`requestAnimationFrame` creation and decrements on clear/fire, exposing a
**live balance** of outstanding timers. A steadily rising outstanding
`setInterval`/rAF balance across cycles is the signature of the most
common React leak (an effect that starts a timer and never clears it) and
is a FAIL candidate. The shim is a measurement artifact injected by the
harness only — it is not shipped product code.

## Duration & cycle target

```text
Primary target (COMPLETE-eligible): >= 60 minutes continuous Chromium
  soak OR >= 100 completed cycles, whichever comes first, covering all
  four (skin x player-count) combinations in rotation.
Fallback (CONDITIONAL-eligible): if the environment cannot sustain 60
  min / 100 cycles (dev-server instability, host resource limits, time
  budget), a run of >= 30 minutes AND >= 40 cycles is recorded as
  CONDITIONAL with the shortfall stated explicitly — never silently
  upgraded to COMPLETE.
Warm-up excluded from trend math: the first 5 minutes OR first 10 cycles
  (whichever is longer) are treated as warm-up (lazy chunks, image
  decode, first-run caches settle here) and excluded from the growth-rate
  comparison, though still recorded.
```

A "cycle" = one full navigation + interaction unit from the scenario
pool below, driven to its natural completion (e.g. a match played to
Result, or a modal opened and closed), returning the app to a known
resting screen.

## Scenario pool (rotated across cycles)

Each cycle picks the next scenario in rotation with a deterministic seed
so the run is reproducible:

```text
S1  Yorunoshirube 3p match -> Result                (heap/state heavy)
S2  Yorunoshirube 4p match -> Result
S3  Cute Pop 3p match -> Result
S4  Cute Pop 4p match -> Result
S5  Result -> もう一局 replay -> Result (rematch loop)
S6  Result -> TOPへ (return to TOP)
S7  TOP -> Match Setup -> back to TOP (re-entry, no match)
S8  Skin switch via きせかえ modal (yoru <-> cute), open+select+close
S9  Modal open/close churn (きせかえ open then とじる, no selection)
S10 JSON Import round-trip (open import, paste valid deck, confirm/cancel)
S11 Deck List -> Deck Detail -> Deck Editor -> back round-trip
S12 In-app reload (page.reload at a resting screen) — boot-path churn
S13 Corrupted-state fixture load (seed a broken deck entry, boot,
    confirm graceful salvage, no crash) then restore good state
S14 Reset-confirmation dialog opened and CANCELLED only (never confirmed
    — a confirmed reset would wipe fixtures mid-run; cancel exercises the
    dialog mount/unmount + focus path without destroying state)
```

Scenario weighting favours the memory-heavy match/replay scenarios
(S1–S5) since those exercise the largest object graphs (engine match
state, tile arrays, result scoring), while still hitting navigation,
storage, modal, and boot paths every rotation.

## Metrics captured per cycle (JSONL, one line per cycle)

```text
cycle#           monotonic counter
tSinceStartMs    elapsed since soak start
scenario         S1..S14
skin             yorunoshirube | cute-pop | (n/a for skinless scenarios)
playerCount      3 | 4 | null
reachedResult    bool (match scenarios only)
heapUsedBytes    POST-GC JSHeapUsedSize
domNodes         CDP Memory.getDOMCounters.nodes
domDocuments     CDP Memory.getDOMCounters.documents
jsListeners      CDP Memory.getDOMCounters.jsEventListeners
liveTimers       outstanding setTimeout/setInterval/rAF balance (shim)
localStorageKeys count of localStorage keys
localStorageBytes serialized byte length of all localStorage values
cycleDurationMs  wall time for the cycle (perf stability)
pageErrors       count this cycle
consoleErrors    count this cycle
failedRequests   count this cycle
note             failure reason / anomaly, else null
```

JSONL is appended incrementally (one flushed line per cycle); the harness
never retains an unbounded in-memory array of samples, and computes trend
statistics from a bounded rolling window plus running aggregates.

## Screenshots (bounded)

Screenshots are captured **only** at: soak start, 15 min, 30 min, 45 min,
60 min (or final cycle), on any failure, and one final resting-screen
shot per skin. This caps evidence-image growth (the Batch 6 lesson:
non-deterministic screenshots must not flood git). No per-cycle
screenshots.

## Acceptance thresholds

Judged on the **post-warm-up** window (see Duration section). "first-10"
and "last-10" refer to the first and last 10 non-warm-up cycles.

```text
Heap (post-GC):
  PASS       last-10 median <= first-10 median * 1.20 (<=20% growth)
  INVESTIGATE 20% < growth <= 50%  -> inspect for a specific leak; may
              still PASS if attributable to a bounded cache that plateaus
  FAIL        > 50% growth AND monotonic (no plateau) across the run

DOM nodes (at matching resting screen):
  PASS        last-10 median <= first-10 median * 1.10 (<=10% growth)
  INVESTIGATE 10-25% growth
  FAIL        > 25% growth AND monotonic (detached-node retention)

Event listeners (CDP jsEventListeners, resting screen):
  PASS        no consistent per-cycle upward slope (flat within noise)
  FAIL        clear positive per-cycle slope over the whole run

Live timers (shim balance, resting screen):
  PASS        returns to a stable baseline each cycle (no per-cycle climb)
  FAIL        outstanding timer balance grows per cycle (uncleared
              interval/rAF)

localStorage:
  PASS        key count and byte size bounded (no unbounded per-cycle
              accumulation of records/log entries)
  INVESTIGATE steady growth that is expected-by-design (e.g. records of
              played matches) — must be bounded or documented as intended

Runtime performance (cycleDurationMs, per scenario class):
  PASS        p95 of last-10 <= p95 of first-10 * 1.25 (<=25% slowdown)
  INVESTIGATE 25-60% slowdown
  FAIL        > 60% sustained slowdown (GC thrash / accumulation)

Stability (any browser):
  FAIL (P0)   any crash, blank screen, or unrecoverable error during soak
  FAIL (P1)   any match that cannot reach Result, or state corruption
              (a good deck lost, records double-counted on replay)

Single-spike rule: an isolated one-cycle spike in any metric is NOT a
FAIL by itself; only a sustained trend across the post-warm-up window is.
```

## P0-P3 classification (same scheme as Batch 6/7/8)

```text
P0: crash, data destruction, cannot boot, blank screen mid-soak
P1: match cannot complete, state corruption, monotonic unbounded leak
    that would exhaust memory in a plausible session, replay double-count
P2: bounded-but-avoidable growth that should be fixed before a stronger
    stability claim (e.g. a cache that grows larger than needed)
P3: minor perf jitter, cosmetic log noise, non-leaking churn
By design: matches documented/intended behavior (e.g. match records
    accumulate in localStorage by design, but bounded)
Harness defect: the soak script's own measurement/technique was wrong
Browser/measurement limitation: cannot be measured in this environment
    (e.g. Firefox/WebKit real heap not CDP-exposed)
```

Only **real product leaks** get product-code fixes: uncleared
setInterval/setTimeout/rAF, uncleared event listeners, effects without
cleanup, retained match/result state after leaving the screen, detached
DOM retention, un-revoked object URLs, unbounded skin-asset cache. Harness
defects are fixed in the harness. Browser/measurement limitations are
recorded honestly, not worked around with fake numbers.

## Decision criteria

**COMPLETE**: primary duration/cycle target met, all acceptance
thresholds PASS (or INVESTIGATE items resolved as bounded-by-design),
P0/P1 = 0, and the RC memory-soak gap is closed with real long-run data.

**CONDITIONAL**: real soak data gathered but only at the fallback
duration/cycle level, OR an INVESTIGATE item remains open pending a
follow-up, with P0/P1 = 0. RC memory-soak gap **narrowed**, not fully
closed.

**BLOCKED**: the soak could not be run at all (environment could not
sustain a meaningful run), or a P0/P1 leak/crash was found and is still
open.

RC readiness terms (unchanged scheme): `READY` / `LIMITED READY` /
`NOT READY` — see the Report for the actual decision. Batch 9 does not by
itself promote RC to READY (real screen-reader Result capture,
physical-device, and real-deploy-rollback items remain open regardless).
