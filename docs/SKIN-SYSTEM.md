# Soro-pon Skin System

## Purpose

This is the current source of truth for switching Soro-pon between multiple visual skins without changing gameplay, rules, layout, or interaction behavior.

Official initial skins:

```text
yorunoshirube
- night desk / paper / black ink / lantern light / memory book

cute-pop
- bright / cute / friendly / pop / clear category colors
```

Future seasonal and paid skins must use this same contract.

Read with:

```text
docs/DESIGN-SYSTEM.md
docs/UI-COMPONENT-CONTRACT.md
docs/SKIN-AUTHORING-GUIDE.md
docs/ASSET-PIPELINE.md
```

## Current Audit Result

Existing implementation already has an asset-slot base and no direct PNG path use in screens.

Current migration targets:

```text
src/ui/styles/tokens.css
- split raw/current visual choices into base + skin-owned semantic/component tokens

src/ui/components/components.css
src/ui/styles/base.css
src/ui/gallery/gallery.css
src/ui/screens/*
- remove remaining hardcoded visual values
- preserve structural layout values

src/ui/assets/*
- expand flat asset slots into skin packages and shared renderers

repeated UI
- confirmation dialogs -> Dialog
- validation issue lists -> ValidationIssueList
- screen headers -> SectionHeader
- raw editor fields -> shared FormField/TextField/NumberField/SelectField
- empty/error states -> shared components
```

## Immutable Contract

Skins cannot change:

```text
src/engine / src/schemas / src/storage / src/domain
screen flow
DOM responsibility
match/editor state
responsive metrics and density selection
match grid contract
button and tile hit areas
tile aspect ratio
hand/discard placement
text meaning
focus/disabled/selected/warning semantics
reduced-motion behavior
```

Images never define layout or click areas.

## Package Structure

```text
public/assets/ui/soro-pon/
  skins/
    base/
      skin.json
      generated/
        candidates/
        final/
    yorunoshirube/
      skin.json
      generated/
        candidates/
        final/
    cute-pop/
      skin.json
      generated/
        candidates/
        final/
  SKIN-MANIFEST.json
  SKIN-CONTRACT.json
```

Runtime code target:

```text
src/ui/skins/
  skinTypes.ts
  skinRegistry.ts
  validateSkinManifest.ts
  resolveSkin.ts
  getSkinAssetUrl.ts
  SkinProvider.tsx
  useSkin.ts
  SkinSurface.tsx
  SkinBackground.tsx
  SkinOverlay.tsx
  SkinIcon.tsx
```

## Trust Levels

```text
official
- shipped and reviewed with the app
- may use app-owned CSS modules and token definitions

installed
- future downloaded/paid skin
- validated data and image assets only
- no arbitrary CSS, JavaScript, HTML, external URL, or external font
```

Installed skins may change only allowlisted design tokens and registered asset slots.

## Manifest Model

```ts
type SkinTrustLevel = 'official' | 'installed';

type SkinManifest = {
  id: string;
  label: string;
  version: number;
  contractVersion: number;
  minAppSkinContractVersion: number;
  maxAppSkinContractVersion?: number;
  trustLevel: SkinTrustLevel;
  author?: string;
  inherits?: string;
  tokens: ValidatedSkinTokens;
  slots: Partial<Record<AssetSlotName, SkinAssetDefinition>>;
  capabilities?: SkinCapabilities;
};
```

Asset definition responsibilities:

```ts
type SkinAssetDefinition = {
  file: string | null;
  status: 'placeholder' | 'candidate' | 'final';
  renderMode:
    | 'nine-slice-stretch'
    | 'nine-slice-tile'
    | 'three-slice-x'
    | 'three-slice-y'
    | 'stretch'
    | 'repeat'
    | 'repeat-x'
    | 'repeat-y'
    | 'cover'
    | 'contain'
    | 'overlay'
    | 'mask';
  intrinsicSize?: { width: number; height: number };
  pixelDensity?: 1 | 2;
  transparent?: boolean;
  slice?: { top: number; right: number; bottom: number; left: number };
  borderWidth?: { top: number; right: number; bottom: number; left: number };
  stretchModeX?: 'stretch' | 'tile' | 'tile-fit';
  stretchModeY?: 'stretch' | 'tile' | 'tile-fit';
  fillCenter?: boolean;
  contentSafeArea?: { top: number; right: number; bottom: number; left: number };
  cropSafeArea?: { top: number; right: number; bottom: number; left: number };
  focalPoint?: { x: number; y: number };
  minimumRenderSize?: { width: number; height: number };
  maximumRenderSize?: { width: number; height: number };
  opacity?: number;
  colorToken?: string;
};
```

The production schema may start narrower, but it must preserve these responsibilities and be versioned.

## Render Modes

Rendering is centralized in shared renderers.

```text
SkinSurface
- nine-slice stretch/tile
- three-slice x/y
- stretch/repeat surfaces

SkinBackground
- cover/contain and focal-point handling

SkinOverlay
- effects and state decoration

SkinIcon
- SVG/currentColor or mask/tint handling
```

Screens must not implement `border-image`, masks, or skin URL resolution directly.

## Inheritance and Fallback

Resolution order:

```text
1. active skin component slot/token
2. active skin general slot/token
3. parent skin
4. base skin
5. CSS/SVG fallback
```

Rules:

```text
maximum inheritance depth: 3
cycle/self-inheritance: reject
missing parent: base fallback
missing slot: inherited/base/code fallback
invalid manifest: reject and use default/base
missing image: fallback without app failure
```

A bad skin must never prevent startup.

## Token Contract

Use three token layers:

```text
Primitive -> Semantic -> Component
```

Installed skins may set only strict allowlisted semantic/component values.

Allowed examples:

```text
approved color values
approved shadow range
approved visual radius range
approved font preset ID
approved motion visual range
registered component tokens
```

Forbidden:

```text
arbitrary selector or CSS text
url()
@import
external font
custom JavaScript
HTML fragment
layout properties
pointer-events
z-index
network request
```

Font choice uses app-owned presets only:

```text
serif
rounded
gothic
display
```

## State Overlay Contract

Do not create a complete replacement image for each state.

```text
base surface
+ selected overlay
+ hover/pressed response
+ focus overlay
+ ron/tsumo overlay
+ disabled treatment
+ content
```

State meaning remains semantic and cannot depend only on color, image, or animation.

## Runtime Switching

Target API:

```ts
const { activeSkinId, setActiveSkin } = useSkin();
setActiveSkin('cute-pop');
```

Rules:

```text
no page reload required
selection may persist in localStorage
unknown/corrupt skin ID -> configured default
skin switch must not reset match/editor/records/achievements/coins
```

## Path and Network Safety

Only simple package-local file names are allowed.

Reject:

```text
/
\
..
:
http:
https:
data:
blob:
```

No runtime remote skin asset loading.

## Capability Declaration

Optional capability metadata:

```ts
type SkinCapabilities = {
  textures?: boolean;
  nineSlice?: boolean;
  customIcons?: boolean;
  resultEffects?: boolean;
  customFontPreset?: boolean;
};
```

Capabilities never grant code execution. Missing capabilities fall back to base.

## Contract Versioning

```text
old skin missing new slot -> base fallback
new unsupported contract -> do not apply; show explanation
slot lifecycle -> active -> deprecated -> removed
skin ID cannot be reused for an unrelated skin
compatible updates preserve user selection
```

## Asset Budgets

Initial guidance:

```text
whole skin recommended <= 5 MB
single background <= 2 MB
normal UI asset <= 512 KB
maximum image dimension normally <= 2048x2048
```

Warn first; convert to hard limits after real-device measurement.

## Validation Command

Provide:

```bash
pnpm skin:validate
```

Validator responsibilities:

```text
strict manifest schema
known contract version
known token/slot IDs
inheritance cycle/depth
file-name/path safety
file existence
image dimensions and byte budget
slice values inside bounds
minimum size compatible with borders
content/crop safe-area validity
no remote URL
all official manifests valid
```

## Official Skin Requirements

Both `yorunoshirube` and `cute-pop` must:

```text
work without final PNG assets
provide CSS/token/SVG fallback
pass skin validation
appear in Component Gallery
support all shared component states
work in compact and regular density
```

## New Feature Gate

```text
1. reuse a shared component
2. add a reusable shared variant if needed
3. add a slot only for a real new visual responsibility
4. define render mode, geometry, safe area, and fallback
5. update base/yorunoshirube/cute-pop
6. add Component Gallery states
7. verify both skins and required sizes
8. then integrate the screen
```

Screen-local generic buttons/panels are forbidden.

## Foundation Phase Boundary

Current work builds the receiving system only:

```text
contracts
registry/provider/runtime switching
inheritance/fallback
shared renderers
shared components
yorunoshirube and cute-pop fallback themes
validator/tests
future asset request and prompt lists
```

Do not invoke image generation or place generated output in `final` during this phase.

## Tests

Minimum:

```text
unknown ID -> default
invalid manifest -> base
missing parent -> base
inheritance cycle/depth rejection
missing slot -> fallback
unsafe path/external URL rejection
unknown token rejection
skin switch preserves game state
skin switch preserves disabled/selected component state
local selection recovery
all official manifests validate
```

## Final Decision

A skin is validated presentation data. It never contains game code and never controls layout, hit areas, engine behavior, records, or network access.