# Batch 13 — Pre-implementation UI Audit

Source SHA: `37110de0f5dda98411123cf0aed86069e5e97011`

The automated match audit covered both official skins, three-player and
four-player setup, and all six required viewports: 24 cases. Representative
Before captures are under
`evidence/batch-13/visual-review/before/`; the complete machine-readable result
is `automated-layout-audit.json`.

## Findings

| ID | Classification | Cases | Finding |
|---|---|---:|---|
| B13-UI-001 | OVERFLOW / PRODUCT_DEFECT | 24/24 | opponent-seat row scroll height exceeded its fixed grid row |
| B13-UI-002 | RESPONSIVE / PRODUCT_DEFECT | desktop samples | match table collapsed to content height instead of filling the 900px safe area |
| B13-UI-003 | INFORMATION_HIERARCHY | all | status, seats, played tiles, hand, and actions did not form a table-centered overview |
| B13-UI-004 | RESPONSIVE | 3-player | three-player mode reused the four-player shell and only changed discard columns |
| B13-UI-005 | CONTRAST | compact Yorunoshirube | played-tile labels and progress text sat directly on decoration |
| B13-UI-006 | DECORATION_INTERFERENCE | both skins | table imagery carried information text without a dedicated semantic surface |

The detector found no document overflow, viewport-outside controls, or enabled
targets below 44×44 in these 24 initial-match cases. That does not close other
screens; existing visual suites and the post-implementation audit cover their
current representative states.

## Implementation decision

Replace the five-strip match layout with a full-height semantic shell,
dedicated three/four-player grids, seat-owned discard areas, a compact center
status surface, a self-first hand zone, and a stable horizontal action zone.
No game rule, persistence schema, import contract, or skin manifest changes are
permitted.

