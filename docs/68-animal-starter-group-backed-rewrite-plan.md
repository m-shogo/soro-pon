# Animal Starter Group-backed Rewrite Plan

## Purpose

The original animal starter direction used count-first roles like:

```text
mammal >= 6
sea >= 5
bird >= 4
```

That is easy to count but weak for a mahjong-like game.

Normal MVP must teach:

```text
3 groups x 3 tiles
clear groups
clear wait
clear scoring
```

This document defines how to rewrite animal starter around group-backed win roles.

## Current Rule

Normal animal starter must use:

```text
evaluationMode: normalThreeGroups
handSizeNormal: 8
handSizeAfterDraw: 9
winHandSize: 9
groupSize: 3
groupCount: 3
```

## Recommended Tile Categories

Keep categories simple.

```text
mammal
bird
sea
insect
strong
cute
rare
```

Primary category should be visible on tile cards.

Tags can exist but should not be required for first play.

## Win Role Templates

## 1. Three Same-category Groups

Example:

```text
どうぶつ王国
3 sameCategory groups of mammal
basePoints: 40
```

RequiredGroups:

```json
[
  { "groupType": "sameCategory", "categoryId": "mammal", "count": 3 }
]
```

Meaning:

```text
mammal group + mammal group + mammal group
```

## 2. Mixed Habitat Groups

Example:

```text
にぎやか動物園
1 mammal group + 1 bird group + 1 sea group
basePoints: 50
```

RequiredGroups:

```json
[
  { "groupType": "sameCategory", "categoryId": "mammal", "count": 1 },
  { "groupType": "sameCategory", "categoryId": "bird", "count": 1 },
  { "groupType": "sameCategory", "categoryId": "sea", "count": 1 }
]
```

## 3. Specific Set Group + Flexible Groups

Example:

```text
サバンナの主役
specificSet Lion + Elephant + Giraffe
plus two valid sameCategory groups
basePoints: 70
```

RequiredGroups:

```json
[
  { "groupType": "specificSet", "tileIds": ["lion", "elephant", "giraffe"], "count": 1 },
  { "groupType": "sameCategory", "categoryId": "mammal", "count": 2 }
]
```

If this is too strict for starter, make it a special_bonus instead.

## 4. Three Different Category Groups

Example:

```text
みんな集合
3 groups from 3 different categories
basePoints: 45
```

This may need a custom group pattern validator.

Do not implement first if it complicates MVP.

## Special Bonuses

Special bonuses should be simple and cannot win alone.

Examples:

```text
サバンナ三兄弟: Lion + Elephant + Giraffe present, +15
かわいいトリオ: three cute-tag tiles present, +10
森のなかまたち: selected forest animals present, +10
```

SpecialBonus may use count/tag/specific conditions because it is after-win only.

## Score Bonuses

MVP examples:

```text
same tile x3: +5
same name duplicate: +5
same category extra: +3, capped
```

ScoreBonus cannot win alone.

Wildcard should not count for ScoreBonus by default.

## Starter Role Count

Recommended MVP starter:

```text
winRoles: 4-6
specialBonuses: 3-5
scoreBonuses: 2-3
```

Do not start with 20+ roles.

Too many roles makes first play noisy.

## Starter Difficulty

Keep first deck forgiving.

Role point range:

```text
simple sameCategory: 30-40
mixed category: 40-60
specific set: 60-80
bonus: 5-20
```

## Wildcard In Starter

Starter may include 1-2 wildcard copies.

Rules:

```text
max 1 wildcard per winRole
max 1 wildcard per group
discarded wildcard ron blocked
```

UI must show:

```text
★ as mammal group filler
★ as bird group filler
```

## Rewrite Checklist

Before engine implementation, update:

```text
docs/33-official-animal-starter-deck.md
samples/animal-starter.deck.json
schema tests
sample parse tests
role evaluation tests
```

Remove or demote these normal win roles:

```text
mammal >= 6
sea >= 5
bird >= 4
insect >= 4
strong >= 5
```

They can become:

```text
special_bonus
ScoreBonus
extendedRoleSpan example later
```

## Final Decision

Animal starter should teach Soro-pon's real structure:

```text
make 3 groups
see why they are groups
win with one selected win_role
add bonuses after that
```

Do not let the starter deck teach count-only wins as the main game.
