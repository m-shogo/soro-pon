# CODEX.md

Codex向けの作業指示。

## Current Status

```text
Gameplay MVP phases 1-14: implemented
Current next phase: multi-skin design-system foundation
Official skins: yorunoshirube / cute-pop
Final image generation: later separate reviewed phase
```

過去の「MVP Phase 1開始可能」は古い状態です。`docs/IMPLEMENTATION-WORKFLOW.md` で現在地を確認してください。

## Read First

```text
README.md
AGENTS.md
docs/README.md
docs/MASTER-SPEC.md
docs/IMPLEMENTATION.md
docs/IMPLEMENTATION-WORKFLOW.md
```

## Mandatory UI / Design / Skin Read

UI、CSS、token、component、asset、motion、responsiveを扱う場合、プロンプトに書かれていなくても必ず読む。

```text
docs/DESIGN-SYSTEM.md
docs/SKIN-SYSTEM.md
docs/UI-COMPONENT-CONTRACT.md
docs/SKIN-AUTHORING-GUIDE.md
docs/DESIGN-IMPLEMENTATION-POLICY.md
docs/ASSET-PIPELINE.md
docs/48-responsive-crisp-ui-system.md
docs/49-ui-quality-gate-and-codex-design-rules.md
docs/50-pro-ui-production-quality-checklist.md
docs/design-targets/generated/soro-pon-landscape-vampon-ui-v1/README.md
```

## Current UI Contract

```text
one stable layout and component implementation
multiple validated visual skins
no skin-specific screens
shared common components only
layout/hit areas/state meaning remain unchanged by skin
asset URLs and nine-slice logic are centralized
both skins work without final image assets
```

Supported shared render modes:

```text
nine-slice-stretch
nine-slice-tile
three-slice-x
three-slice-y
stretch
repeat / repeat-x / repeat-y
cover
contain
overlay
mask
```

Do not implement these independently inside screens.

## Image Generation Boundary

During the current foundation phase:

```text
do not invoke image generation
do not create final PNGs
do not write generated output into generated/final
implement contracts, switching, shared components, fallbacks, validator, and future asset lists
```

During a later explicit asset-production task:

```text
output -> generated/candidates
preview and compare
human approval
-> generated/final
```

Codex may prepare slot-specific future generation prompts, but must not run them unless the task explicitly requests the asset-production phase.

## Shared Component Rule

Before adding UI:

```text
reuse existing shared component
-> add reusable central variant
-> add Component Gallery coverage
-> verify yorunoshirube and cute-pop
-> use in screen
```

Screen-local generic Button/Panel/Dialog/Form implementations are forbidden.

## Security Boundary for Future Paid Skins

```text
validated tokens and registered assets only
no arbitrary CSS/JS/HTML
no external URLs
no external fonts
no layout or pointer-event control
no engine/schema/storage/records/network access
```

## Architecture Boundary

```text
UI does not implement role/scoring/wildcard logic
engine does not import React/DOM/localStorage/CSS
shared deck JSON contains no image/URL/base64/path/html/script/style fields
```

## Orientation

```text
844x390 reference
phone landscape: 100svw x 100svh
PC: centered table + outer support
portrait: rotate prompt or limited utility
```

Do not scale the full screen as a fixed canvas.

## Stack

```text
TypeScript
React
Vite
Zod
Vitest
CSS / CSS Modules
localStorage first
```

Review dependency policy and ADR before adding major libraries.

## Vamp-pon Reference

```text
/Users/m-shogo/Developer/personal/vamp-pon/docs/shared-vampon-master-index.md
docs/42-shared-vampon-source-policy.md
docs/45-vampon-reference-gate.md
```

The `vamp-pon` repository is read-only.

## Work and Report

Use small testable commits and push each completed purpose.

Report changed files, commit SHA, tests/typecheck/build, visual verification, remaining risks, and next step.