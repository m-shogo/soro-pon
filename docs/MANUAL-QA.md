# Manual QA Checklist

## Purpose

Automated tests prove contracts. Manual QA proves the game can actually be understood, touched, switched, recovered, and played.

Run this before calling a UI phase polished, image-ready, user-test ready, or demo ready.

## Required Context

Record:

```text
Date
Commit
Browser/device
Viewport
Skin
Fresh/existing local data
```

## Viewport Checks

Required sizes:

```text
844x390
852x393
932x430
1024x600
1366x768
```

Check:

```text
phone landscape fits without critical clipping
portrait shows rotate prompt or limited utility
PC centers game content with appropriate outer support
text remains readable
important buttons remain reachable
no whole-app transform-scale blur
safe-area insets work
native controls match active light/dark color scheme
```

## Boot And Recovery

```text
fresh load works
reload works on main screens
reload during match does not crash
broken local data recovers safely
unknown/corrupt skin ID recovers safely
skin package load failure keeps a usable fallback or previous skin
missing deck/variant shows ErrorState, not a blank screen
AppErrorBoundary offers recovery
visible reset path works
reset confirmation explains scope
```

## Skin Switching

Run for `yorunoshirube` and `cute-pop`.

```text
user-facing SkinSelector is reachable
Component Gallery switch works instantly
switch does not require reload
current screen remains
editor draft/input remains
selected tile and match state remain
modal/form state remains where expected
selected/loading/failure/default states are clear
no mixed-skin flash
no large layout shift
no click-target movement
focus remains usable
browser color scheme/theme color updates
```

## Skin Contract / Fallback

```text
base fallback is usable without images
missing optional slot falls back cleanly
invalid asset does not make content disappear
opacity/blend affects skin layer, not text/content/focus
nine-slice corners remain stable
minimum-size button/panel remains valid
large panel and two-line button remain valid
high-density source image remains crisp
```

Proof assets before broad production:

```text
panel.paper.default
button.primary.background
```

## Contrast And State Meaning

For both official skins:

```text
primary CTA text is readable
focus ring is visible on light and dark surfaces
category bands choose readable light/dark text
warning/info/success remain distinguishable
selected/disabled/focused/ron/tsumo are not color-only
muted text is still readable
```

## Deck Import

```text
valid animal starter parses
invalid JSON shows understandable error
unknown field shows code and path
unsafe fields are rejected
large file is rejected
blocked draft cannot start match
playableWithWarnings explains warnings
```

## Deck Editor

```text
can create category and tile
can assign tile to category
can create safe role template
specificSet duplicate/unknown/impossible demand is blocked
bonus cannot become a winning role
simple mode cannot create count-only normal winRole
scoreBudget and wildcard warnings are visible while editing
unsaved changes warning is visible
shared form fields work in both skins
long names and large numbers do not break layout
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
discard requires a valid selected tile
discard preview does not commit discard
ron window appears only after discard
tsumo appears only after completed win
CPU turn progresses understandably
empty draw pile ends round
double click/rapid input does not duplicate action
skin switch does not mutate match state
```

## Insight UX

```text
insights explain facts, not commands
beginner mode is not noisy
advanced mode can show details
wildcard meaning is candidate-specific
wait explanation points to missing group
```

## Result / Records

```text
selectedWinRole shown
3 groups shown
wildcard assignment shown if used
special bonuses and ScoreBonus shown separately
total score reconstructable
coin/progression reward does not imply paid strength
reload does not duplicate immediate record/reward
achievement unlock persists
```

Before restore/replay features, verify persistent match-session idempotency separately.

## Accessibility And Keyboard

```text
keyboard focus visible
interactive controls have accessible labels
main touch targets are at least the contract minimum
Modal receives initial focus
Modal traps focus and returns it after close
Escape closes Modal
Tabs support Left/Right/Home/End
Tile selected state is announced
color is not the only signal
reduced-motion preserves meaning
```

## Shared Component / Visual Quality

```text
no generic white web-app feel
both official skins feel deliberate, not recolored copies only
no random values outside tokens
buttons/panels/forms/dialogs use shared components
screen-local generic controls are removed
text is not baked into images
images follow contract and candidate-first workflow
no final asset was generated directly into final
```

## Public Demo Recovery

```text
reset local data path is visible enough
known limitations are visible
no existing IP assets
no remote image loading
skin failure cannot brick the app
common error paths have recovery actions
```

## QA Report Format

```text
Date:
Commit:
Browser/device:
Viewport:
Skin:
Data state:
Passed:
Failed:
Screenshots:
Known issues:
Decision: pass / blocked / needs polish
```

## Final Decision

Manual QA is not a replacement for tests. It is the final proof that tested rules, both skins, accessibility, recovery, and real touch behavior work for humans.
