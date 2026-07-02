# soro-pon UI Part Generation Prompt Template

## Required References

Before generating any UI part, review:

```text
docs/design-targets/generated/soro-pon-landscape-vampon-ui-v1/
docs/46-landscape-first-web-responsive-policy.md
docs/37-visual-design-direction.md
```

If the part uses Vamp-pon-derived motifs, also review:

```text
/Users/m-shogo/Developer/personal/vamp-pon/docs/shared-vampon-master-index.md
docs/45-vampon-reference-gate.md
```

## Base Prompt

```text
Generate a single reusable UI part for soro-pon.

Style:
- landscape-first game UI
- Vamp-pon in-world memory-card game
- paper UI
- black ink edges
- lantern glow accent
- warm dark night desk feeling
- quiet, readable, handmade

Output:
- one isolated UI part only
- centered on solid chroma green background
- background must be flat #00ff00
- no shadow blending into green
- no text unless explicitly requested
- no existing IP characters or logos

Part:
[describe target part]

Required states:
[normal / selected / disabled / danger / active / locked / unlocked]

Implementation use:
[button / tile / panel / badge / effect / icon / background]
```

## Good Targets

```text
tile-base
tile-selected
tile-discard
tile-wildcard
button-primary
button-danger
button-disabled
panel-paper
panel-dark
player-mini-panel
role-card
score-panel
lantern-glow
ink-splash
latest-discard-burst
clear-board-tile-locked
clear-board-tile-unlocked
```

## Do Not Generate

```text
full screen mockups here
existing IP images
personal photos
opaque backgrounds intended for runtime
hard-to-remove green spill
text-heavy UI baked into image
```
