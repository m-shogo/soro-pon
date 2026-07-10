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
Multi-skin foundation: in progress
Already implemented: package manifests/contracts, loader/validation/fallback, SkinProvider runtime switch, basic SkinSurface, three official package entries
Remaining: renderer expansion, token/component migration, Gallery/user selector, validator CLI, full-screen regression
Final PNG generation: later separate reviewed phase
```

Do not restart from project/schema/engine setup unless fixing an identified defect.

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

## Architecture Direction

```text
schemas/domain
-> validation/engine
-> app orchestration/storage
-> UI
```

UI and skins must not reimplement game rules.

## Mandatory UI Read

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

## Existing Skin Baseline — Preserve and Extend

Already present:

```text
public/assets/ui/soro-pon/SKIN-MANIFEST.json
public/assets/ui/soro-pon/SKIN-CONTRACT.json
public/assets/ui/soro-pon/skins/base
public/assets/ui/soro-pon/skins/yorunoshirube
public/assets/ui/soro-pon/skins/cute-pop
src/ui/skins/*
SkinProvider in App.tsx
basic core-component asset-slot connections
skin core/package tests
```

Do not replace this with a second parallel theme system.

## Next Implementation Order

### 1. Re-audit Current Baseline

```text
run tests/typecheck/build
inventory remaining hardcoded visual values
inventory repeated generic UI
confirm current package/manifest validation behavior
capture current screenshots
```

### 2. Complete Render Contract

Current renderer supports:

```text
cover
contain
stretch
repeat
nine-slice stretch
overlay
```

Add centrally, only when tested:

```text
nine-slice tile
three-slice-x
three-slice-y
repeat-x / repeat-y
mask/tint
separate source slice from rendered borderWidth
candidate asset status/path
```

Do not implement these independently in screens.

### 3. Complete Token Architecture

Migrate toward:

```text
Primitive -> Semantic -> Component tokens
```

Add cascade-layer protection and separate structural/layout values from skin-changeable values.

Installed/paid skins may use only allowlisted semantic/component token data, never arbitrary CSS.

### 4. Complete Shared Component Migration

Priorities:

```text
IconButton
Dialog
ValidationIssueList
SectionHeader
FormField/TextField/NumberField/SelectField/Toggle
EmptyState/ErrorState
SkinSelector/SkinPreviewCard
normalized Tile/state overlays
```

Remove repeated generic screen-local markup only after shared replacements are tested.

### 5. Expand Component Gallery

Add:

```text
instant yorunoshirube/cute-pop switching
all variants and semantic states
long Japanese/English strings
large scores and long names
compact and regular density
```

Review sizes:

```text
844x390
852x393
932x430
1024x600
1366x768
```

### 6. Define User-facing Skin Selection

Provide a normal application path to select a skin without reload.

Requirements:

```text
safe local persistence
unknown/corrupt ID recovery
no gameplay/editor state mutation
clear preview and selected state
```

### 7. Complete Skin Validation Command

Expose:

```bash
pnpm skin:validate
```

It must check:

```text
manifest/contract schema
known version/token/slot IDs
inheritance cycles/depth
safe file names
file existence and byte budget
image dimensions
slice/safe-area geometry
candidate/final path rules
all official packages
```

### 8. Full-screen Migration and Regression

Connect every existing screen through shared components/tokens/skin resolver without changing behavior.

Verify both skins on major screens and required sizes.

Add visual screenshot regression after the dependency/ADR decision.

### 9. Foundation Completion

```text
all tests green
typecheck green
build green
skin validation green
both official skins work without final PNGs
all reusable UI represented in Gallery
manual QA updated
future asset requests and prompts complete
```

## Later Asset Production Phase

Only after foundation completion and explicit instruction:

```text
generate/draw
-> generated/candidates
-> preview and screenshot review
-> human approval
-> generated/final
-> manifest update
```

Never generate directly into `final`.

## New Feature Rule

```text
reuse shared component
-> add central reusable variant/component
-> add semantic/component tokens
-> add asset slot only for a new visual responsibility
-> define render/geometry/safe-area/fallback
-> support base + both official skins
-> add Gallery coverage
-> responsive/visual verification
-> screen integration
```

## Verification Commands

Currently:

```bash
pnpm typecheck
pnpm test
pnpm build
```

Target after validator implementation:

```bash
pnpm skin:validate
```

## Commit Policy

```text
one purpose per commit
small testable changes
push after commit
docs and implementation together
```

## Final Decision

Continue the existing multi-skin foundation. Do not create another theming system, do not begin final image generation, and do not change game behavior while migrating UI presentation.