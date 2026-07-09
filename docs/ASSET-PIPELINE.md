# Asset Pipeline

## Purpose

Soro-pon should not depend on Claude Code generating artwork.

When the coded UI needs real visuals, implementation should create an asset request instead of inventing low-quality assets.

## Asset Workflow

```text
1. implement coded component/layout first
2. identify visual gap
3. create asset request
4. produce/review asset outside Claude Code if needed
5. commit optimized asset
6. update asset manifest
7. integrate through component tokens/classes
8. run screenshot review
```

## Asset Slot System (implementation contract)

UI components must not hardcode image paths.

```text
- Components reference asset slot names only (src/ui/assets/slots.ts)
- Slot registry: public/assets/ui/soro-pon/asset-slots.json
- Slot table for humans: public/assets/ui/soro-pon/ASSET-MANIFEST.md
- Final PNGs live in public/assets/ui/soro-pon/generated/final/
- Missing PNG -> CSS/SVG fallback keeps UI fully usable
- Swapping art = place file + update asset-slots.json only (no DOM/logic change)
- Layout, hit areas, state, and text never depend on images
```

## Asset Request Location

Use:

```text
docs/asset-requests/
```

Suggested names:

```text
001-night-desk-background.md
002-paper-texture.md
003-ink-stain-overlays.md
004-win-burst-texture.md
005-tile-back-ornament.md
```

## Asset Request Template

```text
# Asset Request: <name>

## Purpose

## Used By

## Required Size / Format

## Visual Direction

## Must Avoid

## Fallback If Missing

## Acceptance Checklist
```

## Required Asset Manifest

When assets are committed, create/update:

```text
public/assets/ASSET-MANIFEST.md
```

Template:

```text
# Asset Manifest

| File | Purpose | Source | License/Ownership | Production Safe | Used By |
|---|---|---|---|---|---|
```

## Formats

Preferred:

```text
SVG for icons, frames, ornaments, lines
PNG/WebP for textures, backgrounds, atmosphere, effect sprites
HTML text for all readable text
```

Avoid:

```text
text baked into images
remote runtime assets
large uncompressed PNGs
SVG from user uploads
base64 blobs in JSON/CSS
```

## Fallback Rule

Every asset-dependent component needs fallback.

Examples:

```text
missing paper texture -> solid token background + subtle CSS noise/gradient
missing tile icon -> emoji/fallbackLabel
missing win burst -> CSS glow and scale animation
missing desk background -> gradient night desk background
```

## Optimization Rule

Before committing raster assets:

```text
crop unused transparent area
export at practical size
prefer WebP for large atmosphere images
keep PNG for crisp small transparent effects
avoid huge multi-megabyte files
```

## Source Safety

Allowed sources:

```text
original handmade assets
approved generated assets
Figma exports created for this project
Aseprite assets created for this project
```

Forbidden sources:

```text
existing IP art
random web image downloads
remote hotlinked images
unclear-license assets
user imported deck images in official assets
```

## Design Target Images

Design target images are references.

They may be used for:

```text
layout matching
spacing matching
mood matching
screenshot comparison
```

They should not be used as production image assets without explicit approval.

## Final Decision

If an asset is missing, build a good fallback and create an asset request.

Do not let missing art block schema/engine/tests.
