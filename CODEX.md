# CODEX.md

Codex向け作業指示。共通ルールは `AGENTS.md` が正本。このファイルは
現在地・実行順・破綻しやすい境界だけを補足する。

## Current Status — 2026-07-24

```text
Gameplay MVP phases 1-14: complete
Multi-skin runtime baseline: complete
Skin hardening H1-H11: complete
Official skins: yorunoshirube (9 finals, v4) / cute-pop (9 finals, v5)
Gate 4 / Gate 5 / historical Gate 6: PASS within recorded scopes
RC status: LIMITED READY
Batch 7: COMPLETE
Batch 8 real VoiceOver + Chrome: CONDITIONAL
Batch 9 extended soak: COMPLETE
Batch 10 production-preview / real-device validation: CONDITIONAL
Batch 11 production Firefox/WebKit: contract defined, NOT executed
Post-Batch-10 integrity reviews:
  product/test/CI/doc fixes committed
  38 targeted cases committed
  exact-current-SHA verification pending
```

古い指示:

```text
H1から実装
画像生成前のfoundation phase
次はasset Batch 5
historical Batch 10 buildを現行HEADの証跡として使う
```

これらは実行しない。

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
```

Storage/recovery:

```text
docs/release/STORAGE-RECOVERY-POLICY.md
docs/ERROR-CODES.md
docs/MIGRATIONS.md
docs/OPERATIONS-READINESS.md
```

UI/skin/assetは `AGENTS.md` のMandatory UI listをすべて読む。

## Immediate Execution Order

```text
1. git status --short
2. git rev-parse HEAD
3. git rev-parse origin/main
4. cleanかつHEAD == origin/main、exact SHAを記録
5. Node/pnpm/Playwright/browser versionsを記録
6. pnpm install --frozen-lockfile
7. CIと同じ Critical integrity contracts 8ファイルを実行
8. pnpm typecheck
9. pnpm test
10. review追加38ケースが収集/PASSしたことを確認
11. pnpm skin:validate
12. pnpm build + artifact inventory/hash
13. 同じSHA/artifactでBatch 11 matrixを全実行
14. report/evidence作成
15. entry docsを証跡に合わせて同期
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

product/test codeを直したら、その前のcurrent-SHA/Batch 11証跡を混ぜず、
新SHAで1から再実行する。未実行commandや別SHAの結果をgreenと報告しない。

## Current Integrity Contract

```text
storage read denial:
  displayはL9005のsession fallback
  mutation/exportはfail closed

persistence:
  setItem直前にstrict schema parse
  match record/coins/roles/achievementsは1 atomic write

limits:
  decks 200
  records 100
  roles 500
  achievements 100
  recent match keys 20
  old overflowはraw backup + L9007 bounded salvage

IDs:
  new deckはUUID-based + existing collision check
  variant/role/bonus IDsはdeck全体で一意

import/editor:
  legacy migrationはvisible confirmation
  same-ID overwriteはinput + StoredDeck fingerprint confirmation
  stale Editor draftは保存せずunmount

reset:
  active + corrupt backup + skin keys
  partial failureはreloadせず明示
```

`localStorage`にはsynchronous CASがない。現在のfingerprint checkを
transactional multi-tab editingと表現しない。

## Current UI / Skin Contract

```text
one stable layout and component implementation
no skin-specific screens
shared generic controls only
layout/hit areas/touch/focus/z-index/state meaning are skin-invariant
assets and slice logic are centralized
external skins use typed allowlisted presentation values only
both official skins preserve fallback behavior
```

Do not implement generic render behavior independently inside screens.

## Asset Boundary

Batches 1-4 are closed。古いroadmapの“next”だけを理由に画像生成しない。
明示的な現行asset taskがある場合のみ:

```text
generate -> generated/candidates -> review -> human approval
-> generated/final -> manifest/version update -> verification
```

Direct output to `generated/final` is forbidden.

## Release Claim Boundaries

```text
local production preview != deploy
Playwright WebKit != Safari
simulator/emulation != real device
AX-tree automation != real screen reader
not measured = null/not_available, never 0
old artifact PASS != current HEAD verification
best-effort backup != restore feature
optimistic fingerprint != transactional CAS
```

## Architecture Boundary

```text
UI does not implement role/scoring/wildcard logic
engine does not import React/DOM/localStorage/CSS
skin does not access engine/schema/storage/records/network
shared deck JSON contains no image/URL/base64/path/html/script/style fields
persisted state is parsed before use and immediately before write
recovery code must not crash because cleanup/backup failed
```

## Work and Report

Use small testable commits where tooling permits. Report exact changed
files, commit SHA(s), commands actually run, CI status or unavailable,
browser/device scope, affected skins/screens, evidence, remaining risks,
and the next executable step.
