import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  deckProjectSchema,
  deckVariantSchema,
  groupRequirementSchema,
  normalWinRoleSchema,
  scoreBudgetSchema,
  specialBonusSchema,
} from './deckProjectSchema';

function loadAnimalStarter(): unknown {
  const raw = readFileSync(
    join(__dirname, '..', '..', 'samples', 'animal-starter.deck.json'),
    'utf-8',
  );
  return JSON.parse(raw) as unknown;
}

function animalStarterClone(): Record<string, unknown> {
  return structuredClone(loadAnimalStarter()) as Record<string, unknown>;
}

describe('deckProjectSchema: animal starter strict parse', () => {
  it('公式animal starterがstrict parseできる', () => {
    const result = deckProjectSchema.safeParse(loadAnimalStarter());
    expect(result.success).toBe(true);
  });

  it('通常variantのruleConfig固定値が仕様どおり', () => {
    const deck = deckProjectSchema.parse(loadAnimalStarter());
    const normal = deck.variants.find((v) => v.id === deck.activeVariantId);
    expect(normal).toBeDefined();
    if (!normal || normal.ruleConfig.evaluationMode !== 'normalThreeGroups') {
      throw new Error('normal variantがnormalThreeGroupsではない');
    }
    expect(normal.ruleConfig.handSizeNormal).toBe(8);
    expect(normal.ruleConfig.handSizeAfterDraw).toBe(9);
    expect(normal.ruleConfig.winHandSize).toBe(9);
    expect(normal.ruleConfig.groupSize).toBe(3);
    expect(normal.ruleConfig.groupCount).toBe(3);
    expect(normal.ruleConfig.allowPon).toBe(false);
    expect(normal.ruleConfig.allowKan).toBe(false);
    expect(normal.ruleConfig.allowChi).toBe(false);
    expect(normal.winRoles.length).toBeGreaterThanOrEqual(1);
    expect(normal.winRoles.every((role) => role.requiredGroups.length >= 1)).toBe(true);
  });

  it('拡張variantはengineStatus pendingでparseできる', () => {
    const deck = deckProjectSchema.parse(loadAnimalStarter());
    const extended = deck.variants.find((v) => v.id === 'extended');
    expect(extended?.engineStatus).toBe('pending');
    expect(extended?.ruleConfig.evaluationMode).toBe('extendedRoleSpan');
  });

  it('サンプルに画像系フィールドが含まれない', () => {
    const raw = readFileSync(
      join(__dirname, '..', '..', 'samples', 'animal-starter.deck.json'),
      'utf-8',
    );
    for (const forbidden of ['imageUrl', 'imageBase64', 'filePath', 'blobUrl', '"src"', '"href"']) {
      expect(raw.includes(forbidden)).toBe(false);
    }
  });
});

describe('deckProjectSchema: unknown fields rejected', () => {
  it('未知のトップレベルフィールドを拒否する', () => {
    const deck = animalStarterClone();
    deck['savedata'] = { coins: 100 };
    expect(deckProjectSchema.safeParse(deck).success).toBe(false);
  });

  it('旧roles[]混在配列を拒否する', () => {
    const deck = animalStarterClone();
    const variants = deck['variants'] as Record<string, unknown>[];
    variants[0]!['roles'] = [];
    expect(deckProjectSchema.safeParse(deck).success).toBe(false);
  });

  it('tileの未知フィールドを拒否する', () => {
    const deck = animalStarterClone();
    const tiles = deck['tiles'] as Record<string, unknown>[];
    tiles[0]!['power'] = 9999;
    expect(deckProjectSchema.safeParse(deck).success).toBe(false);
  });

  it('wildcardの未知の挙動フィールドを拒否する', () => {
    const deck = animalStarterClone();
    const tiles = deck['tiles'] as Record<string, unknown>[];
    const star = tiles.find((t) => t['id'] === 'star')!;
    (star['wildcard'] as Record<string, unknown>)['grantsExtraTurn'] = true;
    expect(deckProjectSchema.safeParse(deck).success).toBe(false);
  });
});

describe('deckProjectSchema: version', () => {
  it('versionがないと失敗する', () => {
    const deck = animalStarterClone();
    delete deck['version'];
    expect(deckProjectSchema.safeParse(deck).success).toBe(false);
  });

  it('新しいversionは現行スキーマでは失敗する', () => {
    const deck = animalStarterClone();
    deck['version'] = 99;
    expect(deckProjectSchema.safeParse(deck).success).toBe(false);
  });
});

describe('scoreBudgetSchema', () => {
  const validBudget = {
    expectedBaseMin: 30,
    expectedBaseMax: 130,
    expectedResultMin: 40,
    expectedResultMax: 220,
    softResultCap: 300,
    hardResultCap: 500,
    maxSpecialBonusTotal: 80,
    maxScoreBonusTotal: 60,
  };

  it('正常なscoreBudgetがparseできる', () => {
    expect(scoreBudgetSchema.safeParse(validBudget).success).toBe(true);
  });

  it('現行スキーマでscoreBudgetがないvariantは失敗する', () => {
    const deck = animalStarterClone();
    const variants = deck['variants'] as Record<string, unknown>[];
    delete variants[0]!['scoreBudget'];
    expect(deckProjectSchema.safeParse(deck).success).toBe(false);
  });

  it('hardResultCap < softResultCap は失敗する', () => {
    expect(
      scoreBudgetSchema.safeParse({ ...validBudget, hardResultCap: 200 }).success,
    ).toBe(false);
  });

  it('expectedBaseMax < expectedBaseMin は失敗する', () => {
    expect(
      scoreBudgetSchema.safeParse({ ...validBudget, expectedBaseMax: 10 }).success,
    ).toBe(false);
  });

  it('softResultCap < expectedResultMax は失敗する', () => {
    expect(
      scoreBudgetSchema.safeParse({ ...validBudget, softResultCap: 100 }).success,
    ).toBe(false);
  });
});

describe('normalWinRoleSchema', () => {
  const validRole = {
    id: 'win_test',
    name: 'テスト役',
    kind: 'win_role',
    family: 'groupPattern',
    basePoints: 80,
    requiredGroups: [{ groupType: 'sameCategory', categoryId: 'mammal', count: 3 }],
    allowWildcard: true,
    maxWildcards: 1,
    priority: 10,
    explanation: '哺乳類グループを3組そろえる。',
    canTsumo: true,
    canRon: true,
  };

  it('group-backed win_roleがparseできる', () => {
    expect(normalWinRoleSchema.safeParse(validRole).success).toBe(true);
  });

  it('requiredGroupsがないwin_roleは失敗する', () => {
    const { requiredGroups: _omitted, ...withoutGroups } = validRole;
    expect(normalWinRoleSchema.safeParse(withoutGroups).success).toBe(false);
  });

  it('count-only条件のみ(requiredGroups空)のwin_roleは失敗する', () => {
    expect(
      normalWinRoleSchema.safeParse({
        ...validRole,
        requiredGroups: [],
        wholeHandCondition: { type: 'countByCategory', categoryId: 'mammal', minCount: 6 },
      }).success,
    ).toBe(false);
  });

  it('basePoints 0 は失敗する', () => {
    expect(normalWinRoleSchema.safeParse({ ...validRole, basePoints: 0 }).success).toBe(false);
  });

  it('canTsumoもcanRonもfalseだと失敗する', () => {
    expect(
      normalWinRoleSchema.safeParse({ ...validRole, canTsumo: false, canRon: false }).success,
    ).toBe(false);
  });

  it('requiredGroupsのcount合計が3を超えると失敗する', () => {
    expect(
      normalWinRoleSchema.safeParse({
        ...validRole,
        requiredGroups: [
          { groupType: 'sameCategory', categoryId: 'mammal', count: 3 },
          { groupType: 'sameCategory', categoryId: 'bird', count: 1 },
        ],
      }).success,
    ).toBe(false);
  });

  it('旧points fieldは失敗する', () => {
    expect(
      normalWinRoleSchema.safeParse({ ...validRole, points: 100 }).success,
    ).toBe(false);
  });
});

describe('groupRequirementSchema', () => {
  it('specificSetでtileIdsが2個だと失敗する', () => {
    expect(
      groupRequirementSchema.safeParse({
        groupType: 'specificSet',
        tileIds: ['lion', 'elephant'],
        count: 1,
      }).success,
    ).toBe(false);
  });

  it('specificSetでtileIdsが3個ならparseできる', () => {
    expect(
      groupRequirementSchema.safeParse({
        groupType: 'specificSet',
        tileIds: ['lion', 'elephant', 'giraffe'],
        count: 1,
      }).success,
    ).toBe(true);
  });

  it('sameCategoryでcategoryIdがないと失敗する', () => {
    expect(
      groupRequirementSchema.safeParse({ groupType: 'sameCategory', count: 3 }).success,
    ).toBe(false);
  });

  it('sameTagでtagがないと失敗する', () => {
    expect(groupRequirementSchema.safeParse({ groupType: 'sameTag', count: 1 }).success).toBe(
      false,
    );
  });
});

describe('specialBonusSchema', () => {
  const validBonus = {
    id: 'bonus_test',
    name: 'テストボーナス',
    kind: 'special_bonus',
    points: 20,
    condition: { type: 'countByCategory', categoryId: 'cute', minCount: 3 },
    allowWildcard: true,
    maxWildcards: 1,
    explanation: 'かわいいが3枚以上で加点。単体ではあがれない。',
  };

  it('special_bonusがparseできる', () => {
    expect(specialBonusSchema.safeParse(validBonus).success).toBe(true);
  });

  it('special_bonusにcanRonがあると失敗する', () => {
    expect(specialBonusSchema.safeParse({ ...validBonus, canRon: true }).success).toBe(false);
  });

  it('special_bonusにcanTsumoがあると失敗する', () => {
    expect(specialBonusSchema.safeParse({ ...validBonus, canTsumo: true }).success).toBe(false);
  });
});

describe('deckVariantSchema', () => {
  it('score_bonusをwinRolesに混ぜると失敗する', () => {
    const deck = animalStarterClone();
    const variants = deck['variants'] as Record<string, unknown>[];
    const winRoles = variants[0]!['winRoles'] as Record<string, unknown>[];
    winRoles.push({
      id: 'fake_score_bonus',
      name: '偽ボーナス',
      kind: 'score_bonus',
      basePoints: 10,
      requiredGroups: [{ groupType: 'freeSet', count: 1 }],
      allowWildcard: false,
      maxWildcards: 0,
      priority: 1,
      explanation: 'score_bonusはRole.kindに入らない。',
      canTsumo: true,
      canRon: true,
    });
    expect(deckProjectSchema.safeParse(deck).success).toBe(false);
  });

  it('normal variantでhandSizeNormal 13は失敗する', () => {
    const deck = animalStarterClone();
    const variants = deck['variants'] as Record<string, unknown>[];
    const ruleConfig = variants[0]!['ruleConfig'] as Record<string, unknown>;
    ruleConfig['handSizeNormal'] = 13;
    expect(deckProjectSchema.safeParse(deck).success).toBe(false);
  });

  it('supportedPlayerCountsに2は入らない', () => {
    const deck = animalStarterClone();
    const variants = deck['variants'] as Record<string, unknown>[];
    const ruleConfig = variants[0]!['ruleConfig'] as Record<string, unknown>;
    ruleConfig['supportedPlayerCounts'] = [2, 3];
    expect(deckProjectSchema.safeParse(deck).success).toBe(false);
  });

  it('normalThreeGroups variantにroleSpanMin/roleSpanMaxがあると失敗する', () => {
    const deck = animalStarterClone();
    const variants = deck['variants'] as Record<string, unknown>[];
    const ruleConfig = variants[0]!['ruleConfig'] as Record<string, unknown>;
    ruleConfig['roleSpanMin'] = 2;
    ruleConfig['roleSpanMax'] = 9;
    expect(deckProjectSchema.safeParse(deck).success).toBe(false);
  });

  it('deckVariantSchema単体でも未知フィールドを拒否する', () => {
    const deck = deckProjectSchema.parse(loadAnimalStarter());
    const variant = structuredClone(deck.variants[0]) as unknown as Record<string, unknown>;
    variant['cheatMode'] = true;
    expect(deckVariantSchema.safeParse(variant).success).toBe(false);
  });
});
