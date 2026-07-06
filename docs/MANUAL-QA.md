# Manual QA Checklist

## Purpose

Automated tests prove rules.
Manual QA proves the game can actually be understood and played.

Run this before calling a UI phase polished or user-test ready.

## Viewport Checks

Required sizes:

```text
844x390
932x430
852x393
1024x600
1366x768
```

Check:

```text
phone landscape fits without critical clipping
portrait shows rotate prompt or limited utility
PC centers game table with outer support
text remains readable
important buttons remain reachable
no whole-app transform scale blur
```

## Boot And Recovery

```text
fresh load works
reload works on main screens
reload during match does not crash
broken local data recovers safely
reset local data path works
```

## Deck Import

```text
valid animal starter parses
invalid JSON shows understandable error
unknown field shows code and path
unsafe fields are rejected
large file is rejected
blocked draft cannot start match
playableWithWarnings clearly explains warnings
```

## Deck Editor

```text
can create category
can create tile
can assign tile to category
can create safe template role
simple mode cannot create count-only normal winRole
scoreBudget warning is visible
wildcard warning is visible
unsaved changes warning is visible
```

## Match Setup

```text
3-player match can start
4-player match can start
2-player match cannot start
extended pending variant cannot start
invalid draft deck cannot start
```

## Match Play

```text
draw changes current player hand to 9
discard requires valid selected tile
discard preview does not commit discard
ron window appears only after discard
tsumo appears only after completed win
CPU turn progresses understandably
empty draw pile ends round
```

## Insight UX

```text
insights explain facts, not commands
beginner mode is not noisy
advanced mode can show details
wildcard meaning is candidate-specific
wait explanation points to missing group
```

## Result UX

```text
selectedWinRole shown
3 groups shown
wildcard assignment shown if used
special bonuses shown separately
ScoreBonus shown separately
total score reconstructable
coin/progression reward does not imply paid strength
```

## Accessibility And Touch

```text
keyboard focus visible
interactive controls have accessible labels
main touch targets are roughly 44px where practical
disabled state is clear
selected state is clear
color is not the only signal
```

## Visual Polish

```text
no generic white web app feel
night desk / paper tile / ink / small light direction preserved
no random colors outside tokens
buttons/panels use shared primitives
text is not baked into images
SVG/PNG/WebP usage follows responsive crisp rules
```

## QA Report Format

```text
Date:
Commit:
Browser/device:
Viewport:
Passed:
Failed:
Screenshots:
Known issues:
Decision: pass / blocked / needs polish
```

## Final Decision

Manual QA is not a replacement for tests.

It is the final check that the tested rules are understandable to humans.
