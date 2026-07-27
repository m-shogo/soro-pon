# Batch 13 Handoff

## Current state

```text
result: CONDITIONAL
RC: LIMITED READY
execution candidate: 2a447930ad6d1181dd0cc9c648b07ae3534dd081
preview branch: codex/batch13-preview
draft PR: https://github.com/m-shogo/soro-pon/pull/10
CI run: 30237605574
Integrity run: 30237605563
```

UI/product/test work is committed. Local integrity 101, unit 432, skin 18,
visual 80, supplemental cross-browser 96, build, and Python 92 are green.
Stable Safari 26.4 reached Result in all four skin/player combinations.

## External operation waiting

Cloudflare Dashboard sign-in is the only human account operation requested.
After sign-in:

1. Create/connect Pages project to `m-shogo/soro-pon`.
2. Use production branch `main`, command `pnpm build`, output `dist`, Node 24.
3. Capture the `codex/batch13-preview` deployment URL and ID.
4. Run `B13_DEPLOY_URL=<url> pnpm qa:batch13:deployed-smoke`.
5. Only after Preview PASS, fast-forward the exact SHA to `main`.
6. Run production smoke.
7. Use two successful production deployments to prove formal rollback and
   current restore; do not use a Preview deployment as the rollback target.

## Residual blockers

- Safari rotation/soak: `BLOCKED`, 4/20 cycles, 190/1,200 seconds.
- Safari＋real VoiceOver mandatory flow: `BLOCKED`; only Safari web-content
  recognition and TOP static caption are `VOICEOVER_PASS`.
- Safari console/page/network: `NOT TESTED`.
- Cloudflare Preview/production/rollback/current restore: not complete until
  real URLs and deployment history pass smoke.

VoiceOver was turned off and its process absence confirmed. Safari was not
quit because it was a pre-existing user application.

Physical iPhone Safari remains `KNOWN UNVERIFIED` /
`POST-RELEASE DEVICE GATE`, not an RC or production blocker. Do not promote
macOS Safari, Playwright WebKit, or Simulator results into that claim.

Canonical details:

- `docs/qa/BATCH-13-UI-SAFARI-CLOUDFLARE-REPORT.md`
- `docs/qa/BATCH-13-UI-SAFARI-CLOUDFLARE-MATRIX.md`
- `docs/qa/RELEASE-DEPLOY-ROLLBACK-RUNBOOK.md`
