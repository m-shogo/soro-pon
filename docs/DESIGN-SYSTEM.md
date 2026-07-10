# Soro-pon Design System

## Status

This is the current source of truth for Soro-pon UI and visual implementation.

Current product state:

```text
MVP gameplay phases 1-14: implemented
Current next phase: skin/design-system foundation
Final PNG generation: not part of the foundation phase
```

Read with:

```text
docs/SKIN-SYSTEM.md
docs/UI-COMPONENT-CONTRACT.md
docs/SKIN-AUTHORING-GUIDE.md
docs/DESIGN-IMPLEMENTATION-POLICY.md
docs/ASSET-PIPELINE.md
```

## Product Visual Goal

Soro-pon must support at least two official visual skins using the same game implementation.

```text
yorunoshirube
- night desk
- aged paper
- black ink
- lantern light
- quiet memory-book mood

cute-pop
- bright
- friendly
- cute and readable
- soft shapes
- clear category colors
- not childish or cheap social-game styling
```

Future seasonal and paid skins must use the same contracts.

## Core Principle

A skin changes presentation, not the game.

```text
One MatchScreen
One Button implementation
One TileCard implementation
One layout contract
Multiple validated skins
```

Never create skin-specific screens such as:

```text
YorunoshirubeMatchScreen
CutePopMatchScreen
```

## Immutable Layout Contract

Skins must not change:

```text
engine / schemas / reducer / validation
screen flow
DOM responsibility
hit areas
button minimum sizes
tile aspect ratio
hand and discard placement rules
responsive breakpoints and density selection
semantic state meaning
focus requirements
accessibility behavior
reduced-motion behavior
text content
```

Images never define click areas.

## Skin-changeable Presentation

Skins may change, within validated ranges:

```text
colors
surface images
textures
borders
ornaments
shadows
glows
tintable icons
approved font preset
motion appearance within shared timing limits
result and wildcard effect textures
```

## UI Architecture

```text
Layout Contract
  -> Shared Components
    -> Structural Tokens
      -> Semantic Tokens
        -> Component Tokens
          -> Skin Asset Slots
            -> State Overlays
```

### Token Layers

Use three token layers.

```text
Primitive
- raw palette, numeric scale, base duration

Semantic
- action.primary
- surface.raised
- text.muted
- border.focus

Component
- button.primary.background
- tile.selected.outline
- panel.default.shadow
```

Skins primarily override semantic and component tokens.

Structural values such as hit areas and tile ratio are not skin tokens.

## Render Modes

All asset rendering must go through shared renderers such as `SkinSurface`, `SkinBackground`, `SkinOverlay`, and `SkinIcon`.

Supported render modes:

```text
nine-slice-stretch
nine-slice-tile
three-slice-x
three-slice-y
stretch
repeat
repeat-x
repeat-y
cover
contain
overlay
mask
```

Screens must not implement `border-image`, masks, or custom asset URL logic directly.

## Nine-slice Contract

Use Unity/Godot-style nine-slice for scalable framed surfaces.

Good targets:

```text
buttons
paper panels
modals
cards
input frames
result frames
notification frames
```

Do not use nine-slice for:

```text
full table backgrounds
ink stains
lantern light
burst effects
small icons
character or tile content art
```

Each nine-slice asset defines:

```text
intrinsicSize
pixelDensity
slice top/right/bottom/left
borderWidth top/right/bottom/left
stretchModeX
stretchModeY
fillCenter
contentSafeArea
minimumRenderSize
```

Corner regions must never be distorted.

## State Overlay System

Do not create a complete replacement image for every state.

Use layered state overlays:

```text
base surface
+ selected overlay
+ hover/pressed response
+ focus overlay
+ ron/tsumo overlay
+ disabled treatment
+ content
```

State meaning must remain visible without relying only on color or animation.

## CSS Structure

Use cascade layers in this order:

```css
@layer reset, tokens, base, components, screens, skin, utilities;
```

The `skin` layer may change visual properties but must not change layout or interaction properties.

Forbidden in skin overrides:

```text
display
position
grid-template
width / height / min-size
pointer-events
z-index
DOM-dependent selectors
```

## Responsive Rules

```text
844x390: primary reference
phone landscape: 100svw x 100svh
PC: centered game table + outer support
portrait: rotate prompt or limited utility
```

Use safe-area environment values at the app shell.

Prefer logical properties such as `padding-inline` and `margin-block`.

Use container queries for reusable cards/panels where component width matters. Do not replace the main game-table layout contract with uncontrolled container queries.

Density is layout-owned, not skin-owned:

```text
compact
regular
```

## Common Interaction Rules

```text
normal target: at least 44px
primary action target: 54px preferred
focus ring cannot be removed by a skin
touch mode does not depend on hover
keyboard mode shows clear focus
gamepad-ready navigation structure must not be blocked
```

## Motion Rules

Motion uses shared tokens.

```text
motion.duration.micro
motion.duration.enter
motion.duration.result
motion.ease.standard
motion.distance.small
motion.scale.press
```

Skins may change visual flavor within allowed ranges, but cannot delay state transitions or block input.

Always support `prefers-reduced-motion`.

## Text Budgets

Each shared component owns a text budget and overflow rule.

Examples:

```text
primary button: up to 2 lines, never baked into an image
tile name: fixed content region and minimum font size
badge: one line with explicit overflow behavior
score: tested with at least 6 digits
```

Component Gallery must include long Japanese, long English, numbers, emoji, empty optional text, and two-line labels.

## Design Targets

Yorunoshirube reference images:

```text
docs/design-targets/generated/soro-pon-landscape-vampon-ui-v1/
```

These are visual references, not runtime assets.

Use them for composition, spacing, hierarchy, mood, and screenshot comparison.

## Foundation Phase: No Final Image Generation

During skin-system foundation work:

```text
do not invoke image generation
do not place generated images in final
do not block implementation on artwork
build both official skins with CSS/token/SVG fallback
record every future image in the skin contract and asset requests
```

Image production is a later reviewed phase.

## New Feature Gate

Every new screen, button, component, or visual state must follow this order:

```text
1. check existing shared component
2. add a shared variant if generally reusable
3. add a new shared component only when responsibility is genuinely new
4. add or extend semantic/component tokens
5. add an asset slot only when code-drawn styling is insufficient
6. define geometry/render/fallback contract
7. add all states to Component Gallery
8. verify yorunoshirube and cute-pop
9. verify compact and regular density
10. add visual regression coverage where appropriate
11. then use it in the screen
```

Screen-local custom buttons and duplicate panels are forbidden.

## Verification

Minimum visual verification:

```text
all screens at 844x390
major screens at 852x393, 932x430, 1024x600, 1366x768
Component Gallery in both official skins
TOP, Deck Editor, Match, Result, Collection in both official skins
```

Use Playwright screenshot regression when introduced. Until then, preserve reviewed screenshots and manual QA records.

## Final Decision

Soro-pon uses one stable layout and interaction system with multiple validated presentation skins.

A new skin must be installable without rewriting screens, changing hit areas, or changing game state.