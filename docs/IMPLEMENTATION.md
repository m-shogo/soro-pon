# Soro-pon Implementation Guide

## Purpose

This guide tells implementation agents how to proceed without reading every historical document.

Always read `docs/MASTER-SPEC.md` first.

## Current Stack

```text
TypeScript
React
Vite
Zod
Vitest
CSS / CSS Modules
localStorage first
```

Do not add in MVP initial implementation:

```text
Next.js
Supabase
Firebase
Unity
Godot
Phaser
Redux
Zustand
TanStack Query
Tailwind
```

## Implementation Rule

Build from domain facts outward.

Correct direction:

```text
schema -> validation -> engine -> insights -> UI
```

Wrong direction:

```text
pretty UI -> patch rules later
```

## Phase 1: Project Setup

Create:

```text
package.json
vite config
tsconfig
vitest config
src/main.tsx
src/App.tsx minimal
```

Validation:

```text
npm test
npm run build
```

## Phase 2: Domain and Schema

Create:

```text
src/domain/ids.ts
src/domain/tile.ts
src/domain/deck.ts
src/domain/role.ts
src/domain/group.ts
src/domain/candidate.ts
src/domain/score.ts
src/domain/match.ts
src/domain/validation.ts

src/schemas/deckProjectSchema.ts
src/schemas/roleConditionSchema.ts
src/schemas/importSchema.ts
```

Required tests:

```text
animal starter strict parse
scoreBudget required in current schema
unknown fields rejected
image/url/script/html fields rejected
normal win_role without requiredGroups rejected
```

## Phase 3: Deck Validation

Create:

```text
src/engine/validation/validateDeckProject.ts
```

Validation must include:

```text
schema validity
reference validity
rule feasibility
score budget checks
custom deck warnings
import safety
```

Required fixtures:

```text
valid-minimal
no-win-role
bonus-only
impossible-role
wildcard-heavy
duplicate-role
candidate-explosion
category-too-small
score-explosion
large-valid
corrupt-import
```

## Phase 4: Group Engine

Create:

```text
src/engine/groups/enumerateGroups.ts
src/engine/groups/partitionHand.ts
src/engine/wildcards/resolveWildcards.ts
```

Required tests:

```text
sameTile group
sameCategory group
sameTag group
specificSet group
9 tiles -> 3 complete groups
8 tiles cannot be completed normal win
10 tiles cannot be completed normal win
same tile instance cannot be used twice
wildcard fills one missing tile
one group max one wildcard
```

## Phase 5: Role Analysis

Create:

```text
src/engine/roles/matchRole.ts
src/engine/analysis/analyzeHand.ts
src/engine/analysis/analyzeWaits.ts
src/engine/analysis/rankCandidates.ts
src/engine/analysis/explainCandidate.ts
```

Required tests:

```text
completed candidate includes groups
tenpai candidate includes incomplete group
near candidate includes missing group count
bonusOnly cannot win
invalidButExplainable has blocked reason
primaryCandidates capped
hiddenCandidateCount returned
```

## Phase 6: Ron / Tsumo / Scoring

Create:

```text
src/engine/scoring/calculateScore.ts
```

Rules:

```text
tsumo = 9-tile hand after draw
ron = 8 hand tiles + discarded tile
special_bonus cannot win
ScoreBonus cannot win
selectedWinRole is one base role only
```

Required tests:

```text
tsumo 9-tile win
ron 8+discard win
discarded wildcard ron blocked
multiple win roles do not stack
scoreBudget warnings
result breakdown includes selectedWinRole/groups/wildcards/bonuses
```

## Phase 7: Insights and Discard Preview

Create:

```text
src/engine/analysis/analyzeDiscardImpact.ts
src/engine/analysis/buildBoardInsights.ts
```

Rules:

```text
preview does not mutate match state
insights show facts, not commands
normal mode compresses output
beginner mode reduces output
```

Required tests:

```text
discard preview keeps state immutable
breaks candidate insight
keeps wait insight
wildcard used as insight
no best-move wording in insight kinds
```

## Phase 8: Match State Reducer

Create:

```text
src/engine/match/createInitialMatchState.ts
src/engine/match/applyMatchAction.ts
src/engine/cpu/chooseCpuAction.ts
```

Rules:

```text
invalid actions return ok:false and do not mutate
CPU uses same analyzer data as UI
CPU does not use hidden opponent information
```

Required tests:

```text
state transition happy path
invalid discard rejected
invalid ron rejected
CPU deterministic tie-break
round draw when draw pile empty
```

## Phase 9: Storage and Import

Create:

```text
src/engine/import/parseDeckImport.ts
src/storage/*
```

Rules:

```text
strict import allowlist
recursive unsafe key scan
localStorage parsed through Zod
corrupt localStorage recovers safely
```

Required tests:

```text
unsafe fields rejected
unknown fields rejected
current schema missing scoreBudget fails
older safe schema may migrate with notice
corrupt localStorage does not crash
```

## Phase 10: UI Foundation

Before screens, create:

```text
src/ui/styles/tokens.css
src/ui/layout/useResponsiveMetrics.ts
src/ui/primitives/*
src/ui/components/*
src/ui/gallery/ComponentGallery.tsx
```

Do not implement full screens before component gallery.

## Phase 11: Screens

Recommended order:

```text
Deck List
Deck Detail
Deck Editor minimal
Match Setup
Match UI
Result
Collection
```

UI changes require screenshot review sizes:

```text
844x390
932x430
852x393
1024x600
1366x768
```

## Reporting Format

Every implementation commit report should include:

```text
changed files
commit SHA
tests run
build run
remaining risks
```

## Final Decision

If implementation discovers conflict:

```text
update docs/MASTER-SPEC.md or detail doc first
then change code
```
