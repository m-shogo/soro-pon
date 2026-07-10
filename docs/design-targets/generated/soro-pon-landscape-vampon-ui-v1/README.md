# Soro-pon Landscape UI — Yorunoshirube Reference v1

## Purpose

This directory is the official visual reference set for the `yorunoshirube` skin.

```text
844x390 landscape-first
Vamp-pon world memory-tile game
night desk / paper / black ink / lantern light / memory book
```

It is not the only future design of Soro-pon.

Official skin plan:

```text
yorunoshirube: this directory is the current reference
cute-pop: separate reviewed design-target set must be created before final art production
```

## Mandatory Contract Read

Before implementing from these references, read:

```text
docs/DESIGN-SYSTEM.md
docs/SKIN-SYSTEM.md
docs/UI-COMPONENT-CONTRACT.md
docs/SKIN-AUTHORING-GUIDE.md
docs/DESIGN-IMPLEMENTATION-POLICY.md
docs/ASSET-PIPELINE.md
```

These images do not override layout, hit-area, accessibility, component, or skin contracts.

## Use As

```text
composition reference
spacing and hierarchy reference
mood and material reference
screen-to-screen visual consistency reference
future image-generation reference
screenshot comparison target
```

Do not use these screenshots directly as production backgrounds or sprites without explicit review.

## Adopted Screens

```text
01-top.png
02-deck-list.png
03-deck-detail.png
04-match-setup.png
05-deck-editor.png
06-tile-editor.png
07-match-discard-phase.png
08-match-win-or-ron-phase.png
09-result.png
10-collection.png
```

Screen intent:

```text
01 TOP: entry CTA, recent records, overall night-desk tone
02 Deck List: list/filter/detail preview
03 Deck Detail: information, validation, start/edit paths
04 Match Setup: player count and pre-match confirmation
05 Deck Editor: navigation, form, preview/validation
06 Tile Editor: tile fields, emoji/category preview
07 Match Discard: all discards, player hand, actions
08 Win/Ron: focused decision/emphasis state
09 Result: winner, groups, bonuses, reward, next action
10 Collection: records/collection/filter/detail
```

## Additional Target Names

When reviewed target images are added, use stable names such as:

```text
11-clear-board.png
12-achievement-unlock.png
13-confirm-dialog.png
14-error-dialog.png
15-role-editor.png
16-category-editor.png
17-balance-check.png
18-import-export.png
19-bonus-editor.png
20-specific-set-template.png
```

Cute Pop targets should live in a separate clearly named directory, not inside this Yorunoshirube directory.

## Quality Bar

```text
landscape-first
strong Yorunoshirube identity
paper / ink / lantern-light hierarchy
Donjara/mahjong-table information clarity
player hand remains primary
all discards remain readable
tile names and category indications remain readable
shared UI language across screens
```

## Implementation Boundary

The runtime uses one shared layout and component system for every skin.

```text
this reference may change presentation
it may not create Yorunoshirube-only screens
it may not change hit areas or layout contracts
it may not bake dynamic text or semantic state into images
```

Nine-slice, three-slice, repeat, cover, overlay, and mask behavior must use shared Skin renderers.

## Foundation Phase

During current skin-system foundation work:

```text
do not generate final PNG assets
implement CSS/token/SVG fallback
register future asset slots and geometry contracts
write candidate-generation prompts for later use
```

Later generated/drawn assets enter `generated/candidates`, receive human review, then move to `generated/final`.

## Do Not Store Officially

```text
existing IP character art
existing IP names as the visual focus
personal photos
unlicensed material
local-only test assets
```

Local-only raw references belong outside official docs, for example:

```text
/Users/m-shogo/Developer/personal/soro-pon/.local-design/
```

## Vamp-pon Source Policy

When using Vamp-pon world/character/enemy/stage/item/visual rules, read:

```text
/Users/m-shogo/Developer/personal/vamp-pon/docs/shared-vampon-master-index.md
docs/42-shared-vampon-source-policy.md
docs/45-vampon-reference-gate.md
```

The `vamp-pon` repository is read-only.

## Final Decision

This directory defines the Yorunoshirube visual target only. Soro-pon itself is a multi-skin application with one stable component/layout implementation.