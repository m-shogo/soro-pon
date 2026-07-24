# CLAUDE.md

Claude Code向け補足。共通ルールの正本は `AGENTS.md`。

## Current Status — 2026-07-25

```text
MVP 1-14 / multi-skin / H1-H11: complete
official finals: 18
historical Gate 4/5/6: PASS within recorded scopes
RC: LIMITED READY
Batch 7 COMPLETE / Batch 8 CONDITIONAL / Batch 9 COMPLETE / Batch 10 CONDITIONAL
Batch 11: contract only, NOT executed
post-Batch-10 integrity definitions: 79 committed
exact-current-SHA verification: pending
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
docs/qa/BATCH-11-PRODUCTION-CROSS-BROWSER-MATRIX.md
docs/release/STORAGE-RECOVERY-POLICY.md
docs/SKIN-DISTRIBUTION.md
```

## Immediate Execution Order

```text
1. Stop concurrent writers.
2. clean worktree; HEAD == origin/main; record exact SHA.
3. Record toolchain/browser versions.
4. pnpm install --frozen-lockfile
5. Run .github/workflows/integrity.yml equivalent (23 files).
6. Confirm all 79 review-added definitions are collected/PASS.
7. pnpm typecheck
8. pnpm test
9. pnpm skin:validate
10. pnpm build + artifact hash/inventory
11. If product/test changes, discard results and restart from step 1.
12. Execute Batch 11 on the same SHA/artifact.
13. Commit report/evidence, then synchronize readiness docs.
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

recovery:
  preserve valid deck bodies and valid progress where safely identifiable
  backup raw payload when possible
  unknown versions are not guessed

limits:
  decks 200 / records 100 / roles 500 / achievements 100 / recent keys 20

import:
  migration and same-ID overwrite need visible unchanged-state review
  unsafe diagnostics are bounded but import remains rejected

reset/destructive UI:
  full known-key deletion required before reload
  danger Dialog focuses cancel and describes irreversible copy

skin:
  failed/unmounted load cannot replace current UI
  duplicate/future registry rejected
  external-evaluated SVG rejected
  official trust cannot come from manifest self-declaration
```

Fingerprint guards are not transactional multi-tab CAS.

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
best-effort backup != restore feature
```

Report exact files/SHA, commands actually run, CI status or unavailable,
browser/device scope, evidence, remaining risks, Batch 11 status, and RC status.
