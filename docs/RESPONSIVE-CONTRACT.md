# Responsive Contract

Soro-pon is landscape-first and uses layout reflow, not whole-screen scaling.

## Breakpoints

- Compact landscape: up to 899px wide or up to 430px high.
- Standard landscape: 900–1199px wide.
- Desktop landscape: 1200px and above.

The compact breakpoint corresponds to current phone-landscape evidence. The
desktop breakpoint is where the table gains enough horizontal and vertical
space to increase seat/discard capacity without leaving a phone-sized board in
the corner.

## Rules

- The match root must fill the safe-area flex container (`flex: 1;
  min-height: 0`).
- Four-player and three-player stages use distinct named CSS grids.
- The hand receives width before utility copy or decorative spacing.
- Tile size is computed from both available width and height and never drops
  below the 44px interaction floor.
- Played areas use bounded internal wrapping/scrolling; document-level
  horizontal or vertical overflow is a failure.
- Safe-area padding is expressed through shared inset tokens.
- Container/grid/flex sizing is preferred over viewport-specific coordinates.

Required automated viewports are 812×375, 844×390, 932×430, 1024×576,
1280×720, and 1440×900.

