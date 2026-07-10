# Threat Model

## Purpose

Soro-pon is local-first, but custom deck imports, local persistence, future images, and installed/paid skins create trust boundaries.

## Trust Boundaries

Trusted:

```text
reviewed application source
reviewed official sample decks
reviewed bundled official assets
reviewed bundled official skin packages
```

Untrusted:

```text
imported deck JSON
user-created text and IDs
future user images
localStorage payloads
clipboard/files
old migrated data
future downloaded/paid skin packages
```

A paid skin is still untrusted data. Payment or marketplace approval must not grant code execution.

## Assets To Protect

```text
application integrity
game-rule integrity
user privacy
local data stability
browser responsiveness
accessible hit areas and focus behavior
skin/package ownership trust
```

## Deck / Import Threats

### Giant or Deep JSON DoS

Mitigation:

```text
byte check before deep validation
warn/reject limits
maximum nesting depth
strict array limits
expensive validation only after safety gates
```

### Prototype Pollution

Mitigation:

```text
reject __proto__/constructor/prototype anywhere
safe iteration
no unsafe merge of imported payloads
```

### Remote Tracking / URL Loading

Mitigation:

```text
no URL fields in shared deck JSON
no remote user-deck image loading
reject imageUrl/src/href/filePath/blobUrl/base64 image fields
```

### Script / HTML / Rule Plugin Injection

Mitigation:

```text
React text rendering only
no dangerouslySetInnerHTML for imported content
reject html/style/script/code/function/eval/plugin/formula fields
data-only rule grammar
```

### Unicode / Duplicate ID Confusion

Mitigation:

```text
safe ASCII ID contract
separate normalized display names
duplicate IDs reject
confusable display names warn where useful
```

### Hidden Progress / Pay-to-win Payload

Mitigation:

```text
shared deck JSON forbids coins/progress/collection/saveData/settings
imported decks cannot alter achievements or strength
```

### Expensive But Valid Deck

Mitigation:

```text
ENGINE_LIMITS
candidate/wildcard/partition caps
warnings when capped
adversarial fixtures
```

## Storage Threats

### Corrupt Local Data Boot Loop

Mitigation:

```text
schema parse on every read
safe fallback
AppErrorBoundary and recoverable ErrorState
visible reset path
reset scopes and confirmation
```

### Storage Exhaustion

Mitigation:

```text
images use IndexedDB later
resize/sanitize
quota errors handled
orphan cleanup
shared exports exclude images
```

### Duplicate Match Recording

Current protection prevents immediate duplicate result writes.

Before restore/replay/resend:

```text
persistent matchSessionId
recent processed-ID set
backward-compatible migration
A -> B -> duplicate A test
```

Do not rely permanently on only the last match key or an in-memory/time-derived seed.

## Skin Package Threats

### Arbitrary CSS Token Override

Risk:

A syntactically safe `--sp-*` token could change touch size, font size, z-index, spacing, layout, or motion.

Mitigation:

```text
explicit typed skin-token allowlist
structural tokens cannot be overridden
per-token type/range validation
unknown tokens reject
skin layer cannot control display/position/size/pointer-events/z-index
```

### Arbitrary CSS / JavaScript / HTML

Mitigation:

```text
skin is data only
no selectors or arbitrary stylesheet execution
no JS/HTML/script/plugin payload
validated token declarations only
```

### External URL / Font Tracking

Mitigation:

```text
package-local file names only
no url() / @import / external font
no remote asset URL
approved bundled font presets only
```

### External SVG Active Content

Policy:

```text
reviewed official SVG may be allowed
external/paid skin defaults to PNG/WebP only
```

Do not accept arbitrary external SVG without a proven sanitization pipeline and tests.

### Path Traversal / Unexpected File Types

Mitigation:

```text
safe skin ID and filename patterns
no slash/backslash/colon/parent traversal/hidden file
trust-level file extension allowlist
resolved asset path remains inside package
```

### Oversized Skin / Image Decode DoS

Mitigation:

```text
manifest/tokens byte limits
per-asset byte limit
total package byte limit
maximum image dimensions
actual file/dimension validation in pnpm skin:validate
preload only controlled required assets
```

### Invalid Nine-slice / Geometry

Risk:

Bad slice or safe-area values can hide content, create unusable controls, or trigger layout defects.

Mitigation:

```text
slice inside source image
safe area consistency
minimum render size
slot-specific render-mode allowlist
source slice separate from rendered border width
real proof assets and visual regression
```

### Opacity / Blend Hides Content

Mitigation:

```text
skin image/overlay layers separated from content/focus layers
pointer-events none on skin layers
opacity/blend never applied to the interactive content container
```

### Mixed-skin Flash / Partial Load

Mitigation before distribution:

```text
versioned/content-hashed URLs
preload required visible assets
atomic application
keep previous skin on failure
actionable failure state
```

### Package Replacement / Ownership Confusion

Mitigation before sales:

```text
stable package ID and contract version
content hash/signature strategy
source/author metadata
upgrade/rollback/uninstall policy
entitlement separated from execution
```

### Skin Access To Application Data

Mitigation:

```text
skin package contains tokens/assets only
no engine/schema/storage/records/network API
no executable hooks
no payment or entitlement logic inside skin data
```

## Accessibility Threats From Skins

Risks:

```text
low contrast
invisible focus
color-only selected/warning state
visual shape smaller than actual hit area
excessive motion
```

Mitigation:

```text
semantic foreground/focus tokens
contrast checks for official skins
fixed focus/state contract
fixed minimum hit areas
reduced-motion behavior controlled by app
component and visual tests
```

## Required Security Tests

Deck boundary:

```text
giant/deep JSON rejected
prototype pollution rejected
url/image/path fields rejected
script/html/style/code fields rejected
unknown fields rejected
```

Skin boundary:

```text
unknown token rejected
structural token override rejected
forbidden token syntax rejected
external SVG rejected by default
remote URL/font rejected
path traversal rejected
oversized/missing/wrong-dimension file rejected
invalid slice/safe area rejected
status/path mismatch rejected
inheritance cycle/depth handled
failed switch keeps usable skin
```

## Out Of Scope Until Designed

```text
server account security
online multiplayer cheating
payment processing security
public marketplace moderation
cloud sync conflicts
```

Marketplace/paid-skin security is not automatically solved by the local skin contract; it requires a separate distribution and entitlement design.

## Final Decision

Decks and skins are untrusted data. Neither may execute code, fetch remote resources, alter rules, shrink accessibility contracts, or gain application privileges.
