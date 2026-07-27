# Batch 13 — Visual Review Pack

## Before / After

Representative captures for Cute Pop and Yorunoshirube, three/four players,
compact 844×390, and desktop 1440×900 are stored under:

```text
docs/qa/evidence/batch-13/visual-review/before/
docs/qa/evidence/batch-13/visual-review/after/
```

The complete automated audit covers both skins and player counts at 844×390,
812×375, 932×430, 1024×576, 1280×720, and 1440×900. The After summary passed
24/24 cases with zero document overflow, target overflow, viewport escape,
sub-44px enabled targets, or top-level region collisions.

## Reviewed visual baselines

The following twelve new baselines were generated independently from existing
visual snapshots and reviewed before acceptance:

| Baseline group | Classification | Review |
|---|---|---|
| Cute Pop 3p compact / desktop | EXPECTED_DESIGN_CHANGE, FIXED_READABILITY | upper-corner opponents, centered status, self-first hand; no empty fourth seat |
| Cute Pop 4p compact / desktop | EXPECTED_DESIGN_CHANGE, FIXED_COLLISION | four readable seats, stable action row, patterns behind dedicated surfaces |
| Yorunoshirube 3p compact / desktop | EXPECTED_DESIGN_CHANGE, FIXED_READABILITY | ink/light decoration remains behind opaque information surfaces |
| Yorunoshirube 4p compact / desktop | EXPECTED_DESIGN_CHANGE, FIXED_COLLISION | left/top/right/self overview; status and labels no longer sit directly on decoration |
| Cute Pop focus / action compact | EXPECTED_DESIGN_CHANGE, FIXED_READABILITY | keyboard focus ring, selected tile, primary and disabled actions remain distinct |
| Yorunoshirube focus / action compact | EXPECTED_DESIGN_CHANGE, FIXED_READABILITY | focus and selected states remain visible without relying on glow or color alone |

## Human-oriented review

- Current turn and draw-pile state are centered and readable.
- The self hand is the largest repeated control group and remains at the bottom.
- Every played area is visibly owned by its seat.
- Three-player mode uses two upper opponents without an empty fourth seat.
- Four-player mode reads left/top/right/self at a glance.
- Primary and disabled actions remain in a stable bottom row.
- Both skins keep their identity while sharing exactly one layout/semantic DOM.
- Desktop uses the available table height instead of collapsing to a short
  phone-like strip.

Focus is represented by the shared double-ring contract and selected tiles use
both elevation and `aria-pressed`. Result appearance remains covered by the
existing both-skin Result suite.

## Decision

```text
REGRESSION: 0
UNKNOWN: 0
automated layout audit: 24/24 PASS
new reviewed snapshots: 12
```

The Before audit reproduced 24 opponent-row overflow findings. The After audit
records zero overflow, viewport escape, sub-44px enabled target, and top-level
region collision findings across all 24 skin/player/viewport cases. This is
loopback visual and geometry evidence; it is not a physical-device claim.
