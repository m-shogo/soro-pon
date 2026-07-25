# AGENTS.md

このrepoでAIエージェントが作業するときの必須ルール。

## Current Status — 2026-07-25

```text
Gameplay MVP phases 1-14: complete
Multi-skin runtime baseline: complete
Skin foundation hardening H1-H11: complete
Official skins: yorunoshirube (9 finals, v4) / cute-pop (9 finals, v5)
Gate 4 / Gate 5 / historical Gate 6: PASS within recorded scopes
RC status: LIMITED READY
Batch 7: COMPLETE
Batch 8 real VoiceOver + Chrome: CONDITIONAL
Batch 9 extended soak: COMPLETE
Batch 10 production-preview / real-device validation: CONDITIONAL
Batch 11 production Firefox/WebKit: contract defined, NOT executed
Post-Batch-10 integrity/residual closure:
  code/test/CI/doc fixes committed
  92 targeted definitions across 28 files committed
  exact-current-SHA verification pending
```

「MVP Phase 1開始」「H1から順に実装」「次はasset Batch 5」は古い状態。
現在の作業は **RC exact-SHA evidence closure**。新機能・追加assetへ戻らない。

## Read First

```text
README.md
AGENTS.md
CODEX.md or CLAUDE.md
docs/README.md
docs/MASTER-SPEC.md
docs/IMPLEMENTATION-WORKFLOW.md
docs/RELEASE-DEMO-GATES.md
docs/qa/POST-BATCH-10-INTEGRITY-REVIEW.md
docs/qa/POST-BATCH-10-INTEGRITY-CONTINUATION.md
docs/qa/POST-BATCH-10-INTEGRITY-DEEP-DIVE.md
docs/qa/POST-BATCH-10-RESIDUAL-CLOSURE.md
docs/qa/BATCH-11-PRODUCTION-CROSS-BROWSER-MATRIX.md
```

Canonical truth:

```text
docs/MASTER-SPEC.md                         product/rules
docs/RELEASE-DEMO-GATES.md                  readiness
the latest Batch/review report              exact scope/evidence
docs/IMPLEMENTATION-WORKFLOW.md              next executable order
docs/release/STORAGE-RECOVERY-POLICY.md      persistence/recovery
docs/SKIN-DISTRIBUTION.md                    external-package boundary
```

Historical/numbered docs cannot override current evidence.

## Mandatory UI / Design / Skin Read

Before changing UI/CSS/components/assets/motion/responsive/skin loading:

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
```

## Current UI / Skin Contract

```text
one shared layout/component system
no skin-specific screen copies
layout/hit areas/touch/focus/z-index/game state are skin-invariant
shared Button/Panel/Dialog/Form/Tile primitives
render/slice/repeat/mask logic stays centralized
external-evaluated skins: typed tokens + registered PNG/WebP only
manifest text cannot elevate trust; loader-owned origin is authoritative
loader-owned origin classification is not a cryptographic package signature
both official skins retain fallback behavior
```

Forbidden:

```text
screen-local generic controls
hardcoded PNG paths/colors inside screens
skin-controlled layout or behavior
arbitrary external CSS/JS/HTML/URL/font/SVG
external package self-promotion to official
```

## Persistence / Recovery Contract

```text
all reads are runtime-schema parsed
read denial may display fallback but every mutation/export fails closed
write payload is runtime-schema parsed immediately before setItem
record/coin/role/achievement result is one atomic validated write
valid entries/progress are salvaged independently where safe
set-like legacy arrays dedupe before retention caps
unknown future versions are not guessed
raw corrupt payload is backed up when possible
raw forensic backups can be exported without reinterpretation
export failure never deletes source backups or claims success
stale observed deck update/delete is rejected
reset reloads only after every known key is removed
```

Never describe optimistic fingerprint protection as transactional CAS. Never
describe raw forensic export as validated restore.

## Architecture Boundaries

```text
UI does not calculate roles/score/wildcard meaning
engine does not import React/DOM/localStorage/CSS
skin does not access engine/schema/records/network
shared deck JSON contains no image/URL/base64/path/html/script/style fields
3-4 players only; no 2-player mode
```

## Landscape / Stack

```text
844x390 reference, not a fixed canvas
phone landscape: 100svw x 100svh
PC: centered table + outer support
no whole-app transform: scale()

TypeScript / React / Vite / Zod / Vitest / Playwright / localStorage
```

Major dependencies require `docs/DEPENDENCY-POLICY.md` and ADR review.

## Exact Verification Order

```text
1. Stop concurrent writers.
2. clean worktree; HEAD == origin/main.
3. Record exact SHA and toolchain/browser/Python versions.
4. pnpm install --frozen-lockfile
5. Run .github/workflows/integrity.yml equivalent.
6. Confirm all 92 targeted definitions are collected and pass.
7. pnpm typecheck
8. pnpm test
9. pnpm skin:validate
10. pnpm build + artifact inventory/hash
11. Run Python 3.13 install + pip check + asset fixtures as declared in CI.
12. If anything changes, discard results and restart from step 1.
13. Execute Batch 11 on the same production artifact.
```

A workflow file, local command from an older SHA, or historical Batch PASS is
not evidence for the current artifact.

## Work / Report

```text
one purpose per commit
small testable changes
fetch latest SHA before sequential file writes
never overwrite concurrent changes blindly
docs and implementation synchronized
push/commit result recorded
```

Report:

```text
changed files and commits
exact verification SHA
commands and results, or explicitly not executed
GitHub Actions result, or visibility limitation
skin/screen/data impact
remaining risks
Batch 11 / RC status
```
