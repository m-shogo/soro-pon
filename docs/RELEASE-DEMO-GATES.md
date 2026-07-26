# Release And Demo Gates

## Purpose

Separate internal implementation, trusted testing, public-demo scope,
release-candidate evidence, installed-skin distribution, and future
network products.

```text
local build != public demo
local production preview != deploy
Playwright WebKit != Safari
historical PASS != newer product HEAD verification
raw forensic backup export != validated restore
optimistic localStorage fingerprint != transactional multi-tab CAS
loader-owned origin classification != cryptographic package identity
```

## Gate 1 — Internal Build

```text
app boots
basic typecheck/tests/build pass
known broken features documented
active skin failure leaves a usable fallback
```

## Gate 2 — Gameplay First Playable

```text
animal starter completes a round
3-player and 4-player setup work
result explains score
reload does not crash
no existing IP assets
```

## Gate 3 — Skin Foundation Image-ready

```text
skin H1-H11 contracts complete
typed token allowlist enforced
skin validation passes
both official skins meet semantic contrast rules
SkinSelector/Gallery operate without state reset
layered surfaces preserve layout/focus/hit areas
candidate-first asset workflow enforced
```

Never generate directly into `generated/final`.

## Gate 4 — User Test Ready

```text
QA passes for the stated scope
main landscape sizes reviewed
both official skins usable
import failure/migration/overwrite UX understandable
invalid or ambiguous-ID/membership/scoring decks cannot start
recoverable error/reset paths exist
known issue list is current
```

## Gate 5 — Public Demo Ready

```text
exact artifact CI-equivalent verification passes
visual/manual QA passes for stated target scope
keyboard/focus basics accepted
supported browser/device/skin set explicit
unsafe import/image/network fields rejected
same-ID import never overwrites without explicit current-state confirmation
no account/payment/cloud promise
shared export excludes local/private metadata
reset/recovery path is visible and truthful
missing/corrupt route entities recover instead of staying blank
destructive actions require safe confirmation
```

A Gate 5 PASS is qualified by its exact browser/device/artifact scope.

## Gate 6 — Release Candidate

```text
schema migration and visible confirmation tested
storage read/write/recovery/reset failure paths tested
match record/reward atomicity tested
persisted collection limits and old/partial salvage tested
write-boundary runtime schemas tested
nested IDs, membership sets, group fields, and score caps tested
same-ID and stale update/delete conflicts tested
known severe bugs fixed
visual/accessibility basics accepted
performance/resource caps tested
asset caching/version/fallback accepted
release claim matches exact artifact SHA
```

Gate 6 was historically passed in Batch 6. Later findings do not erase that
historical decision, but newer code must be reverified before it is presented
as the current RC artifact.

## Current RC Readiness — 2026-07-25

```text
Historical Gate 6: PASS
Batch 7: COMPLETE
Batch 8 real VoiceOver + Chrome: CONDITIONAL
Batch 9 extended soak: COMPLETE
Batch 10 production preview / real-device validation: CONDITIONAL
Post-Batch-10 integrity/residual fixes: committed; frozen SHA 7548964
  green on CI + Integrity workflows (wider closure continues separately)
Batch 11 production Firefox/WebKit: COMPLETE on frozen SHA 7548964
  (FF 151.0 + Playwright WebKit 26.5 prod-preview core 15/15 + rotations,
  0 product defects; WebKit is not Safari; no FF/WK memory claim)
RC status: LIMITED READY
```

Review reports:

```text
docs/qa/POST-BATCH-10-INTEGRITY-REVIEW.md
docs/qa/POST-BATCH-10-INTEGRITY-CONTINUATION.md
docs/qa/POST-BATCH-10-INTEGRITY-DEEP-DIVE.md
docs/qa/POST-BATCH-10-RESIDUAL-CLOSURE.md
```

### Historical evidence retained

```text
Batch 8:
  real VoiceOver + Chrome within recorded scope; not Safari+VoiceOver.

Batch 9:
  Chromium memory-authoritative dev-server soak;
  Firefox/WebKit stability only.

Batch 10:
  production build/local production preview in Chromium;
  not a deploy or physical-device result.
```

### Post-Batch-10 defects fixed

```text
recovery cleanup could throw after corrupt storage
read denial could be used as an empty Store during mutation
records/settings raw backup and warning gaps
record/coin and match-achievement persistence was not atomic
app could write more entries than its own schema accepted
old/partial payloads lacked bounded salvage
same-ID import silently overwrote an existing deck
stale import/editor/detail state could overwrite or delete newer data
new deck IDs could collide
variant/role/bonus duplicate-ID validation was incomplete
tile membership duplicates could inflate feasibility counts
group fields ignored by the engine could survive persistence
ScoreBonus cap could contradict one award
valid deck body could be lost because wrapper metadata was damaged
one malformed match row could wipe all progress
persisted duplicate deck IDs were ambiguous
set-like arrays could cap before dedupe and lose later unique values
write paths lacked final runtime schema validation
failed achievement persistence could appear unlocked
missing deck/variant blank route
silent legacy v0 migration persistence
browser-fragile export Blob URL lifecycle
storage error-code collision risk
reset omitted backup keys or presented partial failure as success
forensic backup had no user-accessible raw export path
ErrorBoundary emergency reset retained false-success behavior
deck deletion lacked confirmation and restore guidance
danger Dialog initially focused the destructive action
important Dialog copy lacked aria-describedby association
MatchSession React identity used a bounded gameplay seed
Editor live diagnostics differed from production boundaries
skin preload/unmount race failures could leave stale/loading state
skin inheritance exact-limit check was off by one
runtime external-SVG and registry integrity checks were incomplete
manifest origin could self-promote without loader-owned classification
unsafe import diagnostics were unbounded
CI actions used mutable major tags
Python dependency consistency was not checked after install
obsolete Batch 11 baseline and stale entry/risk/performance/distribution docs
```

### Current controls

```text
L9005 storage-read fallback; every mutation/export fails closed
L9006 bootstrap-write warning
L9007 old over-limit payload backup and bounded normalization
L9008 duplicate persisted deck-ID consolidation
independently guarded backup/cleanup
strict schema parse immediately before each persisted write
atomic match record/coin/role/achievement commit
shared collection limits: 200/100/500/100/20
set-like legacy arrays dedupe before retention caps
nested ID + membership + ignored-field + score-cap validation
same-ID import requires unchanged input + unchanged stored-entry fingerprint
stale Editor/detail update/delete is rejected
valid deck body survives wrapper metadata damage
valid records/progress survive isolated malformed history rows
all store boot issues visible
safe missing-entity route recovery
legacy migration review + unchanged second-action persistence
attached export anchor + deferred URL revocation
raw corrupt-backup bundle export with truthful file-failure handling
reset covers active/backup/skin keys and reports partial failure
danger Dialog starts on cancellation and describes irreversible copy
MatchSession React key uses matchSessionId
Editor live panel uses validateDeckForUse
skin preload failures retain previous/fallback state
skin registry rejects duplicate/future contract entries
loader-owned origin classification rejects manifest trust mismatch
external-evaluated SVG rejected at runtime validation
unsafe import diagnostics capped with I2011 while import remains rejected
Main CI/Integrity actions pinned to immutable commit SHAs
Python asset job runs exact top-level pins + pip check + fixtures
```

Integrity definitions: **92 committed cases across 28 files**, not yet executed
on the final exact SHA.

### Current verification required

```text
stop concurrent writers
freeze clean HEAD == origin/main
pnpm install --frozen-lockfile
run Integrity Contracts workflow equivalent
confirm all 92 targeted cases are collected and pass
pnpm typecheck
pnpm test
pnpm skin:validate
pnpm build
run Python 3.13 install + pip check + asset fixtures
complete Batch 11 on the same SHA/artifact
```

Any product/test/dependency/workflow change invalidates partial current-SHA
evidence and restarts the sequence.

### Still open / unclaimed

```text
exact-current-SHA verification and observed GitHub Actions result
Batch 11 production Firefox/WebKit
physical iPhone Safari / iPad / Android
real deploy to selected hosting
rollback of an actually deployed immutable artifact
Safari + VoiceOver
NVDA / JAWS
remaining Batch 8 Result/Cute Pop VoiceOver evidence
validated backup restore/merge UI
true transaction/version model for advertised concurrent multi-tab editing
cryptographic external skin signature/entitlement/installer authority
Python transitive dependency hash lock
provider-specific CSP/security headers
```

## Gate 7 — Installed / Paid Skin Ready

```text
installer-owned package trust policy enforced
manifest cannot self-promote external package to official
arbitrary CSS/JS/HTML/URL/font blocked
external SVG blocked
file/dimension/byte/geometry limits enforced
versioned/content-hashed assets
required preload and atomic apply
previous skin retained on failure
signature/hash/identity/upgrade/rollback/uninstall implemented
marketplace/payment reviewed separately
```

Current runtime loading now binds manifest validation to a loader-owned origin
classification, so manifest text alone cannot elevate trust. Gate 7 is still not
satisfied: the external installer, package-source authority, signature
verification, entitlement, revocation, upgrade/rollback, and lifecycle UI are
not built. Do not advertise paid-skin distribution.

## Gate 8 — Match Restore / Replay Ready

```text
persistent matchSessionId
recent processed keys prevent non-adjacent duplicates
deterministic action/seed replay contract
backward-compatible persisted state
A -> B -> duplicate A proof
```

The current session-ID/idempotency baseline does not mean restore/replay exists.

## Future Network Gate

No backend/API currently exists. Before login, sync, multiplayer, uploads,
telemetry, marketplace, or another API:

```text
authentication and authorization
rate limiting and abuse controls
privacy-safe observability/metrics/tracing
capacity/load tests
timeout/retry/offline/dependency-failure tests
incident ownership and rollback
secret management and retention policy
```

See `docs/OPERATIONS-READINESS.md`.

## Demo Limitations Copy

```text
This is a local-first demo.
Decks and progress are stored locally in your browser.
Imported decks are validated before play.
Known legacy data is reviewed before migration is saved.
Importing an existing deck ID requires explicit overwrite confirmation.
Corrupt-backup copies can be exported before destructive reset.
Local/private image data is not included in shared JSON.
Online multiplayer and accounts are not included.
Only the listed browsers, devices, skins, and features are supported.
```

## Never Demo If

```text
current HEAD has no green exact-SHA verification
unsafe import fields are accepted
legacy migration changes are silently persisted
same-ID import can silently replace an existing deck
storage read denial can lead to an empty-based overwrite
record and reward persistence can partially commit
app can write a payload outside its own read schema
nested IDs/memberships/group fields/score caps can remain ambiguous
stale UI can overwrite/delete a detected newer entry
2-player mode appears selectable
an unfinished variant can start
score cannot be explained
skin failure can blank/brick or remain loading
recovery can throw a raw storage exception
recovery warnings are discarded
unpersisted rewards are shown as saved
reset claims success after partial deletion failure
destructive action has no explicit safe confirmation
old artifact evidence is presented as current
```

## Reporting

Every gate/Batch decision records:

```text
exact commit SHA and artifact hash
commands and results
CI run/status or explicitly unavailable
browser/device/viewport/version
skin(s)
manual/automated/visual evidence type
known exclusions
PASS / CONDITIONAL / BLOCKED
```

## Final Decision

A release is a promise. Expose only behavior whose rules, recovery,
compatibility, accessibility, performance authority, and deployment scope are
verified on the exact artifact being presented.
