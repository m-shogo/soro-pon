# Testing Strategy

## Purpose

This document defines what must be tested before implementation can move from schema/engine to full UI.

Soro-pon is custom-deck driven, so tests must cover normal paths and adversarial decks.

## Test Pyramid

```text
unit tests: pure functions
integration tests: schema + validation + engine flows
golden deck tests: official sample behavior
adversarial deck tests: broken/custom deck patterns
UI/component tests: later, after component gallery
visual screenshots: later, after UI foundation
```

## Required Test Groups

### 1. Schema Tests

```text
animal starter strict parse
unknown fields rejected
scoreBudget required in current schema
normalThreeGroups fields fixed
normal winRole requiredGroups required
special_bonus cannot have canRon/canTsumo
ScoreBonus is not Role.kind
```

### 2. Import Security Tests

```text
imageUrl rejected
imageBase64 rejected
filePath rejected
blobUrl rejected
url rejected
src rejected
html rejected
style rejected
script/code/function rejected
unknown top-level field rejected
unknown nested field rejected
unsafe field does not get preserved
```

### 3. Deck Validation Tests

Fixtures:

```text
valid-minimal
animal-starter
no-win-role
bonus-only
impossible-role
wildcard-heavy
duplicate-role
candidate-explosion
category-too-small
score-explosion
large-valid
old-schema-safe-migration
old-schema-unsafe-reject
corrupt-import
```

### 4. Group Engine Tests

```text
sameTile group detected
sameCategory group detected
sameTag group detected
specificSet group detected
wildcard-assisted group detected
one group max one wildcard
9 tiles partition into 3 groups
8 tiles cannot be normal completed win
10 tiles cannot be normal completed win
one tileInstanceId cannot be reused in two groups
```

### 5. Role Analysis Tests

```text
completed candidate includes 3 groups
tenpai candidate includes incomplete group
near candidate includes missing requirement count
bonusOnly cannot win
invalidButExplainable has blocked reason
primaryCandidates capped at normal display limit
hiddenCandidateCount returned when compressed
candidate ranking deterministic
hand order does not change result
```

### 6. Ron / Tsumo Tests

```text
tsumo uses 9-tile hand after draw
ron uses 8 hand tiles + discarded tile
special_bonus alone cannot tsumo
special_bonus alone cannot ron
ScoreBonus alone cannot tsumo
ScoreBonus alone cannot ron
discarded wildcard cannot ron by default
own drawn wildcard can complete if allowed
multiple ron follows MVP seat-order rule
```

### 7. Scoring Tests

```text
selectedWinRole provides basePoints
multiple winRoles do not stack basePoints
specialBonuses apply only after selectedWinRole
ScoreBonuses apply only after selectedWinRole
scoreBudget warnings emitted
totalPoints is additive
ResultBreakdown includes groups/wildcards/bonuses/total
no hidden score modifier
```

### 8. Discard Preview / Insight Tests

```text
discard preview does not mutate state
preview distinguishes current 9-tile shape from resulting 8-tile wait
breaks candidate insight
keeps candidate insight
wildcard used as insight
bonusOnly explanation
insights do not contain best/correct/should wording
beginner mode limits output
normal mode limits output
advanced mode can expose details
```

### 9. Match Reducer Tests

```text
setup -> deal -> turnStart -> draw path
draw gives 9 tiles to current player
invalid action returns ok:false and original state
discard outside discardSelect rejected
tsumo without win rejected
ron outside reactionRon rejected
PASS_RON advances reaction order
all pass advances turn
empty draw pile ends round
```

### 10. Storage / Migration Tests

```text
localStorage parsed through schema
corrupt localStorage recovers
older safe deck applies scoreBudget default with notice
unsafe older deck rejected or imported as blocked draft
local image map is not included in shared export
missing local image falls back to text/emoji
```

## Golden Deck Tests

The official animal starter deck should prove:

```text
strict parse succeeds
normal variant is playable
extended variant is engine pending
sample winRoles are group-backed
sample scoreBudget is valid
sample has no image fields
```

## Adversarial Deck Matrix

Every pattern in `docs/69-adversarial-custom-deck-patterns.md` should become:

```text
validation test
engine test
or explicit not-yet-supported pending test
```

Do not ignore a pattern silently.

## UI Test Gate

Full screen UI starts only after:

```text
schema tests pass
import security tests pass
group engine tests pass
ron/tsumo tests pass
score tests pass
match reducer tests pass
```

## Snapshot / Visual Tests Later

After Component Gallery:

```text
844x390
932x430
852x393
1024x600
1366x768
```

Screenshots should be saved under:

```text
docs/design-targets/generated/implementation-screenshots/<phase>/
```

## Final Decision

Tests should prove the rules before UI makes the game look finished.
