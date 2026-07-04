# Mahjong-like Hand Structure and Scoring Core

## Purpose

Previous docs focused too much on UX around candidates and not enough on the actual mahjong-like structure needed for implementation.

This document fixes the core model so role evaluation and scoring can be implemented.

Soro-pon is not full mahjong.

Soro-pon is closer to Donjara / mahjong-like set collection:

```text
normal hand: 8 tiles
turn hand after draw: 9 tiles
win shape: 3 groups x 3 tiles
no pon / chi / kan
3-4 players
```

## 1. Core Vocabulary

Use these terms consistently.

```text
TileDefinition: deck-level tile definition
TileInstance: physical tile in a match
Group: a 3-tile unit used in the win shape
Pattern: the hand shape, normally 3 groups
WinRole: a scoring rule that can make the hand win
SpecialBonus: extra score after a WinRole exists
ScoreBonus: extra score after a WinRole exists
```

## 2. Normal Win Shape

MVP normal variant requires exactly 9 tiles after draw.

A winning hand is:

```text
Group A: 3 tiles
Group B: 3 tiles
Group C: 3 tiles
```

Every tile in the winning hand must be assigned to exactly one group.

No floating tile is allowed in normal 9-tile win.

## 3. Group Types

MVP should support only these group types first.

```ts
type GroupType =
  | 'sameTile'
  | 'sameCategory'
  | 'sameTag'
  | 'specificSet'
  | 'freeSet';
```

Meaning:

| GroupType | Meaning | Example |
|---|---|---|
| sameTile | same tileId x3 | Dog Dog Dog |
| sameCategory | any 3 tiles from category | Bird Bird Bird |
| sameTag | any 3 tiles with tag | night/night/night |
| specificSet | exact tileId list | Dog Cat Bird |
| freeSet | any 3 tiles, used only by special rule templates | any 3 animals |

`freeSet` should be rare and usually lower score.

## 4. Hand Pattern Search

Role evaluation should first search possible 3-group partitions.

For a 9-tile hand:

```text
1. enumerate valid 3-tile groups
2. find combinations of 3 groups that use all 9 tile instances exactly once
3. evaluate win roles against those groups
4. attach bonuses after a valid win role exists
```

This prevents roles from being vague count checks only.

## 5. Role Types

Do not make every role a generic count rule.

Use these role families.

```ts
type WinRoleFamily =
  | 'groupPattern'
  | 'categoryMajority'
  | 'specificCollection'
  | 'allDifferent'
  | 'allSameCategory'
  | 'customTemplate';
```

MVP priority:

```text
groupPattern first
specificCollection second
categoryMajority third
```

## 6. WinRole Contract

A win role must define:

```ts
type WinRole = {
  id: string;
  kind: 'win_role';
  name: string;
  family: WinRoleFamily;
  basePoints: number;
  requiredGroups?: GroupRequirement[];
  wholeHandCondition?: RoleCondition;
  allowWildcard: boolean;
  maxWildcards: number;
  priority: number;
  explanation: string;
};
```

A `win_role` must not be conditionless.

A `win_role` must explain why it wins.

## 7. Group Requirement Contract

```ts
type GroupRequirement = {
  groupType: GroupType;
  categoryId?: string;
  tag?: string;
  tileIds?: string[];
  count: number;
};
```

Example: three same-category groups.

```json
{
  "requiredGroups": [
    { "groupType": "sameCategory", "categoryId": "bird", "count": 1 },
    { "groupType": "sameCategory", "categoryId": "mammal", "count": 1 },
    { "groupType": "sameCategory", "categoryId": "sea", "count": 1 }
  ]
}
```

## 8. Why Count-only Roles Are Dangerous

Bad role:

```text
mammal >= 6
```

This is easy to count but does not explain the 3-group win shape.

Better:

```text
two sameCategory mammal groups + any valid third group
```

Count-only conditions may exist as whole-hand conditions, but MVP should prefer group-based roles.

## 9. Wildcard In Group Search

Wildcard is resolved during group construction, not after scoring only.

Rules:

```text
wildcard can fill a missing tile inside a group
one group can use at most 1 wildcard by default
one win role can use at most 1 wildcard by default
wildcard assignment belongs to a candidate partition
```

This makes wildcard explanation concrete:

```text
Star is used as Bird in Group B
```

## 10. Candidate Shape

A candidate must include both role and grouping.

```ts
type HandCandidate = {
  candidateId: string;
  state: 'completed' | 'tenpai' | 'near' | 'bonusOnly' | 'invalidButExplainable';
  winRoleId?: string;
  groups: CandidateGroup[];
  usedTileInstanceIds: string[];
  missingRequirements: MissingRequirement[];
  wildcardAssignments: WildcardAssignment[];
  basePoints: number;
  bonusPoints: number;
  totalEstimate: number;
  explainReasons: ExplainReason[];
};
```

Without `groups`, the UI cannot explain the hand clearly.

## 11. CandidateGroup Shape

```ts
type CandidateGroup = {
  groupId: string;
  groupType: GroupType;
  tileInstanceIds: string[];
  categoryId?: string;
  tag?: string;
  isComplete: boolean;
  wildcardAssignmentIds: string[];
};
```

UI can render this as three visual clusters.

## 12. Scoring Formula

MVP scoring should be simple and explainable.

```text
totalPoints = selectedWinRole.basePoints
            + sum(appliedSpecialBonus.points)
            + sum(appliedScoreBonus.points)
```

No multiplier in MVP.

No hidden score.

No score from coins.

## 13. Selected Win Role

If multiple win roles match the same hand, choose one selected win role for base score.

Tie-break:

```text
1. higher basePoints
2. fewer wildcards
3. more natural groups
4. higher family priority
5. lower role.priority
6. earlier deck order
```

Other win roles may be displayed as alternatives, but they do not all stack as base score in MVP.

## 14. SpecialBonus Contract

A special bonus requires a valid selected win role first.

```ts
type SpecialBonus = {
  id: string;
  kind: 'special_bonus';
  name: string;
  points: number;
  condition: RoleCondition;
  appliesTo?: string[];
  allowWildcard: boolean;
  maxWildcards: number;
  explanation: string;
};
```

SpecialBonus cannot win alone.

## 15. ScoreBonus Contract

ScoreBonus is a non-role score adjustment.

```ts
type ScoreBonus = {
  id: string;
  name: string;
  points: number;
  condition: RoleCondition;
  maxPoints?: number;
  allowWildcard: boolean;
  explanation: string;
};
```

ScoreBonus cannot win alone.

## 16. Wait Calculation

Wait analysis should be group-aware.

For tenpai, explain:

```text
which group is incomplete
what condition fills it
which tiles/categories/tags satisfy it
whether wildcard would satisfy it
```

Examples:

```text
Group 3 needs one Bird category tile
Group 2 needs Dog to complete specific set
Any one night-tag tile completes the third group
```

## 17. Discard Impact Must Be Group-aware

Discard impact should say what group/candidate changes.

Examples:

```text
This discard breaks Group 2 of Animal Trio
This discard keeps all three groups possible
This discard removes a tile not used by the top candidate
```

## 18. UI Shape

The hand UI should be able to show candidate grouping.

When candidate is selected:

```text
show three subtle group clusters
show missing slot inside incomplete group
show wildcard marker inside group
show role name connected to groups
```

This makes roles more understandable than a flat list.

## 19. Role Editor Template Priority

Role editor should offer templates in this order:

```text
3 groups of same category
specific 3-tile set
three different categories
all groups share a tag
bonus for specific collection
score bonus for duplicate tile
```

The editor should teach group structure visually.

## 20. Implementation Gate

Do not implement full role engine as simple count checks only.

Required first engine tests:

```text
9 tiles partition into 3 valid groups
sameCategory group detected
specificSet group detected
wildcard fills one missing group tile
one wildcard per winRole enforced
selectedWinRole tie-break works
specialBonus does not win alone
ScoreBonus does not win alone
wait identifies incomplete group
result shows group-based explanation
```

## Final Decision

Soro-pon role logic must be group-first.

Counts may support roles, but groups explain the game.

If a role cannot be shown as clear tile groups or a clear whole-hand exception, it should not be an MVP template.
