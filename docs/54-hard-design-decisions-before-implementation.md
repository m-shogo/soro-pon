# Hard Design Decisions Before Implementation

## Purpose

This file lists design areas that can break Soro-pon if they are implemented casually.

The goal is to prevent implementation mistakes before Phase 1 and Phase 2 code work.

Related docs:

```text
docs/51-role-analysis-and-game-feel-ux.md
docs/52-role-analysis-test-minimum.md
docs/53-discard-insight-and-beginner-ux.md
```

## 1. Role Condition Grammar

Problem:

User-created roles can become impossible to evaluate if each role is custom code.

Decision:

Roles must be data-driven.

The engine should evaluate a limited condition grammar instead of hardcoded role functions.

Required shape:

```text
allOf
anyOf
countByCategory
countByTag
countByTileId
sameCategory
sameTag
distinctTileNames
duplicateTile
```

Do not allow arbitrary JavaScript role conditions in JSON.

## 2. Role Conflict Resolution

Problem:

Many roles can be true at the same time.

Decision:

The engine returns all valid candidates, but final result selection must be deterministic.

Priority:

```text
1. valid win_role
2. higher score
3. fewer wildcard uses
4. more natural matches
5. larger span
6. lower role priority value
7. deck order
```

UI may show multiple candidates, but scoring must be reproducible.

## 3. Score Stacking Rules

Problem:

If every bonus stacks freely, user decks can explode in score and become unreadable.

Decision:

Score calculation must separate:

```text
selectedWinRole
appliedSpecialBonuses
appliedScoreBonuses
blockedBonuses
```

Each bonus must say whether it can stack.

MVP default:

```text
win_role: choose one selected win role
special_bonus: may stack if conditions are unique
ScoreBonus: capped by maxPoints or validation warning
```

## 4. Duplicate Tile Instances

Problem:

A deck may contain multiple copies of the same tile definition.

Decision:

Always distinguish:

```text
tileId = definition id
tileInstanceId = physical tile in hand/match
```

Role conditions usually use tileId/category/tag.

Match operations must use tileInstanceId.

## 5. Draw / Discard State Machine

Problem:

Bugs appear if UI can discard at the wrong time or win after state changed.

Decision:

Match state must be a strict state machine.

Required states:

```text
setup
deal
turnStart
draw
afterDrawAction
discardSelect
reactionRon
turnEnd
roundEnd
result
```

Actions must validate current state.

## 6. Ron Window Timing

Problem:

Ron timing can be ambiguous after discard.

Decision:

Ron is checked only after a non-winning discard enters the reaction window.

MVP:

```text
reaction order = seat order from next player
multiple ron = first valid candidate only
wildcard discard ron = blocked by default
special_bonus / ScoreBonus cannot create ron
```

## 7. CPU Policy

Problem:

A CPU that is too smart or too random changes the feel.

Decision:

MVP CPU should be understandable, not optimal.

Priority:

```text
1. win if can tsumo
2. ron if allowed in reaction
3. keep tiles used by top completed/tenpai/near candidates
4. keep wildcard if useful
5. avoid discarding tile that breaks top candidate
6. fallback deterministic random
```

CPU must use the same analyzer data as UI.

## 8. Candidate Explosion Control

Problem:

100 roles can generate too many candidates.

Decision:

Engine may compute many candidates, but UI-facing output must be compressed.

Limits:

```text
primaryCandidates: 3
primaryInsights: 2
hiddenCandidateCount: required when compressed
advancedDetails: optional
```

Ranking must be deterministic.

## 9. Performance Budget for Analyzer

Problem:

Wildcard and role combinations can become expensive.

Decision:

Analyzer must have guardrails.

Required limits:

```text
maxRolesPerVariant warning
maxWildcardBranches warning/error
maxCandidateOutput cap
analysisTimeoutMs dev guard
```

If capped, UI must show an analyzer warning instead of silently lying.

## 10. Deck Validation Severity

Problem:

Too many warnings become noise; too few errors allow broken decks.

Decision:

Use severity levels:

```text
error = cannot start match
warning = can play, creator should review
info = quality suggestion
```

Validation must include rule validity and UX readability.

## 11. Beginner vs Advanced Display

Problem:

Beginners need fewer facts; advanced users need detail.

Decision:

Beginner/advanced changes display only, never rules.

Beginner mode:

```text
one top candidate
one wait
one insight
simple score
```

Advanced mode:

```text
top 3 candidates
all waits in detail panel
discard impact table
wildcard alternatives
score breakdown
```

## 12. Undo / Preview Boundary

Problem:

Preview interactions can accidentally mutate match state.

Decision:

Preview data must be pure and reversible.

Forbidden:

```text
hover preview changes hand order
candidate preview fixes wildcard assignment
long press preview commits discard
```

Only explicit confirm actions mutate state.

## 13. Import / Export Compatibility

Problem:

Deck JSON will evolve.

Decision:

Deck schema needs versioning.

Required:

```text
schemaVersion
createdWith
migrations list or migration function boundary
unknown fields rejected for official import
image fields rejected
```

Do not put local image references in shared JSON.

## 14. Local Storage Data Safety

Problem:

Bad localStorage can break app boot.

Decision:

All local data must be parsed through Zod.

If invalid:

```text
preserve broken payload for debug export
fallback to safe starter state
show recoverable error
```

Never crash on boot because of old local data.

## 15. Accessibility and Touch Safety

Problem:

Landscape mobile UI can become hard to tap.

Decision:

Minimum target rules from docs/50 apply.

Additional fixed rules:

```text
discard confirm required for destructive ambiguous action
ron/tsumo buttons must not be near pass without spacing
selected tile must be visually and textually clear
state difference cannot rely on color only
```

## 16. Result Explanation

Problem:

Players will not trust scoring if the result is opaque.

Decision:

Result must show:

```text
selected win role
why it won
wildcard assignments
special bonuses
ScoreBonus items
blocked bonus examples when useful
total score
coins
collection updates
```

Result explanation should be concise first, expandable second.

## 17. Test Gate Before Match UI

Before full Match UI, these must exist as tests or tracked pending tests:

```text
schema parse
deck validation
hand order invariance
candidate classification
wildcard constraints
ron/tsumo eligibility
wait explanation
insight facts
discard preview purity
score breakdown
state machine action validation
```

## Final Decision

Do not start full Match UI until the hard design areas above are represented in types, pure functions, or tests.

Moving slowly here prevents expensive rewrites later.
