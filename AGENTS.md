# AGENTS.md

このrepoでAIエージェントが作業するときの必須ルール。

## Current Status — 2026-08-09

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
Batch 11 production Firefox/WebKit: COMPLETE on frozen SHA 7548964
Batch 12 real Safari/device/AT: CONDITIONAL on frozen SHA 555c02d
Batch 13 table UI/Safari/Cloudflare: CONDITIONAL
  shared 3p/4p table UI and local gates PASS; stable Safari 4/4 Result
  paths PASS; rotation 4/20 and full Safari+VoiceOver BLOCKED;
  Cloudflare deploy/rollback awaits account sign-in
  physical iPhone Safari: KNOWN UNVERIFIED, post-release, non-blocking
Batch 14: ACTIVE on PR #10 / Issue #12
  board-first match UI / mahjong-like rivers / hand+action hierarchy
  deck browse/detail/editor authored game-workspace pass
  result/collection/setup/TOP information hierarchy pass
  interaction UX hardening: touch targets, pressed feedback, pointer-mode hover,
  Reduce Motion, focus/scroll affordance, state-readable actions
  current-head visual review is Actions artifact based; do not churn committed PNG baselines
  final integration to main uses squash so working-branch commit churn does not enter mainline
Post-Batch-10 integrity/residual closure:
  code/test/CI/doc fixes committed
  101 targeted tests across 28 files PASS on Batch 12 frozen SHA
  historical full unit 425/425, skin 18/18, visual 70/70, build, CI,
  Integrity, and exact-SHA CI Python 3.13 green within recorded scope
Remaining release evidence: Safari rotation/soak, full Safari+VoiceOver,
  iPad/Android, NVDA/JAWS, and Cloudflare Preview/production/rollback/current restore
```

「MVP Phase 1開始」「H1から順に実装」「次はasset Batch 5」は古い状態。
現在のproduct workは **Batch 14 UI/UX quality on PR #10**。engine/schema/game rules/semantic reading orderを変えず、実画面の使いやすさ・視線誘導・操作感・ authored visual qualityを改善する。CI greenだけでvisual完成扱いしない。

## Read First

```text
README.md
AGENTS.md
CODEX.md or CLAUDE.md
docs/README.md
docs/MASTER-SPEC.md
docs/IMPLEMENTATION-WORKFLOW.md
docs/RELEASE-DEMO-GATES.md
docs/design/SOROPON-VISUAL-QUALITY-LEARNINGS.md
docs/design/SOROPON-INTERACTION-UX-CONTRACT.md
docs/qa/BATCH-14-VISUAL-REVIEW.md
docs/qa/POST-BATCH-10-INTEGRITY-REVIEW.md
docs/qa/POST-BATCH-10-INTEGRITY-CONTINUATION.md
docs/qa/POST-BATCH-10-INTEGRITY-DEEP-DIVE.md
docs/qa/POST-BATCH-10-RESIDUAL-CLOSURE.md
docs/qa/BATCH-11-PRODUCTION-CROSS-BROWSER-MATRIX.md
docs/qa/BATCH-12-REAL-SAFARI-DEVICE-ACCESSIBILITY-REPORT.md
docs/qa/BATCH-13-UI-SAFARI-CLOUDFLARE-REPORT.md
docs/qa/BATCH-13-UI-SAFARI-CLOUDFLARE-MATRIX.md
```

Canonical truth:

```text
docs/MASTER-SPEC.md                              product/rules
docs/RELEASE-DEMO-GATES.md                       readiness
docs/design/SOROPON-VISUAL-QUALITY-LEARNINGS.md visual/UI failure lessons
docs/design/SOROPON-INTERACTION-UX-CONTRACT.md  touch/focus/motion/action hierarchy
docs/qa/BATCH-14-VISUAL-REVIEW.md                current-head visual evidence flow / Git hygiene
the latest Batch/review report                   exact scope/evidence
docs/IMPLEMENTATION-WORKFLOW.md                  next executable order
docs/release/STORAGE-RECOVERY-POLICY.md          persistence/recovery
docs/SKIN-DISTRIBUTION.md                        external-package boundary
```

Historical/numbered docs cannot override current evidence.

## Mandatory UI / Design / Skin Read

Before changing UI/CSS/components/assets/motion/responsive/skin loading:

```text
docs/design/SOROPON-VISUAL-QUALITY-LEARNINGS.md
docs/design/SOROPON-INTERACTION-UX-CONTRACT.md
docs/qa/BATCH-14-VISUAL-REVIEW.md
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

### Batch 14 Visual / Interaction UX Contract

```text
VISUAL HIERARCHY
  purpose-built game, not admin dashboard / SaaS card collection
  table/tiles/rivers/hand/actions before utility chrome
  actual game objects before labels, cards, metrics or decorative surfaces
  flatten panel nesting and decorative gradients before adding polish

TOUCH / POINTER
  frequent gameplay actions retain ~44px target height
  compact secondary controls may use 32-36px when necessary for 844x390
  never rely on sticky hover or pointer-only choreography
  touch gets immediate :active feedback; fine pointer hover is separately gated
  safe-area and thumb-reachable primary action placement are mandatory

ACTION HIERARCHY
  strongest treatment belongs to the action that is actually executable now
  disabled/instructional controls stay visually quiet
  selection must echo into commit CTA where useful (e.g. 4人戦 -> 4人戦をはじめる)
  maintenance/destructive actions do not compete with routine play navigation
  irreversible actions require explicit confirmation

FOCUS / MOTION
  DOM order remains semantic/focus order
  focus ring stays visible and scroll containers leave room around focused items
  motion communicates state only; no decorative infinite gameplay motion
  prefers-reduced-motion disables nonessential tile/pulse/result/orientation motion

QUALITY GATE
  judge actual landscape target, especially 844x390
  identify weakest 3 visible/interaction problems before adding decoration
  CI green is necessary but never sufficient for visual approval
  visual approval uses the current HEAD Actions artifact, not an older committed snapshot
  current polish captures belong in short-lived artifact storage, not Git history
```

Forbidden:

```text
screen-local generic controls
hardcoded PNG paths/colors inside screens
skin-controlled layout or behavior
arbitrary external CSS/JS/HTML/URL/font/SVG
external package self-promotion to official
generic AI/SaaS dashboard card convergence
hover-only required state on touch
nonessential infinite gameplay animation
using Batch 13 snapshots as Batch 14 approval
committing a fresh screenshot baseline for every polish pass
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
2. clean worktree; HEAD == target branch/base as required by current task.
3. Record exact SHA and toolchain/browser/Python versions.
4. pnpm install --frozen-lockfile
5. Run .github/workflows/integrity.yml equivalent.
6. Run interaction/visual/review-hygiene contract guards declared in CI.
7. pnpm typecheck
8. pnpm test
9. pnpm skin:validate
10. pnpm build + artifact inventory/hash
11. Run Python 3.13 install + pip check + asset fixtures as declared in CI.
12. For UI/UX work, run current-head Batch 14 Visual Review and keep screenshots in the workflow artifact.
13. If anything changes, discard results and restart from step 1 for the final SHA.
14. Execute still-open real-environment release gates only when they are in scope.
```

A workflow file, local command from an older SHA, historical Batch PASS, or an artifact from another HEAD is
not evidence for the current artifact.

## Work / Report

```text
one purpose per commit
small testable changes
fetch latest SHA before sequential file writes
never overwrite concurrent changes blindly
docs and implementation synchronized
push/commit result recorded
current visual-review PNGs stay in Actions artifacts; historical evidence stays immutable
keep active manual development in the current PR instead of spawning parallel branches
final integration to main uses squash after current-head visual approval
```

Report:

```text
changed files and commits
exact verification SHA
commands and results, or explicitly not executed
GitHub Actions result, or visibility limitation
current-head visual artifact and review status when UI changed
skin/screen/data impact
remaining risks
Batch 12 / RC status
```
