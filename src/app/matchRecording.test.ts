import { describe, expect, it } from 'vitest';
import type { DeckProject } from '../domain/deck';
import type { MatchState } from '../domain/match';
import type { ResultBreakdown } from '../domain/score';
import { deckProjectSchema } from '../schemas/deckProjectSchema';
import { loadSampleText } from '../test-support/fixtures/loadFixture';
import { buildMatchRecordingResult } from './matchRecording';

function animalDeck(): DeckProject {
  return deckProjectSchema.parse(JSON.parse(loadSampleText('animal-starter.deck.json')));
}

function baseState(overrides: Partial<MatchState> = {}): MatchState {
  return {
    deckProjectId: 'official-animal-starter',
    variantId: 'normal',
    seed: 42,
    players: [
      { id: 'you', name: 'あなた', kind: 'human', seatIndex: 0, hand: [], discards: [] },
      { id: 'cpu1', name: 'トモリ', kind: 'cpu', seatIndex: 1, hand: [], discards: [] },
    ],
    drawPile: [],
    currentPlayerIndex: 0,
    turnCount: 3,
    phase: 'result',
    ...overrides,
  };
}

const breakdown: ResultBreakdown = {
  winnerPlayerId: 'you',
  winMethod: 'tsumo',
  selectedWinRoleId: 'win_mammal_three_groups',
  selectedWinRoleName: 'どうぶつ王国',
  basePoints: 80,
  groups: [],
  wildcardAssignments: [],
  appliedSpecialBonuses: [],
  appliedScoreBonuses: [],
  alternativeWinRoleIds: [],
  totalPoints: 80,
  warnings: [],
};

describe('buildMatchRecordingResult', () => {
  it('resultがないstateはnullを返す', () => {
    const result = buildMatchRecordingResult({
      finalState: baseState(),
      deck: animalDeck(),
      deckSource: 'official',
    });
    expect(result).toBeNull();
  });

  it('人間のツモ勝利からrecord/roleKey/achievementEvent/matchKeyを組み立てる', () => {
    const state = baseState({
      result: { reason: 'tsumo', winnerPlayerId: 'you', breakdown },
    });
    const result = buildMatchRecordingResult({
      finalState: state,
      deck: animalDeck(),
      deckSource: 'official',
    });
    expect(result).not.toBeNull();
    if (!result) return;
    expect(result.record.humanWon).toBe(true);
    expect(result.record.coinsEarned).toBe(80);
    expect(result.roleKey).toBe('official-animal-starter:win_mammal_three_groups');
    expect(result.achievementEvent).toMatchObject({
      type: 'matchEnd',
      reason: 'tsumo',
      humanWon: true,
      playerCount: 2,
      deckSource: 'official',
    });
    expect(result.matchKey).toBe('official-animal-starter:normal:42:tsumo:you');
  });

  it('同じfinalStateから常に同じmatchKeyが得られる(冪等キーの安定性)', () => {
    const state = baseState({
      result: { reason: 'tsumo', winnerPlayerId: 'you', breakdown },
    });
    const a = buildMatchRecordingResult({ finalState: state, deck: animalDeck(), deckSource: 'official' });
    const b = buildMatchRecordingResult({ finalState: state, deck: animalDeck(), deckSource: 'official' });
    expect(a?.matchKey).toBe(b?.matchKey);
  });

  it('seedが異なれば別のmatchKeyになる(異なる対局として区別される)', () => {
    const stateA = baseState({
      seed: 1,
      result: { reason: 'tsumo', winnerPlayerId: 'you', breakdown },
    });
    const stateB = baseState({
      seed: 2,
      result: { reason: 'tsumo', winnerPlayerId: 'you', breakdown },
    });
    const a = buildMatchRecordingResult({ finalState: stateA, deck: animalDeck(), deckSource: 'official' });
    const b = buildMatchRecordingResult({ finalState: stateB, deck: animalDeck(), deckSource: 'official' });
    expect(a?.matchKey).not.toBe(b?.matchKey);
  });

  it('CPU勝利時はhumanWon=false、roleKeyは付かない', () => {
    const cpuBreakdown: ResultBreakdown = { ...breakdown, winnerPlayerId: 'cpu1' };
    const state = baseState({
      result: { reason: 'ron', winnerPlayerId: 'cpu1', loserPlayerId: 'you', breakdown: cpuBreakdown },
    });
    const result = buildMatchRecordingResult({ finalState: state, deck: animalDeck(), deckSource: 'official' });
    expect(result?.record.humanWon).toBe(false);
    expect(result?.record.coinsEarned).toBe(10);
    expect(result?.roleKey).toBeUndefined();
  });

  it('流局はwinnerPlayerId未定義でmatchKeyがdrawになる', () => {
    const state = baseState({ result: { reason: 'draw' } });
    const result = buildMatchRecordingResult({ finalState: state, deck: animalDeck(), deckSource: 'official' });
    expect(result?.matchKey).toBe('official-animal-starter:normal:42:draw:draw');
    expect(result?.record.humanWon).toBe(false);
    expect(result?.record.coinsEarned).toBe(10);
  });
});
