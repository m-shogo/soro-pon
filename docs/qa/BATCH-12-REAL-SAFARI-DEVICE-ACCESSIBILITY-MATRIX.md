# Batch 12 — Real Safari / Device / Accessibility Matrix

Status: **EXECUTED — CONDITIONAL**
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
| B12-BUILD-01 | clean exact SHA | Node 24.15.0 / pnpm 11.1.2 / Vite 6.4.3 | both | 3/4 | install, integrity, typecheck, unit, skin, visual, build, inventory | all green; immutable manifest | 101/101 integrity, 425/425 unit, 18/18 skin, 70/70 visual; build and deterministic rebuild green | report §5; local-deploy manifests | PASS | PASS | — | — | frozen SHA `555c02d`; local + exact-SHA CI |
| B12-PY-ASSET-01 | exact SHA CI + local supplement | CI Python 3.13; local Python 3.14.5 | n/a | n/a | pinned install, `pip check`, fixtures | green, repeatable, unchanged repo | exact-SHA CI job green on 3.13; local 3.14.5 `pip check` green and 92/92 twice; repo unchanged | report §6; CI job `89870119596` | PASS | PASS | local machine has no Python 3.13 | install an isolated 3.13 only if local parity is required | exact 3.13 claim is CI-only; local repeat is supplemental |
| B12-SAFARI-MAC-01 | local immutable preview | stable Safari 26.4 / macOS 26.4.1 / Apple-silicon Mac | Cute Pop executed; Yorunoshirube setup only | 3 Result; 4 started | AX-driven real Safari core subset | full checklist, both skins/counts | TOP/skin/setup/gameplay/3p Result/TOP were operated in real Safari; 4p lost AX window; import/storage/error paths not executed | `evidence/batch-12/safari-mac/` | SUPPLEMENTAL_ONLY | SUPPLEMENTAL_ONLY | Safari remote automation and Apple Events JS disabled; AX permission later unavailable | approved human session or enable Safari remote automation and rerun full checklist | real stable Safari, automated AX, one 3p Result; not VoiceOver/manual/full gate |
| B12-SAFARI-MAC-ROTATION-01 | same | stable Safari 26.4 | partial | 3/4 | 20 cycles or 20 minutes | threshold and counters | 0 completed rotations; 1 Result | Safari session JSON | ENVIRONMENT_BLOCKER | BLOCKED | control channel failed before threshold | approved human or Safari WebDriver rotation on frozen artifact | no rotation, duration, soak, or leak claim |
| B12-IPHONE-SAFARI-01 | physical | paired iPhone 16 / iOS 18.7.8 | both | 3/4 | physical Safari core | human-observed pass | device record exists but tunnel unavailable; not used | Safari session JSON | ENVIRONMENT_BLOCKER | BLOCKED | physical device unavailable to this session | connect/unlock/trust, establish tunnel/LAN URL, execute checklist | paired metadata only; not connected or tested |
| B12-IPAD-SAFARI-01 | physical | no iPad available | both | 3/4 | physical Safari core | human-observed pass | not executed | Safari session JSON | ENVIRONMENT_BLOCKER | BLOCKED | no physical iPad | provide trusted iPad and execute checklist | no iPad claim |
| B12-IOS-ORIENTATION-01 | physical iPhone/iPad | Mobile Safari | both | 3/4 | orientation/safe area/chrome/resume | no defect | not executed | checklist | ENVIRONMENT_BLOCKER | BLOCKED | no usable physical session | run display section per physical device | simulator is not substituted |
| B12-IOS-TOUCH-01 | physical iPhone/iPad | Mobile Safari | both | 3/4 | physical touch/input/dialog | no defect | not executed | checklist | ENVIRONMENT_BLOCKER | BLOCKED | no physical touch session | run touch section per device | physical touch only |
| B12-IOS-STORAGE-01 | physical iPhone/iPad | Mobile Safari | both | 3/4 | lifecycle/private/quota/corrupt/legacy | fail-safe/retention | not executed | checklist | ENVIRONMENT_BLOCKER | BLOCKED | no physical Safari lifecycle | run storage section with redacted fixtures | device/browser scope only |
| B12-IOS-IMPORT-01 | physical iPhone/iPad | Mobile Safari | both | n/a | valid/invalid/file/share import | correct acceptance/rejection | not executed | checklist | ENVIRONMENT_BLOCKER | BLOCKED | no physical file/share path | run non-private fixtures on device | no physical import claim |
| B12-IOS-OVERWRITE-CONFIRM-01 | physical iPhone/iPad | Mobile Safari | both | n/a | same-ID cancel/confirm | no silent write | not executed | checklist | ENVIRONMENT_BLOCKER | BLOCKED | no physical Safari | record before/after fingerprints on device | local automated integrity remains supplemental |
| B12-IOS-VOICEOVER-01 | physical iPhone/iPad | Mobile Safari + VoiceOver | both | 3/4 | spoken core flow | human-observed operability | not executed | checklist | ENVIRONMENT_BLOCKER | BLOCKED | no physical device/human listener | enable real VoiceOver and execute checklist | AX automation is not VoiceOver |
| B12-IOS-VOICEOVER-FOCUS-01 | physical iPhone/iPad | Mobile Safari + VoiceOver | both | 3/4 | order/focus | logical, reachable | not executed | checklist | ENVIRONMENT_BLOCKER | BLOCKED | same | human focus traversal | no automated PASS |
| B12-IOS-VOICEOVER-DIALOG-01 | physical iPhone/iPad | Mobile Safari + VoiceOver | both | n/a | dialogs/focus return | correct announcement/trap | not executed | checklist | ENVIRONMENT_BLOCKER | BLOCKED | same | human dialog traversal | no automated PASS |
| B12-IOS-VOICEOVER-RESULT-01 | physical iPhone/iPad | Mobile Safari + VoiceOver | both | 3/4 | dynamic updates/Result | understandable spoken result | not executed | checklist | ENVIRONMENT_BLOCKER | BLOCKED | same | both counts/skins with human listener | no spoken-output claim |
| B12-BATCH8-EVIDENCE-CLOSURE-01 | evidence review | historical Chrome + real macOS VoiceOver | both | 3/4 | reconcile Attempt 6 | exact residuals retained | 13 VOICEOVER_PASS, 6 SUPPLEMENTAL_ONLY, 1 N/A; Result static spoken output and Cute Pop Result remain outside strict closure; no Safari inheritance | Batch 8 report and Attempt 6 JSON; report §11 | SUPPLEMENTAL_ONLY | SUPPLEMENTAL_ONLY | no new human VoiceOver session | capture Result spoken output and run Safari+VoiceOver separately | historical Chrome+VoiceOver only |
| B12-DEPLOY-01 | loopback immutable server | local HTTP | both | n/a | current deploy pointer | exact hash served | current aggregate `8e2cd6…` served and logged | local-deploy summary/manifests | SUPPLEMENTAL_ONLY | PASS | no authorized staging/production | provision authorized target; compare deployed hashes/headers | local rehearsal only, not deploy |
| B12-DEPLOY-SMOKE-01 | loopback immutable server | Playwright Chromium | both | 3/4 | MIME/deep link/404/import/game/Result | smoke green | 3 phases × 3p/4p; 6 Results; 0 console/page/non-benign request errors | local-deploy summary JSON | SUPPLEMENTAL_ONLY | PASS | real headers/CDN/CSP unavailable | repeat on authorized deployed URL | local Chromium only |
| B12-ROLLBACK-01 | loopback immutable server | version-pointer switch | both | n/a | current → previous | prior hash served | switched to `9b9ba1a` aggregate `d3e18c…`; audit event recorded | local-deploy summary/manifests | SUPPLEMENTAL_ONLY | PASS | not a deployed rollback | run approved staging/production rollback | local version switch only |
| B12-ROLLBACK-VERIFY-01 | loopback immutable server | Playwright Chromium | both | 3/4 | rollback smoke/storage/redeploy | green, no mixed assets | previous and redeployed current hashes matched; storage records 0→2→4→6, deck count 1 | local-deploy summary JSON | SUPPLEMENTAL_ONLY | PASS | CDN/cache/real storage fleet absent | execute against deployed versioned artifacts | local Chromium only |
| B12-ANDROID-01 | physical | no Android/ADB environment | both | 3/4 | physical device flow | human-observed pass | not executed | checklist | ENVIRONMENT_BLOCKER | BLOCKED | no physical Android | connect trusted device/device lab and execute | no emulation claim |
| B12-NVDA-01 | Windows | no Windows/VM + NVDA | both | 3/4 | real NVDA flow | human-observed pass | not executed | checklist | ENVIRONMENT_BLOCKER | BLOCKED | environment absent | approved Windows + NVDA + human listener | no NVDA claim |
| B12-JAWS-01 | Windows | no Windows/VM + JAWS | both | 3/4 | real JAWS flow | human-observed pass | not executed | checklist | ENVIRONMENT_BLOCKER | BLOCKED | environment/license absent | approved Windows + licensed JAWS + human listener | no JAWS claim |

## Evidence rules

Use `docs/qa/evidence/batch-12/templates/session-evidence.json` as the minimum
record. Do not record user names, local absolute paths, device names, serial
numbers, UDIDs, cookies, tokens, credentials, private payloads, or signing
identities. Record `Video: none` when no video exists. Manual and automated
steps must be separate records.
