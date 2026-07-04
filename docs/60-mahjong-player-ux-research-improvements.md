# Mahjong Player UX Research Improvements

## Purpose

This document improves Soro-pon UX based on mahjong player expectations and available research signals.

This is not a claim that we fully surveyed 100 named users.

Instead, it translates common mahjong-app and mahjong-research lessons into Soro-pon design rules:

- players enjoy draw/discard rhythm
- players need clear waits
- players need trustable scoring
- beginners need explanation without being controlled
- advanced players dislike over-guidance
- confusing tutorials and poor presentation hurt fun
- explainable local reasons are better than black-box advice

## Research Signals

### 1. Deficiency / shanten matters

Mahjong research treats deficiency number, also known as shanten, as an important measure for how many tile changes are needed to complete a hand.

For Soro-pon, this maps to:

```text
completed
tenpai
near
missing condition count
wait labels
```

UX improvement:

```text
Always show what is close, not just what is complete.
```

### 2. Explainable local reasoning matters

Recent Mahjong AI explanation research focuses on turning black-box decisions into human-understandable local insights.

For Soro-pon, this maps to:

```text
InsightEngine
ExplainEngine
discard impact preview
candidate delta
```

UX improvement:

```text
Show why a candidate changed after draw/discard.
```

### 3. Confusing tutorials hurt games

A Mahjong game can advertise easy learning, but reviews can still criticize confusing tutorial and presentation.

For Soro-pon, this maps to:

```text
small tutorial moments
no long manual first
simple first match
clear result explanation
```

UX improvement:

```text
Teach during the exact moment the concept matters.
```

### 4. Popular modern mahjong apps are cross-platform and persistent

Modern mahjong apps such as Mahjong Soul are browser/mobile/desktop games with persistent visual identity and accessible online play.

Soro-pon MVP is local-first, but should still learn from this:

```text
clear identity
consistent table feel
fast return to play
collection/progression after result
```

UX improvement:

```text
Make result and collection feel rewarding without changing match strength.
```

## Player Feeling Targets

Soro-pon should feel:

```text
I understand what changed.
I know why I can or cannot win.
I can still choose myself.
The game is helping, not playing for me.
The result feels earned and explainable.
```

Soro-pon should not feel:

```text
The game tells me the answer.
The UI hides the reason.
The score came from nowhere.
The wildcard randomly changed meaning.
There are too many glowing candidates.
```

## UX Improvements To Apply

## 1. Draw Moment

When drawing a tile, show one concise change.

Examples:

```text
New candidate: Animal Trio is one tile away
This tile completes Bird Set
No new close candidate
```

Do not show every changed role.

## 2. Discard Moment

When selecting a discard tile, show the most important impact.

Examples:

```text
Keeps top candidate
Breaks Animal Trio
Removes unrelated tile
Changes wildcard from Bird to Red
```

Never say:

```text
Best discard
Correct discard
```

## 3. Wait Moment

Wait labels must be concrete.

Examples:

```text
Wait: Bird category
Wait: Moon tag
Wait: any tile completing the third set
```

If the wait is broad, show condition category rather than many tile names.

## 4. Wildcard Moment

When wildcard participates, show candidate-local meaning.

Examples:

```text
In this candidate: Star as Bird
Other candidate: Star as Red
```

Never imply permanent conversion before result.

## 5. Win Moment

Ron/Tsumo should feel clearly special.

Required:

```text
clear button
related tiles highlighted
candidate reason shown
short animation
```

Avoid:

```text
constant glow before win
full-screen noise for normal candidate changes
```

## 6. Result Moment

Result must build trust.

Show:

```text
winning role
why complete
wildcard assignment
bonus additions
total score
collection update
```

Use count-up only after facts are visible.

## 7. Beginner Comfort

Beginner mode should reduce fear.

Show:

```text
one candidate
one wait
one insight
one next action
```

Hide:

```text
full scoring math
candidate table
all alternative wildcard meanings
```

## 8. Advanced Satisfaction

Advanced mode should respect player agency.

Show optional details:

```text
top 3 candidates
discard impact table
score breakdown
wildcard alternatives
hidden candidate count
```

Still do not say best move.

## 9. Friction Rules

Do not add confirmation to every discard.

Use:

```text
tap tile to select
clear selected state
discard button to confirm
undo only if match rules allow and before CPU/reaction progresses
```

Confirm only destructive editor actions.

## 10. Emotional Rhythm

Game rhythm should be:

```text
quiet thinking
small draw feedback
clear discard preview
brief tension on ron/tsumo
satisfying result reveal
calm collection reward
```

## Playtest Questions

When testing with mahjong players, ask:

```text
Did you feel the game was telling you what to do?
Did you understand why a candidate appeared?
Did you understand why a candidate disappeared?
Was the wildcard explanation clear?
Was the discard preview useful or annoying?
Were there too many hints?
Did ron/tsumo feel special?
Did the result score feel trustworthy?
Would you turn beginner hints off?
Would you play another match?
```

## Design Changes From Research

The current design should keep:

```text
no intent guessing
candidate classification
concrete wait labels
discard impact preview
facts-not-advice InsightEngine
result score breakdown
beginner/advanced display split
```

The design should improve:

```text
draw moment feedback
candidate changed explanation
shorter beginner copy
result trust sequence
advanced details hidden by default
playtest question list
```

## Final Decision

Soro-pon UX should be judged by player feeling, not only rule correctness.

The target feeling is:

```text
I am thinking, but the board is helping me see.
```

If a feature makes the game feel bossy, noisy, or opaque, remove or simplify it.
