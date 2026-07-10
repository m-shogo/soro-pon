# Soro-pon Implementation Guide

## Purpose

This guide tells implementation agents how to proceed from the current repository state.

Always read first:

```text
docs/MASTER-SPEC.md
docs/IMPLEMENTATION-WORKFLOW.md
docs/SKIN-FOUNDATION-HARDENING.md
```

## Current State

```text
Gameplay MVP phases 1-14: implemented
Multi-skin runtime baseline: implemented / partial
Current work: skin-foundation hardening H1 -> H11
Final PNG/WebP generation: blocked until every P0 gate passes
```

Already implemented:

```text
skin package registry and contract baseline
base / yorunoshirube / cute-pop packages
manifest/token parsing and inheritance/fallback
SkinProvider reload-free runtime switch
basic SkinSurface render modes
initial shared component slot integration
pure skin/package tests
```

Do not restart project/schema/engine setup and do not create a second theme system.

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
-> validated skin presentation
```

UI and skins must not reimplement game rules.

## Mandatory UI Read

```text
docs/DESIGN-SYSTEM.md
docs/SKIN-SYSTEM.md
docs/SKIN-FOUNDATION-HARDENING.md
docs/UI-COMPONENT-CONTRACT.md
docs/SKIN-AUTHORING-GUIDE.md
docs/DESIGN-IMPLEMENTATION-POLICY.md
docs/ASSET-PIPELINE.md
docs/48-responsive-crisp-ui-system.md
docs/49-ui-quality-gate-and-codex-design-rules.md
docs/50-pro-ui-production-quality-checklist.md
```

## Existing Skin Baseline — Preserve and Extend

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

Do not replace this with a parallel theme library or skin-specific screens.

## Required Implementation Order

### H1 — Explicit typed token allowlist

Replace broad `--sp-*` acceptance with a token-definition table.

Separate:

```text
immutable structural tokens
skinable semantic/component presentation tokens
```

External skins must not control spacing, touch size, typography size, line height, z-index, layout, pointer behavior, or arbitrary motion duration.

Validate values by type/range, not only character pattern.

### H2 — Full skin contract validator and CI

Expose:

```bash
pnpm skin:validate
```

Validate schema, version, IDs, inheritance, trust-level file type, file existence, byte budgets, actual image dimensions, slice/safe-area geometry, minimum render size, render-mode permission, and candidate/final status rules.

Add it to CI after implementation.

### H3 — Semantic contrast and Cute Pop correction

Add explicit semantic foreground/focus tokens.

Fix:

```text
primary CTA contrast
focus ring contrast
category-band text contrast
warning/info/success readability
```

Use light/dark category foreground selection rather than one fixed text color.

### H4 — Skin selection

Implement shared:

```text
SkinSelector
SkinPreviewCard
loading/failure/default states
```

Add both Component Gallery and normal user-facing selection paths.

Switch without reload and preserve gameplay/editor/UI state.

### H5 — Layered SkinSurface and real nine-slice proof

Separate:

```text
fallback
skin image
visual overlay
content
state overlay
focus
```

Never apply opacity/blend to the content layer.

Separate source slice from rendered border width.

Prove `panel.paper.default` and `button.primary.background` using reviewed test assets before broad image production.

### H6 — Complete only proven render modes

Central renderers may add with tests and Gallery examples:

```text
repeat-x / repeat-y
nine-slice-tile
three-slice-x / three-slice-y
mask/tint
```

Do not implement them in individual screens.

### H7 — Shared component and CSS responsibility migration

Priorities:

```text
IconButton
Dialog
SectionHeader
ValidationIssueList
FormField/TextField/NumberField/SelectField/Toggle
EmptyState/ErrorState
SkinSelector/SkinPreviewCard
normalized state overlays
```

Split mixed CSS into foundations/components/layouts/screens/motion and use cascade layers to block skin-to-layout leakage.

### H8 — DOM, accessibility, and recovery

Add component/interaction tests after dependency/ADR decision.

Complete:

```text
Modal focus entry/trap/return and labeling
Tabs keyboard model and panel relationships
Tile selected/emphasis ARIA state
AppErrorBoundary
recoverable ErrorState
invalid/missing entity fallback
visible local data reset with confirmation
light/dark browser color-scheme switching
```

### H9 — Playwright visual regression and five-size QA

Minimum:

```text
all screens at 844x390
major screens at all five sizes
Component Gallery in both official skins
```

Review sizes:

```text
844x390
852x393
932x430
1024x600
1366x768
```

### H10 — Installed/paid skin hardening

Before distribution:

```text
external PNG/WebP-only default
reviewed official SVG only
versioned/content-hashed asset URLs
preload required assets
atomic switch or keep previous skin
package identity/integrity/upgrade/rollback/uninstall rules
no execution privileges
```

### H11 — Match record idempotency before restore/replay

Before adding restore/replay/resend:

```text
persistent matchSessionId
recent processed ID set
injected timestamp/ID for pure recording builder
backward-compatible storage migration
```

## Image Production Boundary

Do not generate final images during H1-H9.

After all P0 gates pass and the user explicitly starts asset production:

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
-> add slot only for new visual responsibility
-> define render/geometry/safe-area/fallback
-> support base + both official skins
-> add Gallery and tests
-> responsive/visual verification
-> screen integration
```

A feature working in one skin only is incomplete.

## Verification Commands

Current:

```bash
pnpm typecheck
pnpm test
pnpm build
```

Required after H2:

```bash
pnpm skin:validate
```

Required after H8/H9 according to ADR:

```text
component/DOM tests
Playwright flow and screenshot tests
```

## Commit Policy

```text
one purpose per commit
small testable changes
push after commit
docs and implementation together
finish one H item before moving to the next
```

## Completion Before Image Production

```text
all P0 items in SKIN-FOUNDATION-HARDENING complete
typecheck/test/build/skin:validate green
both official skins selectable without reload
state preserved during switch
contrast accepted
real nine-slice proof accepted at five sizes
candidate-first asset workflow ready
```

## Final Decision

Continue the existing skin foundation from H1. Do not create another theming system, do not begin broad/final image generation, and do not change game behavior while migrating presentation.
