# UI Readability Contract

Batch 13 establishes this contract for every current screen and both official
skins. Decorative assets may change appearance, but must not weaken these
rules.

## Typography and surfaces

- Body copy is at least 14px; important status and actions are at least 16px.
- Default line height is 1.5; compact status text is never below 1.35.
- Important text sits on a solid or semi-opaque semantic surface, not directly
  on a decorative image.
- Text areas grow with content. Fixed height, `overflow: hidden`, or scaling the
  whole application must not hide copy.
- Truncated names keep their full value in an accessible name and `title`.
- Numeric fields reserve space for at least four digits.

## Interaction

- Primary pointer targets are at least 44×44 CSS pixels.
- `:focus-visible`, selected, disabled, current-turn, and winning-action states
  remain distinguishable without color alone.
- Decorative layers and pseudo-elements use `pointer-events: none`.
- Modal content is the only operable layer while open; focus is trapped and
  returned by the shared Modal contract.

## Semantic tokens

The shared token layer owns font size, line height, weight, letter spacing,
foreground/muted foreground, surface/elevated/overlay surfaces, border, focus
ring, shadows, spacing, safe-area insets, layer order, touch target, line
length, and responsive breakpoints. Skins may replace color, texture, border
character, and decorative assets only.

## Skin-specific checks

- Yorunoshirube information surfaces retain sufficient opacity; glow and ink
  decoration never cross important text.
- Cute Pop separates state information from patterns; white text is limited to
  sufficiently dark primary surfaces.
- Both skins retain the same DOM, grid, focus, size, and responsive behavior.

