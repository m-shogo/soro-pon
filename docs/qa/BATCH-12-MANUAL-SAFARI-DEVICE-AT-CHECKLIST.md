# Batch 12 — Manual Safari / Device / Assistive Technology Checklist

This runbook is for a human operator on the exact frozen artifact. It does not
authorize production deployment, security-setting changes, device enrollment,
or capture of personal data. Use only non-private fixtures from `samples/`.

## Session preflight

1. Copy the template at
   `docs/qa/evidence/batch-12/templates/session-evidence.json`.
2. Record UTC start time, execution SHA, aggregate artifact hash, browser/OS
   version, generic device model, screen size, and orientation.
3. Do not record the Mac/device name, account name, serial/UDID, local absolute
   path, cookies, tokens, or imported personal payloads.
4. Confirm the target URL serves the frozen artifact hash. A LAN preview is
   local-only and is not a deploy.
5. Start console/network capture when available. Set `Video` to the redacted
   file name or `none`.

## Stable macOS Safari

For each official skin and both 3-player and 4-player paths:

- boot and TOP rendering;
- skin switch and reload persistence;
- valid JSON import and invalid JSON rejection;
- same-ID overwrite opening, cancel without write, then explicit confirmation;
- Deck Detail and Deck Editor;
- Match Setup, match start, tile selection/discard, reach when available,
  tsumo or ron, Result, TOP return, and replay;
- corrupted stored payload fail-safe and old-schema fixture;
- reload, back/forward, two tabs, background/foreground;
- storage quota boundary using the harness fixture only;
- console errors, page errors, unhandled rejection, failed requests, dead end,
  double action, and visible corruption.

For rotation, record one JSONL row per completed cycle. Stop only after at least
20 cycles or 20 elapsed minutes, and record Result count, failures, classified
errors, navigation aborts, and known benign noise. Do not claim leak absence.

## Physical iPhone / iPad

Run iPhone and iPad as separate sessions:

- landscape expectation, portrait transition, viewport and safe areas;
- browser chrome expanded/collapsed, notch/Dynamic Island/home indicator;
- text zoom and a non-default page zoom;
- background/foreground, sleep/resume, Safari restart, and device restart if
  the reviewer explicitly elects to perform it;
- tap, rapid tap, double tap, long press, scroll, drag, edge taps;
- focus, dialog, text input, select, keyboard show/hide;
- file import and share-sheet path when available;
- reload/restart storage retention, private browsing behavior, quota error,
  corrupted/legacy payload, same-ID cancel/confirm, dedupe-before-cap, and
  `lastMatchKey` invariant;
- both skins, 3-player and 4-player Match Setup → Detail → Game → Result → TOP;
- replay and repeated games when feasible;
- clipping, overlap, unreachable control, accidental double start, dead end,
  and state loss.

Simulator results must use `SUPPLEMENTAL_ONLY` and must not populate physical
device PASS gates.

## VoiceOver

VoiceOver must be truly enabled and a human must listen to or read its actual
output. AX-tree automation is supplemental only.

Traverse TOP, JSON Import, Deck Editor, overwrite confirmation, Match Setup,
3/4-player selection, skin selection, Deck Detail, Game, Result, TOP return,
unsaved dialog, and error UI. At each screen record:

- heading and landmark navigation;
- reading and focus order;
- button names and selected/checked/radio semantics;
- modal name/description, focus trap, dismiss, and focus return;
- live-region/dynamic update and Result announcement;
- hidden or duplicate announcements;
- unreachable controls or focus loss.

Classify each row as `VOICEOVER_PASS`, `SUPPLEMENTAL_ONLY`, `BLOCKED`, or
`FAIL`. If operation succeeded but spoken/caption evidence cannot be observed,
do not upgrade it to `VOICEOVER_PASS`. Confirm VoiceOver is OFF at session end
and record that observation.

## Android / NVDA / JAWS

- Android: physical device, current Chrome, both skins, 3/4-player flow,
  orientation/touch/storage/import/Result, and console/network when available.
- NVDA: approved Windows environment, Chrome or Edge, real NVDA speech, keyboard
  traversal, dialogs, live regions, game updates, and Result.
- JAWS: approved Windows environment, licensed JAWS, Chrome or Edge, the same
  traversal recorded independently from NVDA.

Responsive mode, browser emulation, macOS VoiceOver, or another screen reader
cannot pass these gates.

## Session close

Record UTC end time, completed/failed/blocked scenario IDs, Result count, cycle
count, console/page/network error counts, defect classifications, evidence file
names, exact claim scope, explicit non-claims, and concrete unblock steps.

