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

Established in Gate 6 and hardened by the post-Batch-10 integrity and residual
closure passes. Current review index:

```text
docs/qa/POST-BATCH-10-INTEGRITY-REVIEW.md
docs/qa/POST-BATCH-10-INTEGRITY-CONTINUATION.md
docs/qa/POST-BATCH-10-INTEGRITY-DEEP-DIVE.md
docs/qa/POST-BATCH-10-RESIDUAL-CLOSURE.md
```

## Principles

```text
do not destroy unaffected recoverable data
recovery must not become the crash
read failure must never become an assumed empty persisted store for mutation
do not claim a write/reset/delete/export succeeded when it did not
strict-parse every payload at the final write boundary
prefer safe partial salvage to full reset
preserve original raw strings when storage permits
allow raw forensic export without reinterpreting corrupt data
do not guess unknown future versions
reject stale observed mutations
```

## Guarantee Scope

Recovery is not unconditionally lossless.

```text
failed normal write:
  previous persisted state remains
  open draft/import text remains in memory where applicable
  reload can still lose an unsaved draft

unrecoverable deck entry:
  only that entry is dropped when healthy entries can be identified
  raw outer payload is backed up only if storage permits

valid deck with damaged wrapper metadata:
  deck body is retained
  source falls back to created when invalid
  updatedAtMs falls back to current safe time when invalid

partially damaged records payload, current version:
  valid records/progress retained where safely identifiable
  malformed rows/fields excluded or reset to safe lower-value defaults

unknown records/deck version:
  not guessed
  backup/reset or explicit migration rejection

storage read denial:
  L9005 + empty/default in-memory display state
  save/remove/export/record/achievement/settings mutation fails closed

starter bootstrap write failure:
  L9006; app does not claim persistence
```

`*.corrupt-backup` is forensic best-effort preservation. It can be exported as
a versioned raw bundle, but it is not a guaranteed backup or validated restore
feature.

## Persisted Limits

```text
decks                         200
match records                 100
role collection entries       500
achievement IDs               100
recent processed match keys    20
```

All persisted numeric timestamps/counts/points must be nonnegative safe
integers (`<= Number.MAX_SAFE_INTEGER`).

New writes never exceed these bounds. Existing over-limit payloads are backed
up and reduced only where a valid bounded payload can be constructed. Set-like
string arrays remove duplicates before retention caps so a duplicate-heavy
prefix cannot discard later unique values.

## Deck Read / Recovery Path

| Condition | Behavior | Code |
|---|---|---|
| key absent | empty payload | — |
| `getItem()` rejected | empty display state; every mutation/export fails closed | `L9005` |
| JSON/outer shape unrecoverable | backup/remove independently attempted; empty active payload | `L9001` |
| valid current deck body but bad wrapper metadata | retain deck body; normalize metadata; rewrite when possible | `L9001` |
| known safe legacy migration | deterministic migration; rewrite when possible | `L9002` |
| some entries unrecoverable | keep healthy entries; drop only bad entries | `L9003` |
| more than 200 valid entries | official first, then newest, then original order; backup and normalize | `L9007` |
| duplicate persisted deck IDs | official first; within same source newest; then original order | `L9008` |
| backup/cleanup/writeback fails | keep recovered in-memory state and name failed operation | original code |

Persisted duplicate deck IDs are not silently left ambiguous. The original
payload is preserved when possible, and one deterministic winner remains.

## Records Read / Recovery Path

Strict valid payload:

```text
normalize roleCollection / achievements / recentMatchKeys as ordered sets
ensure totalMatches >= records.length
```

Current-version partial corruption:

```text
keep valid match rows
keep safe coins
keep valid role/achievement/match-key entries
dedupe set-like strings before retention caps
remove malformed or genuinely over-limit entries
repair invalid totalMatches to at least retained records.length
backup raw original
rewrite strict payload when possible
report L9001
```

Unknown version or unrecognizable shape:

```text
do not infer semantics
backup/remove independently attempted
return empty records
report L9001
```

Over-limit but otherwise valid arrays use `L9007` bounded normalization.

## Final Write Boundary

Every deck, records, and settings payload is strict-parsed immediately before
`setItem()`.

```text
schema failure:
  throw StorageWriteError
  do not call setItem
  retain previous persisted bytes
```

Deck write validation additionally rejects:

```text
duplicate category/tile/variant/role/bonus IDs
duplicate tile category/tag memberships
duplicate supported-player entries
group fields ignored by their groupType
ScoreBonus maxPoints below one points award
```

Ambiguous older decks remain loadable/exportable for recovery, but are draft
and cannot be played or saved unchanged. Deck Editor live diagnostics use the
same integrated `validateDeckForUse` boundary as save/play decisions.

## Atomic Match Persistence

`RecordsStore.commitMatch()` writes together:

```text
match record
coins
role collection
processed match keys
totalMatches
match-derived achievements
```

Failed write commits none of them. Duplicate match key skips both resolver and
write. Non-match achievements use their own write because the initiating user
action has already completed.

`MatchSession` remount identity uses `matchSessionId`; the bounded numeric seed
is not used as the React component identity.

## Same-ID Import / Stale Mutation

### Import overwrite

```text
first action:
  explain existing deck and irreversibility
  do not write

second action:
  require unchanged import text
  require unchanged existing StoredDeck fingerprint
```

### Editor/detail/store mutation

```text
loadAll records observed StoredDeck fingerprints
save/delete re-read current storage
if observed entry changed or disappeared:
  throw translated StorageWriteError
  do not overwrite/delete newer bytes
```

This materially reduces ordinary stale operations but is not transactional
compare-and-swap. `localStorage` cannot guarantee atomic multi-tab writes.

## Destructive UI

Deck delete:

```text
requires danger Dialog
explains irreversibility and absence of restore UI
suggests deck export before deletion
danger Dialog initially focuses cancellation
message is associated using aria-describedby
```

Full reset:

```text
TOP exposes raw forensic backup export before reset
reset confirmation points users to export first
remove only known app-owned active/forensic/skin keys
attempt every key
return removedKeys + failedKeys
reload only when failedKeys is empty
show partial failure instead of claiming success
```

The same truthful reset result applies on TOP and in `AppErrorBoundary`.

## Raw Forensic Export

The TOP recovery export reads only:

```text
soro-pon.decks.v1.corrupt-backup
soro-pon.records.v1.corrupt-backup
soro-pon.settings.v1.corrupt-backup
```

Contract:

```text
bundle format: soro-pon-local-recovery.v1
raw strings preserved exactly
no JSON parse/migration/normalization during export
keys read independently
one read failure does not suppress other readable keys
source localStorage values never removed
browser file-creation failure is reported as failure
no success message after a failed download setup
```

This file is for support/manual inspection and future explicit recovery tooling.
It must never be blindly copied over active storage.

## Error Code Ownership

```text
L9001 corrupt/invalid payload reset or safely normalized
L9002 known older deck migrated without dropping the entry
L9003 unrecoverable deck entries dropped during partial recovery
L9004 local image missing; visual fallback used
L9005 browser storage read unavailable; display fallback only
L9006 bootstrap/default data could not be persisted
L9007 old persisted collection exceeded safe bound and was normalized
L9008 duplicate persisted deck IDs were consolidated
```

See `docs/ERROR-CODES.md`; never reuse these codes for another meaning.

## Backup / Restore Reality

Supported:

```text
best-effort raw corrupt/over-limit backup
in-app versioned raw forensic bundle export
healthy deck and current-version records partial salvage
deterministic v0 -> v1 deck migration
manual inspection through exported file or browser developer tools
full local reset includes forensic keys
```

Not supported:

```text
in-app restore button
backup merge
cloud/cross-device backup
guaranteed backup when storage rejects writes
blind restoration of raw corrupt text
automatic recovery from the exported forensic bundle
```

A future restore UI must strict-parse, migrate, validate all current integrity
rules, enforce limits, surface conflicts, and never copy raw backup text directly
over active data.

## Skin Storage

`soro-pon.skin.v1` contains one ID. `SkinProvider` guards read/write and
sanitizes to a known registry ID. Skin package trust/distribution is governed
by `docs/SKIN-DISTRIBUTION.md`.

## Verification

The dedicated list is `.github/workflows/integrity.yml`.

Current scope is **92 targeted test definitions across 28 files**. This count is
not a PASS claim until collected and executed on the exact final SHA.

## Final Decision

The UI and reports must distinguish:

```text
in-memory fallback
persisted success
atomic commit
partial salvage
metadata normalization
raw backup
raw forensic export
bounded reduction
conflict rejection
partial deletion
full reset
validated restore (not implemented)
```

Collapsing those states into generic success is a release defect.
