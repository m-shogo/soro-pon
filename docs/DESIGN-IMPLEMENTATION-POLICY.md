# Design Implementation Policy

## Purpose

Claude Code and Fable cannot create final image assets by themselves.

Therefore, Soro-pon design must be implemented as a clear pipeline:

```text
design target images -> coded UI system -> asset request list -> asset integration -> screenshot review
```

The design target images are visual references, not implementation assets.

## Source Of Visual Truth

Current design target folder:

```text
docs/design-targets/generated/soro-pon-landscape-vampon-ui-v1
```

Use these images to match:

```text
composition
spacing
mood
surface hierarchy
panel shape
lighting direction
paper/tile feeling
night desk atmosphere
```

Do not copy them as production sprites unless explicitly approved.

## What Claude Code / Fable Should Implement Directly

These should be implemented in code first:

```text
layout
responsive metrics
screen composition
panels
buttons
tile cards
discard area
hand area
score/result blocks
hover/selected/disabled/focus states
small glows and shadows
text hierarchy
component state matrix
```

Preferred tools:

```text
HTML
CSS / CSS Modules
CSS variables / tokens
inline SVG or SVG components
simple gradients
box-shadow / filter used carefully
React components
```

## What Needs Real Assets Later

These should not be invented poorly by Claude Code.

Create an asset request instead:

```text
night desk background texture
paper grain texture
ink stain overlays
small lantern/light texture
special win burst texture
optional tile back ornament
optional hand-drawn frame slice
optional particle sprites
```

These can be produced later by:

```text
human design work
Figma export
Aseprite
image generation reviewed by human
manual SVG drawing
```

## Asset Classes

### Class A: Code-drawn UI

Use code only.

Examples:

```text
buttons
cards
panels
modals
tab bars
badges
glow rings
focus outlines
selection borders
```

### Class B: SVG UI Assets

Use committed SVG files or React SVG components.

Examples:

```text
simple icons
small ornaments
corner brackets
tile suit/category marks
line dividers
frame accents
```

SVG rules:

```text
app-owned SVG only
no user-uploaded SVG
no SVG from imported decks
prefer currentColor or CSS variables
avoid heavy filters
```

### Class C: Raster Atmosphere Assets

Use PNG/WebP.

Examples:

```text
desk background
paper texture
ink overlay
light bloom
win effect texture
```

Raster rules:

```text
commit only reviewed assets
include source note in asset manifest
keep file size reasonable
no existing IP assets
no remote runtime loading
```

### Class D: Future Local User Images

Not MVP shared JSON.

Rules:

```text
local-only
not exported
not imported from JSON
sanitized before storage
fallback to emoji/text
```

## MVP Design Strategy

MVP should not wait for perfect images.

Priority order:

```text
1. layout accuracy
2. component hierarchy
3. readable typography
4. tile/table touch feel
5. coded shadows/glows
6. simple SVG accents
7. raster atmosphere assets
8. advanced animation / Three.js-style depth
```

## Three.js-style Feeling Without Three.js First

Before adding Three.js, approximate the feeling with:

```text
perspective-like CSS transforms on tiles
subtle translate/scale on draw/discard
layered shadows
radial gradients for lantern light
small CSS particle elements for win emphasis
requestAnimationFrame only where needed
reduced-motion support
```

Do not add Three.js unless:

```text
DEPENDENCY-POLICY allows it through ADR
it is isolated to UI effects
engine/domain/schema do not import it
fallback exists without WebGL
performance budget is still met
```

## Component Gallery Requirement

Before full screens, create Component Gallery with:

```text
button states
panel states
tile states
hand row
discard tile
candidate/insight chip
result score block
modal/import error block
rotate prompt
```

Each component must show:

```text
default
hover where applicable
pressed/active
selected
focused
disabled
warning/error if applicable
compact landscape fit
```

## Screenshot Review Sizes

Use these sizes for review:

```text
844x390
932x430
852x393
1024x600
1366x768
```

## Asset Manifest

When real assets are added, create/update:

```text
public/assets/ASSET-MANIFEST.md
```

Each entry should include:

```text
file path
purpose
source / created by
license / ownership note
safe for production: yes/no
used by components/screens
```

## Forbidden

```text
asking Claude Code to invent final art assets
using generated target image screenshots as production backgrounds without approval
adding remote image URLs
using existing IP artwork
baking text into images
putting user images into shared deck JSON
adding Three.js before ADR/fallback/performance review
```

## Final Decision

Claude Code / Fable implements the design system and layout.

Real artwork is a separate reviewed asset pipeline.
