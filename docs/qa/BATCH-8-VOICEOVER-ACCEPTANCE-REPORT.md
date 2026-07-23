# Batch 8 — macOS VoiceOver Acceptance Report

- Date: 2026-07-21 (attempts 1-3, BLOCKED); 2026-07-23 (attempts 4-5,
  CONDITIONAL)
- Preceding work: Gate 6 (PASS, unchanged), Batch 7 (COMPLETE, RC
  LIMITED READY, browser scope Chromium+Firefox+Playwright WebKit).
  Batch 8 targets one specific Batch 7 open item: real screen-reader
  acceptance.

## Current status: CONDITIONAL (attempt 5)

**After the user granted macOS TCC Accessibility + Automation
permissions via System Settings, attempt 4 (2026-07-23) succeeded in
driving and observing REAL VoiceOver for the first time.** Attempts 1-3
(all BLOCKED, 2026-07-21) are preserved below as history. Attempt 4's
result: **CONDITIONAL** — the 20 flows are now classified exactly as
`VOICEOVER_PASS: 9`, `SUPPLEMENTAL_ONLY: 5`, `BLOCKED: 6`,
`NOT_APPLICABLE: 0`. The VoiceOver passes cover observed portions of
TOP, JSON import, Deck Editor, and the unsaved-changes dialog; no
product defect was observed in that traversed scope.
Match Setup was reached but not cleanly traversed; Match and Result were
not reached under a clean VoiceOver cursor due to a CDP-vs-VoiceOver
focus-sync tooling limitation (not a product defect).
Full evidence: `docs/qa/evidence/batch-8/attempt-4-tcc-granted-observations.json`.
See the "Attempt 4" section near the end of this report for detail. RC
status remains **LIMITED READY**. Attempt 5 subsequently closed the
Match Setup and Match interaction gaps, but Result and the secondary
skin still lack a clean real-VoiceOver traversal; see the Attempt 5
section below.

## Duplicate-work check (Phase 0)

Before starting, the repository was verified fresh — not assumed from
the prior report:

```text
git status:        clean
Branch:             main
HEAD:                1fbfb76
origin/main:          1fbfb76 (match)
Commits verified present: db4bad7, 8630e57, 1fbfb76 (all exist —
  `git cat-file -t` returned "commit" for each)
```

Batch 6's git-chronology correction (`db4bad7`) and all of Batch 7
(`8630e57`, `1fbfb76`) were confirmed already complete. **No part of
Batch 6 or Batch 7 was repeated this batch.** Batch 8's Start HEAD is
`1fbfb76`, the actual current `origin/main` at the time this batch
began — not the stale value from an earlier draft of the request.

## Method

Per explicit user direction (after two clarifying questions were asked
and answered mid-session), Batch 8 used:

1. **`mcp__computer-use__request_access` for Safari** — the first,
   most direct approach. Result: **granted, but at tier "read"** —
   computer-use grants browsers click/type access only through the
   Claude-in-Chrome extension, never directly; Safari has no such
   extension, so Safari can only ever be *viewed* via computer-use, not
   driven. This alone makes a Safari-driven VoiceOver walkthrough
   structurally impossible with the tools available in this session —
   not a one-time denial (unlike an earlier Batch 7 attempt, which was
   an explicit user denial of the same grant), but a standing
   architectural limitation of the read-only browser tier.
2. **User-recommended pivot**: enable VoiceOver via the system-level
   `Cmd+F5` shortcut (sent while a *non-browser*, fully-granted app —
   VoiceOverユーティリティ — is frontmost, since sending it while a
   browser is frontmost is itself blocked by the same read-only-tier
   check), then drive **Chrome** interactively via the Claude-in-Chrome
   MCP (which has full click/type/keyboard capability, unlike
   computer-use's browser handling) while using computer-use
   screenshots to observe VoiceOver's on-screen caption panel as visual
   evidence of what VoiceOver would be announcing.

This method is real and would have worked in principle — VoiceOver
operates via the OS accessibility API and does support Chrome (not
exclusively Safari) — but it never reached the point of testing the
app itself.

## What actually happened (full step log: `docs/qa/evidence/batch-8/attempt-log.json`)

1. Requested and received `full` access to VoiceOverユーティリティ and
   `read` access to Google Chrome (for observation).
2. Opened VoiceOverユーティリティ, confirmed the caption panel setting
   was already enabled (`パネルとメニュー > キャプションパネルを表示`
   ✓) — no configuration needed there.
3. Via Claude-in-Chrome: created a tab, navigated to
   `http://localhost:5199`, and seeded `soro-pon.skin.v1=yorunoshirube`
   plus the `animal-starter` deck fixture into `localStorage` via
   `javascript_tool` — the app was in a ready, testable state.
4. Sent `Cmd+F5` via computer-use with VoiceOverユーティリティ
   frontmost. The key press succeeded, and the follow-up screenshot
   showed a focus-highlight rectangle around a Chrome tab title —
   consistent with VoiceOver having actually activated.
5. **VoiceOver's own first-launch "ようこそ" (welcome/quickstart)
   dialog appeared and became the frontmost window.** This dialog's
   process (`VoiceOverクイックスタート`) is not resolvable through
   `request_access` by any name tried (`com.apple.VoiceOverQuickstart`,
   `VoiceOverクイックスタート`) — the tool reported the app index on
   this machine is incomplete (Spotlight partially/not indexed) and
   that the request was **never even shown to the user**, because the
   name couldn't be resolved at all.
6. Three different attempts to get past this dialog were made and all
   failed with the identical error (`"VoiceOverクイックスタート" is not
   in the allowed applications and is currently in front`):
   pressing Return, toggling `Cmd+F5` again (to turn VoiceOver back
   off), and directly left-clicking the visible checkbox inside the
   VoiceOverユーティリティ window underneath it.
7. Per this batch's own instruction not to retry indefinitely, no
   further attempts were made after the third identical block.

**Result: BLOCKED before a single one of the planned 20 flows could be
exercised.** Zero VoiceOver speech/caption content was ever observed;
zero interaction with the app occurred under VoiceOver.

## Attempt 2 (same-day retry): user pre-dismissed the quickstart dialog

The user manually dismissed VoiceOver's quickstart dialog outside of
this session and disabled its "show at launch" setting, then asked for
a retry with the same Chrome+VoiceOver method.

1. Repository re-verified fresh: `HEAD == origin/main == b549f82`,
   worktree clean — confirmed before any new action, per the standing
   duplicate-work-avoidance rule.
2. App re-seeded (yorunoshirube skin + animal-starter deck) via
   Claude-in-Chrome.
3. `Cmd+F5` sent again with VoiceOverユーティリティ frontmost.
   Screenshot confirmed: **no quickstart dialog appeared this time**
   (the "起動時にようこそダイアログを表示" checkbox was now unchecked,
   matching what the user described).
4. However, the very next computer-use action (a left-click on a
   checkbox inside VoiceOverユーティリティ's own window, which has
   `full` access) failed with: `"Click at these coordinates would land
   on 'VoiceOver', which is not in the allowed applications."` —
   **VoiceOver itself**, not a specific dialog this time, is now
   reported as the frontmost application for every click/key action.
   `request_access` for `"VoiceOver"` and `"com.apple.VoiceOver"` both
   failed to resolve (same "not installed/indexed" result as the
   quickstart dialog in Attempt 1).
5. computer-use `screenshot` (a read-only action) continued to work
   throughout — only click/key actions were blocked.
6. Pivoted to driving the app via **Claude-in-Chrome's own keyboard
   dispatch** (`Tab`, sent to the specific tab, which does not go
   through computer-use's frontmost-app gate at all) while using
   computer-use screenshots to look for VoiceOver's caption panel.
   The follow-up screenshot showed an orange-highlighted focus box —
   but zoomed inspection showed it had landed on a **macOS Dock item
   tooltip**, not inside the Chrome page content. No caption-panel text
   describing any soro-pon UI element was ever visible.
7. Conclusion: computer-use is structurally unable to interact with
   anything while VoiceOver is active (VoiceOver itself, as a
   system-wide overlay, cannot be added to the app-allowlist), and
   routing keyboard input through Claude-in-Chrome instead does not
   reliably keep VoiceOver's focus inside the target page. **Zero
   VoiceOver caption/speech content was confirmed observed.**

Per the user's own contingency plan, this attempt's stopping point was
to propose a human-operator/agent-recorder collaborative mode. The user
initially received that proposal, then — in place of doing the manual
walkthrough — asked for a further Claude-Code-only attempt (Attempt 3)
using OS-level automation APIs instead of computer-use.

## Attempt 3 (same-day, Claude-Code-only, no user manual operation)

Per explicit instruction, five alternative automation routes were
evaluated for their ability to either (a) drive VoiceOver's own
keyboard navigation, or (b) read VoiceOver's actual focus/caption
output — not merely inspect the browser's DOM or accessibility tree.
Full step-by-step detail: `docs/qa/evidence/batch-8/attempt-3-claude-code-only.json`.

| Route | Result | Classification |
|---|---|---|
| macOS Accessibility API (`AXIsProcessTrusted()` via ctypes) | Returned `0` (false) — this process is not Accessibility-trusted | Environment limitation |
| AppleScript / System Events (`osascript`) | `-1743`: "System Eventsに Apple Eventsを送信する権限がありません" (Automation permission not granted) | Environment limitation |
| Self-remediation via System Settings (computer-use) | `request_access` for System Settings **denied** | Environment limitation — no path to grant the needed permission without human GUI interaction, which was unavailable |
| CGEvent keyboard injection (`CGEventPost`, ctypes) | Event created and posted without an API-visible error, but `CGEventPost` has no success/failure return value, and Apple's documented behavior is that synthetic events to the HID event tap have no effect from an untrusted process (already confirmed untrusted above) — no verifiable effect | Environment limitation (same root cause) |
| Playwright / CDP (`page.accessibility` snapshot, `keyboard.press`, locator focus) | Fully functional, but explicitly **does not exercise or observe VoiceOver at all** — it drives/inspects the browser directly via CDP, independent of any screen reader. Not used as a substitute claim, per this batch's own rule that accessibility-tree snapshots do not count as real VoiceOver confirmation. | Available, but insufficient by the batch's own acceptance criteria |

**All three permission-gated routes (AX API, AppleScript/System Events,
self-remediation via System Settings) are blocked by the same root
cause: this session's Claude Code process holds neither the macOS
Accessibility trust nor the Automation (Apple Events) trust required,
and no path exists within this session to grant either without a human
directly clicking "Allow" in a System Settings permission dialog** —
access to System Settings itself was denied. CGEvent injection depends
on the same Accessibility trust and is therefore equally blocked in
practice (its API doesn't confirm failure, but Apple's documented
behavior makes success without that trust exceedingly unlikely, and no
observed effect confirms this).

**Result: BLOCKED again.** Zero VoiceOver focus movement or
caption/speech output was observed via any of the five routes
evaluated. The TOP-screen minimal-success condition (Phase 5: reach web
content, VoiceOver recognizes the page title/h1, VoiceOver can move
through the 5 main buttons, with real VoiceOver evidence for each) was
not met, so the batch did not proceed to the 20-flow walkthrough.

## Side effect disclosed to the user

Because the block occurred *after* VoiceOver was toggled on and *while*
its own dialog was open and un-dismissable via any available tool, the
user's actual VoiceOver state may have been left on with the quickstart
dialog still showing. This was disclosed to the user directly in-session
(not held back for this report) with the exact remediation:
press `Cmd+F5` again, or dismiss the dialog manually.

## Issues

```text
P0 found/fixed/open:  0/0/0
P1 found/fixed/open:  0/0/0
P2 found/fixed/open:  0/0/0
P3 found/fixed/open:  0/0/0
```

No accessibility findings of any kind exist this batch, because no
walkthrough occurred to produce any — this is "0 found because 0
verified," not "0 found because verified clean." Do not read this
report as evidence that the app's VoiceOver experience is good; it is
evidence that VoiceOver was never successfully exercised against it in
this environment.

```text
By design:              0
Safari limitations:     1 — Safari is only ever viewable, never
                         drivable, via computer-use (no
                         Claude-in-Chrome-equivalent extension exists
                         for Safari in this environment). This is a
                         tooling-architecture fact of this session's
                         environment, not a statement about real
                         Safari's own capabilities.
VoiceOver limitations:  1 — once VoiceOver's own onboarding dialog
                         became frontmost, it could not be dismissed
                         through any available permission-granting
                         mechanism (unindexed by Spotlight, unresolvable
                         by any name tried), and while frontmost it
                         blocked all further computer-use interaction
                         with the entire desktop, not just the browser.
Environment limitations: 4, across all 3 attempts —
                         (1) Attempt 1: unindexed VoiceOver quickstart
                             dialog blocked all computer-use interaction
                             once frontmost.
                         (2) Attempt 2 (after the user pre-disabled the
                             quickstart dialog): computer-use is
                             structurally unable to interact with
                             anything while VoiceOver itself is active,
                             since VoiceOver — not a specific dialog —
                             is reported as the frontmost app and cannot
                             be allowlisted.
                         (3) Attempt 3: this session's process holds
                             neither macOS Accessibility trust nor
                             Automation (Apple Events) trust, blocking
                             AXUIElement, AppleScript/System Events, and
                             (very likely) CGEvent injection.
                         (4) Attempt 3: no path exists to self-grant
                             those permissions — System Settings access
                             via computer-use was denied.
                         A session with VoiceOver's onboarding fully
                         pre-completed AND either a different
                         interaction toolchain (not gated by
                         computer-use's app-allowlist) or the necessary
                         TCC permissions pre-granted could plausibly
                         succeed where these three attempts did not.
Tooling limitations:    1 — computer-use's app-permission model assumes
                         every on-screen actor is a discrete, indexable
                         "application"; VoiceOver is a system-wide
                         accessibility overlay that doesn't fit that
                         model, so it can never be added to the
                         allowlist by any name.
Test defects:            0
Documentation defects:   0
```

## Game-specific Accessibility

Not assessed. The planned Phase 4 checks (hand-tile identification,
selected-tile announcement, discardability, current-turn recognition,
remaining-tile count, discard-pile reading order, role/wait/wildcard
information, score/rank/Result summary) all require an actual VoiceOver
session to observe, which never occurred. **No claim, positive or
negative, is made about any of these.**

## Safari Functional Scope

**Not assessed** — for the same reason as the VoiceOver walkthrough
itself: Safari is read-only via computer-use in this environment, and
no separate attempt at a non-VoiceOver Safari functional pass was made
(it would have hit the identical read-only restriction immediately).
This differs from Batch 7's Playwright WebKit validation, which is a
different, automatable browser *engine* test, not a real Safari
application test.

## Verification (re-run fresh this session, not copied forward)

No product code or test code was changed this batch (nothing was found
to fix, since nothing could be tested). All existing suites were
re-verified green to confirm this batch introduced zero regressions:

```text
pnpm typecheck:            PASS
pnpm test:                  330/330 PASS (unchanged)
pnpm skin:validate:         18/18 PASS (subset of the 330, not double-counted)
pnpm asset:image:test:      92/92 PASS (unchanged)
pnpm build:                 PASS
Chromium visual regression: 70/70 PASS (2 Result-reachability cases
  needed a re-run due to the same pre-existing non-deterministic
  match-seed duration variance documented in every prior batch's
  report — not a regression, confirmed by successful re-run)
Firefox functional QA:      25/25 PASS (unchanged)
WebKit functional QA:       25/25 PASS (unchanged)
Firefox accessibility:      21/21 PASS (unchanged)
WebKit accessibility:       21/21 PASS (unchanged)
Cross-browser visual (Firefox+WebKit): 96/96 PASS (unchanged)
```

`git diff --check`: clean. No lint or docs-validation script exists in
this repo (unchanged from every prior batch's finding).

**Batch 8 new tests: 0.** No regression tests were added, because no
defect was found to write a regression test for.

**Batch 8 incremental independent test cases: 0.** This is not a
re-count of Batch 7's 188 (that total is not repeated here) — it is the
honest number of *new* independent cases this batch actually added,
which is zero.

**Combined independent test-case total, unchanged from Batch 7: 522 +
188 = 710**, plus `pnpm typecheck` and `pnpm build` as separate
command-level verification results (not test cases with individual
counts) — same accounting convention established in the Gate 6 and
Batch 7 reports.

## Evidence Inventory

```text
docs/qa/evidence/batch-8/:
  PNG:      0
  JSON:     2  (attempt-log.json — Attempts 1 and 2's full step-by-step
                  records;
                attempt-3-claude-code-only.json — Attempt 3's route-by-
                  route evaluation of AX API / AppleScript / System
                  Settings self-remediation / CGEvent / Playwright-CDP)
  Markdown: 0
  Logs:     0
  Total:    2  (git-tracked)
```

No screenshots were saved to disk from the computer-use session (the
`save_to_disk` option was not used for the exploratory screenshots
taken while attempting to reach VoiceOver — those screenshots showed
only VoiceOverユーティリティ's settings panels and the blocked-state
error, not any actual app content, so their evidentiary value would
have been minimal). The textual attempt log is the primary and most
useful evidence for this batch, per the instruction that audio/video
recording is not required and text summaries are acceptable evidence.

Batch 7's own evidence (`docs/qa/evidence/batch-7/`, 42 files) was
**not modified** this batch — re-running Batch 7's functional/
accessibility scripts for regression-verification purposes regenerated
a few non-deterministic screenshots (match-state content varies by
random seed, same characteristic as documented for Chromium's Result
screen in every prior batch), and those regenerated files were
deliberately reverted (`git checkout -- docs/qa/evidence/batch-7/`)
rather than committed, to keep Batch 7's evidence set exactly as
originally captured and avoid attributing non-informative git churn to
Batch 8.

## RC Decision

**Desktop engine readiness**: unchanged from Batch 7 — Chromium,
Firefox, and Playwright WebKit all validated, 0 P0/P1/P2/P3.

**macOS Safari readiness**: **not validated** (real Safari application
testing, VoiceOver or otherwise, was not achievable in this
environment — see "Method" and "Safari Functional Scope" above).

**VoiceOver readiness**: **not validated, BLOCKED — across all 3
attempts this batch** (VoiceOver+Chrome via computer-use, the same
method retried after the user pre-dismissed the quickstart dialog, and
a Claude-Code-only attempt via OS-level Accessibility/Automation APIs).
Zero real screen-reader signal was gathered in any of them. This is
explicitly different from "validated and found acceptable" or
"validated and found broken" — it is "not validated at all."

**Validated public-demo scope**: unchanged from Batch 7 — Chromium,
Firefox, and Playwright WebKit (desktop, engine-level), both official
skins, landscape viewports.

**Untested scope** (unchanged from Batch 7, since Batch 8 could not
close any of it): real Safari, iOS Safari (physical device), Android
(physical device), real screen readers (VoiceOver, NVDA, JAWS),
extended memory soak, real deploy-target rollback rehearsal.

**RC status: LIMITED READY — unchanged from Batch 7.** Batch 8 did not
upgrade or downgrade RC readiness: it neither closed the
screen-reader-acceptance gap (so no upgrade is warranted) nor found any
P0/P1 regression in the app itself (so no downgrade is warranted
either). The gap this batch targeted remains exactly as open as it was
before this batch started.

**As of attempts 1-3, Batch 8 was BLOCKED** — zero flows completed, no
partial real data. This was superseded by attempt 4 below; the
BLOCKED-through-attempt-3 record is preserved for audit history.

## Attempt 4 (2026-07-23): TCC permissions granted — real VoiceOver observed, CONDITIONAL

The user granted this session's Claude Code process the macOS TCC
Accessibility and Automation permissions via the System Settings GUI
(the exact blocker identified in attempt 3). This changed everything:

**Permission state now working** (all were denied in attempt 3):
- `osascript` → System Events: succeeds (Automation/Apple Events granted).
- Deep AX reads (`AXFocusedUIElement` role/title/description/value) from
  the Google Chrome process: succeed.
- VoiceOver keystroke injection (`key code … using {control down, option
  down}`): accepted (was error 1002 in attempt 3).

**Method**: VoiceOver enabled via `Cmd+F5` (quickstart dialog stays
gone, as the user pre-disabled it). Real VoiceOver navigation commands
(VO+Right = key code 124 + ctrl+opt; VO+Space activate = key code 49 +
ctrl+opt; plus Tab/Shift+Tab/Escape) sent via `osascript` System
Events. After each command, the Chrome process's `AXFocusedUIElement`
role/name/value was read — a change tracking the VoiceOver cursor with
the correct role+name counts as real VoiceOver observation. This is
**VoiceOver + Chrome, not VoiceOver + Safari** (Safari stays read-only
via computer-use); VoiceOver genuinely supports Chrome via the OS
accessibility API, so this is real screen-reader signal, just on Chrome.

**Real VoiceOver observations (all PASS, zero product defects):**

| Screen | What real VoiceOver reported | Result |
|---|---|---|
| TOP | Page title present; all 5 main buttons reached in DOM order via VO+Right, each an `AXButton` with a correct name ("まず遊ぶ すぐに対戦をはじめます", "デッキ一覧 …", "JSONを読み込む …", "記憶帳 …", "きせかえ …"); reading order matched visual order | PASS |
| JSON import | textarea exposed as `AXTextArea` with description "デッキJSON"; 読み込む is a named `AXButton`; invalid JSON produced the "I2002" rejection, valid JSON was accepted and navigated to DeckDetail | PASS |
| Deck Editor | tab strip exposed as `AXRadioButton` group with roving selected/unselected value and names including counts ("基本"[selected], "カテゴリ (4)", "牌 (3)", "役 (1)", "ボーナス (0)"); form fields `AXTextField`/`AXTextArea` with correct descriptions "デッキ名"/"説明" and current values | PASS |
| Unsaved-changes dialog | opened on もどる with a dirty change; VoiceOver focus landed on its first button, `AXButton` "破棄してもどる" | VOICEOVER_PASS for opening and initial focus |

The unsaved-changes dialog display and initial focus were confirmed with
real VoiceOver. Escape cancellation and focus return could not be
cleanly synchronized in the live VoiceOver observation; they were
supplementally confirmed from `Dialog.tsx` (`onClose={onCancel}`) and
the existing `src/ui/components/domInteraction.test.tsx` tests. Escape
and focus return are therefore not counted as VoiceOver passes.

In the TOP, JSON Import, Deck Editor, and unsaved-dialog portions
actually traversed with real VoiceOver, no accessible-name omission,
role omission, unreadable control, or clear focus trap was observed.
Match Setup / Match / Result were not traversed and are outside that
statement's scope.

### Attempt 4 exact flow classification

| # | Flow | Classification | Evidence basis |
|---:|---|---|---|
| 1 | Page title | SUPPLEMENTAL_ONLY | Chrome window title observed; no recorded VoiceOver focus/caption for the title |
| 2 | TOP heading | SUPPLEMENTAL_ONLY | Heading/title presence recorded, but no VoiceOver-focused heading observation |
| 3 | TOP main-button order | VOICEOVER_PASS | VO+Right and AXButton focus sequence recorded |
| 4 | TOP button names and purposes | VOICEOVER_PASS | VoiceOver-following AX role/name recorded for all five buttons |
| 5 | Current skin state | BLOCKED | Not explicitly queried |
| 6 | Reach JSON Import | VOICEOVER_PASS | VoiceOver traversal continued into the screen and focused its textarea |
| 7 | JSON textarea label | VOICEOVER_PASS | AXTextArea description `デッキJSON` recorded under VoiceOver |
| 8 | Trigger invalid JSON | VOICEOVER_PASS | Named `読み込む` button activation and rejection transition recorded |
| 9 | Recognize validation error | SUPPLEMENTAL_ONLY | Error presence confirmed by accessibility tree, screenshot, and page text, not a VoiceOver focus/caption |
| 10 | Successful import | SUPPLEMENTAL_ONLY | Acceptance/navigation observed, but no corresponding VoiceOver focus/caption record |
| 11 | Deck List deck-name/action relation | BLOCKED | Deck List was bypassed via Deck Detail |
| 12 | Open Deck Editor | VOICEOVER_PASS | VoiceOver traversal was recorded on the resulting editor controls |
| 13 | Tab/section structure | VOICEOVER_PASS | AXRadioButton role/name/selected values recorded |
| 14 | Form labels and values | VOICEOVER_PASS | AXTextField/AXTextArea descriptions and values recorded |
| 15 | Unsaved dialog opens with initial focus | VOICEOVER_PASS | Dialog opened and VoiceOver focus landed on named AXButton |
| 16 | Dialog close and focus return | SUPPLEMENTAL_ONLY | Escape/cancel and focus return supported by source/unit tests; live synchronization was unstable |
| 17 | Match Setup controls | BLOCKED | Screen reached, but no clean VoiceOver cursor traversal |
| 18 | Start 3p/4p match | BLOCKED | Not executed under a clean VoiceOver cursor |
| 19 | In-match hand/turn/selection | BLOCKED | Not reached under a clean VoiceOver cursor |
| 20 | Result win/rank/score | BLOCKED | Not reached under a clean VoiceOver cursor |

```text
VOICEOVER_PASS:     9
SUPPLEMENTAL_ONLY:  5
BLOCKED:            6
NOT_APPLICABLE:     0
TOTAL:             20
```

**Screens reached but NOT cleanly VoiceOver-traversed (tooling
limitation, not a product defect):** Match Setup was reached (its page
text shows correct labels — "3人戦", "4人戦", "対局開始", player panels
"君 あなた 手牌 8 / 捨て牌 0"), but after CDP-driven screen transitions
the VoiceOver cursor / OS `AXFocusedUIElement` / DOM focus desynced
(`AXFocusedUIElement` read as null), so fresh VO-cursor role/name reads
could not be recorded for Match Setup's controls, the in-match hand/
turn/selection, or the Result score/rank. Root cause: Claude-in-Chrome
CDP interactions change the app screen without moving OS-level keyboard
focus, and Chrome resets its accessible focus to the web-area root on
window activation — together these desync the VoiceOver cursor from the
DOM after a screen transition. The underlying accessible structure of
these screens is known-good from Batch 5-7 (Match hand tiles are
`aria-pressed` buttons with names; Result content is present and
labeled) — only the *live VoiceOver-cursor traversal* of them could not
be mechanically driven in this session.

**Attempt 4 classification: CONDITIONAL.** Substantial real VoiceOver
acceptance on the core screens (TOP / JSON import / Deck Editor /
unsaved-changes dialog) with zero product defects, but the game-play
screens' real-screen-reader traversal remains open. Not COMPLETE (not
all 20 flows reached under real VoiceOver); not BLOCKED (real VoiceOver
was genuinely driven and observed for the majority of core flows).

**VoiceOver was turned OFF at the end of the session** (`Cmd+F5`,
confirmed VoiceOver process no longer running) so the machine is not
left in a screen-reader state.

**RC status: LIMITED READY, unchanged.** Attempt 4 meaningfully
narrowed the screen-reader gap (core screens now have real VoiceOver
confirmation) but did not fully close it (game-play screens still lack
real-screen-reader traversal), so no RC upgrade is claimed. No product
defect was found, so no downgrade either.

**After Attempt 4, Batch 8 status changed from BLOCKED (attempts 1-3)
to CONDITIONAL. Attempt 5 below preserves that overall status.**

## Attempt 5 (2026-07-23): Gameplay VoiceOver Acceptance — CONDITIONAL

Start HEAD: `9d0f9fb`.

The formal route used real VoiceOver in Chrome without a CDP or
Playwright click after VoiceOver was enabled:

1. Keyboard focus was prepared on TOP while VoiceOver was off.
2. VoiceOver was enabled, synchronized to `まず遊ぶ`, and `VO+Space`
   opened Match Setup.
3. `VO+Right` traversed Match Setup and `VO+Space` on `対局開始`
   opened Match.
4. VoiceOver traversed the turn, remaining tiles, players,
   role-candidate text, and named hand-tile controls.
5. `クマ` changed from AX value `0` to `1`; `捨てる` changed from
   disabled to enabled; `VO+Space` discarded it. Remaining tiles
   changed from 56 to 55 and the human discard count from 0 to 1.

### Match Setup

Real VoiceOver reached the `対局設定` heading, `動物スターター / 通常版`,
the `3人戦` and `4人戦` buttons, player panels, and `対局開始`. The
product intentionally supports only 3-4 players; no 2-player control
exists. The current player-count selection was not announced because
the toggle buttons lacked a selected state. This confirmed **P2 product
defect** was fixed by adding `aria-pressed`; a component test verifies
the initial state and 3→4 transition. The fix passed all regressions,
but was not re-run with real VoiceOver, so this criterion remains
`SUPPLEMENTAL_ONLY`.

### Match

Real VoiceOver exposed `残り牌 56`, `手番 あなた`, `捨てる牌を選ぶ`,
player/discard information, role-candidate text, and hand tiles as
named toggle controls. One tile was selected and discarded entirely
with VoiceOver commands. The selected state and discard-button
disabled/enabled transition were observed through caption and AX value
changes. Focus stayed in the web area during the formal operation.

### Result and second skin

With VoiceOver off, the existing product QA route reached a populated
Result: `対戦結果`, `ロン / あなた`, ranking `あなた / トモリ / ナギ`,
total `145`, `もう一局`, and `TOPへ` were visually present. When
VoiceOver was re-enabled and synchronized to keyboard focus, replay was
unexpectedly activated and a new match opened. Result is therefore not
counted as a VoiceOver pass.

`yorunoshirube` received the formal real-VoiceOver traversal.
`cute-pop` passed unit, Chromium, Firefox, Playwright WebKit, automated
accessibility, and visual regressions, but no clean real-VoiceOver
gameplay traversal. Automated parity is supplemental only.

### Attempt 5 exact flow classification

| # | Flow | Classification |
|---:|---|---|
| 1 | Match Setup heading | VOICEOVER_PASS |
| 2 | Selected deck name | VOICEOVER_PASS |
| 3 | 3-player control | VOICEOVER_PASS |
| 4 | 4-player control | VOICEOVER_PASS |
| 5 | Current player-count selection | SUPPLEMENTAL_ONLY (P2 fixed; no real-VO retest) |
| 6 | 2-player control | NOT_APPLICABLE (unsupported by design; control absent) |
| 7 | Start match | VOICEOVER_PASS |
| 8 | Reach Match / identify screen | VOICEOVER_PASS |
| 9 | Current turn and remaining tiles | VOICEOVER_PASS |
| 10 | Player information | VOICEOVER_PASS |
| 11 | Hand and tile names | VOICEOVER_PASS |
| 12 | Selected tile state | VOICEOVER_PASS |
| 13 | Discard disabled/enabled state | VOICEOVER_PASS |
| 14 | Execute discard and observe change | VOICEOVER_PASS |
| 15 | Role-candidate information | VOICEOVER_PASS |
| 16 | Win controls (ロン/ツモ) | SUPPLEMENTAL_ONLY |
| 17 | Reach populated Result | SUPPLEMENTAL_ONLY |
| 18 | Understand winner/result summary | BLOCKED |
| 19 | Understand ranking/scores | BLOCKED |
| 20 | Replay / return to TOP focus order | BLOCKED |

```text
VOICEOVER_PASS:     13
SUPPLEMENTAL_ONLY:   3
BLOCKED:             3
NOT_APPLICABLE:      1
TOTAL:              20
```

```text
P0 found/fixed/open: 0/0/0
P1 found/fixed/open: 0/0/0
P2 found/fixed/open: 1/1/0
P3 found/fixed/open: 0/0/0

Unit:                        331/331 PASS
skin:validate:                18/18 PASS (unit subset)
Asset image:                  92/92 PASS
Chromium visual:              70/70 PASS
Firefox functional:           25/25 PASS
Playwright WebKit functional: 25/25 PASS
Firefox accessibility:        21/21 PASS
Playwright WebKit a11y:       21/21 PASS
Cross-browser visual:         96/96 PASS
typecheck/build:              PASS
New independent cases:        1
Combined independent cases:  711
```

Chromium visual initially passed 67/70; three known non-deterministic
Result-reachability timeouts passed on a targeted single-worker rerun.

Evidence: `attempt-5-gameplay-voiceover.json`,
`attempt-5-focus-log.json`, `attempt-5-caption-log.json`, and 13 PNGs
under `docs/qa/evidence/batch-8/`.

**Attempt 5: CONDITIONAL. Batch 8 overall: CONDITIONAL.** Match Setup
and Match are materially validated with real VoiceOver, the confirmed
P2 was fixed, and no P0/P1 is open. COMPLETE is not claimed because
Result comprehension and second-skin gameplay remain unverified with
real VoiceOver.

**RC status: LIMITED READY.** Chrome + VoiceOver is validated only for
the recorded TOP/import/editor and Match Setup/Match scope. Safari +
VoiceOver, NVDA, JAWS, iOS/iPadOS Safari, Android, extended memory soak,
and real deploy-target rollback remain untested.

## Next Fixed Task

```text
Next task: unresolved VoiceOver remediation

Reason: Attempt 5 closed the Match Setup and Match gaps but did not
obtain a clean real-VoiceOver traversal of Result or `cute-pop`. The
next bounded task is to prepare Result while VoiceOver is off,
establish a non-activating focus anchor, traverse winner/ranking/score
and replay/TOP controls with VoiceOver, then perform the minimum parity
traversal on `cute-pop`.

Entry condition: explicit instruction to retry gameplay VoiceOver
acceptance, or explicit instruction to instead pursue one of the other
open items (physical
iPhone/iPad Safari validation, physical Android validation, extended
memory soak, real deploy-target rollback rehearsal).

Stop condition: same evidence discipline as every prior batch — real
checks, not assumptions; honest scope statements; P0/P1 = 0 before any
RC upgrade claim.

Do not begin Gate 7/8 without an explicit plan naming that as the goal.
```
