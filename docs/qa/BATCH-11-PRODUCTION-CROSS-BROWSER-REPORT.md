# Batch 11 — Production Cross-Browser Auxiliary Validation Report

Date: 2026-07-26. Contract (fixed before execution):
[BATCH-11-PRODUCTION-CROSS-BROWSER-MATRIX.md](./BATCH-11-PRODUCTION-CROSS-BROWSER-MATRIX.md).

Not a new feature Gate. Historical Gate 6 remains PASS within its recorded
scope. Batch 8 (CONDITIONAL), Batch 9 (COMPLETE), and Batch 10
(CONDITIONAL) evidence is historical and is neither erased nor
generalized to this newer, integrity-hardened product HEAD.

## 1. Executive result

**COMPLETE.** On the exact clean `main` SHA frozen after the post-Batch-10
integrity/residual work went green, Firefox 151.0 and Playwright WebKit
26.5 each passed the production-preview core flow (15/15) and a short
stability rotation, with **0 product defects**. The frozen SHA's own
integrity precondition (CI + Integrity workflows) is green.

## 2. RC readiness

**`LIMITED READY` — unchanged.** This batch validates only non-Chromium
behavior of the production artifact on a local preview. It does not touch
real-device, real-Safari, real-AT, or real-deploy gates, so RC stays
LIMITED READY by rule. A Firefox/WebKit PASS is **not** a real-Safari,
iOS Safari, or assistive-technology PASS.

## 3. Git baseline

```text
Start HEAD (task-stated): 6a844dd — was 200+ commits stale; the mainline
  had advanced under an active integrity/supply-chain work-stream.
Frozen execution SHA: 7548964 == origin/main (clean worktree)
Branch: main
```

Batch 11 could not run against the task's stated `6a844dd`: current
`origin/main` redefined Batch 11 to require a green integrity precondition
on the exact current SHA (the older baseline is explicitly "obsolete").
Reaching a green precondition required fixing what the repo's own docs
flagged as "verification pending / no PASS claim":

| Fix commit | Class | What |
|---|---|---|
| `5ad1e8a` | PRODUCT_DEFECT (P1, build-breaking) | `AppRoot.tsx` same-ID overwrite passed `string \| null` where `string` was required; `tsc -b` failed so no artifact could build. Behavior-preserving guard added. |
| `eff8612` | TEST_DATA_DEFECT | 6 persistence integrity tests used exact accessible-name queries for TOP buttons that carry sublabels; failed at line 1. Anchored regexes. |
| `b69dbd7` | TEST_DATA_DEFECT | external-SVG skin test asserted a message string the code never emits; the security rejection *is* enforced (verified) with a different message. |
| `7548964` | TEST_DATA_DEFECT | dedupe-before-cap test omitted the by-design `lastMatchKey` prepend in its `recentMatchKeys` expectation. |

After these, on `7548964`: typecheck 0 errors, unit 425/425, skin 18/18,
build green, and **CI + Integrity Contracts workflows both green**
(runs 30183371492 / 30183371473). No product code changed beyond the one
build-breaking type guard.

## 4. Production build (B11-INTEGRITY-01 / B11-BUILD-01)

```text
Frozen SHA: 7548964
Integrity precondition: PASS (CI + Integrity workflows green on this SHA)
typecheck: 0 errors   unit: 425/425   skin: 18/18   build: success
Artifact:  dist/assets/index-DX77IJN9.js  444,999 B  sha256 2f7d894757b6b135…
           dist/assets/index-o4gla2TO.css  25,817 B  sha256 b71c0f55f3205cea…
           dist/index.html                    477 B  sha256 ee42c815cb94ce60…
           (+ 3 skin tokens.css)
Preview:   vite preview, port 4199, serving dist/
```

## 5. Firefox (B11-FF-01 / 02 / 03)

```text
Browser/version:      Firefox 151.0 (Playwright-bundled)
Core flow:            15/15 PASS
Rotation duration:    25.5 min      Cycles: 23
Match attempts:       10            Result completions: 10/10
Console errors:       0
Page errors:          0
Unhandled rejections: 0
Product defects:      0
Harness defects:      0
Memory:               not_available (CDP domain Chromium-only; not measured)
Result:               PASS
```

Core flow (B11-FF-01): TOP, skin A→B switch, reload skin restore, Import
invalid-reject, **same-ID overwrite confirmation (first action does not
write)**, valid import → Deck Detail, Deck Editor, 3p match → Result
(cute-pop), Result→TOP, 4p match → Result (yorunoshirube), final reload,
all counters clean. Rotation (B11-FF-02): 23 cycles / 25.5 min, both
skins × 3p/4p, 10/10 matches to Result, 0 page/console errors, 0 cycle
exceptions. Monitoring (B11-FF-03): 4 failed requests, all
`NS_BINDING_ABORTED` (fetch cancelled by reload/skin-switch navigation —
benign, same class as Batch 7/9/10). 0 non-benign errors. Verdict:
**STABLE, 0 product defects.**

## 6. Playwright WebKit (B11-WK-01 / 02 / 03)

```text
Engine/version:       WebKit 26.5 (Playwright-bundled — NOT Safari)
Core flow:            15/15 PASS
Rotation duration:    19.3 min    Cycles: 24
Match attempts:       10          Result completions: 10/10
Console errors:       0
Genuine page errors:  0
Benign browser page-errors: core flow 2, rotation 2 (all access-control-checks skin.json)
Unhandled rejections: 0
Product defects:      0
Harness defects:      0 (product), 2 stale-QA-harness fixes (see §7)
Memory:               not_available (CDP domain Chromium-only; not measured)
Result:               PASS
```

Core flow (B11-WK-01): identical flow to Firefox, 15/15, including the
same-ID overwrite confirmation. The 2 benign page-errors are the known
WebKit `Fetch API cannot load … due to access control checks` diagnostic
on a same-origin `skin.json` fetch during initial navigation — verified
benign in Batch 11's prior investigation (in-page fetch returns 200, all
skin assets 200, skin renders); classified BENIGN_BROWSER_BEHAVIOR and
bucketed separately, never counted as a genuine page error.

Rotation (B11-WK-02): 24 cycles / 19.3 min, both skins × 3p/4p, 10/10
matches to Result, 0 console errors, 0 cycle exceptions. Monitoring
(B11-WK-03): the rotation's raw `totalPageErrors` is 2 and its samples
show page-errors that are **all** the access-control-checks skin.json
diagnostic (**0 non-benign**), plus 2 `cancelled`/aborted navigation
fetches (benign). The shared rotation harness does not apply the
benign-WebKit classifier (it is left unchanged so Chromium behavior is
untouched), so those are counted raw and classified here; the important
distinction holds — **non-benign page errors are 0**. Verdict: **STABLE,
0 product defects.**

## 7. Defects

| ID | Classification | Severity | Reproduction | Disposition | Fix |
|---|---|---|---|---|---|
| B11-D1 | PRODUCT_DEFECT | P1 | `AppRoot.tsx` same-ID overwrite type hole broke `tsc -b`/build | Fixed, behavior-preserving | `5ad1e8a` |
| B11-D2 | TEST_DATA_DEFECT | n/a | 6 persistence tests: exact accessible-name queries missed sublabelled buttons | Fixed | `eff8612` |
| B11-D3 | TEST_DATA_DEFECT | n/a | external-SVG test asserted wrong message; rejection verified enforced | Fixed | `b69dbd7` |
| B11-D4 | TEST_DATA_DEFECT | n/a | dedupe-before-cap test omitted by-design lastMatchKey prepend | Fixed | `7548964` |
| B11-H1 | HARNESS_DEFECT | n/a | run-batch11-prod-flows.mjs / run-batch9-soak.mjs imported animal-starter and waited for Deck Detail, but the integrity-hardened build now requires same-ID overwrite confirmation | Fixed both QA drivers to confirm overwrite; also asserts first-action-does-not-write | (evidence commit) |
| — | BENIGN_BROWSER_BEHAVIOR | n/a | WebKit access-control-checks skin.json diagnostic; NS_BINDING_ABORTED/cancelled navigation aborts | Recorded, not fixed | — |

**PRODUCT_DEFECT surviving Batch 11: 0.** The one product fix (`5ad1e8a`)
was required to build the artifact at all; no product behavior changed.

## 8. Cross-browser comparison

| Dimension | Chromium (Batch 10, ref) | Firefox (Batch 11) | Playwright WebKit (Batch 11) |
|---|---|---|---|
| Engine/version | Chromium 149 | Firefox 151.0 | WebKit 26.5 (NOT Safari) |
| Environment | local prod preview | local prod preview | local prod preview |
| Frozen SHA | 6a844dd (older) | 7548964 | 7548964 |
| Core flow | 14/14 | 15/15 | 15/15 |
| Rotation duration | 35.0 min | 25.5 min | 19.3 min |
| Rotation cycles | 47 | 23 | 24 |
| Match attempts | 18 | 10 | 10 |
| Result completions | 17/18 | 10/10 | 10/10 |
| Genuine page errors | 0 | 0 | 0 |
| Console errors | 0 | 0 | 0 |
| Unhandled rejections | 0 | 0 | 0 |
| Request aborts (benign) | 45 | 4 (NS_BINDING_ABORTED) | 2 (cancelled) |
| Benign browser page-errors | 0 | 0 | 4 (access-control-checks; assets still 200) |
| Product failures | 0 | 0 | 0 |
| Navigation dead-ends | 0 | 0 | 0 |
| State corruption | 0 | 0 | 0 |
| Available metrics | heap/DOM/listener/timer (CDP) | functional/stability | functional/stability |
| Memory claim | Chromium only (Batch 9/10) | none | none |
| Claim scope | Chromium prod preview | Firefox prod preview | WebKit prod preview, not Safari |

The Chromium column is Batch 10's earlier run on the older `6a844dd`
artifact, shown for reference only; its CDP memory numbers are not
repeated and not used to rank engines. Firefox and WebKit here ran on the
current integrity-hardened SHA `7548964`. Every engine: 0 genuine page
errors, 0 console errors, 0 product failures, 0 dead-ends, 0 corruption.

Rules honored: Chromium-only CDP memory is kept out of any cross-browser
ranking (memory "not measured" for Firefox and WebKit); match-duration
differences are game-length/RNG/host variance, not performance
regressions; "WebKit" is never written as "Safari".

## 9. Evidence inventory

```text
docs/qa/evidence/batch-11/
  prod-artifact-inventory.txt        frozen-SHA artifact hashes
  flows-ff-summary.json              B11-FF-01 core flow, 15 results
  flows-wk-summary.json              B11-WK-01 core flow, 15 results + benign bucket
  flows-ff/*.png (9)                 Firefox flow screenshots
  flows-wk/*.png (9)                 WebKit flow screenshots
  soak-b11-ff-rotation.jsonl (23)    Firefox per-cycle rotation metrics
  soak-b11-ff-rotation-summary.json  Firefox rotation aggregate
  soak-b11-wk-rotation.jsonl (24)    WebKit per-cycle rotation metrics
  soak-b11-wk-rotation-summary.json  WebKit rotation aggregate
  shots/*.png (6)                    rotation boundary screenshots

Totals: PNG 24, JSON/JSONL 6, txt 1 → 31 tracked files.
Video: none (automated batch). Reports: this file + matrix.
Integrity/build logs: gitignored via *.log, same as prior batches;
  results captured here and in prod-artifact-inventory.txt.
```

## 10. Exact claim scope

```text
Verified in this batch:
- The frozen SHA 7548964 passes its own integrity precondition
  (CI + Integrity workflows green; typecheck/unit/skin/build green).
- On a LOCAL PRODUCTION PREVIEW (vite preview, port 4199) of that build:
  - Firefox 151.0 passed the core flow 15/15 and a 23-cycle / 25.5 min
    rotation with 0 product defects.
  - Playwright WebKit 26.5 passed the core flow 15/15 and a
    24-cycle / 19.3 min rotation with 0 product defects.
  - Both skins and both 3p and 4p matches reached Result in both engines.
  - The integrity-hardened same-ID overwrite confirmation was exercised.

NOT verified, and explicitly not claimed:
- No memory-leak claim for Firefox or WebKit (CDP memory unavailable;
  recorded not_available, never 0).
- Playwright WebKit is NOT real Safari / macOS Safari / iOS Safari.
- No real iPhone, iPad, or Android device.
- No Safari + VoiceOver, NVDA, or JAWS.
- No deploy or deployed-artifact rollback.
- No human visual/auditory review (automated batch only).
```

## 11. Remaining open gates

| Gate | Blocker | Exact unblock action |
|---|---|---|
| Real iPhone/iPad/Android | no drivable/observable real device | enable Web Inspector / adb, LAN-serve preview, human operator + reviewer |
| Real Safari | Safari read-tier / Remote Automation off | enable Develop → Allow Remote Automation (admin) or human operator |
| Safari + VoiceOver | above + no mechanical speech capture | human listener drives Safari with VoiceOver |
| NVDA / JAWS | no Windows machine/VM (JAWS also license) | provision Windows + NVDA / licensed JAWS |
| Real deploy / rollback | no hosting target in repo | provision hosting; follow RELEASE-DEPLOY-ROLLBACK-RUNBOOK.md |
| Human visual/interaction review | no human reviewer in this batch | named reviewer walks flows on real devices |
