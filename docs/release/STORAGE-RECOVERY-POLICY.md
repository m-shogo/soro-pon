# Storage / Migration Recovery Policy

Applies to:

```text
soro-pon.decks.v1
soro-pon.decks.v1.corrupt-backup
soro-pon.records.v1
soro-pon.records.v1.corrupt-backup
soro-pon.settings.v1
soro-pon.settings.v1.corrupt-backup
soro-pon.skin.v1
```

Established in Gate 6 and hardened by the post-Batch-10 integrity review.
Review: `docs/qa/POST-BATCH-10-INTEGRITY-REVIEW.md`.

## Principles

```text
do not destroy unaffected recoverable data
recovery must not become the crash
do not fail silently
do not claim a write/reset succeeded when it did not
prefer partial salvage to full reset
preserve corrupt raw data only when storage permits
use only known deterministic migrations
```

## Guarantee Scope

Recovery is not unconditionally lossless.

```text
failed normal write:
  persisted state is not replaced by that failed write
  open editor/import input remains in memory where applicable
  reload can still lose an unsaved draft

unrecoverable deck entry:
  dropped from active recovered list
  raw outer payload backed up only if storage permits

corrupted records/settings:
  empty/default active state
  raw corrupt value backed up only if storage permits

storage read denial:
  L9005 + empty/default in-memory session fallback

starter bootstrap write failure:
  L9006; app does not claim persistence
```

`*.corrupt-backup` is forensic best-effort preservation, not a guaranteed
user backup or restore feature.

## Read / Recovery Path

Implemented in:

```text
src/storage/localStorageDeckStore.ts
src/storage/localStorageRecordsStore.ts
src/storage/localStorageSettingsStore.ts
src/app/AppRoot.tsx
```

| Condition | Behavior | Code |
|---|---|---|
| key absent | empty/default payload, no issue | — |
| `getItem()` rejected | empty/default session state; boot warning | `L9005` |
| deck JSON/outer shape unrecoverable | backup/remove independently attempted; empty deck payload | `L9001` |
| safe legacy deck migration | keep entries; best-effort normalized writeback | `L9002` |
| some deck entries unrecoverable | keep healthy entries; drop only bad entries | `L9003` |
| records/settings corrupted | backup/remove independently attempted; empty/default state | `L9001` |
| backup or cleanup fails | keep recovered in-memory state and name failed operation | original code |
| starter persistence fails | continue without false saved claim | `L9006` |

`AppRoot` collects unique initial issues from decks, records, and settings
and shows them in the boot warning Toast.

## Normal Write Path

Normal mutations use `safeWrite()` and produce a translated
`StorageWriteError`.

`AppRoot.tryWrite()`:

```text
shows a warning
returns false
blocks success-only navigation/state changes
keeps open draft/input where applicable
does not display an achievement/reward as saved after failure
```

Recovery cleanup differs: backup/remove/writeback are independently
best-effort because throwing from cleanup would block recovered state.

## Legacy Import Migration

Parser migration is not immediately persisted.

```text
first action:
  show version transition, exact changed items, and warnings
  retain pasted input
  do not save

second action with unchanged input:
  save migrated current-version deck
  navigate only after successful write

input edit:
  invalidate prior review and require review again
```

Canonical detail: `docs/MIGRATIONS.md`.

## Full Local Reset

Implemented in:

```text
src/storage/resetLocalData.ts
src/ui/screens/TopScreen.tsx
```

The TOP action “全て削除して初期化する” covers every known active and
forensic key plus the selected skin:

```text
deck active + corrupt backup
records active + corrupt backup
settings active + corrupt backup
skin selection
```

Rules:

```text
do not call localStorage.clear(); remove only app-owned known keys
attempt every key even if one removal throws
return removedKeys and failedKeys
reload only when failedKeys is empty
on partial failure, keep page open and show an explicit error
never claim all data was deleted after a partial failure
```

Browser storage APIs cannot prove physical erasure beyond successful
`removeItem()` completion. The UI truthfully reports API-level failure.

## Error Code Ownership

```text
L9001 corrupt/invalid persisted payload recovered or normalized
L9002 older deck data migrated without dropping entries
L9003 unrecoverable deck entries dropped during partial recovery
L9004 local image missing; visual fallback used
L9005 browser storage read unavailable; session fallback used
L9006 bootstrap/default data could not be persisted
```

`L9004` is not a generic storage-access code.

## Backup / Restore Reality

Supported:

```text
raw corrupt payload retained when storage permits
healthy deck entries salvaged automatically
deterministic v0 -> v1 deck migration
manual inspection through browser developer tools
full local reset includes forensic backup keys
```

Not supported:

```text
in-app restore button
backup merge
cloud/cross-device backup
guaranteed backup creation when storage rejects writes
blind restoration of raw corrupt payload
```

A future restore UI must strict-parse and migrate. It must never copy raw
backup text directly over an active key.

## Skin Storage

`soro-pon.skin.v1` contains one ID. `SkinProvider` guards read/write and
sanitizes to a built-in known skin. No structured salvage is required.

## Tests

```text
src/storage/gate6StorageRecovery.test.ts
  existing salvage/migration/corruption/normal-write cases

src/storage/storageRecoveryFailurePaths.test.ts
  6 backup/cleanup/read-denial compound failure cases

src/app/AppRoot.persistence.test.tsx
  3 boot-notice and visible migration-confirmation cases

src/storage/resetLocalData.test.ts
  3 reset completeness/success/partial-failure cases

scripts/gate6-qa-01-migration-storage-recovery.mjs
  existing browser recovery checks

tests/visual/gate6-recovery-states.spec.ts
  recovery/reset/toast visual states
```

The 12 new review-added cases are committed but remain unverified until
executed on the exact current SHA.

## Final Decision

Recovery and reset are release-critical promises. The app must distinguish
recovered-in-memory, persisted, backed up, partially deleted, and fully
reset states instead of collapsing them into a generic success message.
