import { describe, expect, it } from 'vitest';
import type { DeckProject } from '../../domain/deck';
import { parseDeckImport } from '../import/parseDeckImport';
import { deckProjectSchema } from '../../schemas/deckProjectSchema';
import { buildMinimalDeck } from '../../test-support/builders/deckBuilder';
import { validateDeckEntityIds } from './validateDeckEntityIds';
import { validateDeckForUse } from './validateDeckForUse';

function minimalDeck(): DeckProject {
  return deckProjectSchema.parse(buildMinimalDeck());
}

function codesOf(deck: DeckProject): string[] {
  return validateDeckEntityIds(deck).map((issue) => issue.code);
}

describe('nested deck entity ID integrity', () => {
  it('variant ID重複をV3010で検出し、統合validatorをdraftにする', () => {
    const deck = minimalDeck();
    const duplicate = structuredClone(deck.variants[0]!);
    duplicate.name = '重複variant';
    deck.variants.push(duplicate);

    const issues = validateDeckEntityIds(deck);
    expect(codesOf(deck)).toContain('V3010');
    expect(issues.some((issue) => issue.path === '$.variants[1].id')).toBe(true);
    expect(validateDeckForUse(deck).status).toBe('draft');
  });

  it('role IDはvariantをまたいで一意でなければならない', () => {
    const deck = minimalDeck();
    const second = structuredClone(deck.variants[0]!);
    second.id = 'normal-alt';
    second.name = '別variant';
    second.ruleConfig.id = 'normal-alt-rule';
    deck.variants.push(second);

    const issues = validateDeckEntityIds(deck);
    expect(issues.filter((issue) => issue.message.includes('役ID')).length).toBe(3);
    expect(issues.every((issue) => issue.code === 'V3010')).toBe(true);
  });

  it('special bonusとscore bonusは同じbonus ID namespaceを共有する', () => {
    const deck = minimalDeck();
    const variant = deck.variants[0]!;
    variant.specialBonuses.push({
      id: 'shared-bonus',
      name: '特別ボーナス',
      kind: 'special_bonus',
      points: 20,
      condition: { type: 'countByCategory', categoryId: 'fruit', minCount: 3 },
      allowWildcard: false,
      maxWildcards: 0,
      explanation: '果物を3枚以上持っている場合に加点する。',
    });
    variant.scoreBonuses.push({
      id: 'shared-bonus',
      name: 'スコアボーナス',
      type: 'duplicate_tile',
      minCount: 3,
      points: 15,
      maxPoints: 15,
      allowWildcard: false,
      description: '同じ牌3枚で加点する。',
    });

    const issues = validateDeckEntityIds(deck);
    expect(issues).toHaveLength(1);
    expect(issues[0]?.code).toBe('V3010');
    expect(issues[0]?.path).toContain('scoreBonuses');
  });

  it('重複nested IDを含む共有JSONは保存前にimport拒否する', () => {
    const deck = minimalDeck();
    deck.variants[0]!.winRoles[1]!.id = deck.variants[0]!.winRoles[0]!.id;

    const result = parseDeckImport({ rawText: JSON.stringify(deck) });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.issues.some((issue) => issue.code === 'V3010')).toBe(true);
    }
  });
});
