# Batch 6 — Gate 6 QA Matrix

Release Candidate track. Canonical Gate 6 definition:
[docs/RELEASE-DEMO-GATES.md#gate-6-release-candidate](../RELEASE-DEMO-GATES.md).
This document operationalizes that definition into concrete checks,
evidence, and PASS/CONDITIONAL/FAIL criteria — it does not replace or
override the canonical gate list.

Date: 2026-07-21. Start commit: `b5b9f5c`'s parent
(`2f1d297` — end of Batch 5 + its corrections). Browser: Chromium
(Desktop Chrome) only, same validated scope as Batch 5 — see
[BATCH-5-QA-MATRIX.md](./BATCH-5-QA-MATRIX.md) for why WebKit/Firefox/
real Safari remain NOT TESTED. Gate 6 does not expand browser scope.

## Scope

| Area | In scope this batch | Evidence |
|---|---|---|
| Migration | localStorage deck-store schema versioning, per-deck salvage, legacy-version auto-migration | `src/storage/gate6StorageRecovery.test.ts`, `scripts/gate6-qa-01-migration-storage-recovery.mjs` |
| Storage recovery | quota-exceeded write handling, corrupted/partial/null/empty/oversized read handling | same as above |
| Performance | cold boot, screen transitions, heap growth over repeated skin-switch/rematch loops, bundle/asset byte counts | `scripts/gate6-qa-02-performance.mjs` → `docs/qa/evidence/batch-6/performance/` |
| Caching | Vite content-hash behavior (stable on no-op rebuild, changes on real content change), skin asset versioning (carried over from Batch 5, re-confirmed) | manual rebuild rehearsal (this session), `docs/qa/evidence/batch-6/rollback/` |
| Rollback | local build-artifact rehearsal (no production environment exists) — old build reads new-shape data and vice versa, old build's own skin package resolves cleanly | `scripts/gate6-qa-03-rollback-rehearsal.mjs` → `docs/qa/evidence/batch-6/rollback/` |
| Accessibility acceptance | heading hierarchy, accessible names, dialog semantics, live regions, tile aria-pressed, 200%-zoom-equivalent viewport, reduced motion | `scripts/gate6-qa-04-accessibility-acceptance.mjs` → `docs/qa/evidence/batch-6/accessibility/` |
| Visual regression | new deterministic states (reset confirmation, quota-exceeded toast, partial-salvage toast, invalid-skin fallback) | `tests/visual/gate6-recovery-states.spec.ts` |
| Release/deploy smoke | build + preview boot, CI green | this batch's Verification section |

## Out of scope this batch (unchanged from Batch 5, not re-litigated)

```text
new gameplay rules or evaluation modes
online multiplayer, accounts, billing, cloud sync
Gate 7 (installed/paid skin trust) and Gate 8 (match restore/replay)
WebKit/Firefox/real Safari/real mobile device verification
new image asset generation
```

## P0-P3 classification (applies to all findings this batch)

```text
P0: data destruction, cannot boot, public-demo-stopping
P1: primary flow impossible, unrecoverable, severe accessibility blocker
P2: avoidable but should be fixed before RC
P3: cosmetic / improvement candidate
By design: matches documented/intended behavior, not a defect
Test script defect: the QA script's assumption was wrong, not the product
Documentation defect: docs/evidence text was wrong, not the product
Environment limitation: cannot be verified in this environment (e.g. real Safari)
```

## Gate 6 decision criteria (from docs/RELEASE-DEMO-GATES.md, made concrete)

**PASS** requires all of:
- P0 = 0, P1 = 0
- Migration is safe: a corrupted or legacy-schema entry does not destroy
  unrelated healthy data
- Storage recovery: corrupted/partial/quota-exceeded states recover
  without a recovery loop and without silently discarding a
  user-created deck
- Rollback: a locally rehearsed rollback (build-artifact based, since no
  production environment exists) completes without data loss in either
  direction
- Caching: no evidence of mixed old/new asset versions after a rebuild;
  content hashes are stable when content is unchanged and change when
  content changes
- No severe performance regression observed in the spot-check (this is
  a spot-check, not a full performance gate — see the report's caveats)
- Accessibility acceptance basics met via semantic/programmatic
  inspection (real screen-reader testing is out of scope for this
  environment and is not claimed)
- All automated verification (typecheck/test/skin:validate/
  asset:image:test/build/test:visual) green
- CI green
- Worktree clean, evidence matches docs

**CONDITIONAL PASS**: P0/P1 = 0, but a scoped P2 remains with documented
impact/workaround/owner/expiry, or browser/device scope is explicitly
narrower than desired (which is already the case here: Chromium only).

**FAIL**: any P0/P1 remains, migration or rollback can destroy data,
storage recovery cannot recover, CI or primary automated verification
fails, or untested scope is reported as tested.
