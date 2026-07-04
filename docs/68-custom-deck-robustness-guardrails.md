# Custom Deck Robustness Guardrails

## Purpose

Soro-pon must not only support the official animal starter deck.

Users may create decks with unusual themes, many categories, few categories, duplicate names, many wildcards, weak roles, impossible roles, or confusing bonuses.

This document defines guardrails for custom decks so the game remains playable and explainable.

## 1. Custom Deck Threat Model

Custom decks can break the game in these ways:

```text
no valid win role
roles impossible to complete
roles too easy to complete
roles all overlap
wildcards complete too much
categories are too broad
categories are too narrow
tile counts cannot support roles
role names are unclear
bonus-only roles look like winning roles
scoring explodes
analyzer candidate count explodes
```

The app must catch these before match start when possible.

## 2. Required Validation Layers

Use three validation layers.

```text
schema validation: shape and references
rule validation: can the deck actually play
ux validation: will humans understand it
```

Only schema validation is not enough.

## 3. Match Start Blocking Errors

Block match start when:

```text
no winRoles in active variant
no tile definitions
not enough total tile instances to deal players
normalThreeGroups without groupSize 3 / groupCount 3
normal winRole without requiredGroups
normal winRole requiredGroups cannot fill 3 groups
required category does not exist
required tileId does not exist
specificSet does not have exactly 3 tileIds
all winRoles are impossible from tile counts
wildcard count exceeds hard cap
active variant uses unsupported evaluationMode
```

## 4. Strong Warnings

Allow play but warn deck creator when:

```text
winRoles count is 1 or 2
many roles use the same requiredGroups
many roles are completed by the same wildcard pattern
one category dominates most tiles
too many categories have fewer than 3 available tile instances
role name is too long
role explanation is missing or too vague
score spread is too wide
one easy role scores much higher than harder roles
candidate explosion estimate is high
```

## 5. Info Suggestions

Non-blocking suggestions:

```text
add another win role
add a simple beginner role
reduce similar role names
add category colors with clearer contrast
add explanation examples
reduce bonus count if result feels noisy
```

## 6. Tile Count Feasibility

For each normal winRole, validation should estimate whether requiredGroups are physically possible.

Examples:

```text
sameCategory mammal count 3 requires at least 9 mammal tile instances for 3 groups
specificSet lion/elephant/giraffe count 1 requires at least one instance of each tileId
sameTile group requires at least 3 copies of one tileId
```

If a role requires 3 sameCategory groups but the deck has only 6 tile instances in that category, error.

## 7. Wildcard Safety

Wildcard must not hide broken design.

Rules:

```text
validate natural feasibility first
then validate wildcard-assisted feasibility separately
```

If a role is only possible with wildcard:

```text
warning: wildcard-dependent role
```

If most roles are only possible with wildcard:

```text
error or strong warning depending on count
```

## 8. Category Design Guardrails

Categories are primary player-facing rule groups.

Guardrails:

```text
category should have enough tiles to form groups
category names should be short
category colors should be visually distinct
wildcard category should not be used as normal role category
```

Tags are secondary and should not dominate beginner roles.

## 9. Role Understandability

Every winRole should be explainable as:

```text
what groups are needed
how many groups are needed
whether wildcard can help
how many points it gives
```

Bad:

```text
Collect many animals
```

Good:

```text
Mammal group x3. A group is any 3 mammal tiles.
```

## 10. Scoring Robustness

Score should remain understandable.

Validation should warn when:

```text
basePoints over 120 for easy normal role
special bonus over 40
ScoreBonus has no maxPoints
more than 5 bonuses can apply to one result
```

MVP scoring remains additive only.

## 11. Candidate Explosion Estimate

Before match start, estimate potential candidate noise.

Signals:

```text
many winRoles
many similar requiredGroups
many wildcard-compatible roles
many broad freeSet roles
many bonus rules
```

If high:

```text
show warning: this deck may show many similar candidates
```

## 12. Role Similarity Detection

Detect exact and near duplicates.

Exact duplicate:

```text
same requiredGroups + same wholeHandCondition
```

Near duplicate:

```text
same group categories with different score
same specificSet with different score
same role name meaning with small text difference
```

Exact duplicate with different score should be strong warning or error.

## 13. Import Flow For Custom Decks

Import order:

```text
parse JSON
reject image fields
schema validation
reference validation
rule feasibility validation
UX warnings
summary preview
import only if no errors
```

Users should see errors before import is committed.

## 14. Deck Editor Live Feedback

Deck editor should run validation continuously but gently.

Show:

```text
errors: must fix before play
warnings: playable but may feel bad
info: improvement tips
```

Do not overwhelm with every issue at once.

Group by:

```text
must fix
balance
clarity
visual/readability
```

## 15. Test Deck Matrix

Implementation should include test fixtures beyond animal starter.

Required fixtures:

```text
minimal valid deck
no win role deck
impossible role deck
wildcard-heavy deck
duplicate role deck
too many similar roles deck
category-too-small deck
bonus-only deck
high-score-easy-role deck
large but valid deck
```

## 16. Large Deck Guardrails

Large decks must not crash analyzer.

Guard constants:

```text
maxTilesWarning: 200 definitions
maxRolesWarning: 100 win roles
maxBonusesWarning: 50 bonuses
maxCandidateOutput: 50
maxWildcardBranches: 256
```

If limits are exceeded, the app should warn and cap analysis where needed.

## 17. Final Rule

Custom deck freedom is allowed only inside a safe rule grammar.

The user can create many themes.

The user cannot create arbitrary code, invisible rules, image-dependent rules, or unexplainable win conditions.

## Final Decision

Before custom deck match start, Soro-pon must prove:

```text
the deck parses
the deck has at least one possible group-backed win role
the deck can be dealt to 3 or 4 players
the deck can explain win, wait, wildcard, and score
```
