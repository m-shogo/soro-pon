# CI Gates

## Purpose

CI prevents implementation drift after the docs are settled.

MVP should not rely on manual memory to keep schema, engine, and import safety intact.

## Required CI Jobs

After package setup exists, add CI with:

```text
install
typecheck
test
build
```

Recommended command shape:

```text
npm ci
npm run typecheck
npm test
npm run build
```

If pnpm is chosen later:

```text
pnpm install --frozen-lockfile
pnpm typecheck
pnpm test
pnpm build
```

Use one package manager consistently.

## Required Test Suites Before UI-heavy Work

```text
schema tests
import security tests
deck validation tests
group engine tests
wildcard tests
ron/tsumo tests
scoring tests
discard preview purity tests
match reducer tests
localStorage recovery tests
```

## Golden Tests

CI should include:

```text
samples/animal-starter.deck.json strict parse
animal starter validation
animal starter basic analysis smoke
```

## Security Tests

CI must reject:

```text
imageUrl
imageBase64
filePath
blobUrl
url
src
href
html
style
script
code
function
prototype pollution keys
unknown fields
```

## Performance Smoke Tests

Do not make CI flaky with strict device timing.

Use structural performance assertions:

```text
candidate cap returns warning
wildcard branch cap returns warning
large unsafe import rejects before deep validation
primaryCandidates <= maxPrimaryCandidates
```

Optional dev-only timing logs may exist but should not fail CI unless stable.

## Lint / Format

Lint can be added after initial implementation.

Recommended gate:

```text
npm run lint
```

But avoid blocking early progress on style-only tooling before domain/schema tests exist.

## CI Report Requirements

Every work report should state:

```text
commands run
pass/fail
known skipped commands
reason skipped
```

Do not claim tests passed if CI has not run.

## Branch Protection Later

When repository is actively implemented:

```text
require CI on main
require tests before merge
avoid direct main commits for large UI changes
```

For small docs-only commits, direct main commits are acceptable while solo-developing.

## Final Decision

CI must prove the engine and import boundary before the UI looks finished.
