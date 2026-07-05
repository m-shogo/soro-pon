# Performance Guardrails

## Purpose

Custom decks can create many roles, groups, wildcard branches, and candidate explanations.

This document defines limits so Soro-pon remains responsive and does not silently lie when analysis is capped.

## MVP Targets

Normal match analysis should feel instant on common phones.

Development targets:

```text
single hand analyze target: <= 50ms typical
single discard preview target: <= 80ms typical
import validation target: <= 300ms typical for normal decks
UI frame target during match: 60fps where possible
```

These are development targets, not guaranteed production benchmarks yet.

## Engine Limits

Recommended constants:

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

## Capping Rule

If the engine caps analysis, it must return a warning.

Forbidden:

```text
silently drop candidates
pretend no candidates exist
hide analyzer cap from advanced/debug info
```

Required warning codes:

```text
P8001 candidate output capped
P8002 wildcard branch count capped
P8003 role count above warning threshold
P8004 analysis exceeded target time in dev/test
```

## Candidate Explosion Control

Candidate output should be separated into:

```text
all computed candidates within cap
primaryCandidates for normal UI
hiddenCandidateCount
analyzerWarnings
```

Normal UI displays only:

```text
primaryCandidates <= 3
primaryInsights <= 2
```

Advanced/debug panel may show capped warning and details.

## Wildcard Branch Control

Wildcard resolution order:

```text
natural groups first
one-wildcard groups second
reject groups needing more wildcard than policy
cap branches at maxWildcardBranches
return warning if capped
```

Ranking should prefer natural groups over wildcard-heavy candidates.

## Partition Control

For normal 9-tile hands:

```text
enumerate valid groups
partition into 3 non-overlapping groups
stop if maxPartitions exceeded
return warning if capped
```

MVP should not attempt unbounded exhaustive search for large experimental modes.

## Import Performance

Before deep validation:

```text
check file size
parse JSON
unsafe key scan
strict schema parse
```

Do not run expensive role feasibility analysis on huge unsafe JSON.

## UI Performance

During match:

```text
no heavy blur on every tile
no constant glow on all buttons
no large SVG filters on many tiles
no uncompressed huge background images
no analysis call on every mousemove without throttle
```

Discard preview may be triggered by selection/long press, not continuous pointer movement.

## Dev Instrumentation

During development, engine may expose debug metrics:

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

Do not show noisy metrics in normal player UI.

## Tests

Required tests:

```text
candidate output cap returns P8001
wildcard branch cap returns P8002
too many roles returns P8003
large unsafe import rejects before deep validation
primaryCandidates remains <= 3
hiddenCandidateCount is correct when compressed
capped analysis does not return empty primary output without warning
```

## Final Decision

Fast and honest beats complete but frozen.

If analysis is capped, tell the UI.
