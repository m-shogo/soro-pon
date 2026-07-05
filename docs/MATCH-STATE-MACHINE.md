# Match State Machine

## Purpose

This document defines the legal match states and transitions.

It prevents UI and reducer bugs such as discarding at the wrong time, ron after state changed, or preview mutating state.

## State Names

```ts
type MatchPhase =
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
```

## State Ownership

Only `applyMatchAction` may change gameplay state.

UI selection state may exist separately, but gameplay actions must be validated by the reducer.

## Transition Table

| Current | Action | Next | Notes |
|---|---|---|---|
| setup | START_MATCH | deal | validate deck, players, active variant |
| deal | DEAL_COMPLETE | turnStart | hands are 8 tiles each |
| turnStart | START_TURN | draw | current player confirmed |
| draw | DRAW_TILE | afterDrawAction | current player hand becomes 9 |
| afterDrawAction | DECLARE_TSUMO | roundEnd | only if selectedWinRole completed |
| afterDrawAction | SELECT_TILE | discardSelect | tile must be in current player's 9-tile hand |
| discardSelect | CHANGE_SELECTED_TILE | discardSelect | selected tile changes only |
| discardSelect | DISCARD_TILE | reactionRon | selected tile leaves hand |
| reactionRon | DECLARE_RON | roundEnd | 8 hand tiles + discarded tile = 9 |
| reactionRon | PASS_RON | turnEnd | next reaction or all pass |
| turnEnd | NEXT_TURN | turnStart | rotate seat |
| turnEnd | DRAW_PILE_EMPTY | roundEnd | draw result |
| roundEnd | SHOW_RESULT | result | score breakdown visible |
| result | NEW_MATCH | setup | reset match state |

## Invalid Actions

Invalid actions must return:

```ts
{ ok: false, state: originalState, error }
```

They must not mutate state.

Examples:

```text
DISCARD_TILE during draw phase
DECLARE_RON without reactionRon phase
DECLARE_TSUMO with only special_bonus
DRAW_TILE when hand is already 9
START_MATCH with 2 players
```

## Preview Actions

Preview is not a gameplay action.

These are UI-only analysis requests:

```text
preview discard impact
preview candidate grouping
preview wildcard assignment
preview wait detail
```

Preview must never:

```text
change phase
remove tile
assign wildcard permanently
change score
advance CPU
```

## Ron Window

Ron check starts after a discard.

Ron candidate hand:

```text
reacting player's 8 hand tiles + discarded tile = 9 tiles
```

MVP reaction order:

```text
seat order from next player
first valid ron wins
```

Discarded wildcard ron is blocked by default.

## Tsumo Window

Tsumo check happens in `afterDrawAction`.

Tsumo candidate hand:

```text
current player's 9 tiles after draw
```

Only completed win_role can tsumo.

## Draw Result

If draw pile is empty and no one wins:

```text
roundEnd -> result with draw result
```

No crash, no forced winner.

## Events

Reducer should emit events for UI animation.

```ts
type MatchEvent =
  | { type: 'matchStarted' }
  | { type: 'handsDealt' }
  | { type: 'turnStarted'; playerId: PlayerId }
  | { type: 'tileDrawn'; playerId: PlayerId; tileInstanceId: TileInstanceId }
  | { type: 'tileSelected'; playerId: PlayerId; tileInstanceId: TileInstanceId }
  | { type: 'tileDiscarded'; playerId: PlayerId; tileInstanceId: TileInstanceId }
  | { type: 'ronAvailable'; playerId: PlayerId }
  | { type: 'tsumoAvailable'; playerId: PlayerId }
  | { type: 'roundEnded'; reason: 'tsumo' | 'ron' | 'draw' }
  | { type: 'resultShown' };
```

## Tests

Required reducer tests:

```text
setup -> deal -> turnStart happy path
deal gives 8 tiles per player
draw gives current player 9 tiles
tsumo rejected without completed win_role
discard rejected outside discardSelect
ron rejected outside reactionRon
ron uses 8+discard shape
discarded wildcard ron blocked
PASS_RON advances reaction order
all pass advances to turnEnd
empty draw pile ends round
invalid action preserves original state
preview calls do not touch reducer state
```

## Final Decision

The reducer is the only authority for match phase changes.

UI can select, preview, and render, but gameplay state changes only through validated actions.
