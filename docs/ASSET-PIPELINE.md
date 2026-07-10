# Soro-pon Asset Pipeline

## Purpose

This document defines how assets move from a registered skin slot to a reviewed production file.

Read first:

```text
docs/DESIGN-SYSTEM.md
docs/SKIN-SYSTEM.md
docs/SKIN-AUTHORING-GUIDE.md
```

## Current Rule

The current skin-system foundation phase does not generate final artwork.

It creates:

```text
skin packages
asset slots
geometry/render contracts
CSS/SVG fallback
asset requests
future generation prompts
candidate/final acceptance flow
```

## Workflow

```text
1. implement shared component and layout with fallback
2. register asset slot in the skin contract
3. define geometry, render mode, safe area, and budget
4. write asset request and generation prompt
5. generate/draw only in a later explicit production phase
6. save output to generated/candidates
7. connect in Component Gallery/preview
8. review states and screen screenshots
9. approve and move to generated/final
10. update skin manifest and ownership record
11. run skin validation, tests, typecheck, build, and screenshots
12. commit and push
```

Never generate directly into `final`.

## Package Locations

```text
public/assets/ui/soro-pon/skins/<skin-id>/generated/candidates/
public/assets/ui/soro-pon/skins/<skin-id>/generated/final/
```

Official initial skin IDs:

```text
yorunoshirube
cute-pop
```

## Slot Contract

Components reference registered slot names only.

```text
no hardcoded image paths
no screen-owned file resolution
no image-dependent layout
no image-dependent hit area
missing file -> inherited/base/CSS/SVG fallback
```

Slot and geometry contracts belong in the skin system manifest/contract files and TypeScript slot registry.

Each slot records:

```text
purpose
used components/screens
target file
status
render mode
intrinsic size and pixel density
transparency
slice/border/repeat settings when relevant
content/crop safe area
minimum/maximum render size
focal point when relevant
file-size budget
fallback behavior
```

## Render Classes

```text
nine-slice/three-slice surfaces
- buttons, panels, dialogs, cards, frames

cover/contain backgrounds
- table and screen atmosphere

overlays
- ink, lantern light, result burst, state decoration

mask/tint assets
- simple reusable icons and ornaments

repeat textures
- paper, wood, dots, small patterns
```

Rendering is centralized in shared Skin renderers.

## Asset Requests

Location:

```text
docs/asset-requests/
```

Each request must include:

```text
skin ID
slot ID
target file
purpose
used by
render mode
size/format/transparency
slice/safe-area/crop contract
visual direction
must avoid
fallback
acceptance checklist
generation prompt for later use
```

## Manifest and Ownership

Every final asset records:

```text
file path
skin ID
slot ID
purpose
source/author/tool
license/ownership
production-safe status
review date
used components/screens
```

Candidate files are not production-approved assets.

## Formats

Preferred:

```text
SVG: simple icons, ornaments, lines
PNG: transparent frames and crisp effects
WebP: large backgrounds/atmosphere when suitable
HTML/CSS: readable text and semantic state
```

Forbidden:

```text
text baked into images
remote runtime assets
external URL references
base64 blobs in JSON/CSS
user-uploaded SVG
unclear-license files
existing IP art
```

## Fallback

Every slot must work without an image.

Examples:

```text
missing panel frame -> token surface + CSS border/shadow
missing table image -> gradient background
missing tile ornament -> code-drawn tile
missing result burst -> CSS glow/static emphasis
missing icon -> app-owned SVG or text/emoji fallback
```

Fallback must preserve all interaction and state meaning.

## Optimization and Budgets

Initial guidance:

```text
whole skin recommended <= 5 MB
single background <= 2 MB
normal UI image <= 512 KB
maximum image dimensions normally <= 2048x2048
```

Before final approval:

```text
crop unused transparent area
remove unnecessary metadata
choose practical dimensions
prefer WebP for large opaque/atmosphere art
keep PNG for crisp transparency
verify phone memory and decoding cost
```

## Source Safety

Allowed:

```text
original project assets
approved generated candidates after human review
Figma/Aseprite exports for this project
licensed assets with recorded proof
```

Forbidden:

```text
random web downloads
unclear-license material
existing IP art
remote hotlinks
personal photos
user-deck images promoted into official skin art
```

## Design Targets

Design target screenshots are reference material only.

They may guide:

```text
composition
spacing
hierarchy
mood
screenshot comparison
```

They are not automatically approved runtime backgrounds or sprites.

## Validation

The skin validator must check at least:

```text
known slot and render mode
safe file name
file existence
image size/bytes
slice values inside image bounds
safe areas and minimum render size
no external URL
manifest/contract compatibility
```

## Final Decision

Missing artwork never blocks a functional UI. New artwork enters through a registered slot, is tested as a candidate, and becomes final only after human review.