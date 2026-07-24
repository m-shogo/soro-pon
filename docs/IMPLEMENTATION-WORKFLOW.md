# Soro-pon Implementation Workflow

## Purpose

Compact operational view of completed foundations, current release state,
and the next executable work. Detailed history lives in evidence-backed
Batch reports and asset approval packs, not duplicated here.

```text
Product/spec truth:          docs/MASTER-SPEC.md
Release/readiness truth:     docs/RELEASE-DEMO-GATES.md
Current executable QA:       docs/qa/BATCH-11-PRODUCTION-CROSS-BROWSER-MATRIX.md
Storage recovery contract:   docs/release/STORAGE-RECOVERY-POLICY.md
Error-code registry:         docs/ERROR-CODES.md
UI/skin foundation detail:   docs/SKIN-FOUNDATION-HARDENING.md
Asset history:               docs/ASSET-PRODUCTION-ROADMAP.md
```

## Current Status — 2026-07-24

```text
Gameplay MVP phases 1-14: complete
Multi-skin runtime baseline: complete
Skin hardening H1-H11: complete
Official finals: 18 total
  yorunoshirube: 9 finals, v4
  cute-pop: 9 finals, v5
Asset requests/batches through Batch 4: closed
Gate 4: PASS
Gate 5: PASS within recorded scope
Historical Gate 6: PASS
RC status: LIMITED READY
Batch 7: COMPLETE
Batch 8 real VoiceOver + Chrome: CONDITIONAL
Batch 9 extended soak: COMPLETE
Batch 10 production preview / real-device validation: CONDITIONAL
Batch 11 production Firefox/WebKit: contract defined, not executed
```

Current phase: **RC integrity and evidence closure**. Do not restart MVP,
H1-H11, or asset Batch 5 from obsolete instructions.

## Completed Foundations

```text
Gameplay phases 1-14                               complete
Typed schemas/import/validation                    complete
Role/wait/scoring/wildcard engine                  complete
Seeded reducer/CPU/playable flow                   complete
Deck editor/collection/achievements/records        complete
Multi-skin shared UI                               complete
H1-H11 skin/security/idempotency hardening         complete
Candidate -> review -> final asset pipeline         complete
Official asset finals                              18 total
```

Restore/replay and marketplace/payment are future products. H10/H11 are
safe foundations, not claims that those features exist.

## Post-Batch-10 Integrity Review

Found and fixed:

```text
storage corruption recovery could throw while trying to back up/remove
records/settings corrupt raw payloads had no backup keys
records/settings recovery issues were discarded by AppRoot
unpersisted achievements could be displayed as newly unlocked
missing current deck/active variant could leave a permanent blank route
export Blob URL lifecycle was fragile across browsers
L9004 code collision risk with the existing local-image fallback meaning
```

Current behavior:

```text
storage read denial -> L9005 + empty/default in-memory fallback
bootstrap starter persistence failure -> L9006
backup and active-key cleanup independently best-effort
all three store issues included in boot Toast
unpersisted rewards/achievements are not shown as saved
missing deck/variant returns to a safe screen with warning
export anchor is attached temporarily; Blob URL revocation is deferred
six storage-operation failure-path unit tests added
```

These changes are newer than Batch 10 evidence. Historical green results
do not validate current HEAD.

## Next Executable Work

```text
1. Confirm clean worktree and HEAD == origin/main.
2. Record exact SHA and tool versions.
3. Run:
   pnpm install --frozen-lockfile
   pnpm typecheck
   pnpm test
   pnpm skin:validate
   pnpm build
4. Confirm storageRecoveryFailurePaths.test.ts is collected and passes.
5. Execute all Batch 11 production Firefox/WebKit items from the same SHA.
6. Classify findings before changing product code.
7. If product/test code changes, invalidate partial Batch 11 evidence and
   restart from step 1.
8. Commit report/evidence, then synchronize all entry documents.
```

Batch 11 cannot promote RC to READY. Real devices, real Safari,
Safari+VoiceOver, Windows screen readers, and real deploy/rollback remain
separate evidence.

## Verification Commands

```bash
pnpm typecheck
pnpm test
pnpm skin:validate
pnpm build
```

Browser suites where relevant:

```bash
pnpm test:visual
pnpm test:visual:crossbrowser
```

Extended soak follows `docs/release/SOAK-RUNBOOK.md` and is not a default
CI command.

Never report a command as green unless it was executed against the exact
reported SHA. A push is not CI success.

## UI / Skin Rules

```text
one shared screen/component/layout system
no skin-specific screen copies
layout, hit areas, focus, z-index, and game meaning are skin-invariant
skins change typed allowlisted presentation values only
generic controls and render/slice behavior stay centralized
both official skins and fallback behavior remain usable
```

For UI changes, read the mandatory documents in `AGENTS.md`, add Gallery
and test coverage, and verify both skins.

## Asset Rule

Batches 1-4 are closed. Start a new asset batch only from an explicit
current task.

```text
generate -> generated/candidates -> review -> human approval
-> generated/final -> skin.json version bump -> verification
```

Never write directly to final.

## Architecture Boundaries

```text
UI does not judge roles, score, or wildcard assignment
engine does not import React/DOM/localStorage/CSS
skin does not access engine/schema/storage/records/network
shared deck JSON contains no executable/image/URL injection fields
persisted values are parsed before use
recovery code never throws merely because recovery cleanup failed
```

## Release Claim Boundaries

```text
local production preview != deploy
Playwright WebKit != Safari
emulation/simulator != physical device
AX-tree automation != real screen reader
unavailable metric = null/not_available, never 0
old artifact PASS != current HEAD verification
```

## Known Open Scope

```text
physical iPhone Safari, iPad, Android
real hosting target and immutable artifact deployment
rollback of an actually deployed artifact
Safari + VoiceOver
NVDA / JAWS
Batch 8 Result static-text spoken-output capture
Cute Pop Result under real VoiceOver
Batch 11 production Firefox/WebKit execution
match restore/replay/resend (non-MVP)
marketplace/payment/entitlement product (future)
extendedRoleSpan variant (non-MVP)
```

## Work Rule

```text
one purpose per commit where tooling permits
small testable changes
implementation and contract docs together
never silently broaden historical evidence
report local verification separately from GitHub Actions
```
