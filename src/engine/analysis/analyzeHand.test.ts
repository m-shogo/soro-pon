import { describe, expect, it } from 'vitest';
import type { DeckProject } from '../../domain/deck';
import type { DeckVariant, NormalRuleConfig } from '../../domain/variant';
import { deckProjectSchema } from '../../schemas/deckProjectSchema';
import { makeInstances } from '../../test-support/builders/handBuilder';
import { loadSampleText } from '../../test-support/fixtures/loadFixture';
import { analyzeHand } from './analyzeHand';
import { analyzeWaits } from './analyzeWaits';

function animalDeck(): { deck: DeckProject; variant: DeckVariant } {
  const deck = deckProjectSchema.parse(JSON.parse(loadSampleText('animal-starter.deck.json')));
  const variant = deck.variants.find((v) => v.id === 'normal')!;
  return { deck, variant };
}

describe('analyzeHand: completed', () => {
  it('哺乳類3グループ×3のツモ手はcompletedでcanTsumo', () => {
    const { deck, variant } = animalDeck();
    const result = analyzeHand({
      deck,
      variant,
      handTiles: makeInstances([
        'lion', 'lion', 'lion',
        'elephant', 'elephant', 'elephant',
        'zebra', 'zebra', 'zebra',
      ]),
      context: 'afterDrawNineTiles',
    });
    const mammal = result.candidates.find((c) => c.winRoleId === 'win_mammal_three_groups');
    expect(mammal?.state).toBe('completed');
    expect(mammal?.canTsumo).toBe(true);
    expect(mammal?.groups).toHaveLength(3);
    expect(mammal?.basePoints).toBe(80);
    expect(new Set(mammal?.usedTileInstanceIds).size).toBe(9);
  });

  it('completed候補が先頭にrankされる', () => {
    const { deck, variant } = animalDeck();
    const result = analyzeHand({
      deck,
      variant,
      handTiles: makeInstances([
        'lion', 'lion', 'lion',
        'elephant', 'elephant', 'elephant',
        'zebra', 'zebra', 'zebra',
      ]),
      context: 'afterDrawNineTiles',
    });
    expect(result.primaryCandidates[0]?.state).toBe('completed');
    // 空と海と大地(100点)は不成立、どうぶつ王国(80点)が完成
    expect(result.primaryCandidates[0]?.winRoleId).toBe('win_mammal_three_groups');
  });

  it('specificSet役(サバンナの記憶)が完成する', () => {
    const { deck, variant } = animalDeck();
    const result = analyzeHand({
      deck,
      variant,
      handTiles: makeInstances([
        'lion', 'elephant', 'giraffe',
        'monkey', 'monkey', 'monkey',
        'bear', 'bear', 'bear',
      ]),
      context: 'afterDrawNineTiles',
    });
    const savanna = result.candidates.find((c) => c.winRoleId === 'win_savanna_set_plus');
    expect(savanna?.state).toBe('completed');
    expect(savanna?.basePoints).toBe(110);
  });

  it('手牌の並び順が変わっても結果は同じ', () => {
    const { deck, variant } = animalDeck();
    const tilesA = makeInstances([
      'lion', 'lion', 'lion',
      'elephant', 'elephant', 'elephant',
      'zebra', 'zebra', 'zebra',
    ]);
    const tilesB = [...tilesA].reverse();
    const a = analyzeHand({ deck, variant, handTiles: tilesA, context: 'afterDrawNineTiles' });
    const b = analyzeHand({ deck, variant, handTiles: tilesB, context: 'afterDrawNineTiles' });
    expect(a.candidates.map((c) => [c.candidateId, c.state])).toEqual(
      b.candidates.map((c) => [c.candidateId, c.state]),
    );
  });
});

describe('analyzeHand: tenpai(8枚)', () => {
  it('あと1枚の8枚手はtenpaiで、不完全グループを含む', () => {
    const { deck, variant } = animalDeck();
    const result = analyzeHand({
      deck,
      variant,
      handTiles: makeInstances([
        'lion', 'lion', 'lion',
        'elephant', 'elephant', 'elephant',
        'zebra', 'zebra',
      ]),
      context: 'afterDiscardEightTiles',
    });
    const mammal = result.candidates.find((c) => c.winRoleId === 'win_mammal_three_groups');
    expect(mammal?.state).toBe('tenpai');
    const incomplete = mammal?.groups.find((g) => !g.isComplete);
    expect(incomplete).toBeDefined();
    expect(incomplete?.tileInstanceIds).toHaveLength(2);
  });

  it('analyzeWaitsがカテゴリ待ちを説明する', () => {
    const { deck, variant } = animalDeck();
    const waits = analyzeWaits({
      deck,
      variant,
      handTiles: makeInstances([
        'lion', 'lion', 'lion',
        'elephant', 'elephant', 'elephant',
        'zebra', 'zebra',
      ]),
      context: 'afterDiscardEightTiles',
    });
    const mammalWait = waits.find((w) => w.winRoleId === 'win_mammal_three_groups');
    expect(mammalWait?.kind).toBe('category');
    expect(mammalWait?.categoryId).toBe('mammal');
    expect(mammalWait?.wildcardCanFill).toBe(true);
    expect(mammalWait?.message).toContain('哺乳類');
  });

  it('specificSet待ちは足りない牌を名指しする', () => {
    const { deck, variant } = animalDeck();
    const waits = analyzeWaits({
      deck,
      variant,
      handTiles: makeInstances([
        'lion', 'elephant',
        'monkey', 'monkey', 'monkey',
        'bear', 'bear', 'bear',
      ]),
      context: 'afterDiscardEightTiles',
    });
    const savannaWait = waits.find((w) => w.winRoleId === 'win_savanna_set_plus');
    expect(savannaWait?.kind).toBe('tile');
    expect(savannaWait?.tileIds).toEqual(['giraffe']);
  });
});

describe('analyzeHand: near / bonusOnly / invalid', () => {
  it('遠い手はnearでmissingRequirementsを持つ', () => {
    const { deck, variant } = animalDeck();
    const result = analyzeHand({
      deck,
      variant,
      handTiles: makeInstances([
        'lion', 'lion', 'lion',
        'penguin', 'penguin', 'fish',
        'bee', 'bee',
      ]),
      context: 'afterDiscardEightTiles',
    });
    const mammal = result.candidates.find((c) => c.winRoleId === 'win_mammal_three_groups');
    expect(mammal?.state).toBe('near');
    expect(mammal?.missingRequirements.length).toBeGreaterThan(0);
    expect(mammal?.missingRequirements[0]?.message).toContain('哺乳類');
  });

  it('ボーナス条件のみ満たす手はbonusOnlyであがれない', () => {
    const { deck, variant } = animalDeck();
    const result = analyzeHand({
      deck,
      variant,
      handTiles: makeInstances([
        'rabbit', 'panda', 'butterfly',
        'penguin', 'fish', 'bee',
        'owl', 'crocodile',
      ]),
      context: 'afterDiscardEightTiles',
    });
    const cute = result.candidates.find((c) => c.winRoleId === 'bonus_cute_trio');
    expect(cute?.state).toBe('bonusOnly');
    expect(cute?.canTsumo).toBe(false);
    expect(cute?.canRon).toBe(false);
    expect(cute?.blockedReasons.length).toBeGreaterThan(0);
  });

  it('wildcard2枚必要な手はinvalidButExplainable(W5005)', () => {
    const { deck, variant } = animalDeck();
    const result = analyzeHand({
      deck,
      variant,
      handTiles: makeInstances([
        'lion', 'lion', 'lion',
        'elephant', 'elephant', 'star',
        'zebra', 'zebra', 'star',
      ]),
      context: 'afterDrawNineTiles',
    });
    const mammal = result.candidates.find((c) => c.winRoleId === 'win_mammal_three_groups');
    expect(mammal?.state).toBe('invalidButExplainable');
    expect(mammal?.blockedReasons.some((r) => r.code === 'W5005')).toBe(true);
  });

  it('wildcard1枚は完成を助け、割当が説明される', () => {
    const { deck, variant } = animalDeck();
    const result = analyzeHand({
      deck,
      variant,
      handTiles: makeInstances([
        'lion', 'lion', 'lion',
        'elephant', 'elephant', 'elephant',
        'zebra', 'zebra', 'star',
      ]),
      context: 'afterDrawNineTiles',
    });
    const mammal = result.candidates.find((c) => c.winRoleId === 'win_mammal_three_groups');
    expect(mammal?.state).toBe('completed');
    expect(mammal?.wildcardAssignments).toHaveLength(1);
    expect(
      mammal?.explainReasons.some(
        (r) => r.code === 'wildcardUsedAs' && r.message.includes('きら星'),
      ),
    ).toBe(true);
  });
});

describe('analyzeHand: ron context', () => {
  const ronHand = () => {
    const hand = makeInstances([
      'lion', 'lion', 'lion',
      'elephant', 'elephant', 'elephant',
      'zebra', 'zebra',
    ]);
    return hand;
  };

  it('8枚+捨て牌でロンできる', () => {
    const { deck, variant } = animalDeck();
    const discarded = { instanceId: 'zebra#99', tileId: 'zebra', location: 'discard' as const };
    const result = analyzeHand({
      deck,
      variant,
      handTiles: [...ronHand(), discarded],
      context: 'ronCheckNineTiles',
      ronTileInstanceId: 'zebra#99',
    });
    const mammal = result.candidates.find((c) => c.winRoleId === 'win_mammal_three_groups');
    expect(mammal?.state).toBe('completed');
    expect(mammal?.canRon).toBe(true);
  });

  it('捨てられたwildcardではロンできない(W5006)', () => {
    const { deck, variant } = animalDeck();
    const discarded = { instanceId: 'star#99', tileId: 'star', location: 'discard' as const };
    const result = analyzeHand({
      deck,
      variant,
      handTiles: [...ronHand(), discarded],
      context: 'ronCheckNineTiles',
      ronTileInstanceId: 'star#99',
    });
    const mammal = result.candidates.find((c) => c.winRoleId === 'win_mammal_three_groups');
    expect(mammal?.canRon).toBe(false);
    expect(mammal?.state).toBe('invalidButExplainable');
    expect(mammal?.blockedReasons.some((r) => r.code === 'W5006')).toBe(true);
  });

  it('自分で引いたwildcardならツモで完成できる(参考: ronと非対称)', () => {
    const { deck, variant } = animalDeck();
    const result = analyzeHand({
      deck,
      variant,
      handTiles: [...ronHand(), { instanceId: 'star#1', tileId: 'star', location: 'hand' as const }],
      context: 'afterDrawNineTiles',
    });
    const mammal = result.candidates.find((c) => c.winRoleId === 'win_mammal_three_groups');
    expect(mammal?.state).toBe('completed');
    expect(mammal?.canTsumo).toBe(true);
  });
});

describe('analyzeHand: 表示上限', () => {
  it('primaryCandidatesは最大3件でhiddenCandidateCountが返る', () => {
    const { deck, variant } = animalDeck();
    // 多くの役・ボーナスが反応する手
    const result = analyzeHand({
      deck,
      variant,
      handTiles: makeInstances([
        'lion', 'elephant', 'giraffe',
        'zebra', 'monkey', 'rabbit',
        'panda', 'bear', 'fox',
      ]),
      context: 'afterDrawNineTiles',
    });
    expect(result.primaryCandidates.length).toBeLessThanOrEqual(3);
    expect(result.hiddenCandidateCount).toBe(
      result.candidates.length - result.primaryCandidates.length,
    );
  });

  it('全候補を隠さない: candidatesには全件(cap内)が残る', () => {
    const { deck, variant } = animalDeck();
    const result = analyzeHand({
      deck,
      variant,
      handTiles: makeInstances([
        'lion', 'elephant', 'giraffe',
        'zebra', 'monkey', 'rabbit',
        'panda', 'bear', 'fox',
      ]),
      context: 'afterDrawNineTiles',
    });
    expect(result.candidates.length).toBeGreaterThanOrEqual(result.primaryCandidates.length);
  });
});
