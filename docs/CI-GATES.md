# CI Gates

## Purpose

CI prevents schema, engine, import, UI, and skin-contract drift.

Local command success and GitHub Actions success are separate facts. Reports must not claim CI passed when no workflow run is available.

## Required Base Job

```text
pnpm install --frozen-lockfile
pnpm typecheck
pnpm test
pnpm build
```

Use one package manager consistently.

Required repository declarations:

```text
packageManager version
supported Node version/engine policy
committed lockfile
```

## Required Test Groups

```text
schema tests
import security tests
deck validation tests
group/wildcard/ron/tsumo/scoring tests
discard preview purity tests
match reducer and deterministic CPU tests
localStorage/migration/recovery tests
achievement/record idempotency tests
skin core/package tests
```

## Skin Hardening Gate

After H2, CI must run:

```bash
pnpm skin:validate
```

It must check:

```text
registry/manifest/contract schema
contract version
known skin/token/slot IDs
explicit skin-token allowlist and per-token range/type
inheritance cycles/depth
safe package-local filenames
trust-level file types
actual file existence
individual and total byte budgets
actual image dimensions
intrinsicSize consistency
slice and safe-area geometry
minimum render size
slot-specific render-mode permission
status/file consistency
candidate/final path rules
all official packages
```

A skin contract is not validated by checking slot names alone.

## Component / DOM Gate

After H8, run component/interaction tests selected through ADR.

Minimum:

```text
Button disabled/loading/state semantics
Tile selected/emphasis accessibility semantics
Modal focus entry/trap/return
Tabs keyboard navigation
SkinSelector loading/failure/default behavior
skin switch preserves screen/editor/match state
ErrorState and reset confirmation
```

Keep pure engine tests in node environment. Use a separate browser-like test environment for DOM behavior.

## Visual Regression Gate

After H9, run Playwright or the approved equivalent.

Minimum matrix:

```text
all screens at 844x390
TOP / Deck Editor / Match / Result / Collection at all five review sizes
Component Gallery in yorunoshirube and cute-pop
```

Required controls:

```text
deterministic data
fixed timestamps or masked dynamic text
disabled/reduced motion
stable font policy
accepted baseline review
```

Screenshot changes require human review; do not auto-approve broad visual diffs.

## Golden Tests

CI includes:

```text
samples/animal-starter.deck.json strict parse
animal starter validation
animal starter basic analysis smoke
all official skin packages load and resolve
base fallback remains operational
```

## Security Tests

Deck imports must reject:

```text
imageUrl / imageBase64 / filePath / blobUrl
url / src / href
html / style / script / code / function
prototype pollution keys
unknown fields
```

Skin packages must reject:

```text
unknown token IDs
structural token override by external skin
arbitrary CSS/JS/HTML
external URLs and fonts
path traversal
unapproved external SVG
unknown slots/render modes
invalid geometry and over-budget files
```

## Performance Smoke

Use structural assertions rather than flaky device timings:

```text
candidate cap returns warning
wildcard branch cap returns warning
large unsafe import rejects before deep validation
primaryCandidates <= configured maximum
skin package byte/dimension limits enforced
skin switch does not perform repeated uncontrolled fetch loops
```

## Lint / Format

Decide and record through dependency policy/ADR.

Once adopted, CI must run the configured commands. Do not leave formatting/lint rules as undocumented local conventions.

## Workflow Policy

```text
require CI before large UI merges when branch protection is enabled
avoid direct main commits for large implementation batches
small docs-only commits may remain direct while solo-developing
```

## CI Report Requirements

Every work report states:

```text
commands run locally
local pass/fail
GitHub Actions run status or unavailable
known skipped commands
reason skipped
skin/screens affected
visual baseline changed: yes/no
```

## Final Decision

CI must prove engine/import safety and the skin/UI contract. A visually correct local screen is not sufficient proof.
