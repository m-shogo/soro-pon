# Batch 10 — Real Device / Production Release Validation Report

Date: 2026-07-24. Contract (fixed before execution):
[BATCH-10-REAL-DEVICE-RELEASE-MATRIX.md](./BATCH-10-REAL-DEVICE-RELEASE-MATRIX.md).
Deploy runbook produced by this batch:
[RELEASE-DEPLOY-ROLLBACK-RUNBOOK.md](./RELEASE-DEPLOY-ROLLBACK-RUNBOOK.md).

Not a new feature Gate. Gate 6 remains PASS. Batch 8 (CONDITIONAL) and
Batch 9 (COMPLETE) results, scopes, and evidence are unchanged by this
batch.

> Current-status note (2026-07-27): Batch 12 device discovery saw the paired
> iPhone 16 record but an unavailable tunnel, so no new physical-iPhone PASS was
> claimed. Use the Batch 12 report for current device availability; retain this
> report as historical evidence for its own session.

## 1. Executive result

**CONDITIONAL.**

Everything executable in this environment was executed and passed: the
production build was validated end-to-end and soaked for 35 minutes with
zero product defects. But 14 of the 17 matrix items are
`BLOCKED_ENVIRONMENT` — real iPad/Android hardware, a deploy target, a
Windows machine, and a drivable Safari simply do not exist in this
session — so the batch cannot be COMPLETE. Each blocked item carries a
concrete, tested unblock path (§12).

## 2. RC readiness

**`LIMITED READY` — unchanged.**

Per the matrix's own rule, RC stays LIMITED READY while real-device,
real-deploy, and real-AT items are blocked. Batch 10 did **not** promote
readiness; it converted vague open items into precisely-scoped, unblock-
documented ones, and added production-build evidence that previously did
not exist at all (every prior batch tested the dev server).

## 3. Environment inventory

```text
Host OS:       macOS 26.4.1 (25E253)
Node / pnpm:   v24.15.0 / 11.1.2
Chromium:      149.0.7827.55 (Playwright-bundled)
Safari:        26.4 installed — NOT drivable (see §8)
Xcode:         present
Build type:    production (vite build → vite preview), port 4199
Real iPhone:   CONNECTED — iPhone 16 (iPhone17,3), iOS 18.7.8 (22H352)
               — present but not drivable/observable (see §7)
Real iPad:     none
Real Android:  none; adb not installed
Cloud devices: none configured
Windows:       none (no machine, no VM software, no VM images)
NVDA / JAWS:   unavailable (require Windows)
Deploy target: none (no hosting config, deploy script, service worker,
               base path, or CI deploy job)
```

Device identifiers, hostnames, serial numbers, and account information
were deliberately **not** recorded in any evidence file.
Evidence: `evidence/batch-10/environment-probe.json`.

## 4. Results by test ID

| Test ID | Result | Evidence |
|---|---|---|
| B10-PROD-01 production build generation | **PASS** | `prod-build.log`, `prod-artifact-inventory.txt` |
| B10-PROD-02 production preview core flows | **PASS** (14/14) | `prod-flows-summary.json`, `prod-flows/*.png` (9) |
| B10-PROD-03 production build soak | **PASS** | `soak-b10-prod-soak.jsonl` (47), `-summary.json`, `shots/*` (4) |
| B10-IOS-01 iPhone Safari core flows | `BLOCKED_ENVIRONMENT` | `environment-probe.json` |
| B10-IOS-02 iPhone Safari match to Result | `BLOCKED_ENVIRONMENT` | same |
| B10-IOS-03 iPhone orientation/viewport/safe-area | `BLOCKED_ENVIRONMENT` | same |
| B10-IPAD-01 iPad Safari core flows | `BLOCKED_ENVIRONMENT` | same |
| B10-IPAD-02 iPad Safari match to Result | `BLOCKED_ENVIRONMENT` | same |
| B10-ANDROID-01 Android Chrome core flows | `BLOCKED_ENVIRONMENT` | same |
| B10-ANDROID-02 Android Chrome match to Result | `BLOCKED_ENVIRONMENT` | same |
| B10-DEPLOY-01 deploy rehearsal | `BLOCKED_ENVIRONMENT` | same + runbook §STATUS |
| B10-DEPLOY-02 deployed smoke test | `BLOCKED_ENVIRONMENT` | same |
| B10-ROLLBACK-01 rollback rehearsal | `BLOCKED_ENVIRONMENT` | same |
| B10-ROLLBACK-02 post-rollback consistency | `BLOCKED_ENVIRONMENT` | same |
| B10-AX-SAFARI-01 Safari + VoiceOver | `BLOCKED_ENVIRONMENT` | `environment-probe.json` (exact WebDriver error) |
| B10-AX-NVDA-01 Windows + NVDA | `BLOCKED_ENVIRONMENT` | same |
| B10-AX-JAWS-01 Windows + JAWS | `BLOCKED_ENVIRONMENT` | same |

Totals: **PASS 3 / BLOCKED_ENVIRONMENT 14 / FAIL 0 / NOT_RUN 0**.

## 5. Production build result

### B10-PROD-01 — build

```text
commit:    eb1f16a04163812b1e5066b4fcf659cba6839f57
typecheck: pass
unit:      331/331 pass (27 files)
skin:      18/18 pass
build:     success, 141 modules, 478 ms (vite 6.4.3)
artifacts: dist/index.html                 477 B    sha256 10434bed598c3d4c…
           dist/assets/index-o4gla2TO.css  25,817 B sha256 b71c0f55f3205cea…
           dist/assets/index-DYarRbgb.js   419,657 B sha256 528f1ff72d560732…
           (+ 3 skin tokens.css, 51 files total, 8.5 MB incl. skin PNGs)
```

### B10-PROD-02 — core flows on the production artifact (14/14 PASS)

TOP render, JSON Import rejection of invalid JSON with visible reasons,
valid import → Deck Detail, Deck Editor open, Deck Editor もどる → Deck
Detail, 3p match → Result (yorunoshirube), Result → TOP, skin switch to
cute-pop, 4p match → Result (cute-pop), reload restoring
skin+decks+records, and the four error counters: **0 page errors, 0
console errors, 0 unhandled promise rejections, 0 non-benign failed
requests** (1 navigation-cancelled fetch, the known benign class).

### B10-PROD-03 — production soak

```text
Duration:    35.0 min continuous          Cycles: 47
Scenarios:   all 13 rotated (S1-S14)      Matches to Result: 17/18
Page errors: 0    Console errors: 0    Aborts: 0    Cycle exceptions: 0
Failed requests: 11 — all ERR_ABORTED, all inside S13's double reload
```

Post-warm-up trends (matrix thresholds in brackets):

| Metric | first-10 → last-10 | Verdict |
|---|---|---|
| Heap (post-GC) | 5.32 MB → 5.10 MB (**−4.2%**) [≤+20%] | PASS |
| DOM nodes | 203 → 201 (−1.0%) [≤+10%] | PASS |
| jsEventListeners | 183 → 183 (0%) [flat] | PASS |
| Live timers | 0 → 0 [no per-cycle climb] | PASS |
| localStorage | 18.7 KB → 21.9 KB (+17%) [bounded by design] | PASS |
| Match cycle p95 | 310 s → 177 s (−43%) [≤+25%] | PASS |

Heap 8-cycle bucket medians: 4.89 → 4.99 → 5.20 → 5.14 → 4.75 → 4.88 MB
— oscillating, no monotonic climb. The 1 non-completing match (cycle 8,
S5 replay) hit the harness's own 4-minute autoplay cap at exactly 240 s
with normal progress and no error: harness limitation, not a defect.

### Production vs dev comparison

Same harness, same scenario rotation, same browser; dev figures are
Batch 9's 62.3-min run.

| Metric (median over run) | Production preview | Dev server | Reading |
|---|---|---|---|
| Post-GC heap | 4.89 MB | 7.64 MB | production is leaner (no HMR client, no dev tooling, minified) |
| DOM nodes | 201 | 203 | equivalent |
| jsEventListeners | 183 | 184 | equivalent |
| Live timers (outstanding) | **0** | **1** | see below — dev tooling, not product |
| Heap trend (first10→last10) | −4.2% | +28% (windowed artifact; buckets plateau) | neither shows a monotonic climb |
| modalChurn / skinSwitch / setupReentry | 109 / 85 / 44 ms | 114 / 75 / 43 ms | within run-to-run noise |
| deckRoundTrip / importRoundTrip / reload | 130 / 100 / 53 ms | 168 / 131 / 65 ms | production faster |
| resetCancel | 58 ms | 54 ms | within noise |

**No regression is claimed anywhere in this table.** The two directions
where production is nominally slower (skinSwitch +10 ms, resetCancel
+4 ms) are single-digit-millisecond differences on samples of 3-6 cycles
with no statistical basis for a regression claim; the matrix's
single-spike rule and the absence of a trend both apply.

The **live-timer difference was investigated rather than assumed**:
`setInterval` appears **0 times in `src/`** and **0 times in the built
production bundle**, while Vite's dev client (`node_modules/vite/dist/
client/client.mjs:472`) uses `setInterval` for its HMR ping. The single
outstanding interval seen in every Batch 9 dev cycle is therefore dev
tooling, classified `EXPECTED_BY_DESIGN`. Production carries **zero**
outstanding timers.

### Claim scope for §5

These results cover **Chromium 149 against a local production preview of
commit `eb1f16a`, for this run's duration, on macOS**. They are **not**
extended to real Safari, Firefox, WebKit, any real device, or any
deployed environment. Batch 9's dev-server memory result is likewise not
extended by this batch.

## 6. Real device result

| Device | Status | Detail |
|---|---|---|
| **iPhone** | `BLOCKED_ENVIRONMENT` | Hardware **is present and connected** — iPhone 16, iOS 18.7.8 — but there is no observation/automation path: `devicectl` provides no screenshot, no open-URL, and no input injection for a real device; Safari Web Inspector needs the macOS Safari GUI, and browsers are computer-use "read" tier here (screenshots yes, clicks/typing no). The visual judgments (text clipping, tap comfort, scroll trapping, overlap, orientation, safe-area, keyboard-over-modal, contrast) require a human observer regardless of tooling. **0 of 3 iOS test IDs executed.** |
| **iPad** | `BLOCKED_ENVIRONMENT` | No iPad connected. |
| **Android** | `BLOCKED_ENVIRONMENT` | No Android device connected; `adb` not installed; no cloud device service configured. |

No Simulator, emulator, or Chrome device emulation was used as a
substitute, and none is recorded as a real-device result.

## 7. Deploy / rollback result

```text
Deploy performed:      NO
Deployed environment:  none (no hosting provider, no target URL)
Health check:          not applicable (nothing deployed)
Rollback performed:    NO
Post-rollback check:   not applicable
```

The repository contains **no deploy contract at all**: no
vercel/netlify/firebase/wrangler/gh-pages config, no deploy script, no
service worker, no configured base path, and a CI workflow that ends at
`pnpm build`. Provisioning a hosting provider was explicitly out of
scope, and none was created.

Executable substitutes performed instead, recorded as their own weaker
claims and **never** as a deploy PASS:

```text
- production artifact generated and hashed (§5) — the thing that would
  be deployed now exists and is identified
- deploy/rollback runbook written with preflight, procedure, rollback,
  verification, cache invalidation, evidence, abort conditions, and
  ownership: docs/qa/RELEASE-DEPLOY-ROLLBACK-RUNBOOK.md
- prior local rollback rehearsal (Batch 6, git worktree + old build on a
  separate port, 7/7 PASS) remains valid and remains explicitly NOT a
  deployed-artifact rollback
```

`vite preview` is not a deploy target; `git checkout` of an older commit
is not an artifact rollback. Both statements are recorded in the runbook.

## 8. Accessibility result

| Item | Status | Detail |
|---|---|---|
| **Safari + VoiceOver** | `BLOCKED_ENVIRONMENT` | A real Safari WebDriver session was **actually attempted**, not assumed. `safaridriver` exists at `/System/Cryptexes/App/usr/bin/safaridriver` and the session request returned: *"Could not create a session: You must enable 'Allow remote automation' in the Developer section of Safari Settings to control Safari via WebDriver."* Enabling it needs GUI access plus admin authentication. **Caveat that matters: even a drivable Safari would not capture VoiceOver's spoken output** — driving Safari and hearing VoiceOver are separate capabilities, and the latter is the Batch 8 tooling limitation. **0 screens traversed under Safari+VoiceOver.** |
| **NVDA** | `BLOCKED_ENVIRONMENT` | No Windows machine, no VM software (Parallels/VMware/UTM/VirtualBox absent), no VM images. Not inferred from VoiceOver results. |
| **JAWS** | `BLOCKED_ENVIRONMENT` | Same, plus no JAWS license. Not inferred from NVDA. |

Batch 8's real-VoiceOver work was done with **VoiceOver + Chrome** and
its scope is unchanged and not extended here. No automated AX-tree or
keyboard result anywhere in this batch is recorded as a screen-reader
PASS.

## 9. Defect table

| ID | Classification | Severity | Environment | Reproduction | Disposition | Fix commit | Retest |
|---|---|---|---|---|---|---|---|
| B10-F1 | `HARNESS_DEFECT` | n/a | prod preview, Chromium | `run-batch10-prod-flows.mjs` assumed Deck Editor's もどる returns to TOP; it returns to Deck Detail | Fixed in the harness; added an explicit assertion for the real behavior | (in harness commit) | Re-ran: PASS |
| B10-F2 | `HARNESS_DEFECT` | n/a | prod preview, Chromium | Harness read `html[data-skin]` immediately after the TOP button appeared and got `null` | Investigated before judging: the attribute **is** applied (verified `data-skin=cute-pop`, token `--sp-color-ink=#55402f`), just asynchronously after skin.json loads, with UI rendering first on base tokens — `EXPECTED_BY_DESIGN`. Harness now waits for the attribute | (in harness commit) | Re-ran: PASS 14/14 |
| B10-F3 | `DOCUMENTATION_DEFECT` | n/a | docs | `docs/RELEASE-DEMO-GATES.md` "Current RC Readiness" was stale: stopped at Batch 8 Attempt 5, listed already-closed VoiceOver gaps, still listed extended memory soak as untested (closed by Batch 9), and named a stale next task | Updated to the current state | (docs sync commit) | Verified by re-read |
| — | `BENIGN_BROWSER_BEHAVIOR` | n/a | prod preview | 11 `ERR_ABORTED` fetches, all inside S13's double reload | Recorded, not fixed — fetches cancelled by navigation; same class already classified in Batch 7/9 | — | — |
| — | `ENVIRONMENT_BLOCKER` ×14 | n/a | see §3 | 14 matrix items lacking hardware/target/permission | Documented with unblock paths (§12) | — | — |

**`PRODUCT_DEFECT`: 0 (P0 0 / P1 0 / P2 0 / P3 0). No product code was
changed in Batch 10.** One harness limitation recurred (the 4-minute
per-match autoplay cap, hit by 1 of 18 production matches).

## 10. Evidence inventory

```text
docs/qa/evidence/batch-10/
  environment-probe.json            environment probe with exact errors
  prod-build.log                    typecheck/unit/skin/build log
  prod-artifact-inventory.txt       artifact hashes + sizes
  prod-flows-summary.json           B10-PROD-02, 14 results + error counts
  prod-flows/*.png                  9 screenshots (TOP, import, editor,
                                    setup, results, cute-pop, reload)
  soak-b10-prod-soak.jsonl          47 per-cycle metric lines
  soak-b10-prod-soak-summary.json   soak trends/aggregates
  shots/*.png                       4 boundary screenshots (start/15/30/final)

Totals: PNG 13, JSON/JSONL 4, logs/text 2 → 19 files.
Video: none (no real-device capture was possible).
Reports: this file + matrix + deploy runbook.
Commit: see §Git in the final report.
```

## 11. Exact claim scope

```text
Verified in this batch:
- A production build of commit eb1f16a builds cleanly and its artifacts
  are hashed and recorded.
- On a LOCAL PRODUCTION PREVIEW of that build, in Chromium 149 on macOS
  26.4.1: TOP, JSON Import (reject + accept), Deck Detail, Deck Editor,
  Match Setup, a 3p match to Result (yorunoshirube), a 4p match to
  Result (cute-pop), Result→TOP, skin switching, and reload-with-state-
  restore all work, with 0 page errors, 0 console errors, 0 unhandled
  rejections, and 0 non-benign failed requests.
- A 35-minute / 47-cycle production-preview soak in Chromium showed no
  heap, DOM, listener, or timer growth and no runtime slowdown, with
  17/18 matches reaching Result and 0 errors.
- Production carries zero outstanding JS timers; the single interval
  seen in dev is Vite's HMR ping, proven by source and bundle inspection.

NOT verified, and explicitly not claimed:
- Anything on a real iPhone, iPad, or Android device (0 flows executed).
- Anything on real Safari, or under Safari + VoiceOver (0 screens).
- Anything under NVDA or JAWS (0 screens).
- Any deploy, deployed smoke test, or deployed-artifact rollback.
- Production behavior in Firefox or WebKit (not run in this batch).
- Any extension of Batch 9's dev-server memory result to production,
  other browsers, or devices.
- Human visual/auditory judgments of any kind (no human reviewer
  participated in this batch).
```

## 12. Remaining open gates

| Gate | Owner | Required environment | Exact next action | Unblock condition | Evidence required |
|---|---|---|---|---|---|
| B10-IOS-01/02/03 | repo owner + a human reviewer | the already-connected iPhone + an observation path | Enable Settings→Safari→Advanced→Web Inspector; enable Safari's Develop menu; run `pnpm preview --host 0.0.0.0`; open the LAN URL on the device | Safari GUI is drivable (or a human operates the device) AND a named reviewer records the visual judgments | device model/OS/browser, timestamps, build hash, per-flow results, screenshots/recording, reviewer name |
| B10-IPAD-01/02 | repo owner | a real iPad | Connect an iPad, then the iOS steps above | iPad hardware present | as above |
| B10-ANDROID-01/02 | repo owner | a real Android device | `brew install --cask android-platform-tools`, connect with USB debugging, serve on LAN, run flows with a human observer | Android hardware present + adb | as above |
| B10-DEPLOY-01/02 | repo owner | a hosting provider | Follow `RELEASE-DEPLOY-ROLLBACK-RUNBOOK.md` §Unblock steps 1-7 (owner provisions the provider; secrets never committed) | staging URL reachable + deploy credentials configured | deploy time, commit/artifact hash, target URL, health check, smoke results |
| B10-ROLLBACK-01/02 | repo owner | the same deploy target with artifact history | After a successful deploy, run the runbook's Rollback section | previous artifact retrievable from provider history | rollback time, restored version, smoke results, localStorage compatibility |
| B10-AX-SAFARI-01 | repo owner + a human listener | drivable Safari + real VoiceOver | Safari → Settings → Advanced → show developer features → Develop → Allow Remote Automation (admin auth needed); then a human drives with VoiceOver on | Safari automation enabled **and** a human can hear/record announcements | per-screen traversal log, announcements, reviewer name |
| B10-AX-NVDA-01 | repo owner | Windows machine or VM + NVDA | Provision Windows, install NVDA, run TOP→Result flows | Windows environment exists | NVDA version, browser version, per-flow announcements |
| B10-AX-JAWS-01 | repo owner | Windows + licensed JAWS | Provision Windows and a JAWS license, run TOP→Result flows | license obtained | JAWS version, browser version, per-flow announcements |

Suggested next batch (not started): production-build cross-browser
validation in Firefox and WebKit, which **is** executable here and would
close a real gap without needing new hardware — while remaining, as
always, distinct from real Safari.
