import { describe, expect, it } from 'vitest';
import type { ResultBreakdown } from '../domain/score';
import { EMPTY_RECORDS, type RecordsPayload } from '../schemas/storageSchema';
import { ACHIEVEMENTS, computeNewAchievements, titleFor } from './achievements';

const breakdown: ResultBreakdown = {
  winnerPlayerId: 'you',
  winMethod: 'tsumo',
  selectedWinRoleId: 'r1',
  selectedWinRoleName: '役',
  basePoints: 80,
  groups: [],
  wildcardAssignments: [],
  appliedSpecialBonuses: [],
  appliedScoreBonuses: [],
  alternativeWinRoleIds: [],
  totalPoints: 120,
  warnings: [],
};

describe('achievements', () => {
  it('クリアボードは25マスでIDが一意', () => {
    expect(ACHIEVEMENTS).toHaveLength(25);
    expect(new Set(ACHIEVEMENTS.map((a) => a.id)).size).toBe(25);
  });

  it('初勝利(ツモ/3人/wildcardなし/100点以上)で複数解放される', () => {
    const gained = computeNewAchievements(
      [],
      {
        type: 'matchEnd',
        reason: 'tsumo',
        humanWon: true,
        playerCount: 3,
        deckSource: 'official',
        breakdown,
      },
      EMPTY_RECORDS,
    );
    expect(gained).toContain('first-win');
    expect(gained).toContain('win-tsumo');
    expect(gained).toContain('win-3players');
    expect(gained).toContain('win-without-wildcard');
    expect(gained).toContain('score-100');
    expect(gained).not.toContain('win-ron');
    expect(gained).not.toContain('score-200');
  });

  it('解放済みは再度返さない', () => {
    const gained = computeNewAchievements(
      ['first-win', 'win-tsumo', 'win-3players', 'win-without-wildcard', 'score-100'],
      {
        type: 'matchEnd',
        reason: 'tsumo',
        humanWon: true,
        playerCount: 3,
        deckSource: 'official',
        breakdown,
      },
      EMPTY_RECORDS,
    );
    expect(gained).toEqual([]);
  });

  it('累計系: 5局/コイン500/役3種', () => {
    const records: RecordsPayload = {
      ...EMPTY_RECORDS,
      totalMatches: 5,
      coins: 520,
      roleCollection: ['a:r1', 'a:r2', 'b:r3'],
    };
    const gained = computeNewAchievements([], { type: 'deckExported' }, records);
    expect(gained).toContain('play-5');
    expect(gained).toContain('coins-500');
    expect(gained).toContain('three-roles');
    expect(gained).toContain('export-deck');
  });

  it('流局はdraw-roundのみ(勝利系は解放しない)', () => {
    const gained = computeNewAchievements(
      [],
      {
        type: 'matchEnd',
        reason: 'draw',
        humanWon: false,
        playerCount: 3,
        deckSource: 'official',
      },
      EMPTY_RECORDS,
    );
    expect(gained).toContain('draw-round');
    expect(gained).not.toContain('first-win');
  });

  it('警告0の自作デッキ保存で2つ解放', () => {
    const gained = computeNewAchievements(
      [],
      { type: 'deckSaved', source: 'created', hasWarnings: false },
      EMPTY_RECORDS,
    );
    expect(gained).toContain('save-created-deck');
    expect(gained).toContain('save-clean-deck');
  });

  it('称号は実績数で進む', () => {
    expect(titleFor(0)).toBe('見習いの札師');
    expect(titleFor(3)).toBe('はじめての役職人');
    expect(titleFor(8)).toBe('記憶集めの常連');
    expect(titleFor(15)).toBe('役職人');
    expect(titleFor(25)).toBe('記憶の書き手');
  });
});
