import type { DeckProjectId, PlayerId, TileInstanceId, VariantId } from './ids';
import type { ResultBreakdown } from './score';
import type { TileInstance } from './tile';

export type MatchPhase =
  | 'setup'
  | 'deal'
  | 'turnStart'
  | 'draw'
  | 'afterDrawAction'
  | 'discardSelect'
  | 'reactionRon'
  | 'turnEnd'
  | 'roundEnd'
  | 'result';

export type PlayerKind = 'human' | 'cpu';

export type PlayerState = {
  id: PlayerId;
  name: string;
  kind: PlayerKind;
  seatIndex: number;
  hand: TileInstance[];
  discards: TileInstance[];
};

export type ReactionState = {
  type: 'ron';
  discardOwnerId: PlayerId;
  discardedTile: TileInstance;
  // 捨てた人の次の席から順に判定する残りプレイヤー
  pendingPlayerIds: PlayerId[];
};

export type MatchResultReason = 'tsumo' | 'ron' | 'draw';

export type MatchResult = {
  reason: MatchResultReason;
  winnerPlayerId?: PlayerId;
  loserPlayerId?: PlayerId;
  breakdown?: ResultBreakdown;
};

export type MatchState = {
  deckProjectId: DeckProjectId;
  variantId: VariantId;
  seed: number;
  players: PlayerState[];
  drawPile: TileInstance[];
  currentPlayerIndex: number;
  turnCount: number;
  phase: MatchPhase;
  lastDrawnTileInstanceId?: TileInstanceId;
  selectedTileInstanceId?: TileInstanceId;
  lastDiscard?: {
    tileInstance: TileInstance;
    ownerPlayerId: PlayerId;
  };
  reaction?: ReactionState;
  result?: MatchResult;
};

export type MatchAction =
  | { type: 'START_MATCH' }
  | { type: 'DEAL_COMPLETE' }
  | { type: 'START_TURN' }
  | { type: 'DRAW_TILE' }
  | { type: 'DECLARE_TSUMO'; playerId: PlayerId }
  | { type: 'SELECT_TILE'; playerId: PlayerId; tileInstanceId: TileInstanceId }
  | { type: 'CHANGE_SELECTED_TILE'; playerId: PlayerId; tileInstanceId: TileInstanceId }
  | { type: 'DISCARD_TILE'; playerId: PlayerId }
  | { type: 'DECLARE_RON'; playerId: PlayerId }
  | { type: 'PASS_RON'; playerId: PlayerId }
  | { type: 'NEXT_TURN' }
  | { type: 'DRAW_PILE_EMPTY' }
  | { type: 'SHOW_RESULT' }
  | { type: 'NEW_MATCH' };

export type MatchEvent =
  | { type: 'matchStarted' }
  | { type: 'handsDealt' }
  | { type: 'turnStarted'; playerId: PlayerId }
  | { type: 'tileDrawn'; playerId: PlayerId; tileInstanceId: TileInstanceId }
  | { type: 'tileSelected'; playerId: PlayerId; tileInstanceId: TileInstanceId }
  | { type: 'tileDiscarded'; playerId: PlayerId; tileInstanceId: TileInstanceId }
  | { type: 'ronAvailable'; playerId: PlayerId }
  | { type: 'tsumoAvailable'; playerId: PlayerId }
  | { type: 'roundEnded'; reason: MatchResultReason }
  | { type: 'resultShown' };

export type EngineError = {
  code: string;
  message: string;
  action?: string;
};

export type MatchActionResult =
  | { ok: true; state: MatchState; events: MatchEvent[] }
  | { ok: false; state: MatchState; error: EngineError };
