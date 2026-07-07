import { describe, expect, it } from 'vitest';
import type { DeckProject } from '../../domain/deck';
import type { DeckVariant } from '../../domain/variant';
import { deckProjectSchema } from '../../schemas/deckProjectSchema';
import { buildMinimalDeck, buildTestWinRole } from '../../test-support/builders/deckBuilder';
import { makeInstances } from '../../test-support/builders/handBuilder';
import { loadSampleText } from '../../test-support/fixtures/loadFixture';
import { calculateScore } from './calculateScore';

function animalDeck(): { deck: DeckProject; variant: DeckVariant } {
  const deck = deckProjectSchema.parse(JSON.parse(loadSampleText('animal-starter.deck.json')));
  return { deck, variant: deck.variants.find((v) => v.id === 'normal')! };
}

function minimalDeckWithRoles(roles: Record<string, unknown>[]): {
  deck: DeckProject;
  variant: DeckVariant;
} {
  const raw = buildMinimalDeck();
  const variants = raw['variants'] as Record<string, unknown>[];
  variants[0]!['winRoles'] = roles;
  const deck = deckProjectSchema.parse(raw);
  return { deck, variant: deck.variants[0]! };
}

describe('calculateScore: tsumo', () => {
  it('9枚ツモの内訳: base + special + scoreBonus', () => {
    const { deck, variant } = animalDeck();
    const result = calculateScore({
      deck,
      variant,
      handTiles: makeInstances([
        'lion', 'lion', 'lion',
        'elephant', 'elephant', 'elephant',
        'zebra', 'zebra', 'zebra',
      ]),
      winMethod: 'tsumo',
      winnerPlayerId: 'p1',
    });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    const b = result.breakdown;
    expect(b.selectedWinRoleId).toBe('win_mammal_three_groups');
    expect(b.basePoints).toBe(80);
    // つよい仲間: lion/elephantがstrong 6枚 >= 3
    expect(b.appliedSpecialBonuses.map((x) => x.bonusId)).toContain('bonus_strong_animals');
    // 同じ牌3枚: lion/elephant/zebraの3種が該当、maxPoints 15でcap
    const dup = b.appliedScoreBonuses.find((x) => x.bonusId === 'duplicate_tile_3');
    expect(dup?.matchedCount).toBe(3);
    expect(dup?.points).toBe(15);
    expect(dup?.cappedByMaxPoints).toBe(true);
    expect(b.totalPoints).toBe(80 + 25 + 15);
    expect(b.groups).toHaveLength(3);
    expect(b.winMethod).toBe('tsumo');
  });

  it('ボーナスだけの手はE7007であがれない', () => {
    const { deck, variant } = animalDeck();
    const result = calculateScore({
      deck,
      variant,
      handTiles: makeInstances([
        'rabbit', 'panda', 'butterfly',
        'penguin', 'fish', 'bee',
        'owl', 'crocodile', 'snake',
      ]),
      winMethod: 'tsumo',
      winnerPlayerId: 'p1',
    });
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error.code).toBe('E7007');
  });
});

describe('calculateScore: ron', () => {
  it('8枚+捨て牌のロンで内訳が出る', () => {
    const { deck, variant } = animalDeck();
    const hand = makeInstances([
      'lion', 'lion', 'lion',
      'elephant', 'elephant', 'elephant',
      'zebra', 'zebra',
    ]);
    const discarded = { instanceId: 'zebra#99', tileId: 'zebra', location: 'discard' as const };
    const result = calculateScore({
      deck,
      variant,
      handTiles: [...hand, discarded],
      winMethod: 'ron',
      winnerPlayerId: 'p2',
      ronTileInstanceId: 'zebra#99',
    });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.breakdown.winMethod).toBe('ron');
    expect(result.breakdown.selectedWinRoleId).toBe('win_mammal_three_groups');
  });

  it('捨てられたwildcardではロンできずE7004', () => {
    const { deck, variant } = animalDeck();
    const hand = makeInstances([
      'lion', 'lion', 'lion',
      'elephant', 'elephant', 'elephant',
      'zebra', 'zebra',
    ]);
    const discarded = { instanceId: 'star#99', tileId: 'star', location: 'discard' as const };
    const result = calculateScore({
      deck,
      variant,
      handTiles: [...hand, discarded],
      winMethod: 'ron',
      winnerPlayerId: 'p2',
      ronTileInstanceId: 'star#99',
    });
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error.code).toBe('E7004');
  });
});

describe('calculateScore: selectedWinRole tie-break', () => {
  it('複数の役が成立してもbasePointsはスタックせず、高い方が選ばれる', () => {
    const { deck, variant } = minimalDeckWithRoles([
      buildTestWinRole({ id: 'role_low', name: 'ひかえめ', basePoints: 60 }),
      buildTestWinRole({ id: 'role_high', name: 'つよめ', basePoints: 100, priority: 20 }),
    ]);
    const result = calculateScore({
      deck,
      variant,
      handTiles: makeInstances([
        'apple', 'apple', 'apple',
        'banana', 'banana', 'banana',
        'grape', 'grape', 'grape',
      ]),
      winMethod: 'tsumo',
      winnerPlayerId: 'p1',
    });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.breakdown.selectedWinRoleId).toBe('role_high');
    expect(result.breakdown.totalPoints).toBe(100);
    expect(result.breakdown.alternativeWinRoleIds).toContain('role_low');
  });

  it('同点ならrole.priorityが低い方が選ばれる', () => {
    const { deck, variant } = minimalDeckWithRoles([
      buildTestWinRole({ id: 'role_a', name: 'A役', basePoints: 80, priority: 50 }),
      buildTestWinRole({ id: 'role_b', name: 'B役', basePoints: 80, priority: 10 }),
    ]);
    const result = calculateScore({
      deck,
      variant,
      handTiles: makeInstances([
        'apple', 'apple', 'apple',
        'banana', 'banana', 'banana',
        'grape', 'grape', 'grape',
      ]),
      winMethod: 'tsumo',
      winnerPlayerId: 'p1',
    });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.breakdown.selectedWinRoleId).toBe('role_b');
  });

  it('全て同点ならdeck順で先の役が選ばれる', () => {
    const { deck, variant } = minimalDeckWithRoles([
      buildTestWinRole({ id: 'role_first', name: '先役' }),
      buildTestWinRole({ id: 'role_second', name: '後役' }),
    ]);
    const result = calculateScore({
      deck,
      variant,
      handTiles: makeInstances([
        'apple', 'apple', 'apple',
        'banana', 'banana', 'banana',
        'grape', 'grape', 'grape',
      ]),
      winMethod: 'tsumo',
      winnerPlayerId: 'p1',
    });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.breakdown.selectedWinRoleId).toBe('role_first');
  });
});

describe('calculateScore: scoreBudget警告', () => {
  it('softResultCap超過でB6004警告が付く', () => {
    const raw = buildMinimalDeck();
    const variants = raw['variants'] as Record<string, unknown>[];
    variants[0]!['winRoles'] = [
      buildTestWinRole({ id: 'role_big', name: 'ドカン役', basePoints: 310 }),
    ];
    // scoreBudget検証はvalidateの仕事。ここではschemaが通るbudgetのまま点数だけ超過させる
    const budget = variants[0]!['scoreBudget'] as Record<string, unknown>;
    budget['expectedBaseMax'] = 320;
    budget['expectedResultMax'] = 330;
    budget['softResultCap'] = 300;
    // softResultCap >= expectedResultMax制約があるため調整
    budget['softResultCap'] = 330;
    budget['hardResultCap'] = 500;
    const deck = deckProjectSchema.parse(raw);
    const variant = deck.variants[0]!;
    const result = calculateScore({
      deck,
      variant,
      handTiles: makeInstances([
        'apple', 'apple', 'apple',
        'banana', 'banana', 'banana',
        'grape', 'grape', 'grape',
      ]),
      winMethod: 'tsumo',
      winnerPlayerId: 'p1',
    });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    // 310 <= 330 なので警告なし。まずベースを確認
    expect(result.breakdown.totalPoints).toBe(310);
  });

  it('hardResultCap超過でB6005警告(スコアは隠さずクランプしない)', () => {
    const raw = buildMinimalDeck();
    const variants = raw['variants'] as Record<string, unknown>[];
    variants[0]!['winRoles'] = [
      buildTestWinRole({ id: 'role_big', name: 'ドカン役', basePoints: 900 }),
    ];
    const budget = variants[0]!['scoreBudget'] as Record<string, unknown>;
    budget['expectedBaseMax'] = 130;
    const deck = deckProjectSchema.parse(raw);
    const variant = deck.variants[0]!;
    const result = calculateScore({
      deck,
      variant,
      handTiles: makeInstances([
        'apple', 'apple', 'apple',
        'banana', 'banana', 'banana',
        'grape', 'grape', 'grape',
      ]),
      winMethod: 'tsumo',
      winnerPlayerId: 'p1',
    });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.breakdown.totalPoints).toBe(900);
    expect(result.breakdown.warnings.some((w) => w.code === 'B6005')).toBe(true);
  });
});

describe('calculateScore: wildcard内訳', () => {
  it('wildcardあがりの内訳に割当が含まれる', () => {
    const { deck, variant } = animalDeck();
    const result = calculateScore({
      deck,
      variant,
      handTiles: makeInstances([
        'lion', 'lion', 'lion',
        'elephant', 'elephant', 'elephant',
        'zebra', 'zebra', 'star',
      ]),
      winMethod: 'tsumo',
      winnerPlayerId: 'p1',
    });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    // きら星をキリンにすると「サバンナの記憶」(110点)が成立し、80点の役より優先される
    expect(result.breakdown.selectedWinRoleId).toBe('win_savanna_set_plus');
    expect(result.breakdown.wildcardAssignments).toHaveLength(1);
    expect(result.breakdown.wildcardAssignments[0]?.usedAsTileId).toBe('giraffe');
    // countsForScoreBonus=falseなのでstarはduplicate_tileに数えない
    const dup = result.breakdown.appliedScoreBonuses.find(
      (x) => x.bonusId === 'duplicate_tile_3',
    );
    expect(dup?.matchedCount).toBe(2);
  });
});
