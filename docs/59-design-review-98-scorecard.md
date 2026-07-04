# Design Review 98 Scorecard

## Purpose

This document reviews Soro-pon's pre-implementation design as if another reviewer checked it.

Target: 98/100 design readiness before implementation.

100/100 is not claimed before implementation, tests, screenshots, and playtest.

## Review Summary

Current design readiness after docs 51-58:

```text
estimated score: 96-98 / 100
```

The design is strong enough to start domain/schema/engine implementation.

It is not strong enough to skip tests or jump directly to full UI.

## Scored Areas

| Area | Score | Notes |
|---|---:|---|
| role analysis principles | 98 | intent guessing removed, full candidate analysis fixed |
| wildcard safety | 98 | max per win_role/set fixed, discarded wildcard ron blocked |
| candidate ranking | 97 | formula exists, still needs tuning after playtest |
| discard UX | 96 | impact scoring exists, exact feel needs prototype |
| insight UX | 98 | facts-not-advice boundary is clear |
| beginner mode | 96 | display limits fixed, tutorial timing defined |
| advanced mode | 95 | detail scope defined but UI layout not proven |
| role editor | 95 | templates fixed, but form layout still future work |
| deck validation | 97 | thresholds exist, tune later |
| scoring transparency | 98 | breakdown contract fixed |
| state machine | 97 | transition table exists, needs reducer tests |
| CPU behavior | 95 | weights exist, feel needs playtest |
| import/versioning | 96 | behavior table fixed, migrations not implemented |
| local data safety | 96 | recovery policy fixed, exact UI copy later |
| responsive UI | 95 | strong docs exist, needs screenshots |
| implementation readiness | 97 | phase order and gates are clear |

## Remaining Non-blocking Gaps

These do not block Phase 1 implementation, but must be handled before calling the game polished.

```text
actual analyzer performance with large decks
candidate ranking feel after playtest
CPU discard feel after playtest
role editor form layout
advanced detail panel layout
exact tutorial copy
real 5-size screenshots
component gallery review
```

## Blocking Gaps Before Full Match UI

These block full Match UI if not implemented or tracked as pending tests.

```text
HandAnalyzer tests
WildcardResolver tests
WaitAnalyzer tests
IntentRanker tests
ExplainEngine tests
InsightEngine tests
Discard preview purity tests
Match state reducer tests
Score breakdown tests
Deck validation tests
```

## Reviewer Concerns and Answers

### Concern: roles can explode to 100+ candidates

Answer:

- deterministic ranking
- primary candidates capped
- hidden candidate count required
- analyzer warning when capped

### Concern: wildcard makes everything complete

Answer:

- max 1 wildcard per win_role by default
- max 1 per set/group by default
- branch cap
- blocked reasons exposed

### Concern: UI becomes too smart and wrong

Answer:

- UI rule logic forbidden
- engine owns facts
- insight only summarizes facts

### Concern: beginner users still get lost

Answer:

- beginner mode limits candidate/insight count
- first-run tutorial triggers fixed
- discard preview explains impact without telling what to do

### Concern: deck authors create bad decks

Answer:

- validation severity fixed
- thresholds fixed
- role editor templates required
- live role test required

### Concern: scoring feels untrustworthy

Answer:

- result breakdown contract fixed
- wildcard assignments shown
- selected win role shown
- bonus-only cannot win

## Implementation Readiness Verdict

Allowed now:

```text
Vite/React/TS/Zod/Vitest setup
schema implementation
domain types
sample deck parse test
validation implementation
role condition grammar
pure engine functions
engine tests
```

Not allowed yet:

```text
full Match UI before engine tests
fancy animation before state correctness
CPU tuning without analyzer correctness
advanced editor before validation
```

## 98 Point Definition

Soro-pon reaches design-stage 98 when:

```text
docs 51-59 are read by implementation agent
schema + engine tests are planned from docs 52 and 58
full UI is blocked by docs 56 until pure functions exist
all UI rule logic is banned by docs 55
```

## Final Decision

The design is now strong enough to start implementation carefully.

Do not call it final product quality until:

```text
unit tests pass
build passes
component gallery exists
5-size screenshots reviewed
playtest confirms candidate ranking and discard UX feel good
```
