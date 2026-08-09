# Asset Request: Batch 14 Yorunoshirube Table Background Refinement (`table.background`)

## Skin / Slot

- skin: `yorunoshirube`
- slots: `table.background`
- target files (candidates):
  - `generated/candidates/table-background-b14-a.png`
  - `generated/candidates/table-background-b14-b.png`
  - `generated/candidates/table-background-b14-c.png`

This request creates **review candidates only**. The existing final remains the
production authority until a human explicitly approves a replacement.

## Purpose

Make the match screen read as a deliberately art-directed night tabletop game,
not a generic AI dark UI. The background should establish the Yorunoshirube
world while leaving the actual table, discard rivers, hand, text and actions as
the visual hierarchy.

## Used By

`GameTableLayout` -> `MatchScreen` through the existing `table.background` slot.
No DOM/layout/hit-area/state changes are permitted for this asset.

## Generation Method

- [ ] programmatic generation
- [x] image generation via the repository-approved pipeline

This slot is an opaque cover background. Do **not** chroma-key it to transparency.
Preserve the existing slot contract and 1920x1080 intrinsic size.

## Render Contract

```text
renderMode: cover
intrinsicSize: 1920x1080
transparent: false
critical target viewport: 844x390 landscape
secondary targets: existing visual matrix sizes
```

The useful composition must survive cover-cropping at 844x390.

## Visual Thesis

> A quiet late-night memory desk at an old station: worn dark wood, fibrous
> notebook paper and restrained black ink, touched by one warm lantern outside
> the main play area.

The player should feel that the game is being played on a real authored surface,
not inside a glossy fantasy HUD.

## Visual Direction

### Material / surface

- old dark wood or a dark paper/cloth play surface grounded on wood
- visible but restrained grain/fiber; not photoreal noisy texture
- occasional notebook/ticket-paper edge as environmental storytelling
- muted brass may appear only as a minor structural accent
- black ink marks may appear only at the periphery and must not resemble UI text

### Lighting

- one primary warm lantern source from an upper or side edge
- light should fall softly across material, not create a radial UI spotlight
- center gameplay region remains low-contrast and calm
- no secondary blue/purple rim light

### Silhouette / crop

At 25% scale the image should read as:

```text
quiet dark desk plane + one warm edge light + one or two crafted material cues
```

It must not read as a collage of props.

### Saturation budget

- 85-90% of the image: low-saturation brown/charcoal/ink/cream-dark values
- warm lantern accent: localized and scarce
- no saturated purple, cyan, electric blue or rainbow accents

### Craft cues

Use only a few:

- paper fiber
- worn wood edge
- slight print/ink irregularity
- soft abrasion/rubbing
- subtle non-perfect alignment of a paper edge

Do not add all cues everywhere.

## Composition Contract

```text
primary focal point:
  restrained warm lantern/material cue near an outer edge, never center

secondary focal points:
  max 2: paper/notebook edge and one small brass/ink detail

quiet area:
  central 60-70% of the landscape frame; low contrast, low detail, no props

forbidden focal zones:
  center table status
  all four discard-river zones
  bottom hand zone
  lower-right action zone
  upper utility text/button zone

thumbnail read:
  dark crafted desk, calm center, one warm authored light cue
```

## Candidate Diversity

Do not create seed variants of one scene.

### Candidate A — Memory Desk

- exposed aged dark-wood desk
- thin notebook-paper edge at one corner
- warm lantern spill from upper-left outside frame
- almost no ornament

### Candidate B — Ink Play Mat

- matte charcoal/black fibrous paper or cloth play mat over aged wood
- subtle irregular ink wash only near outer perimeter
- warm light from upper-right
- center especially quiet and flat for tile readability

### Candidate C — Station Writing Desk

- old station writing desk / travel notebook mood
- narrow muted-brass rail or fixture at one edge
- small ticket-paper fragment at far edge with **no readable text**
- warm side light, darker opposite side

At least composition + material treatment must differ between all candidates.

## Must Avoid

Reason codes that must not recur:

```text
AI-01 generic rounded-card/dashboard visual language
AI-02 decorative gradient dependency
AI-03 glow inflation
AI-04 equal emphasis
AI-05 centered symmetry-by-default
AI-06 decorative collage
AI-07 near-duplicate candidates
ASSET-02 generated text contamination
ASSET-04 beautiful-alone / worse-in-UI
```

Explicitly forbidden:

- cyberpunk / neon / sci-fi HUD
- purple-blue cinematic grade
- giant center glow or radial spotlight
- glossy resin/glass/gacha treatment
- magical particles, fireflies, stars or floating dust as decoration
- piles of stationery, clocks, keys, tickets, lamps, books or props
- readable letters, numbers, logos, Japanese text or fake pseudo-text
- symmetrical centered composition
- bright border/frame around the whole image
- fake depth-of-field blur that makes tiles/text visually fight the background
- vignette so strong that screen edges lose UI contrast

## Prior Failure Check

Read before generation:

- `docs/design/SOROPON-VISUAL-QUALITY-LEARNINGS.md`
- `docs/ASSET-PRODUCTION-ROADMAP.md`
- prior `table.background` generation records / approval pack
- current real-screen screenshots for both 3p and 4p

Current correction versus earlier UI direction:

```text
Do not add another CSS-style glow/gradient into the artwork.
Do not use visual richness to compensate for layout weakness.
The center is intentionally quiet; authored identity lives at the perimeter.
```

## Fallback If Missing

Keep the current final `table.background` and existing CSS/token fallback.
Failure/rejection of this request must not break the current production skin.

## Acceptance Checklist

- [ ] 1920x1080 exact output
- [ ] cover crop works at 844x390 without losing the visual thesis
- [ ] center 60-70% remains low-detail enough for tiles/rivers/status
- [ ] bottom hand/action region stays readable
- [ ] no generated text or pseudo-text
- [ ] no neon/purple/cyberpunk/glow inflation
- [ ] primary focal point is outside the gameplay center
- [ ] candidates A/B/C are materially/compositionally different
- [ ] 25% thumbnail still reads as a crafted night desk, not black noise
- [ ] existing `table.background` candidate is included in side-by-side review
- [ ] both 3p/4p and both skins' layout invariants remain unaffected
- [ ] weakest three visual issues are recorded before any approval decision
- [ ] human approval is explicit before final promotion

## Review Notes / Learning Capture

```text
strongest quality:
weakest 3 qualities:
rejection/not-selected reason codes:
what to preserve next time:
what to change next time:
```

Reusable findings must be added to
`docs/design/SOROPON-VISUAL-QUALITY-LEARNINGS.md`.

## Approval Status

- [x] request authored
- [ ] candidates generated
- [ ] real-screen comparison completed
- [ ] human approved
- [ ] promoted to final
