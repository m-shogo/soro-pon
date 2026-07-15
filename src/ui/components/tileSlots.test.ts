import { describe, expect, it } from 'vitest';
import { baseSlotFor, stateSlotFor } from './TileCard';

// ADR-015: 牌slotは「base面 + 状態レイヤー」の合成。
// slot間fallbackが存在しないため、状態slotがbaseを置き換えると
// baseだけfinal化した時に選択中の牌の画像が消える。

describe('baseSlotFor (ADR-015)', () => {
  it('表はtile.face.base', () => {
    expect(baseSlotFor(false)).toBe('tile.face.base');
  });

  it('伏せ牌はtile.back.base', () => {
    expect(baseSlotFor(true)).toBe('tile.back.base');
  });
});

describe('stateSlotFor (ADR-015)', () => {
  it('通常状態は状態レイヤーなし(baseのみ)', () => {
    expect(stateSlotFor(false, false)).toBeNull();
  });

  it('selectedはtile.face.selectedをbaseの上へ重ねる', () => {
    expect(stateSlotFor(false, true)).toBe('tile.face.selected');
  });

  it('ronはselectedより優先する', () => {
    expect(stateSlotFor(false, true, 'ron')).toBe('tile.face.ronAvailable');
  });

  it('tsumoはselectedより優先する', () => {
    expect(stateSlotFor(false, true, 'tsumo')).toBe('tile.face.tsumoAvailable');
  });

  it('伏せ牌に状態レイヤーは付かない', () => {
    expect(stateSlotFor(true, true, 'ron')).toBeNull();
  });
});
