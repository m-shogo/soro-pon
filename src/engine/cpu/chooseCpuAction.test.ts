import { describe, expect, it } from 'vitest';
import type { DeckProject } from '../../domain/deck';
import type { MatchState } from '../../domain/match';
import type { DeckVariant } from '../../domain/variant';
import { deckProjectSchema } from '../../schemas/deckProjectSchema';
import { makeInstances } from '../../test-support/builders/handBuilder';
import { loadSampleText } from '../../test-support/fixtures/loadFixture';
import { applyMatchAction, type MatchContext } from '../match/applyMatchAction';
import { createInitialMatchState } from '../match/createInitialMatchState';
import { chooseCpuAction } from './chooseCpuAction';

function animalContext(): MatchContext {
  const deck: DeckProject = deckProjectSchema.parse(
    JSON.parse(loadSampleText('animal-starter.deck.json')),
  );
  const variant: DeckVariant = deck.variants.find((v) => v.id === 'normal')!;
  return { deck, variant };
}

function cpuStateWithHand(
  context: MatchContext,
  tileIds: string[],
  phase: MatchState['phase'],
): MatchState {
  const hand = makeInstances(tileIds).map((t) => ({ ...t, ownerPlayerId: 'c1' }));
  return {
    deckProjectId: context.deck.id,
    variantId: context.variant.id,
    seed: 7,
    players: [
      { id: 'c1', name: 'CPU壱', kind: 'cpu', seatIndex: 0, hand, discards: [] },
      { id: 'c2', name: 'CPU弐', kind: 'cpu', seatIndex: 1, hand: makeInstances(['owl', 'owl', 'owl', 'duck', 'duck', 'duck', 'bee', 'bee']).map((t) => ({ ...t, ownerPlayerId: 'c2' })), discards: [] },
      { id: 'c3', name: 'CPU参', kind: 'cpu', seatIndex: 2, hand: makeInstances(['fox', 'fox', 'fox', 'wolf', 'wolf', 'wolf', 'ant', 'ant']).map((t) => ({ ...t, ownerPlayerId: 'c3' })), discards: [] },
    ],
    drawPile: makeInstances(['monkey', 'monkey', 'monkey']),
    currentPlayerIndex: 0,
    turnCount: 5,
    phase,
  };
}

describe('chooseCpuAction', () => {
  it('あがれるならDECLARE_TSUMO', () => {
    const context = animalContext();
    const state = cpuStateWithHand(
      context,
      ['lion', 'lion', 'lion', 'elephant', 'elephant', 'elephant', 'zebra', 'zebra', 'zebra'],
      'afterDrawAction',
    );
    const action = chooseCpuAction({ state, ...context, playerId: 'c1' });
    expect(action.type).toBe('DECLARE_TSUMO');
  });

  it('あがれないならSELECT_TILEし、wildcardは残す', () => {
    const context = animalContext();
    const state = cpuStateWithHand(
      context,
      ['lion', 'lion', 'lion', 'elephant', 'elephant', 'elephant', 'zebra', 'star', 'penguin'],
      'afterDrawAction',
    );
    const action = chooseCpuAction({ state, ...context, playerId: 'c1' });
    expect(action.type).toBe('SELECT_TILE');
    if (action.type !== 'SELECT_TILE') return;
    // wildcard(star)は捨てない
    expect(action.tileInstanceId).not.toBe('star#1');
    // 待ちを維持する捨て牌(penguin)を選ぶ
    expect(action.tileInstanceId).toBe('penguin#1');
  });

  it('同じ状態からは常に同じactionを返す(決定的)', () => {
    const context = animalContext();
    const state = cpuStateWithHand(
      context,
      ['lion', 'penguin', 'bee', 'whale', 'snake', 'frog', 'owl', 'duck', 'ant'],
      'afterDrawAction',
    );
    const a = chooseCpuAction({ state, ...context, playerId: 'c1' });
    const b = chooseCpuAction({ state, ...context, playerId: 'c1' });
    expect(a).toEqual(b);
  });

  it('相手の手牌を変えてもCPUの選択は変わらない(隠し情報を見ない)', () => {
    const context = animalContext();
    const state = cpuStateWithHand(
      context,
      ['lion', 'lion', 'lion', 'elephant', 'elephant', 'elephant', 'zebra', 'star', 'penguin'],
      'afterDrawAction',
    );
    const modified: MatchState = {
      ...state,
      players: state.players.map((p) =>
        p.id === 'c2'
          ? { ...p, hand: makeInstances(['whale', 'whale', 'whale', 'fish', 'fish', 'fish', 'octopus', 'octopus']).map((t) => ({ ...t, ownerPlayerId: 'c2' })) }
          : p,
      ),
    };
    const a = chooseCpuAction({ state, ...context, playerId: 'c1' });
    const b = chooseCpuAction({ state: modified, ...context, playerId: 'c1' });
    expect(a).toEqual(b);
  });

  it('ロンできるならDECLARE_RON、できないならPASS_RON', () => {
    const context = animalContext();
    const base = cpuStateWithHand(
      context,
      ['lion', 'lion', 'lion', 'elephant', 'elephant', 'elephant', 'zebra', 'zebra'],
      'reactionRon',
    );
    const discardedZebra = { instanceId: 'zebra#88', tileId: 'zebra', location: 'discard' as const };
    const stateRon: MatchState = {
      ...base,
      reaction: {
        type: 'ron',
        discardOwnerId: 'c3',
        discardedTile: discardedZebra,
        pendingPlayerIds: ['c1', 'c2'],
      },
    };
    expect(chooseCpuAction({ state: stateRon, ...context, playerId: 'c1' }).type).toBe(
      'DECLARE_RON',
    );

    const discardedBee = { instanceId: 'bee#88', tileId: 'bee', location: 'discard' as const };
    const statePass: MatchState = {
      ...base,
      reaction: {
        type: 'ron',
        discardOwnerId: 'c3',
        discardedTile: discardedBee,
        pendingPlayerIds: ['c1', 'c2'],
      },
    };
    expect(chooseCpuAction({ state: statePass, ...context, playerId: 'c1' }).type).toBe(
      'PASS_RON',
    );
  });
});

describe('CPU同士のフル対局シミュレーション', () => {
  function runFullMatch(seed: number): MatchState {
    const context = animalContext();
    let state = createInitialMatchState({
      deck: context.deck,
      variant: context.variant,
      players: [
        { id: 'c1', name: 'CPU壱', kind: 'cpu' },
        { id: 'c2', name: 'CPU弐', kind: 'cpu' },
        { id: 'c3', name: 'CPU参', kind: 'cpu' },
      ],
      seed,
    });
    const step = (action: Parameters<typeof applyMatchAction>[1]) => {
      const result = applyMatchAction(state, action, context);
      if (!result.ok) {
        throw new Error(`action ${action.type} failed: ${result.error.code} ${result.error.message}`);
      }
      state = result.state;
    };

    step({ type: 'START_MATCH' });
    step({ type: 'DEAL_COMPLETE' });

    for (let i = 0; i < 2000; i++) {
      if (state.phase === 'result') {
        return state;
      }
      switch (state.phase) {
        case 'turnStart':
          step({ type: 'START_TURN' });
          break;
        case 'draw':
        case 'afterDrawAction':
        case 'discardSelect': {
          const playerId = state.players[state.currentPlayerIndex]!.id;
          step(chooseCpuAction({ state, ...context, playerId }));
          break;
        }
        case 'reactionRon': {
          const playerId = state.reaction!.pendingPlayerIds[0]!;
          step(chooseCpuAction({ state, ...context, playerId }));
          break;
        }
        case 'turnEnd':
          step(state.drawPile.length === 0 ? { type: 'DRAW_PILE_EMPTY' } : { type: 'NEXT_TURN' });
          break;
        case 'roundEnd':
          step({ type: 'SHOW_RESULT' });
          break;
        default:
          throw new Error(`unexpected phase ${state.phase}`);
      }
    }
    throw new Error('match did not finish within 2000 steps');
  }

  it('seed違いの3対局が最後まで破綻なく完走する', () => {
    for (const seed of [1, 42, 2026]) {
      const finalState = runFullMatch(seed);
      expect(finalState.phase).toBe('result');
      expect(['tsumo', 'ron', 'draw']).toContain(finalState.result!.reason);
      if (finalState.result!.reason !== 'draw') {
        expect(finalState.result!.breakdown!.totalPoints).toBeGreaterThan(0);
        expect(finalState.result!.breakdown!.groups).toHaveLength(3);
      }
    }
  });

  it('同じseedの対局は同じ結果になる(リプレイ可能)', () => {
    const a = runFullMatch(123);
    const b = runFullMatch(123);
    expect(JSON.stringify(a)).toBe(JSON.stringify(b));
  });
});
