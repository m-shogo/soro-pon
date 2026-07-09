import { describe, expect, it } from 'vitest';
import type { DeckProject } from '../../domain/deck';
import type { DeckVariant } from '../../domain/variant';
import { deckProjectSchema } from '../../schemas/deckProjectSchema';
import { makeInstances } from '../../test-support/builders/handBuilder';
import { loadSampleText } from '../../test-support/fixtures/loadFixture';
import { analyzeDiscardImpact } from './analyzeDiscardImpact';
import { buildBoardInsights } from './buildBoardInsights';

function animalDeck(): { deck: DeckProject; variant: DeckVariant } {
  const deck = deckProjectSchema.parse(JSON.parse(loadSampleText('animal-starter.deck.json')));
  return { deck, variant: deck.variants.find((v) => v.id === 'normal')! };
}

const FORBIDDEN_WORDING = ['おすすめ', 'ベスト', 'best', '正解', 'すべき', '狙うべき', '正しい捨て'];

describe('analyzeDiscardImpact: purity', () => {
  it('プレビューは手牌を変更しない', () => {
    const { deck, variant } = animalDeck();
    const handTiles = makeInstances([
      'lion', 'lion', 'lion',
      'elephant', 'elephant', 'elephant',
      'zebra', 'zebra', 'penguin',
    ]);
    const frozen = JSON.stringify(handTiles);
    Object.freeze(handTiles);
    handTiles.forEach((t) => Object.freeze(t));
    const results = analyzeDiscardImpact({ deck, variant, handTiles });
    expect(results).toHaveLength(9);
    expect(JSON.stringify(handTiles)).toBe(frozen);
  });
});

describe('analyzeDiscardImpact: 事実', () => {
  it('完成形の使用牌を捨てると候補が崩れる', () => {
    const { deck, variant } = animalDeck();
    const handTiles = makeInstances([
      'lion', 'lion', 'lion',
      'elephant', 'elephant', 'elephant',
      'zebra', 'zebra', 'zebra',
    ]);
    const results = analyzeDiscardImpact({
      deck,
      variant,
      handTiles,
      tileInstanceIds: ['zebra#3'],
    });
    const impact = results[0]!;
    expect(impact.breaksCandidateIds.length).toBeGreaterThan(0);
    // 捨てた後もzebra待ちのtenpaiは残る
    expect(impact.keepsCandidateIds.length).toBeGreaterThan(0);
    expect(impact.resultingWaits.some((w) => w.categoryId === 'mammal')).toBe(true);
  });

  it('候補に使われていない牌を捨ててもtenpaiが残る', () => {
    const { deck, variant } = animalDeck();
    const handTiles = makeInstances([
      'lion', 'lion', 'lion',
      'elephant', 'elephant', 'elephant',
      'zebra', 'zebra', 'penguin',
    ]);
    const results = analyzeDiscardImpact({
      deck,
      variant,
      handTiles,
      tileInstanceIds: ['penguin#1'],
    });
    const impact = results[0]!;
    expect(impact.removesUnusedTile).toBe(true);
    expect(impact.keepsCandidateIds.length).toBeGreaterThan(0);
    expect(impact.facts.some((f) => f.code === 'discardUnusedTile')).toBe(true);
  });

  it('待ち牌を捨てるとtenpaiが崩れる', () => {
    const { deck, variant } = animalDeck();
    const handTiles = makeInstances([
      'lion', 'lion', 'lion',
      'elephant', 'elephant', 'elephant',
      'zebra', 'zebra', 'penguin',
    ]);
    const results = analyzeDiscardImpact({
      deck,
      variant,
      handTiles,
      tileInstanceIds: ['zebra#1'],
    });
    const impact = results[0]!;
    // zebraを捨てると残りはlion3+elephant3+zebra1+penguin。ペアが作れずtenpaiが消える
    expect(impact.keepsCandidateIds).toHaveLength(0);
    expect(impact.removesUnusedTile).toBe(false);
  });
});

describe('buildBoardInsights', () => {
  it('あがれる手はcanWin insightが最優先', () => {
    const { deck, variant } = animalDeck();
    const insights = buildBoardInsights({
      deck,
      variant,
      handTiles: makeInstances([
        'lion', 'lion', 'lion',
        'elephant', 'elephant', 'elephant',
        'zebra', 'zebra', 'zebra',
      ]),
      context: 'afterDrawNineTiles',
      mode: 'normal',
    });
    expect(insights[0]?.kind).toBe('canWin');
  });

  it('tenpaiはoneTileAwayで待ちを説明する', () => {
    const { deck, variant } = animalDeck();
    const insights = buildBoardInsights({
      deck,
      variant,
      handTiles: makeInstances([
        'lion', 'lion', 'lion',
        'elephant', 'elephant', 'elephant',
        'zebra', 'zebra',
      ]),
      context: 'afterDiscardEightTiles',
      mode: 'normal',
    });
    const oneAway = insights.find((i) => i.kind === 'oneTileAway');
    expect(oneAway).toBeDefined();
    expect(oneAway?.message).toContain('あと1枚');
  });

  it('insightに最善手系の文言が含まれない', () => {
    const { deck, variant } = animalDeck();
    const insights = buildBoardInsights({
      deck,
      variant,
      handTiles: makeInstances([
        'lion', 'lion', 'lion',
        'rabbit', 'panda', 'butterfly',
        'penguin', 'fish', 'bee',
      ]),
      context: 'afterDrawNineTiles',
      mode: 'advanced',
    });
    for (const insight of insights) {
      for (const word of FORBIDDEN_WORDING) {
        expect(insight.message.toLowerCase()).not.toContain(word.toLowerCase());
      }
    }
  });

  it('beginner=1件 / normal=2件 / advancedは全件', () => {
    const { deck, variant } = animalDeck();
    const handTiles = makeInstances([
      'lion', 'lion', 'lion',
      'rabbit', 'panda', 'butterfly',
      'penguin', 'fish', 'bee',
    ]);
    const beginner = buildBoardInsights({
      deck, variant, handTiles, context: 'afterDrawNineTiles', mode: 'beginner',
    });
    const normal = buildBoardInsights({
      deck, variant, handTiles, context: 'afterDrawNineTiles', mode: 'normal',
    });
    const advanced = buildBoardInsights({
      deck, variant, handTiles, context: 'afterDrawNineTiles', mode: 'advanced',
    });
    expect(beginner.length).toBeLessThanOrEqual(1);
    expect(normal.length).toBeLessThanOrEqual(2);
    expect(advanced.length).toBeGreaterThanOrEqual(normal.length);
  });

  it('wildcard使用がinsightとして出る', () => {
    const { deck, variant } = animalDeck();
    const insights = buildBoardInsights({
      deck,
      variant,
      handTiles: makeInstances([
        'lion', 'lion', 'lion',
        'elephant', 'elephant', 'elephant',
        'zebra', 'zebra', 'star',
      ]),
      context: 'afterDrawNineTiles',
      mode: 'advanced',
    });
    expect(insights.some((i) => i.kind === 'wildcardUsedAs')).toBe(true);
  });
});
