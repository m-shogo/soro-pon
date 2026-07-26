# CLAUDE.md

Claude Code向け補足。共通ルールの正本は `AGENTS.md`。

## Current Status — 2026-07-25

```text
MVP 1-14 / multi-skin / H1-H11: complete
official finals: 18
historical Gate 4/5/6: PASS within recorded scopes
RC: LIMITED READY
Batch 7 COMPLETE / Batch 8 CONDITIONAL / Batch 9 COMPLETE / Batch 10 CONDITIONAL
Batch 11: COMPLETE on frozen SHA 7548964 (FF 151.0 + Playwright WebKit
  26.5 prod-preview core 15/15 each + rotations, 0 product defects; WebKit
  != Safari; no FF/WK memory claim)
post-Batch-10 integrity/residual scope: 92 definitions across 28 files
frozen SHA 7548964: typecheck/unit 425/skin/build + CI + Integrity green
  (exact-SHA verification for the Batch 11 precondition); wider residual
  closure continues under the concurrent work-stream's own tracking
```

「MVP/H1開始」「画像生成前」「次はasset Batch 5」は古い指示。

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
docs/release/STORAGE-RECOVERY-POLICY.md
docs/SKIN-DISTRIBUTION.md
```

## Immediate Execution Order

```text
1. Stop concurrent writers.
2. clean worktree; HEAD == origin/main; record exact SHA.
3. Record toolchain/browser/Python versions.
4. pnpm install --frozen-lockfile
5. Run .github/workflows/integrity.yml equivalent (28 files).
6. Confirm all 92 targeted definitions are collected/PASS.
7. pnpm typecheck
8. pnpm test
9. pnpm skin:validate
10. pnpm build + artifact hash/inventory
11. Run Python 3.13 install + pip check + asset fixtures as declared in CI.
12. If product/test/workflow changes, discard results and restart from step 1.
13. Execute Batch 11 on the same SHA/artifact.
14. Commit report/evidence, then synchronize readiness docs.
```

Do not duplicate the targeted file list here; `.github/workflows/integrity.yml`
is the executable list.

## Integrity Contract

```text
storage read denial:
  L9005 display fallback
  mutation/export fail closed

write boundary:
  strict runtime parse immediately before persistence
  nested IDs/memberships/group fields/score caps checked
  stale observed deck update/delete rejected

match result:
  record/coins/roles/achievements in one write
  MatchSession React identity uses matchSessionId, not seed

recovery:
  preserve valid deck bodies and valid progress where safely identifiable
  dedupe set-like legacy values before retention caps
  backup raw payload when possible
  export forensic raw bundle without reinterpretation
  failed export never removes source backup or claims success
  unknown versions are not guessed

limits:
  decks 200 / records 100 / roles 500 / achievements 100 / recent keys 20

import/editor:
  migration and same-ID overwrite need visible unchanged-state review
  unsafe diagnostics are bounded but import remains rejected
  live Editor uses the production integrated validator

reset/destructive UI:
  full known-key deletion required before reload
  reset points to forensic export first
  danger Dialog focuses cancel and describes irreversible copy

skin:
  failed/unmounted load cannot replace current UI
  duplicate/future registry rejected
  external-evaluated SVG rejected
  manifest text cannot elevate trust above loader-owned origin
  loader-owned origin is not a cryptographic signature

supply chain:
  Main CI / Integrity actions use immutable commit SHAs
  Python asset install runs exact top-level pins + pip check
```

Fingerprint guards are not transactional multi-tab CAS. Raw forensic export is
not a restore feature. Exact Python pins plus `pip check` are not a transitive
hash lock.

## UI / Skin Contract

```text
one shared layout/component system
no skin-specific screens
layout/hit areas/focus/z-index/game meaning are skin-invariant
skins change typed allowlisted presentation values only
shared renderers/components before screen-local implementations
```

Asset Batches 1-4 are closed. Do not restart image generation without a new
explicit task and current release evidence.

## Release Boundaries

```text
local preview != deploy
Playwright WebKit != Safari
emulation != physical device
automated accessibility tree != real screen reader
old SHA PASS != current SHA verification
successful push != CI success
workflow definition != workflow PASS
raw forensic export != validated restore
loader-owned origin != cryptographic package identity
```

Report exact files/SHA, commands actually run, CI status or unavailable,
browser/device scope, evidence, remaining risks, Batch 11 status, and RC status.
