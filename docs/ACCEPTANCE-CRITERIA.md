# Acceptance Criteria

## Purpose

This document defines when each phase is considered complete.

Do not call a phase done just because the UI looks good.

## Phase 0: Design Ready

Complete when:

```text
MASTER-SPEC exists
IMPLEMENTATION guide exists
GLOSSARY exists
architecture/API/state/error/test/risk docs exist
animal starter sample exists
```

Status:

```text
Design-ready is mostly complete before code implementation.
```

## Phase 1: Project Skeleton Ready

Complete when:

```text
Vite React TS boots
package manager chosen
lockfile committed
typecheck command exists
test command exists
build command exists
minimal App renders
CI gate planned or added
```

Not complete if:

```text
no tests command
multiple package managers
uncommitted lockfile
```

## Phase 2: Schema / Import Ready

Complete when:

```text
DeckProject schema implemented
strict object parsing everywhere
animal starter parses
scoreBudget required for current schema
unsafe key scan implemented
unknown fields rejected
import preview result exists
migration policy has first tests
```

Required proof:

```text
schema tests pass
import security tests pass
animal starter strict parse pass
```

## Phase 3: Validation Ready

Complete when:

```text
validateDeckProject implemented
blocked/draft/playableWithWarnings/playable statuses implemented
reference validation implemented
role feasibility validation implemented
scoreBudget warnings implemented
custom deck safety warnings implemented
```

Required proof:

```text
valid fixtures pass
invalid fixtures return expected codes
adversarial fixtures return expected codes/warnings
```

## Phase 4: Engine Core Ready

Complete when:

```text
group enumeration implemented
9-tile partition implemented
wildcard resolution implemented
normal winRole matching implemented
tsuno/ron shape rules implemented
candidate ranking deterministic
score breakdown implemented
```

Required proof:

```text
group tests pass
wildcard tests pass
ron/tsumo tests pass
scoring tests pass
hand order invariance tests pass
```

## Phase 5: Match Reducer Ready

Complete when:

```text
MatchState implemented
applyMatchAction implemented
invalid actions preserve state
ron window implemented
turn rotation implemented
draw result implemented
CPU minimum policy implemented
```

Required proof:

```text
match reducer tests pass
seeded replay test pass
CPU deterministic tie-break test pass
```

## Phase 6: UI Foundation Ready

Complete when:

```text
tokens.css exists
primitives exist
responsive metrics exist
Component Gallery exists
core states visible
focus/disabled/selected states visible
```

Required proof:

```text
Component Gallery review
no full Match UI before this
```

## Phase 7: First Playable Ready

Complete when:

```text
Deck List
Deck Detail
Match Setup
Match UI minimal
Result minimal
CPU players
animal starter playable round
localStorage recovery
```

Required proof:

```text
one full local round can finish by tsumo
one full local round can finish by ron
one full local round can end draw
reload does not corrupt app
```

## Phase 8: User Test Ready

Complete when:

```text
manual QA checklist passes
main screen sizes reviewed
import failure UX understandable
draft/playable states clear
result explanation trustworthy
known issues documented
```

Required proof:

```text
manual QA report
screenshots for required sizes
known issue list
```

## Phase 9: Demo Ready

Complete when:

```text
safe sample deck only
no existing IP assets
no remote image loading
no user account/login promise
local data reset path exists
README demo warning exists
```

Required proof:

```text
release/demo gate checked
build succeeds
manual smoke on target browser
```

## Definition Of Done For Any Task

A task is done only when report includes:

```text
changed files
commit SHA
tests run
build/typecheck run or skipped with reason
remaining risk
```

## Final Decision

Completion means verified behavior, not just written code.
