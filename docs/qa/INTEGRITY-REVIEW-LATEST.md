# Latest Integrity Review State

Date: 2026-07-27
Authority: historical compact status; current authority is the Batch 12 report
RC: **LIMITED READY**  
Batch 11: **COMPLETE**; Batch 12: **CONDITIONAL**

Batch 12 frozen SHA `555c02d` passed 101/101 integrity tests across 28 files.
See `BATCH-12-REAL-SAFARI-DEVICE-ACCESSIBILITY-REPORT.md`. Counts below remain
historical.

This file supersedes aggregate counts and CI-synchronization notes in:

```text
docs/qa/INTEGRITY-REVIEW-CURRENT.md
```

Detailed findings remain in:

```text
docs/qa/POST-BATCH-10-INTEGRITY-REVIEW.md
docs/qa/POST-BATCH-10-INTEGRITY-CONTINUATION.md
```

## Current Aggregate

```text
initial review cases added:       12
continuation cases added:         28
cumulative integrity cases:       40
integrity test files:               9
```

These are committed definitions. No PASS is claimed until execution on the
frozen exact current SHA.

## Complete Integrity Test Set

```text
src/storage/storageRecoveryFailurePaths.test.ts
src/storage/localStorageRecordsAtomicity.test.ts
src/storage/localStorageCapacity.test.ts
src/storage/localStorageDuplicateDeckRecovery.test.ts
src/storage/storageWriteContract.test.ts
src/storage/resetLocalData.test.ts
src/app/runtimeIds.test.ts
src/app/AppRoot.persistence.test.tsx
src/engine/validation/validateDeckEntityIds.test.ts
```

## CI State

Two workflows now exist:

```text
.github/workflows/ci.yml
  frozen install
  original critical integrity set
  typecheck
  full unit suite
  skin validation
  production build

.github/workflows/integrity.yml
  frozen install
  all 9 integrity files / all 40 added cases
```

The separate `Integrity Contracts` workflow closes the latest test-file
coverage gap without weakening or replacing the existing full CI workflow.
Both use read-only repository permissions, same-ref cancellation, frozen
install, Node 24, and timeouts.

A committed workflow is still not a green run. GitHub Actions status must be
observed for the exact final SHA or explicitly reported unavailable.

## Latest Persistence Extension

### Duplicate outer deck IDs

`storedDecksPayloadSchema` now rejects duplicate `deck.id` entries. Read
recovery preserves the payload instead of resetting all decks:

```text
backup raw payload when possible
deduplicate one entry per deck ID
strict-parse normalized payload
write back when possible
```

Deterministic selection:

```text
official source first
then newest updatedAtMs
then original array order
```

Codes:

```text
L9008 duplicate persisted deck IDs normalized
L9007 used when count overflow and duplicate normalization coexist
```

Tests prove:

```text
official source wins against newer created duplicates
newest same-source entry wins
equal source/time keeps original order
independent deck IDs remain
raw payload is retained
rewritten payload passes strict schema
```

## Stable Integrity Contract

```text
storage read denial:
  display uses L9005 session fallback
  save/remove/export/record/achievement/settings mutation fails closed

write boundary:
  strict schema parse immediately before setItem
  deck entity IDs checked again at final Store boundary

match result:
  record + coins + role collection + match achievements in one write

limits:
  decks 200
  records 100
  role collection 500
  achievements 100
  recent match keys 20
  legacy overflow -> raw backup + L9007 bounded normalization

identity:
  persisted deck IDs unique
  category/tile/variant IDs unique in their namespaces
  role IDs unique across variants
  special/score bonus IDs unique in a shared bonus namespace

import/editor:
  visible legacy migration review
  same-ID overwrite review bound to input and current StoredDeck fingerprint
  external change invalidates review
  stale Editor draft is rejected and unmounted

reset:
  all active, forensic, and skin keys
  partial failure shown; no false success/reload
```

## Exact-SHA Verification

```bash
pnpm install --frozen-lockfile
pnpm exec vitest run \
  src/storage/storageRecoveryFailurePaths.test.ts \
  src/storage/localStorageRecordsAtomicity.test.ts \
  src/storage/localStorageCapacity.test.ts \
  src/storage/localStorageDuplicateDeckRecovery.test.ts \
  src/storage/storageWriteContract.test.ts \
  src/storage/resetLocalData.test.ts \
  src/app/runtimeIds.test.ts \
  src/app/AppRoot.persistence.test.tsx \
  src/engine/validation/validateDeckEntityIds.test.ts
pnpm typecheck
pnpm test
pnpm skin:validate
pnpm build
```

Required evidence:

```text
clean HEAD == origin/main
exact SHA/tool versions
40/40 review-added cases collected and passing
full unit result
skin validation result
production artifact inventory/hash
GitHub CI + Integrity Contracts conclusions or explicit unavailability
Batch 11 executed on the same artifact
```

Any product/test change restarts the sequence.

## Open Risks

```text
true transactional multi-tab compare-and-swap
Editor live validation-panel integration for cross-variant ID errors
safe user-facing forensic backup restore
physical mobile devices
Safari + VoiceOver
NVDA / JAWS
real deploy and deployed-artifact rollback
Batch 11 production Firefox/WebKit
```

## Decision

The repository is materially more robust, but exact-SHA and Batch 11
evidence remains incomplete. Do not resume feature or asset work before
that closure.
