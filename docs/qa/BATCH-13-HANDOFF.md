# Batch 13 Handoff

## Current authority

```text
result: BLOCKED
branch: codex/batch13-preview
product frozen SHA: 1c37c5200ad00ed6df72e5483b5af1e2aa34ff23
pushed preview candidate: e6bcb82c035b52a2cfed5b7f062da5581a9ca070
origin/main: 37110de0f5dda98411123cf0aed86069e5e97011
draft PR: https://github.com/m-shogo/soro-pon/pull/10
CI run: 30253119733 SUCCESS
Integrity run: 30253119813 SUCCESS
main merge / production deploy: NOT STARTED
```

Only the remaining Batch 13 gates below should be continued. Do not reread
Batch 8–12 in full.

## New accessibility commits

- `7465bf4` `fix(a11y): 表示専用牌を画像として伝える`
  - Game discard, Deck Detail tile and Result tile use static image semantics.
  - Interactive hand tiles keep button/toggle semantics.
- `1c37c52` `fix(a11y): 捨て牌の所有者を読み上げる`
  - Each discard label includes the player name.

The commits are pushed on `codex/batch13-preview`.

## Verification completed

- Final focused tests: 22/22 PASS.
- Final local gate on product frozen SHA `1c37c52`:
  - integrity 102/102
  - unit 434/434
  - skin 18/18
  - visual 80/80
  - Python asset 92/92
  - typecheck PASS
  - production build PASS
  - build aggregate SHA
    `db7c527e9dcbbd7545d806045f34486ac69aaf0d5d4b922cda947946f6c1b582`
- Real VoiceOver confirmed the change-affected path:
  - static discard: `フクロウ、最新の捨て牌、イメージ`
  - no button action on the static discard
  - interactive hand: `イルカ、切り替えボタン`
  - final-build owner context:
    `相手、トモリ、待機中、手牌8枚、捨て牌1枚、グループ`
  - TOP, Match Setup and Game were traversed
  - classification: `VOICEOVER_PASS`
- Deck Detail and Result reuse the verified static tile component and passed
  focused tests; overwrite dialog and focus return were unchanged and retain
  passing focused coverage. These paths are `SUPPLEMENTAL_ONLY` in this
  session, not new direct VoiceOver claims.
- VoiceOver is OFF; process absence was confirmed.
- Final post-fix Safari rotation:
  - 24/24 cycles
  - 30m54s (`1854` seconds)
  - Result reached 2 times
  - product failure 0
  - harness failure 0
  - dead-end 0
  - corruption 0
- Old pre-fix Safari rotation remains historical only:
  24/24 cycles, 30m58s PASS.
- Pushed candidate `e6bcb82c…`:
  - CI run `30253119733` SUCCESS, including `asset-python`
  - Integrity run `30253119813` SUCCESS

## Not yet complete

- Cloudflare registration/GitHub authorization completion has not been
  confirmed in chat. Preview, production, rollback and current restore are not
  started.

## Next execution order

1. After the user confirms Cloudflare registration, deploy one Preview and run
   deployed smoke.
2. Only if all mandatory gates pass: integrate PR #10 to `main`, production
   deploy, formal production rollback, current restore, final smoke/CI.
3. Synchronize report, matrix, handoff and release docs.

## Working tree / evidence

Commit only VoiceOver PNGs `23`, `26`, `27`, `28`, `31` and
`rotation-soak-final.tsv`. Other untracked captures are failed, ambiguous or
superseded and must not be used as PASS evidence.

Physical iPhone Safari remains `KNOWN UNVERIFIED` /
`POST-RELEASE DEVICE GATE`, not an RC or production blocker.

Canonical detail sources, only when needed:

- `docs/qa/BATCH-13-UI-SAFARI-CLOUDFLARE-REPORT.md`
- `docs/qa/BATCH-13-UI-SAFARI-CLOUDFLARE-MATRIX.md`
- `docs/qa/RELEASE-DEPLOY-ROLLBACK-RUNBOOK.md`
