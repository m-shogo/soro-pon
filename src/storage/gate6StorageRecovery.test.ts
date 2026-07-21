import { describe, expect, it } from 'vitest';
import { deckProjectSchema } from '../schemas/deckProjectSchema';
import { loadFixtureJson, loadSampleText } from '../test-support/fixtures/loadFixture';
import { StorageWriteError } from './keyValueStorage';
import { createLocalStorageDeckStore, DECKS_BACKUP_KEY, DECKS_STORAGE_KEY } from './localStorageDeckStore';
import { createLocalStorageRecordsStore, RECORDS_STORAGE_KEY } from './localStorageRecordsStore';
import { createLocalStorageSettingsStore, SETTINGS_STORAGE_KEY } from './localStorageSettingsStore';

// Gate 6: migration / storage recovery scenarios (docs/qa/BATCH-6-GATE-6-QA-MATRIX.md Phase 3/4).
// これらはstorage layerのunit testで、実storageのquota例外はin-memory storageの
// 差し替えでシミュレートする(実localStorageのquotaを本当に枯渇させることは
// テスト環境では現実的でないため)。

function animalDeck() {
  return deckProjectSchema.parse(JSON.parse(loadSampleText('animal-starter.deck.json')));
}

// storage.setItemが呼ばれるたびに例外を投げる(quota超過相当)storage。
function createThrowingStorage(overrides?: { throwOnSetItem?: boolean; throwOnRemoveItem?: boolean }) {
  const map = new Map<string, string>();
  return {
    getItem: (key: string) => map.get(key) ?? null,
    setItem: (key: string, value: string) => {
      if (overrides?.throwOnSetItem) {
        throw new DOMException('The quota has been exceeded.', 'QuotaExceededError');
      }
      map.set(key, value);
    },
    removeItem: (key: string) => {
      if (overrides?.throwOnRemoveItem) {
        throw new DOMException('storage unavailable', 'InvalidStateError');
      }
      map.delete(key);
    },
    _dump: () => Object.fromEntries(map),
  };
}

function createMemoryStorage() {
  const map = new Map<string, string>();
  return {
    getItem: (key: string) => map.get(key) ?? null,
    setItem: (key: string, value: string) => {
      map.set(key, value);
    },
    removeItem: (key: string) => {
      map.delete(key);
    },
  };
}

describe('Gate 6: migration (per-deck salvage)', () => {
  it('1件だけ壊れたdeckがあっても、他の正常なdeckは保持される(全消去しない)', () => {
    const storage = createMemoryStorage();
    const good = animalDeck();
    storage.setItem(
      DECKS_STORAGE_KEY,
      JSON.stringify({
        version: 1,
        decks: [
          { deck: good, source: 'official', updatedAtMs: 1000 },
          { deck: { totally: 'not a deck' }, source: 'created', updatedAtMs: 2000 },
        ],
      }),
    );
    const store = createLocalStorageDeckStore(storage);
    const { decks, issues } = store.loadAll();
    expect(decks).toHaveLength(1);
    expect(decks[0]?.deck.id).toBe('official-animal-starter');
    expect(issues.some((i) => i.code === 'L9003')).toBe(true);
    // 元の壊れたペイロード全体はバックアップへ退避されている
    expect(storage.getItem(DECKS_BACKUP_KEY)).toContain('totally');
  });

  it('旧schema version(v0)のdeck entryはmigrateLegacyDeck経由で自動変換して復元する', () => {
    const storage = createMemoryStorage();
    const legacyDeckRaw = loadFixtureJson('decks/migration/migration-v0-safe-add-score-budget.deck.json');
    storage.setItem(
      DECKS_STORAGE_KEY,
      JSON.stringify({
        version: 1,
        decks: [{ deck: legacyDeckRaw, source: 'imported', updatedAtMs: 5000 }],
      }),
    );
    const store = createLocalStorageDeckStore(storage);
    const { decks, issues } = store.loadAll();
    expect(decks).toHaveLength(1);
    expect(decks[0]?.deck.variants[0]?.scoreBudget.softResultCap).toBe(300);
    // このケースは何も失っていない(1件が旧形式から自動変換されただけ)ので L9002
    expect(issues.some((i) => i.code === 'L9002')).toBe(true);
    expect(issues.some((i) => i.message.includes('旧形式から自動変換'))).toBe(true);
  });

  it('version fieldが完全に欠落したdeck entryは個別に破棄され、他は残る', () => {
    const storage = createMemoryStorage();
    const good = animalDeck();
    storage.setItem(
      DECKS_STORAGE_KEY,
      JSON.stringify({
        version: 1,
        decks: [
          { deck: good, source: 'official', updatedAtMs: 1000 },
          { deck: { id: 'no-version', name: 'x' }, source: 'created', updatedAtMs: 2000 },
        ],
      }),
    );
    const store = createLocalStorageDeckStore(storage);
    const { decks } = store.loadAll();
    expect(decks).toHaveLength(1);
    expect(decks[0]?.deck.id).toBe('official-animal-starter');
  });

  it('救済結果はstorageへ書き戻され、2回目のloadAllは同じ結果を安定して返す(冪等性)', () => {
    const storage = createMemoryStorage();
    const good = animalDeck();
    storage.setItem(
      DECKS_STORAGE_KEY,
      JSON.stringify({
        version: 1,
        decks: [
          { deck: good, source: 'official', updatedAtMs: 1000 },
          { deck: { broken: true }, source: 'created', updatedAtMs: 2000 },
        ],
      }),
    );
    const store = createLocalStorageDeckStore(storage);
    const first = store.loadAll();
    const second = store.loadAll();
    expect(first.decks).toHaveLength(1);
    expect(second.decks).toHaveLength(1);
    expect(second.decks[0]?.deck.id).toBe(first.decks[0]?.deck.id);
    // 2回目はすでにクリーンな形で書き戻し済みのため、L9003は再発しない
    expect(second.issues).toEqual([]);
  });

  it('未知のnewer versionのdeck entryは救済できず個別に破棄される(自動アップグレードはしない)', () => {
    const storage = createMemoryStorage();
    const good = animalDeck();
    const newerVersionDeck = loadFixtureJson('decks/migration/migration-newer-version-reject.deck.json');
    storage.setItem(
      DECKS_STORAGE_KEY,
      JSON.stringify({
        version: 1,
        decks: [
          { deck: good, source: 'official', updatedAtMs: 1000 },
          { deck: newerVersionDeck, source: 'imported', updatedAtMs: 2000 },
        ],
      }),
    );
    const store = createLocalStorageDeckStore(storage);
    const { decks, issues } = store.loadAll();
    expect(decks).toHaveLength(1);
    expect(decks[0]?.deck.id).toBe('official-animal-starter');
    expect(issues.some((i) => i.code === 'L9003')).toBe(true);
  });

  it('decks配列が空でもouter shapeに問題があれば正規化してL9001を報告する(データ損失なし)', () => {
    const storage = createMemoryStorage();
    storage.setItem(DECKS_STORAGE_KEY, JSON.stringify({ version: 1, decks: [], extra: 'field' }));
    const store = createLocalStorageDeckStore(storage);
    const { decks, issues } = store.loadAll();
    expect(decks).toEqual([]);
    expect(issues.some((i) => i.code === 'L9001')).toBe(true);
  });

  it('全deckが壊れている場合は従来通りの全消去(バックアップ退避+L9001)にフォールバックする', () => {
    const storage = createMemoryStorage();
    storage.setItem(
      DECKS_STORAGE_KEY,
      JSON.stringify({ version: 1, decks: [{ garbage: true }, { alsoGarbage: 1 }] }),
    );
    const store = createLocalStorageDeckStore(storage);
    const { decks, issues } = store.loadAll();
    expect(decks).toEqual([]);
    expect(issues.some((i) => i.code === 'L9001')).toBe(true);
    expect(storage.getItem(DECKS_BACKUP_KEY)).toContain('garbage');
  });
});

describe('Gate 6: storage write failure (quota exceeded)', () => {
  it('deck保存がquota超過で失敗すると、生のDOMExceptionではなくStorageWriteErrorを投げる', () => {
    const storage = createThrowingStorage({ throwOnSetItem: true });
    const store = createLocalStorageDeckStore(storage);
    expect(() => store.saveDeck(animalDeck(), 'created')).toThrow(StorageWriteError);
  });

  it('deck保存が失敗しても、失敗前に保存されていた他のdeckは読み込み時に無事残っている', () => {
    // 1件目は書き込み可能なstorageで保存 -> 2件目の保存だけをquota超過させる
    const map = new Map<string, string>();
    let shouldThrow = false;
    const storage = {
      getItem: (key: string) => map.get(key) ?? null,
      setItem: (key: string, value: string) => {
        if (shouldThrow) {
          throw new DOMException('quota', 'QuotaExceededError');
        }
        map.set(key, value);
      },
      removeItem: (key: string) => {
        map.delete(key);
      },
    };
    const store = createLocalStorageDeckStore(storage);
    store.saveDeck(animalDeck(), 'official');
    shouldThrow = true;
    expect(() => store.saveDeck({ ...animalDeck(), id: 'second-deck' }, 'created')).toThrow(
      StorageWriteError,
    );
    shouldThrow = false;
    const { decks } = store.loadAll();
    expect(decks).toHaveLength(1);
    expect(decks[0]?.deck.id).toBe('official-animal-starter');
  });

  it('settings保存がquota超過で失敗するとStorageWriteErrorを投げる', () => {
    const storage = createThrowingStorage({ throwOnSetItem: true });
    const store = createLocalStorageSettingsStore(storage);
    expect(() =>
      store.save({ version: 1, insightMode: 'advanced', preferredPlayerCount: 4 }),
    ).toThrow(StorageWriteError);
  });

  it('records保存がquota超過で失敗するとStorageWriteErrorを投げ、既存の記録は無事', () => {
    const map = new Map<string, string>();
    let shouldThrow = false;
    const storage = {
      getItem: (key: string) => map.get(key) ?? null,
      setItem: (key: string, value: string) => {
        if (shouldThrow) {
          throw new DOMException('quota', 'QuotaExceededError');
        }
        map.set(key, value);
      },
      removeItem: (key: string) => {
        map.delete(key);
      },
    };
    const store = createLocalStorageRecordsStore(storage);
    store.addRecord(
      {
        dateMs: 1,
        deckId: 'd',
        deckName: 'n',
        reason: 'draw',
        winnerName: '',
        humanWon: false,
        coinsEarned: 10,
      },
      'key-1',
    );
    shouldThrow = true;
    expect(() =>
      store.addRecord(
        {
          dateMs: 2,
          deckId: 'd',
          deckName: 'n',
          reason: 'draw',
          winnerName: '',
          humanWon: false,
          coinsEarned: 10,
        },
        'key-2',
      ),
    ).toThrow(StorageWriteError);
    shouldThrow = false;
    expect(store.load().records.records).toHaveLength(1);
  });

  it('quota超過はキー名などの技術的な生メッセージではなく、理解可能な日本語メッセージを持つ', () => {
    const storage = createThrowingStorage({ throwOnSetItem: true });
    const store = createLocalStorageDeckStore(storage);
    try {
      store.saveDeck(animalDeck(), 'created');
      expect.unreachable();
    } catch (err) {
      expect(err).toBeInstanceOf(StorageWriteError);
      const message = (err as StorageWriteError).message;
      expect(message).not.toContain('QuotaExceededError');
      expect(message).not.toContain('DOMException');
      expect(message).toContain('保存に失敗');
    }
  });
});

describe('Gate 6: settings/records corrupted-state recovery (extends existing L9001 coverage)', () => {
  it('null literalが保存されたsettingsもdefaultへ回復する', () => {
    const storage = createMemoryStorage();
    storage.setItem(SETTINGS_STORAGE_KEY, 'null');
    const store = createLocalStorageSettingsStore(storage);
    const { settings, issues } = store.load();
    expect(settings.insightMode).toBe('normal');
    expect(issues.some((i) => i.code === 'L9001')).toBe(true);
  });

  it('空文字が保存されたrecordsもEMPTY_RECORDSへ回復する', () => {
    const storage = createMemoryStorage();
    storage.setItem(RECORDS_STORAGE_KEY, '');
    const store = createLocalStorageRecordsStore(storage);
    const { records, issues } = store.load();
    expect(records.records).toEqual([]);
    expect(issues.some((i) => i.code === 'L9001')).toBe(true);
  });

  it('非常に大きなJSONが保存されたdeck dataでもクラッシュせず回復する', () => {
    const storage = createMemoryStorage();
    storage.setItem(DECKS_STORAGE_KEY, `{"version":1,"decks":[` + 'x'.repeat(2_000_000));
    const store = createLocalStorageDeckStore(storage);
    expect(() => store.loadAll()).not.toThrow();
    // 1回目の呼び出しで壊れたキーはbackupへ退避・元キーは空へ回復済みのため、
    // 発生したissueは1回目のloadAllの戻り値でのみ観測できる(2回目は
    // すでに回復後の空ペイロードを読むだけでissueは出ない)。
    const { decks, issues } = store.loadAll();
    expect(decks).toEqual([]);
    // 2回目の呼び出し自体はクラッシュせずEMPTY_PAYLOADを安定して返すことを確認する
    expect(issues).toEqual([]);
  });

  it('非常に大きなJSONが保存されたdeck dataは初回loadAllでL9001とともに回復する', () => {
    const storage = createMemoryStorage();
    storage.setItem(DECKS_STORAGE_KEY, `{"version":1,"decks":[` + 'x'.repeat(2_000_000));
    const store = createLocalStorageDeckStore(storage);
    const { decks, issues } = store.loadAll();
    expect(decks).toEqual([]);
    expect(issues.some((i) => i.code === 'L9001')).toBe(true);
  });
});
