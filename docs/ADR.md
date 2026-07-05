# Architecture Decision Records

## Purpose

This file records major decisions and why they were made.

Use this to understand why the current MVP is shaped this way.

## ADR-001: 3-4 Players Only

Decision:

```text
Soro-pon MVP supports 3-4 players only.
2-player match is not supported.
```

Reason:

```text
The game is intended as a table tile game with discard/reaction rhythm.
2-player rules would require different balance and UX.
```

## ADR-002: normalThreeGroups As MVP Core

Decision:

```text
Normal MVP uses 8 tiles before draw, 9 after draw, and 3 groups x 3 tiles to win.
```

Reason:

```text
This gives a clear Donjara/mahjong-like structure that can be explained, tested, and rendered.
```

Rejected:

```text
count-only normal win roles as the core model
```

## ADR-003: extendedRoleSpan Deferred

Decision:

```text
extendedRoleSpan is schema-reserved but engine pending.
```

Reason:

```text
2-14 tile role spans conflict with normal 3-group evaluation unless separated by mode.
MVP should ship a stable core first.
```

## ADR-004: Group-backed WinRoles

Decision:

```text
Normal MVP winRoles must be group-backed.
```

Reason:

```text
Groups make role explanation, wait calculation, wildcard assignment, discard preview, and scoring understandable.
```

Rejected:

```text
mammal >= 6 as a standalone normal winRole
```

## ADR-005: One selectedWinRole Provides Base Score

Decision:

```text
When multiple winRoles match, one selectedWinRole provides basePoints.
Other winRoles do not stack base score.
```

Reason:

```text
Stacking multiple base win roles makes scores explode and results hard to trust.
```

## ADR-006: scoreBudget Is Validation Budget, Not Hidden Clamp

Decision:

```text
scoreBudget lives on each variant and drives warnings/defaults.
It does not silently clamp player-visible score.
```

Reason:

```text
Silent score clamp would make results feel untrustworthy.
```

## ADR-007: Strict Import Allowlist

Decision:

```text
Shared JSON import is allowlist-based and rejects unknown/unsafe fields.
```

Reason:

```text
Import is the highest-risk boundary for images, URLs, scripts, local state, future fields, and hidden behavior.
```

## ADR-008: Images Are Local-only

Decision:

```text
Shared JSON contains no images or image references.
Images may be local-only in the future and are not exported.
```

Reason:

```text
This avoids privacy leaks, tracking, remote content risk, copyright issues, and broken shared decks.
```

## ADR-009: UI Does Not Own Rules

Decision:

```text
UI renders engine facts and does not calculate role completion, score, ron/tsumo, or wildcard assignment.
```

Reason:

```text
Duplicated rule logic causes inconsistent behavior and hard-to-debug UI bugs.
```

## ADR-010: Facts, Not Best-move Advice

Decision:

```text
InsightEngine shows board facts, not commands.
```

Reason:

```text
Players should feel they made the choice. Over-guidance makes the game feel like it is playing itself.
```

## ADR-011: Engine First, UI Second

Decision:

```text
domain/schema/engine/tests must be built before full Match UI.
```

Reason:

```text
A pretty UI on unstable rules creates expensive rewrites.
```

## ADR-012: Safe Creator Templates

Decision:

```text
Simple creator mode uses safe templates and cannot create broken structural rules.
```

Reason:

```text
Preventing broken deck creation is better than only warning after the deck is broken.
```

## Final Decision

Add new ADR entries when a decision changes architecture, rules, import/security, scoring, or implementation order.
