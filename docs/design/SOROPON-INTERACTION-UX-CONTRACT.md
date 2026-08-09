# Soro-pon Interaction / UX Contract

Status: canonical interaction-quality contract for touch, pointer, keyboard and motion.

The target is a landscape game UI that feels immediate and deliberate on an iPhone-class touchscreen while remaining fully usable with keyboard, pointer and assistive technology.

## External baseline

Primary references checked 2026-08-09:

- Apple Human Interface Guidelines — Buttons: https://developer.apple.com/design/human-interface-guidelines/buttons
  - frequent controls should provide a hit region around 44x44 pt
  - custom buttons need a visible pressed state
- Apple Human Interface Guidelines — Game controls: https://developer.apple.com/design/human-interface-guidelines/game-controls
  - frequent game controls: minimum 44x44 pt
  - less-important controls such as menus may be smaller (Apple gives 28x28 pt as the minimum game-control guidance)
  - keep frequent controls in comfortable thumb reach and respect safe areas
- Apple Human Interface Guidelines — Accessibility: https://developer.apple.com/design/human-interface-guidelines/accessibility
  - honor Reduce Motion and avoid unnecessary/repetitive scaling, translation, depth and blur motion
- WCAG 2.2 SC 2.5.8 Target Size (Minimum): https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum
  - 24x24 CSS px minimum or sufficient spacing for pointer targets
- WCAG 2.2 focus guidance: https://www.w3.org/WAI/WCAG22/Understanding/focus-appearance
  - focus must remain obvious and sufficiently visible

These references are baselines, not a license to copy platform chrome. Soro-pon keeps its authored visual identity while adopting the usability constraints.

## Target hierarchy

### Frequent gameplay actions

Examples: ツモ / ロン / 捨てる.

Contract:

- minimum target height: `--sp-touch-min` (44px)
- position near the lower/right thumb zone in compact landscape
- respect `safe-area-inset-right` and `safe-area-inset-bottom`
- always show immediate press feedback
- no hover-only affordance required to understand the action

### Secondary compact controls

Examples: 中断, editor tabs, role-template actions, compact form controls.

Contract in 844x390-class viewport:

- use 32-36px visual/target height where the full 44px target would materially reduce the play field
- never go below WCAG 2.2 AA's 24px target requirement
- retain spacing and clear text labels
- destructive actions stay visually subordinate until confirmation

## Action hierarchy / cognitive load

The likely next action must be easier to find than maintenance or destructive actions.

- gameplay screens: the next playable action owns the strongest visual treatment
- a disabled primary action should explain the next step with its visible label when compact mode hides secondary copy
- selection must echo into the commit action (`4人戦` -> `4人戦をはじめる`) so users can verify state before acting
- routine navigation and maintenance must not share equal emphasis
- TOP keeps play/deck/collection actions in the main group; recovery/reset live under `データ管理`
- irreversible operations require an additional explicit confirmation step
- maintenance copy can be explanatory inside a modal; normal game chrome should stay short

## Input modality rules

### Touch / coarse pointer

- no sticky hover presentation after tap
- `:active` feedback remains visible even if the browser also matches `:hover`
- use `touch-action: manipulation` for direct controls
- do not rely on hover lift, tooltip, or pointer-only choreography

### Mouse / trackpad

- subtle hover feedback is allowed only when `(hover: hover) and (pointer: fine)`
- hover must not move layout or make cards look like floating SaaS surfaces

### Keyboard / switch access

- global focus ring remains visible above every cascade layer
- focused items in scroll regions receive scroll margin/padding so the focus indicator is not flush against a clipped edge
- DOM order remains the reading/focus order; visual table placement must not reorder semantics

## Motion rules

Motion must communicate a state change, not decorate idle UI.

Allowed examples:

- one-time drawn-tile arrival
- short win-action emphasis
- short Result entrance
- orientation hint

Rules:

- avoid large translation, scale, parallax, z-depth and blur transitions
- prefer brightness/edge changes for press feedback
- no infinite decorative animation in gameplay
- `prefers-reduced-motion: reduce` disables nonessential animations completely rather than merely running them very quickly
- state meaning must remain understandable when all motion is disabled

## Compact landscape priorities (844x390)

Order of ownership:

1. table / discard rivers
2. player's hand
3. primary actions
4. turn / draw-pile state
5. opponent identity
6. utility / editor secondary controls

When space is tight, reduce or remove lower-priority chrome before shrinking primary targets or tiles.

## Review checklist

For every interaction/UI pass:

1. Can the main action be reached without scanning the full screen?
2. Is the main action at least 44px high in gameplay?
3. Does every custom button visibly react while pressed?
4. Does a touch tap leave any fake hover state behind?
5. Can keyboard focus be seen without being clipped by a scroll edge?
6. Does Reduce Motion remove translation/pulse animations without hiding state?
7. At 844x390, did a secondary control steal space from the table or hand?
8. Does the user understand state from position, labels and objects rather than animation alone?
9. Are destructive actions separated from the likely next action?
10. Is the screen still game-like rather than a dashboard after the usability changes?

## Machine-enforced invariants

`scripts/qa/validate-interaction-ux-contract.mjs` checks the durable parts of this contract in CI. Subjective feel still requires real-screen evaluation; CI green is not visual approval.
