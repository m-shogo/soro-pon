# Release And Demo Gates

## Purpose

This document separates internal implementation, first playable, user test, and public demo readiness.

Do not treat a local build as public-demo ready.

## Gate 1: Internal Build

Allowed audience:

```text
developer only
```

Requirements:

```text
app boots
basic tests pass
known broken features documented
local data may be reset anytime
```

Not required:

```text
polished UI
manual QA across all sizes
stable save compatibility
```

## Gate 2: First Playable

Allowed audience:

```text
developer and trusted tester watching live
```

Requirements:

```text
animal starter can complete a round
3-player and 4-player setup work
result screen explains score
reload does not crash
no existing IP assets in app/sample/screenshots
```

Known issues may exist.

## Gate 3: User Test Ready

Allowed audience:

```text
small trusted testers
```

Requirements:

```text
manual QA checklist mostly passes
import failure UX understandable
invalid decks cannot start match
local data reset path exists
main landscape sizes reviewed
known issue list visible to developer
```

## Gate 4: Public Demo Ready

Allowed audience:

```text
limited public link
```

Requirements:

```text
CI passing
build passing
manual QA passing for target browsers
no existing IP assets
no remote image loading from user decks
no login/payment/cloud promise
export excludes local/private data
README includes demo limitations
reset local data path visible enough
```

## Gate 5: Release Candidate

Allowed audience:

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
```

## Demo Limitations Copy

Public demo should clearly state:

```text
This is a local-first MVP demo.
Decks are stored locally in your browser.
Imported decks are validated before play.
Local images are not included in shared JSON.
Online multiplayer and accounts are not included yet.
```

## Never Demo If

```text
unsafe import fields are accepted
existing IP assets are included
2-player match appears selectable
extended pending variant can start accidentally
score cannot be explained
reload crashes common flow
```

## Final Decision

A demo is a promise.

Only demo the parts that are actually safe and working.
