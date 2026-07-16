# Batch 3 Art Direction: Yorunoshirube Core

## Status

**Planning artifact only.** No image generation has been executed under
this document yet (see `docs/asset-requests/BATCH-3-YORUNOSHIRUBE-APPROVAL-PACK.md`
for the honest execution status of this batch). This document defines the
world, material hierarchy, color/light/density rules, and per-slot
consumer research required before any Codex CLI prompt is written, per
`docs/IMAGE-ASSET-WORKFLOW.md`.

## Core statement

夜の地図帳を開き、黒インクで描かれた記憶の街に、小さな街灯の光が残っている。
ページは古びているが、まだ読める。光は強すぎず、消えかけてもいない。

Yorunoshirube is a night travel-journal/atlas, not a dark-mode recolor of
Cute Pop. The player is turning pages of a hand-inked map book at night,
guided by a few small lights (lanterns, streetlamps, before-dawn glow).

Desired impression: dark but not scary; quiet but not plain; carries a
sense of story; tactile material; readable; clearly interactive where it
needs to be; comfortable for long sessions; the world reads even from a
single screenshot.

Forbidden impression: horror, blood, decay, grotesque ornament,
luxury-hotel gold-on-black, cyberpunk/neon, space, wafu/japanese-traditional
motifs, plain green mahjong felt, uniform sepia old-manuscript look.

## Cute Pop differentiation (explicit)

- Do NOT recolor Cute Pop materials (icing, jelly, quilt/cushion,
  embroidery, ribbon) into a dark palette. These motifs are Cute-Pop-owned
  and must not appear in Yorunoshirube.
- Cute Pop = daytime toybox (icing cookie tile frame, quilt cushion tile
  back, jelly candy CTA, pastel cloth table, cushion-piping modal,
  embroidered-patch result frame).
- Yorunoshirube = night record-book (ink/paper/map/lantern materials
  only).
- Same silhouette/contract is allowed and expected (both skins share
  layout, hit areas, touch size, z-index, responsive behavior, focus,
  state meaning per `docs/SKIN-SYSTEM.md`); only material expression
  differs.
- Each of the 8 slots below is assigned a **distinct material role** so
  the family does not collapse into "one ink frame repeated 8 times."

## Material hierarchy per slot

| slot | role | density | material |
|---|---|---|---|
| `table.background` | night atlas — widest, quietest surface | low | deep navy paper, faint hand-drawn street/river lines, no legible place names |
| `panel.paper.default` | everyday record card | low-mid | aged ivory ledger paper, pale ruled/map guide lines, ink-edge border |
| `panel.modal.background` | an important memory tucked between pages | mid, readability-first | inserted paper / envelope flap texture, slightly brighter than the record card so body text pops |
| `panel.result.frame` | journal's closing cover | high | before-dawn commemorative cover, several small lights (not one big light), quiet gold/violet afterglow at the edges only |
| `button.primary.background` | a strong guiding light | mid | lit streetlamp/lantern glass, warm amber glow, ink-black housing |
| `button.secondary.background` | a fading/pencil-line light | low-mid | unlit signpost or pencil-sketched lamp outline, cooler and dimmer than primary |
| `tile.face.base` | a memory fragment | edges only (text must win) | bright ivory paper chip with ink edge, center kept quiet for the pips/numerals overlay |
| `tile.back.base` | a closed memory | mid | sealed black paper with a faint pressed map-line relief, reverse of the atlas motif |

## Color rules (derived from `tokens.css`, not invented)

Base tokens already defined for yorunoshirube
(`public/assets/ui/soro-pon/skins/yorunoshirube/tokens.css`):

```
--sp-color-night        #120d08   deep navy-black (table/back ground)
--sp-color-night-soft   #1c150d
--sp-color-wood         #241a10   sooty warm-black
--sp-color-ink-panel    #17110b
--sp-color-ink          #241a10   ink black (line work)
--sp-color-paper        #d9c9a6   aged ivory paper (panel/tile face)
--sp-color-paper-aged   #c9b890
--sp-color-paper-highlight #efe3c4
--sp-color-cream        #e9dcbc
--sp-color-lantern-0    #e8a23c   streetlamp amber (primary button, result glow)
--sp-color-lantern-1    #b97a26   weak gold (secondary button, edge glow)
--sp-color-crimson      #7c2018   reserved accent, not a field color
```

Direction: deep navy-black, sooty blue-black, ink black, aged ivory
paper, pale blue-gray highlights, streetlamp amber, weak gold,
before-dawn violet (a new, undefined-in-tokens accent reserved for
`panel.result.frame` only — desaturated indigo/violet, e.g. `#3a3050`
range, used sparingly at edges to mark "before dawn").

Forbidden: pure `#000000` full-bleed fields, strong pure-white fields,
saturated yellow full-bleed, high-saturation neon, and Cute Pop's rose-pink
(`--sp-color-rose` family) in any form.

## Light hierarchy

- `table.background`: faint glow only at 1-2 corners (streetlamp bleed at
  the edge of the map), center stays dark and quiet.
- `panel.paper.default` / `panel.modal.background`: no emitted light —
  paper reads through soft ambient reflectance only (highlight gradient
  at a top corner), not a light source.
- `tile.face.base`: the paper itself is the brightest material in the
  family so the printed pip/numeral overlay stays legible.
- `button.secondary.background`: weakest light (unlit or pencil outline).
- `button.primary.background`: strongest, warmest light — must read as
  "press this."
- `panel.result.frame`: several small lights distributed around the
  frame edge (not one dominant burst), suggesting a night skyline just
  before sunrise.

## Density hierarchy

`table.background` (lowest) < `panel.paper.default` <
`tile.face.base` (edges only, center empty) ≈ `button.*` (mid) <
`panel.modal.background` (mid, must stay readable) <
`panel.result.frame` (highest, but center safe area still quiet).

## Cross-slot consistency rules (shared despite different materials)

All 8 candidates, regardless of material role, must share:

1. Hand-drawn line quality (uneven, slightly imperfect ink line — never a
   perfectly uniform vector-style outline).
2. Black-ink density language: line weight and ink-bleed softness should
   look drawn by the same hand across slots.
3. Corner roundness: soft, small-radius corners (matches existing
   `--sp-radius-sm`/`--sp-radius-md` visual language, not sharp square
   corners, not Cute-Pop's large bubbly radius).
4. Light color: only streetlamp amber (`#e8a23c`/`#b97a26`) or the
   reserved before-dawn violet may act as a light source anywhere in the
   family.
5. Paper "temperature": all paper-family slots (`table.background`,
   `panel.paper.default`, `panel.modal.background`, `panel.result.frame`,
   `tile.face.base`) share the same warm ivory/aged-paper base hue family
   — no slot should look like a different paper stock.
6. Shadow softness: soft, low-contrast ambient shadow only; no hard drop
   shadows baked into the image (the CSS host already provides
   `--sp-shadow-panel`/`--sp-shadow-tile`).
7. Outline weight: consistent ink border weight across nine-slice edges
   so mixing slots in one screen doesn't look mismatched.
8. Noise density: a consistent quiet paper-grain/particle noise level —
   present enough to prove image generation, restrained enough to stay
   readable at `minRenderSize`.

## Slot-to-slot material assignment (must not repeat the same motif)

- `table.background` → atlas / night streets, navy paper, hand-drawn
  rivers/roads, 1-2 corner streetlamp glows.
- `panel.paper.default` → record card / plain old paper, faint map guide
  lines only (not full street detail).
- `tile.face.base` → bright memory fragment, ink edge frame, quiet
  center.
- `tile.back.base` → closed memory, black sealing paper, faint pressed
  reverse-of-atlas relief (different from the face, and different from
  the table's line motif — a *pressed/embossed* relief, not printed ink).
- `button.primary.background` → streetlamp/lantern glass housing,
  guiding light.
- `button.secondary.background` → pencil-line signpost / unlit lamp
  outline, fading light.
- `panel.modal.background` → envelope / inserted paper, a record placed
  between pages, mid brightness for body text.
- `panel.result.frame` → journey's cover, before-dawn commemorative
  frame, several small lights.

## Per-slot consumer research

Contract source: `public/assets/ui/soro-pon/SKIN-CONTRACT.json`
(cross-checked against `public/assets/ui/soro-pon/skins/cute-pop/skin.json`
for the numeric values cute-pop actually used for the same slot names —
yorunoshirube must reuse the identical contract shape).

| slot | consumer component(s) | screens | renderMode | intrinsicSize | nineSlice | contentSafeArea | minRenderSize | transparent |
|---|---|---|---|---|---|---|---|---|
| `table.background` | `GameTableLayout.tsx` (`assetSlot="table.background"`, CSS `background-size: cover`) | Match | cover | 1920x1080 | n/a | n/a | n/a | opaque (no `transparent` field) |
| `panel.paper.default` | `PaperPanel.tsx` (default variant) | Top/MatchSetup/DeckEditor generic panels | nine-slice | 384x256 | 24/24/24/24 | 12/12/12/12 | 64x64 | transparent |
| `panel.modal.background` | `PaperPanel.tsx` via `Modal.tsx` (`assetSlot="panel.modal.background"`) | Dialog (confirm/error), Top skin-select modal | nine-slice | 512x384 | 24/24/24/24 | 16/16/16/16 | 96x96 | transparent |
| `panel.result.frame` | `PaperPanel.tsx` via `ResultFrame.tsx` | Result | nine-slice | 512x384 | 32/32/32/32 | 16/16/16/16 | 96x96 | transparent |
| `button.primary.background` | `Button.tsx` (variant `primary`) | all screens with a primary CTA | nine-slice | 240x72 | 16/16/16/16 | 8/8/8/8 | 72x44 | transparent |
| `button.secondary.background` | `Button.tsx` (variant `secondary`) | all screens with a secondary action | nine-slice | 240x72 | 16/16/16/16 | 8/8/8/8 | 72x44 | transparent |
| `tile.face.base` | `TileCard.tsx` | Match (hand/discard), Gallery | stretch | 300x400 (3:4) | n/a | n/a | n/a | transparent |
| `tile.back.base` | `TileCard.tsx` | Match (opponent hand/wall) | stretch | 300x400 (3:4) | n/a | n/a | n/a | transparent |

Notes:
- `tile.face.selected` / `tile.face.ronAvailable` / `tile.face.tsumoAvailable`
  are **out of scope for Batch 3** per ADR-015 (state slots are composited
  over `tile.face.base` with CSS/overlay layers, not separate full
  images) — do not generate them.
- Focus/disabled states for buttons are handled by the shared `Button`
  component's CSS state layer (focus ring token, disabled opacity), not
  by separate button images — same as Cute Pop's `button.primary.background`.
- Fallback behavior for all 8 slots (if an asset is missing/unregistered,
  which remains true for all of them at the end of this batch): existing
  CSS-token fallback rendering already in place for yorunoshirube
  (`sp-fallback-*` classes / `--sp-gradient-*` tokens), unchanged by this
  batch.
- Skin-switch behavior: switching to yorunoshirube must not resolve any
  Batch 3 candidate as a production asset — `skin.json` `slots` stays
  `{}` for all 8 slots until human approval + promotion (out of scope for
  this batch).

## CSS-only exclusions (why image generation is required, per slot)

Every candidate for every slot must justify itself via several of: paper
fiber, black ink bleed, abrasion/wear, print misregistration, pencil
marks, ink density variation, soft light, layered paper, scorching/aging,
folds/creases, map lines, hand-drawn lines, thread-binding (not
embroidery), woodblock/letterpress-like relief, translucent ink, old
photograph emulsion texture, wax-coated paper, quiet grain/particle
noise, handmade unevenness — never a flat color, simple gradient, uniform
border, dot/stripe/grid pattern, plain box-shadow, or simple noise
overlay that a CSS rule could reproduce (this is the same bar that
rejected Cute Pop's round-1 R1 candidates; see `docs/asset-requests/R1-APPROVAL-PACK.md`).
