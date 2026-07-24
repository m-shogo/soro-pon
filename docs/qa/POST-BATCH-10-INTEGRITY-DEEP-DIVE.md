# Post-Batch-10 Integrity Review — Deep Dive

Date: 2026-07-25  
Repository: `m-shogo/soro-pon`  
Parent reviews:

```text
docs/qa/POST-BATCH-10-INTEGRITY-REVIEW.md
docs/qa/POST-BATCH-10-INTEGRITY-CONTINUATION.md
```

Result: **ADDITIONAL PRODUCT / TEST / CI / CONTRACT FIXES COMMITTED**  
Verification: **EXACT-FINAL-SHA EXECUTION PENDING**  
RC status: **LIMITED READY**  
Batch 11: **CONTRACT DEFINED / NOT EXECUTED**

## Executive Verdict

The previous reviews closed major recovery and read-modify-write defects, but
this third pass found additional failure modes below the ordinary happy path:

```text
emergency recovery UI could still claim a failed reset succeeded
valid decks could be discarded because only wrapper metadata was damaged
one malformed match record could wipe otherwise valid progress
duplicate membership values could make validation count one tile twice
persisted duplicate deck IDs created ambiguous update/render behavior
stale detail screens could delete or overwrite another tab's newer deck
skin preload/unmount exceptions could leave loading stuck or apply stale UI
runtime skin trust checks were weaker than filesystem validation
unsafe import diagnostics were unbounded
important destructive-dialog copy was not programmatically associated
```

The defects below are fixed and regression tests are committed. This document
**does not claim** `pnpm typecheck`, `pnpm test`, `pnpm skin:validate`,
`pnpm build`, GitHub Actions, or Batch 11 passed for the final SHA.

## Findings

| ID | Severity | Finding | Risk | Disposition |
|---|---|---|---|---|
| IRD-01 | P1 | `AppErrorBoundary` emergency reset ignored failed removals and reloaded | Recovery screen could repeat the same failure while appearing successful | Fixed; reload only after full deletion |
| IRD-02 | P1 | Tile category/tag arrays allowed duplicates and feasibility summed the array | One physical tile could be counted multiple times, making an impossible role look possible | Fixed with set-based analysis + `V3013` |
| IRD-03 | P2 | Group requirements could contain fields unused by their `groupType` | Saved/imported rule text could imply a condition the engine silently ignored | Fixed with `R4011` |
| IRD-04 | P2 | `ScoreBonus.maxPoints` could be lower than one application of `points` | First award was silently reduced below the configured value | Fixed with `B6010` |
| IRD-05 | P1 | Persisted deck payload allowed duplicate deck IDs | React keys, validation maps, update/delete behavior, and exports became ambiguous | Strictly rejected; existing payload deterministically consolidated with `L9008` |
| IRD-06 | P1 | A valid current deck was sent through legacy migration when wrapper metadata alone was invalid | Bad `source`/`updatedAtMs` could drop the entire user-authored deck | Fixed; preserve deck body and normalize metadata |
| IRD-07 | P1 | Any malformed match record invalidated the whole records payload | One broken history row could erase coins, achievements, roles, and valid history | Fixed with version-scoped partial salvage |
| IRD-08 | P1 | Store mutation did not compare the entry observed by the screen with current storage | Old UI could delete/overwrite another tab's newer deck | Fingerprint guard added at Store boundary |
| IRD-09 | P2 | Deck deletion was a one-click irreversible action with no restore UI | Accidental permanent deletion | Danger confirmation added with export guidance |
| IRD-10 | P2 | Danger dialog initially focused the destructive confirmation | Opening dialog followed by Enter could immediately delete/reset | Danger dialogs now focus cancel |
| IRD-11 | P2 / a11y | Dialog message was not connected with `aria-describedby` | Screen-reader users might reach controls without the irreversible-action explanation | Fixed in shared Modal/Dialog |
| IRD-12 | P2 | `new Image()` or `image.src` synchronous failures could reject preload | Skin switch could produce an unhandled rejection or remain `loading` | Preload resolves `false`; provider returns to `ready` |
| IRD-13 | P2 | In-flight skin loads were not invalidated on Provider unmount | Old asynchronous response could mutate document styles after replacement/unmount | Request sequence invalidated on cleanup |
| IRD-14 | P2 | Inheritance depth check rejected a valid chain at exactly the documented limit | Legal three-level skin chain received a false error | Off-by-one fixed and boundary tested |
| IRD-15 | P2 | Runtime manifest validation accepted SVG for `external` origin while filesystem validation rejected it | Future installer reuse could have inconsistent trust enforcement | Runtime rejection added |
| IRD-16 | P2 | Skin registry accepted duplicate IDs and future contract versions | Ambiguous selection or unsupported registry could be treated as valid | Registry parse now fails closed |
| IRD-17 | P2 | Unsafe-key scanner generated an issue for every adversarial field | A size-bounded import could still create excessive diagnostic strings and UI work | 49 details + `I2011` truncation notice |
| IRD-18 | P2 | Records set-like arrays retained duplicates and `totalMatches` could be below stored history length | Capacity and idempotency windows shrank; match-count achievements undercounted | Ordered dedupe + lower-bound normalization |
| IRD-19 | P1 / CI | Current docs claimed `.github/workflows/integrity.yml` existed, but it did not | Release-critical tests had no actual dedicated workflow despite documentation | Workflow created and expanded to 23 files |
| IRD-20 | Open | Future external package `official` trust cannot safely come from manifest self-declaration | External package could attempt privilege escalation if installer trusted the string | Contract corrected; installer-owned trust binding still unimplemented |

## Storage Recovery Model After This Review

### Deck payload

```text
strict valid payload:
  use directly

invalid outer payload with valid current deck body:
  preserve deck
  normalize source / updatedAtMs
  backup original raw bytes when possible
  rewrite strict payload when possible

known legacy deck body:
  deterministic migration

unrecoverable deck body:
  drop only that entry

duplicate deck ID:
  official source first
  then newest updatedAtMs within the same source
  then original order
  backup and report L9008
```

### Records payload

```text
strict valid payload:
  normalize set-like arrays and totalMatches lower bound

current version with partial corruption:
  preserve valid match rows
  preserve safe coins, achievements, role collection, match keys
  filter malformed/over-limit entries
  backup original raw payload

unknown version:
  do not guess
  backup and reset
```

`records`, `roleCollection`, `achievements`, and `recentMatchKeys` retain their
existing documented caps. Numeric persistence fields now reject values above
`Number.MAX_SAFE_INTEGER`.

## Validation Model After This Review

```text
V3013
  duplicate tile category/tag
  duplicate supported player count

R4011
  groupType-incompatible fields that the engine would ignore

B6010
  ScoreBonus maxPoints below one application of points

I2011
  import remains rejected, but diagnostic generation was truncated
```

Category/tag feasibility is calculated with set semantics, matching engine
membership behavior. Duplicate values cannot inflate the available tile count.

## Skin Safety Model After This Review

```text
preload:
  constructor/src exceptions -> false, not rejected Promise
  failed transition -> previous skin or bundled fallback remains
  provider returns to ready

concurrency:
  later request wins
  unmount invalidates every in-flight request

registry:
  unique IDs required
  future contract version rejected
  unsafe integer versions rejected

inheritance:
  base + up to 3 non-base skins accepted
  a required 4th non-base level is rejected

external runtime policy:
  PNG/WebP accepted
  SVG rejected
```

External installer trust remains future scope. `origin: official` inside a
package is not sufficient evidence of official trust. See
`docs/SKIN-DISTRIBUTION.md`.

## Destructive UI Safety

```text
deck deletion:
  requires explicit danger confirmation
  explains irreversibility and absence of restore UI
  suggests export before deletion

danger Dialog:
  cancellation receives initial focus
  message is associated through aria-describedby

emergency reset:
  attempts every known key
  reports failed keys
  reloads only after complete success
```

## Regression Tests Added in This Deep Dive

| Test file | Cases added |
|---|---:|
| `src/ui/components/AppErrorBoundary.test.tsx` | 2 |
| `src/engine/validation/validateDeckMembershipIntegrity.test.ts` | 7 |
| `src/ui/skins/skinPreload.failure.test.ts` | 2 |
| `src/ui/screens/DeckDetailScreen.test.tsx` | 2 |
| `src/storage/localStorageDuplicateDeckIds.test.ts` | 3 |
| `src/storage/localStorageRecordsSetNormalization.test.ts` | 3 |
| `src/ui/components/Dialog.accessibility.test.tsx` | 3 |
| `src/storage/localStorageDeckMetadataSalvage.test.ts` | 2 |
| `src/storage/localStorageRecordsPartialSalvage.test.ts` | 3 |
| `src/storage/localStorageDeckStaleMutation.test.ts` | 3 |
| `src/engine/import/scanUnsafeKeys.test.ts` | 1 |
| `src/ui/skins/skinInheritanceDepth.test.ts` | 2 |
| `src/ui/skins/validateSkinManifestTrust.test.ts` | 4 |
| `src/ui/skins/skinRegistryIntegrity.test.ts` | 4 |
| **Deep-dive total** | **41** |

Previous two reviews: **38 cases**.  
Cumulative post-Batch-10 targeted test definitions: **79 cases**.

These are committed definitions, not observed PASS results.

## Dedicated Integrity Workflow

`.github/workflows/integrity.yml` now exists and runs 23 targeted files,
including the original two-review contracts and all deep-dive storage,
validation, import, skin, recovery, destructive-UI, and accessibility files.
It also runs `pnpm typecheck`.

The ordinary full CI remains separate. A workflow definition is not evidence
that a specific SHA passed it.

## Residual Risks

Not closed here:

```text
exact-final-SHA install / typecheck / test / skin validation / build
GitHub Actions result for that exact SHA
Batch 11 production Firefox/WebKit execution
physical iPhone/iPad/Android
real Safari + VoiceOver, NVDA, JAWS
real deployment and immutable deployed-artifact rollback
user-facing backup restore
true transactional multi-tab compare-and-swap
installer-owned external skin trust binding / signatures / entitlement
MatchSession React remount key still depends on the bounded numeric seed;
  a theoretical long-session collision remains and should be replaced by
  matchSessionId when AppRoot can be edited against a frozen baseline
```

The Store fingerprint guard blocks ordinary stale delete/update paths, but
`localStorage` still cannot provide a true atomic compare-and-swap. Do not call
multi-tab editing transaction-safe.

## Required Verification Sequence

```text
1. Stop all concurrent writers.
2. Freeze clean HEAD == origin/main.
3. Record exact SHA, Node, pnpm, and Playwright versions.
4. pnpm install --frozen-lockfile.
5. Run Integrity Contracts and confirm all 79 cumulative cases are collected.
6. pnpm typecheck.
7. pnpm test.
8. pnpm skin:validate.
9. pnpm build and record artifact hashes.
10. If any code/test changes, discard results and restart from step 1.
11. Execute Batch 11 on that same production artifact.
```

## Decision

```text
THIRD DEEP INTEGRITY REVIEW: COMPLETE
PRODUCT / TEST / CI / CONTRACT FIXES: COMMITTED
CUMULATIVE TARGETED DEFINITIONS: 79
EXACT-SHA EXECUTION: NOT OBSERVED
BATCH 11: NOT EXECUTED
RC: LIMITED READY
NEW FEATURE / ASSET WORK: DO NOT RESUME YET
```
