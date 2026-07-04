# Current Implementation Source of Truth

## Purpose

This document defines the current source of truth after the group-backed redesign.

It prevents implementation agents from following older count-first or span-first specs by mistake.

## Current MVP Rule Core

Normal MVP is:

```text
3-4 players
8 tiles before draw
9 tiles after draw
winning hand = 3 groups x 3 tiles
no pon / chi / kan
ron hand = 8 hand tiles + discarded tile = 9 tiles
tsumo hand = 9 tiles after draw
```

## Current Evaluation Modes

```text
normalThreeGroups = MVP target
extendedRoleSpan = parsed/reserved, engine later
```

Do not implement normal MVP using extended role span logic.

## Current Docs Priority

Use these as the current implementation truth:

```text
docs/62-mahjong-structure-scoring-core.md
docs/63-typescript-engine-implementation-blueprint.md
docs/64-breaking-risk-review-and-fixes.md
docs/65-group-backed-schema-override.md
docs/66-group-backed-mvp-test-override.md
samples/animal-starter.deck.json
```

Older docs are still useful for context, but when conflict exists, the files above win.

## Docs With Older Count-first Concepts

The following docs may still contain older count-first or roleSpan-first examples:

```text
docs/32-zod-schema-spec.md
docs/35-mvp-test-cases.md
docs/58-engine-spec-tables.md
```

Use docs/65 and docs/66 as overrides until those files are fully rewritten.

## Implementation Start Order

Correct order:

```text
1. package setup
2. domain ID and tile types
3. group-backed Zod schema from docs/65
4. animal starter parse test
5. group enumeration
6. 9-tile partitioning
7. wildcard inside group search
8. normal win role matching
9. tsumo check
10. ron check
11. wait context
12. scoring breakdown
13. discard preview
14. match state reducer
15. UI foundation
```

## Hard Blocks

Do not start full Match UI until these exist:

```text
normalThreeGroups schema test
animal starter parse test
3-group partition tests
sameCategory/specificSet group tests
wildcard group tests
ron 8+discard test
tsumo 9-tile test
special_bonus cannot win test
ScoreBonus cannot win test
score breakdown test
```

## Current Sample Deck State

`samples/animal-starter.deck.json` now uses:

```text
ruleConfig.evaluationMode = normalThreeGroups
winRoles[]
specialBonuses[]
scoreBonuses[]
requiredGroups[]
basePoints
```

Deprecated for new implementation:

```text
roles[] mixed kind
span on normal win roles
points on normal win roles
same_category_count as normal win role only condition
roleSpanMin / roleSpanMax in normal variant
```

## Final Decision

Implementation can start only from the current group-backed path.

If an implementation agent sees a conflict, it must follow this document and the docs listed under Current Docs Priority.
