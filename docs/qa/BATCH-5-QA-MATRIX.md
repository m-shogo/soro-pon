# Batch 5 QA Matrix

Full-screen integration / manual QA / public demo gate review.
Date: 2026-07-21. Start commit: `9b9ba1a`. Browser: Chromium (Desktop
Chrome), headless, via Playwright — matches this project's own
`playwright.config.ts` target browser. Automation entry points:
`scripts/batch5-qa-01-boot-recovery-viewport.mjs`,
`scripts/batch5-qa-02-match-play.mjs`,
`scripts/batch5-qa-03-import-editor-a11y.mjs`, plus
`tests/visual/screens-extended.spec.ts` (Playwright visual regression).

Screens were enumerated from `src/app/AppRoot.tsx` (`Screen` union) and
`src/App.tsx` (`#/gallery` hash route) — see
[BATCH-5-MANUAL-QA-REPORT.md](./BATCH-5-MANUAL-QA-REPORT.md) for the full
research trail. No screen was invented and no reachable screen was
excluded.

## Screen matrix

| Screen | Route/entry | Cute Pop | Yorunoshirube | 844x390 | 852x393 | 932x430 | 1024x600 | 1366x768 | Keyboard | Recovery | Evidence |
|---|---|---|---|---|---|---|---|---|---|---|---|
| TOP | `/` (default) | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS (fresh/corrupt/invalid-skin) | `{skin}/{vp}/top*.png` |
| DeckList | TOP → デッキ一覧 | PASS | PASS | PASS | PASS | PASS | PASS | PASS | N/A | N/A | `{skin}/{vp}/deck-list.png`, Playwright baseline (844/1366) |
| DeckDetail | DeckList → card click | PASS | PASS | PASS | PASS | PASS | PASS | PASS | N/A | N/A | `{skin}/{vp}/deck-detail.png` |
| DeckEditor | DeckDetail → 編集 | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS (Tabs Arrow/Home) | PASS (unsaved-changes warning) | `{skin}/{vp}/deck-editor.png`, `issues/editor-*.png`, Playwright baseline (844/1366) |
| Collection | TOP → 記憶帳 | PASS | PASS | PASS | PASS | PASS | PASS | PASS | N/A | N/A | `{skin}/{vp}/collection.png` |
| MatchSetup | TOP → まず遊ぶ | PASS | PASS | PASS | PASS | PASS | PASS | PASS | N/A | PASS (2-player blocked, invalid deck blocked) | `{skin}/{vp}/match-setup.png`, existing Playwright baseline |
| Match | MatchSetup → 対局開始 | PASS | PASS | n/a¹ | n/a¹ | n/a¹ | PASS | PASS | N/A | PASS (reload during match) | `match/*-turn1.png`, `match/*-final-state.png` |
| Result | Match → win/draw | PASS | PASS | PASS | PASS | PASS | PASS | PASS | N/A | PASS (reload idempotency) | `result/*.png`, Playwright `Result reachable and renders *` (5vp × 2 skins) |
| Component Gallery | `#/gallery` | PASS | PASS | PASS | PASS | PASS | PASS | PASS | N/A | N/A | `{skin}/{vp}/gallery.png`, existing Playwright baseline |
| きせかえ Modal (SkinSelector) | TOP → きせかえ | PASS | PASS | PASS | PASS | n/a² | n/a² | PASS | PASS (Enter open / Escape close / focus trap+return) | N/A | `skin-switch/selector-open.png`, `accessibility/modal-initial-focus.png`, Playwright baseline (844/1366) |
| Reset confirmation | TOP → ローカルデータを初期化… | PASS | PASS | — | — | — | PASS | — | N/A | PASS (dialog explains scope) | `recovery/reset-confirmation.png` |
| Import modal | TOP → JSONを読み込む | PASS | PASS | — | — | — | PASS | — | N/A | PASS (6 import edge cases) | `issues/import-*.png` |
| AppErrorBoundary | render-time exception | PASS (component test) | PASS (component test) | — | — | — | — | — | — | PASS | `src/ui/components/domInteraction.test.tsx` (existing, still green) |
| Rotate prompt | portrait viewport | not exercised³ | not exercised³ | — | — | — | — | — | — | — | — |

¹ Match/Result full-viewport sweep ran at 1024x600 and 1366x768 for
directed automation (script 1's screen sweep); the 5-viewport Playwright
`Result reachable and renders` suite covers all five sizes for the
Result end-state (see table row above). Turn-by-turn Match screenshots at
all 5 sizes were not separately captured beyond the existing
`no-h-scroll` checks already run for every other screen at all 5 sizes;
the discard-board / hand layout is shared with MatchSetup/TOP's
`GameTableLayout`, which was verified at all 5 sizes.
² SkinSelector modal Tier-B visual baseline only covers phone
(844x390) and desktop (1366x768) representative sizes per the Tier
A/B split in `docs/MANUAL-QA.md` §26 guidance — manual screenshot
evidence at 1024x600 was captured via script 1.
³ Portrait/rotate-prompt behavior exists in code
(`src/ui/screens/RotatePrompt` referenced from `App.tsx`) but was not
re-verified in Batch 5; this was already covered under prior hardening
(H-series) and is out of this batch's landscape-viewport scope per the
task's required-viewport list (all five required sizes are landscape).

## Data states verified

| State | Verified | Evidence |
|---|---|---|
| Fresh local data | PASS | `{skin}/{vp}/top-fresh-boot.png`, 10 combinations |
| Existing valid deck data | PASS | seeded via `samples/animal-starter.deck.json` throughout |
| Existing match/progress data | PASS | 4 completed matches recorded to `soro-pon.records.v1` |
| Corrupt local data | PASS | `recovery/corrupt-deck-data.png`, backup-key preserved |
| Invalid skin ID | PASS | `recovery/invalid-skin-id.png`, falls back to a valid built-in skin |
| Missing referenced deck | PASS | `recovery/no-deck-play-now.png`, no blank screen |
| Unsafe/invalid import payloads | PASS | 6 cases in `issues/import-*.png` |

## Browser / device matrix

| Browser | Device/emulation | Viewport | DPR | Tested | Notes |
|---|---|---|---|---|---|
| Chromium (Desktop Chrome) | Playwright headless | all 5 required sizes | 1 | YES | Primary and only automated target; matches `playwright.config.ts` |
| WebKit | — | — | — | NOT TESTED | Not configured as a Playwright project in this repo |
| Firefox | — | — | — | NOT TESTED | Not configured as a Playwright project in this repo |
| Real Safari (macOS) | — | — | — | NOT TESTED | Would require interactive/typing access to a tier-restricted browser app; not available non-interactively in this session |

**Gate 5 browser scope: Chromium (Desktop Chrome) only.** This matches
the project's own defined and previously-CI'd target browser — no other
browser was ever part of this repo's automated test matrix before Batch
5, so this is not a scope reduction from an existing commitment.
