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

Established in Gate 6 and hardened by the post-Batch-10 integrity reviews.
Review record: `docs/qa/POST-BATCH-10-INTEGRITY-REVIEW.md`.

## Principles

```text
do not destroy unaffected recoverable data
recovery must not become the crash
read failure must never be interpreted as an empty persisted store for mutation
do not fail silently
do not claim a write/reset succeeded when it did not
validate every persisted payload again at the final write boundary
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
  save/remove/export/record/achievement/settings mutations fail closed
  unknown existing persisted bytes are not replaced by an assumed empty state

starter bootstrap write failure:
  L9006; app does not claim persistence

legacy persisted collection overflow:
  L9007; raw payload is backed up when possible
  current bounded data is selected/trimmed and rewritten when possible
```

`*.corrupt-backup` is forensic best-effort preservation, not a guaranteed
user backup or restore feature.

## Persisted Limits

The schema and store implementations share these exact constants:

```text
decks                         200
match records                 100
role collection entries       500
achievement IDs               100
recent processed match keys    20
```

New writes never exceed these bounds. Updating an existing deck remains
allowed at the 200-deck limit; adding another deck is rejected with a
translated `StorageWriteError` and leaves the prior payload unchanged.

A new won-role key is omitted after the 500-entry role-collection limit,
but the match record, coins, and achievements are still committed. The UI
states that exact partial result rather than calling the whole write a
failure.

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
| `getItem()` rejected | empty/default session state; boot warning; every mutation/export fails closed | `L9005` |
| deck JSON/outer shape unrecoverable | backup/remove independently attempted; empty deck payload | `L9001` |
| safe legacy deck migration | keep entries; best-effort normalized writeback | `L9002` |
| some deck entries unrecoverable | keep healthy entries; drop only bad entries | `L9003` |
| old deck payload contains more than 200 valid entries | retain official decks, then newest entries; normalize to 200; preserve raw payload | `L9007` |
| old records payload exceeds a bounded array | trim only overflowing arrays; preserve coins and other valid state; preserve raw payload | `L9007` |
| records/settings otherwise corrupted | backup/remove independently attempted; empty/default state | `L9001` |
| backup or cleanup fails | keep recovered in-memory state and name the failed operation | original code |
| starter persistence fails | continue without false saved claim | `L9006` |

For an old over-limit deck payload, the selection order is deterministic:

```text
official source first
then updatedAtMs newest first
then original array order as tie-break
```

`AppRoot` collects unique initial issues from decks, records, and settings
and shows them in the boot warning Toast.

## Final Write Boundary

Every deck, records, and settings payload is strict-parsed again immediately
before `setItem()`.

```text
schema failure:
  throw StorageWriteError
  do not call setItem
  retain the previous persisted payload

nested deck entity-ID failure:
  reject duplicate variant IDs
  reject role IDs duplicated within or across variants
  reject special/score bonus IDs duplicated in their shared bonus namespace
```

Nested ID integrity is enforced at four boundaries:

```text
import parser
AppRoot editor save/start guards
DeckStore.saveDeck final persistence boundary
match-entry validation
```

Older persisted decks with an ambiguous nested ID remain loadable and
exportable so the user can recover them, but they are marked draft and
cannot be played or newly saved unchanged.

## Atomic Match Persistence

A completed match no longer performs separate writes for records and
achievements. `RecordsStore.commitMatch()` computes and commits the
following in one validated `setItem()`:

```text
match record
coins
role collection
processed match key
total match count
match-derived achievements
```

If that write fails, none of those fields are partially committed. If the
match key was already processed, the achievement resolver and storage write
are both skipped.

Non-match achievements such as import/export/editor actions continue to use
a separate achievement write because the initiating operation has already
completed. Their failure message explicitly says the completed user action
or previously saved match data was not undone.

## Import Migration and Overwrite Review

### Legacy migration

```text
first action:
  show version transition, exact changed items, and warnings
  retain pasted input
  do not save

second action with unchanged input:
  continue to overwrite review when the migrated ID already exists
  otherwise save the current-version deck

input edit:
  invalidate every prior review
```

### Existing deck-ID overwrite

```text
first action:
  show the existing deck name and irreversible replacement warning
  do not save

second action:
  require both unchanged import text and unchanged existing StoredDeck fingerprint
  if another tab changed/deleted/replaced the entry, invalidate review and show latest state
```

Canonical migration detail: `docs/MIGRATIONS.md`.

## Editor Concurrency

Editor save uses an optimistic conflict check:

```text
capture the full StoredDeck fingerprint when the editor is rendered
re-read storage immediately before save
save only when the entry still matches
```

If another tab or screen changed/deleted the deck, the stale draft is not
written. The editor is unmounted and the user is returned to the deck list
to open the latest state.

This is not a transactional cross-tab database lock. Two writes that occur
inside the same browser scheduling window can still race because
`localStorage` has no compare-and-swap primitive and the current Store API
is synchronous. Cloud sync or multi-tab collaborative editing would require
a versioned transaction model, not more best-effort checks.

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
L9007 old persisted collection exceeded the current safe bound and was normalized
```

`L9004` is not a generic storage-access code.

## Backup / Restore Reality

Supported:

```text
raw corrupt/over-limit payload retained when storage permits
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

A future restore UI must strict-parse, migrate, validate nested entity IDs,
and apply current collection limits. It must never copy raw backup text
directly over an active key.

## Skin Storage

`soro-pon.skin.v1` contains one ID. `SkinProvider` guards read/write and
sanitizes to a built-in known skin. No structured salvage is required.

## Critical Integrity Tests

```text
src/storage/storageRecoveryFailurePaths.test.ts
  backup/cleanup/read-denial and fail-closed mutation/export cases

src/storage/localStorageRecordsAtomicity.test.ts
  one-write match rewards, duplicate no-op, failed-write atomicity

src/storage/localStorageCapacity.test.ts
  exact boundaries and old over-limit partial salvage

src/storage/storageWriteContract.test.ts
  write-boundary schema and nested-ID enforcement

src/storage/resetLocalData.test.ts
  complete key list and truthful partial reset

src/app/runtimeIds.test.ts
  collision-resistant shared deck IDs

src/app/AppRoot.persistence.test.tsx
  migration/overwrite confirmation and cross-tab stale-write rejection

src/engine/validation/validateDeckEntityIds.test.ts
  variant/role/bonus ID uniqueness and import rejection
```

The continuation added 26 targeted cases; together with the initial
post-Batch-10 review, 38 integrity cases were added. They are committed but
must not be described as passing until executed on the exact current SHA.

## Final Decision

Recovery, persistence, overwrite, and reset are release-critical promises.
The app must distinguish recovered-in-memory, persisted, atomically
committed, backed up, bounded/trimmed, conflict-rejected, partially deleted,
and fully reset states instead of collapsing them into a generic success
message.
