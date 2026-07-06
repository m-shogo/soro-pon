# Technical Risk Register

## Purpose

This document lists technical risks that may still break Soro-pon even after the rule/design docs are strong.

Each risk includes a mitigation and an implementation gate.

## Current Verdict

The product design is strong enough to start domain/schema/engine implementation.

The remaining risks are mostly implementation risks:

```text
randomness/replay
strict import edge cases
performance caps
local storage recovery
image storage later
schema migration
test fixture coverage
CI enforcement
```

## R1: Randomness Is Not Reproducible

Risk:

```text
Shuffle/deal/CPU tie-break differs every run, making bugs hard to reproduce.
```

Mitigation:

```text
Use a seedable RNG for tests and match replay.
Store match seed in MatchState.
Do not use Math.random directly inside engine functions.
```

Gate:

```text
Test: same seed produces same deal and CPU tie-break.
```

## R2: Runtime IDs Are Not Stable Enough

Risk:

```text
TileInstanceId generation changes between functions, breaking replay or tests.
```

Mitigation:

```text
Create tile instances through one function.
Use deterministic IDs in tests.
Keep tileId and tileInstanceId separate.
```

Gate:

```text
Test: createTileInstances creates stable instance IDs with seed/test mode.
```

## R3: Strict Import Over-rejects Useful Future Data

Risk:

```text
Unsafe key scan rejects every url/src key, which is safe for MVP but may block future legitimate fields.
```

Mitigation:

```text
MVP keeps strict no-exception policy.
Future URL-like fields require schema version bump, security review, and explicit allowlist.
```

Gate:

```text
Test: current schema rejects url/src anywhere.
Future change must update MIGRATIONS and ADR.
```

## R4: Strict Import Under-rejects Nested Payloads

Risk:

```text
Unsafe fields hidden deeply inside role conditions or unknown objects pass import.
```

Mitigation:

```text
Run recursive unsafe key scan before Zod parse.
Use strict Zod objects everywhere.
Reject unknown fields.
```

Gate:

```text
Test: nested imageUrl/html/script/url/src/filePath rejected.
```

## R5: Schema And Domain Types Drift

Risk:

```text
Zod schema accepts data that domain types or engine do not support.
```

Mitigation:

```text
Keep schema output aligned with domain types.
Add animal-starter parse + validate + analyze smoke test.
```

Gate:

```text
Test: parsed animal starter can run through validation and basic analysis without adapter hacks.
```

## R6: Group Search Becomes Too Slow

Risk:

```text
Custom decks with many roles/wildcards create too many group partitions.
```

Mitigation:

```text
Use ENGINE_LIMITS.
Natural groups first.
One-wildcard groups second.
Cap partitions and branches.
Return analyzer warnings.
```

Gate:

```text
Test: candidate-explosion fixture returns warning, not timeout.
```

## R7: Candidate Ranking Feels Arbitrary

Risk:

```text
Engine returns correct candidates but top candidate feels random or unstable.
```

Mitigation:

```text
Deterministic rankScore.
Prefer completed > tenpai > near.
Prefer natural groups over wildcard-heavy.
Use deck order as final tie-break.
```

Gate:

```text
Test: same hand always returns same primary candidate order.
```

## R8: Wait Analysis Context Mix-up

Risk:

```text
afterDrawNineTiles, afterDiscardEightTiles, and ronCheckNineTiles get mixed.
```

Mitigation:

```text
WaitAnalyzer requires explicit WaitContext.
Ron always analyzes 8 hand tiles + discarded tile.
Tsumo always analyzes 9 after draw.
```

Gate:

```text
Tests for all three WaitContext values.
```

## R9: Result Score Is Not Reconstructable

Risk:

```text
UI shows a score number that cannot be traced to selectedWinRole and bonuses.
```

Mitigation:

```text
ResultBreakdown contract required.
No hidden modifiers.
No silent cap.
```

Gate:

```text
Test: totalPoints equals selectedWinRole.basePoints + bonuses.
```

## R10: LocalStorage Corruption Breaks Boot

Risk:

```text
Invalid local data crashes app before user can recover.
```

Mitigation:

```text
All localStorage reads go through schema parse.
On failure, boot safe fallback and show recoverable notice.
```

Gate:

```text
Test: corrupt localStorage boots fallback state.
```

## R11: Storage Quota With Future Images

Risk:

```text
Local images exceed browser storage quota or make backup/export confusing.
```

Mitigation:

```text
Do not store images in shared JSON.
Use IndexedDB later, not localStorage, for image blobs.
Resize/sanitize images.
Provide orphan cleanup.
```

Gate:

```text
Before image feature: create LocalImageMap tests and quota/error handling tests.
```

## R12: Object URLs Leak Memory

Risk:

```text
createObjectURL is used without revokeObjectURL.
```

Mitigation:

```text
Object URLs are UI-only temporary values.
Never persist them.
Revoke after preview/load lifecycle.
```

Gate:

```text
Image feature tests or review checklist includes revoke behavior.
```

## R13: UI Accidentally Re-implements Rules

Risk:

```text
React components calculate canRon, score, or wildcard meaning.
```

Mitigation:

```text
UI only renders engine outputs.
Add fields to engine result instead of duplicating logic.
```

Gate:

```text
Code review: no rule functions inside src/ui.
```

## R14: UI State And Match State Are Confused

Risk:

```text
Selecting/previewing a tile mutates match state or commits discard accidentally.
```

Mitigation:

```text
Preview is pure.
Reducer owns gameplay mutation.
Tap selects; discard button commits.
```

Gate:

```text
Test: discard preview does not mutate MatchState.
```

## R15: CPU Appears To Cheat

Risk:

```text
CPU uses hidden opponent information or non-deterministic choices.
```

Mitigation:

```text
CPU uses same analyzer facts as UI.
Seeded deterministic tie-break.
No hidden opponent hand access in MVP.
```

Gate:

```text
Test: same state gives same CPU action and no hidden hand dependency.
```

## R16: Free Decks Are Technically Valid But Boring

Risk:

```text
Deck passes schema but every hand wins, or no hand realistically wins.
```

Mitigation:

```text
Deck validation includes feasibility, wildcard dependency, role overlap, score budget, and candidate noise warnings.
```

Gate:

```text
Adversarial fixtures for too-easy and impossible decks.
```

## R17: Error Messages Drift From Tests

Risk:

```text
UI checks message text and breaks after copy edits.
```

Mitigation:

```text
Tests assert stable error codes, not full message text.
```

Gate:

```text
ValidationIssue includes code and severity.
```

## R18: Docs Say One Thing, Code Does Another

Risk:

```text
Implementation silently diverges from MASTER-SPEC.
```

Mitigation:

```text
When behavior changes, update docs first or in same commit.
CI should eventually check sample parse and golden tests.
```

Gate:

```text
Pull request report includes changed docs or states no spec change.
```

## R19: No CI Gate

Risk:

```text
Tests pass locally once but regress later.
```

Mitigation:

```text
Add CI after package setup: install, typecheck, test, build.
```

Gate:

```text
CI required before UI-heavy work.
```

## R20: Browser Differences In Landscape Layout

Risk:

```text
100svw/100svh behaves differently across mobile browsers.
```

Mitigation:

```text
Use responsive metrics, visual screenshot sizes, and actual device checks later.
Avoid transform scale for whole app.
```

Gate:

```text
Screenshot review sizes before UI is called polished.
```

## R21: Accessibility Is Bolted On Too Late

Risk:

```text
Touch/focus/keyboard/labels become expensive to retrofit.
```

Mitigation:

```text
Primitives must include focus-visible, disabled, selected, aria labels where needed, and 44px touch targets.
```

Gate:

```text
Component Gallery shows keyboard/focus states.
```

## R22: Internationalization Hardcoded Too Early

Risk:

```text
Japanese strings get embedded everywhere, making future localization hard.
```

Mitigation:

```text
MVP may use Japanese copy, but validation issue codes and engine output should be language-neutral.
UI copy maps codes to messages later.
```

Gate:

```text
Engine returns codes/reasons, not only Japanese sentences.
```

## R23: Undo / Replay Is Impossible Later

Risk:

```text
Actions mutate state without event/action log, making bugs hard to reproduce.
```

Mitigation:

```text
Reducer accepts MatchAction and emits MatchEvent.
Store optional action log in dev/replay mode.
```

Gate:

```text
Test: action sequence replay reaches same state with same seed.
```

## R24: Extended Mode Accidentally Half-works

Risk:

```text
extendedRoleSpan parses and UI lets users play it, but engine is pending.
```

Mitigation:

```text
engineStatus: pending blocks match start for extended variant until engine is implemented.
```

Gate:

```text
Test: extended animal starter variant parses but cannot start match while pending.
```

## R25: Dependency Creep

Risk:

```text
New libraries are added to solve small problems and increase complexity.
```

Mitigation:

```text
MVP stack fixed. New state/network/UI libraries require ADR.
```

Gate:

```text
PR report lists added dependencies. No Tailwind/Redux/Zustand/TanStack Query in MVP initial implementation.
```

## Final Priority

Before UI:

```text
R1 RNG/seed
R3/R4 import strictness
R5 schema-domain drift
R6 performance caps
R8 wait context
R9 result reconstructability
R10 localStorage recovery
R13 UI rule leakage
R19 CI gate
```

## Final Decision

The next implementation phase should treat this file as the technical risk checklist.
