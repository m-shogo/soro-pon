# soro-pon UI Asset Factory

## Purpose

`soro-pon` のUIパーツを、Codex / 画像生成AI / Python処理で作るための作業場。
ここは生成・透過・検査の工房であり、runtimeが直接読む場所ではありません。

Canonical workflow: `docs/IMAGE-ASSET-WORKFLOW.md`.

## Python Environment

Top-level dependencies are exactly pinned in `requirements.txt`.

```bash
python3 -m venv tools/asset-factory/soro-pon-ui/.venv
tools/asset-factory/soro-pon-ui/.venv/bin/python -m pip install --upgrade pip
tools/asset-factory/soro-pon-ui/.venv/bin/python -m pip install \
  -r tools/asset-factory/soro-pon-ui/requirements.txt
pnpm asset:image:test
```

Do not change a pin without running the complete Python fixture suite on the
intended Python version and recording that result. Exact top-level pins improve
repeatability but are not a hash-locked supply-chain guarantee; immutable
artifact/hash locking can be added when the asset pipeline becomes active again.

## Canonical Design Reference

```text
docs/design-targets/generated/soro-pon-landscape-vampon-ui-v1/
```

This reference governs composition, hierarchy, spacing, material, and mood.
It is not automatically a production asset.

## Core Workflow

```text
1. Read design reference and slot-specific asset request.
2. Generate raw subject on a high-saturation solid background.
3. Save source under raw-green/ (local-only).
4. Run deterministic chroma-key processing.
5. Validate dimensions, alpha, occupancy, fringe, edges, and slot rules.
6. Place only validated candidates in generated/candidates.
7. Review in Gallery and real consumers.
8. Human approval only -> generated/final + manifest version bump.
9. Persist reproducible generation/audit metadata in records/.
```

`pnpm asset:image:prepare` is the normal candidate preparation entry point.
Never write generated output directly into `generated/final`.

## Chroma-key Implementation

The old binary green-channel threshold implementation is gone.

```text
scripts/chroma-key-green-to-alpha.py
  compatibility wrapper only

scripts/chroma_key.py
  actual deterministic implementation
  color-distance processing
  hard + soft thresholds
  alpha interpolation
  despill
```

The wrapper remains so historical commands do not break. It delegates to the
current implementation and does not contain the obsolete binary algorithm.

## Directory Roles

```text
tools/asset-factory/soro-pon-ui/
├─ README.md
├─ requirements.txt   exact top-level Python pins
├─ prompts/           generation instructions
├─ scripts/           processing, validation, and fixture tests
├─ records/           committed candidate audit metadata
├─ raw-green/         local-only generated sources
└─ processed/         local-only intermediate output
```

Production candidates/finals:

```text
public/assets/ui/soro-pon/skins/<skin-id>/generated/candidates/
public/assets/ui/soro-pon/skins/<skin-id>/generated/final/
```

## Background / Chroma Rules

Preferred default background:

```text
#00ff00
```

Use another recorded chroma background when the subject itself needs green.
Avoid gradients, paper texture, shadow-heavy backgrounds, strong green spill,
and subject contact with the image edge.

## Visual Rules

```text
landscape UI
paper and ink material
lantern/night-desk atmosphere for Yorunoshirube
bright tactile candy/craft material for Cute Pop
readability before decoration
quiet normal state; stronger emphasis only for meaningful moments
```

Slot-specific art direction in `docs/asset-requests/` overrides generic mood
language where the two conflict.

## Do Not Commit

```text
bulk failed generations
unlicensed/existing-IP images
personal photos
local-only raw/intermediate output
credentials or provider response payloads
```

## Current Status

Asset Batches 1-4 are closed and both official skins have nine finals.
The pipeline is implemented and proven, but new asset production is not the
current task. RC integrity/evidence closure and Batch 11 come first.
