import { describe, expect, it } from 'vitest';
import { parseDeckImport } from '../engine/import/parseDeckImport';
import { deckProjectSchema } from '../schemas/deckProjectSchema';
import { loadSampleText } from '../test-support/fixtures/loadFixture';
import { createMemoryStorage } from './keyValueStorage';
import {
  createLocalStorageDeckStore,
  DECKS_BACKUP_KEY,
  DECKS_STORAGE_KEY,
} from './localStorageDeckStore';
import {
  createLocalStorageSettingsStore,
  SETTINGS_STORAGE_KEY,
} from './localStorageSettingsStore';

function animalDeck() {
  return deckProjectSchema.parse(JSON.parse(loadSampleText('animal-starter.deck.json')));
}

describe('localStorageDeckStore', () => {
  it('保存して読み込むroundtripがschema経由で動く', () => {
    const storage = createMemoryStorage();
    const store = createLocalStorageDeckStore(storage, () => 1000);
    store.saveDeck(animalDeck(), 'official');
    const { decks, issues } = store.loadAll();
    expect(issues).toEqual([]);
    expect(decks).toHaveLength(1);
    expect(decks[0]?.deck.id).toBe('official-animal-starter');
    expect(decks[0]?.source).toBe('official');
    expect(decks[0]?.updatedAtMs).toBe(1000);
  });

  it('同じdeckIdの保存は上書きになる', () => {
    const storage = createMemoryStorage();
    let time = 1000;
    const store = createLocalStorageDeckStore(storage, () => time);
    store.saveDeck(animalDeck(), 'official');
    time = 2000;
    store.saveDeck({ ...animalDeck(), name: '改名スターター' }, 'created');
    const { decks } = store.loadAll();
    expect(decks).toHaveLength(1);
    expect(decks[0]?.deck.name).toBe('改名スターター');
    expect(decks[0]?.updatedAtMs).toBe(2000);
  });

  it('壊れたlocalStorageはL9001で回復し、バックアップへ退避する', () => {
    const storage = createMemoryStorage();
    storage.setItem(DECKS_STORAGE_KEY, '{"version": 1, "decks": [BROKEN');
    const store = createLocalStorageDeckStore(storage);
    const { decks, issues } = store.loadAll();
    expect(decks).toEqual([]);
    expect(issues.some((i) => i.code === 'L9001')).toBe(true);
    expect(storage.getItem(DECKS_BACKUP_KEY)).toContain('BROKEN');
    // 回復後は普通に保存できる
    store.saveDeck(animalDeck(), 'created');
    expect(store.loadAll().decks).toHaveLength(1);
  });

  it('未知フィールド入りの保存データも破損として回復する', () => {
    const storage = createMemoryStorage();
    storage.setItem(
      DECKS_STORAGE_KEY,
      JSON.stringify({ version: 1, decks: [], injectedField: 'evil' }),
    );
    const store = createLocalStorageDeckStore(storage);
    const { issues } = store.loadAll();
    expect(issues.some((i) => i.code === 'L9001')).toBe(true);
  });

  it('removeDeckで削除できる', () => {
    const storage = createMemoryStorage();
    const store = createLocalStorageDeckStore(storage);
    store.saveDeck(animalDeck(), 'official');
    store.removeDeck('official-animal-starter');
    expect(store.loadAll().decks).toEqual([]);
  });

  it('exportはローカルメタを含まず、strict importをそのまま通る', () => {
    const storage = createMemoryStorage();
    const store = createLocalStorageDeckStore(storage);
    store.saveDeck(animalDeck(), 'imported');
    const exported = store.exportDeck('official-animal-starter');
    expect(exported).not.toBeNull();
    expect(exported).not.toContain('updatedAtMs');
    expect(exported).not.toContain('"source"');
    const reimport = parseDeckImport({ rawText: exported! });
    expect(reimport.ok).toBe(true);
  });
});

describe('localStorageSettingsStore', () => {
  it('未保存ならdefault設定を返す', () => {
    const storage = createMemoryStorage();
    const store = createLocalStorageSettingsStore(storage);
    const { settings, issues } = store.load();
    expect(issues).toEqual([]);
    expect(settings.insightMode).toBe('normal');
    expect(settings.preferredPlayerCount).toBe(3);
  });

  it('保存した設定を読み込める', () => {
    const storage = createMemoryStorage();
    const store = createLocalStorageSettingsStore(storage);
    store.save({ version: 1, insightMode: 'advanced', preferredPlayerCount: 4 });
    expect(store.load().settings.insightMode).toBe('advanced');
  });

  it('壊れた設定はdefaultへ回復しL9001を返す', () => {
    const storage = createMemoryStorage();
    storage.setItem(SETTINGS_STORAGE_KEY, 'not-json');
    const store = createLocalStorageSettingsStore(storage);
    const { settings, issues } = store.load();
    expect(settings.insightMode).toBe('normal');
    expect(issues.some((i) => i.code === 'L9001')).toBe(true);
  });
});
