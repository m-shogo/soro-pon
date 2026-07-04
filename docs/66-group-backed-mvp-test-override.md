# Group-backed MVP Test Override

## Purpose

This document overrides older count-first test cases in `docs/35-mvp-test-cases.md`.

Normal MVP is now group-backed:

```text
8-tile hand before draw
9-tile hand after draw
winning hand = 3 groups x 3 tiles
win_role must be backed by groups
```

Related docs:

```text
docs/62-mahjong-structure-scoring-core.md
docs/64-breaking-risk-review-and-fixes.md
docs/65-group-backed-schema-override.md
```

## 1. Schema Tests

Required:

```text
normal variant evaluationMode normalThreeGroups passes
normal variant handSizeNormal 8 passes
normal variant handSizeAfterDraw 9 passes
normal variant winHandSize 9 passes
normal variant groupSize 3 passes
normal variant groupCount 3 passes
normal win_role with requiredGroups passes
normal win_role without requiredGroups fails
normal win_role with only count condition fails
normal win_role basePoints 0 fails
specificSet group with exactly 3 tileIds passes
specificSet group with 2 tileIds fails
specificSet group with 4 tileIds fails
sameCategory group without categoryId fails
sameTag group without tag fails
special_bonus with canRon fails
special_bonus with canTsumo fails
score_bonus inside Role.kind fails
extendedRoleSpan variant parses but may be engine-pending
```

## 2. Group Enumeration Tests

Required:

```text
three same tile instances produce sameTile group
three same category tile instances produce sameCategory group
three matching tag tile instances produce sameTag group
specific tile id list produces specificSet group
wildcard can fill one missing tile in a group
one group cannot use two wildcards by MVP default
```

## 3. 9 Tile Partition Tests

Required:

```text
9 tiles can partition into 3 complete groups
8 tiles cannot be a completed normal win hand
10 tiles cannot be a completed normal win hand
same tile instance cannot be used in two groups
partition uses all 9 tile instances exactly once
partition with floating tile is invalid in normalThreeGroups
```

## 4. Tsumo Tests

Tsumo candidate hand:

```text
player hand after draw = 9 tiles
```

Required:

```text
9-tile hand with 3 groups and win_role canTsumo true can tsumo
9-tile hand with 3 groups but only special_bonus cannot tsumo
9-tile hand with 3 groups but only ScoreBonus cannot tsumo
9-tile hand with incomplete group cannot tsumo
wildcard assignment appears in tsumo result
```

## 5. Ron Tests

Ron candidate hand:

```text
player 8-tile hand + discarded tile = 9 tiles
```

Required:

```text
8 tiles plus discard forming 3 groups can ron
8 tiles plus discard not forming 3 groups cannot ron
special_bonus alone cannot ron
ScoreBonus alone cannot ron
discarded wildcard cannot trigger ron by MVP default
reaction order checks players in seat order
multiple ron uses first valid candidate by MVP default
```

## 6. Wait Context Tests

Add context:

```ts
type WaitContext = 'afterDrawNineTiles' | 'afterDiscardEightTiles' | 'ronCheckNineTiles';
```

Required:

```text
afterDiscardEightTiles returns future draw waits
afterDrawNineTiles returns discard impact plus current completion state
ronCheckNineTiles evaluates 8 hand tiles plus discard
wait explains incomplete group
wait names category/tag/tile requirement
```

## 7. Candidate Tests

Required:

```text
completed candidate includes 3 groups
tenpai candidate includes incomplete group info
near candidate includes missing group requirement count
candidate includes usedTileInstanceIds
candidate includes wildcardAssignments
candidate includes explainReasons
candidate includes blockedReasons when invalid
primaryCandidates max 3
hiddenCandidateCount returned when compressed
```

## 8. Scoring Tests

Required:

```text
totalPoints = selectedWinRole.basePoints + specialBonuses + scoreBonuses
multiple win_roles do not stack basePoints
selectedWinRole tie-break uses higher basePoints
selectedWinRole tie-break then fewer wildcards
selectedWinRole tie-break then natural groups
special_bonus applies only after selectedWinRole exists
ScoreBonus applies only after selectedWinRole exists
result breakdown includes groups and wildcard assignments
```

## 9. Discard Preview Tests

Required:

```text
discard preview starts from current 9-tile hand
discard preview evaluates resulting 8-tile wait hand
discard preview does not mutate match state
discard preview can report breaks current complete group
discard preview can report keeps future wait
discard preview can report removes unused tile
```

## 10. Animal Starter Tests

Animal starter must be rewritten around group-backed roles.

Required examples:

```text
role requiring three mammal sameCategory groups passes
role requiring one bird group + one sea group + one mammal group passes
role requiring specificSet Lion Elephant Giraffe passes
count-only mammal >= 6 as normal win_role fails
```

## Final Decision

For MVP implementation, use this test override before older count-first tests in `docs/35-mvp-test-cases.md`.

Normal MVP tests must prove 3-group hand structure first.
