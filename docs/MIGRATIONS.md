# Schema Migration Policy

## Purpose

Soro-pon decks and browser-local records may outlive one application
version. Migration must preserve known-safe meaning, reject ambiguity, and
never hide a behavioral change from the user.

Current implementation supports one real shared-deck migration:

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
and migration plan.

Other versioned boundaries:

```text
localStorage payload version
skin contract version
skin package version
versioned/content-hashed asset URL
application artifact commit SHA
```

## Migration Principles

```text
deterministic
explainable
strictly tested
safe by default
visible to the user
idempotent where re-read/retry is possible
```

Forbidden:

```text
silent behavior change
unknown/unsafe field preservation
automatic image/URL import
automatic score or wildcard behavior change
automatic count-only role conversion when ambiguous
pretending a failed write committed the migration
```

## Import Version Behavior

| Case | Behavior |
|---|---|
| current version | strict parse and validate |
| known safe version 0 | deterministic migration, visible change review, explicit second action to save |
| older ambiguous/unknown version | reject with `I2009` |
| newer version | reject with `I2007` and require app update |
| missing/non-integer version | reject with `I2009` |
| unsafe/deep/oversize payload | reject before expensive migration/validation |

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

If a count-only role is found, migration fails closed with `R4001` /
`I2009`-class context rather than inventing groups.

## User Confirmation Contract

A successful migration parse is not immediately persisted.

`AppRoot` import flow:

```text
first click:
  parse and migrate in memory
  show fromVersion/toVersion
  show each changed item and migration warnings
  keep modal and pasted JSON open

second click with unchanged input:
  persist migrated current-version deck
  show completion notice
  navigate only after successful write

input changes after review:
  invalidate prior review
  require parse/review again
```

This prevents silent migration and prevents a stale approval from being
applied to edited JSON.

## Local Storage Migration / Recovery

Canonical details:
`docs/release/STORAGE-RECOVERY-POLICY.md`.

Required behavior:

```text
strict-parse persisted values
migrate only known shapes
salvage healthy deck entries independently
attempt raw corrupt backup when storage permits
never throw because backup/cleanup itself failed
read denial -> L9005 + empty/default session fallback
bootstrap/default write failure -> L9006
show recovery issues from decks, records, and settings
```

Fallback differs by store:

```text
decks: recovered entries or empty list; starter persistence attempted
records: normalized current payload or empty records
settings: current payload or defaults
skin: sanitized built-in ID fallback
```

Do not describe all unrecoverable data as “restored to starter”; that is
only relevant to deck bootstrapping.

## Rollback Compatibility

There is no generic down-migration framework. Before a release changes
persisted output:

```text
1. build the intended previous release artifact
2. seed previous-format fixtures
3. open/migrate/write with the new artifact
4. open the resulting state with the intended rollback artifact
5. prove readability or explicitly mark rollback incompatible
6. record both artifact SHAs/hashes and storage fixtures
```

A git checkout or source revert is not proof that deployed old code can
read data written by new code.

## Test Requirements

Current/required cases:

```text
current version imports without migration notice
known v0 applies exact scoreBudget defaults
migration notice lists every changed item
first UI action reviews migration without saving
second unchanged action saves migrated deck
editing input invalidates migration review
newer version rejected
missing/invalid version rejected
unknown old version rejected
count-only role not silently accepted
unsafe fields not preserved
corrupt localStorage recovers
storage read/backup/remove failures do not crash recovery
migration write failure keeps modal/input and does not navigate
```

The parser/migration unit tests and storage tests cover the lower layers.
The UI confirmation flow requires DOM/browser coverage before current HEAD
is called verified.

## Final Decision

Migration exists to protect meaning and user data, not to maximize import
acceptance. When mapping is not exact, reject with a stable code and clear
explanation.
