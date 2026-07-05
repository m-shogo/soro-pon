# Schema Migration Policy

## Purpose

Soro-pon decks may live for a long time.

Schema changes must not silently break old decks or import unsafe data.

## Version Fields

Current shared deck JSON uses:

```text
version
```

Implementation may internally map this to schema version handling.

Future versions should prefer explicit naming if needed:

```text
schemaVersion
```

Do not introduce both without a migration plan.

## Migration Principle

Migrations must be:

```text
deterministic
explainable
tested
safe by default
```

Forbidden:

```text
silent behavior change
unsafe field preservation
automatic image/url import
automatic score change without notice
automatic count-only winRole conversion when ambiguous
```

## Import Version Behavior

| Case | Behavior |
|---|---|
| current version | strict parse and validate |
| older known safe version | migrate with notice, then validate |
| older ambiguous version | import as blocked draft or reject |
| newer version | reject with explanation |
| missing version | reject |
| invalid version | reject |

## Allowed Auto-fixes

Allowed without user review:

```text
trim whitespace in display names
normalize empty optional description
add scoreBudget default for known older safe schema
rename legacy safe field only when exact mapping exists
```

## Forbidden Auto-fixes

```text
remove unsafe fields and continue silently
convert imageUrl to local image
convert count-only winRole to group-backed role without review
change role points silently
change wildcard behavior silently
convert 2-player deck to 3-player deck silently
```

## Migration Notice

Migration result should include:

```ts
type MigrationNotice = {
  fromVersion: number;
  toVersion: number;
  changed: string[];
  warnings: ValidationIssue[];
};
```

UI should show a short summary before committing import.

## Old Count-first Schema

Older count-first normal winRoles are not automatically safe.

If a role can be deterministically mapped to group-backed requiredGroups, migration may propose it.

If not:

```text
import as draft with blocking R4001
or reject with explanation
```

Do not pretend count-only role is a valid normal MVP winRole.

## Local Data Migration

Local storage migration must:

```text
parse old data safely
backup or preserve broken payload for debug export when possible
migrate only known shapes
fall back to safe starter state if unrecoverable
show recoverable error
```

App boot must not crash because of old local data.

## Test Requirements

```text
current version imports without migration notice
known older safe version applies scoreBudget default
newer version rejected
missing version rejected
unsafe old version rejected
count-only normal role not silently accepted
corrupt localStorage recovers
migration notice lists changed fields
unknown fields are not preserved
```

## Final Decision

Migration exists to protect users, not to accept everything.

When unsure, reject or import as blocked draft with clear explanation.
