# Soro-pon Implementation Governance

## Purpose

This is the index for practical implementation controls.

Read first:

```text
docs/MASTER-SPEC.md
docs/IMPLEMENTATION.md
docs/IMPLEMENTATION-WORKFLOW.md
docs/GLOSSARY.md
```

## Current Status

```text
Gameplay MVP phases 1-14: implemented
Current next phase: multi-skin design-system foundation
```

## Code Structure and Dependencies

```text
docs/IMPLEMENTATION-STRUCTURE.md
docs/CODING-RULES.md
docs/DEPENDENCY-POLICY.md
docs/ARCHITECTURE-BOUNDARIES.md
```

## UI / Design / Skin Governance

Mandatory before UI, CSS, component, token, asset, motion, or responsive work:

```text
docs/DESIGN-SYSTEM.md
docs/SKIN-SYSTEM.md
docs/UI-COMPONENT-CONTRACT.md
docs/SKIN-AUTHORING-GUIDE.md
docs/DESIGN-IMPLEMENTATION-POLICY.md
docs/ASSET-PIPELINE.md
```

Current governance principles:

```text
one layout/component system
multiple validated skins
shared generic components
skin-invariant layout and hit areas
shared nine-slice/renderers
no final image generation during foundation
future paid skins contain validated data/assets only
```

## Fixtures and Tests

```text
docs/FIXTURE-STRATEGY.md
docs/TESTING-STRATEGY.md
```

Skin work must add manifest/fallback/state-preservation tests and visual verification.

## CI and Completion Gates

```text
docs/CI-GATES.md
docs/ACCEPTANCE-CRITERIA.md
```

Current skin phase also targets:

```text
pnpm skin:validate
both official skins in Component Gallery
five-size visual review
no gameplay regression
```

## Risk, Import, Storage, Migration

```text
docs/THREAT-MODEL.md
docs/TECHNICAL-RISK-REGISTER.md
docs/MIGRATIONS.md
```

Future installed/paid skins must not execute arbitrary CSS/JS/HTML, load external URLs/fonts, control layout, or access engine/storage/network data.

## Manual QA and Demo Gates

```text
docs/MANUAL-QA.md
docs/RELEASE-DEMO-GATES.md
```

Release/demo gates come after skin foundation and reviewed final assets.

## Commit Rule

```text
one purpose per commit
small testable changes
push after commit
docs and implementation updated together
```

## Final Decision

Before changing an area, use the relevant governance document. A task prompt never overrides current repository contracts unless the contracts are deliberately updated first.