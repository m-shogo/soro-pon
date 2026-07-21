# Batch 8 — macOS VoiceOver Acceptance Report

- Date: 2026-07-21
- Preceding work: Gate 6 (PASS, unchanged), Batch 7 (COMPLETE, RC
  LIMITED READY, browser scope Chromium+Firefox+Playwright WebKit).
  Batch 8 targets one specific Batch 7 open item: real screen-reader
  acceptance.

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
Environment limitations: 1 — the combination of (a) computer-use's
                         browser-interaction restriction and (b) the
                         unindexed VoiceOver quickstart dialog together
                         made real VoiceOver acceptance testing
                         unreachable in this specific session/machine
                         configuration. A session with either a fully
                         pre-configured VoiceOver (quickstart dialog
                         permanently disabled beforehand) or a different
                         interaction toolchain could plausibly succeed
                         where this attempt did not.
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
  JSON:     1  (attempt-log.json — the full step-by-step record of what
                was tried and exactly where/why it was blocked)
  Markdown: 0
  Logs:     0
  Total:    1  (git-tracked)
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

**VoiceOver readiness**: **not validated, BLOCKED**. Zero real
screen-reader signal was gathered. This is explicitly different from
"validated and found acceptable" or "validated and found broken" — it
is "not validated at all."

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

**Batch 8 formally closed: yes, as BLOCKED** (not CONDITIONAL — zero
flows were completed, so there is no partial real data to justify a
CONDITIONAL classification; not COMPLETE, since the batch's actual
objective was never reached).

## Next Fixed Task

```text
Next task: unresolved VoiceOver remediation

Reason: Batch 8's specific objective (real VoiceOver acceptance) was
not achieved due to environment/tooling constraints, not because the
app was found deficient. The gap remains open and is the most direct
continuation of this batch's own goal.

What a future attempt would need to succeed where this one could not,
based on what was learned this batch:
  - A way to pre-disable VoiceOver's first-launch quickstart dialog
    before ever toggling VoiceOver on (e.g., if the user has already
    completed VoiceOver's onboarding once on this machine outside of
    an agent session, the dialog may not reappear), or
  - A session environment where VoiceOver's own UI processes are
    indexed and grantable through request_access, or
  - The user driving VoiceOver directly themselves while sharing
    screen/narrating findings for the agent to record, rather than the
    agent attempting to drive VoiceOver's keyboard-modifier navigation
    itself.

Entry condition: explicit instruction to retry VoiceOver acceptance,
ideally after one of the above conditions can be arranged, or explicit
instruction to instead pursue one of the other open items (physical
iPhone/iPad Safari validation, physical Android validation, extended
memory soak, real deploy-target rollback rehearsal).

Stop condition: same evidence discipline as every prior batch — real
checks, not assumptions; honest scope statements; P0/P1 = 0 before any
RC upgrade claim.

Do not begin Gate 7/8 without an explicit plan naming that as the goal.
```
