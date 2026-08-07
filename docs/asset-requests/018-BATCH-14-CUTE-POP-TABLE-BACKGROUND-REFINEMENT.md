# Asset Request 018 — Batch 14 Cute Pop Table Background Refinement

## Skin / Slot

- skin: `cute-pop`
- slots: `table.background`
- status: candidate exploration only; current final remains production source until explicit human approval

## Purpose

Re-evaluate Cute Pop's table background against the Batch 14 authored-game bar.
The goal is not to make it shinier. The goal is to make the play field feel like
a designed tabletop game where tiles, discard rivers, hand and actions remain the
first visual read.

## Used By

`GameTableLayout` -> `MatchScreen`

## Generation Method

- [x] image generation through the repository asset workflow
- final promotion remains human-only
- evaluate candidate in real screen before any manifest change

## Visual Thesis

A playful stationery/toy-table surface prepared by a human designer: matte paper,
soft printed shapes and a few tactile toy/sticker cues. Bright and charming,
without resembling a mobile gacha lobby, candy shop banner or generic AI kids UI.

## Composition Contract

```text
canvas: 1920x1080 cover background
primary purpose: quiet play field for tiles and discard rivers
central 60-70%: low-detail quiet zone
edge detail: allowed mostly near corners and outer 12-18%
primary focal point: gameplay objects supplied by runtime, not baked art
secondary art cues: maximum two edge/corner clusters
lighting: clean soft ambient light, no bloom
material: matte printed board/paper + restrained molded toy/sticker detail
saturation: bright accents at edges; central field noticeably quieter
text: absolutely none baked into the image
```

The background must still read as authored Cute Pop at 25% scale, mainly through
shape language/material/color rhythm, not through many tiny decorative objects.

## Candidate Diversity

Candidate A/B/C must differ by concept, not seed:

- A — `Printed Play Mat`: matte illustrated stationery mat, hand-cut registration cues at outer edge.
- B — `Toy Table`: subtle molded tabletop corners and printed central field, restrained physical toy feel.
- C — `Sticker Workshop`: mostly paper workspace with two asymmetrical sticker/tool clusters outside gameplay center.

Each candidate must differ on at least two axes among composition, material,
silhouette, edge density and accent distribution.

## Must Avoid

- candy-gloss or jelly-plastic coating over the whole scene
- rainbow or aurora gradients as a default background device
- glassmorphism, neon, cyberpunk glow, bloom
- gacha lobby framing / collectible-card marketplace composition
- centered mascot collage
- repeated decorative pills/cards
- stars/confetti/hearts scattered uniformly just to fill space
- baked labels, fake Japanese/English text, logo-like glyphs
- symmetrical corner decoration on all four corners
- detail beneath the discard rivers or self hand
- strong vignette that makes the center feel spotlighted
- near-duplicate candidates

## Fallback If Missing

Current final `table.background` remains valid. CSS/token fallback remains usable.
No candidate is allowed to weaken current production behavior.

## Prior Failure Check

Relevant reason codes from `docs/design/SOROPON-VISUAL-QUALITY-LEARNINGS.md`:

```text
AI-01 generic card convergence
AI-02 decorative gradient dependency
AI-03 glow inflation
AI-04 equal emphasis
AI-05 symmetry-by-default
AI-06 asset collage
AI-07 near-duplicate candidates
GAME-01 table not dominant
ASSET-02 generated text contamination
ASSET-04 pretty alone, worse in UI
```

Reject immediately if any candidate depends on these patterns for appeal.

## Acceptance Checklist

- [ ] 844x390 first: tiles/river/hand/action dominate background
- [ ] 3-player and 4-player layouts both keep the central field quiet
- [ ] Cute Pop identity remains obvious without rainbow/gloss overload
- [ ] no fake text or logo-like marks
- [ ] no edge cue collides with player metadata or safe areas
- [ ] at 25% scale the composition still has a clear quiet center
- [ ] candidate A/B/C are visibly different concepts
- [ ] strongest quality and weakest three problems recorded before selection
- [ ] human explicitly approves before final promotion

## Review Notes / Learning Capture

For each candidate record:

```text
candidate:
strongest quality:
weakest 1 + reason code:
weakest 2 + reason code:
weakest 3 + reason code:
844x390 gameplay hierarchy:
3p/4p collision notes:
keep / reject / regenerate:
reusable learning:
```
