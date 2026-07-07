import { describe, expect, it } from 'vitest';
import type { DeckProject } from '../../domain/deck';
import { deckProjectSchema } from '../../schemas/deckProjectSchema';
import { buildDeckWithWildcard, buildMinimalDeck } from '../../test-support/builders/deckBuilder';
import {
  loadFixtureJson,
  loadSampleText,
} from '../../test-support/fixtures/loadFixture';
import { validateDeckProject } from './validateDeckProject';

function parseDeck(raw: unknown): DeckProject {
  return deckProjectSchema.parse(raw);
}

function loadDeckFixture(relativePath: string): DeckProject {
  return parseDeck(loadFixtureJson(relativePath));
}

function codesOf(result: ReturnType<typeof validateDeckProject>): string[] {
  return result.issues.map((issue) => issue.code);
}

describe('validateDeckProject: 正常系', () => {
  it('valid-minimalはplayable', () => {
    const result = validateDeckProject({
      deck: loadDeckFixture('decks/valid/valid-minimal.deck.json'),
    });
    expect(result.issues.filter((i) => i.severity === 'error')).toEqual([]);
    expect(result.status).toBe('playable');
  });

  it('animal starterはエラーなしで遊べる', () => {
    const deck = parseDeck(JSON.parse(loadSampleText('animal-starter.deck.json')));
    const result = validateDeckProject({ deck });
    expect(result.issues.filter((i) => i.severity === 'error')).toEqual([]);
    expect(['playable', 'playableWithWarnings']).toContain(result.status);
  });

  it('wildcard入りの最小デッキもエラーなし', () => {
    const result = validateDeckProject({ deck: parseDeck(buildDeckWithWildcard()) });
    expect(result.issues.filter((i) => i.severity === 'error')).toEqual([]);
  });
});

describe('validateDeckProject: blocking errors', () => {
  it('win_roleゼロはV3001でdraft', () => {
    const result = validateDeckProject({
      deck: loadDeckFixture('decks/invalid/invalid-no-win-role.deck.json'),
    });
    expect(result.status).toBe('draft');
    expect(codesOf(result)).toContain('V3001');
  });

  it('bonusだけのデッキもV3001(ボーナスではあがれない)', () => {
    const result = validateDeckProject({
      deck: loadDeckFixture('decks/invalid/invalid-bonus-only.deck.json'),
    });
    expect(result.status).toBe('draft');
    expect(codesOf(result)).toContain('V3001');
  });

  it('存在しないカテゴリ参照はR4002', () => {
    const result = validateDeckProject({
      deck: loadDeckFixture('decks/invalid/invalid-unknown-category-ref.deck.json'),
    });
    expect(result.status).toBe('draft');
    expect(codesOf(result)).toContain('R4002');
  });

  it('存在しない牌参照はR4003', () => {
    const result = validateDeckProject({
      deck: loadDeckFixture('decks/invalid/invalid-unknown-tile-ref.deck.json'),
    });
    expect(result.status).toBe('draft');
    expect(codesOf(result)).toContain('R4003');
  });

  it('activeVariantIdが存在しないとV3003でblocked', () => {
    const deck = parseDeck(buildMinimalDeck({ activeVariantId: 'ghost' }));
    const result = validateDeckProject({ deck });
    expect(result.status).toBe('blocked');
    expect(codesOf(result)).toContain('V3003');
  });

  it('牌数から成立不可能な役はR4005', () => {
    const result = validateDeckProject({
      deck: loadDeckFixture('decks/adversarial/adversarial-impossible-role.deck.json'),
    });
    expect(result.status).toBe('draft');
    expect(codesOf(result)).toContain('R4005');
  });

  it('wildcard比率15%超はW5002', () => {
    const result = validateDeckProject({
      deck: loadDeckFixture('decks/adversarial/adversarial-wildcard-heavy.deck.json'),
    });
    expect(result.status).toBe('draft');
    expect(codesOf(result)).toContain('W5002');
  });

  it('配り切れない牌数はV3002', () => {
    const deck = buildMinimalDeck();
    const tiles = (deck['tiles'] as Record<string, unknown>[]).slice(0, 4);
    const result = validateDeckProject({ deck: parseDeck({ ...deck, tiles }) });
    expect(result.status).toBe('draft');
    expect(codesOf(result)).toContain('V3002');
  });

  it('wildcardカテゴリを通常役に使うとW5003', () => {
    const deck = buildDeckWithWildcard();
    const variants = deck['variants'] as Record<string, unknown>[];
    const winRoles = variants[0]!['winRoles'] as Record<string, unknown>[];
    winRoles[0]!['requiredGroups'] = [
      { groupType: 'sameCategory', categoryId: 'wildcard', count: 3 },
    ];
    const result = validateDeckProject({ deck: parseDeck(deck) });
    expect(result.status).toBe('draft');
    expect(codesOf(result)).toContain('W5003');
  });

  it('重複tileIdはV3010', () => {
    const deck = buildMinimalDeck();
    const tiles = deck['tiles'] as Record<string, unknown>[];
    tiles.push({ ...tiles[0]! });
    const result = validateDeckProject({ deck: parseDeck(deck) });
    expect(result.status).toBe('draft');
    expect(codesOf(result)).toContain('V3010');
  });

  it('拡張variantをactiveにするとE7008でblocked', () => {
    const deck = buildMinimalDeck();
    const variants = deck['variants'] as Record<string, unknown>[];
    variants.push({
      id: 'extended',
      name: '拡張版',
      label: '拡張版',
      isExperimental: true,
      ruleConfig: {
        id: 'ext-rule',
        name: '拡張ルール',
        evaluationMode: 'extendedRoleSpan',
        supportedPlayerCounts: [3, 4],
        handSizeNormal: 13,
        handSizeAfterDraw: 14,
        winHandSize: 14,
        roleSpanMin: 2,
        roleSpanMax: 14,
        allowRon: true,
        allowPon: false,
        allowKan: false,
        allowChi: false,
        allowReach: false,
        allowScoreBonus: true,
        allowWildcard: true,
      },
      scoreBudget: {
        expectedBaseMin: 50,
        expectedBaseMax: 220,
        expectedResultMin: 70,
        expectedResultMax: 350,
        softResultCap: 500,
        hardResultCap: 800,
        maxSpecialBonusTotal: 120,
        maxScoreBonusTotal: 100,
      },
      winRoles: [],
      specialBonuses: [],
      scoreBonuses: [],
      engineStatus: 'pending',
    });
    const result = validateDeckProject({
      deck: parseDeck({ ...deck, activeVariantId: 'extended' }),
    });
    expect(result.status).toBe('blocked');
    expect(codesOf(result)).toContain('E7008');
  });
});

describe('validateDeckProject: warnings', () => {
  it('同一条件で点数違いの役はR4008', () => {
    const result = validateDeckProject({
      deck: loadDeckFixture('decks/adversarial/adversarial-duplicate-roles.deck.json'),
    });
    expect(codesOf(result)).toContain('R4008');
    expect(result.status).toBe('playableWithWarnings');
  });

  it('点数バランス崩壊はB6002/B6005/B6006', () => {
    const result = validateDeckProject({
      deck: loadDeckFixture('decks/adversarial/adversarial-score-explosion.deck.json'),
    });
    const codes = codesOf(result);
    expect(codes).toContain('B6002');
    expect(codes).toContain('B6005');
    expect(codes).toContain('B6006');
  });

  it('小さすぎるカテゴリはV3007、未使用カテゴリはV3009', () => {
    const result = validateDeckProject({
      deck: loadDeckFixture('decks/adversarial/adversarial-category-too-small.deck.json'),
    });
    const codes = codesOf(result);
    expect(codes).toContain('V3007');
    expect(codes).toContain('V3009');
  });

  it('win_roleが1-2個だとV3005', () => {
    const deck = buildMinimalDeck();
    const variants = deck['variants'] as Record<string, unknown>[];
    const winRoles = variants[0]!['winRoles'] as Record<string, unknown>[];
    variants[0]!['winRoles'] = winRoles.slice(0, 1);
    const result = validateDeckProject({ deck: parseDeck(deck) });
    expect(codesOf(result)).toContain('V3005');
  });

  it('maxPointsのないScoreBonusはB6008', () => {
    const deck = buildMinimalDeck();
    const variants = deck['variants'] as Record<string, unknown>[];
    variants[0]!['scoreBonuses'] = [
      {
        id: 'dup_bonus',
        name: '同じ牌ボーナス',
        type: 'duplicate_tile',
        minCount: 3,
        points: 15,
        description: '同じ牌3枚で加点。',
        allowWildcard: false,
      },
    ];
    const result = validateDeckProject({ deck: parseDeck(deck) });
    expect(codesOf(result)).toContain('B6008');
  });

  it('wildcardなしでは成立しない役はR4006 warning', () => {
    const deck = buildDeckWithWildcard();
    const categories = deck['categories'] as Record<string, unknown>[];
    const tiles = deck['tiles'] as Record<string, unknown>[];
    categories.push({ id: 'rare', name: 'レア', color: '#7C3AED', priority: 5, icon: '💎' });
    tiles.push({
      id: 'diamond',
      name: 'ダイヤ',
      categories: ['rare'],
      primaryCategoryId: 'rare',
      fallbackLabel: 'ダ',
      count: 8,
    });
    const variants = deck['variants'] as Record<string, unknown>[];
    const winRoles = variants[0]!['winRoles'] as Record<string, unknown>[];
    // rare 8枚で3グループ(9枚)は自然には不可、wildcard 1枚でちょうど可能
    winRoles.push({
      id: 'win_rare_wildcard_only',
      name: 'レアの奇跡',
      kind: 'win_role',
      family: 'groupPattern',
      basePoints: 120,
      requiredGroups: [{ groupType: 'sameCategory', categoryId: 'rare', count: 3 }],
      allowWildcard: true,
      maxWildcards: 1,
      priority: 40,
      explanation: 'レアの3枚グループを3組そろえる。',
      canTsumo: true,
      canRon: true,
    });
    const result = validateDeckProject({ deck: parseDeck(deck) });
    expect(codesOf(result)).toContain('R4006');
    expect(result.issues.filter((i) => i.severity === 'error')).toEqual([]);
  });
});
