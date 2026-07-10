# Design Implementation Policy

## Purpose

This document defines how Codex, Claude Code, Fable, and human contributors implement Soro-pon design without needing a task-specific prompt.

Read first:

```text
docs/DESIGN-SYSTEM.md
docs/SKIN-SYSTEM.md
docs/UI-COMPONENT-CONTRACT.md
docs/SKIN-AUTHORING-GUIDE.md
docs/ASSET-PIPELINE.md
```

## Current Status

```text
Gameplay MVP phases 1-14: implemented
Next: multi-skin design-system foundation
Final image generation: later separate phase
```

Official skins:

```text
yorunoshirube
cute-pop
```

## Design Pipeline

```text
design targets
-> coded layout and shared components
-> skin contracts and CSS/SVG fallback
-> asset request/generation prompt list
-> candidate assets
-> human review
-> final assets
-> screenshot regression
```

Design targets are references, not production sprites.

## Source of Visual Truth

Yorunoshirube targets:

```text
docs/design-targets/generated/soro-pon-landscape-vampon-ui-v1/
```

Use them for:

```text
composition
spacing
hierarchy
mood
surface shape
paper/tile feeling
lighting direction
night-desk atmosphere
```

Cute Pop requires its own reviewed targets before final image production.

## What Agents Implement Directly

Code-first responsibilities:

```text
layout and responsive behavior
shared component structure
interaction and hit areas
semantic states
Design Tokens
SkinProvider and skin switching
SkinSurface/SkinBackground/SkinOverlay/SkinIcon
nine-slice and other render modes
CSS/SVG fallback
Component Gallery
skin validator
visual regression setup
```

Preferred technologies:

```text
HTML
React
CSS / CSS Modules
CSS variables and cascade layers
inline/app-owned SVG
simple gradients and shadows
```

## What Agents Must Not Invent During Foundation

Do not generate or fake final artwork during skin-system foundation.

Instead create:

```text
asset slot
geometry/render contract
asset request
slot-specific generation prompt
candidate/final directory
fallback appearance
```

Final art is produced in a later explicit asset-production phase.

## Immutable vs Skinable

Immutable:

```text
engine/schema/reducer/storage
DOM responsibility
layout contract
hit areas
tile aspect ratio
responsive behavior
state semantics
focus/accessibility
text meaning
```

Skinable within validation:

```text
color
surface image
texture
border/ornament
shadow/glow
approved font preset
effect texture
```

## Shared Component Requirement

Do not create screen-local generic UI.

```text
buttons -> Button/IconButton
surfaces -> SkinSurface/PaperPanel
confirmations -> Dialog
validation lists -> ValidationIssueList
headers -> SectionHeader
editor fields -> shared form components
empty/error states -> shared components
```

New variants are added centrally and shown in Component Gallery before screen use.

## Render Modes

Use shared renderers only:

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

Screens must not implement `border-image`, mask, or asset URL resolution directly.

## State Layers

Base art and state indication are separate.

```text
base
+ hover/pressed
+ selected
+ focus
+ ron/tsumo
+ disabled
+ content
```

Never bake dynamic text or semantic states into final raster assets.

## Component Gallery

Every reusable component must show relevant states in both official skins.

Minimum states:

```text
default
hover
pressed
focused
selected
disabled
loading
warning/error where relevant
long-text variants
compact landscape fit
```

Review sizes:

```text
844x390
852x393
932x430
1024x600
1366x768
```

## Image and Asset Safety

```text
app-owned SVG only
no user SVG
no remote runtime assets
no text baked into images
no existing IP art
no shared-deck image fields
no external fonts from skins
```

## Three.js Policy

Three.js is not required for normal UI.

Use HTML/CSS first for depth, tile movement, shadows, glows, and particles.

Three.js may be introduced only through ADR when:

```text
isolated to optional UI effects
fallback exists without WebGL
engine/domain/schema remain independent
performance budget is met
```

## New Feature Rule

Every new visual feature must follow:

```text
shared component check
-> shared variant/component
-> semantic/component tokens
-> optional asset slot and geometry contract
-> base + two official skin fallback
-> Component Gallery
-> both-skin/responsive verification
-> screen integration
```

## Forbidden

```text
final image generation during foundation
skin-specific screen copies
screen-local generic buttons/panels
hardcoded PNG paths
hardcoded visual colors in screens
layout controlled by skin
image-controlled click area
arbitrary CSS/JS/external URL in installed skins
```

## Final Decision

Codex/Claude implement one stable UI system and multiple validated skins. Artwork is replaceable presentation material and is never allowed to own layout, behavior, or game logic.