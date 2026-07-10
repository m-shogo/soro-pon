# Soro-pon Documentation Index

## Current Status

```text
Gameplay MVP phases 1-14: implemented
Current next work: multi-skin design-system foundation
Final PNG generation: later separate reviewed phase
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
docs/GLOSSARY.md
```

Current product/spec truth:

```text
docs/MASTER-SPEC.md
```

Current implementation state and next phase:

```text
docs/IMPLEMENTATION-WORKFLOW.md
```

## UI / Design / Skin — Mandatory for Any UI Work

Read all of these before changing screens, components, styles, tokens, assets, motion, or responsive behavior:

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

Key current rules:

```text
one layout and component system
multiple validated skins
no skin-specific screens
shared Button/Panel/Dialog/Form/Tile components
Unity/Godot-style nine-slice through shared SkinSurface
three-slice/repeat/cover/contain/overlay/mask through shared renderers
layout/hit areas/game state never controlled by skin
both official skins must work without final PNGs
no final image generation during foundation phase
future generated images go to candidates before human-reviewed final
```

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
3. docs/IMPLEMENTATION-WORKFLOW.md for status
4. current numbered detail docs
5. historical/compatibility docs
```

For UI conflicts, `DESIGN-SYSTEM.md` and `SKIN-SYSTEM.md` define the current design contract unless MASTER-SPEC is explicitly updated otherwise.