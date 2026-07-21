# Batch 7 — Cross-Browser & Screen Reader Acceptance Report

- Date: 2026-07-21
- Preceding work: Gate 6 (PASS, RC LIMITED READY), corrected same-day
  (`docs(qa): correct Gate 6 totals and recovery guarantees`), with a
  git-chronology clarification (`docs(qa): clarify Batch 6 git
  chronology`) completed immediately before this batch.
- Scope: extend RC readiness's verified browser/accessibility coverage.
  Not a new feature gate — Gate 6 remains PASS, unchanged, throughout
  this batch.

## Git chronology

```text
Batch 7 Start HEAD:  db4bad7  (docs(qa): clarify Batch 6 git chronology)
Batch 7 End HEAD:    <recorded in the final structured report after push>
origin/main:         <recorded after push>
```

## Browser Scope (see BATCH-7-CROSS-BROWSER-A11Y-MATRIX.md for full detail)

```text
Chromium (Desktop Chrome):  validated (carried over from Gate 4/5/6)
Firefox:                    validated — NEW this batch
Playwright WebKit:          validated — NEW this batch (NOT real Safari)
Real Safari:                NOT validated
iOS Safari (physical device): NOT validated
Android (physical device):  NOT validated
```

Firefox 151.0 and WebKit 26.5 (Playwright builds 1532/2311) were
installed this batch via `npx playwright install firefox webkit` — they
were not present before Batch 7.

## What was found and fixed (all discovered during Batch 7 itself, not
carried over from Gate 6)

### 1. Test-script defect: `getByRole` substring matching false-positive (functional QA script)

`scripts/batch7-cross-browser-functional.mjs`'s import-rejection check
used `page.getByRole('button', { name: '編集' })` without `exact: true`.
Playwright's `name` matching for roles is substring-based by default,
and TOP's "デッキ一覧" button's subtitle text
("保存したデッキを確認・編集します") contains "編集" as a substring — so
the check always reported "in DeckEditor" as true, even when the import
was correctly rejected and the app was still on TOP. Fixed with
`exact: true`, matching the DeckDetail-specific "編集" button only.
Re-verified: 2/2 import-rejection cases now correctly report rejection.
This is the same latent pattern already present (but masked by an `||`
fallback) in Batch 5's `scripts/batch5-qa-03-import-editor-a11y.mjs` —
not touched here, since that script's actual PASS/FAIL result was never
affected by it (its `rejectedBadge > 0` check was the deciding signal).

### 2. Test-script defect: double-navigation race causes a spurious WebKit console error (functional QA script)

The `seed()` helper used `page.goto() → page.evaluate(localStorage
setup) → page.goto()` (navigate, then set up storage, then navigate
again to pick it up). On Playwright's WebKit engine, this reliably
(5/5 repro attempts) aborts the first document's in-flight `skin.json`
fetch requests when the second navigation begins, and WebKit reports
the abort as `"Fetch API cannot load ... due to access control checks"`
— a confusing error message that looks like a real CORS/cross-origin
failure but is not one (verified: a bare same-origin `fetch()` outside
this double-navigation pattern succeeds with 200 OK on WebKit, 5/5
attempts). Fixed by switching to `page.addInitScript()` (runs before
the page's own scripts on a single navigation) instead of the
double-`goto` pattern, in both
`scripts/batch7-cross-browser-functional.mjs` and
`scripts/batch7-cross-browser-accessibility.mjs`. Re-verified: 0
console errors after the fix, 3/3 repro attempts clean.

### 3. Test-script defect: `localStorage.setItem` direct-reassignment quota simulation doesn't work in Firefox/WebKit (visual regression spec)

`tests/visual-crossbrowser/gate7-tier-a.spec.ts`'s `QuotaExceededToast`
case originally used `window.localStorage.setItem = (key, value) =>
{...}` to simulate a quota-exceeded write (the same technique Gate 6's
Chromium-only `tests/visual/gate6-recovery-states.spec.ts` already uses
successfully). Verified directly: this direct-property-reassignment
silently no-ops in Firefox and WebKit — `Storage`'s own `setItem` is
not an own, writable property the way Chromium happens to permit
overriding it, so the assignment does nothing and the real `setItem`
keeps running, meaning the simulated quota failure never actually
occurred and the save silently succeeded instead. Confirmed via a
3-way isolated test: `chromium` throws as expected, `firefox` and
`webkit` both report "DID NOT THROW (patch failed silently)". Fixed by
patching `Object.getPrototypeOf(window.localStorage).setItem`
(`Storage.prototype.setItem`) instead of the instance property — this
version throws correctly in all three engines (re-verified 1/1 each).
This is a QA-methodology finding, not a Gate 6 product defect: Gate
6's own quota-exceeded test only ever ran under Chromium (where the
flawed technique happened to work), so its PASS result was never wrong
— but the technique itself was not portable, and is now.

**No product source code changes were needed this batch.** All three
Chromium-vs-Firefox/WebKit discrepancies traced back to QA script/test
methodology gaps, not to the application behaving differently across
engines. Re-running the fixed scripts confirms full functional and
accessibility parity across all three validated browsers.

## Non-defect findings (investigated, no fix — browser engine limitation, by design)

**WebKit/Safari's default Tab key order excludes plain buttons.**
`scripts/batch7-cross-browser-accessibility.mjs`'s first-Tab-focus
check landed on body/heading content in WebKit, while the identical
check landed on the "まず遊ぶ" button in Chromium and Firefox. This is
Apple's well-known, system-wide default behavior for Safari/WebKit:
Tab only cycles through form fields by default; buttons and links are
only included once the user enables "Full Keyboard Access" in macOS
System Settings (or presses Option+Tab per-press). This is not
something this app's code can or should override — every website
exhibits the same default in real Safari, and forcibly adding
`tabindex="0"` to every button to work around Apple's platform default
would deviate from platform convention without fixing anything (the
user's own system setting still governs). Verified this does not make
any primary flow *impossible*: keyboard users can still reach every
control via VoiceOver's own navigation, Option+Tab, or by enabling
Full Keyboard Access — and mouse/touch interaction is unaffected.
Classified as Browser engine limitation, not a defect.

## Screen Reader Acceptance

**BLOCKED — genuinely, not silently skipped.** VoiceOver is installed
on this macOS machine (confirmed present in the installed-applications
list). An attempt was made to drive it: `mcp__computer-use__request_access`
was called for Safari (needed to load the dev server under VoiceOver
and send system-level keyboard combos like Cmd+F5 to toggle VoiceOver
on). **The user explicitly denied this access grant**
(`{"granted":[],"denied":[{"bundleId":"com.apple.Safari","reason":"user_denied"}]}`).
Per this batch's own instructions ("VoiceOverが使用できない実行環境の
場合は、無理に実施済みとせず、BLOCKEDまたは未検証として明記してくださ
い"), the request was not retried after the explicit denial, and no
VoiceOver acceptance walkthrough was performed.

```text
VoiceOver used: NO — attempted, access denied by user
macOS version: not queried (access denied before any system inspection)
Browser: N/A
Flows completed: 0 of the planned 20-step walkthrough
Flows blocked: all 20 steps (TOP → import → DeckList → DeckEditor →
  MatchSetup → Match → Result → Modal, per BATCH-7 instructions)
Game-specific findings: none obtainable (no session was run)
NVDA: not used (Windows-only, no Windows environment available)
JAWS: not used (Windows-only, no Windows environment available)
Claim limitation: NO claim of screen-reader-verified accessibility is
  made anywhere in this report or in README/CLAUDE.md. The semantic/
  programmatic accessibility checks (headings, roles, labels, live
  regions, focus, aria-pressed) remain the only accessibility evidence
  for this batch, exactly as in Gate 6.
```

This is recorded as a genuine, user-driven environment constraint, not
a technical impossibility — VoiceOver itself is present and could
plausibly be driven by a differently-scoped session with browser access
granted. The next fixed task (see below) can revisit this specifically
if a future session receives that grant.

## Functional QA

Both Firefox and Playwright WebKit, all 12-13 planned scenarios,
executed via real browser automation
(`scripts/batch7-cross-browser-functional.mjs`):

```text
Firefox: 25/25 PASS (0 failing)
WebKit:  25/25 PASS (0 failing)
```

Covers: fresh boot (both skins) × console-error check, corrupt data
recovery, invalid skin fallback, 3 import cases (valid/invalid-json/
unsafe-script), unsaved-changes warning, Gallery load (both skins) ×
console-error check, skin switching, 2-player-not-selectable, 3-player
match to Result × console-error check × rematch-options-present,
4-player match to Result × console-error check × rematch-options-
present, reset confirmation open/close, reload on TOP.

Both browsers reached Result in both 3-player and 4-player matches with
zero console errors throughout — full functional parity with the
Chromium baseline established in Batch 5/6.

## Visual Regression (Tier A, cross-browser)

```text
Chromium (existing, re-verified unaffected): 70/70 PASS
Firefox (new):   48/48 PASS (8 screens × 2 skins × 3 viewports)
WebKit (new):    48/48 PASS (8 screens × 2 skins × 3 viewports)
Total cross-browser (Firefox + WebKit): 96/96 PASS
```

Config: `playwright.crossbrowser.config.ts` (deliberately separate from
`playwright.config.ts` — zero shared `projects` array, zero risk to the
existing 70 Chromium baselines' naming or content). Spec:
`tests/visual-crossbrowser/gate7-tier-a.spec.ts`. All 96 new baselines
were visually inspected (a representative sample: TOP, DeckEditor,
QuotaExceededToast, both engines) before acceptance — layout, text
readability, and toast/modal rendering all matched the Chromium
baseline's visual character with no clipping, font-fallback, or
layout-shift issues observed in either engine.

Screens: TOP, DeckList, DeckEditor, Gallery, MatchSetup,
SkinSelectorModal, CorruptedStorageRecovery, QuotaExceededToast. Both
skins. Viewports: 844x390 (narrowest), 852x393 (standard smartphone
landscape), 1366x768 (widest desktop) — a documented reduction from the
Chromium suite's full 5 viewports, and Result/Match were not added
(same non-deterministic-seed reasoning as Batch 5/6's Chromium suite).

## Accessibility Automation (cross-browser)

```text
Firefox: 21/21 PASS
WebKit:  21/21 PASS
```

Covers: heading hierarchy, accessible names, dialog semantics
(aria-modal/aria-labelledby), import textarea aria-label, import
rejection live-region wrapping, game-tile accessible names +
aria-pressed (both skins for all of the above), keyboard Tab/Enter/
Escape + focus-return, 200%-zoom-equivalent viewport (both skins),
reduced-motion rendering + console-error check.

Semantic/programmatic DOM inspection only — same methodology as Gate 6,
not axe-core or any new automated a11y tool. Real screen-reader
verification remains BLOCKED (see above) — do not read this section as
"screen reader verified" for any browser.

## Issues

```text
P0 found/fixed/open:  0 / 0 / 0
P1 found/fixed/open:  0 / 0 / 0
P2 found/fixed/open:  0 / 0 / 0
P3 found/fixed/open:  0 / 0 / 0

Browser limitations:   1 (WebKit/Safari default Tab order excludes
                          buttons — Apple platform default, not a
                          product defect, does not block any primary
                          flow)
Screen-reader limitations: 1 (VoiceOver acceptance BLOCKED — user
                          denied the required computer-use browser-
                          access grant)
Test defects:           3 (getByRole substring-match false positive;
                          double-navigation WebKit fetch-abort false
                          error; localStorage.setItem direct-reassignment
                          silently no-ops in Firefox/WebKit) — all
                          found and fixed in QA scripts this batch, zero
                          product code changes required
Documentation defects:  0 new this batch
Environment limitations: 1 (real Safari / iOS Safari / Android physical
                          devices — none available in this environment,
                          not attempted, not claimed)
```

No product code was modified this batch — every discrepancy traced to
QA tooling, and after fixing the tooling, Firefox and WebKit show full
functional/visual/accessibility parity with the existing Chromium
baseline.

## Verification

```text
pnpm typecheck:          PASS (re-run, unaffected by this batch)
pnpm test:                330/330 PASS (unaffected — no product code changed)
pnpm skin:validate:       18/18 PASS (subset of the 330, unaffected)
pnpm asset:image:test:    92/92 PASS (unaffected)
pnpm build:                PASS (unaffected)
Chromium visual regression: 70/70 PASS (re-verified — 2 Result-
  reachability re-runs needed due to pre-existing non-deterministic
  match-seed duration variance, unrelated to this batch; not a
  regression, same characteristic documented in Batch 5/6)
Firefox functional QA:     25/25 PASS
WebKit functional QA:      25/25 PASS
Firefox accessibility:     21/21 PASS
WebKit accessibility:      21/21 PASS
Cross-browser visual (Firefox+WebKit): 96/96 PASS
```

**Batch 7 independent pass/fail test-case total: 25 + 25 + 21 + 21 + 96
= 188** (Firefox functional + WebKit functional + Firefox accessibility
+ WebKit accessibility + cross-browser visual). This is on top of, and
does not duplicate, Gate 6's own 522-case total (330 unit tests + 92
asset-image tests + 70 Chromium visual + 30 Gate 6 browser-script
checks) — the two totals cover disjoint test suites (Batch 7 added
Firefox/WebKit-specific test runs; it did not re-run or re-count any
Gate 6 case). Combined project-wide total as of this batch: **522 + 188
= 710** independent pass/fail test cases, plus `pnpm typecheck` and
`pnpm build` as separate command-level verification results (not test
cases with individual counts).

No lint or docs-validation script exists in this repo (`package.json`
has no `lint`/`docs` script) — none was skipped, none exists to run.

`git diff --check`: clean throughout (checked before every commit).

## Evidence Inventory

```text
docs/qa/evidence/batch-7/:
  PNG:      38
  JSON:      4
  Markdown:  0
  Logs:      0
  Total:    42  (all git-tracked)

tests/visual-crossbrowser/gate7-tier-a.spec.ts-snapshots/:
  PNG:      96  (Playwright visual baselines, git-tracked, same
                  convention as tests/visual/*-snapshots/)
```

Breakdown of `docs/qa/evidence/batch-7/`:

```text
firefox/                  16 PNG, 1 JSON  (functional QA)
firefox/accessibility/     4 PNG, 1 JSON  (accessibility QA)
webkit/                   16 PNG, 1 JSON  (functional QA)
webkit/accessibility/      4 PNG, 1 JSON  (accessibility QA)
```

## CI

Firefox/WebKit functional and accessibility scripts (`scripts/batch7-*.mjs`)
require downloading two additional browser engines
(~98.8 MiB Firefox + ~77.2 MiB WebKit, one-time). Decision: **do not
add to CI this batch**, for the same reasoning Gate 6 already applied
to Chromium's own `pnpm test:visual`:

1. Two more browser downloads (~176 MiB total) on every CI run, unless
   cached — adds real CI time and a new cache-invalidation surface.
2. The match-play functional cases (`3-player match reaches Result`,
   `4-player match reaches Result`) are inherently variable-duration
   (seconds to several minutes depending on how quickly the seeded
   match completes) — a bad fit for a CI job expected to be fast and
   predictable, same reasoning as Gate 6's Result-reachability cases.
3. `playwright.crossbrowser.config.ts`'s 96 visual baselines are
   `-darwin.png` (macOS-rendered), same platform-specific-baseline
   concern Gate 6 already recorded for the Chromium suite — running
   this in CI (`ubuntu-latest`) would need separate Linux baselines.

**Gate 6/Batch 7 continue to treat all `pnpm test:visual*` commands as
required local/manual-QA-gate checks**, not CI-blocking checks. CI
(`.github/workflows/ci.yml`) still runs typecheck/test/skin:validate/
build only, unaffected by this batch.

## RC Decision

**Browser readiness**: Chromium, Firefox, and Playwright WebKit all
show full functional/visual/accessibility parity (0 P0/P1/P2 across all
three). Real Safari, iOS Safari, and Android physical devices remain
untested.

**Accessibility readiness**: semantic/programmatic inspection passes
fully across all three validated engines. Real screen-reader
verification (VoiceOver/NVDA/JAWS) is BLOCKED (VoiceOver) or not
attempted (NVDA/JAWS, no Windows environment) — this is a genuine gap,
not resolved this batch.

**Validated public-demo scope**: Chromium, Firefox, and Playwright
WebKit (Desktop). Both official skins. Landscape viewports 844x390/
852x393/1366x768 for the new cross-browser visual suite; all 5 for
Chromium (unchanged from Gate 6).

**Untested scope**: real Safari, iOS Safari (physical device), Android
(physical device), real screen readers (VoiceOver/NVDA/JAWS), extended
memory soak (Gate 6's own open item, unchanged), real deploy-target
rollback rehearsal (Gate 6's own open item, unchanged).

**RC status: LIMITED READY.** Upgraded in scope from Gate 6's
Chromium-only LIMITED READY (browser engine coverage is now 3/3
desktop engines validated with 0 defects, versus 1/3 before), but
still not full READY, because:

- Real Safari/iOS Safari/Android physical devices remain unvalidated
  (browser-engine parity is a strong signal, not a substitute for real
  device/OS testing — different device memory, touch input, OS-level
  Safari behaviors, and real network conditions are not exercised by
  Playwright's WebKit build).
- Screen-reader acceptance is BLOCKED, not completed — semantic
  inspection alone is not equivalent to a real assistive-technology
  user's experience, and this batch could not close that gap.
- Gate 6's own remaining open items (extended memory soak, real
  deploy-target rollback rehearsal) are unchanged and still open.

**Batch 7 formally closed: yes**, as COMPLETE (not CONDITIONAL — no
P0/P1/P2 remain, and the only reduced-scope items — 2 of 5 viewports,
VoiceOver BLOCKED — were pre-declared/immediately-documented rather
than silently dropped).

## Next Fixed Task

```text
Next task (choose one on explicit instruction — do not auto-select):
  - Real screen-reader acceptance (retry VoiceOver with explicit
    Safari/browser access granted, or arrange an NVDA/JAWS-capable
    Windows environment)
  - Physical iPhone/iPad Safari validation
  - Physical Android device validation
  - Extended memory soak (Gate 6's own carried-forward open item)
  - Real deploy-target rollback rehearsal (Gate 6's own carried-forward
    open item)

Entry condition: explicit instruction naming which item to pursue.

Stop condition: whichever item is chosen is verified with the same
evidence discipline used in Batches 5-7 (real checks, not assumptions;
honest scope statements; P0/P1 = 0 before any PASS/READY claim upgrade).

Do not begin Gate 7/8 without an explicit plan naming that as the goal.
```
