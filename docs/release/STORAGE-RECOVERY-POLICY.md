# Storage / Migration Recovery Policy

Applies to all localStorage-backed data: `soro-pon.decks.v1`,
`soro-pon.records.v1`, `soro-pon.settings.v1`, `soro-pon.skin.v1`.
Established/hardened in Gate 6 (Batch 6); see
[BATCH-6-GATE-6-QA-MATRIX.md](../qa/BATCH-6-GATE-6-QA-MATRIX.md) for
evidence.

## Principles

1. **Never destroy *other, unaffected* data the app doesn't have to.** A
   single corrupted or legacy-schema deck entry must not take down the
   whole deck list. This does not mean the corrupted entry itself is
   always recovered — see "Guarantee scope" below.
2. **Never fail silently.** Every recovery action surfaces a
   Japanese-language `ValidationIssue` (read path, shown as a `Toast` on
   boot) or throws a catchable, translated error (write path, shown as a
   `Toast` at the point of the failed action).
3. **Never lose an in-progress user edit *while the screen stays
   open*.** If a save fails (e.g. quota exceeded), the screen that was
   mid-edit (DeckEditor, the import modal) stays open with the user's
   input intact — it does not navigate away as if the save had
   succeeded. This is an in-session guarantee only: it does not cover
   recovery after a reload or tab close while unsaved — see "Guarantee
   scope" below.
4. **Prefer partial recovery to full reset.** When only some data is
   unrecoverable, keep everything else that is recoverable.
5. **No speculative migration framework.** Reuse the deterministic,
   already-existing `migrateLegacyDeck()` (deck-schema version 0 → 1).
   Do not add a generic multi-step migration runner until a second real
   schema version actually exists.

## Guarantee scope (read this before calling anything "lossless")

Do not describe this policy as making recovery "lossless" without
qualification — it doesn't, in two specific, bounded ways:

- **Quota-exceeded writes**: the in-session draft stays visible and
  editable on screen, the user is notified via `Toast`, and
  already-*persisted* data is never overwritten by the failed write.
  What is **not** guaranteed: if the user reloads or closes the tab
  while that unsaved draft exists, the draft itself is gone — same as
  any ordinary unsaved web-form state. There is no autosave-to-a-
  separate-key mechanism.
- **Corrupted/unrecoverable deck entries**: an entry that fails both
  the current schema and legacy-migration is dropped from the active
  deck list, not restored. It is preserved only as raw, unparsed JSON
  inside a `*.corrupt-backup` key — the app does not automatically
  re-attempt parsing it or offer a restore UI for it. The guarantee is
  that *other, healthy* entries are no longer taken down with it —
  not that the corrupted entry itself comes back.

## Read path (localStorage → app state)

Implemented in `src/storage/localStorageDeckStore.ts`,
`localStorageSettingsStore.ts`, `localStorageRecordsStore.ts`.

| Condition | Behavior | Issue code |
|---|---|---|
| Key absent | Empty/default payload, no issue | — |
| JSON.parse throws | Whole key quarantined to a `*.corrupt-backup` key, reset to empty/default | `L9001` |
| Outer shape invalid, but `decks` array itself parses and every entry is either directly valid or legacy-migratable | Per-deck salvage: keep everything recoverable, reconstruct the payload, write it back | `L9002` (no data lost, only migrated) |
| Outer shape invalid, `decks` array present, but 1+ entries are unrecoverable | Salvage what's recoverable, drop the rest individually, preserve the original raw payload in the backup key | `L9003` |
| Outer shape invalid, nothing in `decks` recoverable (or `decks` missing entirely) | Full quarantine + reset (same as the pre-Gate-6 behavior) | `L9001` |
| Settings/records corrupted (any shape problem) | Reset to defaults/empty (no salvage — these are low-value, re-derivable data; deck store is the one that gets salvage because user-authored decks are irreplaceable) | `L9001` |

Salvage results are **written back** on the next successful write
opportunity, making recovery idempotent: a second `loadAll()` call
returns the same result without re-emitting the warning (see
`src/storage/gate6StorageRecovery.test.ts`, "救済結果は...冪等性").

## Write path (app state → localStorage)

All three stores wrap `storage.setItem` in `safeWrite()`
(`src/storage/keyValueStorage.ts`). On failure (quota exceeded or any
other `setItem`/`removeItem` exception), the raw error is converted to
a `StorageWriteError` with a pre-written Japanese message — the raw
`DOMException`/`QuotaExceededError` never reaches the UI or the
console as an unhandled rejection.

`src/app/AppRoot.tsx`'s `tryWrite()` helper wraps every write call site
(deck save/create/delete/import, records add/achievements, first-boot
official-starter save). On failure it appends the message to a `Toast`
and returns `false`, and the caller skips any "assume success"
follow-up (navigation, marking a draft clean, incrementing a version
counter that would trigger a re-render showing stale-but-believed-saved
state).

## What is intentionally NOT covered

- `soro-pon.skin.v1` (a single string ID) has no dedicated recovery
  path beyond `sanitizeSkinId()` in `src/ui/skins/skinRegistry.ts`,
  which falls back to a built-in skin for any unrecognized ID. This is
  sufficient — there is no structured payload to salvage.
- Settings (`insightMode`, `preferredPlayerCount`) reset to defaults on
  any corruption rather than being salvaged — low value, and as of
  Gate 6 no UI path even calls `settingsStore.save()` yet (pre-existing;
  not a Gate 6 regression, not fixed here — adding settings UI would be
  a new feature, out of scope).
- No IndexedDB is used anywhere in this project; all persistence is
  localStorage.

## Testing this policy

- Unit: `src/storage/gate6StorageRecovery.test.ts` (16 cases — partial
  salvage, legacy migration, missing version, unknown newer version,
  idempotency, full-corruption fallback, quota-exceeded on all three
  stores, null/empty/oversized payloads).
- Browser (Chromium automation, not simulated): `scripts/gate6-qa-01-migration-storage-recovery.mjs`.
- Visual regression: `tests/visual/gate6-recovery-states.spec.ts`
  (reset confirmation, quota-exceeded toast, partial-salvage toast,
  invalid-skin fallback — both skins, phone + desktop viewports).
