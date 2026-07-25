# Post-Batch-10 Supply-chain Review

Date: 2026-07-25  
Repository: `m-shogo/soro-pon`  
Initial result: **POLICY / CI / MONITORING FIXES COMMITTED**  
Successor closure: `docs/qa/POST-BATCH-10-RESIDUAL-CLOSURE.md`  
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

## Findings And Current Disposition

| ID | Severity | Finding | Current disposition |
|---|---|---|---|
| SCR-01 | P2 | Python asset dependencies used open-ended `>=` ranges | CLOSED: exact top-level pins |
| SCR-02 | P2 | Python fixture suite depended on a developer-created local venv and was absent from CI | CLOSED BY DEFINITION: Python 3.13 CI job; execution unobserved |
| SCR-03 | P2 | Asset Factory README claimed obsolete binary chroma-key behavior | CLOSED: wrapper/implementation roles corrected |
| SCR-04 | P2 | No dependency update monitor for npm, pip, or Actions | CLOSED: weekly Dependabot for all three |
| SCR-05 | P3 / open | Python top-level pins do not hash-lock transitive packages or wheels | OPEN: exact pins + `pip check`; generated hashes remain future work |
| SCR-06 | P3 | GitHub Actions used mutable major tags | CLOSED BY DEFINITION: Main CI/Integrity actions pinned to verified immutable release commit SHAs; execution unobserved |
| SCR-07 | P3 | Review guidance omitted Python and Actions supply-chain rules | CLOSED: dependency/CI policy synchronized |

## Node / pnpm State

The inspected committed root lockfile resolved the direct stack to:

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
versions and installed feature reachability, not only broad ranges in
`package.json`.

The inspected root importer did not contain a React Server Components runtime
package such as `react-server-dom-*`. This is relevant when classifying RSC-only
advisories; it is not a blanket statement that every React advisory is
inapplicable.

## Python Asset Factory State

`tools/asset-factory/soro-pon-ui/requirements.txt` pins:

```text
Pillow==12.3.0
numpy==2.5.1
pytest==9.1.1
```

Main CI creates a Python 3.13 virtual environment, installs those pins, runs
`pip check`, and executes the complete Python fixture suite through the existing
factory wrapper.

Remaining limit:

```text
exact top-level versions + pip check != hash-locked environment
pip may resolve transitive packages/platform wheels without committed hashes
successful workflow execution on the final SHA has not been observed
```

## GitHub Actions State

Main CI and Integrity workflows use:

```text
contents: read
per-ref concurrency cancellation
explicit job timeouts
frozen pnpm install
separate Node/integrity/Python responsibilities
immutable 40-character action commit SHAs
human-readable upstream release comments beside each SHA
```

Pinned action revisions:

```text
actions/checkout     11d5960a326750d5838078e36cf38b85af677262  # v4.4.0
pnpm/action-setup    fc06bc1257f339d1d5d8b3a19a8cae5388b55320  # v4.4.0
actions/setup-node   49933ea5288caeca8642d1e84afbd3f7d6820020  # v4.4.0
actions/setup-python a26af69be951a213d495a4c3e4e4022e16d87065  # v5.6.0
```

The repository has weekly Dependabot checks for npm/pnpm, the asset-factory pip
directory, and GitHub Actions. Dependabot PRs are review inputs, not automatic
acceptance. A proposed action update must verify the upstream repository,
release, exact commit, and complete workflow result.

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
4. Observe the 28-file / 92-definition Integrity Contracts workflow.
5. Observe Python 3.13 install, pip check, fixtures, and resolved versions.
6. Confirm pnpm typecheck / test / skin:validate / build.
7. If a dependency or workflow file changes, restart evidence collection.
```

## Decision

```text
OPEN-ENDED PYTHON DEPENDENCIES: CLOSED
PYTHON FIXTURE CI GAP: CLOSED BY WORKFLOW DEFINITION
PYTHON DEPENDENCY CONSISTENCY CHECK: DEFINED / UNOBSERVED
DEPENDENCY UPDATE MONITORING GAP: CLOSED
NODE LOCKFILE REPRODUCIBILITY: PRESENT
PYTHON HASH LOCK: OPEN
IMMUTABLE ACTION SHA PINNING: CLOSED BY WORKFLOW DEFINITION
EXACT-FINAL-SHA WORKFLOW RESULT: NOT OBSERVED
RC: LIMITED READY
```
