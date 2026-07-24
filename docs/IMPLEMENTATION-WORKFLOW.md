# Soro-pon Implementation Workflow

## Purpose

This file is the compact operational view of the repository: completed
foundations, current release state, and the next executable work. Detailed
history belongs in the referenced Batch reports and asset approval packs;
it must not be duplicated here as a second source of truth.

```text
Product/spec truth:          docs/MASTER-SPEC.md
Release/readiness truth:     docs/RELEASE-DEMO-GATES.md
Current executable QA:       docs/qa/BATCH-11-PRODUCTION-CROSS-BROWSER-MATRIX.md
Storage recovery contract:   docs/release/STORAGE-RECOVERY-POLICY.md
UI/skin foundation detail:   docs/SKIN-FOUNDATION-HARDENING.md
Asset history:               docs/ASSET-PRODUCTION-ROADMAP.md
```

## Current Status — 2026-07-24

```text
Gameplay MVP phases 1-14: complete
Multi-skin runtime baseline: complete
Skin-foundation hardening H1-H11: complete
Official finals: 18 total
  yorunoshirube: 9 finals, skin v4
  cute-pop: 9 finals, skin v5
Asset requests/batches through Batch 4: closed
Gate 4: PASS
Gate 5: PASS within its recorded demo/browser scope
Gate 6: PASS historically
RC status: LIMITED READY
Batch 7: COMPLETE
Batch 8 real VoiceOver + Chrome: CONDITIONAL
Batch 9 extended soak: COMPLETE
Batch 10 production preview / real-device validation: CONDITIONAL
Batch 11 production Firefox/WebKit:
  contract defined, not yet executed
```

The current phase is **RC integrity and evidence closure**, not MVP
construction, H1 implementation, or a new asset-generation batch.

Post-Batch-10 review changed product code in the storage recovery layer.
Therefore historical green commands and Batch-10 artifacts do not prove
the current HEAD. The next validation must use one frozen current SHA for
all commands and Batch-11 evidence.

## Completed Foundations

### Gameplay phases 1-14

Completed areas include strict deck schemas/import, group and wildcard
engine, role/wait/scoring analysis, seeded match reducer and CPU,
localStorage persistence, all main screens, deck editor, collection,
achievements, records, and match-record idempotency groundwork.

Historical phase/commit mapping remains in Git history and earlier
implementation reports. Do not restart phases 1-14.

### Skin hardening H1-H11

```text
H1 typed token allowlist                              complete
H2 package/contract validator + CI                    complete
H3 semantic contrast                                  complete
H4 runtime SkinSelector                               complete
H5 layered surfaces and nine-slice proof              complete
H6 renderer modes where proven necessary              complete
H7 shared component/CSS responsibility                complete
H8 DOM/accessibility/recovery baseline                complete
H9 Playwright visual regression                       complete
H10 versioned/preloaded/atomic skin loading           complete
H11 persistent match-session idempotency baseline     complete
```

Foundation contracts must be preserved, not rebuilt. Restore/replay and
marketplace/payment remain future features; H10/H11 do not claim those
products exist.

### Asset production

The candidate → review → final pipeline is implemented and proven.
Both official skins have 9 promoted finals. Requests 007-016 and asset
Batches 1-4 are historical closed work. Batch 5 was whole-product QA,
not a pending asset-generation task.

```text
generate -> generated/candidates -> inspect -> human approval
-> generated/final -> skin.json version bump -> validation
```

Never write directly to `generated/final`. Start another asset batch only
when explicitly requested and after checking the current roadmap against
release status.

## Current Integrity Review

The post-Batch-10 review found that normal storage writes were guarded,
but read/recovery operations could still throw when corruption coincided
with quota or browser storage denial.

Fixed on current `main`:

```text
deck recovery guards getItem, corrupt backup, and active-key removal
records/settings preserve corrupt raw payloads when possible
all recovery cleanup is best-effort and independently classified
L9004 represents storage read denial with safe empty/default fallback
six failure-path unit tests cover compound storage faults
storage policy and release documentation match implementation
```

These changes require fresh verification on the exact current HEAD.

## Next Executable Work

Follow this order without substituting old evidence:

```text
1. Confirm clean worktree and HEAD == origin/main.
2. Record exact SHA and tool versions.
3. Run:
   pnpm install --frozen-lockfile
   pnpm typecheck
   pnpm test
   pnpm skin:validate
   pnpm build
4. Confirm storageRecoveryFailurePaths.test.ts is included and passes.
5. Execute all Batch 11 Firefox/WebKit production-preview items from the
   same SHA.
6. Classify findings before changing product code.
7. If product code changes, invalidate partial Batch 11 evidence and
   restart from step 1.
8. Commit report/evidence, then synchronize README/AGENTS/CODEX/CLAUDE,
   docs/README, this file, and RELEASE-DEMO-GATES.
```

Batch 11 cannot promote RC to READY. Real devices, real Safari,
Safari+VoiceOver, Windows screen readers, and real deploy/rollback remain
separate open evidence.

## Verification Commands

Core CI-equivalent verification:

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

Extended soak is a manual pre-release gate, not a default CI command. See
`docs/release/SOAK-RUNBOOK.md`.

Never report a command as green unless it was executed against the exact
reported SHA. `pnpm test` already includes any matching `src/**/*.test.*`
file; the separate `skin:validate` command remains an explicit release
gate even where its tests overlap the full unit suite.

## UI / Skin Work Rules

```text
one shared screen/component/layout system
no skin-specific screen copies
layout, hit areas, focus, z-index, and game meaning are skin-invariant
skins change only typed allowlisted presentation values
all generic controls are shared components
all renderer/slice behavior is centralized
both official skins and fallback behavior must remain usable
```

For any UI/skin change, read the mandatory documents listed in
`AGENTS.md` and add Gallery/test coverage before broad rollout.

## Architecture Boundaries

```text
UI does not judge roles, score, or wildcard assignment
engine does not import React, DOM, localStorage, or CSS
skin does not access engine, schema, storage, records, or network
shared deck JSON contains no executable or image/URL injection fields
localStorage values are parsed before use
```

## Release Claim Boundaries

```text
local production preview != deploy
Playwright WebKit != Safari
emulation/simulator != physical-device pass
AX-tree automation != real screen-reader acceptance
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
match restore/replay/resend feature (non-MVP)
marketplace/payment/entitlement product (future scope)
extendedRoleSpan variant (non-MVP, blocked by its existing contract)
```

## Work Rule

```text
one purpose per commit where tooling permits
small testable changes
implementation and contract docs updated together
never silently weaken historical evidence scope
never infer CI success from a successful push
report local results separately from GitHub Actions
```
