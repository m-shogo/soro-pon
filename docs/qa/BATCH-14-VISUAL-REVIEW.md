# Batch 14 Visual Review

## Purpose

Batch 14 visual approval must be based on the current PR HEAD, not on Batch 13 snapshot baselines.

The canonical review flow captures the current UI in GitHub Actions and stores screenshots as a short-lived workflow artifact. Review images are intentionally not committed to Git on every UI pass.

## Canonical command

```bash
pnpm qa:batch14:review-capture
```

The capture suite is `tests/visual/batch14-review-capture.spec.ts`.

## Required review matrix

Capture both skins:

- `yorunoshirube`
- `cute-pop`

Capture both viewport classes:

- `844x390` compact landscape
- `1440x900` desktop

Capture these product surfaces:

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

- Current-head review screenshots belong in the `Batch 14 Visual Review` Actions artifact.
- Do not create a new committed screenshot baseline for every polish pass.
- Historical Safari and Batch 13 evidence under `docs/qa/evidence/` stays immutable evidence and must not be rewritten to represent Batch 14.
- The retired Batch 13 Playwright spec and its darwin pixel snapshots are removed from the current tree; Git history remains the historical record.
- The final merge to `main` should use squash so the long working-branch history does not become mainline history.

## Review method

For each matrix cell:

1. Confirm there is no viewport overflow or clipped primary interaction.
2. Confirm interactive controls are at least 24x24 CSS px, with frequent match actions at least 44x44.
3. Confirm visible match controls, player panels, center state and hand tiles do not occlude each other; broad intentional overlay wrappers are not treated as painted content.
4. Identify the weakest three visible problems before adding decoration.
5. Fix hierarchy, spacing, occlusion, text density and interaction emphasis before visual effects.
6. Re-run the artifact capture on the new HEAD.

CI green is necessary but is not visual approval. The review artifact must be from the same HEAD being evaluated.

## Completion boundary

Batch 14 visual review is complete only when the current HEAD has a reviewed artifact covering the matrix above and no release-blocking visual hierarchy, overlap, clipping or interaction defects remain.
