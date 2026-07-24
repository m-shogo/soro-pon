# Current Integrity Review Status

Date: 2026-07-24  
Scope: post-Batch-10 integrity work  
Status: **FIXES AND TEST DEFINITIONS COMMITTED / EXACT-SHA EXECUTION PENDING**  
RC: **LIMITED READY**  
Batch 11: **NOT EXECUTED**

This file is the current compact status for the integrity reviews. It
supersedes only stale aggregate counts/status summaries in earlier entry
files; it does not replace the detailed findings in:

```text
docs/qa/POST-BATCH-10-INTEGRITY-REVIEW.md
docs/qa/POST-BATCH-10-INTEGRITY-CONTINUATION.md
```

## Current Aggregate

```text
initial review tests added:        12
continuation tests added:          28
cumulative integrity tests added:  40
```

The 40 cases are committed test definitions, not passing evidence. They
must be collected and pass on one frozen exact SHA before the review is
closed.

## Latest Additional Finding

### Duplicate persisted deck IDs

The outer deck storage schema previously bounded the number of entries but
allowed two or more entries with the same `deck.id`.

Risk:

```text
Deck List identity becomes ambiguous
save can replace multiple entries at once
delete can remove every duplicate entry
same-ID import/editor conflict checks can target the wrong entry
```

Current behavior:

```text
storedDecksPayloadSchema rejects duplicate persisted deck IDs
read recovery does not wipe the whole payload
raw payload is backed up when possible
one entry per deck ID is retained deterministically
normalized payload is strict-parsed before writeback
```

Selection priority:

```text
1. official source
2. newest updatedAtMs
3. original array order as stable tie-break
```

Issue code:

```text
L9008: duplicate persisted deck IDs were normalized with raw backup
```

When duplicate IDs and persisted-count overflow coexist, the combined
normalization is reported through `L9007` with duplicate details included.

Tests:

```text
src/storage/localStorageDuplicateDeckRecovery.test.ts
  official source beats a newer created entry
  newest same-source entry wins; equal timestamps keep original order
```

## Current Integrity Test Files

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

The default full Vitest suite collects all nine files. The named CI
`Critical integrity contracts` step currently lists the original eight
files; the duplicate-deck recovery file must be added before exact-SHA
closure or explicitly run alongside that step. Do not claim the named
step alone collected all 40 cases until that CI synchronization is
committed and observed.

## Required Exact-SHA Command

Until the CI named step is synchronized, run all nine files explicitly:

```bash
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

Then confirm:

```text
40 review-added tests collected / 40 PASS
all full-suite tests PASS
production artifact hash recorded
same SHA/artifact used for Batch 11
```

## Current Error-Code Extension

The stable storage code set is now:

```text
L9001 corrupt/invalid payload recovered or normalized
L9002 known old deck migrated without entry loss
L9003 unrecoverable deck entries dropped during partial salvage
L9004 local image missing; visual fallback
L9005 storage read denied; session fallback and fail-closed mutation
L9006 bootstrap/default write failed
L9007 legacy persisted collection exceeded safe bound and was normalized
L9008 duplicate persisted deck IDs were normalized deterministically
```

`L9008` must be added to the next update of `docs/ERROR-CODES.md` and
`docs/release/STORAGE-RECOVERY-POLICY.md`. Until then, this current-status
file is the authoritative extension and the omission must not be hidden.

## Remaining Open Work

```text
synchronize CI named integrity step to all nine files
synchronize aggregate 40-case count and L9008 across entry contracts
freeze clean exact SHA
run frozen install + nine-file integrity suite
run typecheck/full unit/skin validation/build
observe or explicitly mark GitHub CI unavailable
execute Batch 11 on the same artifact
```

Separate residual product/evidence risks remain:

```text
true transactional multi-tab compare-and-swap
Editor live validation-panel integration for cross-variant ID errors
safe user-facing forensic backup restore
physical devices / Safari+VoiceOver / NVDA / JAWS
real deploy and deployed-artifact rollback
```

## Decision

Do not resume feature or asset work yet. The implementation is materially
safer, but current evidence is incomplete and the latest duplicate-ID tests
must be included in the exact-SHA integrity run.
