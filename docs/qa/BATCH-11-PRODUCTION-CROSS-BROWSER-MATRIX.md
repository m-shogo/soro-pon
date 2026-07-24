# Batch 11 — Production Cross-Browser Auxiliary Validation Matrix

Date: 2026-07-24. Not a new feature Gate. Historical Gate 6 remains PASS
within its recorded scope. Batch 8 (CONDITIONAL), Batch 9 (COMPLETE), and
Batch 10 (CONDITIONAL) evidence is historical and is neither erased nor
silently generalized to the newer post-review product SHA.

Purpose: validate the **current production build** through core flows and a
short stability rotation in **Firefox** and **Playwright WebKit**, closing
the one Batch 10 gap executable without new hardware: non-Chromium behavior
of the production artifact.

This is auxiliary functional/stability validation, not a memory pass, real-
device pass, real-Safari pass, real-AT pass, deploy pass, or rollback pass.

> Matrix fixed before execution. `Actual` and `Class` are filled only by the
> result report. The execution baseline is not the Batch 10 SHA; it is the
> exact clean `main` SHA frozen after both integrity reviews and after every
> product/test correction has stopped.

## Mandatory Precondition — Integrity Review Closure

Batch 11 must not start until the exact candidate SHA passes:

```text
pnpm install --frozen-lockfile
Critical integrity contracts 8-file suite
pnpm typecheck
pnpm test
all 38 review-added integrity cases collected and passing
pnpm skin:validate
pnpm build
artifact inventory/hash recorded
```

Review records:

```text
docs/qa/POST-BATCH-10-INTEGRITY-REVIEW.md
docs/qa/POST-BATCH-10-INTEGRITY-CONTINUATION.md
```

If any product/test file changes after precondition execution, discard the
partial Batch 11 evidence and restart at integrity preflight on the new SHA.

## Non-negotiable Scope Rules

```text
Playwright WebKit is NOT real Safari, iOS Safari, or macOS Safari.
A WebKit PASS is NOT Safari+VoiceOver and NOT iOS Safari PASS.
Firefox/WebKit results do NOT generalize to physical devices.
No memory-leak claim is made for Firefox or WebKit.
  CDP memory fields are unavailable and must be null/not_available, never 0.
Chromium-only memory numbers are not used for cross-browser ranking.
A local production preview is NOT a deploy.
Optimistic localStorage conflict checks are NOT transactional multi-tab CAS.
This batch cannot promote RC to READY while real-device, real-Safari,
  real-AT, and real-deploy evidence remains open.
```

## Execution-time Environment Inventory

Fill immediately before execution:

```text
Host OS:            *(report)*
Node/pnpm:          *(report)*
Playwright:         *(report)*
Firefox:            *(report, Playwright-bundled)*
WebKit:             *(report, Playwright-bundled — NOT Safari)*
Build command:      pnpm build
Preview command:    production artifact via vite preview
Preview port:       4199 unless unavailable and recorded
Frozen HEAD:        *(report; must equal origin/main)*
Worktree:           clean
Integrity suite:    PASS on Frozen HEAD
Full unit count:    *(report)*
Review-added cases: 38 collected / 38 PASS
Artifact hashes:    *(report)*
GitHub CI:          PASS or explicitly unavailable; never inferred from push
```

The old `6a844dd` Batch 10 artifact is historical comparison context only.
It is not the Batch 11 execution target.

## Test Matrix

| Test ID | Engine | Build | Skin | Players | Scenario | Measurement | Evidence | PASS | FAIL | BLOCK | Actual | Class | Claim scope |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| B11-PREFLIGHT-01 | n/a | — | — | — | clean exact baseline | HEAD/origin/worktree/tool versions | preflight log | clean HEAD==origin/main; versions recorded | dirty/behind/unknown | — | *(report)* | — | this repo/host only |
| B11-INTEGRITY-01 | n/a | source | both | — | review integrity closure | 8-file suite + all 38 added cases | command log | all PASS on frozen SHA | any failure/missing case | install/environment unavailable | *(report)* | *(report)* | candidate SHA only |
| B11-BUILD-01 | n/a | production | both | — | reproduce build at frozen HEAD | typecheck/unit/skin/build + hashes | build log + inventory | all exit 0; artifacts present | any failure | environment unavailable | *(report)* | *(report)* | exact artifact hash |
| B11-FF-01 | Firefox | production | both | 3p+4p | core flow walkthrough | functional pass/fail; memory not_available | flow JSON + PNG | all steps pass; 0 product errors | any step/product error | preview/browser unavailable | *(report)* | *(report)* | Firefox local production preview only |
| B11-FF-02 | Firefox | production | both | 3p+4p | ≥20 cycles OR ≥15 min rotation | cycles, Result completion, errors; memory not_available | JSONL + summary | 0 product errors/dead-end/corruption | product error/dead-end | preview unstable/unavailable | *(report)* | *(report)* | Firefox stability only |
| B11-FF-03 | Firefox | production | both | 3p+4p | console/page/rejection monitoring | classified samples/counts | summary | 0 non-benign product errors | non-benign product error | — | *(report)* | *(report)* | Firefox only |
| B11-WK-01 | WebKit | production | both | 3p+4p | core flow walkthrough | functional pass/fail; memory not_available | flow JSON + PNG | all steps pass; 0 product errors | any step/product error | preview/browser unavailable | *(report)* | *(report)* | Playwright WebKit, NOT Safari |
| B11-WK-02 | WebKit | production | both | 3p+4p | ≥20 cycles OR ≥15 min rotation | cycles, Result completion, errors; memory not_available | JSONL + summary | 0 product errors/dead-end/corruption | product error/dead-end | preview unstable/unavailable | *(report)* | *(report)* | WebKit stability only, no memory claim |
| B11-WK-03 | WebKit | production | both | 3p+4p | console/page/rejection monitoring | classified samples/counts | summary | 0 non-benign product errors | non-benign product error | — | *(report)* | *(report)* | WebKit only, NOT Safari |
| B11-INTEGRITY-UI-01 | Firefox+WebKit | production | both | — | migration/overwrite/error recovery smoke | modal state, warnings, no silent overwrite | JSON + PNG | review/error states reachable and truthful | silent replacement/raw exception | browser limitation | *(report)* | *(report)* | tested engines only |
| B11-COMPARE-01 | all recorded engines | mixed historical/current | both | 3p+4p | comparison | functional/stability only | comparison table | memory kept Chromium-only; scope labeled | false cross-browser memory/Safari claim | — | *(report)* | — | comparison only |
| B11-DOCS-01 | n/a | — | — | — | readiness/doc sync | contradiction scan | README/agents/gates/reports | docs match evidence; RC LIMITED READY | overclaim/stale fixed task | — | *(report)* | — | — |

## Core Flow Minimum

For Firefox and WebKit, each skin and player-count path must cover at least:

```text
TOP boot
Deck List / Deck Detail reachability
JSON import modal valid + invalid rejection
same-ID overwrite first action does not write
Match Setup
one complete 3p and 4p match to Result across the matrix
Result action controls
skin switch where safe
reload/localStorage state read
0 blank screen
0 asset 404
0 unhandled page/console/rejection errors
```

Legacy migration and cross-tab races may use deterministic harness setup;
the report must distinguish browser automation from a true second human tab.

## Reused Harness Rules

```text
Rotation may reuse scripts/qa/run-batch9-soak.mjs.
Use --base=http://localhost:4199 and a Batch-11-specific output root/label.
Firefox/WebKit memory values remain null with a reason.
Do not change Chromium behavior merely to simplify comparison.
Evidence files record engine, exact version, SHA, artifact hash, and skin.
No evidence path may overwrite historical Batch 5-10 evidence.
```

## Finding Classification

```text
PRODUCT_DEFECT
HARNESS_DEFECT
TEST_DATA_DEFECT
ENVIRONMENT_BLOCKER
BENIGN_BROWSER_BEHAVIOR
EXPECTED_BY_DESIGN
DOCUMENTATION_DEFECT
```

Severity:

```text
P0: data loss, severe security, or core app unusable
P1: release-blocking normal main flow
P2: significant with workaround
P3: minor/localized
```

Product code changes only for reproducible `PRODUCT_DEFECT`. Any code/test
change invalidates the frozen baseline and requires complete preflight
rerun.

## Decision Criteria

**COMPLETE**

```text
integrity precondition PASS on frozen SHA
production artifact reproduced and hashed
Firefox core + rotation PASS
WebKit core + rotation PASS
0 open P0/P1/P2 product defects from this batch
comparison and docs sync complete
```

**CONDITIONAL**

```text
executable items pass but a P2 remains open
or one required item is unresolved with bounded evidence
```

**BLOCKED**

```text
integrity precondition cannot pass
production build cannot reproduce
preview/browser cannot execute either engine
or an open P0/P1 exists
```

RC vocabulary remains `READY` / `LIMITED READY` / `NOT READY`. Batch 11
leaves RC **LIMITED READY** by rule while real-device, real-Safari,
real-AT, and real-deploy gaps remain.
