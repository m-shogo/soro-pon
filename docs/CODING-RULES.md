# Coding Rules

## Purpose

This document defines code-level rules that prevent architectural drift.

If a rule conflicts with convenience, follow the rule and update docs only with a clear reason.

## Global Rules

```text
TypeScript strict mode
no implicit any
no unknown data without narrowing
no silent catch without issue code
no custom rule code from user input
no hidden mutation in analysis functions
```

## Engine Rules

Engine code must be pure and deterministic.

Forbidden inside `src/engine`:

```text
React imports
DOM access
localStorage/sessionStorage
fetch/XMLHttpRequest
Date.now directly
Math.random directly
window/document/navigator
CSS imports
image loading
console logging in core functions
```

Use injected dependencies:

```ts
type EngineRuntime = {
  now?: () => number;
  rng?: Rng;
};
```

MVP default:

```text
Engine functions should not need now() except diagnostics.
Shuffle/CPU tie-break uses seeded RNG.
```

## UI Rules

Forbidden inside `src/ui`:

```text
manual score calculation
manual win detection
manual wildcard assignment
manual import parse
manual candidate ranking
mutation of MatchState outside applyMatchAction
```

Allowed:

```text
render engine outputs
call engine public APIs
hold UI-only selection/hover/preview state
map issue codes to copy
```

## Schema Rules

```text
all external JSON uses Zod strict objects
unknown fields rejected
unsafe key scan before Zod parse for imports
schema output must match domain-compatible types
```

Do not use:

```text
z.any for imported payloads
passthrough on imported deck objects
catchall for user deck data
```

Exception requires ADR.

## Type Rules

Use branded IDs where useful:

```ts
type TileId = Brand<string, 'TileId'>;
type TileInstanceId = Brand<string, 'TileInstanceId'>;
```

Do not pass raw strings around when the domain distinction matters.

## Error Rules

```text
validation/engine/storage errors use stable code
UI copy may change, codes should not
invalid gameplay action returns ok:false, not thrown
programmer invariant may throw in tests/dev only
```

## Randomness Rules

```text
no Math.random in engine
seed stored in MatchState
shuffle uses seeded RNG
CPU tie-break uses seeded RNG
replay can reconstruct actions
```

## Time Rules

```text
no Date.now in engine logic
UI animation may use time APIs
storage timestamps may use injected or adapter-owned time
```

## Import Rules

```text
never preserve unknown imported fields
never sanitize unsafe fields and continue silently
never convert imageUrl to local image
never accept scripts, style, html, url, src, href, filePath, blobUrl
```

## Storage Rules

```text
all reads parse through schema
corrupt data recovers
shared export excludes local images
object URLs are never persisted
```

## CSS / UI Rules

```text
tokens first
no random one-off colors
component primitives before screen-specific widgets
focus-visible state required for interactive controls
44px touch target target where practical
no whole-app transform scale
```

## Test Rules

```text
every new engine function gets unit tests
every new validation code gets code assertion tests
every import security rule gets fixture test
bug fix gets regression test
```

## File Naming

Use purpose-based names:

```text
analyzeHand.ts
calculateScore.ts
validateDeckProject.ts
parseDeckImport.ts
```

Avoid vague names:

```text
utils.ts
helpers.ts
common.ts
misc.ts
logic.ts
```

## Dependency Rules

See `docs/DEPENDENCY-POLICY.md`.

## Final Decision

If code feels convenient but violates boundaries, the convenience is a bug.
