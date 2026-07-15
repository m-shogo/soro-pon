# Soro-pon Documentation Index

## Current Status

```text
Gameplay MVP phases 1-14: complete
Multi-skin runtime baseline: complete
Skin foundation hardening H1-H11 (P0/P1/P2): complete
Image production: active — see docs/ASSET-PRODUCTION-ROADMAP.md
Official skins: yorunoshirube / cute-pop
```

Do not use numbered documents as the primary entry point.

## Start Here

Every agent reads:

```text
README.md
AGENTS.md
CODEX.md or CLAUDE.md
docs/MASTER-SPEC.md
docs/IMPLEMENTATION.md
docs/IMPLEMENTATION-WORKFLOW.md
docs/SKIN-FOUNDATION-HARDENING.md
docs/GLOSSARY.md
```

Current product/spec truth:

```text
docs/MASTER-SPEC.md
```

Current implementation state and next phase:

```text
docs/IMPLEMENTATION-WORKFLOW.md
docs/SKIN-FOUNDATION-HARDENING.md
```

## UI / Design / Skin — Mandatory for Any UI Work

Read all of these before changing screens, components, styles, tokens, assets, motion, responsive behavior, or skin loading:

```text
docs/DESIGN-SYSTEM.md
docs/SKIN-SYSTEM.md
docs/SKIN-FOUNDATION-HARDENING.md
docs/UI-COMPONENT-CONTRACT.md
docs/SKIN-AUTHORING-GUIDE.md
docs/DESIGN-IMPLEMENTATION-POLICY.md
docs/ASSET-PIPELINE.md
docs/IMAGE-ASSET-WORKFLOW.md
docs/ASSET-PRODUCTION-ROADMAP.md
docs/48-responsive-crisp-ui-system.md
docs/49-ui-quality-gate-and-codex-design-rules.md
docs/50-pro-ui-production-quality-checklist.md
docs/design-targets/generated/soro-pon-landscape-vampon-ui-v1/README.md
```

Key current rules:

```text
one layout and component system
multiple validated skins
no skin-specific screens
shared Button/Panel/Dialog/Form/Tile components
Unity/Godot-style slice rendering only through shared Skin renderers
layout/hit areas/game state never controlled by skin
external skins use an explicit typed token allowlist
both official skins must work without final PNGs (still true — most slots remain fallback)
image generation is active; candidates go through human review before final
```

## Hardening Priority (P0/P1/P2: complete)

```text
P0 (required before image production) — complete:
- explicit skin-token allowlist and range validation
- full skin contract / filesystem validator
- semantic contrast and Cute Pop correction
- Gallery and user-facing SkinSelector
- layered SkinSurface and real nine-slice proof

P1 (required before public demo) — complete:
- DOM/component and visual regression tests (32 Playwright cases, 5 sizes, both skins)
- accessibility completion
- ErrorBoundary/ErrorState/data reset
- dynamic light/dark browser color scheme
- common-component/CSS responsibility completion

P2 (required before installed/paid skins) — complete for current scope:
- external file trust policy
- versioned/preloaded/atomic skin switching
- package integrity/entitlement boundary (marketplace/payment/entitlement commerce itself is future scope)
- complete match-record idempotency (restore/replay feature itself remains non-MVP)
```

Full status/exception detail: docs/SKIN-FOUNDATION-HARDENING.md.
Asset production status/plan: docs/ASSET-PRODUCTION-ROADMAP.md.

## Architecture / API / Rule Contracts

```text
docs/ARCHITECTURE-BOUNDARIES.md
docs/ENGINE-API.md
docs/MATCH-STATE-MACHINE.md
docs/ERROR-CODES.md
docs/TESTING-STRATEGY.md
docs/PERFORMANCE-GUARDRAILS.md
docs/TECHNICAL-RISK-REGISTER.md
docs/MIGRATIONS.md
docs/ADR.md
```

## Implementation Governance

```text
docs/IMPLEMENTATION-GOVERNANCE.md
docs/IMPLEMENTATION-STRUCTURE.md
docs/FIXTURE-STRATEGY.md
docs/CODING-RULES.md
docs/DEPENDENCY-POLICY.md
docs/CI-GATES.md
docs/ACCEPTANCE-CRITERIA.md
docs/THREAT-MODEL.md
docs/MANUAL-QA.md
docs/RELEASE-DEMO-GATES.md
```

## Current Rule / Engine Detail

Use only when needed:

```text
docs/62-mahjong-structure-scoring-core.md
docs/63-typescript-engine-implementation-blueprint.md
docs/64-breaking-risk-review-and-fixes.md
docs/65-group-backed-schema-override.md
docs/66-group-backed-mvp-test-override.md
docs/68-custom-deck-robustness-guardrails.md
docs/69-adversarial-custom-deck-patterns.md
docs/70-deck-rules-and-scoring-law.md
docs/71-scoring-budget-and-image-security.md
docs/72-score-budget-schema-and-defaults.md
docs/73-safe-deck-creator-rules-and-tips.md
docs/74-strict-import-contract-and-edit-boundary.md
samples/animal-starter.deck.json
```

`docs/67-current-implementation-source-of-truth.md` and `docs/75-current-mvp-master-spec.md` are compatibility pointers only. They are not primary truth.

## Vamp-pon Reference Gates

When using world, character, enemy, stage, weapon, item, or visual-lore material:

```text
docs/42-shared-vampon-source-policy.md
docs/44-vampon-character-generation-gate.md
docs/45-vampon-reference-gate.md
/Users/m-shogo/Developer/personal/vamp-pon/docs/shared-vampon-master-index.md
```

The `vamp-pon` repository is read-only from this project.

## Conflict Resolution

Priority:

```text
1. docs/MASTER-SPEC.md
2. current non-numbered contract docs
3. docs/SKIN-FOUNDATION-HARDENING.md for the current UI hardening order
4. docs/IMPLEMENTATION-WORKFLOW.md for status
5. current numbered detail docs
6. historical/compatibility docs
```

For UI conflicts, `DESIGN-SYSTEM.md`, `SKIN-SYSTEM.md`, and `SKIN-FOUNDATION-HARDENING.md` define the current design contract unless MASTER-SPEC is explicitly updated otherwise.
