# Score Budget Schema and Defaults

## Purpose

This document decides where `ScoreBudgetProfile` lives and how implementation should default it.

Related docs:

```text
docs/70-deck-rules-and-scoring-law.md
docs/71-scoring-budget-and-image-security.md
samples/animal-starter.deck.json
```

## Decision

`ScoreBudgetProfile` belongs to each deck variant.

Reason:

```text
normal and extended variants may have different score ranges
custom decks may intentionally use a different scoring feel
validation needs variant-specific thresholds
result UI needs variant-specific caps and warnings
```

## Field Name

Use:

```ts
scoreBudget: ScoreBudgetProfile
```

inside `DeckVariant`.

## Type

```ts
type ScoreBudgetProfile = {
  expectedBaseMin: number;
  expectedBaseMax: number;
  expectedResultMin: number;
  expectedResultMax: number;
  softResultCap: number;
  hardResultCap: number;
  maxSpecialBonusTotal: number;
  maxScoreBonusTotal: number;
};
```

## Normal MVP Default

```json
{
  "expectedBaseMin": 30,
  "expectedBaseMax": 130,
  "expectedResultMin": 40,
  "expectedResultMax": 220,
  "softResultCap": 300,
  "hardResultCap": 500,
  "maxSpecialBonusTotal": 80,
  "maxScoreBonusTotal": 60
}
```

## Extended Default

Extended engine is pending, but schema may parse a profile.

Default:

```json
{
  "expectedBaseMin": 50,
  "expectedBaseMax": 220,
  "expectedResultMin": 70,
  "expectedResultMax": 350,
  "softResultCap": 500,
  "hardResultCap": 800,
  "maxSpecialBonusTotal": 120,
  "maxScoreBonusTotal": 100
}
```

## Schema Rules

```text
expectedBaseMin > 0
expectedBaseMax >= expectedBaseMin
expectedResultMin >= expectedBaseMin
expectedResultMax >= expectedResultMin
softResultCap >= expectedResultMax
hardResultCap >= softResultCap
maxSpecialBonusTotal >= 0
maxScoreBonusTotal >= 0
```

## Missing scoreBudget Behavior

For official current schema, `scoreBudget` should be required.

For migration/import compatibility:

```text
if scoreBudget missing in older schema: apply safe default based on evaluationMode, then show migration notice
if scoreBudget missing in current schema: validation error
```

## Validation Uses

Deck validation should use `scoreBudget` to warn about:

```text
basePoints below expectedBaseMin
basePoints above expectedBaseMax
estimated result above softResultCap
possible result above hardResultCap
special bonus total above maxSpecialBonusTotal
ScoreBonus total above maxScoreBonusTotal
```

## Result Uses

Result calculation should:

```text
calculate raw total
apply score bonus caps if defined by scoring policy
show warning in dev/test if raw total exceeds hard cap
never hide selected win role or bonus explanation
```

MVP recommendation:

```text
Do not hard-clamp player-visible total unless scoring policy explicitly says capped.
Use budget primarily for validation warnings.
```

Reason:

```text
Silent clamping makes score feel untrustworthy.
```

## Editor UX

Editor should show budget as:

```text
このデッキの想定点数
基本役: 30〜130
最終点: 40〜220
高すぎ警告: 300+
表示上限注意: 500+
```

Advanced users may edit budget, but beginner mode should hide it.

## Tests

Required tests:

```text
normal variant with valid scoreBudget parses
missing scoreBudget in current schema fails
older schema missing scoreBudget can migrate with default
hardResultCap below softResultCap fails
expectedBaseMax below expectedBaseMin fails
easy role above expectedBaseMax emits warning
bonus total above maxSpecialBonusTotal emits warning
possible total above softResultCap emits warning
```

## Final Decision

Use `scoreBudget` as a validation and UX budget, not an invisible score clamp.

If total score is capped in the future, the cap must be visible in result explanation.
