# Batch 11 — Production Cross-Browser Auxiliary Validation Matrix

Date: 2026-07-24. Not a new feature Gate. Gate 6 remains PASS. Batch 8
(CONDITIONAL), Batch 9 (COMPLETE), and Batch 10 (CONDITIONAL) results,
scopes, and evidence are **not** revisited or weakened by this batch.

Purpose: run the **production build** (not the dev server) through its
core flows and a short stability rotation in **Firefox** and
**Playwright WebKit**, closing the one gap Batch 10 named as executable
without new hardware — production-build behavior in non-Chromium
engines. This is an auxiliary stability pass, not a memory pass and not
a real-device/real-Safari/real-AT pass.

> Fixed **before** execution. `Actual result` / `Classification` are
> filled in by the report.

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
```

## Environment inventory (probed 2026-07-24, before execution)

```text
Host OS:   macOS 26.4.1 (25E253)
Node/pnpm: v24.15.0 / 11.1.2
Playwright: 1.61.1
Chromium:  149.0.7827.55 (Batch 10 baseline; not re-run here)
Firefox:   151.0 (Playwright-bundled)
WebKit:    26.5 (Playwright-bundled — NOT Safari)
Build:     production (vite build → vite preview), port 4199
Baseline:  HEAD == origin/main == 6a844dd (Batch 10 End HEAD)
```

## Test matrix

| Test ID | Engine | Version | Build | Server | Skin | Players | Scenario | Measurement | Evidence | PASS | FAIL | BLOCK | Actual | Class | Claim scope |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| B11-PREFLIGHT-01 | n/a | — | — | — | — | — | git baseline + toolchain + CI | versions, HEAD | preflight log | HEAD==origin/main, CI green | dirty/behind | — | *(report)* | — | this repo/host only |
| B11-BUILD-01 | n/a | — | production | — | both | — | reproduce build at HEAD | artifact hashes, module count | build log + inventory | build exit 0, artifacts present | build fails | — | *(report)* | — | commit 6a844dd artifact |
| B11-FF-01 | Firefox | 151.0 | production | preview 4199 | both | 3p+4p | core flow walkthrough | functional pass/fail; memory not_available | flow JSON + PNG | all flow steps pass, 0 errors | any step fails / error>0 | preview cannot serve | *(report)* | *(report)* | Firefox on local prod preview only |
| B11-FF-02 | Firefox | 151.0 | production | preview 4199 | both | 3p+4p | ≥20 cycles OR ≥15 min rotation | cycle counts, Result completion, error counters; memory not_available | JSONL + summary | 0 page/console/rejection, 0 dead-end, 0 corruption | product error / dead-end | preview unstable | *(report)* | *(report)* | Firefox stability only, no memory claim |
| B11-FF-03 | Firefox | 151.0 | production | preview 4199 | both | 3p+4p | console/page/rejection monitoring | error counts, abort classification | summary errorSamples | 0 non-benign errors | non-benign error | — | *(report)* | *(report)* | Firefox only |
| B11-WK-01 | WebKit | 26.5 | production | preview 4199 | both | 3p+4p | core flow walkthrough | functional pass/fail; memory not_available | flow JSON + PNG | all flow steps pass, 0 errors | any step fails / error>0 | preview cannot serve | *(report)* | *(report)* | Playwright WebKit (NOT Safari), local prod preview only |
| B11-WK-02 | WebKit | 26.5 | production | preview 4199 | both | 3p+4p | ≥20 cycles OR ≥15 min rotation | cycle counts, Result completion, error counters; memory not_available | JSONL + summary | 0 page/console/rejection, 0 dead-end, 0 corruption | product error / dead-end | preview unstable | *(report)* | *(report)* | WebKit stability only, no memory claim, not Safari |
| B11-WK-03 | WebKit | 26.5 | production | preview 4199 | both | 3p+4p | console/page/rejection monitoring | error counts, abort classification | summary errorSamples | 0 non-benign errors | non-benign error | — | *(report)* | *(report)* | WebKit only, not Safari |
| B11-COMPARE-01 | all | — | production/dev mixed | — | both | 3p+4p | Chromium/Firefox/WebKit comparison | functional/stability only | comparison table | table produced, memory kept Chromium-only | memory used cross-browser | — | *(report)* | — | functional/stability comparison only |
| B11-DOCS-01 | n/a | — | — | — | — | — | claim scope + readiness sync | doc consistency | README/CLAUDE/gates | docs match evidence, RC stays LIMITED READY | overclaim present | — | *(report)* | — | — |

## Reused harness rules

```text
Rotation (B11-FF-02 / WK-02): reuses scripts/qa/run-batch9-soak.mjs,
  which already guards CDP behind BROWSER==='chromium' and records
  memory fields as null with memoryAuthority "not measured
  (stability-only run)" for Firefox/WebKit. Invoked with
  --base=http://localhost:4199 (production preview), --out-root pointing
  at batch-11 evidence, and a per-browser --label so files never
  collide. No Chromium behavior is changed.
Core flow (B11-FF-01 / WK-01): a browser-parameterized harness records
  engine + version in every evidence file and marks memory as
  not_available. It never writes 0 for an unmeasured metric.
```

## Finding classification (used by the report)

```text
PRODUCT_DEFECT / HARNESS_DEFECT / TEST_DATA_DEFECT /
ENVIRONMENT_BLOCKER / BENIGN_BROWSER_BEHAVIOR / EXPECTED_BY_DESIGN /
DOCUMENTATION_DEFECT
```

Severity: P0 data loss / severe security / main path fully broken;
P1 release-blocking, a normal user cannot finish a main flow; P2
significant with a workaround; P3 minor. Product code changes only on a
reproducible PRODUCT_DEFECT.

## Decision criteria

**COMPLETE**: B11-BUILD-01 reproduces, both engines pass their core flow
and rotation with 0 product defects, and the comparison + docs sync are
done. **CONDITIONAL**: executable items pass but a P2 remains open or an
item is left without a resolution. **BLOCKED**: the production build
cannot be reproduced, the preview cannot serve either engine, or a
P0/P1 is open.

RC readiness terms are the existing ones only (`READY` /
`LIMITED READY` / `NOT READY`). This batch does not promote RC: while
real-device, real-Safari, real-AT, and real-deploy gates remain open,
RC stays **LIMITED READY** by rule, regardless of Firefox/WebKit
results.
