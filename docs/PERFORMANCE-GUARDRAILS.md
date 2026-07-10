# Performance Guardrails

## Purpose

Soro-pon must remain responsive with custom decks, mobile landscape UI, and future image-based skins.

## Engine Targets

Development targets:

```text
single hand analyze: <= 50ms typical
single discard preview: <= 80ms typical
normal import validation: <= 300ms typical
match UI: 60fps where possible
```

These are development targets, not guaranteed production benchmarks.

## Engine Limits

```ts
export const ENGINE_LIMITS = {
  maxTileDefinitionsWarning: 200,
  maxTotalTileInstancesWarning: 300,
  maxVariantsWarning: 4,
  maxWinRolesPerVariantWarning: 100,
  maxBonusesPerVariantWarning: 100,
  maxCandidateOutput: 50,
  maxPrimaryCandidates: 3,
  maxPrimaryInsights: 2,
  maxWildcardBranches: 256,
  maxPartitions: 500,
  maxImportJsonBytes: 512 * 1024,
  warnImportJsonBytes: 256 * 1024,
} as const;
```

If analysis is capped, return an explicit warning. Never silently pretend no candidates exist.

## Analysis Controls

```text
natural groups before wildcard-heavy groups
candidate/wildcard/partition caps
primaryCandidates and hiddenCandidateCount separated
normal UI output remains small
advanced/debug output may show cap metrics
```

## Import Performance

Before expensive feasibility analysis:

```text
byte check
JSON parse
unsafe-key/depth scan
strict schema parse
```

Do not deeply validate huge unsafe input.

## UI Performance

```text
no heavy blur on every tile
no constant glow on all controls
no large SVG filters across many items
no uncompressed huge background images
no analysis on continuous pointer movement without throttle
no whole-app transform scale
```

## Skin Package Budgets

The contract/validator is the final source for exact values. Initial limits include:

```text
manifest and token byte limits
per-asset byte limit
whole-skin byte limit
maximum intrinsic image dimensions
maximum slice values
```

`pnpm skin:validate` must use actual filesystem bytes and actual image dimensions, not manifest declarations alone.

## Skin Rendering Performance

Required:

```text
skin decoration uses pointer-events:none layers
state/content/focus remain ordinary HTML/CSS
nine-slice renderer is centralized
avoid duplicate decoded versions of the same asset
avoid large transparent padding
avoid animating background-size/filter on many tiles
reduced-motion disables nonessential animation
```

Use PNG for small crisp transparent assets and WebP where it materially reduces larger atmosphere assets without harming required quality.

## Skin Switching Performance

Before installed/paid skin distribution:

```text
versioned or content-hashed asset URLs
preload only required visible assets
avoid downloading every future effect at startup
apply tokens/assets atomically
keep previous skin if required preload fails
prevent stale request from replacing newer selection
avoid repeated uncontrolled fetch loops
```

Target behavior:

```text
no blank screen
no mixed-skin flash
no large layout shift
no gameplay/editor state reset
```

## Image Production Performance Rules

Before final approval:

```text
crop unused transparent area
respect slot intrinsic size
avoid assets larger than contract requires
verify both standard and high-density proof where needed
measure total package budget
review low-end/common phone behavior
```

Do not create 1x/2x variants for every image without measured need.

## Visual Regression Stability

For screenshot tests:

```text
fix deterministic data and viewport
reduce/disable motion
stabilize fonts
delay until required skin assets load
mask timestamps and other dynamic content
```

## Dev Instrumentation

Engine may expose:

```ts
type AnalyzerMetrics = {
  roleCount: number;
  groupCount: number;
  partitionCount: number;
  wildcardBranchCount: number;
  candidateCount: number;
  durationMs?: number;
  capped: boolean;
};
```

Skin loader may expose development-only metrics:

```text
manifest/token load duration
required asset preload duration
asset count and bytes
fallback count
failed asset count
stale request cancellation
```

Do not show noisy metrics in normal player UI.

## Tests

Required structural tests:

```text
candidate output cap warning
wildcard branch cap warning
too many roles warning
large unsafe import rejects before deep validation
primaryCandidates maximum
skin file/total byte budgets
skin dimension limits
stale skin load cannot overwrite newer selection
failed required asset keeps previous/fallback skin
```

Avoid flaky strict wall-clock CI assertions unless the environment is controlled.

## Final Decision

Fast and honest beats exhaustive but frozen. For skins, visually rich must not mean heavy, flashing, state-resetting, or unrecoverable.
