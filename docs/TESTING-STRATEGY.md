# Testing Strategy

## Purpose

Soro-pon combines a custom-deck rules engine with a multi-skin UI. Tests must prove both rule correctness and presentation-contract stability.

## Test Layers

```text
pure unit tests: schemas, validation, engine, storage, skin pure functions
integration tests: import -> validation -> engine, skin package -> resolution
DOM/component tests: interaction, accessibility, skin switching, recovery
browser flow tests: playable/editor/import/reset flows
visual regression: official skins and required viewports
manual QA: human comprehension, touch, visual quality
```

Do not use browser tests to replace pure engine tests.

## Core Rule Test Groups

### Schema / Import

```text
animal starter strict parse
unknown top-level/nested fields rejected
unsafe image/path/url/html/style/script/code/function fields rejected
prototype pollution keys rejected
scoreBudget and normalThreeGroups contracts enforced
old safe schema migration accepted with notice
unsafe old payload rejected or blocked
```

### Deck Validation

```text
valid minimal and animal starter
no win role
bonus only
impossible role
wildcard heavy
duplicate IDs/roles
candidate explosion
category too small
score explosion
large valid deck
specificSet repeated/unknown/unavailable tile demand
```

### Group / Role Analysis

```text
sameTile / sameCategory / sameTag / specificSet
wildcard-assisted groups
one group max one wildcard
9 tiles partition into 3 groups
no tileInstanceId reuse
completed/tenpai/near/blocked explanation
bonusOnly cannot win
candidate ranking deterministic
hand order invariant
caps return warnings
```

### Ron / Tsumo / Scoring

```text
tsumo uses 9-tile hand
ron uses 8 hand + discard
bonus-only and ScoreBonus-only cannot win
discarded wildcard ron rule
multiple ron seat-order rule
one selectedWinRole provides basePoints
bonuses apply only after selectedWinRole
ResultBreakdown reconstructs total
no hidden score modifier
```

### Insight / Preview

```text
preview does not mutate state
9-tile shape vs resulting 8-tile wait
keeps/breaks candidate facts
wildcard explanation
no best/correct/should advice wording
beginner/normal/advanced output limits
```

### Match Reducer / CPU

```text
setup -> deal -> turn path
draw gives 9 tiles
invalid actions preserve state
double dispatch is safe
ron/tsumo/pass windows
empty draw pile result
seeded deterministic replay
CPU deterministic tie break
```

### Storage / Migration / Progress

```text
all localStorage payloads schema-parse on read
corrupt data recovers
old records normalize optional fields
record/coin/achievement duplicate immediate write is prevented
export excludes local/private data
missing local images fall back
```

Before restore/replay/resend, add persistent matchSessionId and recent processed-ID tests. The current last-key defense is not the final idempotency contract.

## Skin Pure-function Tests

Required:

```text
registry and manifest strict parse
contract version compatibility
unknown skin ID fallback
inheritance and missing parent fallback
inheritance cycle/depth handling
safe file names
asset URL construction
token parser rejects forbidden syntax
approved font policy
all official package files parse and resolve
```

## Skin Hardening Tests

After H1/H2 add:

```text
unknown token ID rejected
external structural token override rejected
per-token type/range checked
status=final with null file rejected
trust-level file type checked
file existence checked
actual file bytes checked
skin total bytes checked
image dimensions checked
intrinsic size checked
slice inside source image
safe area valid
minimum render size valid
slot-specific render mode valid
candidate/final directory rule valid
contract and package geometry fully aligned
```

## Contrast Tests

Official skins must test:

```text
text on primary CTA
text on common surfaces
focus ring on light and dark surfaces
warning/info/success text
category foreground selection for representative light/dark colors
```

Automated contrast checks do not replace visual review.

## DOM / Component Tests

Use a browser-like environment selected through ADR.

Minimum:

```text
Button default/disabled/loading semantics
Tile selected/emphasis ARIA state
Modal initial focus, trap, Escape, return focus, labeling
Tabs roving tabindex and keyboard navigation
SkinSelector loading/failure/default/select behavior
skin switch preserves current screen and draft state
skin switch preserves selected tile/match state
ErrorBoundary/ErrorState recovery
local-data reset confirmation and scope
```

## Browser Flow Tests

Minimum:

```text
fresh boot and official starter
import valid/invalid JSON
create/edit/save deck
3-player and 4-player match start
round result and record
collection/achievement persistence
skin switch from user path
unknown/corrupt skin recovery
reset local data and reboot
```

## Visual Regression

Use Playwright or the approved equivalent after ADR.

Required matrix:

```text
all screens at 844x390
TOP / Deck Editor / Match / Result / Collection at:
  844x390
  852x393
  932x430
  1024x600
  1366x768
Component Gallery in yorunoshirube and cute-pop
```

Include states:

```text
short and long Japanese
long English
large score
emoji/fallback tile
disabled/focused/selected/warning/error
Modal and Tabs
nine-slice minimum and expanded sizes
```

Control dynamic content, timestamps, fonts, and motion before recording baselines.

## Manual QA

Manual QA verifies:

```text
the game is understandable
both skins feel intentional
contrast is comfortable
hit areas match visuals
no mixed-skin flash
no layout shift during switching
real touch/browser behavior
```

Use `docs/MANUAL-QA.md` and save the report with commit/browser/device/viewport/screenshots.

## CI Mapping

```text
pnpm typecheck
pnpm test
pnpm build
pnpm skin:validate     # after H2
component test command # after H8 ADR
Playwright command     # after H9 ADR
```

Local success and CI success must be reported separately.

## Final Decision

Rules, persistence, skin safety, interactions, and appearance all require their own proof. A large passing pure-function test count does not prove UI or visual stability.
