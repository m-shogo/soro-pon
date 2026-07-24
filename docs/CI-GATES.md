# CI Gates

## Purpose

CI prevents schema, engine, import, persistence, UI-contract, and skin
package drift. Local command success and GitHub Actions success are
separate facts. A successful push is not a CI PASS.

## Current Automated Workflow

Canonical file: `.github/workflows/ci.yml`.

```text
trigger: push to main + pull_request
permissions: contents read only
concurrency: newer run cancels obsolete run for the same ref
job timeout: 20 minutes
Node: 24
package manager: packageManager field / pnpm lockfile
```

Execution order:

```bash
pnpm install --frozen-lockfile
pnpm exec vitest run \
  src/storage/storageRecoveryFailurePaths.test.ts \
  src/storage/localStorageRecordsAtomicity.test.ts \
  src/storage/localStorageCapacity.test.ts \
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

The named `Critical integrity contracts` step intentionally overlaps the
full Vitest run. It isolates release-critical failures before the complete
suite and must not be removed merely as duplicate execution.

Across the two post-Batch-10 reviews, these files contain 38 added
integrity cases. This is a committed test-definition count, not a passing
result until CI or local verification executes the exact current SHA.

## Critical Integrity Coverage

```text
storageRecoveryFailurePaths:
  corrupt backup/cleanup failure
  read-denied session fallback
  fail-closed deck/records/settings mutation and export

localStorageRecordsAtomicity:
  one-write record/reward commit
  duplicate match no-op
  failed-write all-or-nothing behavior

localStorageCapacity:
  exact persisted limits
  existing update at cap
  old over-limit bounded salvage and backup

storageWriteContract:
  final runtime schema validation
  direct Store nested-ID rejection

resetLocalData:
  all active/forensic/skin keys
  truthful partial deletion result

runtimeIds:
  collision-resistant shared deck ID

AppRoot.persistence:
  migration review
  same-ID overwrite review
  review invalidation
  cross-tab stale import/editor rejection

validateDeckEntityIds:
  variant/role/bonus uniqueness
  import rejection
```

## Required Base Evidence

A CI report records:

```text
exact commit SHA
workflow run URL/ID when available
job conclusion
Node and pnpm versions
install/integrity/typecheck/test/skin validation/build results
cancelled/superseded distinction
```

If the connector/API returns no workflow run or status, report CI as
**unavailable/not observed**, never green.

## Required Full Test Groups

The full unit suite must include:

```text
schema and golden fixture tests
import security/unsafe-field tests
migration and overwrite confirmation tests
deck validation and nested-ID integrity tests
group/wildcard/ron/tsumo/scoring tests
discard preview purity tests
match reducer and deterministic CPU tests
localStorage migration/recovery/read-denial tests
write-boundary schema tests
persisted limit and upgrade-normalization tests
match record/reward atomicity and idempotency tests
cross-tab stale-write rejection tests
component/DOM/accessibility tests
skin core/package tests
```

Pure engine tests remain in Node. DOM behavior uses the configured
browser-like environment only where needed.

## Skin Validation Gate

`pnpm skin:validate` is an explicit release gate even where its test file
is also collected by `pnpm test`.

It verifies:

```text
registry/manifest/contract schemas and versions
known skin/token/slot IDs
typed token allowlist and value ranges
inheritance cycle/depth
package-local safe paths and trust-level file types
actual file existence/bytes/dimensions
intrinsicSize, slice, safe-area, minimum render geometry
render-mode permission
status/file/candidate/final path consistency
all official packages and fallback behavior
```

## Visual / Browser Gates

Playwright visual, cross-browser, soak, real-device, and real-AT suites are
pre-release/manual evidence gates, not currently part of the default
GitHub Actions job. Reasons include browser installation cost, screenshot
review, host-specific automation, and real-device requirements.

```bash
pnpm test:visual
pnpm test:visual:crossbrowser
```

Current executable contract:
`docs/qa/BATCH-11-PRODUCTION-CROSS-BROWSER-MATRIX.md`.

Do not say “CI covers browsers” merely because browser tests exist in the
repository.

## Visual Regression Rules

```text
deterministic data and viewport
reduced/disabled motion
stable fonts
required skin assets loaded before capture
dynamic timestamps masked or fixed
human review for meaningful screenshot diffs
no broad automatic baseline acceptance
```

## Security / Integrity Gates

Deck imports reject:

```text
imageUrl / imageBase64 / filePath / blobUrl
url / src / href
html / style / script / code / function
prototype pollution keys
unknown fields
oversize/deep payloads before expensive analysis
duplicate variant/role/bonus IDs
```

Persistence rejects:

```text
schema-invalid deck/records/settings payloads
nested ambiguous deck IDs
new deck beyond 200 entries
empty-based mutation after storage read denial
stale detected import/editor overwrite
```

Skin packages reject:

```text
unknown tokens/slots/render modes
structural token override
arbitrary executable/display injection
external URLs/fonts
path traversal
unapproved external SVG
invalid geometry and over-budget files
```

## Performance / Capacity Smoke

Use structural assertions instead of flaky host timings:

```text
candidate and branch caps emit warnings
large unsafe import rejects before deep validation
primary candidate count is capped
persisted collection limits are enforced
legacy over-limit payloads are partially salvaged, not wiped
skin byte/dimension limits are enforced
stale skin load cannot overwrite newer selection
failed preload keeps previous/fallback skin
```

Long-duration memory/runtime evidence is handled by the soak runbook and
Batch reports, not the default CI job.

## Lint / Format

No separate lint/format tool is currently declared. Do not claim one.
Adoption requires dependency-policy/ADR review and a committed CI command.

## Workflow Security / Maintenance

Current workflow uses read-only repository permission and standard major
action versions. Before organization-wide or external-contributor use,
consider action pinning and dependency-update policy through ADR; do not
invent unverified commit SHAs.

## Final Decision

CI proves only the commands present in `.github/workflows/ci.yml` on the
exact reported SHA. Browser/device/AT/deploy claims require separate
evidence, and missing workflow visibility must remain explicit.
