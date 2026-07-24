# Error Codes

## Purpose

Stable error codes make validation, UI messages, logs, tests, and support easier to align.

Messages may be localized later, but codes should remain stable and must
never be reused for a different subsystem meaning.

## Code Prefixes

| Prefix | Area |
|---|---|
| S | Schema / strict parse |
| I | Import / unsafe field scan |
| V | Deck validation |
| R | Role / group feasibility |
| W | Wildcard |
| B | Score budget / balance |
| E | Engine / match reducer |
| P | Performance / capped analysis |
| L | Local storage / migration |
| U | UI interaction guard |

## Severity

```ts
type IssueSeverity = 'error' | 'warning' | 'info';
```

- error: blocks import, match start, or action
- warning: recovery happened, data may have been reduced, or user action is needed
- info: non-blocking fallback or improvement suggestion

## Schema Errors

| Code | Severity | Meaning |
|---|---|---|
| S1001 | error | Invalid JSON shape |
| S1002 | error | Unknown field in current schema |
| S1003 | error | Missing required field |
| S1004 | error | Invalid enum value |
| S1005 | error | Invalid scoreBudget relation |
| S1006 | error | Current schema missing scoreBudget |
| S1007 | error | normal winRole missing requiredGroups |
| S1008 | error | specificSet group does not have exactly 3 tileIds |

## Import Errors

| Code | Severity | Meaning |
|---|---|---|
| I2001 | error | File too large |
| I2002 | error | Invalid JSON parse |
| I2003 | error | Unsafe key detected |
| I2004 | error | Image field detected |
| I2005 | error | URL/path/blob field detected |
| I2006 | error | Script/HTML/style-like field detected |
| I2007 | error | Newer unsupported schema version |
| I2008 | warning | Older schema migrated with notice |
| I2009 | error | Older schema cannot be safely migrated |
| I2010 | error | JSON structure too deep |

## Deck Validation Errors

| Code | Severity | Meaning |
|---|---|---|
| V3001 | error | No winRoles in active variant |
| V3002 | error | Not enough tile instances to deal supported players |
| V3003 | error | activeVariantId not found |
| V3004 | error | Unsupported player count |
| V3005 | warning | Only 1-2 winRoles |
| V3006 | warning | Too many similar roles |
| V3007 | warning | Category too small for natural group |
| V3008 | warning | Category too broad and may make roles too easy |
| V3009 | info | Category unused by roles |
| V3010 | error | Duplicate id (category/tile/variant/role/bonus) |
| V3011 | warning | Duplicate tile display name |
| V3012 | error | Tile references unknown or inconsistent category |

## Role / Group Errors

| Code | Severity | Meaning |
|---|---|---|
| R4001 | error | normal winRole is count-only |
| R4002 | error | Group requirement references unknown category |
| R4003 | error | Group requirement references unknown tileId |
| R4004 | error | Required groups exceed groupCount |
| R4005 | error | Role impossible from tile counts |
| R4006 | warning | Role only feasible with wildcard |
| R4007 | warning | Duplicate role condition |
| R4008 | warning | Same role pattern with different score |
| R4009 | warning | Role explanation missing or too vague |
| R4010 | error | requiredGroups do not fill groupCount (normal win needs exactly 3 groups) |

## Wildcard Issues

| Code | Severity | Meaning |
|---|---|---|
| W5001 | warning | Wildcard ratio high |
| W5002 | error | Wildcard ratio exceeds hard limit |
| W5003 | error | Wildcard category used as normal win role category |
| W5004 | warning | Many roles become close because of wildcard |
| W5005 | info | Candidate blocked by max wildcard rule |
| W5006 | info | Discarded wildcard cannot trigger ron |

## Score / Balance Issues

| Code | Severity | Meaning |
|---|---|---|
| B6001 | error | basePoints <= 0 |
| B6002 | warning | Easy role points too high |
| B6003 | warning | Hard role points too low |
| B6004 | warning | Estimated result exceeds softResultCap |
| B6005 | warning | Possible result exceeds hardResultCap |
| B6006 | warning | Special bonus total exceeds budget |
| B6007 | warning | ScoreBonus total exceeds budget |
| B6008 | warning | Repeatable ScoreBonus has no maxPoints |
| B6009 | warning | Too many bonuses may make result noisy |

## Engine Errors

| Code | Severity | Meaning |
|---|---|---|
| E7001 | error | Invalid action for current phase |
| E7002 | error | Tile not in player hand |
| E7003 | error | Cannot tsumo without completed winRole |
| E7004 | error | Cannot ron without completed winRole |
| E7005 | error | Cannot start 2-player match |
| E7006 | error | Draw pile empty |
| E7007 | error | Score requested without selectedWinRole |
| E7008 | error | Extended engine requested but pending |

## Performance Warnings

| Code | Severity | Meaning |
|---|---|---|
| P8001 | warning | Candidate output capped |
| P8002 | warning | Wildcard branch count capped |
| P8003 | warning | Role count above warning threshold |
| P8004 | warning | Analysis exceeded target time in dev/test |

## Storage / Migration Issues

| Code | Severity | Meaning |
|---|---|---|
| L9001 | warning | Corrupt/invalid localStorage payload was reset or normalized; active state recovered |
| L9002 | warning | Older local deck data was migrated without dropping an entry |
| L9003 | warning | One or more unrecoverable deck entries were dropped while healthy entries were retained |
| L9004 | info | Local image is missing and a visual fallback is used |
| L9005 | warning | Browser storage read access is unavailable; empty/default in-memory state is used for the session |
| L9006 | warning | Required bootstrap/default data could not be persisted; app continues without claiming it was saved |
| L9007 | warning | A legacy payload exceeded a persisted collection limit and was backed up, reduced to the current safe bound, and rewritten when possible |

`StorageWriteError` is the typed exception for ordinary user-triggered
storage-operation failures and write-boundary contract violations. It is
not assigned a `ValidationIssue` code unless the failure happens during
boot or read recovery and must be surfaced through the boot issue channel.

## UI Guard Issues

| Code | Severity | Meaning |
|---|---|---|
| U9501 | info | Draft cannot start match yet |
| U9502 | warning | Leaving editor with unsaved changes |
| U9503 | info | Local images are not included in export |
| U9504 | warning | Touch target below recommended size in UI review |

## Message Format

Every issue should include:

```ts
type Issue = {
  code: string;
  severity: 'error' | 'warning' | 'info';
  path?: string;
  message: string;
  fixHint?: string;
};
```

## Copy Rules

Messages should be specific, truthful about what was and was not
preserved, and actionable. Tests should assert stable codes and important
state transitions, not only localized message text.
