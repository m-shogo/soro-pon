# Batch 12 — Real Safari / Device / Accessibility Matrix

Status: **PRE-EXECUTION CONTRACT**  
RC vocabulary: `READY` / `LIMITED READY` / `NOT READY`

This matrix is the execution contract for Batch 12. An unexecuted real
environment gate stays `NOT TESTED` or `BLOCKED`; Playwright WebKit,
Simulator, automated AX inspection, and a local server are supplemental only
and never inherit the corresponding real-environment PASS claim.

## Frozen execution precondition

Formal results may be recorded only after all of the following are true on one
exact commit:

```text
worktree clean
HEAD == origin/main
pnpm install --frozen-lockfile PASS
Integrity workflow-equivalent test list PASS
pnpm typecheck PASS
pnpm test PASS
pnpm skin:validate PASS
pnpm test:visual PASS
pnpm build PASS
CI PASS for the exact SHA
Integrity Contracts PASS for the exact SHA
dist manifest and aggregate hash recorded
```

If product code, tests, build/workflow configuration, lockfile, asset pipeline,
or runtime assets change, freeze a new execution SHA and do not mix results.
Documentation/evidence-only commits after execution are recorded separately as
the final documentation SHA.

## Classification vocabulary

```text
PASS / VOICEOVER_PASS
SUPPLEMENTAL_ONLY
NOT TESTED
BLOCKED
FAIL
```

Finding classes:

```text
PRODUCT_DEFECT / TEST_DATA_DEFECT / HARNESS_DEFECT / DOCUMENTATION_DEFECT
PIPELINE_DEFECT / GENERATED_ARTIFACT_DRIFT / ENVIRONMENT_DIFFERENCE
ENVIRONMENT_BLOCKER / BENIGN_BROWSER_BEHAVIOR / EXPECTED_PLATFORM_BEHAVIOR
EXPECTED_REGENERATION / UNKNOWN
```

## Execution matrix

| Gate ID | Environment | Browser / OS / device | Skin | Player count | Scenario | Expected | Actual | Evidence | Classification | Result | Blocker | Unblock step | Claim scope |
|---|---|---|---|---:|---|---|---|---|---|---|---|---|---|
| B12-BUILD-01 | clean exact SHA | Node/pnpm/Vite production build | both | 3/4 | install, integrity, typecheck, unit, skin, visual, build, artifact inventory | every command green; immutable manifest recorded | pending | `evidence/batch-12/preflight/` | NOT TESTED | NOT TESTED | formal precondition not yet run | land this contract, obtain exact-SHA CI/Integrity, then run declared commands | exact execution SHA only |
| B12-PY-ASSET-01 | clean exact SHA | Python 3.13 venv | n/a | n/a | pinned install, `pip check`, fixtures twice | fixtures pass twice; output hashes stable; repo unchanged | pending | `evidence/batch-12/python/` | NOT TESTED | NOT TESTED | formal precondition not yet run | reproduce CI asset-python job on frozen SHA | exact Python/toolchain and fixture inputs only |
| B12-SAFARI-MAC-01 | macOS stable Safari | real Safari / macOS / Mac | both | 3/4 | boot, skin, import/overwrite, detail, match, Result, persistence, history/tabs/quota/error paths | checklist passes; 0 product errors/dead ends/corruption | pending | manual session JSON + screenshots/logs | NOT TESTED | NOT TESTED | controllable stable Safari and human-observable session required | enable an approved Safari operation path; execute manual checklist | stable macOS Safari version actually recorded only |
| B12-SAFARI-MAC-ROTATION-01 | macOS stable Safari | real Safari / macOS / Mac | both | 3/4 | repeated scenario rotation | at least 20 cycles or 20 minutes; Result/error counts recorded | pending | rotation JSONL + summary + checkpoints | NOT TESTED | NOT TESTED | same as Safari gate | run fixed artifact with human or approved Safari automation | real Safari only; no memory-leak claim |
| B12-IPHONE-SAFARI-01 | physical device | Mobile Safari / iOS / iPhone | both | 3/4 | core navigation and matches | all core flows pass with model/OS recorded | pending | device session JSON + images/video status | ENVIRONMENT_BLOCKER | BLOCKED | no usable physical iPhone session confirmed | connect/trust a physical iPhone; open LAN fixed artifact; human executes checklist | physical iPhone only |
| B12-IPAD-SAFARI-01 | physical device | Mobile Safari / iPadOS / iPad | both | 3/4 | core navigation and matches | all core flows pass with model/OS recorded | pending | device session JSON + images/video status | ENVIRONMENT_BLOCKER | BLOCKED | no usable physical iPad session confirmed | connect/trust a physical iPad; open LAN fixed artifact; human executes checklist | physical iPad only |
| B12-IOS-ORIENTATION-01 | physical iPhone/iPad | Mobile Safari / iOS or iPadOS | both | 3/4 | landscape, rotate, safe area, browser chrome, resume | no clipping, trapping, dead end, or state loss | pending | per-device captures and session JSON | ENVIRONMENT_BLOCKER | BLOCKED | physical device observation required | execute orientation section on each available physical device | each recorded device separately |
| B12-IOS-TOUCH-01 | physical iPhone/iPad | Mobile Safari / iOS or iPadOS | both | 3/4 | tap/rapid/double/long/scroll/drag/edge/keyboard/dialog | no double activation or unreachable target | pending | per-step human result and captures | ENVIRONMENT_BLOCKER | BLOCKED | physical touch input required | execute touch section on each physical device | physical touch only |
| B12-IOS-STORAGE-01 | physical iPhone/iPad | Mobile Safari / iOS or iPadOS | both | 3/4 | reload/restart/private/quota/corrupt/legacy persistence | fail-safe and retention contract hold | pending | redacted storage observations | ENVIRONMENT_BLOCKER | BLOCKED | physical Safari lifecycle required | execute storage section without recording payload/private data | recorded device/browser only |
| B12-IOS-IMPORT-01 | physical iPhone/iPad | Mobile Safari / iOS or iPadOS | both | n/a | valid/invalid/legacy/file/share import | validation visible; accepted data reaches detail | pending | import checklist and captures | ENVIRONMENT_BLOCKER | BLOCKED | physical file/share path required | provide non-private fixture files and execute on device | recorded device/browser only |
| B12-IOS-OVERWRITE-CONFIRM-01 | physical iPhone/iPad | Mobile Safari / iOS or iPadOS | both | n/a | same-ID import: cancel then confirm | first action does not write; cancel preserves; confirm replaces exact target | pending | before/after redacted fingerprints | ENVIRONMENT_BLOCKER | BLOCKED | physical Safari required | execute fixed same-ID fixture and record fingerprints only | recorded device/browser only |
| B12-IOS-VOICEOVER-01 | physical iPhone/iPad | Mobile Safari + VoiceOver | both | 3/4 | end-to-end screen-reader core flow | human confirms operable spoken path | pending | spoken/caption notes, reviewer, video status | ENVIRONMENT_BLOCKER | BLOCKED | physical device plus human listener required | enable VoiceOver on trusted device and execute AT checklist | real iOS/iPadOS VoiceOver only |
| B12-IOS-VOICEOVER-FOCUS-01 | physical iPhone/iPad | Mobile Safari + VoiceOver | both | 3/4 | reading order, headings/landmarks, focus return/loss | logical order; no unreachable/hidden duplicate focus | pending | per-control focus log | ENVIRONMENT_BLOCKER | BLOCKED | same as VoiceOver gate | execute focus section with human listener | real iOS/iPadOS VoiceOver only |
| B12-IOS-VOICEOVER-DIALOG-01 | physical iPhone/iPad | Mobile Safari + VoiceOver | both | n/a | overwrite/unsaved/error dialogs, trap, dismiss | name/description announced; focus trapped and returned | pending | dialog traversal log | ENVIRONMENT_BLOCKER | BLOCKED | same as VoiceOver gate | execute dialog section with human listener | real iOS/iPadOS VoiceOver only |
| B12-IOS-VOICEOVER-RESULT-01 | physical iPhone/iPad | Mobile Safari + VoiceOver | both | 3/4 | dynamic game updates and Result | live updates/result are understandable; TOP reachable | pending | announcement and Result traversal log | ENVIRONMENT_BLOCKER | BLOCKED | same as VoiceOver gate | play both player counts to Result with human listener | real iOS/iPadOS VoiceOver only |
| B12-BATCH8-EVIDENCE-CLOSURE-01 | macOS AT evidence review | real VoiceOver + historical Chrome evidence | both | 3/4 | reconcile Batch 8 spoken-output/Result/Cute Pop residuals | each residual explicitly closed or remains blocked | pending | Batch 12 report + Batch 8 cross-reference | NOT TESTED | NOT TESTED | evidence reconciliation pending | audit Attempt 6 files; do not infer Safari coverage | historical Chrome+VoiceOver scope only |
| B12-DEPLOY-01 | local immutable artifact server unless authorized staging exists | loopback HTTP server | both | n/a | publish frozen artifact without mutation | pre/post manifest hash identical; version switch logged | pending | `evidence/batch-12/local-deploy/` | NOT TESTED | NOT TESTED | no authorized staging/production target known | run local immutable rehearsal; provision staging separately for real deploy claim | local equivalent is supplemental, never real deploy |
| B12-DEPLOY-SMOKE-01 | same local immutable server | Playwright Chromium smoke | both | 3/4 | status/MIME/SPA reload/404/assets/import/game/Result | smoke green; 0 asset/network/page/console errors | pending | local deploy summary JSON | NOT TESTED | NOT TESTED | B12-DEPLOY-01 pending | run `pnpm qa:batch12:local-deploy` with frozen/previous artifacts | local loopback + Chromium only |
| B12-ROLLBACK-01 | same local immutable server | version pointer switch | both | n/a | switch frozen artifact to previous known-good artifact | previous manifest served exactly; audit event recorded | pending | local rollback summary JSON | NOT TESTED | NOT TESTED | two immutable builds required | build previous known-good SHA in isolated worktree, then run rehearsal | local equivalent, not deployed rollback |
| B12-ROLLBACK-VERIFY-01 | same local immutable server | Playwright Chromium smoke | both | 3/4 | post-rollback smoke/storage compatibility/redeploy | smoke green after rollback and redeploy; no mixed assets | pending | local rollback summary JSON | NOT TESTED | NOT TESTED | B12-ROLLBACK-01 pending | run full local rehearsal and inspect artifact hashes | local loopback + Chromium only |
| B12-ANDROID-01 | physical device | Chrome / Android / phone or tablet | both | 3/4 | display/touch/storage/import/game/Result | human-observed physical-device pass | pending | Android session JSON + captures | ENVIRONMENT_BLOCKER | BLOCKED | no physical Android environment confirmed | connect trusted device or approved device lab; execute checklist | physical Android only |
| B12-NVDA-01 | physical/approved VM | Chrome or Edge / Windows + NVDA | both | 3/4 | keyboard and spoken screen-reader flow | human confirms named/focused/announced operable path | pending | NVDA traversal log + video status | ENVIRONMENT_BLOCKER | BLOCKED | no Windows+NVDA environment confirmed | provide approved Windows environment and human listener | real NVDA only |
| B12-JAWS-01 | physical/approved VM | Chrome or Edge / Windows + licensed JAWS | both | 3/4 | keyboard and spoken screen-reader flow | human confirms named/focused/announced operable path | pending | JAWS traversal log + video status | ENVIRONMENT_BLOCKER | BLOCKED | no Windows+JAWS license/environment confirmed | provide approved Windows environment, JAWS license, and human listener | real JAWS only |

## Evidence rules

Use `docs/qa/evidence/batch-12/templates/session-evidence.json` as the minimum
record. Do not record user names, local absolute paths, device names, serial
numbers, UDIDs, cookies, tokens, credentials, private payloads, or signing
identities. Record `Video: none` when no video exists. Manual and automated
steps must be separate records.

