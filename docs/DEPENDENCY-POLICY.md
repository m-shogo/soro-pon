# Dependency Policy

## Purpose

Keep the browser runtime, test toolchain, asset factory, and CI supply chain
small, reviewable, reproducible, and free of accidental network behavior.

## Current Runtime Stack

```text
TypeScript
React / react-dom
Vite
Zod
CSS
localStorage
```

Test/build tooling:

```text
Vitest
Testing Library
jsdom
Playwright
TypeScript
```

Asset-factory tooling:

```text
Python 3.13 in CI
Pillow
NumPy
pytest
```

## Not Allowed Without Explicit Product / ADR Work

```text
Next.js or another server framework
Supabase / Firebase / hosted backend SDK
Redux / Zustand / TanStack Query
Tailwind or another CSS framework
large animation/game framework
remote image/CDN runtime SDK
runtime plugin execution
analytics/tracking SDK
crypto/signature package without the external-skin installer design
```

## ADR Required

ADR is required before adding or replacing:

```text
state management
router
network/data-fetching client
CSS framework
animation/drag-drop framework
IndexedDB wrapper
browser/runtime image-processing package
crypto/signature library
schema/runtime-validation system
backend/cloud SDK
telemetry/analytics
```

ADR answers:

```text
why local/platform code is insufficient
runtime and bundle cost
security/privacy/network behavior
persistence/migration impact
test and CI impact
mobile performance
failure and rollback behavior
exit strategy
```

## Lock / Pin Rules

### Node

```text
commit pnpm-lock.yaml
CI uses pnpm install --frozen-lockfile
review every lockfile-only diff
packageManager and Node policy stay declared
```

The pnpm lock contains resolved versions and integrity metadata. Direct
`package.json` ranges remain compatible ranges, while the lockfile defines
the repository installation.

### Python Asset Factory

```text
top-level packages are exact-pinned in requirements.txt
CI creates an isolated Python 3.13 venv
CI runs pip check
CI runs the complete Python fixture suite
pin change requires intentional review + fixture evidence
```

Current top-level pins:

```text
Pillow 12.3.0
NumPy 2.5.1
pytest 9.1.1
```

This is not yet a hash-locked Python environment. Transitive packages and
platform wheels are still resolved by pip. A future active asset-production
phase may add generated hash constraints/lock tooling through ADR. Never invent
hashes without resolving the exact Python/platform environment.

### GitHub Actions

Main CI and Integrity workflows use:

```text
read-only repository permissions
immutable 40-character action commit SHAs
human-readable upstream release comments beside each SHA
Dependabot monitoring for GitHub Actions updates
```

An action update must:

```text
come from the expected official repository
resolve to an upstream release commit
review the release notes and diff scope
replace both the SHA and adjacent release comment
run the complete exact-SHA workflow
```

A tag name or adjacent comment is not the trust anchor; the committed SHA is.
Do not paste an unverified SHA from examples, issues, or generated text.

## Automated Update Monitoring

`.github/dependabot.yml` monitors weekly:

```text
npm/pnpm dependencies at repository root
pip dependencies in the asset factory
GitHub Actions
```

Dependabot PRs are proposals, not automatic approval. Every update runs full
CI/Integrity Contracts, and asset dependency updates must pass `pip check` and
the Python fixture job.

## Security Review

Before accepting a dependency/update:

```text
review official advisory/source information
confirm whether the vulnerable feature is actually installed/reachable
inspect lockfile resolution, not only package.json ranges
check browser/runtime network behavior
check postinstall/build scripts and native binaries
check user-data/import/image handling
check maintenance/release status and license
record skipped/inapplicable advisories precisely
```

Do not claim “no vulnerability” only because an advisory affects an adjacent
package. For example, a React Server Components advisory is not directly
reachable when no `react-server-dom-*` package or RSC framework is installed,
but the lockfile must still be checked rather than assuming from the React
version alone.

## Current Review Notes — 2026-07-25

```text
Node install is frozen by pnpm-lock.yaml.
Current Vite/Vitest resolutions are on patched versions for the advisories
reviewed during the deep integrity pass.
No react-server-dom package is present in the inspected root lock importer.
Python dependencies are exact top-level pins and CI now runs pip check.
Python transitive hashes remain open.
Main CI and Integrity action dependencies are immutable commit-SHA pinned.
Python/Node/Integrity workflow execution has not yet been observed on the final
exact SHA.
```

## Dependency Review Checklist

```text
Is it needed for current scope?
Can the platform/local code do it simply?
Does it run in production or dev/test only?
Does it touch user data, imports, storage, images, or credentials?
Does it create hidden network calls or remote code loading?
Does it materially increase bundle/native footprint?
Can it be removed later?
Are exact-SHA tests and rollback consequences documented?
```

## Final Decision

The default answer to a new dependency is no until its need and failure
boundary are proven. A version bump is complete only when its resolved artifact,
CI result, compatibility, and security scope are recorded.
