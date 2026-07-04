# Engine Spec Tables

## Purpose

This document turns design principles into implementation tables.

It closes vague areas from:

```text
docs/51-role-analysis-and-game-feel-ux.md
docs/53-discard-insight-and-beginner-ux.md
docs/54-hard-design-decisions-before-implementation.md
docs/55-integrated-ux-and-engine-guardrails.md
docs/56-pre-ui-implementation-master-gate.md
docs/57-remaining-design-gaps-closure.md
```

## 1. Role Condition Grammar

Roles must be data-driven.

MVP role conditions use this grammar.

```ts
type RoleCondition =
  | { type: 'allOf'; conditions: RoleCondition[] }
  | { type: 'anyOf'; conditions: RoleCondition[] }
  | { type: 'countByCategory'; categoryId: string; minCount: number }
  | { type: 'countByTag'; tag: string; minCount: number }
  | { type: 'countByTileId'; tileId: string; minCount: number }
  | { type: 'specificTileSet'; tileIds: string[]; allowExtra?: boolean }
  | { type: 'distinctCategories'; minCount: number }
  | { type: 'distinctTileNames'; minCount: number }
  | { type: 'duplicateTile'; minCount: number }
  | { type: 'sameCategorySet'; setSize: number }
  | { type: 'sameTagSet'; tag: string; setSize: number };
```

MVP forbidden:

```text
custom JavaScript
regex role condition
remote script
image-based condition
manual function name lookup
```

## 2. Role Condition Validation

| Rule | Severity | Reason |
|---|---|---|
| no condition | error | conditionless role breaks play |
| empty allOf/anyOf | error | always true or meaningless |
| minCount <= 0 | error | invalid count |
| unknown categoryId | error | impossible evaluation |
| unknown tileId | error | impossible evaluation |
| setSize <= 1 | warning | too easy / confusing |
| condition span > variant max | error | impossible in variant |
| condition uses no tile/category/tag | error | cannot explain |

## 3. Candidate State Table

| State | Meaning | Can Win | UI Priority |
|---|---|---:|---:|
| completed | completed win_role | yes | 1 |
| tenpai | one condition away | no | 2 |
| near | two conditions away | no | 3 |
| bonusOnly | bonus satisfied or close | no | 4 |
| invalidButExplainable | close but blocked | no | 5 |

## 4. Candidate Ranking Formula

Ranking must be deterministic.

Lower rankScore is better.

```ts
rankScore =
  stateWeight
  + distanceWeight
  + wildcardPenalty
  + naturalMatchBonus
  + scoreBonus
  + explainPenalty
  + priorityTieBreak
  + deckOrderTieBreak;
```

Default weights:

| Factor | Value |
|---|---:|
| completed stateWeight | 0 |
| tenpai stateWeight | 1000 |
| near stateWeight | 2000 |
| bonusOnly stateWeight | 3000 |
| invalidButExplainable stateWeight | 4000 |
| each missing condition | +120 |
| each wildcard used | +40 |
| each natural match | -8 |
| each 10 points of score estimate | -5 |
| long explanation | +15 |
| role.priority | +priority |
| deck order | +index / 1000 |

Important:

```text
completion distance beats score
wildcard-light beats wildcard-heavy on similar candidates
ranking never claims user intent
```

## 5. Wildcard Limits

| Policy | MVP Default |
|---|---:|
| maxWildcardsPerWinRole | 1 |
| maxWildcardsPerSet | 1 |
| allowDiscardedWildcardRon | false |
| allowWildcardForScoreBonus | false |
| allowWildcardForSpecialBonus | true |
| preferNaturalMatch | true |

Branch guard:

| Branch Count | Severity |
|---:|---|
| <= 64 | ok |
| 65-256 | warning |
| > 256 | error or capped analysis |

If capped, UI must show analyzer warning.

## 6. Discard Impact Scoring

Discard preview evaluates candidate delta.

```ts
impactScore =
  breaksCompleted * 1000
  + breaksTenpai * 400
  + breaksNear * 120
  - improvesCandidate * 160
  - removesUnrelated * 20
  + wildcardLost * 300;
```

Impact levels:

| Score | Level |
|---:|---|
| <= 0 | safe |
| 1-119 | neutral |
| 120-399 | costly |
| >= 400 | dangerous |

UI wording:

```text
safe:候補をほぼ保ちます
neutral:大きな変化はありません
costly:近い候補が減ります
dangerous:重要候補が崩れます
```

Do not say best/worst move.

## 7. Insight Priority

Normal mode max insights: 2.

| Insight | Priority |
|---|---:|
| canWin | 1 |
| ronAvailable | 2 |
| tsumoAvailable | 3 |
| discardBreaksCandidate | 4 |
| oneAway | 5 |
| wildcardUsedAs | 6 |
| blockedReason | 7 |
| bonusOnly | 8 |
| newCandidateAfterDraw | 9 |
| candidateLostAfterDiscard | 10 |

Beginner mode shows only the highest priority useful insight.

## 8. CPU Evaluation Weights

CPU uses the same analyzer data.

CPU discard score: lower is better to discard.

```ts
discardScore =
  relatedToCompleted * 1000
  + relatedToTenpai * 400
  + relatedToNear * 130
  + isWildcard * 300
  + supportsBonusOnly * 40
  - isUnrelated * 80
  + deterministicTieBreak;
```

CPU action priority:

```text
1. declare tsumo if valid
2. declare ron if valid
3. discard lowest discardScore tile
4. tie-break by stable seeded order
```

CPU must not use hidden cheating information in MVP.

## 9. Match State Transition Table

| Current | Action | Next | Notes |
|---|---|---|---|
| setup | START_MATCH | deal | validate players/deck |
| deal | DEAL_COMPLETE | turnStart | hands dealt |
| turnStart | START_TURN | draw | current player set |
| draw | DRAW_TILE | afterDrawAction | one tile drawn |
| afterDrawAction | DECLARE_TSUMO | roundEnd | only if win_role complete |
| afterDrawAction | SELECT_TILE | discardSelect | selected tile instance |
| discardSelect | DISCARD_TILE | reactionRon | discard confirmed |
| reactionRon | DECLARE_RON | roundEnd | first valid by seat order |
| reactionRon | PASS_RON | turnEnd | all pass or no candidates |
| turnEnd | NEXT_TURN | turnStart | rotate player |
| turnEnd | DRAW_PILE_EMPTY | roundEnd | draw result |
| roundEnd | SHOW_RESULT | result | score breakdown |
| result | NEW_MATCH | setup | reset match |

Invalid action must return an error result, not mutate state.

## 10. Validation Thresholds

| Check | Info | Warning | Error |
|---|---:|---:|---:|
| total tiles | 60-80 | 40-59 | < 40 |
| win_role count | 3-5 | 1-2 | 0 |
| role name length | <= 14 | 15-24 | > 24 |
| wildcard ratio | <= 10% | 11-15% | > 15% |
| duplicate role condition | none | similar | exact duplicate high score conflict |
| easy role high score | <= 80 | 81-120 | > 120 |
| candidate explosion estimate | <= 8 | 9-20 | > 20 |

These are MVP defaults and can be tuned after playtest.

## 11. Import / Version Behavior

| Case | Behavior |
|---|---|
| valid current schema | import preview |
| older supported schema | migrate with notice |
| newer schema | reject with explanation |
| missing schemaVersion | reject |
| unknown fields | reject official import |
| image fields | reject |
| invalid JSON | show parse error summary |
| validation warnings only | allow import after review |
| validation errors | block import |

## 12. Tutorial Trigger Table

| Trigger | Tutorial |
|---|---|
| first match start | draw/discard basics |
| first tenpai | one tile away explanation |
| first wildcard draw | wildcard candidate explanation |
| first bonusOnly | bonus cannot win alone |
| first ron opportunity | ron action explanation |
| first tsumo opportunity | tsumo action explanation |
| first result | score breakdown explanation |

Tutorial cards can be skipped.

They must not block urgent ron/tsumo action after first explanation.

## 13. Display Mode Table

| Mode | Candidate Count | Insight Count | Score Detail | Discard Table |
|---|---:|---:|---|---|
| beginner | 1 | 1 | simple | hidden |
| normal | 3 | 2 | simple | selected tile only |
| advanced | 3+details | 3+details | full | visible |

Display mode never changes rules.

## 14. Result Breakdown Contract

Result must include:

```ts
type ResultBreakdown = {
  selectedWinRoleId: string;
  selectedWinRolePoints: number;
  specialBonusIds: string[];
  scoreBonusIds: string[];
  wildcardAssignments: WildcardAssignment[];
  blockedBonusIds?: string[];
  totalPoints: number;
  earnedCoins: number;
  collectionUpdates: CollectionUpdate[];
};
```

## 15. Review Score Target

Design review score before implementation:

| Area | Target |
|---|---:|
| rule determinism | 98 |
| wildcard safety | 98 |
| candidate clarity | 98 |
| discard UX | 96 |
| beginner UX | 96 |
| deck authoring safety | 96 |
| UI visual direction | 95 |
| implementation readiness | 94 |

The remaining gap to 100 requires implementation, tests, and real playtest.

## Final Decision

These tables are the default implementation spec.

If implementation discovers a conflict, update this document before changing code behavior.
