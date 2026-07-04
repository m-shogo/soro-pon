# Adversarial Custom Deck Patterns

## Purpose

This document lists many custom deck patterns that can break Soro-pon if not handled.

Implementation should turn these into validation tests, engine tests, or editor warnings.

Related docs:

```text
docs/65-group-backed-schema-override.md
docs/66-group-backed-mvp-test-override.md
docs/68-custom-deck-robustness-guardrails.md
```

## 1. No Win Path

Pattern:

```text
Deck has tiles and bonuses, but no winRoles.
```

Expected:

```text
error: cannot start match
```

## 2. Bonus-only Deck

Pattern:

```text
Deck has specialBonuses and scoreBonuses only.
```

Expected:

```text
error: no winRoles
```

## 3. Impossible Category Role

Pattern:

```text
winRole needs three sameCategory groups of category A, but category A has only 6 tile instances.
```

Expected:

```text
error: role impossible from tile counts
```

## 4. Impossible Specific Set

Pattern:

```text
specificSet requires tileIds A/B/C, but C does not exist.
```

Expected:

```text
schema/reference error
```

## 5. Too Few Total Tiles

Pattern:

```text
3 players need 8 tiles each, but deck has fewer than 24 tile instances plus draw pile margin.
```

Expected:

```text
error or strong warning depending threshold
```

## 6. Category Too Small

Pattern:

```text
Category exists but has only 1-2 tile instances total.
```

Expected:

```text
warning: cannot form normal 3-tile group naturally
```

## 7. Category Too Broad

Pattern:

```text
Almost every tile belongs to same category.
```

Expected:

```text
warning: roles may be too easy and candidates may be noisy
```

## 8. Same Role Different Score

Pattern:

```text
Two winRoles have identical requiredGroups but different basePoints.
```

Expected:

```text
strong warning or error: duplicate role conflict
```

## 9. Same Role Different Name

Pattern:

```text
Two roles are mechanically identical but named differently.
```

Expected:

```text
warning: duplicate condition may confuse players
```

## 10. Same Name Different Rule

Pattern:

```text
Two roles have same name but different requiredGroups.
```

Expected:

```text
warning: name conflict
```

## 11. Wildcard-only Feasible Role

Pattern:

```text
Role cannot be completed naturally, only with wildcard.
```

Expected:

```text
warning: wildcard-dependent role
```

## 12. Wildcard Flood

Pattern:

```text
Wildcard tile instances exceed 15% of deck.
```

Expected:

```text
warning or error depending threshold
```

## 13. Wildcard Completes Everything

Pattern:

```text
Most winRoles allow wildcard and need only one missing flexible condition.
```

Expected:

```text
warning: wildcard may flatten role identity
```

## 14. Too Many Near Candidates

Pattern:

```text
Normal hands often produce more than 20 near candidates.
```

Expected:

```text
warning: candidate explosion estimate high
engine: cap primary display and return hiddenCandidateCount
```

## 15. FreeSet Abuse

Pattern:

```text
winRole requires freeSet x3, meaning almost any 9 tiles win.
```

Expected:

```text
warning or error: too broad win condition
```

## 16. Easy Role Huge Score

Pattern:

```text
simple sameCategory x3 role gives 999 points.
```

Expected:

```text
warning: high score for easy role
```

## 17. Hard Role Tiny Score

Pattern:

```text
specific exact groups with low probability give 5 points.
```

Expected:

```text
info/warning: hard role may feel unrewarding
```

## 18. Too Many Bonuses

Pattern:

```text
One result can apply 10+ bonuses.
```

Expected:

```text
warning: result breakdown may be noisy
```

## 19. Bonus Looks Like Win Role

Pattern:

```text
specialBonus has a name like Ultimate Win but cannot win.
```

Expected:

```text
warning: bonus name may confuse players
```

## 20. ScoreBonus Without Cap

Pattern:

```text
ScoreBonus can apply repeatedly with no maxPoints.
```

Expected:

```text
warning or error depending repeat behavior
```

## 21. Long Role Name

Pattern:

```text
Role name is too long for match UI.
```

Expected:

```text
warning: display may truncate
```

## 22. Long Category Name

Pattern:

```text
Category name is too long for tile card.
```

Expected:

```text
warning: display may truncate
```

## 23. Similar Colors

Pattern:

```text
Several categories use near-identical colors.
```

Expected:

```text
warning: visual distinction weak
```

## 24. Color-only Meaning

Pattern:

```text
Categories rely only on color and have no label/icon.
```

Expected:

```text
warning: accessibility issue
```

## 25. Duplicate Tile Names

Pattern:

```text
Different tileIds share the same name.
```

Expected:

```text
warning: display ambiguity; engine still uses tileId
```

## 26. Duplicate Fallback Labels

Pattern:

```text
Many tiles share same one-character fallback label.
```

Expected:

```text
warning: low visual clarity without images
```

## 27. Unknown Active Variant

Pattern:

```text
activeVariantId does not exist.
```

Expected:

```text
schema error
```

## 28. Unsupported Evaluation Mode

Pattern:

```text
evaluationMode unknown.
```

Expected:

```text
schema error
```

## 29. Extended Mode Used As Normal

Pattern:

```text
normal label but evaluationMode extendedRoleSpan.
```

Expected:

```text
warning or error: label/mode mismatch
```

## 30. Normal Role Uses Span-only Fields

Pattern:

```text
normal winRole uses span and count-only condition but no requiredGroups.
```

Expected:

```text
schema error for new implementation
```

## 31. Group Count Mismatch

Pattern:

```text
normal rule says groupCount 3, but winRole requiredGroups sum to 4.
```

Expected:

```text
error
```

## 32. SpecificSet Wrong Size

Pattern:

```text
specificSet has 2 or 4 tileIds.
```

Expected:

```text
schema error
```

## 33. SameTile Impossible

Pattern:

```text
sameTile group required, but no tile has 3 copies.
```

Expected:

```text
error if role impossible, warning if role only wildcard-feasible
```

## 34. Too Many Copies Of One Tile

Pattern:

```text
One tile has 20 copies and dominates draws.
```

Expected:

```text
warning: draw distribution may be boring
```

## 35. Too Many Tile Definitions

Pattern:

```text
300 tile definitions with 1 copy each.
```

Expected:

```text
warning: hard to form groups; analyzer may be noisy
```

## 36. No Simple Beginner Role

Pattern:

```text
All roles are highly specific and rare.
```

Expected:

```text
warning: first game may feel impossible
```

## 37. Too Many Easy Roles

Pattern:

```text
Almost every 9-tile hand wins.
```

Expected:

```text
warning: game may lack tension
```

## 38. Role Requires Wildcard Category

Pattern:

```text
winRole requires sameCategory wildcard groups.
```

Expected:

```text
error or strong warning: wildcard category should not be normal role category
```

## 39. Ron With Discarded Wildcard

Pattern:

```text
Discarded wildcard completes another player's hand.
```

Expected:

```text
blocked by default; explain reason
```

## 40. Tsumo With Own Wildcard

Pattern:

```text
Player draws wildcard and completes one group.
```

Expected:

```text
allowed if role/wildcard policy allows; assignment shown
```

## 41. Two Wildcards In Hand

Pattern:

```text
Hand has two wildcards, role needs both.
```

Expected:

```text
invalidButExplainable by MVP default
```

## 42. Wildcard In Bonus Only

Pattern:

```text
Wildcard completes specialBonus but no winRole exists.
```

Expected:

```text
bonusOnly; cannot win
```

## 43. Discard Preview Complete-to-Wait

Pattern:

```text
Current 9-tile hand is complete, but user selects a tile to discard.
```

Expected:

```text
preview says current complete shape breaks; resulting 8-tile wait shown if any
```

## 44. Preview Mutation Bug

Pattern:

```text
Hover/long press preview changes hand order or wildcard assignment permanently.
```

Expected:

```text
test failure; preview must be pure
```

## 45. CPU Uses Hidden Info

Pattern:

```text
CPU avoids discarding tile because hidden opponent hand could ron.
```

Expected:

```text
forbidden in MVP; CPU uses own analyzer only
```

## 46. CPU Random Non-determinism

Pattern:

```text
Same state produces different CPU action in tests.
```

Expected:

```text
error; seeded deterministic tie-break required
```

## 47. Import With Images

Pattern:

```text
Deck JSON includes imageUrl or local file path.
```

Expected:

```text
reject official shared import
```

## 48. Huge JSON

Pattern:

```text
Imported JSON is extremely large.
```

Expected:

```text
reject or warn by size limit before expensive validation
```

## 49. Unknown Future Version

Pattern:

```text
schemaVersion newer than app supports.
```

Expected:

```text
reject with explanation
```

## 50. Old Version Migration

Pattern:

```text
old count-first schema imported.
```

Expected:

```text
migrate only if safe; otherwise reject with explanation
```

## 51. LocalStorage Corrupt

Pattern:

```text
localStorage contains partial JSON.
```

Expected:

```text
app boots with safe fallback and recoverable error
```

## 52. Empty Deck List

Pattern:

```text
user has no decks.
```

Expected:

```text
show one primary action: use Animal Starter or create deck
```

## 53. Editor Deletes Last WinRole

Pattern:

```text
user deletes the final winRole.
```

Expected:

```text
allow edit but block match start; show must-fix error
```

## 54. Editor Unsaved Exit

Pattern:

```text
user leaves editor with changes.
```

Expected:

```text
confirm leave or auto-save draft depending design; no silent loss
```

## 55. Unsupported Player Count

Pattern:

```text
user starts 2-player match.
```

Expected:

```text
error: Soro-pon is 3-4 players only
```

## 56. Four Players But Not Enough Tiles

Pattern:

```text
4 players need deal + draw pile but deck is too small.
```

Expected:

```text
error or strong warning before match
```

## 57. Draw Pile Empty Early

Pattern:

```text
draw pile becomes empty before anyone wins.
```

Expected:

```text
round draw result; no crash
```

## 58. Result Has No Selected WinRole

Pattern:

```text
score calculation called with only bonuses.
```

Expected:

```text
error result in dev; cannot create valid win result
```

## 59. Multiple WinRoles Same Score

Pattern:

```text
two roles same basePoints and same wildcard count.
```

Expected:

```text
deterministic tie-break by priority then deck order
```

## 60. All Candidates Hidden

Pattern:

```text
analyzer caps output and primaryCandidates empty.
```

Expected:

```text
show analyzer warning and safe fallback; do not pretend no candidates exist
```

## Implementation Requirement

Create fixtures for at least these groups:

```text
valid-minimal
no-win-role
impossible-role
wildcard-heavy
duplicate-role
candidate-explosion
category-too-small
bonus-only
score-explosion
large-valid
corrupt-import
```

## Final Decision

A custom deck is allowed only if it remains:

```text
parseable
playable
explainable
bounded
recoverable
```
