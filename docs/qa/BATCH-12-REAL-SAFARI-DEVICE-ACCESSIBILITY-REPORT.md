# Batch 12 — Real Safari / Device / Accessibility Report

## 1. Executive Summary

**BATCH 12 RESULT: CONDITIONAL. RC STATUS: LIMITED READY.**

The frozen candidate passed every reproducible build, integrity, visual,
Python, CI, and local immutable deploy/rollback check. Stable Safari 26.4 was
actually exercised and reached one Cute Pop 3-player Result, but this was
automated macOS AX operation, not VoiceOver or a complete human Safari
acceptance. The 4-player Safari path lost its control channel. Physical
iPhone/iPad/Android, Safari + VoiceOver, NVDA/JAWS, and an authorized deployed
rollback remain blocked. Therefore the mandatory RC promotion contract is not
closed and `READY` is prohibited.

No product code changed in Batch 12. Open reproduced `PRODUCT_DEFECT`: **0**.

## 2. Scope

This batch froze one exact production artifact, maximized local and CI
verification, attempted stable macOS Safari and available device discovery,
audited Batch 8 VoiceOver evidence, rehearsed deploy/rollback with immutable
local artifacts, and completed a reusable matrix, manual runbook, evidence
schema, and local rehearsal harness.

## 3. Starting State

- Start HEAD / `origin/main`: `66b457af422476774575560baede33b5383c2256`
- Branch: `main`; divergence: 0/0; clean worktree; no stash
- Batch 11: COMPLETE on historical frozen SHA `7548964`
- Starting RC: `LIMITED READY`
- Historical text saying Batch 11 was unexecuted was stale current-status
  documentation, not a reversal of its historical result.

## 4. Frozen Execution SHA

Formal execution SHA:
`555c02dcdfec3f6fbb4a28942bc63af95e3b665f`.

The execution commit includes the Batch 12 harness contract plus test-only
repairs required before freezing. Later evidence/documentation/harness commits
do not redefine this artifact. The final Git handoff records the later final
documentation HEAD separately.

## 5. Build and Artifact Identity

| Field | Value |
|---|---|
| Built from | frozen SHA `555c02d` in a clean detached worktree |
| Build UTC date | 2026-07-27 |
| Node / pnpm / Vite | 24.15.0 / 11.1.2 / 6.4.3 |
| Lockfile SHA-256 | `59585c15d19cd347571e229ce7ec8cbc1b5f1adeeb9829d9657f68f889098629` |
| Aggregate SHA-256 | `8e2cd6193325862a3e2728ee05fb8dd02b3630c0c5102970fb6d114b01296647` |
| Files / bytes | 47 / 7,530,155 |
| JS | `index-DX77IJN9.js`, 444,999 bytes, SHA-256 `2f7d894757b6b135d1b545b3fb52c3b2b653bd5d9bd73bf0e0909def0d75bc36` |
| CSS | `index-o4gla2TO.css`, 25,817 bytes, SHA-256 `b71c0f55f3205cea9c68e6ab6fba447a22362e448727d232a8e029ae4d0a22f4` |
| `index.html` | 477 bytes, SHA-256 `ee42c815cb94ce60772c45abad69c5fd869df61ade766d7d4654b286bd5a15ca` |
| Sourcemaps | none |
| Serve | `pnpm preview --host 127.0.0.1 --port 4300 --strictPort` |
| Binding / base URL | loopback only / `/` |
| Environment / flags | no release-specific variables or feature flags |

A second clean build produced the same aggregate hash. An ignored `.DS_Store`
made the ordinary worktree `dist` inventory differ; the formal artifact was
therefore built in the clean detached worktree. This was classified
`ENVIRONMENT_DIFFERENCE`, not product or generated-artifact drift.

Precondition results: frozen install PASS; integrity 101/101; typecheck 0
errors; unit 425/425; skin 18/18; visual 70/70; production build PASS; exact-SHA
CI and Integrity PASS.

## 6. Python Asset Pipeline

The authoritative exact-SHA run was CI job `89870119596`: Python 3.13, isolated
venv, pinned `requirements.txt` install, `pip check`, and asset fixtures all
PASS. Requirements SHA-256:
`b24e80fa9c0dd27c18f252443cbaf63bfb698326a384096b7bc40e7aece2a00d`.

The Mac did not have Python 3.13, so no global runtime was installed. A
supplemental existing Python 3.14.5 venv used pip 26.1.2; `pip check` reported
no broken requirements and `pnpm asset:image:test` passed 92/92 twice. The two
runs completed without warnings that altered the result, created no persistent
repo output, and left no repository diff. This supports repeatable fixture
outcomes; it is not a local Python 3.13 parity claim.

## 7. macOS Safari

Environment: stable Safari 26.4 (`21624.1.16.11.4`) on macOS 26.4.1
(`25E253`), Apple-silicon Mac, frozen local artifact.

Safari WebDriver correctly refused session creation because “Allow Remote
Automation” was disabled. JavaScript through Apple Events was also disabled.
Neither security setting was changed. System Events AX was able to operate
actual Safari long enough to verify TOP, skin selection, 3-player setup,
gameplay controls, a Cute Pop Result, and TOP return. Result count: 1; completed
rotation cycles: 0.

The Yorunoshirube 4-player path was started but did not reach Result: the AX
window disappeared and subsequent Accessibility calls were denied. The full
import/overwrite/storage/history/multi-tab/quota/error checklist was not
executed. Console, page, unhandled-rejection, and network counts are **NOT
TESTED**, because no approved JavaScript/WebDriver observation channel was
available. Classification: `SUPPLEMENTAL_ONLY`, not Safari gate PASS.

## 8. iPhone Safari

Device discovery listed a paired physical iPhone 16 with iOS 18.7.8 and
Developer Mode enabled, but its tunnel state was unavailable. It was not
connected to the test URL and no Safari scenario was executed.
Result: `BLOCKED`, not physical-device PASS.

A booted iPhone Simulator was attempted only as a supplement. Safari remained
at its first-run browser setup and did not reach the app. No simulator result
is used as physical evidence.

## 9. iPad Safari

No physical iPad was available. All iPad display, touch, storage, import,
orientation, and gameplay items are `BLOCKED`.

## 10. Safari + VoiceOver

VoiceOver was not enabled during Batch 12 and no human listened to spoken
output. AX automation is explicitly not VoiceOver. At session close the
`VoiceOver` process was absent; the separately opened VoiceOver Utility process
does not mean VoiceOver was active. All new Safari + VoiceOver gates are
`BLOCKED`.

## 11. Batch 8 Evidence Closure

Batch 8 Attempt 6 remains authoritative for its historical Chrome + real
macOS VoiceOver scope: 13 `VOICEOVER_PASS`, 6 `SUPPLEMENTAL_ONLY`, 0
`BLOCKED`, and 1 `NOT_APPLICABLE` across 20 flows. It closed Match Setup player
state, Result heading/buttons, and Cute Pop gameplay-control parity.

It did not close Result win/rank/score spoken-output capture, Cute Pop Result
real-VoiceOver traversal, Safari + VoiceOver, physical iOS VoiceOver, or
NVDA/JAWS. Batch 12 added no new human VoiceOver evidence, so those residuals
remain open. Classification: `SUPPLEMENTAL_ONLY`.

## 12. Android

No `adb` or physical Android environment was present. Responsive emulation was
not substituted. Result: `BLOCKED`.

## 13. NVDA / JAWS

No approved Windows environment, NVDA human-listening session, or licensed JAWS
environment was present. macOS VoiceOver was not substituted. Both gates:
`BLOCKED`.

## 14. Deploy

No authorized staging or production target, URL, credentials, or deployment
contract was available, and no external publish was attempted.

The local immutable rehearsal served the frozen aggregate `8e2cd6…`, verified
the exact SHA header, HTML deep link/MIME, intentional missing-asset 404,
invalid import rejection, both skins, 3/4-player gameplay, and Result. Across
deploy, rollback, and redeploy phases it reached 6 Results. Console errors: 0;
page errors: 0; non-benign failed requests: 0. One skin fetch aborted when its
page was intentionally closed and was classified
`BENIGN_BROWSER_BEHAVIOR`. CSP, CORS, security headers, CDN cache invalidation,
and stale edge caches remain `NOT TESTED`.

## 15. Rollback

The rehearsal switched from frozen SHA `555c02d` / aggregate `8e2cd6…` to
previous known-good SHA `9b9ba1a` / aggregate `d3e18c…`, then redeployed the
frozen artifact. Every served SHA and aggregate matched the audit log.

Three smoke phases each completed 3-player and 4-player Results. Persisted
records advanced 0 → 2 → 4 → 6 and deck count stayed 1. This is a local
version-pointer rehearsal, not staging/production rollback, CDN/cache
validation, or fleet-wide storage compatibility.

## 16. Defects and Classifications

| Classification | Count | Disposition |
|---|---:|---|
| PRODUCT_DEFECT | 0 | none reproduced |
| TEST_DATA_DEFECT | 1 | six stale recovery/export visual baselines updated to the already-shipped UI |
| HARNESS_DEFECT | 2 | deterministic Result seed; local deploy locators/page lifecycle/request classification |
| DOCUMENTATION_DEFECT | 1 | stale Batch 11/current-status text synchronized |
| PIPELINE_DEFECT | 0 | none |
| ENVIRONMENT_DIFFERENCE | 1 | ignored `.DS_Store` excluded through clean artifact worktree |
| ENVIRONMENT_BLOCKER | 8 | Safari channels, iPhone availability, iPad, Simulator first-run, Android, Windows AT, deploy target, local Python 3.13 |
| BENIGN_BROWSER_BEHAVIOR | 1 | navigation-time skin request abort |
| UNKNOWN | 0 | none |

No verified data corruption or product dead end occurred in executed scope.

## 17. Evidence Inventory

Batch 12 stores five files under `docs/qa/evidence/batch-12/`: the reusable
session template, current/previous artifact manifests, local deploy/rollback
summary, real-Safari session summary, and one redacted Safari Result PNG.
Video: none.

## 18. Claim Scope

- Frozen execution SHA: `555c02d`; aggregate `8e2cd6…`.
- Local build/tests: Node 24.15.0, pnpm 11.1.2; integrity 101, unit 425,
  skin 18, visual 70; one deterministic rebuild.
- Python: exact-SHA CI Python 3.13 once; local Python 3.14.5 fixtures twice.
- Real stable Safari: Safari 26.4/macOS 26.4.1, automated AX, roughly the
  recorded session window, 0 rotation cycles, 1 Cute Pop 3-player Result;
  Yorunoshirube 4-player setup only.
- Local deploy rehearsal: loopback HTTP + Playwright Chromium, three version
  phases, 6 Results, two immutable artifacts.
- Historical VoiceOver: Batch 8 Chrome-only evidence, not a Batch 12 rerun.

## 19. Explicit Non-Claims

Playwright WebKit is not Safari. macOS Safari is not iOS Safari. The Simulator
and paired-device metadata are not physical-device tests. AX automation is not
VoiceOver. A loopback immutable server is not staging or production. One Safari
Result is not rotation/soak. No Safari console/network zero-error or
memory-leak-absence claim is made. CI green does not close real-device gates.

## 20. Remaining Gates

Full stable Safari core/rotation; physical iPhone; physical iPad; physical iOS
orientation/touch/storage/import/overwrite; Safari + VoiceOver including Result
spoken output; physical Android; NVDA; JAWS; authorized deploy; deployed
rollback/cache/header verification.

## 21. RC Decision

**LIMITED READY — unchanged.** Build, Python, integrity, CI, product-defect,
local import/overwrite, and local immutable rollback preconditions are green.
Mandatory real Safari main flow, a physical Apple device, Safari + VoiceOver,
and deployed rollback are not all PASS. Batch outcome is therefore
`CONDITIONAL`; it is neither `READY` nor `NO-GO`.

## 22. Exact Unblock Steps

1. Approve a Safari control path or provide a human reviewer; execute every
   macOS Safari checklist row, both skins/counts, then at least 20 cycles or 20
   minutes with console/network capture.
2. Connect/unlock/trust the paired iPhone (or another physical iPhone), make
   the frozen artifact reachable, and run display/touch/storage/import/
   overwrite/gameplay/Result checks. Repeat independently on a physical iPad.
3. Enable real VoiceOver on Safari with a human listener; record spoken Result
   static text, focus/dialog behavior, both skins/counts, and confirm OFF.
4. Supply physical Android or an approved device lab; run the Android section.
5. Supply approved Windows + NVDA and Windows + licensed JAWS sessions with a
   human listener; record them independently.
6. Provision an authorized staging/production target with versioned immutable
   assets and a known-good predecessor; verify deployed hashes, MIME/base path,
   CSP/CORS/security headers, cache invalidation, deep links, storage
   compatibility, rollback, and redeploy.

## 23. Git and CI

Exact execution-SHA workflows: CI run `30231132446` SUCCESS (including Python
3.13 job `89870119596`) and Integrity run `30231132438` SUCCESS. Batch 12
commits after the execution SHA are intentionally documentation/evidence/
harness-only. Final HEAD, push result, and final workflow run IDs are recorded
in the final handoff after those commits exist.
