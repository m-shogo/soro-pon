# Soro-pon Documentation Index

## Current Status — 2026-07-24

```text
Gameplay MVP phases 1-14: complete
Multi-skin runtime baseline: complete
Skin hardening H1-H11: complete
Official skins: yorunoshirube (9 finals, v4) / cute-pop (9 finals, v5)
Gate 4 / Gate 5 / historical Gate 6: PASS within recorded scopes
RC status: LIMITED READY
Batch 7: COMPLETE
Batch 8 real VoiceOver + Chrome: CONDITIONAL
Batch 9 extended soak: COMPLETE
Batch 10 production-preview / real-device validation: CONDITIONAL
Batch 11 production Firefox/WebKit: contract defined, not executed
Current work: post-Batch-10 integrity changes require fresh exact-SHA verification
```

Do not treat old asset-production checkpoints, numbered documents, or a
historical green command as current release evidence.

## Start Here

Every agent reads:

```text
README.md
AGENTS.md
CODEX.md or CLAUDE.md
docs/MASTER-SPEC.md
docs/IMPLEMENTATION-WORKFLOW.md
docs/RELEASE-DEMO-GATES.md
docs/qa/BATCH-11-PRODUCTION-CROSS-BROWSER-MATRIX.md
```

Canonical roles:

```text
docs/MASTER-SPEC.md
  Product and rule truth.

docs/IMPLEMENTATION-WORKFLOW.md
  Compact current implementation state and next executable sequence.

docs/RELEASE-DEMO-GATES.md
  Demo/release readiness and exact open evidence.

docs/qa/BATCH-11-PRODUCTION-CROSS-BROWSER-MATRIX.md
  Current unexecuted production Firefox/WebKit QA contract.

docs/release/STORAGE-RECOVERY-POLICY.md
  Storage corruption, backup, recovery, and failure semantics.

docs/MIGRATIONS.md
  Version compatibility and visible legacy-import confirmation.

docs/ERROR-CODES.md
  Stable issue-code ownership; codes must not be reused semantically.

docs/OPERATIONS-READINESS.md
  Applicability/status of migration rollback, restore, observability,
  metrics, trace, rate limiting, load, chaos, deployment, and compatibility.

docs/TECHNICAL-RISK-REGISTER.md
  Current CLOSED / MITIGATED / OPEN / BLOCKED_EVIDENCE risks.
```

## Current Integrity Review Scope

The post-Batch-10 review changed code, tests, CI, and documentation.
Representative findings:

```text
storage recovery could throw during recovery cleanup
records/settings recovery notices were discarded
unpersisted achievements could be displayed as unlocked
missing deck/variant could leave a blank route
export Blob URL lifecycle was browser-fragile
storage error-code collision risk
legacy import migration notice was silently ignored
```

Current fixes include safe storage fallbacks, truthful persistence UI,
legacy migration review-before-save, nine new regression tests (six
storage fault paths and three AppRoot persistence/migration cases), and a
separate CI-visible storage regression command. These tests are committed
but must still be executed against the exact current SHA before any new
PASS claim.

## UI / Design / Skin — Mandatory for UI Work

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

Current invariant:

```text
one layout/component system
no skin-specific screens
shared Button/Panel/Dialog/Form/Tile components
slice/repeat/mask only through shared renderers
skin cannot control layout, hit areas, focus, z-index, or game state
external skins use typed allowlisted tokens and registered assets only
both official skins retain CSS/SVG fallback behavior
```

## Release / Operations

```text
docs/RELEASE-DEMO-GATES.md
docs/OPERATIONS-READINESS.md
docs/TECHNICAL-RISK-REGISTER.md
docs/CI-GATES.md
docs/MIGRATIONS.md
docs/ERROR-CODES.md
docs/qa/BATCH-7-CROSS-BROWSER-A11Y-REPORT.md
docs/qa/BATCH-8-VOICEOVER-ACCEPTANCE-REPORT.md
docs/qa/BATCH-9-EXTENDED-SOAK-REPORT.md
docs/qa/BATCH-10-REAL-DEVICE-RELEASE-REPORT.md
docs/qa/BATCH-11-PRODUCTION-CROSS-BROWSER-MATRIX.md
docs/qa/RELEASE-DEPLOY-ROLLBACK-RUNBOOK.md
docs/release/CACHE-AND-ROLLBACK-RUNBOOK.md
docs/release/SOAK-RUNBOOK.md
docs/release/STORAGE-RECOVERY-POLICY.md
```

Never collapse these distinctions:

```text
local preview != deploy
Playwright WebKit != Safari
simulator/emulation != physical device
AX-tree automation != real screen reader
historical artifact PASS != current HEAD verification
best-effort corrupt backup != user-facing restore
local test observability != production telemetry
not applicable backend control != silently complete control
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
docs/IMPLEMENTATION.md
docs/IMPLEMENTATION-GOVERNANCE.md
docs/IMPLEMENTATION-STRUCTURE.md
docs/FIXTURE-STRATEGY.md
docs/CODING-RULES.md
docs/DEPENDENCY-POLICY.md
docs/CI-GATES.md
docs/ACCEPTANCE-CRITERIA.md
docs/THREAT-MODEL.md
docs/MANUAL-QA.md
```

## Asset History

```text
docs/ASSET-PRODUCTION-ROADMAP.md
docs/asset-requests/R1-APPROVAL-PACK.md
docs/asset-requests/BATCH-2-APPROVAL-PACK.md
docs/asset-requests/BATCH-3-YORUNOSHIRUBE-APPROVAL-PACK.md
docs/asset-requests/BATCH-4-YORUNOSHIRUBE-APPROVAL-PACK.md
```

The roadmap is useful for history and future explicit asset work. It
cannot override release-current state or silently restart a closed batch.

## Current Rule / Engine Detail

Use numbered documents only when the relevant subsystem requires them.
Compatibility pointers such as
`docs/67-current-implementation-source-of-truth.md` and
`docs/75-current-mvp-master-spec.md` are not primary truth.

Representative detail docs:

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
```

## Vamp-pon Reference Gates

When using world, character, enemy, stage, weapon, item, or visual-lore
material:

```text
docs/42-shared-vampon-source-policy.md
docs/44-vampon-character-generation-gate.md
docs/45-vampon-reference-gate.md
/Users/m-shogo/Developer/personal/vamp-pon/docs/shared-vampon-master-index.md
```

The `vamp-pon` repository is read-only from this project.

## Conflict Resolution

```text
1. docs/MASTER-SPEC.md for product/rule truth
2. docs/RELEASE-DEMO-GATES.md for readiness claims
3. latest evidence-backed Batch matrix/report for exact scope
4. current non-numbered subsystem contracts
5. docs/IMPLEMENTATION-WORKFLOW.md for operational sequence
6. numbered detail docs
7. historical/compatibility docs
```

When current documents disagree, do not choose the more optimistic claim.
Verify implementation/evidence, correct every affected entry document,
and record the exact scope.
