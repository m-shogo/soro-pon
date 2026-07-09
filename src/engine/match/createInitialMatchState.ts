import type { DeckProject } from '../../domain/deck';
import type { PlayerId } from '../../domain/ids';
import type { MatchState, PlayerKind } from '../../domain/match';
import type { DeckVariant } from '../../domain/variant';

export type MatchPlayerSetup = {
  id: PlayerId;
  name: string;
  kind: PlayerKind;
};

export type CreateInitialMatchStateInput = {
  deck: DeckProject;
  variant: DeckVariant;
  players: MatchPlayerSetup[];
  seed: number;
};

// setup phaseの初期状態を作る。配牌はSTART_MATCHで行う。
// 検証(人数/牌数/variant)はapplyMatchActionのSTART_MATCHが行う。
export function createInitialMatchState(input: CreateInitialMatchStateInput): MatchState {
  return {
    deckProjectId: input.deck.id,
    variantId: input.variant.id,
    seed: input.seed,
    players: input.players.map((player, seatIndex) => ({
      id: player.id,
      name: player.name,
      kind: player.kind,
      seatIndex,
      hand: [],
      discards: [],
    })),
    drawPile: [],
    currentPlayerIndex: 0,
    turnCount: 0,
    phase: 'setup',
  };
}
