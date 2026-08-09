# Batch 15-18 Authored UI Closeout

Date: 2026-08-09

## Status

Batches 15-18 are complete and squash-merged to `main`.

| Batch | Scope | Issue | PR | main commit |
| --- | --- | --- | --- | --- |
| 15 | TOP / deck selection home + loadout stage | #14 | #16 | `58b670ff84ed078a9067351f49829263f685e225` |
| 16 | deck detail loadout inspection stage | #17 | #18 | `b0ee19fb92a2362733522ee1c82f0594567b7819` |
| 17 | tile editing direct-manipulation workbench | #19 | #20 | `f3e096d6e0bf8b1b97d9f9e98359a9333bfdcd7b` |
| 18 | category editing color-palette workbench | #21 | #22 | `56cc61860adf5b938c31c180b7c7bf024c9474fc` |

All four batches preserved gameplay engine rules, persisted schema, storage semantics and skin-independent DOM/layout contracts.

## Product result

### Home / loadout

- TOP is led by the actual starter deck and production `TileCard` objects instead of a vertical web menu.
- Deck selection uses the canvas as a loadout stage; a single deck no longer sits isolated in the upper-left.
- Deck detail is play-first: tile set and roles dominate, validation is compact, utility actions are subordinate.

### Editor

- Tile editing changed from repeated per-tile input rows to `tile shelf -> selected tile editor -> global inspector`.
- Category editing changed from repeated name/color/icon rows to `color palette -> selected category editor -> global inspector`.
- Existing mutation callbacks and production validation remain authoritative; visual workbenches do not duplicate business logic.

## Durable QA lessons

### 1. A mounted screen is not a skin-ready screen

The first visual capture could race `SkinProvider` and record the fallback/default skin. Current-head capture now waits for the canonical DOM marker:

```text
document.documentElement.dataset.skin === requestedSkin
```

Do not remove this wait or replace it with a generic heading-visible check.

### 2. Measure the actual pointer target

Native checkbox/radio indicators may be ~18px while the associated `<label>` is the real clickable target. Target-size QA now measures the closest label rectangle for labeled checkbox/radio controls and the control rectangle for other interactions.

Do not weaken the 24px boundary; measure the real hit area instead.

### 3. Screenshots are review artifacts, not Git history

Current UI captures remain short-lived GitHub Actions artifacts. Do not resume committed pixel-baseline churn for ordinary polish passes. Historical evidence stays immutable.

### 4. Direct manipulation beats repeated forms

For game-building surfaces:

```text
visual object shelf/palette
-> explicit selected state
-> one selected-object editor
-> global validation/summary rail
```

Prefer this structure over rendering identical inputs for every tile/category at once.

### 5. CI green is necessary but not visual approval

Each batch used the current-head artifact for both skins and both reference viewports:

- `yorunoshirube`
- `cute-pop`
- `844x390`
- `1440x900`

The review matrix now includes TOP, deck list/detail, editor basic/category/tile/role surfaces, 3p/4p match setup/table and compact selected-tile match state.

## Final evidence used for promotion

### Batch 15

- reviewed head: `5bea2d41786e2afcf45579a5025ad96150d86daf`
- CI: `31316966000` SUCCESS
- Integrity: `31316965994` SUCCESS
- Visual Review: `31316965997` SUCCESS
- artifact: `9039040045`

### Batch 16

- reviewed head: `44a474c9d973c5eb43b23db35d5252e7f751cc72`
- CI: `31317427223` SUCCESS
- Integrity: `31317427227` SUCCESS
- Visual Review: `31317427220` SUCCESS
- artifact: `9039163403`

### Batch 17

- reviewed head: `f2599eb204c81b313ec9e4efd8ab5f87bd726863`
- CI: `31318078484` SUCCESS
- Integrity: `31318078471` SUCCESS
- Visual Review: `31318078514` SUCCESS
- artifact: `9039349617`

### Batch 18

- reviewed head: `e1d3bd5099cad3b25d10dfe80ca947cfa83564d1`
- CI: `31318588451` SUCCESS
- Integrity: `31318588453` SUCCESS
- Visual Review: `31318588455` SUCCESS
- artifact: `9039500279`

## Remaining boundaries

This closeout does not promote the wider RC beyond its existing release boundary. Physical iPhone Safari remains KNOWN UNVERIFIED / post-release non-blocking under the existing project policy. Safari rotation/soak, full Safari+VoiceOver, other real AT/device evidence and authorized Cloudflare deploy/rollback remain separate release work.
