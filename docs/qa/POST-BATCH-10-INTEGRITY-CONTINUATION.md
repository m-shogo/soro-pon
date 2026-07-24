# Post-Batch-10 Integrity Review — Continuation

Date: 2026-07-24  
Repository: `m-shogo/soro-pon`  
Parent review: `docs/qa/POST-BATCH-10-INTEGRITY-REVIEW.md`  
Result: **ADDITIONAL PRODUCT FIXES COMMITTED / EXACT-SHA VERIFICATION PENDING**  
RC status: **LIMITED READY**  
Batch 11: **CONTRACT DEFINED / NOT EXECUTED**

## Executive Verdict

The first integrity review fixed recovery crashes and false persistence
claims, but a second pass found deeper read-modify-write, capacity,
identity, atomicity, and multi-tab conflict defects.

The most serious issue was a fail-open persistence pattern: when
`localStorage.getItem()` was denied, a Store returned an empty/default
in-memory value and a later mutation could write that empty-based state
back if `setItem()` happened to work. That could overwrite unknown existing
bytes. All Store mutations now fail closed after a read denial.

This continuation also closes self-corruption paths where the application
could write more entries than its own storage schema could read on the next
boot.

No command result is claimed. All changes and tests below are committed but
remain unverified on the exact final SHA.

## Additional Findings

| ID | Severity | Finding | Risk | Disposition |
|---|---|---|---|---|
| IRC-01 | P1 | Read denial was treated as an empty Store during later mutation | Existing unknown deck/records/settings bytes could be replaced by an empty-based write | Fixed fail-closed |
| IRC-02 | P1 | Match record/coins and match-derived achievements used two writes | Second-write failure produced partial persistence and misleading copy | Replaced with one atomic validated write |
| IRC-03 | P1 | Deck Store allowed a 201st entry while schema maximum was 200 | App generated a payload it would classify as invalid on next load | New writes bounded; old payload partially salvaged |
| IRC-04 | P1 | Role collection could exceed schema maximum 500 | Next load could reset all records/coins/achievements | New role key bounded; match data preserved; old payload normalized |
| IRC-05 | P1 | Importing an existing deck ID silently replaced it | User-authored deck could be irreversibly overwritten | Two-step explicit overwrite review |
| IRC-06 | P1 | Import/editor confirmation did not account for another tab changing the deck | A stale confirmation or draft could overwrite a newer entry | Stored-entry fingerprint conflict checks added |
| IRC-07 | P2 | `created-${Date.now()}` was not collision-safe | Same-ms or multi-tab creation could update an existing deck instead of creating one | UUID-based ID plus existing-ID collision suffix |
| IRC-08 | P2 | `V3010` promised variant/role/bonus uniqueness but implementation covered only category/tile | Ambiguous role collection, role family, editor update, and variant selection | Global nested-ID validator added |
| IRC-09 | P2 | Store writes trusted TypeScript types without final runtime parse | Internal bug could persist data the next boot could not read | Strict write-boundary parse on all Stores |
| IRC-10 | P2 | Export read failure could be reported as “deck not found” or escape an event handler | Misleading recovery and raw exception risk | Export fails closed and surfaces translated Toast |
| IRC-11 | P2 | Old over-limit payloads would be treated as generic corruption after introducing write bounds | Upgrade could wipe state produced by the previous app itself | `L9007` bounded salvage with raw backup |
| IRC-12 | P3 | Editor live panel still uses the older gameplay validator internally | Cross-variant ID error may appear only when save is attempted | Persistence/play boundaries are closed; live-panel integration remains a UI refinement |
| IRC-13 | Residual | `localStorage` has no synchronous compare-and-swap | Two writes in the same scheduling window can still race | Documented; true fix requires versioned transaction model |

## Implemented Integrity Model

### Storage read denial

```text
load for display:
  return empty/default session state + L9005 warning

mutation/export:
  detect read failure cause
  throw translated StorageWriteError
  never call setItem/removeItem based on assumed empty state
```

This applies to:

```text
deck save/remove/export
record/coin/achievement commit
settings save
```

### Atomic match commit

`RecordsStore.commitMatch()` writes the following together:

```text
match record
coins
role collection
totalMatches
last/recent match keys
match-derived achievements
```

Duplicate match keys skip both the achievement resolver and the write.
Failed writes leave the previous payload unchanged.

### Runtime and entity IDs

```text
new deck project ID:
  crypto.randomUUID() when available
  bounded fallback otherwise
  existing-ID collision suffix
  shared JSON ID schema and 64-character maximum preserved

nested deck IDs:
  variant ID unique across deck
  role ID unique across all variants
  special + score bonus IDs share one unique bonus namespace
```

Nested-ID checks run at:

```text
import
integrated deck validation
editor save boundary
DeckStore final save boundary
match setup/start boundary
```

### Persisted collection limits

```text
decks                         200
match records                 100
role collection entries       500
achievements                  100
recent processed match keys    20
```

New writes stay within these values. Existing deck updates remain possible
at the deck cap. A new role key at the collection cap is omitted while the
match, coins, and achievements are preserved.

### Legacy over-limit recovery

Deck payload above 200:

```text
backup original raw payload when possible
retain official decks first
retain newest updatedAtMs next
use original order as deterministic tie-break
rewrite at 200 entries when possible
report L9007
```

Records payload above an array bound:

```text
backup original raw payload when possible
trim only overflowing arrays
preserve valid coins, totalMatches, records, and achievements not being trimmed
rewrite valid bounded payload when possible
report L9007
```

### Import overwrite safety

```text
first same-ID import action:
  show existing deck name
  explain irreversible replacement
  do not write

second action:
  require unchanged input
  require unchanged full StoredDeck fingerprint
  otherwise invalidate review and show current saved state
```

Legacy migration review happens before overwrite review, so a version-0
same-ID import may require separate migration and overwrite confirmations.

### Editor conflict safety

Editor save compares the entry rendered at open time with a fresh Store
read. If another tab or screen changed/deleted it:

```text
do not save stale draft
show conflict warning
refresh deck state
unmount editor
return to deck list
```

## Targeted Tests Added in This Continuation

### Storage failure semantics — 3 additional cases

`src/storage/storageRecoveryFailurePaths.test.ts`

```text
deck save/remove/export fail closed after read denial
record and achievement mutation fail closed after read denial
settings save fails closed after read denial
```

### Match atomicity — 3 cases

`src/storage/localStorageRecordsAtomicity.test.ts`

```text
one storage write contains record + rewards
duplicate match key skips resolver and write
write failure leaves prior payload unchanged
```

### Runtime ID collision safety — 3 cases

`src/app/runtimeIds.test.ts`

```text
UUID-based ID satisfies shared schema
existing collision receives deterministic suffix
unsafe/long entropy remains valid and bounded
```

### Capacity and upgrade recovery — 5 cases

`src/storage/localStorageCapacity.test.ts`

```text
201st new deck rejected without changing raw payload
existing deck update allowed at 200
old 201-entry deck payload partially salvaged and backed up
new role key omitted at 500 while match data persists
old 501-entry role collection normalized without wiping other state
```

### Nested entity IDs — 4 cases

`src/engine/validation/validateDeckEntityIds.test.ts`

```text
duplicate variant ID
duplicate role ID across variants
special/score bonus namespace collision
import rejection before persistence
```

### Final write boundary — 4 cases

`src/storage/storageWriteContract.test.ts`

```text
schema-invalid deck rejected
duplicate nested role ID rejected by direct Store call
schema-invalid match record rejected
schema-invalid settings rejected
```

### Import and cross-tab UI — 4 additional cases

`src/app/AppRoot.persistence.test.tsx`

```text
existing ID requires explicit overwrite confirmation
input edit invalidates overwrite confirmation
external update invalidates an existing overwrite confirmation
external update causes stale Editor draft rejection and unmount
```

New targeted cases in this continuation: **26**.  
Cumulative cases added across the two post-Batch-10 reviews: **38**.

These numbers describe committed test definitions, not passing results.

## CI Change

The named CI step is now `Critical integrity contracts` and runs:

```text
storageRecoveryFailurePaths
localStorageRecordsAtomicity
localStorageCapacity
storageWriteContract
resetLocalData
runtimeIds
AppRoot.persistence
validateDeckEntityIds
```

The full unit suite, typecheck, skin validation, and production build still
run afterward. The named step intentionally overlaps the full suite to make
release-critical failures immediately visible.

## Residual Risks

### Not closed by this continuation

```text
exact-SHA typecheck/test/build/CI execution
Batch 11 production Firefox/WebKit execution
physical mobile devices
real Safari + VoiceOver
NVDA/JAWS
real deploy and deployed-artifact rollback
user-facing corrupt-backup restore
true multi-tab transactional compare-and-swap
Editor live validation panel integration for cross-variant ID errors
```

The optimistic StoredDeck fingerprint check materially reduces stale
writes, but it is not a database transaction. If concurrent multi-tab
editing becomes an advertised feature, introduce a persisted revision and
an asynchronous lock/transaction design rather than presenting the current
check as fully atomic.

## Required Verification Sequence

```text
1. Freeze clean HEAD == origin/main.
2. Record exact SHA and toolchain versions.
3. pnpm install --frozen-lockfile.
4. Run the named Critical integrity contracts command.
5. pnpm typecheck.
6. pnpm test and confirm all 38 cumulative review cases are collected.
7. pnpm skin:validate.
8. pnpm build and record artifact hashes.
9. Fix any failure and restart from step 1 after every code/test change.
10. Execute Batch 11 against that same production artifact.
```

## Decision

```text
ADDITIONAL PRODUCT FIXES: COMMITTED
TARGETED TESTS: COMMITTED, UNEXECUTED FOR FINAL SHA
CI CONTRACT: HARDENED, FINAL RESULT UNOBSERVED
BATCH 11: NOT EXECUTED
RC: LIMITED READY
NEW FEATURE / ASSET WORK: DO NOT START BEFORE EXACT-SHA CLOSURE
```
