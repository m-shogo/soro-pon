# Storage / Migration Recovery Policy

Applies to all localStorage-backed data: `soro-pon.decks.v1`,
`soro-pon.records.v1`, `soro-pon.settings.v1`, `soro-pon.skin.v1`.
Established in Gate 6 and hardened during the post-Batch-10 integrity
review. See `src/storage/storageRecoveryFailurePaths.test.ts` for the new
compound storage-fault cases.

## Principles

1. **Do not destroy unaffected data.** One corrupted or legacy deck entry
   must not take down the whole deck list.
2. **Recovery must not become the crash.** `getItem`, backup creation,
   active-key removal, and normalized writeback may fail independently.
   No raw storage exception escapes the read/recovery path.
3. **Do not fail silently.** Read/recovery issues become boot notices;
   normal write failures become translated `StorageWriteError` notices at
   the failed action.
4. **Do not claim a write succeeded when it did not.** Draft-preserving
   flows stay open, and unpersisted rewards/achievements are not displayed
   as saved.
5. **Prefer partial recovery to full reset.** Keep every independently
   recoverable deck entry.
6. **Do not invent a migration framework.** Reuse the deterministic
   existing v0 → v1 deck migration until another real schema migration
   exists.

## Guarantee Scope

Recovery is not unconditionally lossless.

- A failed normal write preserves already-persisted state and keeps an
  open editor/import draft in memory. Reloading still loses an unsaved
  draft; no separate draft autosave key exists.
- An unrecoverable deck entry is dropped from active recovered state.
  The raw original payload is written to
  `soro-pon.decks.v1.corrupt-backup` only when storage permits it.
- Corrupted records/settings fall back to empty/default state and attempt
  raw preservation in `soro-pon.records.v1.corrupt-backup` and
  `soro-pon.settings.v1.corrupt-backup`.
- If storage read access itself is denied, the app uses empty/default
  in-memory state for that store and reports `L9005`.
- If the built-in starter cannot be persisted during boot, the app
  reports `L9006`; it does not misuse a migration code or claim that the
  starter is saved.
- Backup persistence is best-effort. Quota or browser policy may prevent
  backup creation, and the warning states that explicitly.

## Read / Recovery Path

Implemented in:

```text
src/storage/localStorageDeckStore.ts
src/storage/localStorageRecordsStore.ts
src/storage/localStorageSettingsStore.ts
src/app/AppRoot.tsx
```

| Condition | Behavior | Code |
|---|---|---|
| Key absent | Empty/default payload, no issue | — |
| `getItem()` rejected | Empty/default in-memory state; boot warning | `L9005` |
| Deck JSON/outer shape unrecoverable | Best-effort raw backup + active-key removal, empty deck payload | `L9001` |
| Deck payload needs only safe legacy migration | Keep all entries, best-effort normalized writeback | `L9002` |
| Some deck entries unrecoverable | Keep healthy entries, drop only bad entries, preserve raw payload if possible | `L9003` |
| Records/settings corrupted | Best-effort raw backup + active-key removal, then empty/default state | `L9001` |
| Backup or cleanup fails | Continue with recovered in-memory state and append exact failed operation to warning | original recovery code |
| Built-in starter write fails during boot | Continue without claiming persistence; boot warning | `L9006` |

`AppRoot` collects initial issues from decks, records, and settings and
shows their unique messages through the boot warning `Toast`. It does not
discard records/settings recovery issues.

A successful deck salvage is written back immediately on a best-effort
basis. If writeback is rejected, the current call still returns recovered
in-memory state and a later load may repeat the warning.

## Normal Write Path

Normal mutations use `safeWrite()` from
`src/storage/keyValueStorage.ts`. Any `setItem()` failure becomes a
translated `StorageWriteError`.

`AppRoot.tryWrite()` then:

```text
shows a warning Toast
returns false
prevents success-only navigation/state updates
keeps editor/import input intact where applicable
does not display an achievement as unlocked when its persistence failed
```

Recovery cleanup is deliberately best-effort rather than `safeWrite()`:
throwing from cleanup would stop the app from reaching usable recovered
state.

## Error Code Ownership

```text
L9001 corrupt/invalid persisted payload recovered or normalized
L9002 older deck data migrated without dropping entries
L9003 unrecoverable deck entries dropped during partial recovery
L9004 local image missing; visual fallback used (existing meaning)
L9005 browser storage read unavailable; empty/default session fallback
L9006 bootstrap/default data could not be persisted
```

Do not reuse `L9004` for storage access. Canonical definitions are in
`docs/ERROR-CODES.md`.

## Backup / Restore Reality

`*.corrupt-backup` keys are forensic preservation, not an automatic
restore product feature.

```text
Supported:
- raw original payload retained when storage permits
- healthy deck entries salvaged automatically
- deterministic v0 -> v1 deck migration
- manual inspection/export through browser developer tools

Not supported:
- in-app restore button
- arbitrary backup merge
- guaranteed backup creation when storage rejects writes
- cloud/cross-device backup
```

A future restore UI must strict-parse and migrate the backup. It must not
copy raw backup text directly over an active key.

## Skin Storage

`soro-pon.skin.v1` is one ID. `SkinProvider` guards storage read/write and
`sanitizeSkinId()` falls back to a built-in skin. No structured salvage
is needed.

## Tests

```text
src/storage/gate6StorageRecovery.test.ts
  existing salvage, migration, corruption, and normal-write failure cases

src/storage/storageRecoveryFailurePaths.test.ts
  backup failure, cleanup failure, read denial, and records/settings raw backup

scripts/gate6-qa-01-migration-storage-recovery.mjs
  existing Chromium browser recovery checks

tests/visual/gate6-recovery-states.spec.ts
  recovery/reset/toast visual states
```

The new failure-path tests are unit-level evidence until rerun on the
exact current SHA. A real browser with storage access disabled remains a
target-environment-specific check.
