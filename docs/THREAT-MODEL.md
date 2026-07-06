# Threat Model

## Purpose

Soro-pon is local-first, but custom deck import and future local images still create risk.

This document defines what the MVP protects against.

## Trust Boundaries

Trusted:

```text
app source code
official sample decks in repository
app-owned assets
```

Untrusted:

```text
imported JSON
user-created deck text
future user images
localStorage payloads
clipboard/imported files
old migrated data
```

## Primary Assets To Protect

```text
app integrity
user privacy
local data stability
browser performance
clear user trust around imported decks
```

## Attack Surface

```text
JSON import
localStorage restore
future image upload
deck export/import loop
role/condition data
large/deep custom decks
text fields displayed in UI
```

## Threats and Mitigations

### T1: Giant JSON Denial Of Service

Risk:

```text
Huge imported file freezes browser.
```

Mitigation:

```text
file size check before parse
warn at 256KB
reject at 512KB for MVP
```

### T2: Deep JSON Denial Of Service

Risk:

```text
Deeply nested JSON causes recursive scan or parse issues.
```

Mitigation:

```text
unsafe scan should have max depth
reject excessive nesting
strict schema limits arrays
```

### T3: Prototype Pollution

Risk:

```text
Imported JSON includes __proto__, constructor, or prototype keys.
```

Mitigation:

```text
unsafe key scan rejects prototype pollution keys anywhere
use safe object iteration
avoid object merge of untrusted payloads
```

### T4: Remote Tracking Through Images/URLs

Risk:

```text
Imported deck references remote image URL and tracks users.
```

Mitigation:

```text
no URL fields in shared JSON
no remote image loading
no imageUrl/src/href fields
```

### T5: Script/HTML Injection

Risk:

```text
Imported text contains HTML/script or UI renders unsafely.
```

Mitigation:

```text
React text rendering only
no dangerouslySetInnerHTML for deck content
reject html/script/code/style keys
```

### T6: Local File Path Leakage

Risk:

```text
Deck export includes local file paths or blob URLs.
```

Mitigation:

```text
shared export excludes local image data
filePath/blobUrl rejected
object URLs never persisted
```

### T7: Unicode Confusable IDs

Risk:

```text
Tile/category IDs look identical but differ, causing spoofing or confusion.
```

Mitigation:

```text
restrict IDs to safe ASCII pattern
normalize display names separately
validate duplicate/confusable display names as warning
```

### T8: Duplicate IDs

Risk:

```text
Imported deck defines duplicate tile/category/role IDs.
```

Mitigation:

```text
validation rejects duplicate IDs
fixtures cover duplicates
```

### T9: Hidden Pay-to-win Or Progression Payload

Risk:

```text
Imported JSON carries coins/progress/unlock/saveData.
```

Mitigation:

```text
shared JSON forbids coins/progress/collection/saveData/settings
```

### T10: Rule Plugin Injection

Risk:

```text
Deck includes script/function/formula/plugin fields for custom rules.
```

Mitigation:

```text
data-only rule grammar
reject script/function/code/eval/plugin/formula-like fields
```

### T11: Browser Storage Exhaustion

Risk:

```text
Future images fill storage.
```

Mitigation:

```text
local images use IndexedDB later
resize/sanitize images
quota errors handled
orphan cleanup
shared JSON excludes images
```

### T12: Corrupt Local Data Boot Loop

Risk:

```text
Bad localStorage payload crashes app every boot.
```

Mitigation:

```text
schema parse on read
safe fallback
recoverable error UI
reset local data option
```

### T13: Maliciously Expensive Deck

Risk:

```text
Deck is valid but designed to explode candidate analysis.
```

Mitigation:

```text
ENGINE_LIMITS
candidate/wildcard/partition caps
warnings when capped
adversarial fixtures
```

### T14: Export Includes Private Local Data

Risk:

```text
Export accidentally includes local images, settings, or progress.
```

Mitigation:

```text
export uses explicit allowlist
recursive unsafe key scan on output in tests
```

## Out Of Scope For MVP

```text
server-side account security
online multiplayer cheating
payment security
public deck marketplace moderation
cloud sync conflict resolution
```

These are not ignored; they are not part of MVP.

## Security Tests

Required:

```text
giant JSON rejected
deep JSON rejected
__proto__/constructor/prototype rejected
url/src/href rejected
image fields rejected
script/html/style/code rejected
filePath/blobUrl rejected
coins/progress/saveData rejected
export output has no unsafe keys
```

## Final Decision

Imported decks are creative content, not trusted code.
