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
pnpm exec vitest run src/storage/storageRecoveryFailurePaths.test.ts
pnpm typecheck
pnpm test
pnpm skin:validate
pnpm build
```

The dedicated storage command is intentionally duplicated by the full
Vitest run. It makes the newly added compound recovery regression visible
as its own gate while the full suite still proves no broader regression.

## Required Base Evidence

A CI report records:

```text
exact commit SHA
workflow run URL/ID when available
job conclusion
Node and pnpm versions
install/typecheck/test/skin validation/build results
cancelled/superseded distinction
```

If the connector/API returns no workflow run or status, report CI as
**unavailable/not observed**, never green.

## Required Test Groups

The full unit suite must include:

```text
schema and golden fixture tests
import security/unsafe-field tests
deck validation tests
group/wildcard/ron/tsumo/scoring tests
discard preview purity tests
match reducer and deterministic CPU tests
localStorage/migration/recovery tests
compound storage operation failure tests
achievement/record idempotency tests
component/DOM/accessibility tests
skin core/package tests
```

Pure engine tests remain in Node. DOM behavior uses the configured
browser-like test environment only where needed.

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
**pre-release/manual evidence gates**, not currently part of the default
GitHub Actions job. Reasons include browser installation cost, screenshot
baseline review, host-specific automation, and real-device requirements.

Commands where applicable:

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

## Security Gates

Deck imports reject:

```text
imageUrl / imageBase64 / filePath / blobUrl
url / src / href
html / style / script / code / function
prototype pollution keys
unknown fields
oversize/deep payloads before expensive analysis
```

Skin packages reject:

```text
unknown tokens/slots/render modes
structural token override
arbitrary CSS/JS/HTML
external URLs/fonts
path traversal
unapproved external SVG
invalid geometry and over-budget files
```

## Performance Smoke

Use structural assertions instead of flaky host timings:

```text
candidate and branch caps emit warnings
large unsafe import rejects before deep validation
primary candidate count is capped
skin byte/dimension limits are enforced
stale skin load cannot overwrite newer selection
failed preload keeps previous/fallback skin
```

Long-duration memory/runtime evidence is handled by the soak runbook and
recorded Batch reports, not the default CI job.

## Lint / Format

No separate lint/format tool is currently declared. Do not claim one.
Adoption requires dependency-policy/ADR review and a committed CI command.
TypeScript strictness and tests are not a substitute for an undocumented
formatter, and an absent formatter is not automatically a release blocker.

## Workflow Security / Maintenance

Current workflow uses read-only repository permission and standard major
action versions. Before organization-wide or external-contributor use,
consider an explicit action-SHA pinning policy and Dependabot/Renovate
policy through ADR; do not invent unverified commit SHAs.

## Final Decision

CI proves only the commands actually present in `.github/workflows/ci.yml`
on the exact reported SHA. Browser/device/AT/deploy claims require their
own evidence, and missing workflow visibility must remain explicit.
