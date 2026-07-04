# Remaining Design Gaps Closure

## Purpose

This document closes remaining design gaps before implementation.

The previous gates cover role analysis, discard insight, match state, and engine/UI separation.

This file covers the remaining areas that can still create bad UX or implementation rewrites.

Related docs:

```text
docs/51-role-analysis-and-game-feel-ux.md
docs/52-role-analysis-test-minimum.md
docs/53-discard-insight-and-beginner-ux.md
docs/54-hard-design-decisions-before-implementation.md
docs/55-integrated-ux-and-engine-guardrails.md
docs/56-pre-ui-implementation-master-gate.md
```

## 1. Role Editor UX

Problem:

If users can freely define roles without guardrails, they will create confusing or impossible roles.

Decision:

Role creation must start from templates.

MVP templates:

```text
same category count
same tag count
specific tile set
distinct categories
same name duplicates
special bonus from tile group
score bonus from duplicate rule
```

Advanced JSON-like editing is not MVP.

The editor should show:

```text
what this role needs
example completed hand
why it can win or cannot win
estimated difficulty
score warning
wildcard behavior
```

## 2. Role Condition Preview

Problem:

Users need to understand a role before playing.

Decision:

Every role editor must have a live test area.

Live test shows:

```text
sample tiles selected
condition passes/fails
missing condition
wildcard used or blocked
role kind: win_role or special_bonus
can win: yes/no
```

## 3. Balance Diagnosis

Problem:

Custom decks can become technically valid but boring.

Decision:

Balance Check should produce readable diagnostics.

Checks:

```text
too few win roles
too many easy win roles
too many high-score easy roles
too many wildcard-dependent roles
too many similar roles
too few categories used by roles
score spread too wide
bonus-only roles may confuse players
```

The output should say what to fix, not only that something is wrong.

## 4. Tile Identity

Problem:

The same tile name, same category, and duplicate instances can confuse rules.

Decision:

Use strict identity layers:

```text
tileId: deck definition
tileInstanceId: physical tile in match
name: display text
categoryIds: rule grouping
tags: optional rule grouping
```

Rules must not depend on display order or image.

## 5. Category and Tag UX

Problem:

Too many categories or tags make role creation hard.

Decision:

MVP must keep categories primary and tags secondary.

Category is visible on tile cards.

Tags are advanced metadata.

UI should not show every tag during normal play.

## 6. Copywriting Rules

Problem:

Bad wording makes the game feel bossy or unclear.

Decision:

Use factual, gentle language.

Good:

```text
あと1枚: 鳥カテゴリ
この牌を捨てると候補が1つ減ります
このボーナスだけではあがれません
```

Avoid:

```text
これが正解
この牌を捨てろ
あなたはこれを狙っています
```

## 7. Empty States

Problem:

First-time users can get lost before creating or importing decks.

Decision:

Every empty state needs one primary action and one explanation.

Examples:

```text
No decks: Start with Animal Starter
No roles: Add a winning role first
No categories: Add categories before tiles
No valid variant: Fix deck warnings before match
```

## 8. Error States

Problem:

Validation errors can feel like a dead end.

Decision:

Errors should be recoverable.

Every error should include:

```text
what happened
why it matters
how to fix
```

Never show raw schema errors directly as the only message.

## 9. Loading and Saving

Problem:

Local-first apps can lose trust if saving is unclear.

Decision:

MVP should communicate save state simply.

States:

```text
saved
unsaved changes
save failed
recovered local data
import failed
```

Do not block normal play with noisy save messages.

## 10. Import Validation UX

Problem:

Imported decks can fail for many reasons.

Decision:

Import flow should parse first, validate second, preview third.

Flow:

```text
select JSON
parse
validate
show summary
show errors/warnings
allow import only if no errors
```

Image fields remain forbidden in shared JSON.

## 11. Versioning and Migration

Problem:

Deck schema will evolve.

Decision:

Every deck must have schema version.

Unknown versions:

```text
newer version: reject with explanation
older supported version: migrate or show upgrade path
invalid version: reject
```

Never silently mutate imported user data without telling the user.

## 12. Tutorial / First Run

Problem:

Players may not understand draw, discard, role candidate, wildcard, and bonus-only concepts.

Decision:

First run should teach in small moments, not a long manual.

Tutorial cards:

```text
Draw one tile
Choose one tile to discard
Watch close candidates
Wildcard can help one role
Bonus alone cannot win
Ron/Tsumo appears only when a win role is complete
```

Tutorial can be skipped.

## 13. Undo / Confirmation

Problem:

Small landscape screens cause mis-taps.

Decision:

Use confirmation only for important irreversible actions.

Confirm:

```text
delete deck
overwrite deck
import replacing existing deck
leave editor with unsaved changes
```

Do not confirm every discard by default.

Instead, use clear selected state and final discard button.

## 14. Touch Drag Sorting

Problem:

Dragging hand tiles on phone landscape can conflict with discard.

Decision:

MVP should separate sorting and discarding.

Default:

```text
tap tile = select
tap discard = discard selected tile
long press or sort mode = reorder
sort button = auto organize
```

Do not make accidental drag equal discard.

## 15. Animation Priority

Problem:

Too much animation hides game state.

Decision:

Animation priority:

```text
1. draw tile feedback
2. selected tile feedback
3. ron/tsumo availability
4. win result
5. collection unlock
```

Do not animate all candidate changes equally.

## 16. CPU Transparency

Problem:

CPU can feel unfair if it wins suddenly.

Decision:

CPU result should show simple explanation.

Examples:

```text
CPU completed Animal Trio
CPU used Star as Bird
CPU won by ron from discarded Dog
```

Do not show full CPU thinking during match.

## 17. Collection and Progression Boundary

Problem:

Progression can become pay-to-win or distract from match clarity.

Decision:

Progression must not affect match strength.

Allowed:

```text
cosmetic title
collection record
result album
clear board
editor helper unlock
```

Forbidden:

```text
stronger wildcard
higher score from coins
extra hand size from purchase
CPU weakness from coins
```

## 18. Accessibility Copy and State

Problem:

Color-only category signals can fail.

Decision:

Every important state needs non-color support.

Required:

```text
text label
icon or pattern
focus-visible
selected state text
aria label for key buttons later
```

## 19. Test Coverage Closure

Before UI work, tests or pending test notes must cover:

```text
role editor template output
role live test pass/fail
balance warnings
import validation
schema version handling
local data recovery
hand sort mode separation
selected tile discard flow
bonus-only explanation
CPU result explanation
```

## Final Decision

Soro-pon should feel flexible without feeling uncontrolled.

The editor should prevent confusing decks.
The match UI should explain current facts.
The engine should stay deterministic.
The player should feel in control.
