# Strict Import Contract and Edit Boundary

## Purpose

Import is a high-risk boundary.

A shared deck JSON should contain only portable deck rules and safe display metadata.

It must not import local state, images, remote URLs, UI settings, scripts, hidden options, debug data, or future unsafe fields.

This document defines the strict import contract and what users may edit after import.

Related docs:

```text
docs/71-scoring-budget-and-image-security.md
docs/72-score-budget-schema-and-defaults.md
docs/73-safe-deck-creator-rules-and-tips.md
```

## 1. Import Principle

Import is allowlist-based, not blocklist-based.

Allowed fields are explicitly defined by schema.

Unknown fields are rejected for current official import.

Do not silently preserve unknown fields.

## 2. Allowed Top-level Fields

Current shared deck JSON may contain only:

```text
version
id
name
description
categories
tiles
activeVariantId
variants
```

Forbidden top-level fields include:

```text
images
assets
localImages
remoteImages
settings
uiSettings
userSettings
saveData
progress
coins
collection
history
debug
scripts
plugins
permissions
```

## 3. Allowed Category Fields

```text
id
name
color
priority
icon
```

Forbidden:

```text
image
imageUrl
html
style
className
script
remoteIconUrl
```

## 4. Allowed Tile Fields

```text
id
name
categories
primaryCategoryId
emoji
fallbackLabel
count
wildcard
```

Forbidden:

```text
image
imageUrl
imageBase64
filePath
blobUrl
remoteImageUrl
html
style
css
script
assetPath
```

## 5. Allowed Wildcard Fields

```text
kind
maxUsePerRole
canCompleteWinRole
canCompleteSpecialBonus
canTriggerRonWhenDiscarded
countsForScoreBonus
```

Unknown wildcard behavior is rejected.

## 6. Allowed Variant Fields

```text
id
name
label
isExperimental
ruleConfig
scoreBudget
winRoles
specialBonuses
scoreBonuses
engineStatus
```

`engineStatus` may only be:

```text
pending
```

and only for unsupported experimental variants.

## 7. Allowed RuleConfig Fields

Normal mode:

```text
id
name
evaluationMode
supportedPlayerCounts
handSizeNormal
handSizeAfterDraw
winHandSize
groupSize
groupCount
allowRon
allowPon
allowReach
allowScoreBonus
allowWildcard
allowKan
allowChi
```

Extended mode may additionally allow:

```text
roleSpanMin
roleSpanMax
```

Forbidden:

```text
minPlayers
maxPlayers
online
server
seedOverride
forceDraw
cheatMode
```

## 8. Allowed Role Fields

WinRole:

```text
id
name
kind
family
basePoints
requiredGroups
wholeHandCondition
allowWildcard
maxWildcards
priority
explanation
canTsumo
canRon
```

SpecialBonus:

```text
id
name
kind
points
condition
allowWildcard
maxWildcards
explanation
```

ScoreBonus:

```text
id
name
type
minCount
points
maxPoints
description
allowWildcard
condition
```

Forbidden role fields:

```text
script
function
code
eval
formula
multiplier
remoteRuleUrl
imageCondition
htmlDescription
```

## 9. Recursive Unsafe Field Scan

Before schema parse, run a recursive scan for unsafe keys.

Reject if any key matches:

```text
image
images
imageUrl
imageBase64
remoteImageUrl
localImageId
blobUrl
filePath
assetPath
html
innerHTML
style
css
script
scripts
code
eval
function
plugin
plugins
remoteRuleUrl
url
href
src
```

Exception:

```text
No exceptions for shared deck import in MVP.
```

If a future safe URL field is needed, it must be added by explicit schema migration and security review.

## 10. Import Flow

Strict import flow:

```text
1. file size check
2. JSON parse
3. recursive unsafe key scan
4. strict Zod parse
5. reference validation
6. rule feasibility validation
7. score budget validation
8. UX validation
9. summary preview
10. import as draft or playable deck
```

Do not add the deck to the user's list before validation finishes.

## 11. File Size Limits

MVP recommended limits:

```text
max JSON file size: 512KB
warning above: 256KB
max categories: 100
max tile definitions: 200
max variants: 4
max winRoles per variant: 100
max bonuses per variant: 100
```

Larger decks should be rejected or imported only after future performance work.

## 12. Imported Deck State

Imported deck starts as:

```text
draft if warnings/errors exist
playable if no errors
playableWithWarnings if warnings only and user accepts
```

Never import as trusted official deck.

Mark source:

```ts
type DeckSource = 'official' | 'created' | 'imported';
```

Imported decks should be editable, but only through safe editor controls.

## 13. Edit Boundary After Import

User may edit imported deck fields that are allowed in editor:

```text
name
description
category name/color/icon
tile name/categories/emoji/fallback/count
safe role templates
basePoints within budget with warnings
special bonus safe conditions
scoreBudget in advanced mode
```

User may not edit:

```text
raw unknown fields
hidden unsafe fields
script-like behavior
remote image URLs
local file paths from JSON
engineStatus except app-owned pending state
```

Unknown fields are not preserved, so they cannot be edited later.

## 14. Import Preview

Before committing import, show:

```text
deck name
variant count
normal playable status
winRole count
warning count
error count
image fields removed/rejected status
score budget status
```

If images are expected by user:

```text
Images are not included in shared deck JSON. You can add local images after import.
```

## 15. Auto-fix Policy

Auto-fix is dangerous.

Allowed auto-fix:

```text
trim whitespace in names
normalize empty optional description
apply scoreBudget default only during known older-schema migration
```

Forbidden auto-fix:

```text
remove unsafe fields and continue silently
convert imageUrl to local image
turn count-only winRole into group-backed role without user review
change score numbers silently
change wildcard behavior silently
```

## 16. Migration Policy

Known older schema can be migrated only if deterministic and explainable.

Migration must output:

```text
what changed
what could not migrate
whether deck is playable
```

If count-only normal win_role cannot be safely converted to group-backed role:

```text
import as draft with blocking error, or reject
```

Do not pretend old count-only role is safe normal MVP.

## 17. Security Tests

Required tests:

```text
unknown top-level field rejected
nested imageUrl rejected
nested filePath rejected
nested html rejected
nested script rejected
url key rejected
src key rejected
style key rejected
localImageId rejected
unknown role field rejected
unknown wildcard field rejected
old schema migration applies scoreBudget default only when safe
import does not preserve unknown fields
import with errors does not appear as playable
import preview shows warnings/errors before commit
```

## 18. Editor Tests After Import

Required tests:

```text
imported deck can be renamed
imported deck cannot expose unknown raw fields
imported deck cannot add remote image URL through editor
imported deck can add safe local image mapping later outside shared JSON
imported invalid draft cannot start match
imported playable deck can start match after validation
```

## Final Decision

Import must be strict, explicit, and safe.

Shared JSON is for rules and portable display metadata only.

Everything else is rejected, not preserved.
