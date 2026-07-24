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
all P0 items in docs/SKIN-FOUNDATION-HARDENING.md complete
typed token allowlist enforced
pnpm skin:validate passes
both official skins meet semantic contrast rules
Gallery and user-facing SkinSelector work without reload
skin switch preserves screen/match/editor state
layered SkinSurface keeps content/focus/hit areas invariant
candidate-first asset workflow exists
```

Image flow:

```text
generated/candidates
-> preview and visual comparison
-> human approval
-> generated/final
```

Never generate directly into final.

## Gate 4: User Test Ready

Audience: small trusted tester group.

Requirements:

```text
manual/automated QA passes for the explicitly stated scope
main landscape sizes reviewed
both official skins usable
import failure UX understandable
invalid decks cannot start
ErrorBoundary and recoverable ErrorState exist
visible local-data reset path exists
skin load failure cannot brick the app
known issue list is current
```

## Gate 5: Public Demo Ready

Audience: limited public link.

Requirements:

```text
CI, typecheck, tests, skin validation, and build passing
visual regression accepted for the target scope
manual QA passing for target browsers/devices
keyboard/focus basics accepted
supported skin set explicitly stated
no existing IP assets
no remote image loading from user decks or skins
no login/payment/cloud promise
export excludes local/private metadata
README includes exact demo limitations
reset/recovery path is visible
missing/corrupt entity paths show recovery, not blank screens
skin switching updates browser color scheme
```

A Gate 5 PASS is always qualified by its tested browser/device scope. If
one skin or browser is not ready, do not silently include it in the
public promise.

## Gate 6: Release Candidate

Audience: broader users.

Requirements:

```text
schema migration policy tested
storage read/write recovery tested
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

## Current RC Readiness (2026-07-24)

```text
Historical Gate 6 decision: PASS
Batch 7: COMPLETE
Batch 8 (real VoiceOver + Chrome, attempts 1-6): CONDITIONAL
Batch 9 (extended memory/runtime soak): COMPLETE
Batch 10 (production preview / real-device release validation): CONDITIONAL
Batch 11 (production Firefox/WebKit auxiliary validation):
  CONTRACT DEFINED / NOT YET EXECUTED
RC status: LIMITED READY
Current product HEAD after storage integrity fixes:
  verification pending; do not claim the historical green suite applies
  until CI/local commands run on the exact current SHA
```

### Evidence already established

```text
Batch 8, real VoiceOver + Chrome (not Safari):
  yorunoshirube TOP/JSON Import/Deck Editor/Match Setup/Match and Result
  heading/action controls; cute-pop Match Setup and Match key controls.
  Result win/rank/score static speech is supplemental only.

Batch 9, DEV SERVER:
  Chromium 62.3 min / 74 cycles memory-authoritative soak.
  Firefox/WebKit auxiliary stability only, no memory claim.

Batch 10, LOCAL PRODUCTION PREVIEW in Chromium:
  production build, 14/14 core flows, 35 min / 47 cycle soak, 0 recorded
  product errors. This was not a deploy.
```

### Integrity review after Batch 10

The post-Batch-10 review found a real recovery-contract gap: normal
writes were wrapped, but corruption recovery used raw
`getItem/setItem/removeItem` operations. A compound state such as
corrupted payload plus quota/storage-policy rejection could make the
recovery path itself throw.

Changes committed:

```text
deck/records/settings read denial now falls back with L9004
corrupt backup and active-key cleanup are independently best-effort
records/settings raw corrupt values receive backup keys when possible
six storage-operation failure-path unit tests added
storage recovery policy corrected
```

These are code and test changes, not execution evidence. Until the exact
current HEAD passes typecheck/tests/skin validation/build and Batch 11 is
run from that same SHA, the repo must not report a new COMPLETE release
result.

### Still open / unclaimed

```text
physical iPhone Safari
physical iPad
physical Android
real deploy to a selected hosting target
rollback of an actually deployed immutable artifact
Safari + VoiceOver
NVDA / JAWS
Batch 8 Result static-text speech capture
Cute Pop Result traversal under real VoiceOver
production-build Firefox/WebKit result (Batch 11 pending)
```

### Next executable work

```text
1. Freeze exact HEAD == origin/main and confirm clean worktree.
2. Run CI-equivalent commands on that SHA:
   pnpm install --frozen-lockfile
   pnpm typecheck
   pnpm test
   pnpm skin:validate
   pnpm build
3. Confirm the new storage failure-path tests execute and pass.
4. Execute the complete Batch 11 matrix from the same SHA.
5. Commit report/evidence and then synchronize README/CLAUDE/gates.
```

No result from commit `6a844dd`, `c9b18b6`, or another older artifact may
be relabeled as validation of the post-review product HEAD.

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

The current idempotency baseline does not itself mean match restore or
replay is implemented.

## Demo Limitations Copy

Public demo copy must state at minimum:

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
active skin can change layout/hit areas/game state
contrast/focus makes core controls unreadable
reset/recovery path is unavailable
storage recovery can throw an unhandled raw exception
an older artifact's PASS is presented as current-HEAD evidence
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
