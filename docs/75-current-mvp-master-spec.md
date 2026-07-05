# Current MVP Master Spec

## Purpose

The docs have grown large and some older docs contain superseded ideas.

This document is the current implementation entry point.

If another document conflicts with this one, this document wins unless a newer numbered master spec explicitly replaces it.

## Read This First

Implementation agents should start here, then read only the linked current source docs needed for the task.

Do not start from older count-first or span-first docs.

## Current Product Target

Soro-pon is a local-first custom tile game inside the Vamp-pon world.

MVP focuses on:

```text
3-4 players
custom decks
local-only images later
shared JSON without images
normalThreeGroups rules
safe deck creation
clear role/wait/scoring explanation
landscape-first UI
```

Not MVP:

```text
online multiplayer
full extendedRoleSpan engine
remote image loading
paid power
arbitrary custom rule code
```

## Current Rule Core

Normal MVP is fixed:

```text
hand before draw: 8 tiles
hand after draw: 9 tiles
winning hand: 3 groups x 3 tiles
ron hand: 8 hand tiles + discarded tile = 9 tiles
tsumo hand: 9 tiles after draw
pon/chi/kan: none
2-player match: not supported
```

## Current Evaluation Modes

```text
normalThreeGroups: current MVP engine target
extendedRoleSpan: schema-reserved / engine pending
```

Do not implement normal MVP through extendedRoleSpan logic.

## Current Data Shape

Current shared deck JSON uses:

```text
version
id
name
description
categories[]
tiles[]
activeVariantId
variants[]
```

Current variant uses:

```text
ruleConfig
scoreBudget
winRoles[]
specialBonuses[]
scoreBonuses[]
```

Deprecated for new implementation:

```text
mixed roles[]
points on win_role
span on normal win_role
count-only normal win_role
roleSpanMin/roleSpanMax in normal variant
image fields in shared JSON
unknown imported fields
```

## Current Role Model

Normal win roles must be group-backed.

Allowed group types:

```text
sameTile
sameCategory
sameTag
specificSet
freeSet with caution
```

Normal winRole must have:

```text
kind = win_role
basePoints
requiredGroups
allowWildcard
maxWildcards
priority
explanation
canTsumo or canRon
```

Bonus rules:

```text
special_bonus cannot win alone
ScoreBonus cannot win alone
only selectedWinRole gives basePoints
other matching winRoles do not stack basePoints
```

## Current Scoring Model

Use additive scoring:

```text
totalPoints = selectedWinRole.basePoints
            + appliedSpecialBonuses
            + appliedScoreBonuses
```

Use `scoreBudget` for validation and UX warnings.

Do not silently clamp score.

If future score cap is applied, the result screen must explain it.

## Current Wildcard Model

MVP defaults:

```text
multiple wildcards may exist in hand
one win_role can use max 1 wildcard by default
one group can use max 1 wildcard by default
discarded wildcard cannot trigger ron by default
wildcard can complete win_role if allowed
wildcard assignment is candidate-specific
wildcard assignment is not permanent before final result
```

## Current Import Contract

Import is strict allowlist-based.

Shared JSON may only contain deck rules and safe portable display metadata.

Forbidden:

```text
images
imageUrl
imageBase64
filePath
blobUrl
remote URLs
html
style
script
code
plugins
saveData
progress
coins
collection
settings
unknown fields
```

Unknown fields are rejected, not preserved.

Imported decks are not official/trusted.

## Current Image Policy

MVP shared JSON contains no images.

Future local images:

```text
local-only
not exported
not imported from JSON
sanitized before storage
fallback to emoji/text if missing
```

User SVG upload is forbidden in MVP.

Remote image loading from user decks is forbidden.

## Current Deck Creator Policy

Theme freedom is allowed.

Structural freedom is restricted.

Default editor mode should use safe templates:

```text
3 same-category groups
3 different category groups
specific 3-tile set + 2 category groups
3 same-tile groups
simple special bonus
capped duplicate ScoreBonus
```

Draft decks may be invalid.

Only playable/playableWithWarnings decks may start matches.

## Current UX Policy

The game must not guess player intent.

It should show facts:

```text
can win
one tile away
which group is incomplete
what discard changes
why action is blocked
what wildcard means in this candidate
```

Do not show commands:

```text
best move
correct discard
you should aim for
```

## Current UI Policy

Soro-pon is landscape-first.

Design basis:

```text
844x390 reference
phone landscape fits 100svw x 100svh
PC uses centered game table + outer support
portrait shows rotate prompt or limited utility
```

UI must follow existing design targets and component gates.

Do not make a generic white web app.

## Current Source Docs

Use these for implementation truth:

```text
docs/62-mahjong-structure-scoring-core.md
docs/63-typescript-engine-implementation-blueprint.md
docs/64-breaking-risk-review-and-fixes.md
docs/65-group-backed-schema-override.md
docs/66-group-backed-mvp-test-override.md
docs/67-current-implementation-source-of-truth.md
docs/68-custom-deck-robustness-guardrails.md
docs/69-adversarial-custom-deck-patterns.md
docs/70-deck-rules-and-scoring-law.md
docs/71-scoring-budget-and-image-security.md
docs/72-score-budget-schema-and-defaults.md
docs/73-safe-deck-creator-rules-and-tips.md
docs/74-strict-import-contract-and-edit-boundary.md
samples/animal-starter.deck.json
```

Use these for UI design gates:

```text
docs/48-responsive-crisp-ui-system.md
docs/49-ui-quality-gate-and-codex-design-rules.md
docs/50-pro-ui-production-quality-checklist.md
docs/design-targets/generated/soro-pon-landscape-vampon-ui-v1/README.md
```

Use these for Vamp-pon references:

```text
docs/42-shared-vampon-source-policy.md
docs/44-vampon-character-generation-gate.md
docs/45-vampon-reference-gate.md
/Users/m-shogo/Developer/personal/vamp-pon/docs/shared-vampon-master-index.md
```

## Superseded Areas

Older docs may contain useful background but are superseded where they conflict.

Known superseded ideas:

```text
count-only normal win roles
roles[] mixed array as primary shape
normal role span logic
points field on win_role
minPlayers/maxPlayers for MVP
image references in shared deck JSON
UI first implementation
```

## Correct Implementation Order

```text
1. package setup
2. domain ID/tile/category/variant types
3. strict Zod schemas from current docs
4. animal starter parse test
5. import unsafe key scan tests
6. deck validation tests
7. group enumeration
8. 9-tile partitioning
9. wildcard group resolution
10. normal win role matching
11. tsumo 9-tile check
12. ron 8+discard check
13. wait context
14. selectedWinRole and scoreBudget validation
15. score breakdown
16. discard preview purity
17. match state reducer
18. CPU minimum policy
19. localStorage recovery
20. UI foundation / component gallery
21. full screens
```

## Hard Blocks Before Full Match UI

Do not start full Match UI until these pass or are tracked as pending tests:

```text
animal starter strict parse
unsafe import fields rejected
normalThreeGroups schema tests
3-group partition tests
sameCategory/specificSet group tests
wildcard max tests
tsumo 9-tile tests
ron 8+discard tests
special_bonus cannot win tests
ScoreBonus cannot win tests
scoreBudget validation tests
score breakdown tests
custom deck adversarial fixtures
```

## Final Decision

This is the current MVP implementation master spec.

When in doubt:

```text
normal MVP = group-backed 3x3
strict import
safe deck creator
score budget warnings
local-only images
engine first, UI second
```
