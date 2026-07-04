# Discard Insight and Beginner UX

## Purpose

Soro-pon must stay understandable when many roles, waits, bonuses, and wildcards exist at the same time.

This document extends `docs/51-role-analysis-and-game-feel-ux.md` with UX rules for:

- discard choice clarity
- board insight
- information compression
- beginner mode
- advanced mode
- overlapping role candidates
- deck creator warnings

## 1. Human Problem

Players do not only ask:

```text
Can I win?
```

They also ask:

```text
What changed after I drew this tile?
What am I close to?
What happens if I discard this tile?
Why is this wildcard being used this way?
Why did a candidate disappear?
```

The UI must answer these as facts, not as commands.

## 2. Reference Principle

Mahjong-like games often revolve around draw/discard decisions and distance-to-completion analysis.

Soro-pon should use the same general idea, but simplify the wording.

Fixed:

```text
Do not tell the player what to do.
Show what each meaningful action changes.
```

## 3. Insight Engine

Add an explicit `InsightEngine` responsibility.

```text
RoleMatcher
WildcardResolver
HandAnalyzer
WaitAnalyzer
IntentRanker
ExplainEngine
HandSorter
InsightEngine
ScoreCalculator
```

`InsightEngine` converts engine facts into short board insights.

It must not become an AI coach that plays for the user.

It should only summarize facts already produced by analyzers.

## 4. Insight Types

Use structured insight types.

```ts
type BoardInsightKind =
  | 'canWin'
  | 'oneAway'
  | 'discardKeepsCandidate'
  | 'discardBreaksCandidate'
  | 'discardImprovesCandidate'
  | 'wildcardUsedAs'
  | 'bonusOnly'
  | 'blockedReason'
  | 'newCandidateAfterDraw'
  | 'candidateLostAfterDiscard';
```

## 5. Insight Wording

Good examples:

```text
Can win: Animal Trio
One tile away: Bird category
This discard keeps 2 close candidates
This discard breaks Animal Trio
This wildcard is used as Bird in this candidate
Bonus only: Rare Pair cannot win by itself
Blocked: this role needs 2 wildcards, limit is 1
```

Bad examples:

```text
You should discard Dog
Best move: discard Dog
You are aiming for Animal Trio
This is the correct play
```

## 6. Discard Preview

When the user focuses, taps, or long-presses a discard candidate, UI may preview the effect.

Preview should show:

- candidates kept
- candidates broken
- candidates improved
- waits changed
- wildcard assignment changed
- bonus-only state changed

Preview must not mutate game state.

## 7. Discard Impact Levels

Each discard candidate should receive an impact level.

```ts
type DiscardImpactLevel = 'safe' | 'neutral' | 'costly' | 'dangerous';
```

Meaning:

```text
safe: keeps top candidates or removes mostly unrelated tile
neutral: changes little
costly: breaks one useful candidate
dangerous: breaks a completed/tenpai/high-priority candidate
```

This is not opponent-risk reading.

It is only self-hand candidate impact.

## 8. Information Compression

Normal match UI must not show all candidates.

Default display:

```text
max primary candidates: 3
max insights: 2
max discard impact labels shown at once: 3
```

Priority:

1. can win
2. ron/tsumo available
3. one away
4. discard danger for selected/focused tile
5. wildcard assignment
6. blocked reason
7. high score near candidate

Everything else goes behind details.

## 9. Candidate Overflow

When many candidates exist, compress them.

Examples:

```text
3 close candidates
2 bonus-only candidates
5 hidden similar roles
```

Do not show a long vertical list during normal play.

Use details modal only when requested.

## 10. Overlapping Roles

The same tile can be useful for multiple candidates.

Engine should keep candidates separate.

UI should show one candidate lens at a time.

Fixed:

```text
Do not merge overlapping candidates into one fake role.
Do not permanently assign a shared tile to one role before final win.
Candidate preview may show one interpretation at a time.
```

## 11. Wildcard With Multiple Meanings

A wildcard can have different meaning per candidate.

UI should say:

```text
In this candidate: Star as Bird
In another candidate: Star as Red
```

Never say the wildcard has permanently become Bird until result scoring is finalized.

## 12. Beginner Mode

Beginner mode is a display mode, not a different rule set.

It should show only:

- current turn
- draw/discard/win/pass action
- top candidate
- one wait
- one important insight
- simple blocked reason

Beginner mode hides:

- full candidate list
- detailed score math
- low-priority bonuses
- advanced role overlaps
- long logs

## 13. Advanced Mode

Advanced mode may show:

- top 3 candidates
- full candidate details
- discard impact table
- wildcard assignment alternatives
- score breakdown
- all waits
- hidden candidate count

Advanced mode still must not tell the player what to do.

## 14. Deck Creator Warnings

Deck validation should detect UX problems, not only rule errors.

Warnings:

```text
too many roles share the same condition
too many roles become tenpai at once
role names are too similar
role names are too long for match UI
wildcards make too many roles complete
bonus-only roles look like win roles
high score role is too easy compared with low score role
```

Suggested copy:

```text
This role overlaps heavily with another role. Consider merging or lowering one score.
This deck may show too many close candidates at once.
This bonus may look like a winning role. Add a clearer explanation.
```

## 15. Discard Insight Tests

Minimum tests:

```text
Discard preview does not mutate hand
Discard impact marks candidate kept
Discard impact marks candidate broken
Discard impact marks candidate improved
Top candidate lost after discard creates candidateLostAfterDiscard insight
Draw that creates new tenpai creates newCandidateAfterDraw insight
Wildcard assignment change creates wildcardUsedAs insight
Beginner mode returns at most one primary insight
Normal mode returns at most two insights
Advanced mode can return more details
```

## 16. Final Decision

Soro-pon should feel smart because it explains the board clearly.

It should not feel like the game is playing instead of the player.

The best UX is:

```text
quiet normal state
clear candidate facts
short discard impact preview
explicit blocked reasons
special feeling only for ron/tsumo/result
```
