# Release And Demo Gates

## Purpose

This document separates internal implementation, skin-foundation
readiness, image-production readiness, user testing, public demo scope,
release-candidate evidence, and installed-skin distribution.

A local build is not a public demo. A local production preview is not a
deploy. Playwright WebKit is not Safari. Historical PASS evidence does
not automatically validate a newer product HEAD.

## Gate 1: Internal Build

Audience: developer only.

Requirements:

```text
app boots
basic typecheck/tests/build pass
known broken features documented
local data may be reset
active skin failure still leaves a usable fallback
```

## Gate 2: Gameplay First Playable

Audience: developer and trusted tester watching live.

Requirements:

```text
animal starter completes a round
3-player and 4-player setup work
result explains score
reload does not crash
no existing IP assets
```

## Gate 3: Skin Foundation Image-ready

Audience: developer/design reviewer.

Requirements:

```text
all P0 skin-foundation items complete
typed token allowlist enforced
pnpm skin:validate passes
both official skins meet semantic contrast rules
Gallery and user-facing SkinSelector work without reload
skin switch preserves screen/match/editor state
layered SkinSurface keeps content/focus/hit areas invariant
candidate-first asset workflow exists
```

Never generate directly into `generated/final`.

## Gate 4: User Test Ready

Audience: small trusted tester group.

Requirements:

```text
QA passes for the explicitly stated scope
main landscape sizes reviewed
both official skins usable
import failure UX understandable
invalid decks cannot start
ErrorBoundary and recoverable state exist
visible local-data reset path exists
skin load failure cannot brick the app
known issue list is current
```

## Gate 5: Public Demo Ready

Audience: limited public link.

Requirements:

```text
CI, typecheck, tests, skin validation, and build passing
visual regression accepted for target scope
manual QA passing for target browsers/devices
keyboard/focus basics accepted
supported skin set explicitly stated
no existing IP assets
no remote image loading from user decks or skins
no login/payment/cloud promise
export excludes local/private metadata
README includes exact demo limitations
reset/recovery path is visible
missing/corrupt entity paths recover instead of remaining blank
skin switching updates browser color scheme
```

A Gate 5 PASS is always qualified by its tested browser/device scope.

## Gate 6: Release Candidate

Audience: broader users.

Requirements:

```text
schema migration policy tested
storage read/write/recovery failure paths tested
known severe bugs fixed
visual polish accepted
accessibility basics accepted
performance caps tested
asset caching/version behavior accepted
skin package failure/rollback behavior accepted
release claim matches the exact tested artifact SHA
```

Gate 6 was historically passed in Batch 6. Later batches extend or
constrain RC readiness; they do not rewrite the original evidence.

## Current RC Readiness — 2026-07-24

```text
Historical Gate 6 decision: PASS
Batch 7: COMPLETE
Batch 8 real VoiceOver + Chrome: CONDITIONAL
Batch 9 extended memory/runtime soak: COMPLETE
Batch 10 production preview / real-device validation: CONDITIONAL
Batch 11 production Firefox/WebKit:
  CONTRACT DEFINED / NOT YET EXECUTED
RC status: LIMITED READY
Current product HEAD:
  verification pending after storage/AppRoot integrity fixes
```

### Evidence already established

```text
Batch 8, real VoiceOver + Chrome (not Safari):
  recorded traversed and supplemental scope for both official skins.

Batch 9, DEV SERVER:
  Chromium memory-authoritative 62.3 min / 74 cycle soak.
  Firefox/WebKit stability-only; no memory claim.

Batch 10, LOCAL PRODUCTION PREVIEW in Chromium:
  clean production build, 14/14 core flows, 35 min / 47 cycle soak,
  zero recorded product errors. This was not a deploy.
```

### Integrity review after Batch 10

The review found multiple real consistency defects:

```text
1. Corruption recovery used raw storage operations; corruption plus quota
   or browser-policy denial could make recovery itself throw.
2. Corrupted records/settings raw values were not preserved.
3. Records/settings recovery issues were returned but discarded by AppRoot,
   so recovery could happen without a user-visible boot warning.
4. Achievement persistence failure could still return the achievement to
   Result UI as newly unlocked.
5. Missing/deleted current decks or an invalid active variant could leave
   a route rendering null indefinitely.
6. L9004 was almost reused for storage read denial even though it already
   means local-image fallback; the collision was removed before validation.
7. Export revoked its Blob URL immediately and did not attach the anchor,
   a cross-browser reliability risk before Batch 11.
```

Current `main` fixes:

```text
deck/records/settings read denial -> L9005 + safe empty/default fallback
bootstrap starter write failure -> L9006
backup and active-key cleanup independently guarded
records/settings raw corrupt backup keys
all three stores' initial issues included in boot Toast
unpersisted achievements are not displayed as unlocked
missing deck/variant routes return to a safe screen with a warning
export uses a temporary attached anchor and deferred URL revocation
six storage-operation failure-path unit tests
error-code table and storage/release docs synchronized
```

These are code/test changes, not execution evidence. Current-HEAD commands
and Batch 11 still must run.

### Still open / unclaimed

```text
physical iPhone Safari
physical iPad
physical Android
real deploy to a selected hosting target
rollback of an actually deployed immutable artifact
Safari + VoiceOver
NVDA / JAWS
Batch 8 Result static-text spoken-output capture
Cute Pop Result under real VoiceOver
production-build Firefox/WebKit result (Batch 11 pending)
```

### Next executable work

```text
1. Freeze exact clean HEAD == origin/main.
2. Run pnpm install --frozen-lockfile.
3. Run pnpm typecheck / pnpm test / pnpm skin:validate / pnpm build.
4. Confirm storageRecoveryFailurePaths.test.ts is collected and passes.
5. Execute the complete Batch 11 matrix from the same SHA.
6. If product code changes, invalidate partial evidence and restart.
7. Commit report/evidence, then synchronize entry documents.
```

No older artifact result may be relabeled as current-HEAD validation.

## Gate 7: Installed / Paid Skin Ready

Audience: users receiving separately installed or purchased skins.

Requirements:

```text
external package trust policy enforced
arbitrary CSS/JS/HTML/URL/font blocked
external SVG blocked by default or proven sanitized
PNG/WebP/dimension/byte limits enforced
versioned or content-hashed assets
required assets preload
skin applies atomically or previous skin remains
package identity/source/contract version/integrity defined
upgrade/rollback/uninstall defined
entitlement grants no execution privileges
marketplace/payment security reviewed separately
```

Do not advertise paid-skin support before this gate.

## Gate 8: Match Restore / Replay Ready

Before restore/replay/resend features:

```text
persistent matchSessionId exists
recent processed match IDs prevent non-adjacent duplicates
recording builders receive timestamp/ID explicitly
storage migration is backward compatible
A -> B -> duplicate A test passes
```

The current idempotency baseline does not mean restore/replay is implemented.

## Demo Limitations Copy

```text
This is a local-first demo.
Decks and progress are stored locally in your browser.
Imported decks are validated before play.
Local/private image data is not included in shared JSON.
Online multiplayer and accounts are not included.
Only the listed browsers, devices, skins, and features are supported.
```

## Never Demo If

```text
current HEAD has no green CI-equivalent verification
unsafe import fields are accepted
existing IP assets are included
2-player mode appears selectable
an unfinished variant can start
score cannot be explained
reload crashes a common flow
skin failure can blank or brick the app
active skin changes layout/hit areas/game state
contrast/focus makes core controls unreadable
reset/recovery path is unavailable
recovery can throw an unhandled raw storage exception
recovery warnings are silently discarded
unpersisted rewards are displayed as saved
an old artifact PASS is presented as current-HEAD evidence
```

## Reporting

Every gate or Batch decision records:

```text
exact commit SHA
scope
commands and results
CI run or explicitly unavailable
browser/device/viewport and versions
skin(s)
manual/automated/visual evidence type
known exclusions
pass / conditional / blocked
artifact hash for production/deploy claims
```

## Final Decision

A demo or release is a promise. Expose only the portions whose rules,
recovery, accessibility, skin contract, deployment status, and visual
behavior are verified on the exact artifact being presented.
