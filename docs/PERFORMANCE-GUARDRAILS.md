# Performance Guardrails

## Purpose

Soro-pon must remain responsive under custom-deck complexity, mobile
landscape layout, image-based official skins, and long local sessions.
This document separates enforceable structural limits from measurements
that require a named browser/device/artifact.

## Claim Levels

```text
STRUCTURAL
  deterministic cap, size limit, bounded collection, or cleanup rule

AUTOMATED_HOST_MEASURED
  measured in a named CI/development/browser environment

PHYSICAL_DEVICE_MEASURED
  measured on a named real device/browser/build

UNVERIFIED_TARGET
  desired behavior only; not a support claim
```

Never convert a development target into a public device guarantee.

## Current Targets

Development guidance:

```text
single hand analysis: <= 50ms typical on development host
single discard preview: <= 80ms typical on development host
normal import validation: <= 300ms typical on development host
match UI: smooth interaction; 60fps is a goal, not a current device guarantee
```

Physical low-end/common-phone proof remains open. RC stays LIMITED READY
until the intended real-device matrix is measured.

## Engine / Import Structural Limits

The implementation contract is the source of exact values. Expected
limits include:

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

Before expensive analysis:

```text
byte limit
JSON parse
recursive unsafe-key/depth scan
strict schema parse
then feasibility/analysis
```

If analysis is capped, return a stable warning. Never pretend a capped
search found no candidate.

## Analysis Rules

```text
natural groups before wildcard-heavy groups
candidate/wildcard/partition caps
primaryCandidates separated from hiddenCandidateCount
deterministic ranking/tie-breaks
normal UI output remains bounded
advanced/debug output may expose cap metrics
```

Avoid strict wall-clock CI assertions unless the host is controlled.
Structural cap tests are authoritative across ordinary CI variance.

## UI Rendering Rules

```text
no whole-app transform scaling
no expensive filter/blur on every tile
no permanent glow on all controls
no large SVG filters across many nodes
no continuous analysis on pointer movement without throttle/debounce
no unbounded lists of records, notices, or result elements
reduced-motion disables nonessential animation
long-lived effects/listeners/timers require cleanup
```

The 844x390 reference is a layout target, not a fixed raster canvas.

## Skin Package Budgets

`pnpm skin:validate` is authoritative for exact package limits and checks
actual files, not declarations alone:

```text
manifest/token byte limits
per-asset and whole-skin byte limits
allowed file types
actual intrinsic image dimensions
intrinsicSize consistency
slice/safe-area/minimum-render geometry
candidate/final path rules
```

Rendering requirements:

```text
decoration layers use pointer-events:none
content/state/focus remain normal HTML/CSS
slice/repeat/mask renderers are centralized
avoid duplicate decoded copies of identical assets
crop unused transparent padding
avoid animating filter/background-size on many nodes
```

## Skin Switching

```text
versioned/content-hashed asset URLs
preload only required visible assets
atomic apply after required preload
keep previous/fallback skin on failure
stale request cannot replace newer selection
no uncontrolled retry/fetch loop
no screen/editor/match state reset
```

Target behavior is no blank screen, mixed-skin flash, or large layout
shift. Automated coverage proves the recorded environment only.

## Storage / Persistence Performance

Current localStorage payloads are small structured data, not image blobs.

```text
records history is capped
recent idempotency keys are capped
notices are bounded in AppRoot
images remain outside shared JSON
future image blobs must use a reviewed IndexedDB design, not localStorage
```

Recovery operations are best-effort and bounded by the finite known-key
list. Reset includes active values, forensic backup values, and skin
selection; one failed removal does not stop attempts for later keys.

## Export / Object URL Lifecycle

```text
Blob URL is temporary
anchor is attached before click
anchor is removed after click
URL revocation is deferred until after click dispatch
Blob URL is never persisted
```

Batch 11 must verify actual production Firefox/WebKit export behavior.

## Soak / Leak Authority

Historical evidence:

```text
Batch 9: Chromium memory-authoritative dev-server soak
Batch 10: Chromium production-preview soak
Firefox/WebKit: stability only where CDP-equivalent memory authority is absent
```

Rules:

```text
not measured = null/not_available, never 0
state dev server vs production preview vs deployed artifact
state browser/version/commit SHA
never rank browsers using incomparable memory metrics
new code after a soak invalidates current-HEAD leak proof
```

Current storage/AppRoot/import/reset changes require fresh functional
verification. They do not automatically require another hour-long soak
unless verification finds lifecycle changes or release policy requires it.

## Observability / Load Applicability

There is no backend/API. Server RPS, DB pools, distributed tracing, and
HTTP rate limiting are not current performance metrics. Current applicable
controls are client resource caps, deterministic fault tests, browser
flow monitoring, and soak evidence.

See `docs/OPERATIONS-READINESS.md` for future architecture triggers.

## Required Tests

```text
candidate output/partition/wildcard cap warnings
large unsafe import rejection before deep validation
primary candidate maximum
skin byte/dimension/geometry limits
stale skin request protection
failed required preload keeps previous/fallback skin
storage read/write/backup/remove fault handling
local reset attempts every active/backup key and reports partial failure
legacy migration review does not save on first action
production Firefox/WebKit core flow and rotation (Batch 11)
```

## Final Decision

Fast and honest beats exhaustive but frozen. A release claim must identify
whether it is structural, host-measured, or physical-device-measured and
must point to the exact artifact SHA used for the measurement.
