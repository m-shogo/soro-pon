# soro-pon

`soro-pon` は、プレイヤーがデッキ・牌・役・得点を自由に作れる、3〜4人用の
ローカルファーストなカスタム牌ゲームです。Vamp-pon世界の「記憶札遊び」
として扱います。

## Current Status — 2026-07-25

```text
Gameplay MVP phases 1-14: complete
Multi-skin runtime baseline: complete
Skin hardening H1-H11: complete
Official skins:
  yorunoshirube: 9 finals, v4
  cute-pop: 9 finals, v5
Gate 4 / Gate 5 / historical Gate 6: PASS within recorded scopes
RC status: LIMITED READY
Batch 7: COMPLETE
Batch 8 real VoiceOver + Chrome: CONDITIONAL
Batch 9 extended soak: COMPLETE
Batch 10 production-preview / real-device validation: CONDITIONAL
Batch 11 production Firefox/WebKit: contract defined, NOT executed
Post-Batch-10 integrity reviews:
  product/test/CI/doc fixes committed
  79 targeted test definitions committed
  exact-current-SHA verification pending
```

Review records:

```text
docs/qa/POST-BATCH-10-INTEGRITY-REVIEW.md
docs/qa/POST-BATCH-10-INTEGRITY-CONTINUATION.md
docs/qa/POST-BATCH-10-INTEGRITY-DEEP-DIVE.md
```

Historical Batch 10 evidence does not validate the newer product HEAD.
Fresh verification and Batch 11 must use one frozen exact commit and one
production artifact.

## Integrity Hardening Result

The three reviews found and fixed real defects in:

```text
corruption recovery and forensic backup
storage read-denial fail-closed behavior
write-boundary schema enforcement
atomic match record/coin/achievement persistence
legacy migration review
same-ID import overwrite confirmation
cross-tab stale import/editor/delete/update conflict rejection
collision-resistant new deck IDs
variant/role/bonus ID uniqueness
tile membership set semantics and ignored group fields
contradictory ScoreBonus caps
persisted collection bounds and legacy over-limit salvage
valid deck preservation when wrapper metadata alone is damaged
partial records salvage without wiping other progress
duplicate persisted deck-ID consolidation
missing-entity route recovery
Blob URL/export lifecycle
full local reset completeness and partial-failure truthfulness
emergency ErrorBoundary reset truthfulness
deck deletion confirmation and safe danger-dialog focus
dialog description association for assistive technology
skin preload rejection/unmount race recovery
skin inheritance depth, registry, and external SVG runtime validation
bounded adversarial import diagnostics
error-code ownership, CI visibility, and current-state docs
```

Current persistence guarantees:

```text
read denial:
  L9005 session fallback for display
  mutation/export fails closed; unknown existing bytes are not overwritten

normal write:
  strict schema parse immediately before setItem
  stale observed deck update/delete is rejected

match result:
  record + coins + role collection + match-derived achievements
  committed in one validated write

stored limits:
  decks 200
  records 100
  role collection 500
  achievements 100
  recent match keys 20

old/partially damaged payload:
  raw backup when possible
  valid deck bodies and valid progress retained where safely identifiable
  unknown schema versions are not guessed

same-ID import:
  unchanged-input confirmation
  unchanged existing-entry fingerprint confirmation
```

Targeted integrity test definitions added across the three reviews: **79**.
They are committed but not yet authoritatively executed against the final
review SHA. No new PASS claim is made.

## Product Core

This is a Donjara-style game, not Mahjong rules.

```text
3 or 4 players
no 2-player mode
no pon / chi / kan
normal hand: 8 tiles
on turn: draw to 9, then discard
win shape: three groups of three
ron: 8 hand tiles + discarded tile
self-draw: 9 tiles after draw
```

The interaction may reference Mahjong table feel, but the rule engine must
not drift into Mahjong rules.

## Official Skins

```text
yorunoshirube
  night desk / paper / black ink / lantern light / memory notebook

cute-pop
  bright / cute / approachable / pop
```

Both skins share one screen/component/layout/focus/hit-area/game-state
implementation. Skin-specific screen copies are forbidden.

## Public Demo / RC Scope

Established historical evidence:

```text
Batch 7:
  Chromium, Firefox, and Playwright WebKit in recorded automated scope.
  Playwright WebKit is not Safari.

Batch 8:
  real VoiceOver + Chrome within recorded traversed/supplemental scope.
  This is not Safari + VoiceOver.

Batch 9:
  Chromium memory-authoritative dev-server soak;
  Firefox/WebKit stability only.

Batch 10:
  production build and local production preview in Chromium.
  A local preview is not a deploy.
```

Still open/unclaimed:

```text
exact-current-SHA install/typecheck/test/skin validation/build
GitHub Actions result for that exact SHA
Batch 11 production Firefox/WebKit execution
physical iPhone Safari / iPad / Android
real hosting deployment
rollback of an actually deployed immutable artifact
Safari + VoiceOver
NVDA / JAWS
remaining Batch 8 Result/Cute Pop real-VoiceOver evidence
user-facing backup restore
true transactional multi-tab compare-and-swap
installer-owned external-skin trust/signature/entitlement
MatchSession remount key migration from bounded seed to matchSessionId
```

RC remains **LIMITED READY**.

## Public Demo Notes

```text
local-first: decks and progress are stored in browser localStorage
imports are strict-validated before play
legacy migration shows changes before persistence
same-ID import requires irreversible-overwrite confirmation
shared deck JSON excludes local/private images and unsafe display fields
no online multiplayer, accounts, billing, or cloud sync
supported official skins: yorunoshirube and cute-pop
reset is visible, irreversible, and reports partial deletion failure
```
