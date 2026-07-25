# CODEX.md

Codex向け補足。共通ルールの正本は `AGENTS.md`。

## Current Status — 2026-07-25

```text
MVP 1-14 / multi-skin / H1-H11: complete
official finals: 18
historical Gate 4/5/6: PASS within recorded scopes
RC: LIMITED READY
Batch 7 COMPLETE / Batch 8 CONDITIONAL / Batch 9 COMPLETE / Batch 10 CONDITIONAL
Batch 11: contract defined, NOT executed
post-Batch-10 integrity/residual scope: 92 definitions across 28 files
exact-SHA execution: pending
```

Do not restart H1, foundation image preparation, asset Batch 5, or another
obsolete sequence.

## Read First

```text
README.md
AGENTS.md
docs/README.md
docs/MASTER-SPEC.md
docs/IMPLEMENTATION-WORKFLOW.md
docs/RELEASE-DEMO-GATES.md
docs/qa/POST-BATCH-10-INTEGRITY-REVIEW.md
docs/qa/POST-BATCH-10-INTEGRITY-CONTINUATION.md
docs/qa/POST-BATCH-10-INTEGRITY-DEEP-DIVE.md
docs/qa/POST-BATCH-10-RESIDUAL-CLOSURE.md
docs/qa/BATCH-11-PRODUCTION-CROSS-BROWSER-MATRIX.md
```

For storage/skin work also read:

```text
docs/release/STORAGE-RECOVERY-POLICY.md
docs/ERROR-CODES.md
docs/MIGRATIONS.md
docs/SKIN-DISTRIBUTION.md
docs/OPERATIONS-READINESS.md
```

## Immediate Execution Order

```text
1. Stop concurrent writers.
2. git status --short
3. git rev-parse HEAD && git rev-parse origin/main
4. Require clean HEAD == origin/main; record exact SHA.
5. Record Node/pnpm/Playwright/browser/Python versions.
6. pnpm install --frozen-lockfile
7. Run the 28-file Integrity Contracts workflow equivalent.
8. Confirm all 92 targeted definitions are collected and pass.
9. pnpm typecheck
10. pnpm test
11. pnpm skin:validate
12. pnpm build + artifact inventory/hash
13. Run Python 3.13 install + pip check + asset fixtures as declared in CI.
14. If any file changes, restart from step 1.
15. Execute Batch 11 on the same production artifact.
16. Commit report/evidence; then synchronize readiness docs.
```

## High-risk Boundaries

```text
storage read fallback is display-only; mutation/export fails closed
all persisted writes receive final runtime parse
valid deck/progress salvage must not guess unknown versions
set-like legacy arrays dedupe before retention caps
raw forensic export is not validated restore
stale observed deck update/delete must be rejected
localStorage fingerprint is not transactional CAS
same-ID import needs current-state confirmation
membership arrays use set semantics
groupType cannot carry ignored fields
MatchSession identity uses matchSessionId, not seed
danger Dialog initially focuses cancel
skin preload/unmount failures retain previous/fallback state
manifest self-declaration cannot elevate runtime trust
loader-owned origin is not cryptographic package identity
```

## UI / Skin

Follow the complete mandatory list in `AGENTS.md`.

```text
one shared component/layout system
no skin-specific screens
no screen-local generic controls
skin cannot alter layout/hit area/focus/z-index/game meaning
external-evaluated skin: allowlisted tokens + registered PNG/WebP only
```

## Report

Never claim PASS without an observed result for the exact SHA. Report changed
files/commits, commands/results or non-execution, Actions visibility, affected
data/UI/skins, remaining risks, Batch 11 status, and RC status.
