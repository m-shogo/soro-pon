# Batch 5 Manual QA Report

- Date: 2026-07-21
- Start commit: `9b9ba1a` (origin/main, clean worktree)
- Browser/device: Chromium (Desktop Chrome) via Playwright, headless, both
  as ad-hoc automation scripts and as the project's own visual regression
  suite. See [BATCH-5-QA-MATRIX.md](./BATCH-5-QA-MATRIX.md) for the full
  browser/device matrix and why WebKit/Firefox/real Safari are NOT TESTED.
- Viewport matrix: 844x390, 852x393, 932x430, 1024x600, 1366x768 (all 5
  required sizes).
- Skin matrix: yorunoshirube (v4, 9 finals), cute-pop (v5, 9 finals).
- Data states: fresh, existing valid, existing match/progress, corrupt,
  invalid skin ID, missing deck, unsafe/invalid import payloads (6
  variants).
- Screen inventory: 14 reachable screens/overlays (see matrix), all
  exercised. None invented, none excluded.

## Method

This QA pass was executed with three purpose-built Playwright automation
scripts (`scripts/batch5-qa-01-boot-recovery-viewport.mjs`,
`scripts/batch5-qa-02-match-play.mjs`,
`scripts/batch5-qa-03-import-editor-a11y.mjs`) driving a real Chromium
browser against the dev server, plus an expansion of the project's
existing Playwright visual-regression suite
(`tests/visual/screens-extended.spec.ts`). This is real browser
automation — actual DOM interaction, actual network capture, actual
screenshots — not a static code read. Manual interactive spot-checks
(via the Claude Browser tool) were used to debug two script assumptions
(see "Non-defect findings" below) by directly inspecting the running app.

Rationale for scripted rather than freehand manual QA: the scope
(2 skins × 5 viewports × ~10 screens × multiple data states × full
gameplay to completion) is not reliably reproducible or auditable by
freehand clicking. Scripts make every check re-runnable, and every
screenshot is saved to disk under `docs/qa/evidence/batch-5/` as
durable evidence (138 files: 131 PNG screenshots + 7 JSON evidence
files, ~32MB) rather than living only in a chat transcript. **All
interaction in this batch — including all gameplay — was performed by
Chromium browser automation (Playwright), not by a human clicking
through the app or by an engine-only simulation.** No real mobile/tablet
device and no non-Chromium browser were used; see "Corrections" below
and [BATCH-5-QA-MATRIX.md](./BATCH-5-QA-MATRIX.md) for the exact browser
scope.

### Corrections (recorded 2026-07-21, same day, before Gate 6 work)

This report originally used imprecise language in two places, corrected
here without rewriting git history (see the Batch 6 docs commit that
introduced this correction):

1. **"real UI interaction" (previous wording) did not mean human manual
   play.** Every match in this batch — the 4 described in "Gameplay"
   below and the 10 additional Playwright visual-regression cases — was
   driven end-to-end by scripted Chromium automation (`page.click()`
   / `page.getByRole(...).click()` in Playwright), which does exercise
   the real DOM/event-handler path (not an engine-level simulation
   bypassing the UI), but is not manual human operation and not a real
   device. The two match sets are now labeled: **4 QA-script-driven
   automated matches** (`scripts/batch5-qa-02-match-play.mjs`, run
   individually, each screenshot manually reviewed by the agent as
   primary evidence) and **10 additional Playwright-test-driven
   automated match runs** (`tests/visual/screens-extended.spec.ts`'s
   `Result reachable and renders *`, run under the `pnpm test:visual`
   test harness with pass/fail assertions; screenshots saved as
   supplementary evidence, not each individually reviewed).
2. **Evidence file count was miscounted.** The commit message ("138
   evidence files") was correct; the breakdown printed later in this
   report ("121 PNG + 7 JSON = 128") was an arithmetic error and did
   not match the 138 actually committed. Corrected count, re-verified
   by direct enumeration of `docs/qa/evidence/batch-5/` on 2026-07-21:
   **131 PNG + 7 JSON = 138**, matching `git diff-tree --no-commit-id
   --name-only -r 6512db0 | grep '^docs/qa/evidence' | wc -l` exactly.
   See the Evidence section below for the corrected per-directory
   breakdown.

## Automated check totals

| Source | Checks | Pass | Fail (genuine defects) |
|---|---|---|---|
| `batch5-qa-01-boot-recovery-viewport.mjs` (boot/recovery/viewport sweep/skin switching) | 76 | 75 | 0¹ |
| `batch5-qa-02-match-play.mjs` (4 automated full matches to Result) | 21 | 21 | 0 |
| `batch5-qa-03-import-editor-a11y.mjs` (import/editor/accessibility) | 27 | 27 | 0 |
| `pnpm test:visual` (Playwright visual regression, expanded) | 56 | 56 | 0 |
| **Total** | **180** | **179** | **0** |

¹ One check ("SkinSelector reachable from DeckEditor") failed against an
incorrect assumption in the script, not against the product — see
"Non-defect findings" below. Corrected understanding: PASS.

Existing suites, re-run after all Batch 5 changes, still green:

| Command | Result |
|---|---|
| `pnpm typecheck` | PASS |
| `pnpm test` (Vitest) | PASS — 314/314 tests, 26 files |
| `pnpm skin:validate` | PASS — 18/18 tests |
| `pnpm asset:image:test` | PASS — 92/92 tests |
| `pnpm build` | PASS |
| `pnpm test:visual` (Playwright) | PASS — 56/56 (was 34; +22 new cases) |

No product source file under `src/` was changed during this batch. Zero
P0/P1 defects were found, so there was nothing to fix in application
code. All changes are: 3 new QA automation scripts (`scripts/`), 1 new
Playwright spec (`tests/visual/screens-extended.spec.ts` + its baseline
snapshots), evidence files (`docs/qa/evidence/batch-5/`), and this
documentation set.

## Non-defect findings (investigated, confirmed by-design)

1. **SkinSelector ("きせかえ") is only reachable from TOP and Component
   Gallery, not from every screen.** `grep` for `SkinSelector` usage
   confirms it is only imported in `src/ui/screens/TopScreen.tsx` and
   `src/ui/gallery/ComponentGallery.tsx`. This matches H4's stated scope
   ("Gallery and user-facing SkinSelector") in `docs/SKIN-FOUNDATION-HARDENING.md`
   — it was never meant to be a global header control on every screen.
   Switching skin mid-DeckEditor requires returning to TOP; the editor's
   own unsaved-changes guard (`保存していない変更があります`) correctly
   protects the draft in that case. Not a defect; no fix applied.
2. **Reloading during an in-progress match returns to TOP, losing the
   match.** `src/app/AppRoot.tsx`'s `Screen` state is a plain
   `useState` with no URL sync and no localStorage persistence — only
   decks/records/settings/skin-selection persist across reload
   (`src/storage/resetLocalData.ts`'s `ALL_LOCAL_DATA_KEYS`). This is
   the intended contract: reload during a match must not crash (it
   doesn't — confirmed, no blank screen, no console error) but match
   state is deliberately session-only. Matches
   `docs/RELEASE-DEMO-GATES.md`'s "reload during match does not crash"
   requirement, not "reload during match resumes the match." Not a
   defect; no fix applied.

Both findings are documented here per the audit trail requirement in
`docs/MANUAL-QA.md`/`docs/RELEASE-DEMO-GATES.md`, even though no code
change resulted.

## Boot / Recovery

| Scenario | Result |
|---|---|
| Fresh load (both skins, all 5 viewports) | PASS — `data-skin` applied, no console errors, no horizontal scroll (10/10) |
| Reload on TOP | PASS |
| Reload during an in-progress match | PASS — returns cleanly to TOP, no blank screen, no console error (by design; see above) |
| Corrupt `soro-pon.decks.v1` (malformed JSON) | PASS — recovers to usable TOP, corrupt payload preserved under `soro-pon.decks.v1.corrupt-backup` |
| Invalid skin ID in `soro-pon.skin.v1` | PASS — falls back to a valid built-in skin (`yorunoshirube`), no crash |
| No deck available, "まず遊ぶ" pressed | PASS — lands on a real screen (MatchSetup shows player-count controls, since MVP ships a bundled official starter deck), no blank screen |
| AppErrorBoundary (render-time exception) | PASS — existing component test (`domInteraction.test.tsx`) confirms alert role, reload button, and reset button all present; not modified this batch |
| Reset path visible + confirmation explains scope | PASS — dialog text: "デッキ・対局記録・実績・設定・スキン選択を全て削除して最初の状態に戻します。この操作は取り消せません。" |

No Never-Demo condition was observed: no blank screen, no unrecoverable
crash, no skin failure blocking operation, reset path always visible,
no infinite loading on missing deck, no reload crash on any tested flow.

## Skin Switching

- Reachable from TOP and Gallery (see non-defect finding #1 for scope).
- Switch to Cute Pop applied instantly, no reload, verified via
  `document.documentElement.dataset.skin`.
- `color-scheme` and `#sp-theme-color` meta both update on switch
  (`colorScheme=light`, `themeColor=#fff3e2` observed for Cute Pop).
- Skin selection persists across reload (`localStorage['soro-pon.skin.v1']`).
- Network audit (`docs/qa/evidence/batch-5/network/skin-switch-requests.json`,
  `cutepop-asset-audit.json`, `yorunoshirube-asset-audit.json`): zero
  requests to `/candidates/`, zero 404s, all `generated/final/*` requests
  200 with `image/*` content-type, all at the correct `?v=` for each
  skin (cute-pop `?v=5`, yorunoshirube `?v=4`). No mixed-version leakage
  observed in any captured session.

## Gameplay (automated, full-UI matches — not human manual play, not an engine-only simulation)

Four complete matches were played end-to-end through the real DOM/UI
(scripted tile selection, discard, automatic CPU turns, ron/tsumo
declaration — all issued by Chromium automation, not by a human, and
not by calling the engine directly) until the Result screen was
reached:

| Match | Result reached | Reason | Score | Reload on Result |
|---|---|---|---|---|
| yorunoshirube, 3-player | PASS | ron (ナギ) | 118 (later re-run: 116) | PASS, no blank screen |
| yorunoshirube, 4-player | PASS | ron (ナギ), 1 wildcard used | 143 | PASS |
| cute-pop, 3-player | PASS | ron (ナギ), 1 wildcard used | multiple bonuses stacked | PASS |
| cute-pop, 4-player | PASS | tsumo (トモリ), 1 wildcard used | 140 | PASS |

All four: role name, group breakdown, special bonuses, and total score
were all visibly reconstructable on the Result screen (see
`docs/qa/evidence/batch-5/result/*.png`). No console errors during any
match. 2-player is not selectable in `MatchSetupScreen` (only 3人戦/4人戦
buttons exist). The starter deck's `extended` variant
(`evaluationMode: extendedRoleSpan`, 14-tile hand) is marked
`engineStatus: pending` in `samples/animal-starter.deck.json` and is not
exposed as a selectable variant in `MatchSetupScreen`, so it cannot be
started from the UI — confirmed not reachable.

Additionally, the Playwright visual-regression suite independently drove
10 more matches to Result (2 skins × 5 viewports) as part of
`Result reachable and renders *`, all passing — these are the
**10 additional Playwright-test-driven automated match runs** referenced
in "Corrections" above, giving **14 total automated matches driven
through the real UI to a completed Result screen** across this QA pass.
None of the 14 were played by a human, and none were run on a real
mobile/tablet device.

## Accessibility / Keyboard

| Check | Result |
|---|---|
| Tab moves focus through TOP menu | PASS |
| Focus ring visible after repeated Tab | PASS |
| きせかえ opens its dialog via Enter | PASS |
| Modal initial focus lands inside the dialog | PASS |
| Escape closes the modal | PASS |
| Focus returns to the opening button after Escape | PASS |
| DeckEditor Tabs: ArrowRight moves selection | PASS |
| DeckEditor Tabs: Home returns to first tab | PASS |
| TOP button touch targets ≥ 44×40 | PASS (0 failing targets recorded in `accessibility/touch-targets.json`) |

These build on, and did not need to change, the existing DOM-level
accessibility test suite (`src/ui/components/domInteraction.test.tsx`):
Modal focus trap/return, Tabs roving-tabindex/Arrow/Home/End, TileCard
`aria-pressed` and text-based ron/tsumo emphasis (not color-only), and
skin-switch DOM-state stability were already covered there and remain
green (314/314 Vitest tests).

## Deck Import

Six import cases were driven through the real import modal (paste JSON →
読み込む):

| Case | Expected | Result |
|---|---|---|
| Valid animal-starter deck | Accepted, lands on DeckDetail | PASS |
| Malformed JSON | Rejected with a visible reason (拒否 badge) | PASS |
| Unknown top-level field | Rejected | PASS |
| Unsafe field (`__proto__`, embedded `<script>`) | Rejected | PASS |
| Unsafe `imageUrl` field | Rejected | PASS |
| Oversized payload (>512KB, exceeds `ENGINE_LIMITS.maxImportJsonBytes`) | Rejected | PASS |

No case produced a blank screen. Screenshots:
`docs/qa/evidence/batch-5/issues/import-*.png`.

## Deck Editor

- Category creation (カテゴリを追加): PASS.
- Tile creation (牌を追加): PASS.
- specificSet role template correctly gated: the "指定3枚+同カテゴリ2組"
  button is disabled until a template category and 3 distinct set tiles
  are chosen (`canAddSpecificSetRole` in `DeckEditorScreen.tsx`) — PASS,
  no premature enable.
- Unsaved-changes warning: PASS. Navigating もどる with a dirty draft
  shows "保存していない変更があります" / "もどると編集内容は失われます。"
  before discarding.
- No crash during category/tile/role edits: PASS, zero console errors.

## Visual / Cross-skin

Same-screen, same-data, same-viewport screenshots exist for both skins
under `docs/qa/evidence/batch-5/cutepop/<viewport>/<screen>.png` and
`docs/qa/evidence/batch-5/yorunoshirube/<viewport>/<screen>.png` with
matching filenames, giving direct pairwise comparison for every screen ×
viewport combination (no separate `cross-skin/` copies were made — the
matched-filename pairs serve that purpose without duplicating ~30MB of
screenshots). Visual spot-check (both skins, DeckEditor at 844x390):
identical layout, identical hit areas, identical validation-issue
copy, no clipping at the narrowest required viewport in either skin.

## Console / Network

- Zero console.error / pageerror entries were recorded across all 10
  fresh-boot combinations, all 4 real matches, and all import/editor
  flows (`docs/qa/evidence/batch-5/console/` is empty because the
  scripts only write a file when an error is captured — absence of
  files is the evidence of a clean run, not missing instrumentation:
  the collectors were active in every scenario).
- Zero 404s and zero `/candidates/` requests observed during skin
  switching (see Skin Switching section above).

## Visual Regression

- Before Batch 5: 34 cases (`skin-screens.spec.ts` 30 + `skinAssetReady.spec.ts` 4).
- Added: 22 cases in `tests/visual/screens-extended.spec.ts` —
  DeckList (Tier B, 2 skins × 2 representative viewports = 4),
  DeckEditor (Tier B, 4), SkinSelectorModal (Tier B, 4), and Result
  (Tier A, 2 skins × 5 viewports = 10, but see below).
- Total: 56 cases.
- **Result screen is excluded from strict pixel-baseline comparison.**
  `AppRoot.tsx`'s match seed (`newSeed()`) is derived from
  `Date.now()` plus a monotonic counter — non-deterministic across test
  runs — so the Result screen's tile groups/roles/winner vary run to
  run and cannot be pixel-diffed reliably. Instead, the 10 Result cases
  assert reachability (heading visible), zero horizontal overflow, and
  save a non-baseline screenshot to
  `docs/qa/evidence/batch-5/result/playwright-result-*.png` as evidence.
  This is a deliberate, documented scope reduction, not a lowered bar —
  see `docs/MANUAL-QA.md` §26/27 for the instruction this follows
  ("record the reason if visual-test scope was reduced").
- All 56 cases pass; baselines for the 12 newly-added deterministic
  cases (DeckList/DeckEditor/SkinSelectorModal) were visually inspected
  before being accepted (see this session's transcript) — no diffs were
  blindly bulk-updated.

## Verification

| Command | Result |
|---|---|
| `pnpm asset:image:test` | 92/92 PASS |
| `pnpm skin:validate` | 18/18 PASS |
| `pnpm test` | 314/314 PASS |
| `pnpm typecheck` | PASS |
| `pnpm build` | PASS |
| `pnpm test:visual` | 56/56 PASS |

## Evidence

Re-verified by direct enumeration on 2026-07-21 (see "Corrections"
above for why this replaces the original, miscounted breakdown):

```text
$ find docs/qa/evidence/batch-5 -type f | wc -l         # 138
$ find docs/qa/evidence/batch-5 -type f -name "*.png" | wc -l   # 131
$ find docs/qa/evidence/batch-5 -type f -name "*.json" | wc -l  # 7
$ git ls-files docs/qa/evidence/batch-5 | wc -l          # 138 (all tracked, none gitignored)
```

- QA Matrix: `docs/qa/BATCH-5-QA-MATRIX.md`
- Manual QA Report: this file
- Evidence root: `docs/qa/evidence/batch-5/` — **138 files total: 131 PNG
  screenshots + 7 JSON evidence files**, ~32MB, all git-tracked (not
  gitignored).
  - Cute Pop: `docs/qa/evidence/batch-5/cutepop/<viewport>/*.png` — 40 files (40 PNG)
  - Yorunoshirube: `docs/qa/evidence/batch-5/yorunoshirube/<viewport>/*.png` — 40 files (40 PNG)
  - Recovery: `docs/qa/evidence/batch-5/recovery/*.png` — 7 files (7 PNG)
  - Accessibility: `docs/qa/evidence/batch-5/accessibility/*.png`, `touch-targets.json` — 5 files (4 PNG + 1 JSON)
  - Skin switch: `docs/qa/evidence/batch-5/skin-switch/*.png` — 3 files (3 PNG)
  - Match: `docs/qa/evidence/batch-5/match/*.png` — 12 files (12 PNG)
  - Result: `docs/qa/evidence/batch-5/result/*.png` — 14 files (14 PNG)
  - Network: `docs/qa/evidence/batch-5/network/*.json` — 3 files (3 JSON)
  - Issues (import/editor probes): `docs/qa/evidence/batch-5/issues/*.png`, `*.json` — 14 files (11 PNG + 3 JSON)
  - `cross-skin/`, `console/`, `matrix/` subdirectories were created but
    are empty (0 files) — no dedicated files were placed there. Cross-skin
    comparison is instead done via matched filenames across the
    `cutepop/`/`yorunoshirube/` directories (see "Visual / Cross-skin"
    above); `console/` being empty is itself the evidence of zero
    captured console errors (the collectors ran in every scenario but
    only write a file when an error is found).

Not counted in the 138: the two QA markdown docs themselves
(`BATCH-5-QA-MATRIX.md`, `BATCH-5-MANUAL-QA-REPORT.md`), the 3 QA
automation scripts (`scripts/batch5-qa-0{1,2,3}-*.mjs`), and the
Playwright visual-regression spec + baselines (`tests/visual/screens-extended.spec.ts`
+ 12 snapshot PNGs) — these are QA tooling and test code, not evidence
artifacts, and were committed separately (see commit `75a80b4` for the
visual-regression spec/baselines, distinct from the evidence commit
`6512db0`).

## Asset Inventory (unchanged this batch)

```text
Cute Pop version:        v5
Cute Pop finals:         9
Yorunoshirube version:   v4
Yorunoshirube finals:    9
Official finals:         18
Candidate production requests in production runtime: 0
Remote image requests:   0
Asset version changes this batch: none (CSS/test/docs only)
```

## Gate 4 Decision — User Test Ready

**PASS.**

- Manual QA checklist passes for the stated test scope (both official
  skins, all 5 landscape viewports, all reachable screens).
  ✅ Yes
- Main landscape sizes reviewed. ✅ Yes (all 5)
- Both official skins usable. ✅ Yes
- Import failure UX understandable. ✅ Yes (6 rejection cases all show a
  visible 拒否 reason)
- Invalid decks cannot start. ✅ Yes
- ErrorBoundary / ErrorState recovery. ✅ Yes (existing component test,
  re-verified green)
- Visible reset path. ✅ Yes
- Skin load failure cannot brick app. ✅ Yes (invalid skin ID falls back
  to a valid built-in skin)
- Known issue list current. ✅ Yes — zero open P0/P1/P2; see
  "Non-defect findings" for the two investigated-and-closed items.

## Gate 5 Decision — Public Demo Ready (within the validated Chromium browser scope)

**PASS within the validated Chromium (Desktop Chrome) browser scope
only.** This Gate 5 decision does NOT claim Safari, Firefox, WebKit, or
any real mobile/tablet device is verified or supported — those remain
untested (see below and the QA Matrix's browser table).

- CI passing: pending push (see final report in the conversation for the
  post-push confirmation).
- Build passing: ✅ `pnpm build` green.
- Skin validation passing: ✅ `pnpm skin:validate` 18/18.
- Component/DOM tests passing: ✅ `pnpm test` 314/314.
- Visual regression accepted: ✅ 56/56, all new baselines visually
  reviewed before acceptance.
- Manual QA passing for target browsers: ✅ for Chromium (Desktop
  Chrome) — the only browser this project has ever targeted in its own
  Playwright config. WebKit/Firefox/real Safari: NOT TESTED (see QA
  Matrix browser section).
- Keyboard/focus basics accepted: ✅.
- Both official skins stable: ✅.
- No existing IP assets, no remote image loading: ✅ (unchanged from
  prior batches; re-confirmed via network capture — 0 remote/candidate
  requests).
- No login/payment/cloud promise: ✅ (README never claimed any; Public
  Demo Notes section added this batch to make the absence explicit).
- Export excludes local/private data: ✅ (`exportDeck` in
  `localStorageDeckStore.ts` only serializes the shared `DeckProject`,
  never local metadata — unchanged, re-confirmed by reading the source).
- README includes limitations: ✅ — added this batch (`## Public Demo
  Notes` section).
- Reset path visible: ✅.
- Common missing/corrupt entity recovery: ✅.
- Skin switching updates browser color scheme: ✅.

**Public demo readiness: TRUE, strictly within the validated Chromium
browser scope. Not evaluated, not implied, and not claimed for any
other browser or device:**

```text
Gate 5 browser scope: Chromium (Desktop Chrome) only.
Safari:        NOT TESTED — no support claim.
Firefox:       NOT TESTED — no support claim.
WebKit:        NOT TESTED — no support claim.
Real mobile/tablet devices: NOT TESTED — no support claim.
```

This is not a narrowing of a prior commitment — the project's Playwright
config (`playwright.config.ts`) has only ever defined a single
`devices['Desktop Chrome']` project; no WebKit/Firefox project exists to
compare against, and no prior release claimed multi-browser coverage.
Wherever "Public Demo Ready" or `COMPLETE_PUBLIC_DEMO_READY` appears in
this document set, it means "public demo ready within the validated
Chromium browser scope" — never a general cross-browser or cross-device
guarantee.

## Honest Readiness

```text
Batch 5 manual QA complete:        true
Gate 4:                            PASS
Gate 5:                            PASS, within the validated Chromium (Desktop Chrome) browser scope only
Both official skins stable:        true, within the validated Chromium browser scope
Full target-browser QA complete:   true for Chromium (this project's only defined target); Safari/Firefox/WebKit/real devices NOT TESTED
Public demo visually ready:        true, strictly within the validated Chromium browser scope — not evaluated for any other browser or device
Known P0:                          0
Known P1:                          0
Known P2:                          0
Release Candidate Gate 6 started:  false
```

## Fixed Next Task

```text
Next task:
Release Candidate track — Gate 6

Reason:
Gate 4/5 passed. Remaining work is broader release-candidate hardening:
migration, storage recovery, performance caps, asset caching, rollback,
and accessibility acceptance.

Entry condition:
Explicit instruction to begin Gate 6.

Stop condition:
Gate 6 requirements verified, blocking defects fixed, tests/CI green,
release-candidate decision recorded.
```
