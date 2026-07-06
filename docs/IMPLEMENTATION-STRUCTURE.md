# Implementation Structure

## Purpose

This document fixes the repository implementation structure before code starts spreading.

The goal is to prevent `src/utils` from becoming a dumping ground and to keep rules out of UI components.

## Source Tree

Recommended MVP structure:

```text
src/
  app/
  domain/
  schemas/
  engine/
  storage/
  ui/
  assets/
  test-support/
```

## Directory Responsibilities

### src/app

Owns app wiring only.

```text
routes or screen switching
providers if needed
boot/recovery orchestration
high-level app state composition
```

Must not own:

```text
role evaluation
score calculation
wildcard assignment
import validation logic
```

### src/domain

Owns plain TypeScript types and constants.

```text
ids.ts
tile.ts
category.ts
deck.ts
variant.ts
role.ts
group.ts
candidate.ts
score.ts
match.ts
validation.ts
```

Rules:

```text
no React
no DOM
no localStorage
no Zod side effects
```

### src/schemas

Owns Zod schemas for external data.

```text
deckProjectSchema.ts
roleSchema.ts
ruleConfigSchema.ts
importSchema.ts
migrationSchema.ts
```

Rules:

```text
strict objects
unknown fields rejected
schema output matches domain types
no match-state mutation
```

### src/engine

Owns pure game logic.

```text
engine/groups/
engine/wildcards/
engine/roles/
engine/analysis/
engine/scoring/
engine/match/
engine/cpu/
engine/validation/
engine/import/
```

Rules:

```text
no React
no DOM
no localStorage
no CSS
no image loading
no Math.random directly
no Date.now directly
```

### src/storage

Owns persistence adapters.

```text
storage/localStorageDeckStore.ts
storage/localStorageSettingsStore.ts
storage/recovery.ts
storage/migrations.ts
```

Rules:

```text
read through schema
recover from corrupt payload
no rule evaluation
no permanent object URLs
```

### src/ui

Owns rendering and interaction.

```text
ui/styles/
ui/primitives/
ui/components/
ui/screens/
ui/gallery/
ui/hooks/
```

Rules:

```text
no scoring
no role matching
no wildcard assignment
no manual JSON import parse
no match state mutation except through applyMatchAction
```

### src/assets

Owns app-owned trusted assets and asset metadata.

Rules:

```text
no user deck image imports
no remote URLs from user decks
```

### src/test-support

Owns test-only helpers.

```text
builders/
fixtures/
assertions/
rng/
```

Must not ship user-facing logic.

## Test Tree

Recommended:

```text
src/**/*.test.ts
fixtures/
  decks/
  hands/
  matches/
  imports/
  snapshots/
```

Keep fixtures outside `src` unless bundling is intentionally needed.

## Import Boundaries

Allowed dependency direction:

```text
app -> ui
app -> engine
app -> storage
ui -> engine public API
ui -> storage adapters
engine -> domain
engine -> schemas only where parsing/import requires it
schemas -> domain-compatible output
storage -> schemas
```

Forbidden:

```text
engine -> ui
engine -> storage
engine -> app
schemas -> ui
storage -> engine rule mutation
ui -> schemas directly for gameplay decisions
```

## Anti-patterns

Do not create:

```text
src/utils/game.ts
src/helpers/rules.ts
src/common/doEverything.ts
src/ui/utils/calculateScore.ts
src/components/MatchScreen/ruleLogic.ts
```

If a helper is needed, place it in the owning layer.

## Barrel Exports

Barrel exports are allowed only when they do not hide layer boundaries.

Allowed:

```text
src/domain/index.ts
src/engine/index.ts public API only
src/ui/primitives/index.ts
```

Forbidden:

```text
one global src/index.ts exporting everything
```

## Final Decision

Start narrow.

If code does not have a clear owner, do not create it until the owner is defined.
