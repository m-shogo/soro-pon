# CI Gates

## Purpose

CI prevents schema, engine, import, persistence, UI-contract, skin-package,
and asset-pipeline drift. Local success, a committed workflow, a successful
push, and GitHub Actions success are separate facts.

## Current Workflows

### Main CI — `.github/workflows/ci.yml`

```text
trigger: push main + pull_request
permissions: contents read only
concurrency: cancel obsolete run for same ref
Node job timeout: 20 minutes
Python asset job timeout: 15 minutes
```

Node job:

```text
Node 24 / pnpm lockfile
pnpm install --frozen-lockfile
named critical-integrity step
pnpm typecheck
pnpm test
pnpm skin:validate
pnpm build
```

Python asset job:

```text
Python 3.13
exact top-level pins from tools/asset-factory/soro-pon-ui/requirements.txt
isolated venv
pnpm asset:image:test equivalent via run-python-tests.sh
```

The Python top-level packages are pinned to:

```text
Pillow 12.3.0
NumPy 2.5.1
pytest 9.1.1
```

These pins improve repeatability, but pip transitive dependencies and wheels
are not yet hash-locked. Do not describe this as a fully immutable Python
supply chain.

### Integrity Contracts — `.github/workflows/integrity.yml`

```text
trigger: push main + pull_request
permissions: contents read only
concurrency + 20-minute timeout
frozen pnpm install
23 targeted integrity test files
pnpm typecheck
```

The three post-Batch-10 reviews added **79 targeted test definitions**. That
is a committed definition count, not an observed PASS result.

## Integrity Coverage

```text
storage cleanup/read denial/fail-closed mutation
match record/reward atomicity
persisted collection limits and old/partial salvage
runtime write-boundary schemas
reset completeness and truthful failure
runtime/deck ID collision resistance
migration and same-ID overwrite review
stale import/editor/update/delete rejection
nested variant/role/bonus identity
membership set semantics
ignored group fields and contradictory score caps
bounded unsafe-import diagnostics
ErrorBoundary emergency reset
deck deletion confirmation
Dialog description and danger-focus safety
skin preload exceptions/unmount race
skin inheritance exact boundary
runtime external-SVG policy
registry duplicate/future-version rejection
duplicate persisted deck-ID consolidation
deck metadata-only salvage
partial records salvage
records set normalization and totalMatches lower bound
```

The executable file list lives only in `.github/workflows/integrity.yml`.

## Required Evidence

Every CI report records:

```text
exact commit SHA
workflow and job name
run URL/ID where visible
job conclusion
Node/pnpm/Python versions
resolved top-level Python package versions
install/integrity/typecheck/test/skin/build/asset-fixture results
cancelled/superseded distinction
```

If no run/status is visible, report **unavailable/not observed**, never green.

## Full Test Expectations

The full suite covers:

```text
schema/golden fixtures
import security, depth, size, and diagnostic caps
migration and overwrite confirmation
deck identity/membership/group/scoring validation
group/wildcard/ron/tsumo/scoring
discard preview purity
seeded reducer/CPU determinism
storage migration/recovery/read denial/partial salvage
write-boundary schemas and capacity
match reward atomicity/idempotency
stale multi-tab mutation rejection
component/DOM/a11y/destructive safety
skin registry/manifest/runtime/package contracts
Python chroma-key/validation/audit fixtures
```

## Skin Validation Gate

`pnpm skin:validate` remains an explicit gate even when its test is also
collected by the full unit suite.

```text
registry/manifest/contract schema/version
known token/slot IDs and typed ranges
inheritance cycle/depth
safe paths and trust-level file policy
actual file existence/bytes/dimensions
intrinsicSize/slice/safe-area/minimum render geometry
render-mode and status/path consistency
official packages and fallback behavior
```

Runtime tests separately cover duplicate/future registry rejection,
external-evaluated SVG rejection, preload failure, and request races.

## Asset Pipeline Gate

The Python fixture suite must pass whenever the asset-factory scripts or
requirements change.

```text
requirements change:
  intentional version review
  CI fixture run
  no broad >= dependency drift

script change:
  deterministic fixture comparison
  audit/occupancy/alpha/fringe behavior
```

The old binary chroma-key implementation is not current; the compatibility
wrapper delegates to `chroma_key.py`.

## Browser / Visual Gates

Playwright visual, cross-browser, soak, real-device, and real-AT suites are
separate release gates, not default CI coverage.

```bash
pnpm test:visual
pnpm test:visual:crossbrowser
```

Current executable contract:
`docs/qa/BATCH-11-PRODUCTION-CROSS-BROWSER-MATRIX.md`.

## Security / Integrity Gates

Deck imports reject:

```text
image/url/path/blob fields
html/style/script/code/function fields
prototype-pollution keys
unknown fields
oversize/deep payloads before expensive analysis
large unsafe diagnostics after bounded evidence
ambiguous IDs/memberships/group fields/score caps
```

Persistence rejects or safely recovers:

```text
invalid deck/records/settings payloads
new deck beyond 200
mutation after storage read denial
stale observed update/delete
persisted duplicate deck IDs
metadata-only deck-wrapper corruption
isolated malformed match rows
unsafe numeric values
```

Skin checks reject:

```text
unknown tokens/slots/render modes
structural override
arbitrary executable/display injection
external URLs/fonts
path traversal
external-evaluated SVG
invalid geometry/size budget
duplicate/future registry contract
```

Future external package official trust still requires installer-owned
identity/signature binding; manifest self-declaration is insufficient.

## Capacity / Performance Smoke

Prefer structural assertions over flaky host timing:

```text
candidate/branch caps warn
diagnostic generation bounded
persisted limits enforced
old/partial data preserves safe values
skin byte/dimension limits enforced
stale/unmounted skin load cannot replace current selection
failed preload keeps previous/fallback skin
```

Long-duration memory/runtime claims remain in soak/Batch evidence.

## Workflow Supply-chain Notes

Current workflows use read-only repository permission and major-version action
tags. Before external-contributor or organization-wide use, evaluate immutable
action commit pinning through ADR. Do not invent or copy unverified action SHAs.

Python packages are exact top-level pins but not hash-locked. Node packages are
resolved by the committed pnpm lockfile with integrity metadata.

## Final Decision

CI proves only commands actually executed on the exact SHA. Browser/device/AT/
deploy claims require separate evidence, and missing workflow visibility stays
explicit.
