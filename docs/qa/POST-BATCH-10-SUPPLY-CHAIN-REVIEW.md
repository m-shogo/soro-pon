# Post-Batch-10 Supply-chain Review

Date: 2026-07-25  
Repository: `m-shogo/soro-pon`  
Result: **POLICY / CI / MONITORING FIXES COMMITTED**  
Execution: **EXACT-FINAL-SHA INSTALL AND WORKFLOW RESULT NOT OBSERVED**

## Scope

```text
pnpm root dependencies and lockfile resolution
Python asset-factory dependencies
GitHub Actions workflow dependencies
update monitoring
advisory applicability versus installed/reachable features
reproducibility and remaining immutability gaps
```

## Findings

| ID | Severity | Finding | Disposition |
|---|---|---|---|
| SCR-01 | P2 | Python asset dependencies used open-ended `>=` ranges | Exact top-level pins added |
| SCR-02 | P2 | Python fixture suite depended on a developer-created local venv and was absent from CI | Python 3.13 asset job added to main CI |
| SCR-03 | P2 | Asset Factory README still claimed the obsolete binary chroma-key implementation was current | Corrected; wrapper/real implementation roles documented |
| SCR-04 | P2 | No dependency update monitor existed for npm, pip, or GitHub Actions | Dependabot configuration added for all three ecosystems |
| SCR-05 | P3 / open | Python top-level pins do not hash-lock transitive packages or wheels | Explicitly documented; future lock/hash tooling requires intentional ADR |
| SCR-06 | P3 / open | GitHub Actions use reviewed major tags rather than immutable commit SHAs | Read-only permissions retained; immutable pinning remains a future ADR before broader trust exposure |
| SCR-07 | P3 | Dependency review guidance discussed the browser stack but not the Python and Actions supply chain | Dependency and CI policies rewritten |

## Node / pnpm State

The committed root lockfile resolves the current direct stack to:

```text
react / react-dom       19.2.7
zod                     3.25.76
vite                    6.4.3
vitest                  3.2.7
jsdom                   29.1.1
@playwright/test        1.61.1
typescript              5.9.3
```

`pnpm install --frozen-lockfile` is required in CI. The lockfile contains
resolved artifact integrity metadata. Advisory review must use resolved
versions and installed feature reachability, not only the broad ranges in
`package.json`.

The inspected root importer does not contain a React Server Components runtime
package such as `react-server-dom-*`. This is relevant when classifying RSC-only
advisories; it is not a blanket statement that every React advisory is
inapplicable.

## Python Asset Factory State

`tools/asset-factory/soro-pon-ui/requirements.txt` now pins:

```text
Pillow==12.3.0
numpy==2.5.1
pytest==9.1.1
```

Main CI now creates a Python 3.13 virtual environment, installs those pins, and
runs the complete Python fixture suite through the existing factory wrapper.

Remaining limit:

```text
exact top-level versions != hash-locked environment
pip may resolve transitive packages/platform wheels without committed hashes
successful workflow execution on the final SHA has not been observed
```

## GitHub Actions State

Current workflows use:

```text
contents: read
per-ref concurrency cancellation
explicit job timeouts
frozen pnpm install
separate Node/integrity/Python responsibilities
```

The repository now has weekly Dependabot checks for:

```text
npm/pnpm
the asset-factory pip directory
GitHub Actions
```

Dependabot PRs are review inputs, not automatic acceptance.

Open hardening option:

```text
pin each action to a verified immutable commit SHA
```

This should be done through a deliberate ADR using verified upstream SHAs,
not by copying unverified hashes from examples.

## Advisory Classification Rules

```text
1. Identify the exact resolved package/version.
2. Confirm the vulnerable package/feature is installed and reachable.
3. Compare against the official patched range.
4. Record “not installed/not reachable” separately from “patched”.
5. Run the exact-SHA test/build/fixture workflows after any dependency change.
6. Do not state “no vulnerabilities” from package names alone.
```

## Verification Required

```text
1. Freeze clean HEAD == origin/main.
2. pnpm install --frozen-lockfile.
3. Observe main CI Node job.
4. Observe Integrity Contracts workflow.
5. Observe Python 3.13 asset job and resolved package versions.
6. Confirm pnpm typecheck / test / skin:validate / build.
7. If a dependency or workflow file changes, restart evidence collection.
```

## Decision

```text
OPEN-ENDED PYTHON DEPENDENCIES: CLOSED
PYTHON FIXTURE CI GAP: CLOSED BY WORKFLOW DEFINITION
DEPENDENCY UPDATE MONITORING GAP: CLOSED
NODE LOCKFILE REPRODUCIBILITY: PRESENT
PYTHON HASH LOCK: OPEN
IMMUTABLE ACTION SHA PINNING: OPEN
EXACT-FINAL-SHA WORKFLOW RESULT: NOT OBSERVED
RC: LIMITED READY
```
