# Soro-pon Documentation Index

## Current Status — 2026-07-25

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
Post-Batch-10 integrity/residual fixes: committed; exact-SHA verification pending
Integrity definitions: 92 across 28 files, committed and unexecuted
```

Do not treat historical green commands, old asset checkpoints, or numbered
documents as current release evidence.

## Start Here

```text
README.md
AGENTS.md
CODEX.md or CLAUDE.md
docs/MASTER-SPEC.md
docs/IMPLEMENTATION-WORKFLOW.md
docs/RELEASE-DEMO-GATES.md
docs/qa/POST-BATCH-10-INTEGRITY-REVIEW.md
docs/qa/POST-BATCH-10-INTEGRITY-CONTINUATION.md
docs/qa/POST-BATCH-10-INTEGRITY-DEEP-DIVE.md
docs/qa/POST-BATCH-10-RESIDUAL-CLOSURE.md
docs/qa/BATCH-11-PRODUCTION-CROSS-BROWSER-MATRIX.md
```

## Canonical Roles

```text
docs/MASTER-SPEC.md
  Product and rule truth.

docs/RELEASE-DEMO-GATES.md
  Demo/release readiness and exact open evidence.

docs/qa/POST-BATCH-10-INTEGRITY-REVIEW.md
  Initial recovery/reset/migration integrity findings.

docs/qa/POST-BATCH-10-INTEGRITY-CONTINUATION.md
  Read-modify-write, atomicity, limits, IDs, overwrite, and concurrency findings.

docs/qa/POST-BATCH-10-INTEGRITY-DEEP-DIVE.md
  Metadata/partial salvage, stale destructive operations, set semantics,
  destructive-dialog accessibility, skin runtime trust/races, and CI findings.

docs/qa/POST-BATCH-10-RESIDUAL-CLOSURE.md
  Dedupe-before-cap, session identity, Editor parity, raw recovery export,
  loader-owned skin trust, immutable Actions, and exact remaining evidence.

docs/qa/BATCH-11-PRODUCTION-CROSS-BROWSER-MATRIX.md
  Current unexecuted production Firefox/WebKit QA contract.

docs/IMPLEMENTATION-WORKFLOW.md
  Compact current implementation state and next executable sequence.

docs/release/STORAGE-RECOVERY-POLICY.md
  Corruption, read-denial, write validation, atomicity, limits, conflict,
  forensic export, reset, and restore semantics.

docs/MIGRATIONS.md
  Version compatibility and visible legacy-import confirmation.

docs/ERROR-CODES.md
  Stable issue-code ownership, including I2011/V3013/R4011/B6010/L9008.

docs/OPERATIONS-READINESS.md
  Applicability/status of rollback, restore, observability, metrics,
  trace, rate limiting, load, chaos, deployment, and compatibility.

docs/TECHNICAL-RISK-REGISTER.md
  Current CLOSED / MITIGATED / OPEN / BLOCKED_EVIDENCE risks.
```

## Integrity Review Summary

Representative fixed defects:

```text
storage recovery could throw during cleanup
read denial could be mistaken for an empty Store during mutation
record/coin and achievement persistence was not atomic
app could write more data than its own storage schema accepted
old over-limit payloads could be reset instead of partially salvaged
same-ID import silently overwrote an existing deck
stale import/editor/detail state could overwrite or delete newer data
new deck IDs could collide under same-ms/multi-tab creation
variant/role/bonus duplicate-ID contract was incomplete
tile membership duplicates could inflate feasibility counts
group fields ignored by the engine could survive import/save
ScoreBonus cap could contradict one award
valid decks could be lost because only wrapper metadata was damaged
one malformed match history could wipe other progress
persisted duplicate deck IDs were ambiguous
set-like arrays could cap before dedupe and lose later unique values
write paths trusted TypeScript values without final runtime validation
records/settings recovery notices were discarded
unpersisted achievements could appear unlocked
missing deck/variant could leave a blank route
legacy migration notice was ignored
export Blob URL lifecycle was browser-fragile
reset omitted corrupt-backup keys or hid partial failure
forensic backups had no user-accessible export path
ErrorBoundary emergency reset retained the old false-success behavior
deck deletion lacked confirmation or restore guidance
danger Dialog initial focus favored the destructive action
important Dialog copy lacked aria-describedby association
MatchSession remount identity depended on a bounded gameplay seed
Editor live diagnostics differed from save/play boundaries
skin preload rejection/unmount races could leave stale/loading state
skin inheritance depth had an off-by-one error
runtime external SVG and registry integrity checks were incomplete
manifest origin could be self-declared without loader-owned trust binding
unsafe import diagnostics were unbounded
CI actions used mutable major tags
Python dependency consistency was not checked after install
entry/risk/performance/operations docs were stale or ambiguous
```

Targeted integrity definitions committed: **92 cases across 28 files**. They
remain unverified against the final exact SHA until the prescribed commands and
Batch 11 are executed.

## Release / Operations

```text
docs/RELEASE-DEMO-GATES.md
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
optimistic localStorage fingerprint != transactional multi-tab CAS
raw forensic export != validated automatic restore
loader-owned manifest origin != cryptographic package identity
exact Python top-level pins + pip check != transitive hash lock
```

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

Invariant:

```text
one layout/component system
no skin-specific screens
shared Button/Panel/Dialog/Form/Tile components
slice/repeat/mask only through shared renderers
skin cannot control layout, hit areas, focus, z-index, or game state
external skins use typed allowlisted tokens and registered assets only
both official skins retain CSS/SVG fallback behavior
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

The roadmap is useful for slot history and future explicit asset work. It
cannot override release-current state or silently restart a closed batch.

## Conflict Resolution

```text
1. docs/MASTER-SPEC.md for product/rule truth
2. docs/RELEASE-DEMO-GATES.md for readiness claims
3. latest evidence-backed Batch/review report for its exact scope
4. current non-numbered subsystem contracts
5. docs/IMPLEMENTATION-WORKFLOW.md for operational sequence
6. numbered detail docs
7. historical/compatibility docs
```

When current documents disagree, do not choose the more optimistic claim.
Verify implementation/evidence, correct every affected entry document, and
record the exact scope.
