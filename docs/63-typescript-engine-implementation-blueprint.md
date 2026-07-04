# TypeScript Engine Implementation Blueprint

## Purpose

This document turns Soro-pon's rule design into a TypeScript implementation blueprint.

It prevents vague implementation by fixing:

- file layout
- type ownership
- function boundaries
- pure engine flow
- schema/domain separation
- test order
- UI integration contract

Related docs:

```text
docs/34-mvp-implementation-prompt.md
docs/51-role-analysis-and-game-feel-ux.md
docs/58-engine-spec-tables.md
docs/62-mahjong-structure-scoring-core.md
```

## 1. Principle

The TypeScript engine must be pure, deterministic, and UI-independent.

```text
React components render results.
React components do not calculate rules.
```

## 2. Recommended File Layout

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

src/engine/groups/enumerateGroups.ts
src/engine/groups/partitionHand.ts
src/engine/wildcards/resolveWildcards.ts
src/engine/roles/matchRole.ts
src/engine/analysis/analyzeHand.ts
src/engine/analysis/analyzeWaits.ts
src/engine/analysis/rankCandidates.ts
src/engine/analysis/explainCandidate.ts
src/engine/analysis/analyzeDiscardImpact.ts
src/engine/analysis/buildBoardInsights.ts
src/engine/scoring/calculateScore.ts
src/engine/match/createInitialMatchState.ts
src/engine/match/applyMatchAction.ts
src/engine/cpu/chooseCpuAction.ts
src/engine/validation/validateDeckProject.ts
src/engine/import/parseDeckImport.ts
```

Do not put rule logic in `src/ui`.

## 3. Branded ID Types

Use string aliases or branded types to avoid mixing IDs.

```ts
export type TileId = string;
export type TileInstanceId = string;
export type CategoryId = string;
export type RoleId = string;
export type PlayerId = string;
export type VariantId = string;
```

MVP can use string aliases first.

The important rule:

```text
TileId is not TileInstanceId.
```

## 4. Tile Types

```ts
export type TileDefinition = {
  id: TileId;
  name: string;
  primaryCategoryId: CategoryId;
  categoryIds: CategoryId[];
  tags: string[];
  copies: number;
  isWildcard?: boolean;
};

export type TileInstance = {
  instanceId: TileInstanceId;
  tileId: TileId;
  ownerPlayerId?: PlayerId;
  location: 'drawPile' | 'hand' | 'discard' | 'revealed' | 'removed';
};
```

Role rules use `tileId` / category / tag.

Match actions use `tileInstanceId`.

## 5. Group Types

```ts
export type GroupType =
  | 'sameTile'
  | 'sameCategory'
  | 'sameTag'
  | 'specificSet'
  | 'freeSet';

export type CandidateGroup = {
  groupId: string;
  groupType: GroupType;
  tileInstanceIds: TileInstanceId[];
  categoryId?: CategoryId;
  tag?: string;
  isComplete: boolean;
  wildcardAssignmentIds: string[];
};
```

Groups are the core of normal 9-tile hand explanation.

## 6. Role Condition Types

```ts
export type RoleCondition =
  | { type: 'allOf'; conditions: RoleCondition[] }
  | { type: 'anyOf'; conditions: RoleCondition[] }
  | { type: 'countByCategory'; categoryId: CategoryId; minCount: number }
  | { type: 'countByTag'; tag: string; minCount: number }
  | { type: 'countByTileId'; tileId: TileId; minCount: number }
  | { type: 'specificTileSet'; tileIds: TileId[]; allowExtra?: boolean }
  | { type: 'distinctCategories'; minCount: number }
  | { type: 'distinctTileNames'; minCount: number }
  | { type: 'duplicateTile'; minCount: number }
  | { type: 'sameCategorySet'; setSize: number }
  | { type: 'sameTagSet'; tag: string; setSize: number };
```

No custom JS in JSON.

## 7. Role Types

```ts
export type WinRoleFamily =
  | 'groupPattern'
  | 'categoryMajority'
  | 'specificCollection'
  | 'allDifferent'
  | 'allSameCategory'
  | 'customTemplate';

export type WinRole = {
  id: RoleId;
  kind: 'win_role';
  name: string;
  family: WinRoleFamily;
  basePoints: number;
  requiredGroups?: GroupRequirement[];
  wholeHandCondition?: RoleCondition;
  allowWildcard: boolean;
  maxWildcards: number;
  priority: number;
  explanation: string;
};

export type SpecialBonus = {
  id: RoleId;
  kind: 'special_bonus';
  name: string;
  points: number;
  condition: RoleCondition;
  allowWildcard: boolean;
  maxWildcards: number;
  explanation: string;
};

export type ScoreBonus = {
  id: string;
  name: string;
  points: number;
  condition: RoleCondition;
  maxPoints?: number;
  allowWildcard: boolean;
  explanation: string;
};
```

## 8. Main Engine Flow

Normal hand analysis flow:

```text
hand tile instances
-> enumerate possible groups
-> partition into 3 groups
-> apply wildcard resolver during group/role matching
-> match win roles against partitions
-> classify completed/tenpai/near/bonusOnly/invalidButExplainable
-> rank candidates
-> explain candidates
-> build insights
```

Do not start from score calculation.

Start from group structure.

## 9. Core Function Signatures

```ts
export function enumerateGroups(input: EnumerateGroupsInput): CandidateGroup[];

export function partitionHand(input: PartitionHandInput): HandPartition[];

export function resolveWildcards(input: ResolveWildcardsInput): WildcardResolution[];

export function analyzeHand(input: AnalyzeHandInput): AnalyzeHandResult;

export function rankCandidates(candidates: HandCandidate[]): HandCandidate[];

export function analyzeWaits(input: AnalyzeWaitsInput): WaitAnalysis[];

export function explainCandidate(input: ExplainCandidateInput): ExplainReason[];

export function analyzeDiscardImpact(input: AnalyzeDiscardImpactInput): DiscardImpactResult[];

export function buildBoardInsights(input: BuildBoardInsightsInput): BoardInsight[];

export function calculateScore(input: CalculateScoreInput): ResultBreakdown;

export function applyMatchAction(state: MatchState, action: MatchAction): MatchActionResult;
```

Every function must return data, not mutate input.

## 10. AnalyzeHandResult Contract

```ts
export type AnalyzeHandResult = {
  candidates: HandCandidate[];
  primaryCandidates: HandCandidate[];
  hiddenCandidateCount: number;
  analyzerWarnings: AnalyzerWarning[];
};
```

`primaryCandidates` is capped for UI.

`candidates` may be capped by analyzer guardrails.

## 11. HandCandidate Contract

```ts
export type HandCandidate = {
  candidateId: string;
  state: 'completed' | 'tenpai' | 'near' | 'bonusOnly' | 'invalidButExplainable';
  winRoleId?: RoleId;
  roleKind?: 'win_role' | 'special_bonus' | 'score_bonus';
  groups: CandidateGroup[];
  usedTileInstanceIds: TileInstanceId[];
  missingRequirements: MissingRequirement[];
  wildcardAssignments: WildcardAssignment[];
  basePoints: number;
  bonusPoints: number;
  totalEstimate: number;
  canRon: boolean;
  canTsumo: boolean;
  rankScore: number;
  explainReasons: ExplainReason[];
  blockedReasons: BlockedReason[];
};
```

UI should not infer candidate meaning from role name.

## 12. Match State Reducer

Use a reducer-like pure function.

```ts
export type MatchActionResult =
  | { ok: true; state: MatchState; events: MatchEvent[] }
  | { ok: false; state: MatchState; error: MatchActionError };
```

Invalid action returns `ok:false` and original state.

Do not throw for normal invalid gameplay actions.

## 13. Events

Use events to drive UI animation.

```ts
export type MatchEvent =
  | { type: 'tileDrawn'; tileInstanceId: TileInstanceId }
  | { type: 'tileDiscarded'; tileInstanceId: TileInstanceId }
  | { type: 'candidateChanged'; candidateIds: string[] }
  | { type: 'ronAvailable'; playerId: PlayerId }
  | { type: 'tsumoAvailable'; playerId: PlayerId }
  | { type: 'roundEnded'; resultId: string };
```

UI animation should react to events, not inspect reducer internals.

## 14. Zod Boundary

Zod is used at external boundaries:

```text
import JSON
localStorage read
deck fixture parse
```

Inside engine, use TypeScript domain types.

Do not run Zod on every engine function call.

## 15. Test Order

Implement tests in this order:

```text
1. schema parses animal starter
2. forbidden image fields fail
3. tileId/tileInstanceId fixture creation
4. enumerate sameTile/sameCategory/specificSet groups
5. partition 9 tiles into 3 groups
6. wildcard fills one missing group tile
7. win_role selected from group partition
8. special_bonus cannot win alone
9. ScoreBonus cannot win alone
10. score breakdown deterministic
11. wait identifies incomplete group
12. discard impact does not mutate state
13. match reducer rejects invalid action
14. CPU uses analyzer output
```

## 16. Performance Guard

Use simple guard constants first.

```ts
export const ENGINE_LIMITS = {
  maxCandidateOutput: 50,
  maxWildcardBranches: 256,
  maxRolesPerVariantWarning: 100,
  maxPrimaryCandidates: 3,
  maxPrimaryInsights: 2,
} as const;
```

If capped, return warning.

Never silently drop candidates without warning.

## 17. UI Integration

React should call selectors/hooks around engine data.

Allowed:

```text
useAnalyzeHand
useBoardInsights
useDiscardPreview
```

Forbidden:

```text
component calculates canRon
component calculates score
component assigns wildcard
component mutates hand order during preview
```

## 18. Build Phase Gate

Before any full Match screen:

```text
src/domain exists
src/schemas exists
src/engine group partition tests pass
src/engine role analysis tests pass
src/engine scoring tests pass
src/engine match reducer tests pass
```

## Final Decision

Implementation must start with types, schemas, and pure functions.

If a UI component needs rule knowledge, add it to the engine output instead of duplicating logic in UI.
