# CODEX.md

Codex向けの作業指示。

## Current Status

```text
Gameplay MVP phases 1-14: implemented
Multi-skin runtime baseline: implemented / partial
Current next phase: docs/SKIN-FOUNDATION-HARDENING.md のH1から順に実装
Official skins: yorunoshirube / cute-pop
Final image generation: all P0 gates completion後の別工程
```

過去の「MVP Phase 1開始可能」は古い状態です。`docs/IMPLEMENTATION-WORKFLOW.md` と `docs/SKIN-FOUNDATION-HARDENING.md` で現在地を確認してください。

## Read First

```text
README.md
AGENTS.md
docs/README.md
docs/MASTER-SPEC.md
docs/IMPLEMENTATION.md
docs/IMPLEMENTATION-WORKFLOW.md
docs/SKIN-FOUNDATION-HARDENING.md
```

## Mandatory UI / Design / Skin Read

UI、CSS、token、component、asset、motion、responsive、skin loadingを扱う場合、プロンプトに書かれていなくても必ず読む。

```text
docs/DESIGN-SYSTEM.md
docs/SKIN-SYSTEM.md
docs/SKIN-FOUNDATION-HARDENING.md
docs/UI-COMPONENT-CONTRACT.md
docs/SKIN-AUTHORING-GUIDE.md
docs/DESIGN-IMPLEMENTATION-POLICY.md
docs/ASSET-PIPELINE.md
docs/48-responsive-crisp-ui-system.md
docs/49-ui-quality-gate-and-codex-design-rules.md
docs/50-pro-ui-production-quality-checklist.md
docs/design-targets/generated/soro-pon-landscape-vampon-ui-v1/README.md
```

## Hardening Order

```text
H1 explicit typed skin-token allowlist
H2 full contract validator and pnpm skin:validate / CI
H3 semantic contrast and Cute Pop correction
H4 user-facing and Gallery SkinSelector
H5 layered SkinSurface and real nine-slice proof
H6 additional renderer modes only with tests and examples
H7 shared component and CSS responsibility migration
H8 DOM/accessibility/recovery tests and implementation
H9 Playwright visual regression and five-size QA
H10 installed/paid skin trust, versioned preload, atomic switching
H11 persistent matchSessionId idempotency before replay/restore
```

Do not skip ahead. Use one purpose per commit, run relevant checks, update docs, commit, and push before the next item.

## Current UI Contract

```text
one stable layout and component implementation
multiple validated visual skins
no skin-specific screens
shared common components only
layout/hit areas/touch size/z-index/state meaning remain unchanged by skin
asset URLs and slice logic are centralized
external skins can change only explicit typed allowlisted presentation values
both skins work without final image assets
```

Do not implement render behavior independently inside screens.

## Image Generation Boundary

During the current hardening phase:

```text
do not invoke image generation
do not create final PNG/WebP
do not write generated output into generated/final
implement contracts, switching, shared components, fallbacks, validators, and future asset lists
```

Only after all P0 gates pass and a later explicit asset-production task begins:

```text
output -> generated/candidates
preview and compare
human approval
-> generated/final
```

Codex may prepare slot-specific future generation prompts, but must not run them during foundation hardening.

## Shared Component Rule

Before adding UI:

```text
reuse existing shared component
-> add reusable central variant/component
-> add semantic/component token
-> add Gallery coverage
-> add component/visual tests
-> verify yorunoshirube and cute-pop
-> use in screen
```

Screen-local generic Button/Panel/Dialog/Form implementations are forbidden.

## Security Boundary for Future Paid Skins

```text
validated typed tokens and registered assets only
no arbitrary CSS/JS/HTML
no external URLs or external fonts
no external SVG by default
no layout/touch/z-index/pointer-event control
no engine/schema/storage/records/network access
versioned/preloaded/atomic application before distribution
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

Review dependency policy and add ADR before major dependencies, including DOM and visual-test tools.

## Vamp-pon Reference

```text
/Users/m-shogo/Developer/personal/vamp-pon/docs/shared-vampon-master-index.md
docs/42-shared-vampon-source-policy.md
docs/45-vampon-reference-gate.md
```

The `vamp-pon` repository is read-only.

## Work and Report

Use small testable commits and push each completed purpose.

Report changed files, commit SHA, commands/local results, CI status or unavailable, affected skins/screens, visual verification, remaining risks, and next hardening item.
