# Post-Batch-10 Integrity Review

Date: 2026-07-24  
Repository: `m-shogo/soro-pon`  
Review baseline: `c9b18b6c8280ea1a5dfbf5458aaa27c4906870f9`  
Result: **PRODUCT/DOC FIXES COMMITTED / EXACT-SHA VERIFICATION PENDING**  
RC status: **LIMITED READY**  
Batch 11: **CONTRACT DEFINED / NOT EXECUTED**

## Executive Verdict

The repository was not internally consistent enough to treat the
post-Batch-10 state as release-current without changes.

The review found real defects in corruption recovery, persistence success
claims, legacy migration UX, local-data reset completeness, route
recovery, browser export lifecycle, error-code ownership, CI visibility,
and current-state documentation.

Fixes and regression tests are committed to `main`, but this review does
**not** claim typecheck, unit tests, skin validation, build, CI, or Batch
11 passed. The available environment could read/write the GitHub
repository but could not clone/run the project locally. Connector-visible
GitHub status also did not provide an authoritative direct-push workflow
result. The exact final execution SHA must therefore be frozen and tested
separately.

## Review Scope

```text
storage corruption and migration
normal write failure semantics
backup / reset / restore truthfulness
achievement and record persistence
missing-entity route recovery
legacy import confirmation
Blob URL/export behavior
error code registry
CI commands and evidence authority
release/readiness/current-state documents
performance/soak claim boundaries
operations applicability: rollback, observability, metrics, trace,
  rate limit, load, chaos, incident response, version compatibility
```

## Findings

| ID | Severity | Finding | Risk | Disposition |
|---|---|---|---|---|
| IR-01 | P1 | Corruption recovery used raw `getItem/setItem/removeItem` | Corrupt data plus quota/storage denial could make recovery itself throw and block boot | Fixed; verification pending |
| IR-02 | P1 | “All local data” reset omitted records/settings corrupt-backup keys | User-requested deletion could leave forensic payloads behind while UI claimed all data was removed | Fixed; verification pending |
| IR-03 | P1 | Reset swallowed removal failures and reloaded as though successful | Partial deletion could appear successful and conceal retained data | Fixed; verification pending |
| IR-04 | P2 | Records/settings recovery issues were discarded by `AppRoot` | Recovery occurred without user-visible warning | Fixed; verification pending |
| IR-05 | P2 | Achievement write failure could still return “newly unlocked” to Result | UI could claim persistence that did not happen | Fixed; verification pending |
| IR-06 | P2 | Missing current deck or active variant could leave route rendering `null` indefinitely | Blank/dead-end screen after recovery, deletion, or state drift | Fixed; verification pending |
| IR-07 | P2 | Legacy import `migrationNotice` was ignored | Version 0 data could be transformed and saved without visible review of changes | Fixed with two-step confirmation; verification pending |
| IR-08 | P2 | Export revoked Blob URL immediately and used a detached anchor | Firefox/WebKit download reliability risk | Fixed; Batch 11 verification pending |
| IR-09 | P2 | New storage-read meaning initially collided with existing `L9004` image-fallback meaning | Logs/tests/support could interpret one code two ways | Fixed before validation; canonical codes updated |
| IR-10 | P2 | Batch 11 contract named an obsolete fixed baseline after product changes | Evidence from an older artifact could be presented as current | Fixed; execution must freeze current SHA |
| IR-11 | P2 | Entry docs still directed agents toward H1 / asset Batch 5 / pre-implementation work | High risk of reopening completed foundations and bypassing release closure | Rewritten around current canonical roles |
| IR-12 | P2 | Technical risk register still said implementation had not started | Risk status and next work were materially false | Replaced with current CLOSED/MITIGATED/OPEN/BLOCKED register |
| IR-13 | P3 | CI had no timeout/concurrency policy and the new recovery regression was hidden inside the full suite | Slower feedback and low visibility for the release-critical fix | Hardened; CI result still unobserved |
| IR-14 | P3 | Performance docs mixed development targets with device-level implications | Risk of unsupported 60fps/device claims | Rewritten with structural/host/device authority levels |
| IR-15 | Scope | Backend-grade rate limit, distributed trace, and server load were not implemented | Could be mistaken for missing release work despite no backend/API | Classified NOT_APPLICABLE until architecture trigger |
| IR-16 | Blocked | Real deploy, immutable artifact rollback, physical devices, real Safari, and additional real AT remain unavailable | RC cannot become READY | Remains open/blocked evidence |

## Code Changes

### Storage recovery

```text
src/storage/localStorageDeckStore.ts
src/storage/localStorageRecordsStore.ts
src/storage/localStorageSettingsStore.ts
```

Current behavior:

```text
storage read denial -> L9005 + empty/default in-memory fallback
backup creation and active-key removal independently guarded
healthy deck entries salvaged independently
records/settings raw corrupt payload backup attempted
cleanup/writeback failure does not escape as a raw recovery exception
warning states whether backup or cleanup failed
```

### Persistence/UI consistency

`src/app/AppRoot.tsx` now:

```text
collects boot issues from decks, records, and settings
uses L9006 for failed starter bootstrap persistence
does not return an achievement as unlocked after failed persistence
redirects missing deck/variant routes to a safe screen with warning
uses an attached download anchor and deferred Blob URL revocation
requires visible version/change review before saving a legacy import
invalidates migration approval when pasted input changes
```

### Local reset truthfulness

```text
src/storage/resetLocalData.ts
src/ui/screens/TopScreen.tsx
```

The known-key list now includes:

```text
deck active + corrupt backup
records active + corrupt backup
settings active + corrupt backup
skin selection
```

`resetAllLocalData()` returns removed/failed keys. The TOP screen reloads
only when every known key removal succeeds. Partial failure produces a
visible error and does not claim reset completion.

## Regression Tests Added

### Storage operation failures — 6 cases

`src/storage/storageRecoveryFailurePaths.test.ts`

```text
deck corrupt-backup write failure
deck active-key removal failure
deck storage-read denial -> L9005
records corrupt raw backup and active removal
records backup + removal both fail
settings storage-read denial -> L9005
```

### AppRoot persistence/migration — 3 cases

`src/app/AppRoot.persistence.test.tsx`

```text
legacy import first action reviews but does not save
second unchanged action saves migrated version 1 data
editing input invalidates prior migration review
records/settings recovery notices reach the boot UI
```

The file contains three test cases; the first case proves both first-action
non-persistence and second-action persistence.

### Reset contract — 3 cases

`src/storage/resetLocalData.test.ts`

```text
all active/backup/skin keys are included
all-success result returns every removed key
one removal failure does not stop later attempts and is reported
```

Total newly committed test cases in this review: **12**.

These tests are **committed, not yet executed in an authoritative local or
GitHub Actions run for the final review SHA**.

## CI Changes

`.github/workflows/ci.yml` now has:

```text
read-only contents permission
same-ref concurrency cancellation
20-minute job timeout
frozen install
explicit storage recovery regression command
strict typecheck
full unit suite
explicit skin validation
production build
```

The dedicated storage command intentionally overlaps the full unit suite
so the release-critical recovery tests are visible as a named CI step.

Browser/visual/soak/real-device/real-AT gates remain outside the default
CI workflow and must not be described as CI-covered.

## Documentation Repaired

Current-state/contract documents changed or replaced:

```text
README.md
AGENTS.md
CODEX.md
CLAUDE.md
docs/README.md
docs/IMPLEMENTATION-WORKFLOW.md
docs/RELEASE-DEMO-GATES.md
docs/qa/BATCH-11-PRODUCTION-CROSS-BROWSER-MATRIX.md
docs/release/STORAGE-RECOVERY-POLICY.md
docs/ERROR-CODES.md
docs/MIGRATIONS.md
docs/PERFORMANCE-GUARDRAILS.md
docs/CI-GATES.md
docs/TECHNICAL-RISK-REGISTER.md
docs/OPERATIONS-READINESS.md
```

Canonical separation:

```text
MASTER-SPEC = product/rule truth
RELEASE-DEMO-GATES = readiness truth
latest Batch matrix/report = exact evidence scope
IMPLEMENTATION-WORKFLOW = next executable sequence
OPERATIONS-READINESS = applicability and operational gaps
TECHNICAL-RISK-REGISTER = current risk status
historical/numbered docs cannot override current truth
```

## Error Code Result

```text
L9001 corrupt/invalid persisted payload recovered or normalized
L9002 known older deck data migrated without dropping entries
L9003 unrecoverable deck entries dropped during partial recovery
L9004 local image missing; visual fallback used
L9005 browser storage read unavailable; session fallback used
L9006 bootstrap/default data could not be persisted
```

`L9004` retains its pre-existing meaning and is not reused.

## Operations Readiness Result

Current frontend architecture is static/local-first with no backend,
accounts, API, cloud sync, or remote telemetry.

Applicable now:

```text
schema/version compatibility
local corruption recovery
best-effort forensic backup
client resource caps
storage/skin fault injection
browser flow/error monitoring
soak/stability evidence
```

Open/blocked now:

```text
user-facing restore
selected hosting target
real staging/production deploy
immutable artifact retention
actual deployed-artifact rollback
production ownership/escalation
physical-device performance
real Safari and remaining AT evidence
```

Not applicable until a backend/network trigger exists:

```text
HTTP/account rate limiting
distributed tracing
server RPS/concurrency load tests
DB/queue/pool metrics
backend dependency chaos
```

These become mandatory if login, sync, multiplayer, uploads, telemetry,
marketplace, or any API is introduced.

## Verification Not Performed

The following are deliberately **not claimed**:

```text
pnpm install --frozen-lockfile PASS
pnpm typecheck PASS
pnpm test PASS
pnpm skin:validate PASS
pnpm build PASS
GitHub Actions PASS for final SHA
Playwright visual/cross-browser PASS for final SHA
Batch 11 COMPLETE
real device / Safari / AT / deploy / rollback PASS
```

Reason: the available execution environment did not contain a runnable
clone and could not clone the repository. GitHub connector write access
was available, but direct-push workflow status was not authoritative in
the returned status data.

## Required Closure Sequence

```text
1. Freeze clean HEAD == origin/main.
2. Record exact SHA, Node, pnpm, Playwright, Firefox, and WebKit versions.
3. Run pnpm install --frozen-lockfile.
4. Run the named storage recovery regression.
5. Run pnpm typecheck.
6. Run pnpm test and confirm all 12 new cases are collected/passing.
7. Run pnpm skin:validate.
8. Run pnpm build and record artifact inventory/hash.
9. Fix any failure; if code changes, return to step 1.
10. Execute the full Batch 11 matrix on the same SHA/artifact.
11. Commit evidence/report and only then update Batch 11 status.
12. Keep RC LIMITED READY until separate real-device, real-Safari,
    real-AT, and real-deploy/rollback evidence exists.
```

## Key Commit Ledger

Representative code/test/CI commits:

```text
bc930521  deck recovery failure-safe foundation
94349b24  records recovery backup/fault handling
7efd5987  settings recovery backup/fault handling
cbeb24a8  storage recovery failure-path tests
023208b1  AppRoot persistence/recovery consistency
b9c815f6  stable storage error-code ownership
6e1c6ac3  visible legacy migration confirmation
7e79e1b5  AppRoot persistence/migration DOM tests
ac51f46b  reset result reports partial failures
7bc39a03  TOP does not claim failed reset succeeded
dba7eb6f  reset result regression tests
955802a4  CI order/concurrency/timeout/recovery gate
```

Representative documentation commits:

```text
f2d5bc58  Batch 11 exact-SHA evidence rule
466f8ea1  storage recovery policy
1397447c  migration confirmation/compatibility policy
97ed04f8  current technical risk register
f14b307a  operations readiness applicability matrix
5d25a471  performance authority and guardrails
436de687  release-current documentation index
```

The ledger is orientation, not a substitute for `git log`. Because changes
were committed directly in a sequence, final validation must identify the
single exact final HEAD rather than infer success from individual commits.

## Final Decision

The review materially improved integrity, recovery, privacy truthfulness,
compatibility UX, and documentation. It also invalidated any assumption
that Batch 10 evidence proves the newer product HEAD.

Current decision remains:

```text
PRODUCT FIXES: COMMITTED
REGRESSION TESTS: COMMITTED, UNEXECUTED FOR FINAL SHA
CI: HARDENED, FINAL RESULT UNOBSERVED
BATCH 11: NOT EXECUTED
RC: LIMITED READY
NEW FEATURE / ASSET WORK: DO NOT START BEFORE CLOSURE
```
