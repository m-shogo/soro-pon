# Soro-pon Implementation Guide

## Purpose

This guide tells implementation agents how to proceed from the current repository state.

Always read first:

```text
docs/MASTER-SPEC.md
docs/IMPLEMENTATION-WORKFLOW.md
```

## Current State

```text
Gameplay MVP phases 1-14: implemented
Current next phase: multi-skin design-system foundation
Final PNG generation: later separate reviewed phase
```

Do not restart from package/schema/engine setup unless fixing an identified defect.

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

Major dependencies require `docs/DEPENDENCY-POLICY.md` review and ADR.

## Existing Core Direction

The implemented dependency direction remains:

```text
schemas/domain
-> validation/engine
-> app orchestration/storage
-> UI
```

UI must not reimplement game rules.

## Mandatory UI Read

Before current-phase work:

```text
docs/DESIGN-SYSTEM.md
docs/SKIN-SYSTEM.md
docs/UI-COMPONENT-CONTRACT.md
docs/SKIN-AUTHORING-GUIDE.md
docs/DESIGN-IMPLEMENTATION-POLICY.md
docs/ASSET-PIPELINE.md
docs/48-responsive-crisp-ui-system.md
docs/49-ui-quality-gate-and-codex-design-rules.md
docs/50-pro-ui-production-quality-checklist.md
```

## Current Phase Plan

### S0: Audit and Baseline

```text
inventory screens/components/styles/tokens/assets
record hardcoded visual values
record duplicated generic UI
capture current screenshots
confirm tests/typecheck/build baseline
```

Gate:

```text
no gameplay change
baseline verification recorded
migration list documented
```

### S1: Skin Contract and Package Structure

Create/complete:

```text
SKIN-MANIFEST.json
SKIN-CONTRACT.json
base/yorunoshirube/cute-pop packages
strict manifest schemas
contract versioning
inheritance and fallback rules
```

Gate:

```text
unknown/invalid skin safely falls back
inheritance cycle/depth tests
external URL/path rejection
all official manifests validate
```

### S2: Runtime Switching

Create/complete:

```text
skinRegistry
SkinProvider
useSkin
local selection persistence/recovery
runtime token application
```

Gate:

```text
switch without reload
match/editor state preserved
unknown stored skin recovers safely
```

### S3: Shared Renderers

Create/complete:

```text
SkinSurface
SkinBackground
SkinOverlay
SkinIcon
```

Supported render modes:

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

Gate:

```text
screens do not directly implement border-image/mask/asset URL logic
missing asset uses fallback
geometry contract validation passes
```

### S4: Token Migration

Use:

```text
Primitive -> Semantic -> Component tokens
CSS cascade layers
approved font presets
```

Gate:

```text
no screen hardcoded visual colors/images
skin layer cannot change layout/hit-area properties
both official fallback themes readable
```

### S5: Shared Component Migration

Priorities:

```text
Button/IconButton
Dialog/Modal
SkinSurface/PaperPanel
ValidationIssueList
SectionHeader
shared form fields
Empty/Error states
TileCard state overlays
SkinSelector/SkinPreviewCard
```

Gate:

```text
screen-local generic duplicates removed
all variants/states in Component Gallery
long-text and input-modality cases included
```

### S6: Component Gallery and Skin Preview

```text
instant yorunoshirube/cute-pop switching
all common component states
compact/regular density
long Japanese/English/score/emoji cases
```

Gate:

```text
844x390
852x393
932x430
1024x600
1366x768
```

### S7: Screen Migration

Migrate all existing screens without creating skin-specific screen copies.

```text
TOP
Deck List/Detail/Editor
Tile/Role/Bonus Editor
Match Setup/Match/Result
Collection/Clear Board/Achievement
Import/Export
Dialogs/Rotate Prompt
```

Gate:

```text
same DOM responsibility and behavior in both skins
no image-dependent layout/hit areas
all gameplay flows still work
```

### S8: Skin Validator and Regression Tests

Provide:

```bash
pnpm skin:validate
```

Add tests for:

```text
manifest/schema/version
inheritance/fallback
unsafe path/URL/token
state preservation during switching
all official packages
```

Add Playwright screenshot regression when dependency/ADR decision is approved.

### S9: Foundation Completion

```text
all tests green
typecheck green
build green
manual QA updated
both official skins usable without final PNGs
asset request/generation prompt list complete
no image generation performed
```

## Later Asset Production Phase

Only after S0-S9 completion and explicit instruction:

```text
generate/draw asset
-> generated/candidates
-> preview/screenshots
-> human review
-> generated/final
-> manifest update
```

Never generate directly into final.

## New Feature Rule

After the skin foundation, every new UI feature follows:

```text
shared component check
-> central variant/component
-> tokens
-> optional slot and geometry contract
-> base + both official skins
-> Gallery
-> responsive/visual verification
-> screen use
```

## Verification Commands

```bash
pnpm typecheck
pnpm test
pnpm build
pnpm skin:validate
```

Use repository scripts as the source of exact command names.

## Commit Policy

```text
one purpose per commit
small testable changes
push after commit
docs and implementation together
```

## Final Decision

Current implementation work is not a greenfield MVP build. It is a controlled migration from one working UI to a shared, validated, multi-skin design system without changing game behavior.