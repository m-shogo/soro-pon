# Soro-pon MASTER SPEC

## Purpose

This is the stable entry point for the current Soro-pon product and MVP specification.

Do not use numbered docs as the primary entry point.

If another document conflicts with this file, this file wins unless this file is explicitly updated.

## Current Status

```text
Gameplay MVP phases 1-14: complete
Multi-skin design-system foundation (H1-H11): complete
Official skins: yorunoshirube / cute-pop
Final image generation: active, human-reviewed candidate -> final phase
Current next phase: official asset production and visual completion
```

Current implementation state and commits are tracked in:

```text
docs/IMPLEMENTATION-WORKFLOW.md
docs/ASSET-PRODUCTION-ROADMAP.md
```

## Product Summary

Soro-pon is a local-first custom tile game inside the Vamp-pon world.

```text
3-4 players
custom decks
normalThreeGroups rules
strict import
safe deck creator
score-budget validation
landscape-first UI
one stable component/layout system
multiple visual skins
```

Not current MVP:

```text
online multiplayer
2-player mode
full extendedRoleSpan engine
remote user images
arbitrary custom rule code
paid gameplay power
skin code execution
```

## Non-negotiable Rule Core

```text
hand before draw: 8 tiles
hand after draw: 9 tiles
winning hand: 3 groups x 3 tiles
ron: 8 hand tiles + discarded tile = 9
 tsumo: 9 tiles after draw
players: 3 or 4
pon/chi/kan: none
```

The presentation may reference mahjong-table feel, but the rules remain Donjara-like.

## Evaluation Modes

```text
normalThreeGroups: current implemented MVP engine
extendedRoleSpan: schema-reserved / engine pending
```

Normal MVP must not be implemented through extendedRoleSpan logic.

## Shared Deck JSON

Allowed top-level fields:

```text
version
id
name
description
categories
tiles
activeVariantId
variants
```

Current variant shape:

```text
ruleConfig
scoreBudget
winRoles[]
specialBonuses[]
scoreBonuses[]
```

Deprecated or forbidden for current implementation:

```text
mixed roles[] as primary shape
points on win_role
span on normal win_role
count-only normal win_role
roleSpanMin/roleSpanMax for normal variants
image fields in shared JSON
unknown imported fields
```

## Role Model

Normal win roles must be group-backed.

Allowed group types:

```text
sameTile
sameCategory
sameTag
specificSet
freeSet with caution
```

Normal winRole requirements:

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
only selectedWinRole supplies basePoints
other matching winRoles do not stack basePoints
```

## Scoring

```text
totalPoints = selectedWinRole.basePoints
            + appliedSpecialBonuses
            + appliedScoreBonuses
```

`scoreBudget` is used for validation and UX warnings.

Do not silently clamp score. Any future cap must be explicitly shown in the result breakdown.

## Wildcard

Current defaults:

```text
multiple wildcards may exist in hand
one win role uses max 1 wildcard by default
one group uses max 1 wildcard by default
discarded wildcard cannot trigger ron by default
wildcard assignment is candidate-specific
assignment is not permanent before final result
```

## Import Contract

Import is strict allowlist-based.

Forbidden in shared/imported deck JSON:

```text
images
imageUrl
imageBase64
filePath
blobUrl
remote URL
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

Imported decks are untrusted data.

## Image Policy

Shared deck JSON contains no images.

Future user images, when implemented, are:

```text
local-only
not exported
not imported from shared JSON
sanitized before storage
replaced by emoji/text fallback when missing
```

User SVG and remote image loading are forbidden.

Official UI skin assets are app-owned trusted assets and are separate from user-deck images.

## Safe Deck Creator

Theme freedom is allowed. Structural freedom is restricted.

Safe templates include:

```text
3 same-category groups
3 different-category groups
specific 3-tile set + 2 category groups
3 same-tile groups
simple special bonus
capped duplicate ScoreBonus
```

Draft decks may be invalid.

Only `playable` or `playableWithWarnings` decks may start matches.

## UX Rules

Show facts:

```text
can win
one tile away
which group is incomplete
what a discard changes
why an action is blocked
what a wildcard represents in a candidate
```

Do not command strategy:

```text
best move
correct discard
you should aim for
```

## UI and Layout Contract

Soro-pon is landscape-first.

```text
844x390 reference
phone landscape: 100svw x 100svh
PC: centered game table + outer support
portrait: rotate prompt or limited utility
```

844x390 is a design reference, not a fixed canvas.

Do not scale the entire screen with a single fixed-canvas transform.

## Official Skin Contract

Soro-pon supports at least two official skins:

```text
yorunoshirube
- night desk / paper / black ink / lantern light / memory book

cute-pop
- bright / cute / friendly / pop / clear and readable
```

Future seasonal and paid skins must use the same screen/component/layout implementation.

Skin-specific screen copies are forbidden.

```text
one MatchScreen
one Button
one TileCard
multiple validated skins
```

### Skin-invariant

```text
engine/schema/reducer/storage
screen flow
DOM responsibility
layout/grid/flex rules
hit areas
button minimum sizes
tile aspect ratio
hand/discard placement
responsive density
state meaning
focus/accessibility
text content
reduced-motion behavior
```

### Skin-changeable within validation

```text
colors
surface images
textures
borders and ornaments
shadows and glows
approved font preset
effect textures
motion appearance within shared limits
```

A skin never controls gameplay, records, network access, code execution, click areas, or layout.

## Shared Component Contract

Reusable UI must use shared components.

Examples:

```text
Button / IconButton
SkinSurface / SkinBackground / SkinOverlay / SkinIcon
PaperPanel
Modal / Dialog
Tabs / Badge / Toast / Tooltip
TileCard / TileRow
RoleCard / ScoreBreakdown
SectionHeader
ValidationIssueList
shared form components
EmptyState / ErrorState
SkinSelector / SkinPreviewCard
```

Screen-local generic buttons, panels, dialogs, validation lists, and editor fields are forbidden.

New variants are added centrally and reviewed in Component Gallery before broad use.

## Skin Rendering Contract

Shared render modes:

```text
nine-slice-stretch
nine-slice-tile
three-slice-x
three-slice-y
stretch
repeat / repeat-x / repeat-y
cover
contain
overlay
mask
```

Nine-slice and related image rendering are centralized in shared Skin renderers. Screens do not implement `border-image`, masks, or asset URL resolution directly.

Each slot defines the relevant geometry contract:

```text
intrinsic size
pixel density
slice and border widths
content/crop safe area
minimum render size
focal point
transparency
file-size budget
fallback behavior
```

## State Overlay Contract

Do not create a full replacement image for every state.

```text
base surface
+ hover/pressed response
+ selected overlay
+ focus overlay
+ ron/tsumo overlay
+ disabled treatment
+ content
```

State meaning cannot depend only on color, image, or animation.

## Skin Security and Future Sales

Official and future installed/paid skins are different trust levels.

Installed/paid skins may contain only validated tokens and registered assets.

Forbidden:

```text
arbitrary CSS
JavaScript
HTML
external URL
external font
layout properties
pointer-events
z-index
engine/schema/storage/records access
network access
```

Invalid skins must safely fall back to the default/base skin and must never prevent startup.

## Image Generation Boundary

The skin-system foundation phase (H1-H11) is complete. It built:

```text
skin contracts and switching
shared components
shared renderers
asset slots
geometry/safe-area contracts
CSS/SVG fallback for both official skins
skin validation
asset requests and generation prompts
candidates/final directory structure
```

Asset production is now active:

```text
generate/draw (Codex CLI起点)
-> generated/candidates
-> preview and screenshot review
-> human approval
-> generated/final
```

Never generate directly into `final`. Full slot classification, batch order,
and the current next task: docs/ASSET-PRODUCTION-ROADMAP.md.

## Design References

Yorunoshirube design targets:

```text
docs/design-targets/generated/soro-pon-landscape-vampon-ui-v1/
```

These are references for composition, spacing, hierarchy, and mood. They are not automatically production assets.

## Technical Stack

```text
TypeScript
React
Vite
Zod
Vitest
CSS / CSS Modules
localStorage first
```

Major new dependencies require `docs/DEPENDENCY-POLICY.md` review and ADR.

Normal UI remains HTML/CSS. Three.js is optional only for isolated future effects with fallback and performance review.

## Architecture Boundaries

```text
UI does not implement role/scoring/wildcard logic
engine does not import React/DOM/localStorage/CSS
skin does not access engine/schema/storage/records/network
import remains strict
```

## Current Contract Docs

Core implementation:

```text
docs/GLOSSARY.md
docs/ARCHITECTURE-BOUNDARIES.md
docs/ENGINE-API.md
docs/MATCH-STATE-MACHINE.md
docs/ERROR-CODES.md
docs/TESTING-STRATEGY.md
docs/PERFORMANCE-GUARDRAILS.md
docs/TECHNICAL-RISK-REGISTER.md
docs/MIGRATIONS.md
docs/ADR.md
```

UI/design/skin:

```text
docs/DESIGN-SYSTEM.md
docs/SKIN-SYSTEM.md
docs/UI-COMPONENT-CONTRACT.md
docs/SKIN-AUTHORING-GUIDE.md
docs/DESIGN-IMPLEMENTATION-POLICY.md
docs/ASSET-PIPELINE.md
```

Current status:

```text
docs/IMPLEMENTATION-WORKFLOW.md
```

## New Feature Gate

Any new screen, button, visual state, or component follows:

```text
1. reuse existing shared component
2. add reusable central variant if necessary
3. add semantic/component token
4. add asset slot only for a real new visual responsibility
5. define render/size/safe-area/fallback contract
6. support base + yorunoshirube + cute-pop
7. add Component Gallery coverage
8. verify both skins and required sizes
9. then use in the screen
```

## Superseded Ideas

```text
count-only normal win roles
mixed roles[] as primary shape
normal role-span logic for MVP
points field on win_role
image references in shared deck JSON
UI-first implementation
single permanent visual theme
screen-local generic UI controls
skin-specific screen implementations
```

## Final Decision

When in doubt:

```text
normal MVP = group-backed 3x3
strict import
safe deck creator
score-budget warnings
one stable UI implementation
multiple validated skins
CSS/SVG fallback before final art
human-reviewed candidate -> final asset flow
```