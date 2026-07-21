# Cache and Rollback Runbook

No production environment or CI deploy step exists for this project yet
(`.github/workflows/ci.yml` runs typecheck/test/skin:validate/build only
— there is no deploy job). This runbook describes: (1) how the current
build/cache setup behaves, verified this batch, and (2) the rollback
procedure to use once a real deploy target exists, rehearsed locally
against git history and build artifacts.

## Caching behavior (verified 2026-07-21)

- **JS/CSS**: Vite content-hashes `dist/assets/*.js` / `*.css`
  (`index-<hash>.js`). Rebuilding with no source change reproduces the
  exact same hash (`index-DvJkoUrv.js` before and after a no-op
  rebuild, confirmed this session). Rebuilding with a real content
  change (even a single `console.log` added to `main.tsx`) produces a
  different hash (`index-C9sZaXPP.js`), and reverting the source change
  reproduces the original hash again. This is the expected, correct
  behavior for long-lived immutable-asset caching: safe to serve
  `dist/assets/*` with a far-future cache header, because the filename
  itself changes whenever the content does.
- **`index.html`**: not content-hashed (fixed filename), references the
  current hashed JS/CSS by exact name. Must be served with a short or no
  cache lifetime (standard Vite-app deployment practice) so clients pick
  up new asset hashes promptly. No specific HTTP cache-control headers
  are configured in this repo yet (no server config exists) — this is a
  deploy-target concern, not an app-code concern, and is flagged here
  for whoever sets up the actual hosting.
- **Skin assets**: versioned via `skin.json`'s `version` field and a
  `?v=<version>` query string on every final asset URL (established in
  Batch 3/4, re-confirmed in Batch 5 and again in this batch's rollback
  rehearsal — zero mixed-version or 404 asset requests observed).
- **No service worker exists in this project.** There is no offline
  cache, no background sync, no "app shell" precache. Do not describe
  this app as a PWA or claim offline support — it is a plain SPA that
  requires a network fetch of `index.html` + hashed assets on load.
- **Missing-asset fallback**: skin slots not yet promoted to `final`
  render via CSS fallback (documented extensively in
  `docs/ASSET-PRODUCTION-ROADMAP.md`); this is unrelated to
  deploy/cache concerns and was not re-tested here (unchanged since
  Batch 5).

## Rollback rehearsal (local, build-artifact based)

Since no production environment exists, "rollback" here means: **can an
older build safely take over from a newer one, and vice versa, without
losing or corrupting a user's local data?** This is the concrete risk
for a local-first SPA with no server-side state.

Rehearsed 2026-07-21 via `scripts/gate6-qa-03-rollback-rehearsal.mjs`:

1. `git worktree add /tmp/soro-pon-rollback-rehearsal <old-commit>` —
   checks out a prior commit into an isolated directory without
   touching the main working tree.
2. `pnpm install --frozen-lockfile && pnpm build` in that worktree.
3. Serve it (`pnpm preview --port 4174`) alongside the current build
   (`pnpm preview --port 4173`).
4. Verify:
   - the old build boots cleanly on its own,
   - the old build reads data written by the new build without loss
     (a rollback's realistic scenario: deploy new, discover a problem,
     roll back — the user's browser already has new-build data),
   - the new build reads data written by the old build without loss
     (roll-forward safety, symmetric check),
   - the old build's own bundled skin package resolves without 4xx/5xx
     and applies (`data-skin` attribute set).
5. `git worktree remove <path> --force` to clean up.

Result this batch (old commit = `9b9ba1a`, pre-Batch-5): **all 7 checks
passed** — see `docs/qa/evidence/batch-6/rollback/`. No data loss in
either direction; this is expected because the localStorage schema
version (`literal(1)`) has not changed across any of the Batch 5/6 work
— only application code (recovery logic, new toasts) changed, not the
data shape it reads/writes.

### Procedure to use once a real deploy target exists

```text
1. Identify the last known-good deployed commit/tag.
2. Build that commit from a clean checkout (do not reuse a possibly
   stale dist/ from a different commit).
3. Deploy that build to the target, replacing the broken one.
4. Smoke test: boot, deck list loads, one match reaches Result, skin
   switch works, reset path visible. (Same checks as Gate 4/5's
   Never-Demo list.)
5. If the rollback build cannot read data written by the build being
   rolled back from (only possible if a future change bumps the
   storage schema's version literal without a corresponding read-path
   fallback in the OLD build — this is why schema version bumps must
   ship with the read-path already tolerant, ahead of time, per
   docs/release/STORAGE-RECOVERY-POLICY.md), the fallback is: the
   read-path's quarantine-to-backup-key behavior means the user's data
   is preserved in a *-corrupt-backup key even if the old build can't
   parse it — nothing is silently deleted. Manual data recovery from
   that backup key would be the last resort, not automatic.
```

### What this rehearsal deliberately does NOT cover

- Real deploy infrastructure (none exists yet) — CDN invalidation,
  blue/green swaps, DNS, etc. are out of scope until a deploy target is
  chosen.
- Skin *package* rollback in the Gate 7 sense (installed/paid skins with
  independent versioning, entitlement, atomic-switch-or-previous-stays
  guarantees) — Gate 7 is explicitly out of scope for Gate 6.
- Git history rollback (force-push, rebase) — never used as a rollback
  mechanism; rollback here means redeploying an older *build*, not
  rewriting history.
