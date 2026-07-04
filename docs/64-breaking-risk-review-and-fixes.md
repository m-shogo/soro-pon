# Breaking Risk Review and Fixes

## Purpose

This document reviews the current Soro-pon design by trying to break it.

The goal is to find contradictions before implementation.

Related docs:

```text
docs/51-role-analysis-and-game-feel-ux.md
docs/58-engine-spec-tables.md
docs/62-mahjong-structure-scoring-core.md
docs/63-typescript-engine-implementation-blueprint.md
```

## Verdict

The design is much stronger than before, but there are still breaking risks.

The biggest issue:

```text
normal 9-tile group structure
vs
extended 2-14 tile roles
vs
count-based roles
```

These must be separated clearly.

## 1. Normal Shape vs Role Span Conflict

Risk:

Docs say normal win shape is 3 groups x 3 tiles, but other docs allow 2-14 tile roles.

Fix:

Use two evaluation modes.

```ts
type WinEvaluationMode = 'normalThreeGroups' | 'extendedRoleSpan';
```

MVP normal variant:

```text
normalThreeGroups only
9 tiles after draw
3 complete groups required
no floating tile
```

Extended variant:

```text
extendedRoleSpan allowed
2-14 tile role spans allowed
floating tile behavior is role-defined
```

Do not mix these silently.

## 2. Count-only Role Confusion

Risk:

A role like `mammal >= 6` can be true without explaining which 3 groups won.

Fix:

MVP normal win_role should be group-backed.

Count conditions can be:

```text
wholeHandCondition attached to a group-backed role
special_bonus
ScoreBonus
extendedRoleSpan role
```

But normal MVP should not use count-only as the only win explanation.

## 3. Multiple Win Roles on Same Groups

Risk:

Same 3 groups may satisfy many roles, and score can stack accidentally.

Fix:

MVP scoring selects one base win role.

Other win roles may appear as alternatives but do not add points unless explicitly modeled as special_bonus.

```text
base score = selectedWinRole only
additional score = special_bonus + ScoreBonus
```

## 4. Group Partition Explosion

Risk:

9 tiles can have many possible partitions, especially with wildcards.

Fix:

Partition search must be bounded.

MVP group enumeration order:

```text
1. natural groups
2. one-wildcard groups
3. candidate partitions using all 9 tiles
4. cap partitions if too many
```

If capped, return analyzer warning.

## 5. Wildcard Overpower

Risk:

Even with max 1 wildcard per role, a wildcard can make too many candidates look close.

Fix:

Ranking should prefer natural groups.

UI should show wildcard-heavy candidates lower unless completed state requires it.

Validation should warn if wildcard ratio is high or many roles need wildcard.

## 6. Tenpai Definition Ambiguity

Risk:

Tenpai could mean one tile away from any role condition, or one tile away from 3 complete groups.

Fix:

For normalThreeGroups:

```text
tenpai = one tile replacement/addition away from 3 complete groups + win_role
```

Because the hand after draw has 9 tiles, discard-phase tenpai should be evaluated as:

```text
after choosing a discard, the 8-tile waiting hand can become 9-tile win with one future draw
```

This means WaitAnalyzer needs context:

```ts
type WaitContext = 'afterDrawNineTiles' | 'afterDiscardEightTiles' | 'ronCheckNineTiles';
```

## 7. Ron Check Shape

Risk:

Ron uses another player's discarded tile, so hand size and candidate shape can be miscounted.

Fix:

Ron candidate hand is:

```text
current player's 8 tiles + discarded tile = 9 tiles
```

Then evaluate normalThreeGroups.

Discarded wildcard ron remains blocked by default.

## 8. Tsumo Check Shape

Risk:

Tsumo after draw uses 9 tiles.

Fix:

Tsumo candidate hand is:

```text
current player's 9 tiles after draw
```

Evaluate normalThreeGroups.

## 9. Discard Preview Shape

Risk:

Discard preview can accidentally analyze a 9-tile hand as if it were the waiting 8-tile hand.

Fix:

Discard preview must calculate:

```text
current 9-tile candidates before discard
candidate state after removing selected tile
waits from resulting 8-tile hand
```

It must clearly distinguish:

```text
breaks current complete shape
keeps future wait
improves future wait
```

## 10. Role Editor Template Risk

Risk:

Templates may create roles that do not map to groups.

Fix:

Normal role templates must output `requiredGroups` first.

Only advanced/extended templates may output span-only conditions.

## 11. Score Balance Risk

Risk:

Current thresholds are arbitrary.

Fix:

Use provisional ranges and mark them as playtest-tunable.

MVP score guidance:

```text
simple 3-group win: 20-40
hard 3-group win: 50-80
very hard normal win: 90-120
special bonus: 5-30
score bonus: 3-20 each, capped
```

Do not lock economy around these until playtest.

## 12. CPU Evaluation Risk

Risk:

CPU weights may feel irrational.

Fix:

CPU must log reason in dev mode.

Example:

```text
kept tile because top candidate uses it
discarded tile because no top candidate uses it
```

Do not tune CPU before analyzer is correct.

## 13. UI Candidate Group Risk

Risk:

Showing groups can clutter compact landscape UI.

Fix:

Group display has levels:

```text
compact: subtle outlines only
normal: group clusters on candidate focus
advanced: explicit group detail panel
```

Do not always render full group explanation.

## 14. Schema Migration Risk

Risk:

Docs changed from count-first to group-first; old sample/schema may not match.

Fix:

Before implementation, align:

```text
docs/32-zod-schema-spec.md
docs/33-official-animal-starter-deck.md
samples/animal-starter.deck.json
```

Animal starter roles should be rewritten as group-backed normal roles.

## 15. What Must Change Before Coding Role Engine

Required clarifications:

```text
add WinEvaluationMode
add WaitContext
make normal win_role group-backed
separate extended role span from normal rules
update sample deck role examples
update schema docs to include groups
add tests for ron hand size and tsumo hand size
```

## Final Decision

The current design is not safe to implement as-is unless these fixes are applied.

The safe path:

```text
normal MVP = 9 tiles, 3 groups, group-backed win roles
extended variant = later, span-based roles behind separate mode
```

Do not implement count-only normal win roles as the main MVP model.
