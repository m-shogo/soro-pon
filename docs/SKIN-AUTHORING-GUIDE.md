# Soro-pon Skin Authoring Guide

## Purpose

This guide defines how future skin assets are designed, generated, reviewed, and integrated without changing layout or gameplay.

The current skin-system foundation phase does not generate final artwork.

## Official References

Yorunoshirube visual references:

```text
docs/design-targets/generated/soro-pon-landscape-vampon-ui-v1/
```

These images are references for composition, hierarchy, spacing, and mood. They are not runtime assets.

Cute Pop must receive its own reviewed design targets before final art production.

## Production Flow

```text
1. coded layout and fallback are complete
2. asset slot and geometry contract are registered
3. asset request is written
4. generation/drawing happens in a separate production phase
5. output goes to generated/candidates
6. asset is connected in preview only
7. Component Gallery and target screens are reviewed
8. five-size review is performed where relevant
9. approved file moves to generated/final
10. manifest and ownership records are updated
11. tests/build/screenshots are run
12. commit and push
```

Never generate directly into `final`.

## Candidate and Final Directories

```text
skins/<skin-id>/generated/candidates/
skins/<skin-id>/generated/final/
```

Candidates may be replaced freely. Final assets require review and manifest updates.

## Asset Request Required Fields

Every future image request must include:

```text
skin ID
asset slot
target file name
purpose
used components/screens
render mode
intrinsic size
pixel density
transparency
slice or crop information
content safe area
minimum render size
visual direction
must avoid
fallback behavior
acceptance checklist
```

## Visual Geometry Contract

Each asset slot must define the geometry needed for safe replacement.

```text
intrinsicSize
pixelDensity
renderMode
slice
borderWidth
stretchModeX / stretchModeY
fillCenter
contentSafeArea
cropSafeArea
opticalBounds
focalPoint
minimumRenderSize
maximumRenderSize
bleed
transparent
fileSizeLimit
```

Only fields relevant to the render mode are required.

## Nine-slice Authoring

Use nine-slice for scalable frames and surfaces.

```text
button frames
paper panels
modals
cards
result frames
input frames
```

Rules:

```text
corners contain non-stretch decoration
edges are designed for stretch or tile
the center supports fill or transparency
slice coordinates remain inside image bounds
minimum render size is at least opposing border widths
content safe area excludes ornaments and heavy texture
```

For 2x artwork, image slice values may be twice the CSS border width.

Example:

```text
image slice: 48px
rendered border width: 24px
```

## Three-slice Authoring

Use three-slice for one-axis components.

```text
three-slice-x: tabs, long buttons, headers, gauges
three-slice-y: vertical rails, long side panels
```

Fixed end caps must not be distorted.

## Background Authoring

Background assets use cover/contain/crop contracts, not nine-slice.

Rules:

```text
keep important decoration inside crop safe area
protect central gameplay contrast
avoid detailed texture behind small text or tiles
provide focal point when composition is asymmetric
review phone landscape and wide PC cropping
```

## Overlay and Effect Authoring

Effects are transparent overlays.

```text
ink stains
lantern bloom
result burst
wildcard glow
score pop
selected/ron/tsumo decoration
```

Rules:

```text
must not affect layout
must not block pointer input
must preserve text readability
must not be required for state understanding
must have a reduced-motion/static fallback
```

## Tile Authoring

Tile artwork is layered.

```text
skin base/front/back
+ HTML/SVG content
+ category indication
+ tile name
+ state overlays
+ focus indication
```

Do not bake dynamic text, emoji, category color, ron/tsumo labels, or selection state into the base image.

## Icon Authoring

Prefer app-owned SVG or tintable masks for simple icons.

```text
use currentColor or registered color token
avoid heavy filters
no embedded external resources
no user-provided SVG
```

Raster icons are allowed only where texture is essential.

## Text and Font Rules

```text
never bake readable UI text into images
never load external fonts from a skin
use approved app-owned font presets only
review long Japanese and English strings
```

## File Formats

```text
SVG: simple icons and ornaments
PNG: crisp transparent frames/effects
WebP: large backgrounds and atmosphere when quality allows
HTML/CSS: all readable text and semantic states
```

## Initial Budgets

```text
whole skin recommended <= 5 MB
background <= 2 MB
normal UI image <= 512 KB
maximum image dimensions normally <= 2048x2048
```

Optimize transparent bounds and remove unused canvas area.

## Safety and Ownership

Allowed:

```text
original project art
approved image generation output
Figma/Aseprite exports created for this project
licensed assets with recorded proof
```

Forbidden:

```text
existing IP art
random web downloads
unclear-license assets
remote hotlinks
external URL references
user-deck images reused as official skin art
personal photos
```

Each final asset must record source, author/tool, ownership/license, review status, and usage.

## Codex/Claude Role

During foundation implementation, Codex/Claude must:

```text
build the receiving system
write asset requests
write slot-specific generation prompts
maintain candidate/final directories and manifests
build preview and validation tools
```

They must not generate final images during that phase.

During a later explicit asset-production phase, an agent may coordinate generation if an approved image-generation tool is available. Generated results still enter `candidates` first and require human review.

## Review Checklist

```text
correct slot and file name
correct dimensions and transparency
safe area respected
corners/edges survive scaling
long text remains readable
all component states remain distinct
no layout or hit-area change
no text baked into image
no IP/licensing issue
fallback still works if file is removed
both compact and regular density checked
```

## Final Decision

A skin asset is replaceable presentation material constrained by a stable geometry contract. Approval never requires changing screen DOM, game rules, hit areas, or responsive layout.