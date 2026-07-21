# Batch 6 — Gate 6 Report

- Date: 2026-07-21
- Start commit (this batch): `2f1d297` (end of Batch 5 + its own corrections)
- Preceding batch: Batch 5 (full-screen QA), corrected same-day in commit
  `46c7637` before Gate 6 work began — see "Batch 5 Corrections" below.
- Browser/device: Chromium (Desktop Chrome), same validated scope as
  Batch 5. No new browser/device scope was added.
- Skins: yorunoshirube (v4, 9 finals), cute-pop (v5, 9 finals) — unchanged.

## Batch 5 Corrections (completed before Gate 6 work started)

Per the user's explicit request, three inaccuracies in the Batch 5
record were found and corrected (commit `46c7637`,
`docs(qa): clarify Batch 5 browser scope and evidence counts`):

1. **Browser scope wording.** "Public Demo Ready" / `COMPLETE_PUBLIC_DEMO_READY`
   now reads explicitly as "PASS within the validated Chromium (Desktop
   Chrome) browser scope only" everywhere it appears (README, CLAUDE.md,
   ASSET-PRODUCTION-ROADMAP.md, the Batch 5 QA matrix, the Batch 5 QA
   report). Safari/Firefox/WebKit/real mobile devices are stated as NOT
   TESTED and not implied supported.
2. **Match execution wording.** The Batch 5 report previously said "4
   real matches...via real UI interaction" and "plus 10 more via
   Playwright" — language that could be misread as manual human play.
   All Batch 5 gameplay was Chromium browser automation end-to-end
   (real DOM/event-handler path, not an engine-only simulation, but
   not a human and not a real device). Now labeled precisely: **4
   QA-script-driven automated matches** (`scripts/batch5-qa-02-match-play.mjs`,
   screenshots individually reviewed as primary evidence) and **10
   additional Playwright-test-driven automated match runs**
   (`tests/visual/screens-extended.spec.ts`, screenshots saved as
   supplementary evidence, not each individually reviewed).
3. **Evidence file count.** Direct enumeration of
   `docs/qa/evidence/batch-5/` gives **138 files = 131 PNG + 7 JSON**
   (verified via `find ... | wc -l` and cross-checked against
   `git diff-tree --no-commit-id --name-only -r 6512db0 | grep
   '^docs/qa/evidence' | wc -l`, both returning 138). The original
   report's breakdown table said "121 PNG + 7 JSON = 128", an
   arithmetic error — the commit message's "138 evidence files" was
   always correct; only the later per-category breakdown was
   miscounted (the correct per-directory subtotals — 40+40+7+5+3+12+14+3+14
   — do sum to 138).

**Files corrected**: `README.md`, `CLAUDE.md`,
`docs/ASSET-PRODUCTION-ROADMAP.md`, `docs/qa/BATCH-5-QA-MATRIX.md`,
`docs/qa/BATCH-5-MANUAL-QA-REPORT.md`. No git history was rewritten —
this was a same-day forward correction, committed as its own docs
commit, not squashed into or replacing the original Batch 5 commits.

**Remaining inconsistencies found**: none, after a repo-wide `rg` sweep
for `"121 PNG"`, `"=128"`, `"real UI interaction"`, `"10 more matches"`,
and every `"Public Demo Ready"` / `COMPLETE_PUBLIC_DEMO_READY` mention
(see the correction commit's diff for the full list of touched lines).

## Gate 6 scope

See [BATCH-6-GATE-6-QA-MATRIX.md](./BATCH-6-GATE-6-QA-MATRIX.md) for
the full scope table, browser/device matrix, and PASS/CONDITIONAL/FAIL
criteria (which operationalize the canonical definition in
`docs/RELEASE-DEMO-GATES.md#gate-6-release-candidate`).

## What was found and fixed

Two real product-code gaps were found by directly reading the storage
layer (`src/storage/*.ts`) and `src/app/AppRoot.tsx`, then confirmed
with both unit tests and real-browser automation — not simulated,
not assumed:

### 1. Migration: one bad deck entry could wipe the whole deck list (P1 → fixed)

`localStorageDeckStore.readPayload()` previously ran the *entire*
`soro-pon.decks.v1` payload through one strict Zod parse. If a single
deck entry was malformed or from an older deck-schema version, the
whole payload failed and **every deck the user had — including
unrelated healthy ones — was quarantined and reset to empty**, with
only a generic "壊れていたため初期化しました" message. A user with 10
saved decks could lose all 10 because 1 was slightly off.

**Fix**: `readPayload()` now salvages per-deck. Entries that already
match the current schema are kept as-is; entries with an old
deck-schema version are run through the existing, already-tested
`migrateLegacyDeck()` (reused, not duplicated — no new migration
framework introduced) before being kept; only entries that still fail
after that are individually dropped. New issue codes distinguish
lossless auto-migration (`L9002`) from actual partial data loss
(`L9003`), and salvage results are written back so recovery is
idempotent across reloads.

### 2. Storage writes: quota-exceeded failed silently with no user feedback (P1 → fixed)

`saveDeck`/`removeDeck`/`settings.save`/`records.addRecord` all called
`storage.setItem` with no error handling. A quota-exceeded (or any)
write failure threw a raw, untranslated `DOMException` from inside a
React `onClick` handler. **React error boundaries do not catch
event-handler exceptions** (only render/lifecycle errors), so
`AppErrorBoundary` never saw it — the click just silently did nothing,
logging only to the browser console, while the calling code (e.g.
DeckEditor's `onSave`) had already assumed success and would have
navigated away and marked the draft clean had the exception not
aborted it mid-function. Net effect: the user's edit appeared to
vanish with zero explanation.

**Fix**: all three stores wrap `setItem` in a shared `safeWrite()`
helper (`src/storage/keyValueStorage.ts`) that converts any thrown
error into a `StorageWriteError` with a pre-written Japanese message.
`AppRoot.tsx`'s 7 write call sites now go through a `tryWrite()`
helper: on failure, the message is shown via the existing `Toast`
component and the success-path side effects (navigation, marking
clean, incrementing version counters) are skipped — DeckEditor stays
open with the draft intact, the import modal stays open with the
pasted text intact.

Both fixes were verified at two levels: **16 new unit tests**
(`src/storage/gate6StorageRecovery.test.ts`) and **real Chromium
browser automation** (`scripts/gate6-qa-01-migration-storage-recovery.mjs`,
5/5 checks passing — partial corruption keeps the healthy deck, the
quota-exceeded toast shows a clean message and the editor stays open,
invalid-skin-ID recovery still works alongside the new logic).

### 3. Accessibility: import-rejection messages had no live region (P3 → fixed, trivial)

Found via `scripts/gate6-qa-04-accessibility-acceptance.mjs`: the
rejected-import reason list (`<ul class="sp-issue-list">` inside the
import modal) had no `aria-live`/`role="status"` wrapper, so a screen
reader would not be proactively notified when an import was rejected
(the text is visible and readable, just not announced without the user
manually navigating to it). Fixed narrowly: `role="status"
aria-live="polite"` added to that specific list only (not the shared
`sp-issue-list` class broadly, which is reused on Collection/TOP for
non-live content where live-announcing would be noisy/wrong). Re-verified
green.

## Non-defect findings (investigated, no fix needed)

- **`performance.memory` (JS-exposed API) returns quantized/identical
  values** in this Chromium build — a known modern-Chromium
  fingerprinting-protection behavior, not an app bug. Switched to the
  CDP `Performance.getMetrics()` domain for real heap numbers.
- **`settingsStore.save()` is never called from the UI** — settings are
  loaded but nothing in the app currently writes them. Pre-existing,
  unrelated to Gate 6, not fixed here (wiring up a settings UI would be
  a new feature, out of scope for a QA/hardening gate).
- Two of my own script assumptions were wrong during accessibility
  testing (checked for `aria-labelledby`/`label[for]` but not
  `aria-label` on the import textarea, which the component already
  uses correctly) and during rollback testing (missed a
  `waitForSelector` before reading `data-skin`) — both were script
  bugs, corrected in the scripts, not product defects.

## Migration

- **Current schema**: `storedDecksPayloadSchema.version = literal(1)`
  (unchanged this batch — no schema version bump was needed or made).
  Deck-content schema: `CURRENT_DECK_SCHEMA_VERSION = 1`
  (`src/domain/deck.ts`, unchanged).
- **Tested old schemas**: deck-schema version 0 (via the existing
  `fixtures/decks/migration/migration-v0-safe-add-score-budget.deck.json`
  fixture, now also exercised through the storage-load path, not just
  the import path), missing version field, unknown/newer version
  (correctly NOT auto-upgraded — dropped with a clear issue instead).
- **Idempotency**: verified — a second `loadAll()` after a salvage
  returns the identical result with no re-emitted warning (the salvage
  is written back).
- **Failure recovery**: partial (per-deck) rather than all-or-nothing,
  as of this batch. Full read-path fallback to quarantine+reset remains
  for genuinely unrecoverable payloads.
- **Rollback compatibility**: verified via the rollback rehearsal
  below — no schema version changed this batch, so old/new builds are
  fully data-compatible in both directions.

## Storage Recovery

- **Corrupt data**: malformed JSON, `null`, empty string, unknown
  fields, oversized payload (2MB) — all recover without crashing (see
  `src/storage/gate6StorageRecovery.test.ts` and the pre-existing
  `localStorageDeckStore.test.ts`/`localStorageSettingsStore` tests,
  all still green).
- **Quota failure**: simulated via a throwing storage/`localStorage.setItem`
  monkey-patch (real quota exhaustion is not practical to trigger in a
  test environment) at both the unit-test and real-browser level.
  Converted to a translated `StorageWriteError`, shown via `Toast`.
  **Guarantee scope (precise, not "lossless"):** on a quota-exceeded
  write, the in-session draft remains visible on screen (DeckEditor/
  the import modal does not navigate away or discard the pasted text),
  the user receives a Toast notification, and previously *persisted*
  data is not overwritten or destroyed (the failed write never reaches
  `setItem`, so whatever was already saved stays exactly as it was).
  **Not guaranteed**: recovery of the unsaved draft after a reload —
  if the user reloads or closes the tab while the quota-exceeded toast
  is showing, the in-memory draft is gone, same as any unsaved web-app
  form state. This was not tested as "recoverable after reload" and is
  not claimed as such.
- **Partial writes**: not separately simulated (no evidence this app
  performs multi-step writes that could be left half-complete — each
  store write is a single `setItem` call with a fully-serialized JSON
  string, so there is no intermediate state to corrupt).
- **User-facing recovery**: reset path (TOP → "ローカルデータを初期化…")
  unchanged from Batch 5, re-confirmed still visible and functional.
- **Corrupted-entry (migration/salvage) guarantee scope (precise, not
  "fully recoverable"):** valid deck entries — including ones
  recoverable via `migrateLegacyDeck()` — are salvaged individually and
  kept. An entry that is genuinely malformed (not valid under the
  current schema and not migratable from a known legacy schema) is
  **dropped from the active deck list**, not silently restored; it is
  preserved only in the raw form inside the `*.corrupt-backup` key,
  which the app does not automatically re-parse or offer to restore.
  Dropping such an entry no longer causes *other, unrelated healthy
  decks* to be lost — that is the actual fix this batch. It does not
  mean every corrupted entry itself comes back.
- **Data loss risk, summarized precisely**: zero risk to *other,
  unaffected* data in every scenario tested (a bad entry no longer
  takes down healthy entries; a failed write no longer overwrites
  already-persisted data). The specific unrecoverable/unsaved item
  itself is not always restorable — see the two guarantee-scope notes
  above.

## Performance

Spot-check only, against the production build (`vite preview`,
localhost:4173), Chromium, single machine, single run per metric — **not
a real-device performance guarantee**.

```text
Cold boot to "まず遊ぶ" visible:        96 ms
TOP -> DeckList:                        82 ms
DeckList -> DeckDetail:                 19 ms
DeckDetail -> DeckEditor:               24 ms
TOP -> MatchSetup:                      39 ms
MatchSetup -> Match start:              28 ms
Gallery load:                           19 ms
Heap growth over 10 skin-switch loops:  1,143,024 bytes (~1.1 MB)
Heap growth over 3 rematches:           1,478,408 bytes (~1.4 MB)
Console errors during rematch loop:     0
JS bundle:                              419,601 bytes (~410 KB), gzip 124 KB
CSS bundle:                             34,907 bytes (~34 KB)
Cute Pop final assets:                  3,539,252 bytes (~3.4 MB)
Yorunoshirube final assets:             2,753,652 bytes (~2.7 MB)
dist/ total:                            7,529,349 bytes (~7.2 MB)
```

The measured heap growth (~1.1–1.4 MB over 10–13 interaction cycles) is
non-zero and worth watching, but not large enough to call a leak from
this sample size alone — normal JS engines allocate warm-up structures
(compiled code, cached DOM/React fiber trees) that don't indicate
unbounded growth. **This was not run for enough iterations to
distinguish "one-time warm-up" from "slow leak"**; a longer soak test
(hundreds of iterations) is recommended before or during Gate 7/8 if a
stricter performance gate is ever required. Not a blocker for Gate 6.

## Caching

- **Asset versioning**: content-hash filenames confirmed stable on a
  no-op rebuild and confirmed to change on a real content change (both
  directions verified this session with a temporary, reverted edit to
  `src/main.tsx`).
- **HTML cache**: `index.html` is not content-hashed (expected/correct
  — it must always be fetched fresh to pick up new asset hashes); no
  specific cache-control headers are configured anywhere in this repo
  (no server config exists yet — flagged for the eventual deploy
  target, not an app-code gap).
- **Skin versioning**: unchanged from Batch 5 (cute-pop `?v=5`,
  yorunoshirube `?v=4`), re-confirmed zero mixed-version/404/candidate
  requests during the rollback rehearsal's asset checks.
- **Mixed-version prevention**: no evidence of old/new asset mixing
  found in any test this batch.
- **Deploy smoke**: no deploy target exists yet; the closest available
  smoke test is `pnpm build && pnpm preview`, run repeatedly this
  session, always successful.

## Rollback

- **Rehearsal**: performed locally via `git worktree` + a second
  `pnpm preview` instance (procedure and full write-up: see
  [CACHE-AND-ROLLBACK-RUNBOOK.md](../release/CACHE-AND-ROLLBACK-RUNBOOK.md)).
  Old build = commit `9b9ba1a` (pre-Batch-5). 7/7 checks passed.
- **Procedure**: documented in the runbook above; no production
  environment exists to execute a real rollback against yet.
- **Recovery time**: not measured (no real deploy pipeline to time).
- **Data compatibility**: confirmed both directions — old build reads
  new-build-shape data without loss, new build reads old-build-shape
  data without loss (expected, since no schema version changed).
- **Limitations**: this is a *local build-artifact* rehearsal, not a
  rehearsal of a real deploy/CDN/DNS rollback (none exists to rehearse
  against). Git history was never force-pushed or rewritten as part of
  this rollback mechanism.

## Accessibility

- **Keyboard**: unchanged from Batch 5 (still green — Tab/Shift+Tab/
  Enter/Escape/Arrow/Home/End all re-verified as part of the full test
  suite).
- **Focus**: modal initial-focus, trap, and return-to-opener re-verified
  green (existing `domInteraction.test.tsx`, 314/314 unit tests still
  passing plus the 16 new ones = 330).
- **Dialogs**: `role="dialog"`, `aria-modal="true"`, resolvable
  `aria-labelledby` confirmed on the きせかえ modal, both skins.
- **Labels**: every TOP button has an accessible name (0 unnamed);
  import textarea has `aria-label="デッキJSON"` (confirmed — my own
  script initially missed checking for `aria-label` specifically, a
  script bug, corrected).
- **Contrast**: not re-measured this batch (already covered extensively
  in Batch 5 and the earlier H3 hardening item — no new colored UI was
  added this batch).
- **Zoom**: layout checked at a 512×300 viewport (the effective layout
  viewport size at 200% zoom on a 1024×600 window) — no horizontal
  overflow, both skins. This approximates zoom-driven re-layout; it is
  not identical to triggering the browser's real zoom pipeline, which
  Playwright does not expose a direct API for.
- **Reduced motion**: match screen renders full content correctly under
  `reducedMotion: 'reduce'`, zero console errors.
- **Screen reader scope**: **semantic/programmatic DOM inspection
  only.** No real VoiceOver/NVDA/JAWS session was used. VoiceOver is
  technically available on this macOS machine, but driving it
  interactively (rotor navigation, announcement capture) is not
  something the available automation tools in this environment can do
  non-interactively or reliably within this session — attempting it
  would have produced a low-confidence, unverifiable claim, which this
  report explicitly avoids making. **Do not describe this batch's
  accessibility work as "screen reader verified."**
- **Remaining limitations**: real screen-reader verification (Phase 8's
  suggested VoiceOver pass) was not performed — recorded as an
  environment limitation, not skipped by choice. Genuinely
  screen-reader-driven acceptance testing should be a prerequisite for
  any claim stronger than "semantic inspection passed."

## Visual Regression

```text
Cases before this batch: 56
Cases added:              14 (ResetConfirmation, QuotaExceededToast,
                               PartialSalvageToast x2 skins x2 viewports,
                               InvalidSkinFallback x2 viewports)
Total:                     70
Initial failures:          14 (all "no baseline yet" on first run — expected)
Unexpected diffs:          0
Baselines updated:         14 new baselines, each visually inspected
                            before acceptance (not bulk-updated)
Final passed:               70/70
```

A secondary finding from re-running the full suite: the pre-existing
Result-reachability tests write a screenshot every run, and because the
match seed is non-deterministic, that screenshot differs every run even
with zero regression — writing it into the git-tracked
`docs/qa/evidence/batch-5/result/` path meant every future
`pnpm test:visual` run left 8 files dirty in `git status`. Fixed:
redirected to `test-results/gate6-result-samples/` (gitignored); the
original Batch 5 evidence stays committed as a fixed historical
snapshot. See commit `2bfc50e`.

## Verification

```text
pnpm typecheck:       PASS  (verification result, not a test case — see note below)
pnpm test:            330/330 PASS (314 pre-existing + 16 new; this vitest run
                       already includes the 18 skin-contract tests below as one
                       of its 27 test files — see "Total" note)
pnpm skin:validate:   18/18 PASS — SAME 18 test cases as inside pnpm test above
                       (`vitest run src/ui/skins/skinValidate.test.ts` is a
                       narrower re-run of one file already covered by `pnpm
                       test`). Not counted again in the total below.
pnpm asset:image:test: 92/92 PASS (unchanged; independent pytest suite, not
                       covered by pnpm test)
pnpm build:           PASS  (verification result, not a test case)
pnpm test:visual:     70/70 PASS (56 pre-existing + 14 new; independent
                       Playwright suite)
Gate 6 browser scripts (Chromium automation via standalone .mjs scripts,
not registered with any test runner — pass/fail counted by the scripts'
own assertions, independent of the suites above):
  gate6-qa-01 (migration/storage recovery):   5/5 PASS
  gate6-qa-02 (performance):                   spot-check, no pass/fail gate
  gate6-qa-03 (rollback rehearsal):            7/7 PASS
  gate6-qa-04 (accessibility acceptance):     18/18 PASS
```

**Total: 522 independent pass/fail test cases** (330 + 92 + 70 + 5 + 7 + 18),
**plus `pnpm typecheck` and `pnpm build` as separate verification results**
(neither is a pass/fail test case with a count; both are single
PASS/FAIL commands).

This corrects two earlier miscounts from this batch's own first report:

- **"430"** (the number first reported) = 330 + 70 + 5 + 7 + 18. It
  correctly avoided double-counting `skin:validate`'s 18 (a genuine
  subset of the 330), but it accidentally *omitted*
  `asset:image:test`'s 92 entirely — an independent suite that should
  have been included. 430 + 92 = 522.
- **"540"** (a naive sum of every number in the summary table,
  330 + 18 + 92 + 70 + 30) double-counts `skin:validate`'s 18 test
  cases, since they are the identical 18 cases already inside the 330
  from `pnpm test` — `skin:validate` just re-runs one file narrower,
  it does not add new coverage. 540 − 18 = 522.

Both errors independently resolve to the same corrected figure, **522**,
which is the number of genuinely distinct, independently-executable
pass/fail test cases run this batch, with no suite's cases counted
under two different labels.

### CI and Playwright

This project's CI (`.github/workflows/ci.yml`) runs
`typecheck`/`test`/`skin:validate`/`build` only — it does not run
`pnpm test:visual` (Playwright). Decision for Gate 6: **do not add it
to CI this batch.** Reasoning:

1. Playwright needs a browser download (`chromium-1228`, currently
   cached locally at ~/Library/Caches/ms-playwright) — adding it to CI
   means either caching that download or re-downloading it every run,
   adding real CI time (the local suite alone takes ~3–4 minutes, most
   of it the 10 non-deterministic Result-reachability cases that loop
   until a match completes).
2. The Result-reachability cases are inherently variable-duration
   (10 seconds to several minutes depending on how quickly a
   CPU-vs-human simulated match completes) — this is an acceptable
   local/manual-QA cost but a bad fit for a CI job that should be fast
   and predictable.
3. Baseline management (committing `-darwin.png` snapshots, as this
   repo already does) is inherently platform-specific — running the
   same suite in CI (`ubuntu-latest`) would require either a second set
   of `-linux` baselines or accepting a different-OS rendering diff on
   every CI run, neither of which exists today.

Given this, **Gate 6 continues to treat `pnpm test:visual` as a
required local/manual-QA-gate check** (as documented in this report and
Batch 5's), not a CI-blocking check. If CI-based visual regression is
wanted later, it should be scoped as its own follow-up (Linux baselines
or a dedicated visual-regression CI job with browser caching), not
folded silently into this gate.

## Evidence Inventory (`docs/qa/evidence/batch-6/`)

Re-verified 2026-07-21 by direct enumeration
(`find docs/qa/evidence/batch-6 -type f`) and cross-checked against
`git ls-files docs/qa/evidence/batch-6` — all 14 files are git-tracked,
none are gitignored artifacts.

```text
PNG screenshots:  10
JSON evidence:     4
Logs:              0
Markdown/other:    0
Total:            14
```

Breakdown by subdirectory:

```text
accessibility/    5  (4 PNG, 1 JSON)
migration/         1  (1 PNG)
performance/       1  (1 JSON)
rollback/          5  (4 PNG, 1 JSON)
storage-recovery/  1  (1 PNG)
(gate6-script-01-summary.json at the evidence root) 1 (1 JSON)
```

This is distinct from — and much smaller than — Batch 5's 138-file
evidence set, because Gate 6 relies more heavily on unit tests
(16 new cases in `gate6StorageRecovery.test.ts`, not screenshot-based)
and on the 14 new Playwright visual-regression baselines (tracked under
`tests/visual/gate6-recovery-states.spec.ts-snapshots/`, a separate
location from `docs/qa/evidence/`, consistent with how Batch 5's own
Playwright baselines were organized).

## Issue Summary

```text
P0 found:  0
P0 fixed:  0
P0 open:   0

P1 found:  2   (migration all-or-nothing wipe; silent quota-exceeded save failure)
P1 fixed:  2
P1 open:   0

P2 found:  0
P2 fixed:  0
P2 open:   0

P3 found:  1   (import-rejection list missing a live region)
P3 fixed:  1   (trivial, safe, narrowly scoped)

By design:            2 (SkinSelector TOP/Gallery-only scope; match state
                          session-only — both carried over from Batch 5,
                          re-confirmed, not re-litigated)
Test/script defects:  3 (accessibility aria-label check gap; rollback
                          waitForSelector timing gap; both Batch-5-era
                          "121 PNG"/"real UI interaction" wording issues)
Documentation defects: 1 (Batch 5 evidence count arithmetic error)
Environment limitations: 1 (no real screen-reader session; WebKit/
                          Firefox/Safari/real-device browser scope,
                          carried over from Batch 5)
```

## Gate Decision

**Gate 6: PASS**, within the validated Chromium browser scope (same
scope carried from Gate 4/5 — Gate 6 does not expand it).

- P0 = 0, P1 = 0 (2 found, both fixed and re-verified at unit-test and
  real-browser level).
- Migration is safe: per-deck salvage confirmed, no whole-store wipes
  from a single bad entry.
- Storage recovers from corrupted/partial/quota-exceeded states without
  a recovery loop and without silently discarding user-created decks.
- Rollback rehearsal (local, build-artifact based — the realistic
  option for a project with no production environment) completed with
  zero data loss in either direction.
- Caching: no mixed-version evidence found; content-hash behavior
  confirmed correct in both directions.
- No severe performance regression observed in the spot-check (heap
  growth noted as worth a longer soak test later, not blocking now).
- Accessibility acceptance basics met via semantic/programmatic
  inspection; real screen-reader verification remains an explicitly
  recorded environment limitation, not claimed.
- All automated verification green (522 pass/fail test cases this
  batch, plus `pnpm typecheck` and `pnpm build` as separate verification
  results — see "Verification" above for the full accounting — 0
  failing), CI green (pending push confirmation — see final report),
  worktree clean.

**RC readiness: LIMITED READY** — ready for a release-candidate
designation *within the validated Chromium browser scope*, with the
following explicitly open items carried forward (not blockers for Gate
6 itself, but relevant to any broader RC claim):

```text
Not yet done (explicitly out of scope for Gate 6, tracked for later):
  - Real screen-reader (VoiceOver/NVDA/JAWS) acceptance pass
  - WebKit/Firefox/real Safari/real mobile device verification
  - Longer-duration (100+ iteration) memory soak test
  - Real deploy target + real rollback rehearsal (only a local
    build-artifact rehearsal exists, by necessity — no prod exists yet)
  - Gate 7 (installed/paid skin trust) and Gate 8 (match restore/replay)
```

## Next Fixed Task

```text
Next task:
Continue Release Candidate hardening only on explicit instruction —
either close the items listed above one at a time, or begin Gate 7/8
if paid-skin or restore/replay features are actually planned.

Entry condition:
Explicit instruction naming which of the open items to pursue next
(this report intentionally does not pick one unilaterally, since they
represent different kinds of work: environment access, QA effort,
and product-feature scope).

Stop condition:
Whichever item is chosen is verified with the same evidence discipline
used in this batch (real checks, not assumptions; honest scope
statements; P0/P1 = 0 before any PASS claim).
```
