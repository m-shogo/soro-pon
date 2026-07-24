# CI Gates

## Purpose

CI prevents schema, engine, import, persistence, UI-contract, and skin
package drift. Local command success and GitHub Actions success are
separate facts. A successful push or a committed workflow file is not a
CI PASS.

## Current Workflows

### Main CI

Canonical file: `.github/workflows/ci.yml`.

```text
trigger: push to main + pull_request
permissions: contents read only
concurrency: newer run cancels obsolete run for the same ref
job timeout: 20 minutes
Node: 24
package manager: packageManager field / pnpm lockfile
```

Execution:

```text
pnpm install --frozen-lockfile
named recovery-focused integrity step
pnpm typecheck
pnpm test
pnpm skin:validate
pnpm build
```

### Integrity Contracts

Canonical file: `.github/workflows/integrity.yml`.

```text
trigger: push to main + pull_request
permissions: contents read only
concurrency and 20-minute timeout
frozen pnpm install
23 targeted integrity test files
pnpm typecheck
```

The dedicated workflow covers all three post-Batch-10 review layers. The
79-case number is a committed test-definition count, not a passing result
until the exact current SHA is observed executing it.

## Integrity Coverage

The workflow includes:

```text
storage recovery cleanup/read-denial failures
match result/reward atomicity
persisted collection limits and legacy over-limit salvage
final write-boundary schemas
reset completeness and truthful partial failure
runtime/deck ID collision resistance
legacy migration and same-ID overwrite review
cross-tab stale import/editor/update/delete rejection
variant/role/bonus identity integrity
tile membership set semantics
ignored group fields and contradictory score caps
unsafe-import diagnostic cap
ErrorBoundary emergency reset
irreversible deck deletion confirmation
Dialog description and danger-focus safety
skin preload exceptions and unmount races
skin inheritance boundary
runtime external-SVG policy
registry duplicate/future-version rejection
duplicate persisted deck-ID consolidation
deck metadata-only salvage
partial records salvage
records set normalization and totalMatches lower bound
```

The targeted file list is maintained only in
`.github/workflows/integrity.yml`. Do not copy an obsolete command list into
other operating documents.

## Required Evidence

Every CI report records:

```text
exact commit SHA
workflow name and run URL/ID when available
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
import security/unsafe-field/depth/diagnostic-cap tests
migration and overwrite confirmation tests
deck identity/membership/group/scoring validation tests
group/wildcard/ron/tsumo/scoring tests
discard preview purity tests
match reducer and deterministic CPU tests
localStorage migration/recovery/read-denial/partial-salvage tests
write-boundary schema tests
persisted limit, dedupe, and upgrade-normalization tests
match record/reward atomicity and idempotency tests
cross-tab stale-write/delete rejection tests
component/DOM/accessibility/destructive-action tests
skin registry/manifest/runtime/package tests
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

Runtime tests separately verify duplicate/future registry rejection,
external-evaluated SVG rejection, preload exceptions, and request races.

## Visual / Browser Gates

Playwright visual, cross-browser, soak, real-device, and real-AT suites are
pre-release/manual evidence gates, not currently part of the default
GitHub Actions jobs.

```bash
pnpm test:visual
pnpm test:visual:crossbrowser
```

Current executable contract:
`docs/qa/BATCH-11-PRODUCTION-CROSS-BROWSER-MATRIX.md`.

Do not say “CI covers browsers” merely because browser tests exist.

## Security / Integrity Gates

Deck imports reject:

```text
image/url/path/blob fields
html/style/script/code/function fields
prototype pollution keys
unknown fields
oversize/deep payloads before expensive analysis
large unsafe diagnostics after bounded evidence collection
ambiguous nested IDs
membership duplicates
engine-ignored group fields
contradictory score caps
```

Persistence rejects or safely recovers:

```text
schema-invalid deck/records/settings payloads
new deck beyond 200 entries
empty-based mutation after storage read denial
stale observed update/delete
ambiguous persisted duplicate deck IDs
metadata-only deck wrapper corruption
isolated malformed match records
unsafe numeric values
```

Skin runtime/package checks reject:

```text
unknown tokens/slots/render modes
structural token override
arbitrary executable/display injection
external URLs/fonts
path traversal
external-evaluated SVG
invalid geometry and over-budget files
duplicate/future registry contracts
```

External package official trust still requires a future installer-owned
trust/signature boundary; runtime manifest self-declaration is not enough.

## Performance / Capacity Smoke

Use structural assertions instead of flaky host timings:

```text
candidate and branch caps emit warnings
large unsafe import rejects before deep validation
diagnostic generation is bounded
persisted collection limits are enforced
old/partial payloads preserve valid data where safe
skin byte/dimension limits are enforced
stale/unmounted skin load cannot overwrite current selection
failed preload keeps previous/fallback skin
```

Long-duration memory/runtime evidence is handled by the soak runbook and
Batch reports, not the default CI jobs.

## Lint / Format

No separate lint/format tool is currently declared. Do not claim one.
Adoption requires dependency-policy/ADR review and a committed CI command.

## Workflow Security / Maintenance

Current workflows use read-only repository permission and standard major
action versions. Before organization-wide or external-contributor use,
consider immutable action pinning and dependency-update policy through ADR;
do not invent unverified commit SHAs.

## Final Decision

CI proves only commands actually executed on the exact reported SHA.
Browser/device/AT/deploy claims require separate evidence, and missing
workflow visibility must remain explicit.
