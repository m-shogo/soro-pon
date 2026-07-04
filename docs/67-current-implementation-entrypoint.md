# Current Implementation Entrypoint

## Purpose

This document is the current safe entrypoint for implementation.

Older docs still contain useful context, but some older docs are count-first or span-first.

For new implementation, this file decides priority.

## Read Order

Read these first:

```text
docs/64-breaking-risk-review-and-fixes.md
docs/65-group-backed-schema-override.md
docs/66-group-backed-mvp-test-override.md
docs/62-mahjong-structure-scoring-core.md
docs/63-typescript-engine-implementation-blueprint.md
docs/58-engine-spec-tables.md
docs/56-pre-ui-implementation-master-gate.md
docs/55-integrated-ux-and-engine-guardrails.md
docs/53-discard-insight-and-beginner-ux.md
docs/51-role-analysis-and-game-feel-ux.md
```

Then read older context docs:

```text
docs/32-zod-schema-spec.md
docs/33-official-animal-starter-deck.md
docs/35-mvp-test-cases.md
docs/34-mvp-implementation-prompt.md
```

When conflict exists, newer override docs win.

## Current Non-negotiable Rule

Normal MVP is:

```text
8 tiles before draw
9 tiles after draw
winning hand = 3 groups x 3 tiles
win_role must be group-backed
count-only normal win_role is not allowed
```

Extended variant is separate:

```text
13 tiles before draw
14 tiles after draw
2-14 span roles are extendedRoleSpan
engine support may be pending
```

Do not mix normal and extended evaluation modes.

## Deprecated For New Normal MVP

Do not build the normal MVP engine around:

```text
mammal >= 6 as a main win_role
roleSpanMin / roleSpanMax in normal variant
span on normal win_role
points on win_role instead of basePoints
mixed roles[] containing win_role and special_bonus together
count-only win_role explanations
```

## Required New Schema Direction

Use:

```text
evaluationMode
normalThreeGroups
winRoles[]
specialBonuses[]
scoreBonuses[]
requiredGroups
basePoints
groupSize = 3
groupCount = 3
```

## Required Engine Direction

Implement in this order:

```text
1. Zod schema from docs/65
2. domain types from docs/63
3. group enumeration
4. 9-tile partition search
5. wildcard assignment inside groups
6. group-backed win_role matching
7. tsumo check with 9 tiles
8. ron check with 8 tiles + discard
9. wait context with afterDiscardEightTiles / afterDrawNineTiles / ronCheckNineTiles
10. selectedWinRole scoring
11. specialBonus and ScoreBonus after selectedWinRole
12. discard preview
13. insight output
14. match state reducer
```

## Required Tests Before UI

Use docs/66 as the test source of truth.

Minimum:

```text
normalThreeGroups schema parse
normal win_role without groups fails
count-only normal win_role fails
specificSet requires 3 tileIds
9 tiles partition into 3 groups
8 tiles cannot be completed normal win
10 tiles cannot be completed normal win
ron = 8 hand tiles + discard
tsumo = 9 after draw
special_bonus cannot win alone
ScoreBonus cannot win alone
wildcard fills max one missing group tile
selectedWinRole does not stack all win_role base points
```

## Sample Deck Direction

Animal starter must be converted to group-backed roles.

Safe examples:

```text
three sameCategory mammal groups
one bird group + one sea group + one mammal group
specificSet Lion + Elephant + Giraffe as one group-backed role or special bonus
```

Unsafe examples:

```text
mammal >= 6 as primary normal win_role
sea >= 5 as primary normal win_role
bird >= 4 as primary normal win_role
```

Those can become bonuses or extendedRoleSpan examples later.

## UI Direction

Do not implement full Match UI until:

```text
group partition tests pass
ron/tsumo shape tests pass
score breakdown tests pass
discard preview purity tests pass
```

UI should show group clusters only from engine output.

React must not calculate groups, score, or wildcard assignment.

## Final Decision

Implementation should start only from this current entrypoint.

If an older doc conflicts, do not follow the older doc silently.

Update the docs or add a migration note first.
