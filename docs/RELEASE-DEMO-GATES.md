# Release And Demo Gates

## Purpose

This document separates internal implementation, skin-foundation readiness, image-production readiness, user test, public demo, and installed-skin distribution.

A local build is not a public demo.

## Gate 1: Internal Build

Audience:

```text
developer only
```

Requirements:

```text
app boots
basic typecheck/tests/build pass
known broken features documented
local data may be reset
active skin failure still leaves a usable fallback
```

Not required:

```text
polished UI
full viewport QA
stable image assets
public recovery copy
```

## Gate 2: Gameplay First Playable

Audience:

```text
developer and trusted tester watching live
```

Requirements:

```text
animal starter completes a round
3-player and 4-player setup work
result explains score
reload does not crash
no existing IP assets
```

## Gate 3: Skin Foundation Image-ready

Audience:

```text
developer/design reviewer
```

Requirements:

```text
all P0 items in docs/SKIN-FOUNDATION-HARDENING.md complete
explicit typed token allowlist enforced
pnpm skin:validate passes
Cute Pop and Yorunoshirube contrast accepted
Gallery and user-facing SkinSelector work without reload
skin switch preserves screen/match/editor state
layered SkinSurface keeps content/focus/hit areas invariant
panel and button nine-slice proof accepted at five sizes
candidate-first asset workflow exists
```

Only after this gate may broad image production start.

Image flow:

```text
generated/candidates
-> preview and visual comparison
-> human approval
-> generated/final
```

Never generate directly into final.

## Gate 4: User Test Ready

Audience:

```text
small trusted testers
```

Requirements:

```text
manual QA checklist passes enough for stated test scope
main landscape sizes reviewed
both official skins usable without final images or with reviewed assets
import failure UX understandable
invalid decks cannot start
ErrorBoundary and recoverable ErrorState exist
visible local-data reset path exists
skin load failure cannot brick the app
known issue list is current
```

## Gate 5: Public Demo Ready

Audience:

```text
limited public link
```

Requirements:

```text
CI passing
build passing
skin validation passing
component/DOM tests passing
visual regression accepted for demo scope
manual QA passing for target browsers
keyboard/focus basics accepted
both official skins or the explicitly demoed subset are stable
no existing IP assets
no remote image loading from user decks or skins
no login/payment/cloud promise
export excludes local/private data
README includes demo limitations
reset local data path is visible
common missing/corrupt entity paths show recovery, not blank screens
skin switching updates light/dark browser color scheme
```

If one skin is not ready, do not silently include it in the public selector. State the supported demo skin set explicitly.

## Gate 6: Release Candidate

Audience:

```text
broader users
```

Requirements:

```text
schema migration policy tested
storage recovery tested
known severe bugs fixed
visual polish accepted
accessibility basics accepted
performance caps tested
asset caching/version behavior accepted
skin package failure/rollback behavior accepted
```

## Gate 7: Installed / Paid Skin Ready

Audience:

```text
users receiving separately installed or purchased skins
```

Requirements:

```text
external package trust policy enforced
external arbitrary CSS/JS/HTML/URL/font blocked
external SVG blocked by default or proven sanitized
PNG/WebP/dimension/byte limits enforced
versioned or content-hashed assets
required assets preload
skin applies atomically or previous skin remains
package identity, ownership/source, contract version, integrity strategy defined
upgrade/rollback/uninstall defined
entitlement does not grant execution privileges
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

The current immediate duplicate defense is not sufficient proof for restore/replay.

## Demo Limitations Copy

Public demo should state:

```text
This is a local-first demo.
Decks and progress are stored locally in your browser.
Imported decks are validated before play.
Local/private image data is not included in shared JSON.
Online multiplayer and accounts are not included.
Only the listed skins/features are supported in this demo.
```

## Never Demo If

```text
unsafe import fields are accepted
existing IP assets are included
2-player mode appears selectable
extended pending variant can start
score cannot be explained
reload crashes common flow
skin failure can blank or brick the app
active skin can change layout/hit areas/game state
contrast/focus makes core controls unreadable
reset/recovery path is unavailable
CI/skin validation status is unknown but claimed as passing
```

## Reporting

Every gate decision records:

```text
commit
scope
local commands and results
CI run or unavailable
browser/device/viewport
skin(s)
manual/visual evidence
known exclusions
pass / blocked / limited pass
```

## Final Decision

A demo or paid skin is a promise. Expose only the parts whose rules, recovery, accessibility, skin contract, and visual behavior are actually verified.
