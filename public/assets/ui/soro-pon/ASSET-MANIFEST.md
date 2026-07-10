# Asset Manifest — Soro-pon Skin Packages

## Current Implementation

The flat `asset-slots.json` system has already been replaced by skin packages.

```text
public/assets/ui/soro-pon/
  SKIN-MANIFEST.json
  SKIN-CONTRACT.json
  skins/base/
  skins/yorunoshirube/
  skins/cute-pop/
```

Current implemented foundation includes:

```text
versioned official skin registry
base / yorunoshirube / cute-pop manifests and token files
runtime SkinProvider and fallback resolution
slot-based asset URL resolution
basic SkinSurface rendering
CSS/SVG fallback with all asset files still null/placeholder
```

## Source of Truth

```text
docs/DESIGN-SYSTEM.md
docs/SKIN-SYSTEM.md
docs/SKIN-AUTHORING-GUIDE.md
docs/ASSET-PIPELINE.md
public/assets/ui/soro-pon/SKIN-CONTRACT.json
```

## Current Placeholder State

All registered asset slots currently remain placeholders. The application must remain fully usable through tokens and CSS/SVG fallback.

Future image targets are the `status: "placeholder"` slots in each skin manifest, constrained by `SKIN-CONTRACT.json`.

## Reviewed Asset Flow

Before image production begins, each skin package must have:

```text
generated/candidates/
generated/final/
```

Production flow:

```text
1. create/generate an asset for a registered slot
2. save it under generated/candidates
3. connect it in preview/Component Gallery
4. check target screens and required viewport sizes
5. obtain human approval
6. move the approved file to generated/final
7. set the skin slot file and status to final
8. run validation, tests, typecheck, build, and screenshots
```

Never generate directly into `generated/final`.

## Current Foundation Boundary

During the current multi-skin foundation phase:

```text
do not generate final PNG/WebP assets
do not fill placeholder slots with unreviewed art
complete shared components/renderers/contracts/validation first
prepare slot-specific asset requests and future prompts
```

## Permanent Rules

```text
components know slot IDs, not image paths
screens do not resolve files or implement nine-slice directly
layout, hit areas, state, and text never depend on images
text is not baked into images
shared deck JSON contains no skin/image fields
future installed skins cannot execute code or load external URLs/fonts
existing IP and unclear-license material are forbidden
```

## Current Render Support vs Target

Currently implemented in `SkinSurface`:

```text
cover
contain
stretch
repeat
nine-slice stretch
overlay
```

Required next contract expansion:

```text
nine-slice tile
three-slice-x
three-slice-y
repeat-x / repeat-y
mask/tint renderer
separate borderWidth from source slice
candidate status and directory validation
```

Do not describe these next modes as implemented until code and tests are added.

## Final Decision

The multi-skin package system is active, but artwork is intentionally still placeholder-only. Finish the reusable skin foundation before beginning reviewed candidate asset production.