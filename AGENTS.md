# AGENTS.md

このrepoでAIエージェントが作業するときの必須ルール。詳細な履歴は各Batch/reportへ置き、このファイルは**現在地と壊してはいけない契約**だけを正本化する。

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
Batch 14 authored game UI/UX: COMPLETE
  PR #10 squash-merged to main as 30c6e84393a216ae5f561e955886595d12c89f8f
  Issue #12 closed as completed
  reviewed PR HEAD: f134755fb961b455f751c661c98018233dbd76cb
  Visual Review run 31314974844: SUCCESS
  CI run 31314974888: SUCCESS
  Integrity run 31314974887: SUCCESS
  visual artifact: 9038478453
  current review screenshots are short-lived Actions artifacts, not Git baselines
Physical iPhone Safari: KNOWN UNVERIFIED, post-release, non-blocking
Remaining release evidence: Safari rotation/soak, full Safari+VoiceOver,
  iPad/Android, NVDA/JAWS, Cloudflare Preview/production/rollback/current restore
```

Batch 14は完了済み。`PR #10 ACTIVE`、`Issue #12 OPEN`、`Batch 13 UI polish next` は古い状態。
次のproduct workは **最新mainから新しい明確な目的で開始**する。既存のMVP/H1-H11/asset Batch 5/Batch 14を理由なく再開しない。

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
docs/release/STORAGE-RECOVERY-POLICY.md
docs/SKIN-DISTRIBUTION.md
```

Canonical truth:

```text
docs/MASTER-SPEC.md                              product/rules
docs/RELEASE-DEMO-GATES.md                       readiness
docs/design/SOROPON-VISUAL-QUALITY-LEARNINGS.md visual/UI failure lessons
docs/design/SOROPON-INTERACTION-UX-CONTRACT.md  touch/focus/motion/action hierarchy
docs/qa/BATCH-14-VISUAL-REVIEW.md               current-head visual evidence flow / Git hygiene
docs/IMPLEMENTATION-WORKFLOW.md                  current execution order
docs/release/STORAGE-RECOVERY-POLICY.md          persistence/recovery
docs/SKIN-DISTRIBUTION.md                        external-package boundary
```

Historical/numbered docs cannot override current evidence.

## UI / Skin Contract

Before changing UI/CSS/components/assets/motion/responsive/skin loading, also read:

```text
docs/DESIGN-SYSTEM.md
docs/SKIN-SYSTEM.md
docs/SKIN-FOUNDATION-HARDENING.md
docs/UI-COMPONENT-CONTRACT.md
docs/SKIN-AUTHORING-GUIDE.md
docs/DESIGN-IMPLEMENTATION-POLICY.md
docs/ASSET-PIPELINE.md
docs/IMAGE-ASSET-WORKFLOW.md
docs/48-responsive-crisp-ui-system.md
docs/49-ui-quality-gate-and-codex-design-rules.md
docs/50-pro-ui-production-quality-checklist.md
```

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
  actual game objects before labels/cards/metrics/decorative surfaces
  flatten panel nesting and decorative gradients before adding polish

TOUCH / POINTER
  frequent gameplay actions retain ~44px target height
  compact secondary controls may use 32-36px when 44px would steal board space
  enabled pointer targets never fall below the WCAG 24px boundary
  checkbox/radio QA measures the enclosing label when the label is the actual target
  touch gets immediate :active feedback; fine-pointer hover is separately gated
  safe-area and thumb-reachable primary action placement are mandatory

ACTION HIERARCHY
  strongest treatment belongs to an action executable now
  disabled/instructional controls stay visually quiet
  selection echoes into commit CTA where useful
  maintenance/destructive actions do not compete with routine play navigation
  irreversible actions require explicit confirmation

FOCUS / MOTION
  DOM order remains semantic/focus order
  focus ring stays visible; scroll containers leave room around focused items
  motion communicates state only; no decorative infinite gameplay motion
  prefers-reduced-motion disables nonessential tile/pulse/result/orientation motion

QUALITY GATE
  judge actual landscape target, especially 844x390
  also review 1440x900 so desktop does not become a phone UI pinned to a corner
  identify weakest 3 visible/interaction problems before adding decoration
  CI green is necessary but never sufficient for visual approval
  UI changes use a current-head Actions artifact, never an older committed snapshot
  current polish captures stay out of Git history
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
using Batch 13 snapshots as Batch 14/current approval
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

Never describe optimistic fingerprint protection as transactional CAS. Never describe raw forensic export as validated restore.

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
PC: centered authored workspace/table + outer support
no whole-app transform: scale()

TypeScript / React / Vite / Zod / Vitest / Playwright / localStorage
```

Major dependencies require `docs/DEPENDENCY-POLICY.md` and ADR review.

## Exact Verification Order

```text
1. Stop concurrent writers.
2. clean worktree; start from current main unless the task explicitly uses a PR branch.
3. Record exact target SHA and relevant toolchain versions.
4. pnpm install --frozen-lockfile
5. Run .github/workflows/integrity.yml equivalent.
6. Run visual / review-hygiene / interaction UX contract guards declared in CI.
7. pnpm typecheck
8. pnpm test
9. pnpm skin:validate
10. pnpm build
11. Run Python asset fixtures as declared in CI when asset tooling is in scope.
12. For UI/UX changes, run current-head Batch 14 Visual Review and review the artifact.
13. If product/test/workflow changes, discard old evidence and restart final verification on the new SHA.
14. Execute still-open real-environment release gates only when they are in scope.
```

A workflow definition, older SHA PASS, historical Batch PASS, or artifact from another HEAD is not evidence for current changed UI.

## Git Hygiene / Work

```text
one purpose per commit
small testable changes
fetch latest SHA before sequential writes
never overwrite concurrent changes blindly
keep one active manual PR per coherent objective; do not spawn parallel branches casually
current visual-review PNGs stay in Actions artifacts; historical evidence stays immutable
retire superseded executable snapshot baselines instead of endlessly refreshing them
for long working histories, integrate to main with squash after current-head approval
remove/close completed issue/PR state from current-status docs immediately after merge
```

Report exact changed files/SHA, verification results, Actions status, visual artifact status when UI changed, remaining risks, and RC status.
