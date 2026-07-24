import { describe, expect, it } from 'vitest';
import { parseSkinRegistry } from './skinRegistry';
import { SKIN_CONTRACT_VERSION } from './skinTypes';

function registry() {
  return {
    version: 1,
    skinContractVersion: SKIN_CONTRACT_VERSION,
    defaultSkinId: 'one',
    skins: [
      { id: 'one', label: 'One', selectable: true },
      { id: 'two', label: 'Two', selectable: true },
    ],
  };
}

describe('skin registry integrity', () => {
  it('重複skin IDを曖昧なregistryとして拒否する', () => {
    const raw = registry();
    raw.skins[1] = { id: 'one', label: 'Duplicate', selectable: true };

    expect(parseSkinRegistry(raw)).toBeNull();
  });

  it('アプリより新しいcontractVersionを拒否する', () => {
    const raw = { ...registry(), skinContractVersion: SKIN_CONTRACT_VERSION + 1 };

    expect(parseSkinRegistry(raw)).toBeNull();
  });

  it('unsafe integerのregistry versionを拒否する', () => {
    const raw = { ...registry(), version: Number.MAX_SAFE_INTEGER + 1 };

    expect(parseSkinRegistry(raw)).toBeNull();
  });

  it('既知contractで一意なregistryは受理する', () => {
    expect(parseSkinRegistry(registry())).toEqual({
      defaultSkinId: 'one',
      skins: registry().skins,
    });
  });
});
