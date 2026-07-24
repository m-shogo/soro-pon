# Schema Migration Policy

## Purpose

Soro-pon decks and browser-local records may outlive one application
version. Migration must preserve known-safe meaning, reject ambiguity, and
never hide a behavioral or destructive change from the user.

Current real shared-deck migration:

```text
version 0 -> current version 1
```

Do not build a generic migration framework until another real version
exists.

## Version Ownership

Current shared deck JSON uses:

```text
version: integer
```

Do not add a parallel `schemaVersion` without an explicit compatibility
plan.

Other versioned boundaries:

```text
localStorage payload version
skin contract/package version
versioned/content-hashed asset URL
application artifact commit SHA
```

## Migration Principles

```text
deterministic
explainable
strictly tested
safe by default
visible before persistence
idempotent where retry/re-read is possible
bounded by current persistence contracts
conflict-aware when replacing existing user data
```

Forbidden:

```text
silent behavior change
unknown/unsafe field preservation
automatic image/URL import
automatic score or wildcard behavior change
automatic ambiguous role conversion
pretending a failed write committed migration
silently replacing an existing same-ID deck
using a stale overwrite approval after another tab changed the deck
```

## Import Version Behavior

| Case | Behavior |
|---|---|
| current version | strict schema parse, nested-ID integrity check, then overwrite review if the ID exists |
| known safe version 0 | deterministic migration, visible migration review, then overwrite review if needed |
| older ambiguous/unknown version | reject with `I2009` |
| newer version | reject with `I2007` and require app update |
| missing/non-integer version | reject with `I2009` |
| unsafe/deep/oversize payload | reject before expensive migration/validation |
| duplicate variant/role/bonus IDs | reject with `V3010` before persistence |

## Current v0 -> v1 Migration

Allowed transformation:

```text
apply the known scoreBudget default for each variant
set version 0 -> 1
```

Not allowed:

```text
convert count-only normal win roles to group-backed roles
change points
change wildcard behavior
remove unsafe fields and continue
repair unknown references by guessing
```

`migrateLegacyDeck()` returns:

```ts
type MigrationNotice = {
  fromVersion: number;
  toVersion: number;
  changed: string[];
  warnings: ValidationIssue[];
};
```

A count-only role fails closed instead of receiving invented groups.

## User Confirmation State Machine

A successful migration parse is not immediately persisted.

### Legacy migration review

```text
first action:
  parse and migrate in memory
  show fromVersion/toVersion
  show every changed item and warning
  keep modal and pasted JSON open
  do not write

second action with unchanged input:
  continue to existing-ID review when the target ID is already stored
  otherwise persist current-version deck

input change:
  invalidate migration and overwrite review state
```

### Existing same-ID overwrite review

```text
first same-ID action:
  show current saved deck name
  explain irreversible replacement
  capture unchanged import text
  capture full current StoredDeck fingerprint
  do not write

next action:
  re-read Store
  persist only if input and existing fingerprint both still match

external change/delete/replacement:
  invalidate prior confirmation
  preserve latest saved entry
  show latest state and require a fresh confirmation
```

A version-0 same-ID import can therefore require two distinct reviews:

```text
migration meaning review
then destructive overwrite review
```

The reviews must never be collapsed into one generic “OK” state.

## Local Storage Migration / Recovery

Canonical detail:
`docs/release/STORAGE-RECOVERY-POLICY.md`.

Required behavior:

```text
strict-parse persisted values on read
strict-parse again immediately before write
migrate only known shapes
salvage healthy deck entries independently
attempt raw backup when storage permits
never throw merely because backup/cleanup failed
read denial -> L9005 display fallback + fail-closed mutation/export
bootstrap/default write failure -> L9006
old collection overflow -> L9007 bounded normalization
show recovery issues from decks, records, and settings
```

Persisted limits:

```text
decks                         200
match records                 100
role collection entries       500
achievement IDs               100
recent match keys              20
```

## Legacy Over-limit Payloads

Previous code could write arrays larger than the strict current schema.
A new version must not classify data produced by its predecessor as generic
corruption and wipe everything.

Deck overflow recovery:

```text
backup raw payload when possible
retain official entries first
retain newest updatedAtMs next
use original order as deterministic tie-break
normalize to 200 entries
report L9007
```

Records overflow recovery:

```text
backup raw payload when possible
trim only arrays above their bounds
preserve valid coins, records, totalMatches, and unaffected collections
rewrite a strict-valid bounded payload when possible
report L9007
```

This is a compatibility repair, not a license for new code to exceed the
limits.

## Nested Entity-ID Compatibility

Current schema shape alone does not prove semantic identity integrity.
Before import/save/play:

```text
variant IDs are unique across the deck
role IDs are unique across every variant
special and score bonus IDs share one unique bonus namespace
```

An older persisted deck with an ambiguous nested ID remains loadable and
exportable so it can be recovered. It is marked draft and cannot be played
or newly saved unchanged.

## Rollback Compatibility

There is no generic down-migration framework. Before a release changes
persisted output:

```text
1. build the intended previous release artifact
2. seed previous-format fixtures
3. open/migrate/write with the new artifact
4. open the resulting state with the rollback artifact
5. prove readability or mark rollback incompatible
6. record both artifact SHAs/hashes and storage fixtures
```

A git checkout is not proof that an actually deployed older artifact can
read new persisted data.

## Test Requirements

```text
current version imports without migration notice
known v0 applies exact scoreBudget defaults
migration notice lists every changed item
first migration action does not save
second unchanged migration action proceeds
input edit invalidates migration review
same-ID first action does not overwrite
same-ID unchanged second action overwrites
input edit invalidates overwrite review
external entry change invalidates overwrite review
nested duplicate IDs reject before persistence
newer/missing/unknown old versions reject
count-only role is not silently accepted
unsafe fields are not preserved
corrupt storage recovers without cleanup crash
read-denied mutation/export fails closed
old over-limit payload is backed up and bounded, not fully reset
migration/overwrite write failure keeps user input and prior persisted data
```

## Final Decision

Migration protects meaning and user data. Exact mapping may be automatic
only after visible review; destructive replacement needs a separate current-
state confirmation; ambiguous mapping or identity must be rejected with a
stable code and clear explanation.
