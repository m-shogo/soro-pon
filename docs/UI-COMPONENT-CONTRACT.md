# Soro-pon UI Component Contract

## Purpose

This document prevents screen-local UI duplication and keeps future features compatible with every official and paid skin.

Screens compose shared components. Screens do not invent visual primitives.

## Core Rule

Before adding UI:

```text
reuse existing shared component
-> add reusable variant
-> create a genuinely new shared responsibility
-> add Gallery coverage
-> verify every official skin
-> use in screen
```

Do not start with screen-local CSS.

## Required Shared Components

Current and target shared inventory:

```text
Button
IconButton
SkinSurface
SkinBackground
SkinOverlay
SkinIcon
PaperPanel
Modal
Dialog
Tabs
Badge
Toast
Tooltip
TileCard
TileRow
CategoryChip
RoleCard
ScoreBreakdown
ActionPanel
PlayerPanel
SectionHeader
EmptyState
ErrorState
ValidationIssueList
FormField
TextField
NumberField
SelectField
Toggle
SkinPreviewCard
SkinSelector
ResultFrame
RotatePrompt
```

A component may be added only when its semantic responsibility is not covered by this inventory.

## Button Contract

One Button implementation serves all screens and skins.

Variants:

```text
primary
secondary
paper
ink
ghost
danger
```

Sizes:

```text
sm
md
lg
icon
```

States:

```text
default
hover
pressed
focused
selected
disabled
loading
```

Rules:

```text
minimum hit height: 44px
primary action preferred height: 54px
maximum label lines: 2
text remains HTML
sub-label cannot change hit behavior
loading keeps stable size
disabled uses native semantics
focus remains visible in all skins
background skin uses shared SkinSurface
```

Screen-specific button implementations are forbidden.

## Panel and Surface Contract

Layout owns dimensions. Skin owns surface appearance.

```text
parent layout: width, height, grid placement, gap
shared component: padding contract, content structure, semantics
skin renderer: image, border, texture, shadow, ornament
```

Supported surface modes are defined in `docs/DESIGN-SYSTEM.md` and `docs/SKIN-SYSTEM.md`.

Panel content must remain inside the registered content safe area.

## Dialog Contract

Use one Dialog/Modal system for:

```text
match interruption
unsaved editor exit
import/export
errors
confirmation
data reset
future purchase/install confirmation
```

Required behavior:

```text
focus management
escape/close policy
primary and secondary actions
long-text handling
compact landscape fit
screen-reader title/description
no screen-local overlay implementation
```

## Form Contract

Editor screens use shared fields.

```text
FormField
TextField
NumberField
SelectField
Toggle
ValidationIssueList
```

Fields own:

```text
label
help text
error/warning display
focus and disabled semantics
compact layout behavior
```

A screen must not create an unstyled raw input unless the shared component cannot represent a required native behavior and that exception is documented.

## Tile Contract

Tile ratio and interaction area are immutable.

```text
aspect ratio: shared contract
content regions: category / face / name
hit area: HTML element
skin: face/base/back/ornament
state: separate overlay
```

States:

```text
default
hover
selected
dimmed
faceDown
ronAvailable
tsumoAvailable
wildcardUsed
focused
disabled where applicable
```

Do not bake tile name, category color, state label, or focus indication into raster art.

## State Semantics

State must not rely only on color, texture, or animation.

```text
selected: semantic attribute + outline/position/icon
focused: focus-visible ring with minimum contrast
disabled: native disabled behavior + visual treatment
warning/error: icon/text/color
ron/tsumo: text/aria/outline/effect combination
```

Skin assets may decorate these states but cannot remove their semantic representation.

## Text Budgets

Component Gallery must cover:

```text
short Japanese
long Japanese
long English
emoji
6-digit score
empty optional description
2-line button label
long player name
long role name
```

Each component defines whether it wraps, clamps, scrolls, or ellipsizes. Silent overflow is forbidden.

## Input Modality

Shared components must remain compatible with:

```text
touch
mouse
keyboard
future gamepad
```

Rules:

```text
touch does not require hover
keyboard shows clear focus
pointer hover is decorative, not required information
component ordering must permit future directional navigation
```

## Component Gallery Gate

Every shared component/variant/state must be visible in Component Gallery before broad screen use.

Gallery must support instant switching between:

```text
yorunoshirube
cute-pop
```

Gallery review sizes:

```text
844x390
852x393
932x430
1024x600
1366x768
```

## New Feature Checklist

A feature with UI is incomplete until:

```text
shared component choice is documented
new variants are added centrally
new tokens are semantic/component tokens
new asset slot has geometry and fallback contract
Gallery includes all new states
both official skins work
compact and regular density work
keyboard/touch behavior remains valid
visual regression/manual screenshots are reviewed
```

## Forbidden

```text
screen-local generic buttons
screen-local modal backdrops
duplicated validation lists
hardcoded PNG paths
hardcoded colors in screen components
skin-specific screen components
layout values inside skin manifests
state meaning baked only into images
```

## Final Decision

Reusable behavior and structure live in shared components. Skins provide validated presentation. Screens only compose them.