# Soro-pon Visual Quality Learnings

Status: canonical learning ledger for visual/UI quality.

This file exists so a new agent does **not** repeat a visual failure simply
because tests are green or because an earlier generated asset already exists.
The product target is an authored game interface, not a generic web dashboard.

## Core rule

```text
CI green = implementation is safe enough to evaluate.
CI green != visual approval.
```

At every visual pass, judge the actual landscape game at the target viewport,
especially 844x390. Fix the weakest three visible problems before adding new
decoration.

## Failure taxonomy / reason codes

Use these codes in asset requests, review notes and future approval packs.

| Code | Failure | Typical symptom | Correction |
|---|---|---|---|
| AI-01 | Generic AI card convergence | repeated rounded cards, dashboard blocks, centered modules | flatten hierarchy, use rails/planes/real game objects instead of boxes |
| AI-02 | Decorative gradient dependency | radial/linear gradients added without semantic purpose | let authored art/material carry identity; CSS only supports readability/state |
| AI-03 | Glow inflation | every active/important element blooms | reserve light for one focal state; use edge/contrast/position elsewhere |
| AI-04 | Equal emphasis | everything is outlined, badged, boxed and equally loud | define primary/secondary/quiet zones and remove competing treatment |
| AI-05 | Symmetry-by-default | centered composition feels generated/template-like | compose around game function, player hand, discard river and real reading order |
| AI-06 | Asset collage | many decorative motifs/stickers fill empty space | protect negative space; one primary focal point, max two secondary points |
| AI-07 | Near-duplicate candidates | A/B/C differ only by seed or tiny ornament | change at least two axes: composition/material/silhouette/light/edge/density |
| UI-01 | Admin-form smell | form controls and validation become the visual subject | show tiles/loadout first; forms are tools, validation is an inspector |
| UI-02 | Web marketplace smell | floating cards with shadow/hover lift and KPI mini-cards | use flat selectable surfaces, inventory preview and game-specific hierarchy |
| UI-03 | Panel nesting | card inside panel inside rounded container | remove one or more framing levels; whitespace/dividers may do the job |
| UI-04 | Assistant-like narration | UI constantly explains what it is doing in full sentences | use compact game-state labels; explain only when the player needs help |
| GAME-01 | Table not dominant | player chrome/status panels overpower play field | table, discards, hand, turn and actions are the hierarchy |
| GAME-02 | Discards read as feed/list | thrown tiles wrap arbitrarily beside player cards | regular river-like grid while preserving DOM/reading order |
| GAME-03 | Self hand lacks ownership | own seat panel competes with hand | lower-edge hand owns the screen; self metadata becomes subordinate |
| ASSET-01 | Shrunken object on full canvas | generated nine-slice object occupies only center | enforce content occupancy and safe-area checks |
| ASSET-02 | Generated text contamination | fake labels/logos/text appear in artwork | no baked text; text remains native UI |
| ASSET-03 | Edge/chroma contamination | green fringe / clipped object / no margin | background separation + despill + padding + edge validation |
| ASSET-04 | Pretty alone, worse in UI | candidate looks good in isolation but competes with controls | approval is based on real-screen composition, not asset-only beauty |

## Batch 14 observations — 2026-08-07

### 1. The first table-centered pass was structurally correct but still looked web-like

What happened:

- seats were represented as prominent rectangular player cards
- discard areas felt attached to cards rather than placed on a table
- center status, utility chrome and hand container all had independent surfaces
- decorative gradients and rounded panels were used to create polish

Why it looked AI-generated:

The implementation solved hierarchy by adding presentation containers. This is
the same distributional default seen in generated SaaS UIs: a surface for every
concept, rounded corners, subtle gradient, shadow, then another surface inside.

Correction already applied:

- table became the visual field
- seats became subordinate metadata
- discard tiles moved toward a regular mahjong-like river
- own hand owns the lower edge
- decorative CSS gradients/glass treatments are being removed
- final skin assets, not CSS effects, own atmosphere

Do not regress this.

### 2. Deck detail improved when the actual tiles became the first-class content

What worked:

- showing tile faces immediately
- exposing total tile count / types / roles without opening form-like panels
- making "play this deck" and "edit deck" the primary actions

What still looked generic:

- summary metrics initially became four KPI cards
- deck selection became a marketplace-like card grid with hover lift

Correction:

- metrics are now a compact information rail
- selection surfaces are flatter and rely on tile previews rather than card chrome
- hover/focus uses an authored edge cue instead of floating-card animation

### 3. Deck editor became more game-like when the edited object appeared beside the controls

Initial problem:

The production editor DOM and validation behavior were valuable, but polishing
the form surfaces alone still left `UI-01` admin-form smell. The player was
editing names/counts/categories without seeing the same object they recognize in
match play.

Implemented correction:

1. reuse the production `TileCard` renderer inside each tile-edit row
2. preview the live name/emoji/fallback/category treatment
3. show count beside the tile rather than creating another metric card
4. keep semantic labels, schema validation and save behavior unchanged
5. keep validation as a side inspector
6. avoid wrapping the preview in another decorative card

Reusable lesson:

> When the domain has a strong visual object (tile, card, character, item), put
> that real object next to its editor. Styling abstract fields harder is not a
> substitute for editing the thing itself.

This is now protected by the Batch 14 visual-contract CI guard.

### 4. Image generation must be art-directed, not prompt-adjective-driven

Never use only:

```text
make it premium / modern / cinematic / cute / polished / professional
```

Those adjectives leave composition/material/hierarchy underspecified and invite
generic model defaults.

Every generation request must define:

```text
visual thesis
material/surface
single primary focal point
max two secondary focal points
quiet/negative-space zone
lighting source and intensity
silhouette at thumbnail scale
craft cues / intentional imperfections
saturation budget
edge treatment
forbidden focal zones
specific anti-patterns
how this attempt differs from rejected attempts
```

Candidate A/B/C must be conceptually different, not seed variations.

### 5. Game UI should communicate state, not narrate itself

Initial problem:

The match status used full explanatory sentences such as "手番を準備しています"
and the utility strip displayed the active skin name. These were understandable
but made the screen feel like a tool/demo describing its own implementation.

Correction:

- remove skin/debug identity from match chrome
- replace full-sentence phase narration with compact game-state vocabulary
- keep turn owner and draw-pile count visible
- reserve explanatory sublabels for moments where the player actually needs help
- keep accessibility labels and semantic status regions even when visible copy is shorter

Reusable lesson:

> Native-feeling game UI assumes the player is playing. It does not continuously
> explain that it is a game UI. Visible copy should earn its space.

### 6. Visual safeguards must become executable when the failure is expensive to repeat

Documentation alone is easy for a future agent to skip. Batch 14 therefore adds
`scripts/qa/validate-batch14-visual-contract.mjs` and runs it in CI.

The guard intentionally checks durable, high-value constraints rather than pixel
style preferences:

- learning ledger/reason codes remain present
- generated-asset briefs keep composition/focal/failure sections
- authored anti-AI override remains loaded
- decorative radial gradients do not return in the authored override layer
- match chrome does not re-add skin labels or long assistant-like narration
- deck editor continues to reuse the production `TileCard` preview

Reusable lesson:

> If a regression would recreate a known systemic failure, encode the invariant
> in CI. Keep subjective visual approval human/visual, but make the surrounding
> process and architecture machine-checkable.

## Skin-specific authored language

### Yorunoshirube

```text
world: late-night memory desk / old travel notebook / quiet station-room mood
materials: fibrous paper, aged wood, black ink, worn cloth, muted brass
light: one restrained warm lantern source; darkness is quiet, not cyberpunk
shape: practical notebook/tool geometry, slightly irregular crafted edges
color: low saturation base; warm light is scarce and therefore meaningful
imperfection: print shift, paper fibers, subtle rubbing, uneven ink pressure
avoid: neon, purple sci-fi glow, glossy gacha panels, fantasy particles everywhere
```

### Cute Pop

```text
world: playful stationery/toy-table game, friendly and readable
materials: matte printed card, soft molded toy accents, paper sticker details
light: clean soft light; no glassy bloom
shape: bolder friendly silhouette, but not every object a pill/card
color: controlled bright accents with quiet neutral support areas
imperfection: hand-cut/sticker/print cues where appropriate
avoid: candy-gloss overload, generic mobile-gacha shine, rainbow gradients everywhere
```

## Image generation review loop

```text
1. read this ledger + related rejected/not-selected records
2. state the weakest three issues in the current screen
3. decide whether an image is actually needed
4. if CSS/SVG geometry is enough, do not generate art
5. write a request with composition/focal/quiet-zone contracts
6. generate genuinely different candidates
7. run transparency/dimension/content-occupancy validation
8. place candidates in the real screen at 844x390 first
9. inspect hierarchy, text collision, tile readability and touch affordances
10. record strongest quality + weakest three + reason codes
11. reject/regenerate when the screen is worse even if the asset is beautiful
12. human approval only after real-screen comparison
13. promote only the approved candidate
14. append reusable lessons here
```

## Visual acceptance questions

Before calling a screen visually improved, answer all of these:

```text
What is the first thing the eye sees?
What is the second?
What can safely disappear without hurting play?
Is there enough quiet space?
Does any decoration compete with text or tiles?
Would this still look intentional with all labels removed?
Does it resemble a generic SaaS/dashboard/marketplace template?
Does the screen communicate the game before it communicates the UI framework?
At 25% scale, are the important silhouettes still obvious?
At 844x390, can the user act without scanning multiple boxes?
```

If the answers are unclear, the visual pass is not complete.

## External research notes

2026 research and design commentary repeatedly describe AI-generated visual
convergence: underspecified generation tends to reuse common layout/color/type
patterns. The practical lesson for Soro-pon is to constrain design with concrete
visual systems and use generated output as material inside an authored system,
not as the system itself.

A 2026 game-UI generation paper (`GameUIAgent`, arXiv:2603.14724) also reinforces
an iterative render/evaluate/correct loop and notes that adding rendering polish
can expose or amplify structural defects. For this project, structural hierarchy
must therefore be fixed before decorative polish is accepted.

This section is background only; repository contracts and real-screen evidence
remain the authority for product decisions.