# Soro-pon Docs

## Start Here

Read these first:

```text
docs/MASTER-SPEC.md
docs/IMPLEMENTATION.md
docs/GLOSSARY.md
```

`MASTER-SPEC.md` is the current specification.
`IMPLEMENTATION.md` is the safe implementation order.
`GLOSSARY.md` fixes core terms.

Do not use numbered docs as the primary entry point.

## Current Contract Docs

Use these when implementation touches boundaries, APIs, state, errors, tests, performance, migrations, or decisions.

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

## Implementation Governance Docs

Use these before creating code, fixtures, CI, QA, demos, or dependencies.

```text
docs/IMPLEMENTATION-WORKFLOW.md
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

## Current Detail Docs

### Rule / Engine / Schema

```text
docs/62-mahjong-structure-scoring-core.md
docs/63-typescript-engine-implementation-blueprint.md
docs/64-breaking-risk-review-and-fixes.md
docs/65-group-backed-schema-override.md
docs/66-group-backed-mvp-test-override.md
docs/67-current-implementation-source-of-truth.md
```

### Custom Deck Safety

```text
docs/68-custom-deck-robustness-guardrails.md
docs/69-adversarial-custom-deck-patterns.md
docs/70-deck-rules-and-scoring-law.md
docs/71-scoring-budget-and-image-security.md
docs/72-score-budget-schema-and-defaults.md
docs/73-safe-deck-creator-rules-and-tips.md
docs/74-strict-import-contract-and-edit-boundary.md
```

### UI Quality

```text
docs/48-responsive-crisp-ui-system.md
docs/49-ui-quality-gate-and-codex-design-rules.md
docs/50-pro-ui-production-quality-checklist.md
docs/design-targets/generated/soro-pon-landscape-vampon-ui-v1/README.md
```

### Vamp-pon Reference Gates

```text
docs/42-shared-vampon-source-policy.md
docs/44-vampon-character-generation-gate.md
docs/45-vampon-reference-gate.md
/Users/m-shogo/Developer/personal/vamp-pon/docs/shared-vampon-master-index.md
```

## Superseded Areas

Some older numbered docs contain earlier ideas.

When conflict exists, follow:

```text
docs/MASTER-SPEC.md
```

Known superseded ideas:

```text
count-only normal win roles
normal span-first roles
mixed roles[] as primary schema
points field on win_role
shared JSON image fields
UI-first implementation
```

## Current Sample

```text
samples/animal-starter.deck.json
```

This sample uses the current group-backed schema shape.

## Documentation Policy

New stable specs should use role-based names, not number-only entry points.

Good:

```text
MASTER-SPEC.md
IMPLEMENTATION.md
GLOSSARY.md
ARCHITECTURE-BOUNDARIES.md
ENGINE-API.md
TECHNICAL-RISK-REGISTER.md
IMPLEMENTATION-GOVERNANCE.md
```

Avoid as entry points:

```text
75-current...
76-final...
77-new-final...
```

Numbered docs may remain as detail/history until a later cleanup.
