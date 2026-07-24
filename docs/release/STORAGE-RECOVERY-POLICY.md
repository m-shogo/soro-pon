# Storage / Migration Recovery Policy

Applies to all localStorage-backed data: `soro-pon.decks.v1`,
`soro-pon.records.v1`, `soro-pon.settings.v1`, `soro-pon.skin.v1`.
Established in Gate 6 (Batch 6) and hardened again during the post-Batch-10
integrity review. See
[BATCH-6-GATE-6-QA-MATRIX.md](../qa/BATCH-6-GATE-6-QA-MATRIX.md) for the
original evidence and `src/storage/storageRecoveryFailurePaths.test.ts`
for the storage-fault regression cases.

## Principles

1. **Never destroy other, unaffected data the app does not have to.** A
   single corrupted or legacy-schema deck entry must not take down the
   whole deck list. This does not mean the corrupted entry itself is
   always recoverable.
2. **Recovery must not become the crash.** Backup creation, active-key
   removal, payload rewrite, and even `getItem()` may independently fail.
   Those failures are classified and surfaced; they do not escape as raw
   storage exceptions from the read path.
3. **Never fail silently.** Every recovery action surfaces a
   Japanese-language `ValidationIssue` (read path, shown as a `Toast` on
   boot) or throws a catchable, translated `StorageWriteError` (normal
   write path, shown at the failed action).
4. **Never lose an in-progress user edit while the screen stays open.**
   If a normal save fails, DeckEditor and the import modal remain open
   with the user's input intact. This is an in-session guarantee only.
5. **Prefer partial recovery to full reset.** When only some data is
   unrecoverable, keep everything else that is recoverable.
6. **No speculative migration framework.** Reuse the deterministic,
   existing `migrateLegacyDeck()` (deck schema version 0 → 1). Add a
   generic multi-step runner only after a second real migration exists.

## Guarantee scope

Do not describe recovery as unconditionally "lossless".

- **Quota/storage-rejected writes**: the current draft remains visible,
  the user is notified, and already-persisted data is not overwritten by
  the failed normal write. Reloading or closing the tab still loses an
  unsaved in-memory draft; there is no separate draft autosave key.
- **Corrupted deck entries**: an entry that fails the current schema and
  legacy migration is removed from the active recovered list. The raw
  original payload is written to `soro-pon.decks.v1.corrupt-backup` when
  the browser permits it. Backup persistence is best-effort, not a false
  guarantee when quota or browser policy rejects storage writes.
- **Corrupted records/settings**: the app falls back to empty/default
  state and now also attempts to preserve the raw original values in
  `soro-pon.records.v1.corrupt-backup` and
  `soro-pon.settings.v1.corrupt-backup`.
- **Storage access denied**: if `getItem()` itself throws, the app uses an
  empty/default in-memory view for that store and emits `L9004`. Normal
  writes may still fail separately and are reported through
  `StorageWriteError`.

## Read path

Implemented in:

```text
src/storage/localStorageDeckStore.ts
src/storage/localStorageRecordsStore.ts
src/storage/localStorageSettingsStore.ts
```

| Condition | Behavior | Issue code |
|---|---|---|
| Key absent | Empty/default payload, no issue | — |
| `getItem()` rejected by browser/storage policy | Empty/default in-memory view; no raw exception escapes | `L9004` |
| Deck JSON parse failure or unrecoverable outer shape | Best-effort raw backup, best-effort active-key removal, empty payload | `L9001` |
| Deck outer shape invalid, all entries directly valid or legacy-migratable | Per-deck salvage and best-effort normalized writeback | `L9002` when migration occurred; otherwise `L9001` |
| Deck outer shape invalid with 1+ unrecoverable entries | Keep recoverable entries, drop only bad entries, best-effort raw backup/writeback | `L9003` |
| No deck entry recoverable | Best-effort quarantine and empty payload | `L9001` |
| Records/settings corrupted | Best-effort raw backup and active-key removal, then empty/default state | `L9001` |
| Backup or active-key cleanup fails during recovery | Continue with recovered in-memory state and append the exact failed recovery operation to the warning | original recovery code |

A successful salvage is written back immediately on a best-effort basis.
If writeback is rejected, the current call still returns the recovered
in-memory payload and the next load may repeat the recovery warning.

## Normal write path

Normal mutations (`saveDeck`, `removeDeck`, settings save, match-record
save, achievement save) use `safeWrite()` from
`src/storage/keyValueStorage.ts`. Any `setItem()` failure is converted to
`StorageWriteError` with a prewritten Japanese message. Raw
`DOMException` and `QuotaExceededError` are not deliberately exposed to
the UI.

`src/app/AppRoot.tsx` wraps user-triggered write call sites with
`tryWrite()`. On failure it appends the message to a warning `Toast` and
skips success-only follow-up such as navigation, draft-clean state, or a
version-counter refresh.

Recovery cleanup is deliberately different from a normal mutation:
backup and removal are **best-effort and independently guarded** because
throwing from a corruption-recovery path would prevent the app from
reaching a usable state.

## Backup and restore reality

The `*.corrupt-backup` keys are forensic preservation, not an automatic
restore product feature.

```text
Supported now:
- raw original payload retained when storage permits
- healthy deck entries salvaged automatically
- deterministic v0 -> v1 deck migration
- manual inspection/export through browser developer tools

Not supported now:
- restore button in the application
- merging arbitrary backup JSON into active state
- guaranteed backup creation when the storage system itself rejects writes
- cross-device/cloud backup
```

A future restore UI must parse the backup through the same strict import
and migration contracts. It must never copy a backup value directly over
the active key.

## Skin storage

`soro-pon.skin.v1` is a single skin ID. `SkinProvider` guards both
`getItem()` and `setItem()` and `sanitizeSkinId()` falls back to a built-in
known skin. There is no structured skin payload to salvage.

## Tests

- Existing Gate 6 suite:
  `src/storage/gate6StorageRecovery.test.ts` (partial salvage, migration,
  idempotency, corruption, and normal-write quota failures).
- Storage-operation fault suite:
  `src/storage/storageRecoveryFailurePaths.test.ts` (6 cases covering
  backup failure, active-key removal failure, read denial, and raw
  records backup).
- Browser automation:
  `scripts/gate6-qa-01-migration-storage-recovery.mjs`.
- Visual regression:
  `tests/visual/gate6-recovery-states.spec.ts`.

The new storage-operation fault tests are unit-level proof. A real browser
run with storage access disabled remains environment-specific and should
be repeated when the target deployment/browser matrix is known.
