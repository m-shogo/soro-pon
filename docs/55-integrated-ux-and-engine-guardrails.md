# Integrated UX and Engine Guardrails

## Purpose

Soro-pon has many interacting systems:

- custom deck schema
- role condition grammar
- wildcard handling
- score calculation
- match state machine
- CPU choices
- discard preview
- beginner/advanced display
- collection/progression
- import/export
- UI presentation

This file defines integrated guardrails so these systems do not contradict each other.

## 1. Golden Rule

The engine owns truth.

The UI owns presentation.

The UI must not re-implement rules.

Fixed:

```text
schema validates data
engine analyzes facts
insight layer summarizes facts
UI renders facts
```

## 2. No Hidden Rule Logic in UI

Forbidden in React components:

```text
checking if a role is complete
checking if ron is allowed
assigning wildcard meaning
calculating score
choosing selected win role
changing match phase directly
```

React may only call domain functions and render their results.

## 3. Pure Function First

The core systems should be pure functions before UI.

Required pure functions:

```text
parseDeckProject
validateDeckProject
createInitialMatchState
applyMatchAction
analyzeHand
resolveWildcards
rankCandidates
explainCandidates
sortHandForCandidate
analyzeDiscardImpact
buildBoardInsights
calculateScore
```

## 4. One Source of Candidate Truth

Candidate data should be generated once by the engine.

UI, CPU, discard preview, and result should use the same candidate shape.

Do not create separate candidate logic for:

```text
human UI
CPU
result
collection
```

## 5. Candidate Data Contract

Every candidate should be explicit enough for UI without guessing.

Required fields:

```text
candidateId
roleId
roleKind
state
canRon
canTsumo
scoreEstimate
usedTileInstanceIds
missingConditions
wildcardAssignments
explainReasons
rank
blockedReasons
```

## 6. Match Action Contract

Every player action should go through one action reducer.

Examples:

```text
DRAW_TILE
SELECT_TILE
DISCARD_TILE
DECLARE_TSUMO
DECLARE_RON
PASS_RON
CONFIRM_SORT_HAND
OPEN_DETAILS
```

Only real gameplay actions change match state.

Preview actions must not mutate match state.

## 7. Preview Contract

Preview outputs are separate from match state.

Preview may include:

```text
highlightTileInstanceIds
dimTileInstanceIds
ghostSlots
insightText
impactLevel
candidateDelta
```

Preview must never:

```text
remove tile
assign wildcard permanently
commit discard
change turn
change score
```

## 8. Score Trust Contract

Result score must be reconstructable.

Required breakdown:

```text
selectedWinRole
selectedWinRolePoints
specialBonuses
scoreBonuses
wildcardAssignments
totalPoints
coins
```

No hidden score modifiers in UI.

## 9. Deck Authoring Contract

Deck editor should not allow users to unknowingly create confusing decks.

Show live feedback for:

```text
no win_role
role impossible in variant
role overlaps another role
role depends too much on wildcard
too many roles become close candidates
score outlier
too long role name
missing explanation
```

## 10. Information Hierarchy

Normal play display priority:

```text
1. turn and available action
2. hand and discard area
3. win/ron/tsumo availability
4. top candidate
5. wait or missing condition
6. one or two insights
7. score estimate
8. details link
```

Anything below this should be hidden in compact mode.

## 11. Do Not Over-teach

Good UX explains the board, not the best strategy.

Allowed:

```text
This discard breaks Animal Trio
One tile away: Bird category
This bonus cannot win alone
```

Forbidden:

```text
Best discard
Correct move
You should aim for
```

## 12. Error Recovery

The app should recover from invalid data.

Required:

```text
invalid imported deck shows validation errors
invalid localStorage does not crash boot
unknown schema version is rejected or migrated
missing active variant falls back only after warning
```

## 13. Determinism

Given the same deck, hand, discard, and match state, engine output must be deterministic.

This applies to:

```text
candidate ranking
selected win role
score breakdown
CPU discard tie-break
hidden candidate count
insight order
```

## 14. Logging for Debug

During development, domain functions should be inspectable.

Useful debug outputs:

```text
candidate count before compression
wildcard branch count
ranking tie-break reason
validation warnings
state transition history
```

Do not expose noisy debug logs in normal player UI.

## 15. UI Density Rules for Analysis

Compact:

```text
show top candidate only
show one insight
hide detailed candidate list
hide score math
```

Normal:

```text
show top 3 candidates if space allows
show up to 2 insights
show simple score estimate
```

Desktop:

```text
may show detail panel
must not move required actions outside game table
```

## 16. Implementation Gate

Before adding full Match UI, implementation must have:

```text
Zod schema tests
role analyzer tests
wildcard tests
score tests
state machine tests
discard preview purity tests
insight tests
deck validation tests
```

## Final Decision

Soro-pon should be built from domain facts outward.

Do not make the UI smart.

Make the engine clear, deterministic, tested, and explainable.
