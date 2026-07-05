# Safe Deck Creator Rules and Tips

## Purpose

Soro-pon should not rely only on validation after a broken deck is created.

The deck creator should guide users so broken decks are hard to create in the first place.

This document defines editor constraints, locked choices, tips, and safe templates.

Related docs:

```text
docs/68-custom-deck-robustness-guardrails.md
docs/69-adversarial-custom-deck-patterns.md
docs/70-deck-rules-and-scoring-law.md
docs/71-scoring-budget-and-image-security.md
docs/72-score-budget-schema-and-defaults.md
```

## 1. Creator Philosophy

The editor should be permissive in theme, but strict in structure.

Allowed freedom:

```text
theme
names
categories
colors
emoji/fallback labels
safe role templates
score within budget
local-only images later
```

Restricted freedom:

```text
arbitrary role code
count-only normal win roles
image-dependent rules
remote image references
unbounded score
unbounded wildcard use
unsupported player counts
```

## 2. Simple Creator Mode

Simple mode is the default.

Simple mode should only allow safe templates:

```text
3 same-category groups
3 different category groups
specific 3-tile set + 2 category groups
3 same-tile groups
simple special bonus
capped duplicate ScoreBonus
```

Simple mode should not expose raw JSON fields.

## 3. Advanced Creator Mode

Advanced mode may expose more settings, but still cannot bypass safety rules.

Advanced mode can edit:

```text
basePoints
scoreBudget
role priority
wildcard allowed or not
special bonus caps
category/tag conditions
```

Advanced mode still cannot create:

```text
custom JavaScript
remote image rules
normal count-only win_role
negative score
multiplier score
paid strength changes
```

## 4. Disabled Creation Paths

The editor should hide or disable dangerous actions.

Disabled by default:

```text
create normal win_role without requiredGroups
create win_role from ScoreBonus
create special_bonus with canRon/canTsumo
use wildcard category as normal group category
set basePoints to 0 or negative
set hardResultCap below softResultCap
add imageUrl/base64/path to shared deck
```

## 5. Guarded Creation Paths

Some actions are allowed only after warning.

```text
very high basePoints
too many roles
too many bonuses
too many wildcards
role similar to existing role
category with too few tiles
long display name
advanced scoreBudget edit
```

The UI should show:

```text
why this is risky
what safer value is recommended
how to fix it
```

## 6. Safe Role Templates

### Template: 3 same-category groups

```text
Needs: category A x 3 groups
Suggested points: 50-80
Good for beginner decks
```

### Template: 3 different category groups

```text
Needs: category A group + category B group + category C group
Suggested points: 80-110
Good for variety
```

### Template: specific set + category groups

```text
Needs: specific 3-tile set + 2 category groups
Suggested points: 100-140
Good for named/theme roles
```

### Template: 3 same-tile groups

```text
Needs: three duplicate groups
Suggested points: 120-160
Harder and clearer
```

## 7. Tips System

Tips should be short, contextual, and non-annoying.

Examples:

```text
役は3枚グループを3組で考えると分かりやすいです。
最初はカテゴリ3組の役を1つ作るのがおすすめです。
点数は強さではなく、そろえにくさのごほうびです。
ボーナスだけではあがれません。
オールマイティを増やしすぎると役の違いが薄くなります。
画像は共有JSONには入りません。端末内だけで使います。
```

## 8. Tip Trigger Rules

Show tips when:

```text
user creates first win role
user creates first special bonus
user sets high points
user adds wildcard
user creates similar role
user tries to import deck with image field
user has no playable win role
```

Do not show the same tip repeatedly in one editing session.

## 9. Live Validation Panel

The editor should always show deck status:

```text
Playable
Needs fixes
Playable with warnings
```

Group issues as:

```text
Must fix
Balance
Clarity
Security
```

## 10. Creation Blocking Rules

Block saving as playable deck when:

```text
no winRoles
normal winRole has no requiredGroups
required category/tile missing
specificSet wrong size
scoreBudget invalid
image fields in shared JSON
unsupported evaluationMode
```

Allow draft saving even if invalid, but clearly mark:

```text
Draft cannot start match yet
```

## 11. Draft vs Playable Deck

Separate deck states:

```ts
type DeckAuthoringState = 'draft' | 'playable' | 'playableWithWarnings' | 'blocked';
```

Drafts can be incomplete.

Only playable/playableWithWarnings can start a match.

## 12. Preset Score Buttons

Instead of free number first, show presets:

```text
Easy 50
Normal 80
Hard 110
Rare 150
```

Advanced users may enter custom points.

Custom points outside budget show warning.

## 13. Wildcard Safety UI

When user adds wildcard:

```text
show total wildcard ratio
show roles affected by wildcard
warn if wildcard makes too many roles close
```

Do not allow wildcard to count for ScoreBonus by default.

## 14. Image Safety UI

When user adds local image later:

```text
show local-only label
show not included in export
reject remote URL
reject SVG
resize/sanitize image
fallback to emoji/text if missing
```

Tip:

```text
画像はあなたの端末だけに保存されます。共有JSONには入りません。
```

## 15. Import Protection

When importing deck:

```text
parse first
reject unsafe image fields
validate rules
show status summary
allow import only if no errors
```

Do not auto-fix dangerous imported decks silently.

## 16. Test Requirements

```text
simple mode cannot create count-only normal win_role
simple mode cannot create special_bonus with canRon
advanced mode cannot create negative score
draft with no winRole saves but cannot start match
playable deck can start match
imageUrl import is rejected
high score shows warning
similar role shows warning
wildcard ratio warning appears
safe tips trigger once per session
```

## Final Decision

Soro-pon should prevent broken deck creation at the UI level whenever possible.

Validation remains the final guard, but safe templates and contextual tips should keep most users away from broken states.
