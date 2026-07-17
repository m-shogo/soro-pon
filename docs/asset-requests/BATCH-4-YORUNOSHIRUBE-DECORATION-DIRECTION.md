# Batch 4 Art Direction Addendum: Yorunoshirube Decoration

## Status

**Planning artifact only, decoration-layer scope.** This document does not
redefine the Yorunoshirube world (`BATCH-3-YORUNOSHIRUBE-ART-DIRECTION.md`
remains canonical for the core statement, material hierarchy, and color
tokens). It defines the small accent layer only: the one A-class
image-generation slot for this batch (`badge.info.background`) and the
density/material rules that keep it — and the audited B/C decoration
surfaces — subordinate to the already-final core surfaces.

## Core principle

Core surfaces are already complete. All 8 Batch 3 core slots (table,
panels, buttons, tiles) are final on Yorunoshirube v3. Batch 4 must add
small semantic accents without competing with tiles, buttons, panel text,
or the table for visual attention. A badge is read for a fraction of a
second next to a validation message or a score line; it must never be the
loudest thing on screen.

## Density budget

```
badge.info:
  small but recognizable
  medium-low detail
  survives 24x20

badge.warning:
  deterministic and semantic (CSS-token; audited sufficient, see
  BATCH-4-YORUNOSHIRUBE-APPROVAL-PACK.md B/C audit)
  higher urgency conveyed by hue/label text, not more illustration

table.overlay.ink:
  very low density, ambient only (CSS radial-gradient; audited sufficient)

table.overlay.light:
  very low density, does not become a second CTA (CSS radial-gradient;
  audited sufficient)

panel.paper.emphasis:
  shared tint/highlight (box-shadow token; audited sufficient)
  no duplicated frame art
```

## badge.info.background material vocabulary

Used-by: `Badge.tsx` (`variant="info"`) → `CollectionScreen`,
`DeckEditorScreen`, `DeckDetailScreen`, `DeckListScreen`,
`ValidationIssueList` (embedded in DeckEditor/DeckDetail), `AppRoot`,
Component Gallery.

使用可 (material only, not literal motifs to copy):

```
薄い蝋引き紙 (thin waxed paper)
地図帳の索引 (atlas index tab)
グラシン紙 (glassine paper)
インクの印 (ink stamp mark)
小さな琥珀点 (small amber dot)
写真フィルムの見出し (photographic-film heading strip)
夜の記録ラベル (night record label)
```

使用禁止:

```
Cute Popのリボンタブの色替え (recoloring Cute Pop's ribbon tab)
ジェリー / アイシング / キルト / 刺繍 (Cute Pop material vocabulary)
大きな切符 (large ticket shape)
buttonに見える立体感 (button-like 3D bevel)
panelに見える大きな枠 (panel-scale frame)
黒金高級UI (black-gold luxury UI)
ネオン (neon)
封蝋の大きな紋章 (large wax-seal emblem)
読める文字 / 数字 / ロゴ (legible letters / numerals / logo)
```

## Why badge.info.background is the one A-class gap

- Cute Pop already has a final `badge.info.background` (request 007,
  candidate B, v3) — this is a cross-skin parity gap, not a new slot.
- It appears on multiple frequently-visited screens (Collection, DeckList,
  DeckEditor, DeckDetail, Gallery), unlike the D-class dead effect slots.
- At 24x20 minimum render size, CSS alone (flat color + border, current
  fallback) cannot add the tactile paper/ink identity the rest of the
  Yorunoshirube family already has without becoming either a duplicate of
  `panel.paper.default`'s nine-slice asset or a literal color-swap of
  Cute Pop's ribbon.
- It is small and low-risk: a 3:1-ish nine-slice chip, not a new full
  surface, keeping the production/maintenance cost proportionate.

## Why the audited B/C slots remain CSS/token/shared-overlay

See `docs/asset-requests/evidence/batch-4-yorunoshirube-decoration-audit/`
and the classification table in
`docs/asset-requests/BATCH-4-YORUNOSHIRUBE-APPROVAL-PACK.md` for the
per-slot audit result. Summary: all four audited B/C slots
(`badge.warning.background`, `table.overlay.ink`, `table.overlay.light`,
`panel.paper.emphasis`) passed real-screen readability/hierarchy checks
with their current deterministic implementation; no image generation or
CSS change was required for any of them.
