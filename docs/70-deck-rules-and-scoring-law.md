# Deck Rules and Scoring Law

## Purpose

Soro-pon allows custom decks, but custom freedom must stay playable.

This document defines the law for deck construction and scoring so users cannot accidentally create decks that are unplayable, opaque, or boring.

Related docs:

```text
docs/62-mahjong-structure-scoring-core.md
docs/65-group-backed-schema-override.md
docs/68-custom-deck-robustness-guardrails.md
docs/69-adversarial-custom-deck-patterns.md
```

## 1. Normal MVP Deck Law

A normal MVP deck must support this shape:

```text
8 tiles before draw
9 tiles after draw
3 groups x 3 tiles to win
```

Therefore a normal deck must contain enough tile instances to:

```text
deal 8 tiles to each supported player
leave a draw pile
allow at least one natural 3-group win role
```

## 2. Required Deck Sections

A valid deck has:

```text
categories[]
tiles[]
variants[]
activeVariantId
```

A playable normal variant has:

```text
ruleConfig.evaluationMode = normalThreeGroups
winRoles[] with at least 1 role
specialBonuses[] optional
scoreBonuses[] optional
```

## 3. Category Rules

Categories are the main way players understand roles.

Rules:

```text
each tile must have at least one category
one primaryCategoryId should be chosen
wildcard category cannot be used as a normal role category
category should have enough tile instances to form a 3-tile group
```

Validation:

| Case | Severity |
|---|---|
| unknown category reference | error |
| wildcard category used in winRole requiredGroups | error |
| category has 1-2 total instances | warning |
| category has 0 role usage | info |
| category name too long | warning |
| category colors too similar | warning |

## 4. Tile Rules

Tile definitions define deck distribution.

Rules:

```text
tileId must be unique
tile name should be short
tile count should be positive
tile count should not dominate the deck
same display name across different tileIds is allowed but warned
```

Recommended counts:

```text
normal tile copies: 2-4
simple starter deck: 3 copies per tile
wildcard copies: 1-3 total or <= 10% of deck
```

Validation:

| Case | Severity |
|---|---|
| tile count <= 0 | error |
| tile count > 10 | warning |
| duplicate tileId | error |
| duplicate tile name | warning |
| fallback labels too similar | warning |
| wildcard ratio > 15% | error or strong warning |

## 5. Win Role Rules

A normal MVP win role must be group-backed.

Required:

```text
kind = win_role
basePoints > 0
requiredGroups exists
requiredGroups total count <= 3
canTsumo or canRon is true
explanation exists
```

Forbidden for normal MVP:

```text
count-only win role
conditionless win role
image-dependent win role
custom code win role
wildcard category win role
```

## 6. Group Requirement Rules

A win role is made from group requirements.

Examples:

```text
sameCategory mammal x3
sameCategory bird x1 + sameCategory sea x1 + sameCategory mammal x1
specificSet lion/elephant/giraffe x1 + sameCategory mammal x2
```

Validation:

| Case | Severity |
|---|---|
| requiredGroups missing | error |
| requiredGroups count sum > 3 | error |
| requiredGroups count sum < 1 | error |
| specificSet not exactly 3 tileIds | error |
| sameCategory without categoryId | error |
| sameTag without tag | error |
| group naturally impossible | error or warning if wildcard-only |

## 7. Difficulty Bands

Each win role should receive an estimated difficulty.

MVP difficulty bands:

```text
easy: broad sameCategory groups, many tile instances
normal: mixed category groups
hard: specificSet + category groups
rare: multiple specific or narrow groups
```

This estimate is used for score warnings, not final game logic.

## 8. Base Points Law

MVP basePoints should be understandable.

Recommended:

| Difficulty | basePoints |
|---|---:|
| easy | 30-60 |
| normal | 60-90 |
| hard | 90-130 |
| rare | 130-180 |

Warnings:

| Case | Severity |
|---|---|
| easy role > 90 | warning |
| easy role > 140 | strong warning |
| hard role < 50 | info/warning |
| basePoints > 300 | warning |
| basePoints <= 0 | error |

## 9. Special Bonus Law

Special bonuses add flavor after a win role exists.

Rules:

```text
special_bonus cannot win alone
special_bonus should be small compared to basePoints
special_bonus should have a clear reason
special_bonus can use wildcard only if explicitly allowed
```

Recommended points:

| Bonus Type | points |
|---|---:|
| simple flavor bonus | 5-15 |
| moderate collection bonus | 15-30 |
| rare bonus | 30-50 |

Warnings:

```text
special bonus > 50 warning
more than 5 bonuses can apply to one result warning
bonus name sounds like a win role warning
```

## 10. ScoreBonus Law

ScoreBonus is mechanical scoring, not a role.

Rules:

```text
ScoreBonus cannot win alone
ScoreBonus should be capped if repeatable
ScoreBonus should not use wildcard by default
```

Recommended points:

| ScoreBonus | points |
|---|---:|
| duplicate tile x3 | 10-20 |
| category duplicate | 5-15 |
| rare condition | 20-40 |

Warnings:

```text
repeatable ScoreBonus without maxPoints warning
ScoreBonus > 50 warning
wildcard allowed for ScoreBonus warning
```

## 11. Total Score Law

MVP total score is additive.

```text
totalPoints = selectedWinRole.basePoints
            + sum(appliedSpecialBonuses.points)
            + sum(appliedScoreBonuses.points)
```

Forbidden in MVP:

```text
multipliers
combo multipliers
coin-based score boost
hidden modifiers
negative score
```

## 12. Score Cap Guidance

To avoid result explosion:

```text
soft expected result range: 40-180
high result range: 180-300
very high warning: > 300
hard cap for MVP display sanity: 500 recommended
```

If a custom deck can often exceed 500, validation should warn.

## 13. Selected Win Role Law

Multiple win roles may match.

Only one selected win role provides basePoints.

Tie-break:

```text
1. higher basePoints
2. fewer wildcards
3. more natural groups
4. higher difficulty band
5. lower role.priority
6. deck order
```

Other matching win roles can be shown as alternatives, but do not stack base score.

## 14. Economy Boundary

Coins must not affect match strength.

Allowed:

```text
cosmetics
collection
title
editor helper
result album
```

Forbidden:

```text
extra wildcard
extra hand size
score boost
weaker CPU
better draw odds
```

## 15. Deck Balance Diagnosis

Deck editor should show a balance panel.

Sections:

```text
playability
role clarity
score balance
wildcard safety
candidate noise
visual readability
```

Each issue has severity:

```text
error
warning
info
```

## 16. Balance Output Examples

Good messages:

```text
This deck has no winning role. Add at least one win_role.
This role needs 3 mammal groups, but mammal has only 6 tile instances.
This easy role scores very high. Consider 30-60 points.
This bonus may look like a winning role. Rename or explain it.
Many roles share the same group pattern. Players may see too many similar candidates.
```

Bad messages:

```text
Invalid.
Bad role.
Wrong score.
```

## 17. Editor Defaults

When a user creates a new normal deck, defaults should be safe.

```text
3-5 categories
12-24 tile definitions
2-3 copies per tile
3 simple win roles
2 special bonuses
1 capped ScoreBonus
wildcard optional and low count
```

## 18. Starter Score Defaults

Starter templates:

| Template | Suggested basePoints |
|---|---:|
| 3 sameCategory groups | 60 |
| 3 different category groups | 80 |
| specificSet + 2 category groups | 100 |
| 3 sameTile groups | 120 |

Special bonus default: 15-25.

ScoreBonus duplicate x3 default: 15.

## 19. Tests Required

```text
easy role with 999 points triggers warning
basePoints 0 fails
special bonus alone cannot win
ScoreBonus alone cannot win
multiple win roles do not stack basePoints
repeatable ScoreBonus without maxPoints warns
score over 500 warning
wildcard ratio high warning/error
wildcard category in winRole fails
impossible group-backed role fails
```

## Final Decision

Custom deck scoring should feel generous but explainable.

Freedom is allowed, but the editor and validator must protect:

```text
playability
clarity
balance
trust
```
