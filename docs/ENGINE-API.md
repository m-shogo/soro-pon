# Engine API Contract

## Purpose

This document defines the public engine functions that UI, CPU, tests, and storage-facing code may use.

The goal is to prevent rule logic from leaking into React components.

## Principles

```text
pure functions first
no DOM access
no React dependency
no localStorage access
no hidden mutation
stable deterministic output
```

## API Surface

### parseDeckImport

```ts
function parseDeckImport(input: ParseDeckImportInput): ParseDeckImportResult;
```

Owns:

```text
file size metadata
JSON parse result
unsafe key scan
strict schema parse
migration notice if applicable
```

Does not own:

```text
match validation
UI commit
local image loading
```

### validateDeckProject

```ts
function validateDeckProject(input: ValidateDeckProjectInput): DeckValidationResult;
```

Owns:

```text
reference validation
rule feasibility
custom deck warnings
scoreBudget warnings
image/security field rejection after parse if needed
```

Output must include:

```ts
type DeckValidationResult = {
  status: 'blocked' | 'draft' | 'playableWithWarnings' | 'playable';
  issues: ValidationIssue[];
};
```

### createTileInstances

```ts
function createTileInstances(input: CreateTileInstancesInput): TileInstance[];
```

Owns:

```text
expanding TileDefinition.count into TileInstance objects
stable deterministic instance IDs for tests when seed is provided
```

### enumerateGroups

```ts
function enumerateGroups(input: EnumerateGroupsInput): CandidateGroup[];
```

Owns:

```text
sameTile groups
sameCategory groups
sameTag groups
specificSet groups
wildcard-assisted groups within limits
```

### partitionHand

```ts
function partitionHand(input: PartitionHandInput): HandPartitionResult;
```

Owns:

```text
9-tile normalThreeGroups partitioning
non-overlapping tile instance usage
partition caps and warnings
```

Output:

```ts
type HandPartitionResult = {
  partitions: HandPartition[];
  warnings: AnalyzerWarning[];
};
```

### analyzeHand

```ts
function analyzeHand(input: AnalyzeHandInput): AnalyzeHandResult;
```

Owns:

```text
candidate creation
candidate classification
candidate ranking
primary candidate compression
hiddenCandidateCount
analyzer warnings
```

Output:

```ts
type AnalyzeHandResult = {
  candidates: HandCandidate[];
  primaryCandidates: HandCandidate[];
  hiddenCandidateCount: number;
  analyzerWarnings: AnalyzerWarning[];
};
```

### analyzeWaits

```ts
function analyzeWaits(input: AnalyzeWaitsInput): WaitAnalysis[];
```

Requires:

```ts
type WaitContext = 'afterDrawNineTiles' | 'afterDiscardEightTiles' | 'ronCheckNineTiles';
```

Owns:

```text
missing group explanation
category/tag/tile wait labels
wildcard wait eligibility
```

### analyzeDiscardImpact

```ts
function analyzeDiscardImpact(input: AnalyzeDiscardImpactInput): DiscardImpactResult[];
```

Owns:

```text
current 9-tile candidate impact
resulting 8-tile wait impact
kept/broken/improved candidate facts
```

Must not mutate match state.

### buildBoardInsights

```ts
function buildBoardInsights(input: BuildBoardInsightsInput): BoardInsight[];
```

Owns:

```text
fact-only insight wording data
priority ordering
beginner/normal/advanced compression
```

Forbidden:

```text
best move
correct discard
you should aim for
```

### calculateScore

```ts
function calculateScore(input: CalculateScoreInput): ResultBreakdown;
```

Owns:

```text
selectedWinRole basePoints
special bonus application
ScoreBonus application
scoreBudget warnings
totalPoints
wildcard assignment display data
```

Does not own:

```text
win detection
UI count-up animation
coin store mutation
```

### applyMatchAction

```ts
function applyMatchAction(state: MatchState, action: MatchAction): MatchActionResult;
```

Owns:

```text
state transition validation
turn progression
draw/discard/ron/tsumo action legality
round end events
```

Output:

```ts
type MatchActionResult =
  | { ok: true; state: MatchState; events: MatchEvent[] }
  | { ok: false; state: MatchState; error: EngineError };
```

Invalid gameplay actions do not throw.

### chooseCpuAction

```ts
function chooseCpuAction(input: ChooseCpuActionInput): MatchAction;
```

Owns:

```text
minimum deterministic CPU choice
uses analyzer output
no hidden opponent information
seeded tie-break
```

## Shared Output Types

### ValidationIssue

```ts
type ValidationIssue = {
  code: string;
  severity: 'error' | 'warning' | 'info';
  path?: string;
  message: string;
  fixHint?: string;
};
```

### AnalyzerWarning

```ts
type AnalyzerWarning = {
  code: string;
  message: string;
  capped?: boolean;
};
```

### EngineError

```ts
type EngineError = {
  code: string;
  message: string;
  action?: string;
};
```

## API Stability Rule

If a UI component needs to know something about rules, add a field to an engine output.

Do not add rule logic to UI.

## Final Decision

The UI should only call these APIs or thin hooks/selectors built around them.
