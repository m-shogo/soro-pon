# Scoring Budget and Image Security

## Purpose

This document strengthens two areas:

1. scoring should be controlled by a budget/cap model, not only free numeric input
2. images must be handled safely because custom decks may use local images later

Related docs:

```text
docs/70-deck-rules-and-scoring-law.md
docs/68-custom-deck-robustness-guardrails.md
docs/69-adversarial-custom-deck-patterns.md
```

## Part A: Scoring Budget Model

## 1. Why Budget Scoring

Free score input is flexible but dangerous.

Problems:

```text
one easy role gets 999 points
bonus stacking explodes
role difficulty does not match reward
custom decks become unreadable
result screen loses trust
```

Budget scoring keeps freedom while protecting balance.

## 2. Deck Score Budget

Each variant should have a score budget profile.

```ts
type ScoreBudgetProfile = {
  expectedBaseMin: number;
  expectedBaseMax: number;
  expectedResultMin: number;
  expectedResultMax: number;
  softResultCap: number;
  hardResultCap: number;
  maxSpecialBonusTotal: number;
  maxScoreBonusTotal: number;
};
```

MVP normal default:

```text
expectedBaseMin: 30
expectedBaseMax: 130
expectedResultMin: 40
expectedResultMax: 220
softResultCap: 300
hardResultCap: 500
maxSpecialBonusTotal: 80
maxScoreBonusTotal: 60
```

## 3. Role Point Allocation

Deck editor may offer two modes.

```text
simple mode: choose difficulty; points are suggested
advanced mode: manually edit points with warnings
```

Simple mode suggested basePoints:

| Difficulty | Suggested | Allowed Comfort Range |
|---|---:|---:|
| easy | 50 | 30-70 |
| normal | 80 | 60-100 |
| hard | 110 | 90-140 |
| rare | 150 | 120-180 |

Manual points outside comfort range are allowed only with warnings, not silently accepted.

## 4. Point Budget Distribution

For a normal deck, score budget should be distributed roughly as:

```text
selected win role: 60-75% of total result feeling
special bonuses: 15-25%
ScoreBonus: 5-15%
```

This means the win role remains the main reason for the result.

Bonuses should feel rewarding, not become the real win condition.

## 5. Bonus Stack Cap

Even if many bonuses match, result should stay explainable.

MVP default:

```text
max applied special bonuses shown normally: 3
max applied score bonuses shown normally: 3
bonuses beyond display go into expandable details
bonus total above budget triggers warning
```

Scoring can still include all valid bonuses only if caps allow it.

Recommended safer MVP:

```text
special bonus total capped by maxSpecialBonusTotal
ScoreBonus total capped by maxScoreBonusTotal
```

## 6. Role Difficulty Estimator

Validation should estimate difficulty from structure.

Signals:

```text
number of requiredGroups
category breadth
specificSet count
tile copy availability
wildcard allowed
natural feasibility
```

Rough rules:

```text
easy: broad sameCategory groups with many tile instances
normal: mixed sameCategory groups
hard: one specificSet plus category groups
rare: multiple specific/narrow groups or low availability
```

Use estimator for warnings only.

Do not use it to change actual score silently.

## 7. Score Warning Examples

```text
This easy role has very high points. Consider 30-70.
This rare role may feel unrewarding at 20 points.
Bonuses can exceed the expected result range.
This deck can often exceed the soft cap of 300.
ScoreBonus should have maxPoints if repeatable.
```

## 8. Score Hard Rules

Hard validation:

```text
basePoints must be > 0
points must not be negative
hardResultCap must be >= softResultCap
ScoreBonus maxPoints cannot be lower than points
coin rewards cannot modify match score
```

MVP forbidden:

```text
multipliers
percentage bonuses
random score bonuses
player-level score boosts
paid score boosts
```

## Part B: Image Security

## 9. Image Security Principle

Shared deck JSON must never contain images or image references.

Allowed:

```text
local image chosen by user
stored only on the user's device
mapped to tileId locally
not exported in shared JSON
```

Forbidden in shared JSON:

```text
image
imageUrl
imageBase64
remoteImage
remoteImageUrl
localImageId
blobUrl
filePath
assetUrl
externalAssetUrl
```

## 10. Local Image Boundary

If local images are supported later, they must live outside shared deck data.

Use local-only mapping:

```ts
type LocalImageMap = {
  deckId: string;
  tileId: string;
  localImageKey: string;
  createdAt: string;
};
```

This mapping is localStorage/IndexedDB only.

It is not included in import/export JSON.

## 11. Image Input Validation

When selecting local image files:

```text
accept only image/png, image/jpeg, image/webp
reject svg by default
reject gif by default
reject html/xml files
reject files above size limit
strip filename from UI when possible
```

MVP recommended limit:

```text
single image max: 2MB
stored resized image max: 512x512
thumbnail max: 128x128
```

## 12. SVG Policy

Do not accept user SVG images in MVP.

Reason:

```text
SVG can contain script-like or external-reference behavior depending handling
```

Only app-owned trusted SVG assets are allowed.

## 13. EXIF and Metadata

User images may contain metadata.

If image processing is implemented:

```text
render to canvas
export sanitized PNG/WebP
store sanitized output
never preserve original metadata intentionally
```

Do not upload images in MVP.

## 14. Object URL Safety

If using object URLs:

```text
createObjectURL only for validated local File
revokeObjectURL after use
never store blobUrl in deck JSON
never import blobUrl from JSON
```

## 15. Remote Image Ban

Do not load remote images from user decks.

Reasons:

```text
tracking risk
broken content risk
mixed-content risk
copyright/IP risk
privacy risk
```

If future online sharing adds images, it must use a separate trusted upload pipeline, not deck JSON URLs.

## 16. File Path Ban

Never accept file paths from JSON.

Examples forbidden:

```text
/Users/name/image.png
C:\Users\name\image.png
file:///...
```

Reasons:

```text
privacy leak
non-portable
security footgun
```

## 17. Image Rendering Safety

Image rendering rules:

```text
use img src only from trusted app assets or sanitized local object URLs
never set innerHTML from image metadata
never render imported text as HTML
use alt/fallback text from sanitized tile name
```

## 18. Deletion and Recovery

If a deck is deleted:

```text
local image mappings for that deck should be deleted
orphaned image cleanup should be possible
```

If image data is missing:

```text
fallback to text/emoji tile rendering
match must still be playable
```

## 19. Export Safety

Before export:

```text
run forbidden image field scan recursively
exclude local image maps
export only deck rules, names, categories, colors, fallback labels
```

Export preview should say:

```text
Images are local-only and will not be included.
```

## 20. Image Security Tests

Required tests:

```text
JSON with imageUrl fails
JSON with nested imageBase64 fails
JSON with filePath fails
JSON with blobUrl fails
export excludes local image mappings
missing local image falls back to text tile
SVG user upload rejected
large image rejected
remote image URL rejected
object URL not persisted
```

## Final Decision

Scoring uses a budget model to protect balance.

Images are local-only and never part of shared deck JSON.

If there is a conflict between convenience and safety, safety wins.
