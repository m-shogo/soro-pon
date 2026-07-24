# Batch 11 — Production Cross-Browser Auxiliary Validation Matrix

Date: 2026-07-24. Status: **CONTRACT DEFINED / NOT YET EXECUTED**.
Not a new feature Gate. Gate 6 remains PASS. Batch 8 (CONDITIONAL),
Batch 9 (COMPLETE), and Batch 10 (CONDITIONAL) results, scopes, and
evidence are not revisited or weakened by this batch.

Purpose: run the **production build** (not the dev server) through its
core flows and a short stability rotation in **Firefox** and
**Playwright WebKit**, closing the one gap Batch 10 named as executable
without new hardware — production-build behavior in non-Chromium
engines. This is an auxiliary stability pass, not a memory pass and not
a real-device/real-Safari/real-AT pass.

> The contract was originally created at commit `c9b18b6` from the
> Batch-10 end state. Product and documentation changes were committed
> afterward during the integrity review. Therefore **`6a844dd` is not an
> executable baseline anymore**. Preflight must freeze and record the
> exact current `HEAD == origin/main`; all Batch 11 build/flow/rotation
> evidence must come from that same SHA. Never combine an old artifact
> result with a newer documentation or product HEAD.

`Actual result` / `Classification` are filled only by the report after
execution.

## Non-negotiable scoping rules

```text
Playwright WebKit is NOT real Safari, iOS Safari, or macOS Safari.
  It shares the WebKit engine but not Safari's UI, integrations, real
  device viewport, Web Inspector, or VoiceOver bridge.
A WebKit PASS is NOT a Safari+VoiceOver PASS and NOT an iOS Safari PASS.
Firefox and WebKit results do NOT generalize to any real device.
No memory-leak claim is made for Firefox or WebKit. Their CDP memory
  domain is unavailable; memory fields are recorded as not_available
  with a reason, never as 0.
Chromium-only CDP memory numbers are NOT placed in a cross-browser
  ranking. Cross-browser comparison is functional/stability only.
A local production preview is NOT a deploy.
This batch does not promote RC to READY; real-device, real-Safari,
  real-AT, and real-deploy gates remain open, so RC stays LIMITED READY.
Every result file, screenshot index, build inventory, and report records
  the same execution commit SHA.
If HEAD changes after any execution item starts, discard/relabel that
  partial run and restart the matrix from preflight on the new HEAD.
```

## Environment inventory

The following was probed on 2026-07-24 when the contract was written and
must be re-probed at execution. It is historical planning input, not an
execution result.

```text
Host OS observed:   macOS 26.4.1 (25E253)
Node/pnpm observed: v24.15.0 / 11.1.2
Playwright observed: 1.61.1
Chromium reference:  149.0.7827.55 (Batch 10 only; not a Batch 11 rerun)
Firefox observed:    151.0 (Playwright-bundled)
WebKit observed:     26.5 (Playwright-bundled — NOT Safari)
Planned server:      production (vite build → vite preview), port 4199
Execution baseline:  TO BE RECORDED by B11-PREFLIGHT-01
```

## Test matrix

| Test ID | Engine | Build | Scenario | Measurement | Evidence | PASS | FAIL/BLOCK | Actual | Class | Claim scope |
|---|---|---|---|---|---|---|---|---|---|---|
| B11-PREFLIGHT-01 | n/a | — | freeze git/toolchain/CI baseline | exact HEAD, origin/main, clean tree, versions, CI | preflight log | HEAD==origin/main; clean; prior CI green; versions re-probed | dirty/behind/unknown SHA or required tool unavailable | *(report)* | — | this repo/host only |
| B11-BUILD-01 | n/a | production | typecheck + all unit tests including storage failure-path tests + skin validation + build | command exits, artifact hashes, module count | build log + inventory | all commands exit 0; artifacts present; every file names execution SHA | any command/build fails | *(report)* | — | exact execution SHA artifact |
| B11-FF-01 | Firefox | production preview | both skins, 3p+4p core flow walkthrough | functional result; memory not_available | flow JSON + PNG | all flow steps pass; 0 non-benign errors | any step/error failure; preview unavailable = BLOCK | *(report)* | *(report)* | Firefox on local production preview only |
| B11-FF-02 | Firefox | production preview | ≥20 cycles OR ≥15 min rotation | cycle/Result/error counters; memory not_available | JSONL + summary | 0 errors/dead-end/corruption | product error/dead-end; unstable preview = BLOCK | *(report)* | *(report)* | Firefox stability only |
| B11-FF-03 | Firefox | production preview | page/console/rejection/request monitoring | error counts and samples | summary | 0 non-benign errors | non-benign error | *(report)* | *(report)* | Firefox only |
| B11-WK-01 | Playwright WebKit | production preview | both skins, 3p+4p core flow walkthrough | functional result; memory not_available | flow JSON + PNG | all flow steps pass; 0 non-benign errors | any step/error failure; preview unavailable = BLOCK | *(report)* | *(report)* | Playwright WebKit only; NOT Safari |
| B11-WK-02 | Playwright WebKit | production preview | ≥20 cycles OR ≥15 min rotation | cycle/Result/error counters; memory not_available | JSONL + summary | 0 errors/dead-end/corruption | product error/dead-end; unstable preview = BLOCK | *(report)* | *(report)* | WebKit stability only; NOT Safari |
| B11-WK-03 | Playwright WebKit | production preview | page/console/rejection/request monitoring | error counts and samples | summary | 0 non-benign errors | non-benign error | *(report)* | *(report)* | WebKit only; NOT Safari |
| B11-COMPARE-01 | all recorded engines | mixed historical/current | scope-safe comparison | functional/stability only | comparison table | memory excluded from ranking; source batch/SHA explicit | cross-SHA result blended or memory ranked cross-browser | *(report)* | — | comparison only |
| B11-DOCS-01 | n/a | — | claim/readiness/current-status sync | README, AGENTS, CLAUDE, release gates, matrix/report | contradiction search + diff | docs say Batch 11 COMPLETE only after evidence; RC remains LIMITED READY | stale baseline, overclaim, or unsupported PASS | *(report)* | — | documentation only |

## Reused harness rules

```text
Rotation (B11-FF-02 / WK-02): reuse scripts/qa/run-batch9-soak.mjs only
  after verifying its browser guard and output schema at execution HEAD.
  Use --base=http://localhost:4199, a batch-11 output root, and unique
  per-browser labels. Firefox/WebKit memory remains not_available/null.
Core flow (B11-FF-01 / WK-01): the browser-parameterized harness records
  engine, engine version, execution SHA, base URL, build mode, and result
  in every evidence file. It never writes 0 for an unmeasured metric.
Evidence directories from an abandoned/older-SHA attempt must not be
  silently reused. Move them to a clearly named superseded directory or
  delete them before the final evidence commit.
```

## Finding classification

```text
PRODUCT_DEFECT / HARNESS_DEFECT / TEST_DATA_DEFECT /
ENVIRONMENT_BLOCKER / BENIGN_BROWSER_BEHAVIOR / EXPECTED_BY_DESIGN /
DOCUMENTATION_DEFECT
```

Severity: P0 data loss / severe security / main path fully broken; P1
release-blocking, a normal user cannot finish a main flow; P2 significant
with a workaround; P3 minor. Product code changes only on a reproducible
product defect. Any product-code fix invalidates prior Batch 11 execution
artifacts and requires preflight/build/core-flow/rotation rerun from the
new HEAD.

## Decision criteria

**COMPLETE**: the production build reproduces at one recorded SHA, both
engines pass core flow and rotation with zero open product defects, the
comparison is scope-safe, and documentation is synchronized.

**CONDITIONAL**: executable items pass but an item remains unresolved or
a non-P0/P1 limitation prevents full closure.

**BLOCKED**: the production build cannot be reproduced, the preview
cannot serve an engine, the execution SHA is ambiguous/mixed, or a P0/P1
is open.

RC readiness terms are the existing ones only (`READY` /
`LIMITED READY` / `NOT READY`). This batch does not promote RC: while
real-device, real-Safari, real-AT, and real-deploy gates remain open, RC
stays **LIMITED READY** regardless of Firefox/WebKit results.
