# Architecture Boundaries

## Purpose

This document defines ownership boundaries so implementation does not become tangled.

Soro-pon should be built from tested domain facts outward.

```text
schema -> validation -> engine -> insight -> UI
```

## Core Rule

No layer should secretly re-implement another layer.

If a UI component needs a rule answer, add that answer to an engine or selector output.

## Layer Ownership

| Layer | Owns | Must Not Own |
|---|---|---|
| schema | external JSON shape, strict parsing | gameplay decisions, score calculation |
| validation | deck feasibility, import safety, warnings | match state mutation, UI layout |
| engine | rules, groups, candidates, waits, scoring, match reducer | React state, CSS, DOM, local images |
| insight | short factual summaries from engine facts | best-move advice, hidden strategy |
| storage | local persistence, recovery, migrations | rule evaluation, UI decisions |
| UI | rendering, layout, interaction, accessibility | role completion, score calculation, wildcard assignment |
| assets | app-owned trusted visuals | user deck rules, remote image trust |

## Forbidden Cross-layer Behavior

### UI must not

```text
calculate canRon/canTsumo
calculate score
assign wildcard meaning
decide selectedWinRole
parse imported JSON manually
read unknown imported fields
mutate match state during preview
implement role matching in components
```

### Engine must not

```text
read DOM
depend on React
load images
read localStorage directly
show user-facing HTML
know CSS density modes
```

### Validation must not

```text
silently rewrite deck behavior
change scores without notice
turn count-only roles into group-backed roles automatically
trust unknown fields
```

### Import must not

```text
preserve unknown fields
load remote URLs
accept images/base64/file paths
commit deck before preview and validation
```

### Storage must not

```text
crash app boot on corrupt data
skip Zod parsing on read
store shared JSON image data
store object URLs as permanent data
```

## Data Flow

### Import flow

```text
file size check
JSON parse
unsafe key scan
strict Zod parse
reference validation
rule feasibility validation
score budget validation
UX validation
preview
commit as draft/playable/playableWithWarnings
```

### Match analysis flow

```text
match state
current hand/discard context
analyzeHand
rankCandidates
analyzeWaits
buildBoardInsights
UI render
```

### Result flow

```text
completed candidate
selectWinRole
apply bonuses
calculateScore
ResultBreakdown
UI render result
```

## Side Effects

Pure functions:

```text
parse after raw input is converted
validateDeckProject
analyzeHand
partitionHand
resolveWildcards
rankCandidates
analyzeWaits
analyzeDiscardImpact
buildBoardInsights
calculateScore
applyMatchAction
```

Allowed side effects:

```text
file picker in UI layer
localStorage read/write in storage layer
IndexedDB image storage later in image storage layer
DOM rendering in UI layer
```

## Dependency Direction

Allowed:

```text
ui -> engine
ui -> storage
storage -> schemas
engine -> domain
engine -> validation types
schemas -> domain-compatible output
```

Forbidden:

```text
engine -> ui
engine -> storage
schemas -> ui
validation -> ui components
storage -> engine mutation
```

## Error Ownership

```text
schema errors: malformed or unknown data
validation errors: deck cannot safely play
engine errors: invalid action or impossible state
UI errors: rendering/interaction issue
storage errors: persistence/recovery issue
```

Use stable error codes from `docs/ERROR-CODES.md` once implemented.

## Final Decision

Keep the engine boring, pure, and deterministic.

Keep the UI expressive, but not rule-smart.
