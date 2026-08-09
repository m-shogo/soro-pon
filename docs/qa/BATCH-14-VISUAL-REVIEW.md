# Batch 14 Visual Review

## Status

Batch 14 visual/UI review is **COMPLETE**.

```text
reviewed PR HEAD: f134755fb961b455f751c661c98018233dbd76cb
Visual Review run: 31314974844 — SUCCESS
artifact: 9038478453
artifact digest: sha256:5cbf96d8bd2b535ca3c115472b010fdabae30fe9ddbf37d48d848d765ad7e77f
CI run: 31314974888 — SUCCESS
Integrity run: 31314974887 — SUCCESS
main squash integration: 30c6e84393a216ae5f561e955886595d12c89f8f
PR #10: merged
Issue #12: closed / completed
```

The squash commit integrates the reviewed PR tree into `main`; subsequent documentation-only closeout synchronization does not replace the reviewed UI artifact.

## Purpose

For any future UI change, visual approval must be based on the **current changed HEAD**, not on Batch 13 snapshots or this completed Batch 14 artifact.

The canonical review flow captures current UI in GitHub Actions and stores screenshots as a short-lived workflow artifact. Review images are intentionally not committed to Git on every polish pass.

## Canonical command

```bash
pnpm qa:batch14:review-capture
```

Capture suite: `tests/visual/batch14-review-capture.spec.ts`.

## Required review matrix

Both skins:

- `yorunoshirube`
- `cute-pop`

Both viewport classes:

- `844x390` compact landscape
- `1440x900` desktop

Product surfaces:

- TOP
- deck list
- deck detail
- deck editor basic workspace
- deck editor tile workspace
- deck editor role composer
- match setup: 3-player and 4-player
- match table: 3-player and 4-player
- compact 4-player selected-tile / discard-action state

## Git hygiene

- Current changed-head review screenshots belong in the `Batch 14 Visual Review` Actions artifact.
- Do not create a new committed screenshot baseline for every polish pass.
- Historical Safari and Batch 13 evidence under `docs/qa/evidence/` stays immutable evidence and must not be rewritten to represent newer UI.
- The retired Batch 13 Playwright spec and its darwin pixel snapshots are removed from the current tree; Git history remains the historical record.
- Batch 14 was integrated to `main` with squash so its long exploratory working history did not become mainline history.
- Future long UI working branches should follow the same squash-after-current-head-approval policy.

## Review method

For each matrix cell:

1. Confirm no viewport overflow or clipped primary interaction.
2. Confirm enabled pointer targets are at least 24x24 CSS px, with frequent match actions at least 44x44.
3. For checkbox/radio controls, measure the enclosing label when the label is the actual pointer target.
4. Confirm visible match controls, player panels, center state and hand tiles do not occlude each other; broad intentional overlay wrappers are not treated as painted content.
5. Confirm editor tile inputs and role composer remain usable in compact landscape, not merely visible on desktop.
6. Identify the weakest three visible problems before adding decoration.
7. Fix hierarchy, spacing, occlusion, text density and interaction emphasis before visual effects.
8. Re-run the artifact capture on the new changed HEAD.

CI green is necessary but is not visual approval.

## Batch 14 defects found by the final review loop

The artifact/gates found real defects and the implementation fixed them rather than weakening the checks:

```text
compact exit utility overlapped right player identity
  -> reserved explicit upper-right clearance

tile-editor text inputs were below the 24px pointer-target floor
  -> shared form-control hooks + 32/36px control targets

compact role-composer body flex-shrank out of view
  -> non-shrinking scroll content + readable two-column preset bench
```

These fixes are now protected by interaction/review-hygiene contracts.

## Completion boundary for future UI work

A future changed UI is visually approved only when the changed HEAD has a reviewed artifact covering the applicable matrix and no release-blocking hierarchy, overlap, clipping, target-size or interaction defect remains.
