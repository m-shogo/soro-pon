import { describe, expect, it } from 'vitest';
import type { DeckProject } from '../../domain/deck';
import type { MatchState } from '../../domain/match';
import type { DeckVariant } from '../../domain/variant';
import { deckProjectSchema } from '../../schemas/deckProjectSchema';
import { makeInstances } from '../../test-support/builders/handBuilder';
import { loadSampleText } from '../../test-support/fixtures/loadFixture';
import { applyMatchAction, type MatchContext } from './applyMatchAction';
import { createInitialMatchState } from './createInitialMatchState';

function animalContext(): MatchContext {
  const deck: DeckProject = deckProjectSchema.parse(
    JSON.parse(loadSampleText('animal-starter.deck.json')),
  );
  const variant: DeckVariant = deck.variants.find((v) => v.id === 'normal')!;
  return { deck, variant };
}

function threePlayers() {
  return [
    { id: 'p1', name: 'あなた', kind: 'human' as const },
    { id: 'p2', name: 'CPU壱', kind: 'cpu' as const },
    { id: 'p3', name: 'CPU弐', kind: 'cpu' as const },
  ];
}

function startedState(context: MatchContext, seed = 1): MatchState {
  let state = createInitialMatchState({
    deck: context.deck,
    variant: context.variant,
    players: threePlayers(),
    seed,
  });
  const started = applyMatchAction(state, { type: 'START_MATCH' }, context);
  if (!started.ok) throw new Error('START_MATCH failed');
  state = started.state;
  const dealt = applyMatchAction(state, { type: 'DEAL_COMPLETE' }, context);
  if (!dealt.ok) throw new Error('DEAL_COMPLETE failed');
  return dealt.state;
}

describe('applyMatchAction: happy path', () => {
  it('setup -> deal -> turnStart -> draw -> afterDrawAction', () => {
    const context = animalContext();
    let state = startedState(context);
    expect(state.phase).toBe('turnStart');
    // 配牌は8枚ずつ
    for (const player of state.players) {
      expect(player.hand).toHaveLength(8);
    }
    expect(state.drawPile).toHaveLength(81 - 24);

    const turn = applyMatchAction(state, { type: 'START_TURN' }, context);
    expect(turn.ok).toBe(true);
    if (!turn.ok) return;
    state = turn.state;
    expect(state.phase).toBe('draw');

    const draw = applyMatchAction(state, { type: 'DRAW_TILE' }, context);
    expect(draw.ok).toBe(true);
    if (!draw.ok) return;
    state = draw.state;
    expect(state.phase).toBe('afterDrawAction');
    expect(state.players[0]!.hand).toHaveLength(9);
    expect(state.drawPile).toHaveLength(81 - 24 - 1);
    expect(draw.events.some((e) => e.type === 'tileDrawn')).toBe(true);
  });

  it('選択→捨て→reactionRon→全員パス→turnEnd→次の番', () => {
    const context = animalContext();
    let state = startedState(context);
    state = applyMatchAction(state, { type: 'START_TURN' }, context).state;
    state = applyMatchAction(state, { type: 'DRAW_TILE' }, context).state;
    const tileId = state.players[0]!.hand[0]!.instanceId;
    const selected = applyMatchAction(
      state,
      { type: 'SELECT_TILE', playerId: 'p1', tileInstanceId: tileId },
      context,
    );
    expect(selected.ok).toBe(true);
    state = selected.state;
    expect(state.phase).toBe('discardSelect');

    const discarded = applyMatchAction(state, { type: 'DISCARD_TILE', playerId: 'p1' }, context);
    expect(discarded.ok).toBe(true);
    state = discarded.state;
    expect(state.phase).toBe('reactionRon');
    expect(state.players[0]!.hand).toHaveLength(8);
    expect(state.players[0]!.discards).toHaveLength(1);
    expect(state.reaction?.pendingPlayerIds).toEqual(['p2', 'p3']);

    const pass1 = applyMatchAction(state, { type: 'PASS_RON', playerId: 'p2' }, context);
    expect(pass1.ok).toBe(true);
    state = pass1.state;
    expect(state.phase).toBe('reactionRon');
    expect(state.reaction?.pendingPlayerIds).toEqual(['p3']);

    const pass2 = applyMatchAction(state, { type: 'PASS_RON', playerId: 'p3' }, context);
    expect(pass2.ok).toBe(true);
    state = pass2.state;
    expect(state.phase).toBe('turnEnd');

    const next = applyMatchAction(state, { type: 'NEXT_TURN' }, context);
    expect(next.ok).toBe(true);
    state = next.state;
    expect(state.phase).toBe('turnStart');
    expect(state.currentPlayerIndex).toBe(1);
  });
});

describe('applyMatchAction: 不正action', () => {
  it('2人戦はE7005', () => {
    const context = animalContext();
    const state = createInitialMatchState({
      deck: context.deck,
      variant: context.variant,
      players: threePlayers().slice(0, 2),
      seed: 1,
    });
    const result = applyMatchAction(state, { type: 'START_MATCH' }, context);
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error.code).toBe('E7005');
    expect(result.state).toBe(state);
  });

  it('draw phaseでのDISCARD_TILEはE7001で元のstateを返す', () => {
    const context = animalContext();
    let state = startedState(context);
    state = applyMatchAction(state, { type: 'START_TURN' }, context).state;
    const before = JSON.stringify(state);
    const result = applyMatchAction(state, { type: 'DISCARD_TILE', playerId: 'p1' }, context);
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error.code).toBe('E7001');
    expect(result.state).toBe(state);
    expect(JSON.stringify(state)).toBe(before);
  });

  it('あがれない手のDECLARE_TSUMOは拒否され、stateは変わらない', () => {
    const context = animalContext();
    let state = startedState(context);
    state = applyMatchAction(state, { type: 'START_TURN' }, context).state;
    state = applyMatchAction(state, { type: 'DRAW_TILE' }, context).state;
    const before = JSON.stringify(state);
    const result = applyMatchAction(state, { type: 'DECLARE_TSUMO', playerId: 'p1' }, context);
    // 初手9枚であがれる確率はほぼゼロ(seed固定で不成立を確認済み)
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(['E7003', 'E7007']).toContain(result.error.code);
    expect(JSON.stringify(state)).toBe(before);
  });

  it('reactionRon以外でのDECLARE_RONはE7001', () => {
    const context = animalContext();
    const state = startedState(context);
    const result = applyMatchAction(state, { type: 'DECLARE_RON', playerId: 'p2' }, context);
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error.code).toBe('E7001');
  });

  it('手牌にない牌のSELECT_TILEはE7002', () => {
    const context = animalContext();
    let state = startedState(context);
    state = applyMatchAction(state, { type: 'START_TURN' }, context).state;
    state = applyMatchAction(state, { type: 'DRAW_TILE' }, context).state;
    const result = applyMatchAction(
      state,
      { type: 'SELECT_TILE', playerId: 'p1', tileInstanceId: 'ghost#1' },
      context,
    );
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error.code).toBe('E7002');
  });
});

// ロン検証用: p1が捨てる直前、p2がテンパイの状態を手組みする
function riggedRonState(context: MatchContext, discardTileId: string): MatchState {
  const p1Hand = makeInstances([
    'penguin', 'owl', 'fish', 'bee', 'frog', 'ant', 'duck', 'octopus',
  ]).map((t) => ({ ...t, ownerPlayerId: 'p1' }));
  const discardTarget = {
    instanceId: `${discardTileId}#77`,
    tileId: discardTileId,
    location: 'hand' as const,
    ownerPlayerId: 'p1',
  };
  const p2Hand = makeInstances([
    'lion', 'lion', 'lion', 'elephant', 'elephant', 'elephant', 'zebra', 'zebra',
  ]).map((t) => ({ ...t, ownerPlayerId: 'p2' }));
  const p3Hand = makeInstances([
    'whale', 'whale', 'turtle', 'snake', 'butterfly', 'ladybug', 'fox', 'wolf',
  ]).map((t) => ({ ...t, ownerPlayerId: 'p3' }));
  return {
    deckProjectId: context.deck.id,
    variantId: context.variant.id,
    seed: 1,
    players: [
      { id: 'p1', name: 'あなた', kind: 'human', seatIndex: 0, hand: [...p1Hand, discardTarget], discards: [] },
      { id: 'p2', name: 'CPU壱', kind: 'cpu', seatIndex: 1, hand: p2Hand, discards: [] },
      { id: 'p3', name: 'CPU弐', kind: 'cpu', seatIndex: 2, hand: p3Hand, discards: [] },
    ],
    drawPile: makeInstances(['monkey', 'monkey']).map((t) => ({ ...t, location: 'drawPile' as const })),
    currentPlayerIndex: 0,
    turnCount: 3,
    phase: 'discardSelect',
    selectedTileInstanceId: discardTarget.instanceId,
  };
}

describe('applyMatchAction: ロン', () => {
  it('8枚+捨て牌でロンでき、席順で最初の成立者が勝つ', () => {
    const context = animalContext();
    let state = riggedRonState(context, 'zebra');
    const discarded = applyMatchAction(state, { type: 'DISCARD_TILE', playerId: 'p1' }, context);
    expect(discarded.ok).toBe(true);
    state = discarded.state;
    expect(discarded.ok && discarded.events.some((e) => e.type === 'ronAvailable' && e.playerId === 'p2')).toBe(true);

    const ron = applyMatchAction(state, { type: 'DECLARE_RON', playerId: 'p2' }, context);
    expect(ron.ok).toBe(true);
    if (!ron.ok) return;
    expect(ron.state.phase).toBe('roundEnd');
    expect(ron.state.result?.reason).toBe('ron');
    expect(ron.state.result?.winnerPlayerId).toBe('p2');
    expect(ron.state.result?.loserPlayerId).toBe('p1');
    expect(ron.state.result?.breakdown?.selectedWinRoleId).toBe('win_mammal_three_groups');
  });

  it('捨てられたwildcardではロンできない', () => {
    const context = animalContext();
    let state = riggedRonState(context, 'star');
    const discarded = applyMatchAction(state, { type: 'DISCARD_TILE', playerId: 'p1' }, context);
    expect(discarded.ok).toBe(true);
    state = discarded.state;
    expect(discarded.ok && discarded.events.some((e) => e.type === 'ronAvailable')).toBe(false);

    const ron = applyMatchAction(state, { type: 'DECLARE_RON', playerId: 'p2' }, context);
    expect(ron.ok).toBe(false);
    if (ron.ok) return;
    expect(ron.error.code).toBe('E7004');
  });

  it('順番でないプレイヤーのロン宣言はE7001', () => {
    const context = animalContext();
    let state = riggedRonState(context, 'zebra');
    state = applyMatchAction(state, { type: 'DISCARD_TILE', playerId: 'p1' }, context).state;
    const ron = applyMatchAction(state, { type: 'DECLARE_RON', playerId: 'p3' }, context);
    expect(ron.ok).toBe(false);
    if (ron.ok) return;
    expect(ron.error.code).toBe('E7001');
  });
});

describe('applyMatchAction: 流局', () => {
  it('山が空ならDRAW_PILE_EMPTYで流局result', () => {
    const context = animalContext();
    let state = riggedRonState(context, 'zebra');
    state = { ...state, drawPile: [] };
    state = applyMatchAction(state, { type: 'DISCARD_TILE', playerId: 'p1' }, context).state;
    state = applyMatchAction(state, { type: 'PASS_RON', playerId: 'p2' }, context).state;
    state = applyMatchAction(state, { type: 'PASS_RON', playerId: 'p3' }, context).state;
    expect(state.phase).toBe('turnEnd');

    const next = applyMatchAction(state, { type: 'NEXT_TURN' }, context);
    expect(next.ok).toBe(false);

    const drawEnd = applyMatchAction(state, { type: 'DRAW_PILE_EMPTY' }, context);
    expect(drawEnd.ok).toBe(true);
    if (!drawEnd.ok) return;
    expect(drawEnd.state.phase).toBe('roundEnd');
    expect(drawEnd.state.result?.reason).toBe('draw');

    const shown = applyMatchAction(drawEnd.state, { type: 'SHOW_RESULT' }, context);
    expect(shown.ok).toBe(true);
    if (!shown.ok) return;
    expect(shown.state.phase).toBe('result');

    const renew = applyMatchAction(shown.state, { type: 'NEW_MATCH' }, context);
    expect(renew.ok).toBe(true);
    if (!renew.ok) return;
    expect(renew.state.phase).toBe('setup');
    expect(renew.state.seed).toBe(state.seed + 1);
  });
});
