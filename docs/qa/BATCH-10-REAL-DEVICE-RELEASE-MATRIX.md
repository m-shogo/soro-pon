# Batch 10 — Real Device / Production Release Validation Matrix

Date: 2026-07-24. Not a new feature Gate. Gate 6 remains PASS. Batch 8
(CONDITIONAL) and Batch 9 (COMPLETE) results and scopes are **not**
revisited or weakened by this batch.

Purpose: determine, precisely and without substitution, which of the
remaining RC open items can actually be validated in this environment —
production build, real devices, deploy/rollback, and real assistive
technology — and update RC readiness from what was genuinely observed.

> This matrix is fixed **before** execution. Items whose environment does
> not exist are kept as `BLOCKED_ENVIRONMENT` with concrete unblock
> steps; they are never deleted, and never satisfied by a substitute.

## Non-negotiable substitution rules

```text
Playwright WebKit            is NOT real Safari
iOS Simulator                is NOT a real iPhone/iPad
Chrome device emulation      is NOT a real Android device
Local production preview     is NOT a real deploy target
git checkout of an old commit is NOT a deployed-artifact rollback
Automated AX-tree inspection is NOT a screen-reader PASS
Batch 9's Chromium/dev-server memory result does NOT extend to
  production builds, real Safari, Firefox, WebKit, or any real device
```

Human visual/auditory judgment items (text clipping, tap comfort,
scroll trapping, UI overlap, orientation breakage, browser-chrome
interference, safe-area, keyboard-over-modal, obvious contrast
breakage, animation blocking input) are **never** marked PASS from
automation output.

## Environment inventory (probed 2026-07-24, before execution)

```text
Host OS:      macOS 26.4.1 (25E253)
Safari:       26.4 (installed; drivable only at computer-use "read" tier
              — screenshots yes, clicks/typing no)
Node/pnpm:    v24.15.0 / 11.1.2
Chromium:     149.0.7827.55 (Playwright-bundled)
Xcode:        present (/Applications/Xcode.app)
Real iPhone:  CONNECTED — iPhone 16 (iPhone17,3), iOS 18.7.8 (22H352)
              (device identifier and hostname deliberately NOT recorded)
Real iPad:    none connected
Real Android: none connected; adb NOT installed
Cloud device: no BrowserStack/SauceLabs/LambdaTest config in repo
Windows:      no machine or VM available in this session
NVDA / JAWS:  unavailable (require Windows)
Deploy target: NONE — repo has no hosting config (no vercel/netlify/
              firebase/wrangler/gh-pages), no deploy script, no service
              worker, no configured base path; CI ends at `pnpm build`
```

## Test matrix

Common columns: every item lists environment reality, PASS condition,
BLOCK condition, and the exact claim it may support. `Executable?` is
the pre-execution judgment from the inventory above; `Result` is filled
in by the report.

### Production build

| Field | B10-PROD-01 | B10-PROD-02 | B10-PROD-03 |
|---|---|---|---|
| Target | production build generation | production preview core flows | production build soak |
| Env kind | real (production artifact) | real (production artifact) | real (production artifact) |
| OS / browser | macOS 26.4.1 / n/a | macOS 26.4.1 / Chromium 149 | macOS 26.4.1 / Chromium 149 |
| Device | host Mac | host Mac | host Mac |
| Skin | both | both | both |
| Players | n/a | 3p and 4p | 3p and 4p |
| Flow | typecheck→unit→skin:validate→build | TOP/Import/DeckEditor/MatchSetup/Match/Result/TOP/skin switch/reload/storage restore | Batch 9 scenario rotation against preview |
| Expected | build succeeds, artifact hashes recorded | every flow reachable, 0 console/page errors | ≥30 min, 0 console/page errors, 0 dead ends, 0 unhandled rejections, 0 state corruption |
| Evidence | build log, artifact listing + hashes | PNG per screen + JSON | JSONL + summary JSON + boundary PNG |
| Mode | automation | automation | automation |
| PASS | exit 0, artifact present | all flows complete, error counters 0 | all soak thresholds met |
| BLOCK | build fails | preview cannot serve | preview unstable |
| Claim scope | this commit's production artifact only | production preview on Chromium only | production preview, Chromium, this run's duration only — NOT generalizable to other browsers/devices/environments |
| Executable? | YES | YES | YES |
| Result | **PASS** — build clean, artifacts hashed | **PASS 14/14** — 0 page/console/rejection/non-benign-request errors | **PASS** — 35.0 min, 47 cycles, 17/18 matches to Result, all thresholds met |

### Real iPhone (device connected, observation path absent)

| Field | B10-IOS-01 | B10-IOS-02 | B10-IOS-03 |
|---|---|---|---|
| Target | iPhone Safari core flows | iPhone Safari match to Result | orientation / viewport / safe-area |
| Env kind | real device required | real device required | real device required |
| OS / browser | iOS 18.7.8 / Mobile Safari | same | same |
| Device | iPhone 16 (connected) | iPhone 16 (connected) | iPhone 16 (connected) |
| Skin / players | both / n/a | both / ≥1 match 3p or 4p | both / n/a |
| Flow | open URL, first paint, reload, Import modal, Deck Editor, Match Setup, skin switch, background/foreground, storage restore | ≥1 full match driven to Result | portrait/landscape per spec, viewport overflow, safe-area, touch targets, scroll trapping, keyboard-over-modal |
| Expected | all flows usable, no layout breakage | Result reached and readable | no overflow, no unreachable control, no safe-area intrusion |
| Evidence | device model/OS/browser version, timestamps, URL/build hash, per-flow result, screenshots or recording, named human reviewer | same + Result screenshot | same + orientation screenshots |
| Mode | hybrid (human operation + human visual judgment) | hybrid | human |
| PASS | every flow completes AND a human confirms no visual/interaction breakage | match reaches Result, human-confirmed | human confirms all listed properties |
| BLOCK | no way to drive the device and observe its screen from this session | same | same |
| Claim scope | real iPhone Safari only; never generalized to iPad/Android/Simulator | same | same |
| Executable? | **NO — BLOCKED_ENVIRONMENT** (see below) | **NO — BLOCKED_ENVIRONMENT** | **NO — BLOCKED_ENVIRONMENT** |
| Result | `BLOCKED_ENVIRONMENT` — 0 flows executed | `BLOCKED_ENVIRONMENT` — 0 matches executed | `BLOCKED_ENVIRONMENT` — 0 checks executed |

Blocker detail (all three): the iPhone is paired and visible to
`devicectl`, but `devicectl` offers no screenshot, no URL-open, and no
input injection for a real device; Safari Web Inspector requires driving
the macOS Safari GUI, and browsers are granted only computer-use "read"
tier in this session (screenshots yes, clicks/typing no); and the visual
judgments above require a human observer regardless of tooling.

Unblock (all three): (1) enable Web Inspector on the device
(Settings → Safari → Advanced → Web Inspector) and Develop menu in
macOS Safari; (2) grant an automation path that can click in Safari, or
have a human operator drive the device; (3) serve the production preview
on the LAN (`vite preview --host 0.0.0.0`) and open that URL on the
device; (4) a named human reviewer records the visual/interaction
judgments. Resume point: B10-IOS-01 step 1.

### Real iPad / real Android (no hardware)

| Field | B10-IPAD-01 | B10-IPAD-02 | B10-ANDROID-01 | B10-ANDROID-02 |
|---|---|---|---|---|
| Target | iPad Safari core flows | iPad Safari match to Result | Android Chrome core flows | Android Chrome match to Result |
| Env kind | real device required | real device required | real device required | real device required |
| Device | none connected | none connected | none connected | none connected |
| Mode | hybrid | hybrid | hybrid | hybrid |
| PASS | as B10-IOS-01, on iPad | as B10-IOS-02, on iPad | as B10-IOS-01, on Android | as B10-IOS-02, on Android |
| BLOCK | no iPad hardware | no iPad hardware | no Android hardware, adb absent | same |
| Claim scope | real iPad only | real iPad only | real Android only | real Android only |
| Executable? | **NO — BLOCKED_ENVIRONMENT** | **NO** | **NO — BLOCKED_ENVIRONMENT** | **NO** |
| Result | `BLOCKED_ENVIRONMENT` (no iPad) | `BLOCKED_ENVIRONMENT` | `BLOCKED_ENVIRONMENT` (no Android, no adb) | `BLOCKED_ENVIRONMENT` |

Unblock (iPad): connect an iPad and repeat the B10-IOS unblock steps.
Unblock (Android): connect an Android device with USB debugging, install
platform-tools (`brew install --cask android-platform-tools`) for `adb`,
serve the preview on the LAN, then run the flows with a human observer.
Simulators and Chrome device emulation do **not** unblock these.

### Deploy / rollback (no deploy target exists)

| Field | B10-DEPLOY-01 | B10-DEPLOY-02 | B10-ROLLBACK-01 | B10-ROLLBACK-02 |
|---|---|---|---|---|
| Target | deploy rehearsal | deployed smoke test | rollback rehearsal | post-rollback consistency |
| Env kind | real deploy target required | real deploy target required | real deploy target required | real deploy target required |
| Flow | build artifact → deploy → health check | TOP/Import/MatchSetup/1 match to Result/asset 404/console errors/cache | serve previous artifact again, confirm user path restored | version check + smoke + localStorage compatibility across versions |
| Expected | deployed URL serves the new artifact | all smoke steps pass on the deployed URL | previously-good version served again, user path restored | old and new artifacts read the same stored data |
| Mode | automation + human gate | automation | automation + human gate | automation |
| PASS | health check green on a real deployed URL | smoke green on the deployed URL | serving artifact reverted and verified live | no data loss/corruption across the version change |
| BLOCK | repo has no hosting provider, deploy script, credentials, or target URL; creating one is out of scope for this batch | same | same | same |
| Claim scope | only the environment actually deployed to | same | deployed-artifact rollback only — a local build/git checkout is NOT this | same |
| Executable? | **NO — BLOCKED_ENVIRONMENT** | **NO** | **NO — BLOCKED_ENVIRONMENT** | **NO** |
| Result | `BLOCKED_ENVIRONMENT` — no deploy performed | `BLOCKED_ENVIRONMENT` | `BLOCKED_ENVIRONMENT` — no rollback performed | `BLOCKED_ENVIRONMENT` |

Executable substitute performed instead (recorded as its own, weaker
claim, not as a deploy PASS): production artifact generation, artifact
hash/immutability inspection, and a written deploy/rollback runbook —
see `docs/qa/RELEASE-DEPLOY-ROLLBACK-RUNBOOK.md`. Note Batch 6 already
rehearsed a *local* build rollback (git worktree, old commit, separate
port, 7/7 PASS); that result stands and is explicitly **not** a real
deploy-target rollback.

Unblock: choose and provision a hosting provider, add its deploy config
and credentials (secrets never committed), define staging vs production,
record the target URL, then run B10-DEPLOY-01 → B10-ROLLBACK-02 in
order. Resume point: B10-DEPLOY-01 step 1.

### Accessibility (real assistive technology)

| Field | B10-AX-SAFARI-01 | B10-AX-NVDA-01 | B10-AX-JAWS-01 |
|---|---|---|---|
| Target | Safari + VoiceOver | Windows + NVDA | Windows + JAWS |
| Env kind | real Safari + real VoiceOver | real Windows + real NVDA | real Windows + real JAWS + license |
| OS / browser | macOS 26.4.1 / Safari 26.4 | Windows / Chrome or Edge | Windows / Chrome or Edge |
| Scan scope | TOP, Import modal, JSON import controls, Deck Editor controls, Match Setup, Match controls, unsaved dialog, Result, return to TOP | TOP→Result main flows | TOP→Result main flows |
| Checks | heading, landmark, button label, modal name, focus trap, dialog initial focus, Escape, focus return, status/error announcement, disabled state, selected state, tab order, keyboard-only operation, Result transition, post-skin-switch continuity | keyboard interaction, focus, announcements, modal, errors, Result transition | same |
| Mode | human (listening) + assisted observation | human | human |
| PASS | each screen actually traversed under the real AT with correct announcements | same, under real NVDA | same, under real JAWS |
| BLOCK | Safari is read-tier in this session (no clicks/typing), so Safari cannot be driven; VoiceOver quickstart/permission dialogs are environment constraints, never product defects | no Windows machine or VM | no Windows machine, no JAWS license |
| Claim scope | real Safari+VoiceOver only — Batch 8's VoiceOver+**Chrome** results are separate and are not extended by this item | real NVDA only; never inferred from VoiceOver | real JAWS only; never inferred from NVDA |
| Executable? | **NO — BLOCKED_ENVIRONMENT** | **NO — BLOCKED_ENVIRONMENT** | **NO — BLOCKED_ENVIRONMENT** |
| Result | `BLOCKED_ENVIRONMENT` — 0 screens traversed; a real WebDriver session was attempted and refused ("Allow Remote Automation" disabled) | `BLOCKED_ENVIRONMENT` — 0 screens | `BLOCKED_ENVIRONMENT` — 0 screens |

Unblock (Safari+VoiceOver): grant Safari an automation tier that permits
clicking/typing, or have a human operator drive Safari with VoiceOver on
and record the announcements. Unblock (NVDA): provide a Windows machine
or VM with NVDA installed. Unblock (JAWS): additionally provide a valid
JAWS license. Playwright WebKit and AX-tree snapshots do not unblock any
of these.

## Finding classification (used by the report)

```text
PRODUCT_DEFECT           reproducible defect in shipped product code
HARNESS_DEFECT           the QA script's own technique was wrong
TEST_DATA_DEFECT         the fixture/seed data was wrong
ENVIRONMENT_BLOCKER      cannot be verified in this environment
BENIGN_BROWSER_BEHAVIOR  known-harmless browser behavior (e.g. fetches
                         cancelled by navigation)
EXPECTED_BY_DESIGN       matches documented/intended behavior
DOCUMENTATION_DEFECT     docs/evidence text was wrong or stale
```

Product severity: `P0` data loss / severe security / main path fully
broken; `P1` release-blocking, a normal user cannot finish a main flow;
`P2` significant but with a workaround; `P3` minor display/interaction.

## Decision criteria

**COMPLETE**: every matrix item either PASSed or is a
`BLOCKED_ENVIRONMENT` with a concrete, recorded unblock path, AND all
executable items passed, AND P0/P1 = 0.

**CONDITIONAL**: executable items passed but a material open item was
left without a concrete unblock path, or a P2 remains open.

**BLOCKED**: the executable core (production build validation) could not
be run, or a P0/P1 is open.

RC readiness terms are the existing ones only (`READY` /
`LIMITED READY` / `NOT READY`, per `docs/RELEASE-DEMO-GATES.md`).
Promotion to `READY` requires every mandatory Gate 6 requirement plus
the real-environment items above; while real-device, real-deploy, and
real-AT items remain BLOCKED, RC **stays LIMITED READY** by rule.

## Actual outcome

Executed 2026-07-24 after this matrix was fixed. Decision:
**CONDITIONAL** — PASS 3 / BLOCKED_ENVIRONMENT 14 / FAIL 0 / NOT_RUN 0.
The production build was validated end-to-end and soaked 35 min / 47
cycles with 0 product defects; the 14 blocked items each carry a tested
unblock path. RC readiness: **LIMITED READY, unchanged**. Full results:
[BATCH-10-REAL-DEVICE-RELEASE-REPORT.md](./BATCH-10-REAL-DEVICE-RELEASE-REPORT.md).
