# Game Table Layout

## Structure

The match screen uses these ordered layers:

1. match shell and decorative table surface;
2. utility bar;
3. table stage;
4. player seats with their played-tile areas;
5. center status panel;
6. self status and hand zone;
7. stable action zone;
8. temporary live messages;
9. shared modal layer.

Layer numbers come only from semantic z-index tokens.

## Four-player layout

The human is at the bottom; CPU seats occupy left, top, and right. Each seat
owns its name, identity mark, turn state, concealed hand count, played count,
and ordered played tiles. The center panel contains round/turn number, current
player, draw-pile count, and a short phase message.

## Three-player layout

The human stays at the bottom. Opponents occupy upper-left and upper-right.
There is no hidden fourth seat and no reserved empty top-seat column. The
center and played-tile space expand into the released area.

## Game-specific boundaries

Soro-pon has no persistent in-match score or reach action in the current
engine. The UI must not invent either. It displays only existing state:
player identity, hand/played counts, current turn, draw pile, phase, insights,
available win/discard/pass actions, and Result.

Played tiles remain in DOM order. The newest tile receives a textual marker in
its accessible name and a visual outline. Opponent seat text is never rotated;
visual placement does not change reading order.

