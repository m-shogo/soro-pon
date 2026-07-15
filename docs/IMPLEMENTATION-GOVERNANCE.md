# Soro-pon Implementation Governance

## Purpose

This is the index for practical implementation controls.

Read first:

```text
docs/MASTER-SPEC.md
docs/IMPLEMENTATION.md
docs/IMPLEMENTATION-WORKFLOW.md
docs/SKIN-FOUNDATION-HARDENING.md
docs/GLOSSARY.md
```

## Current Status

```text
Gameplay MVP phases 1-14: complete
Multi-skin runtime baseline: complete
Skin foundation hardening H1-H11: complete (docs/SKIN-FOUNDATION-HARDENING.md)
Final image production: active (docs/ASSET-PRODUCTION-ROADMAP.md)
```

## Code Structure and Dependencies

```text
docs/IMPLEMENTATION-STRUCTURE.md
docs/CODING-RULES.md
docs/DEPENDENCY-POLICY.md
docs/ARCHITECTURE-BOUNDARIES.md
```

DOM/component-test and Playwright dependencies require the normal dependency/ADR decision. Do not add a large UI framework or a second theme system.

## UI / Design / Skin Governance

Mandatory before UI, CSS, component, token, asset, motion, responsive, or skin-loading work:

```text
docs/DESIGN-SYSTEM.md
docs/SKIN-SYSTEM.md
docs/SKIN-FOUNDATION-HARDENING.md
docs/UI-COMPONENT-CONTRACT.md
docs/SKIN-AUTHORING-GUIDE.md
docs/DESIGN-IMPLEMENTATION-POLICY.md
docs/ASSET-PIPELINE.md
```

Current principles:

```text
one layout/component system
multiple validated skins
shared generic components
skin-invariant layout, hit areas, accessibility, and game state
explicit typed skin-token allowlist
shared slice/repeat/mask renderers
candidate-first image workflow
future installed skins contain validated data/assets only
```

## Active Hardening Gates

```text
P0 before image production
P1 before public demo
P2 before installed/paid skins
```

Implementation order is fixed in `docs/SKIN-FOUNDATION-HARDENING.md`:

```text
H1 token boundary
H2 contract validator/CI
H3 semantic contrast
H4 selector
H5 layered renderer/nine-slice proof
H6 proven renderer modes
H7 shared UI/CSS migration
H8 DOM/accessibility/recovery
H9 visual regression
H10 installed skin hardening
H11 match idempotency before restore/replay
```

## Fixtures and Tests

```text
docs/FIXTURE-STRATEGY.md
docs/TESTING-STRATEGY.md
```

Skin/UI work must add:

```text
manifest/fallback tests
typed token tests
contract/filesystem tests
state-preservation tests
component/accessibility tests
visual verification
```

## CI and Completion Gates

```text
docs/CI-GATES.md
docs/ACCEPTANCE-CRITERIA.md
```

Target commands:

```text
pnpm typecheck
pnpm test
pnpm build
pnpm skin:validate
component/DOM tests after H8 ADR
Playwright regression after H9 ADR
```

Report local results separately from GitHub Actions status.

## Risk, Import, Storage, Migration

```text
docs/THREAT-MODEL.md
docs/TECHNICAL-RISK-REGISTER.md
docs/MIGRATIONS.md
```

Future installed/paid skins must not execute arbitrary CSS/JS/HTML, load external URLs/fonts, override structure/accessibility tokens, or access engine/storage/network data.

Before match restore/replay/resend, replace the temporary seed/last-key idempotency boundary with persistent matchSessionId and recent processed IDs.

## Manual QA and Demo Gates

```text
docs/MANUAL-QA.md
docs/RELEASE-DEMO-GATES.md
```

Image production begins only after P0. Public demo begins only after applicable P1. Installed/paid skin claims begin only after P2.

## Commit Rule

```text
one purpose per commit
small testable changes
push after commit
docs and implementation updated together
one H item completed before the next
```

## Final Decision

Before changing an area, use the relevant governance document. A task prompt never overrides current repository contracts unless those contracts are deliberately updated first.
