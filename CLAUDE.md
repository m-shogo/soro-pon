# CLAUDE.md

Claude Code向け作業指示。共通ルールは `AGENTS.md` が正本。

## Current Status — 2026-07-24

```text
Gameplay MVP phases 1-14: complete
Multi-skin runtime baseline: complete
Skin hardening H1-H11: complete
Official skins: yorunoshirube (9 finals, v4) / cute-pop (9 finals, v5)
RC status: LIMITED READY
Batch 7: COMPLETE
Batch 8 real VoiceOver + Chrome: CONDITIONAL
Batch 9 extended soak: COMPLETE
Batch 10 production preview / real-device validation: CONDITIONAL
Batch 11 production Firefox/WebKit: contract only, NOT executed
Post-Batch-10 integrity reviews:
  fixes committed
  38 targeted cases committed
  exact-current-SHA verification pending
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
docs/qa/BATCH-11-PRODUCTION-CROSS-BROWSER-MATRIX.md
docs/release/STORAGE-RECOVERY-POLICY.md
```

## Immediate Execution Order

```text
1. clean、HEAD == origin/main、exact SHAを記録
2. toolchain/browser versionsを記録
3. pnpm install --frozen-lockfile
4. Critical integrity contracts 8ファイルを実行
5. pnpm typecheck
6. pnpm test
7. review追加38ケースの収集/PASSを確認
8. pnpm skin:validate
9. pnpm build + artifact hash
10. 同じSHA/artifactでBatch 11を全実行
11. report/evidence後にentry docs同期
```

Critical integrity contracts:

```bash
pnpm exec vitest run \
  src/storage/storageRecoveryFailurePaths.test.ts \
  src/storage/localStorageRecordsAtomicity.test.ts \
  src/storage/localStorageCapacity.test.ts \
  src/storage/storageWriteContract.test.ts \
  src/storage/resetLocalData.test.ts \
  src/app/runtimeIds.test.ts \
  src/app/AppRoot.persistence.test.tsx \
  src/engine/validation/validateDeckEntityIds.test.ts
```

product/test codeを変えたら新SHAで最初から再実行する。未実行commandや別SHAの結果をgreenと報告しない。

## Integrity Contract

```text
storage read denial:
  L9005 session fallback
  mutation/exportはfail closed

write boundary:
  persisted payloadをsetItem直前にstrict parse
  nested variant/role/bonus IDも最終保存前に検査

match result:
  record/coins/role collection/match achievementsを1回で保存

limits:
  decks 200 / records 100 / roles 500 / achievements 100 / recent keys 20
  old overflowはraw backup + L9007 bounded salvage

import/editor:
  visible migration review
  same-ID overwriteはinput + stored-entry fingerprint確認
  stale Editor saveは拒否してdraftをunmount

reset:
  active + corrupt backup + skin keys
  partial failureはreloadせず表示
```

現在のfingerprint checkはtransactional multi-tab lockではない。

## UI / Skin Contract

```text
one shared layout/component system
no skin-specific screens
layout/hit areas/focus/z-index/game meaning are skin-invariant
skins change typed allowlisted presentation values only
shared renderers and components before screen-local implementations
```

Asset Batches 1-4はclosed。明示的な現行taskなしに画像生成を再開しない。

## Release Boundaries

```text
local preview != deploy
Playwright WebKit != Safari
emulation != physical device
automated accessibility tree != real screen reader
old SHA PASS != current SHA verification
successful push != CI success
best-effort backup != restore feature
```

Report exact files/SHA, commands actually run, CI status or unavailable,
browser/device scope, evidence, remaining risks, and next executable step.
