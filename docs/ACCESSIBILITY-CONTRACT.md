# Accessibility Contract

## Match screen

- The match is a labelled region with one live, atomic turn-status node.
- Seats are labelled groups. Labels identify self/opponent, player name,
  current-turn state, hand count, and played count.
- DOM order follows the understandable reading sequence: utility/status,
  opponents, self, hand, actions, messages. CSS grid placement does not alter
  that sequence.
- Every face-up tile has its deck-provided accessible name. Selected tiles use
  `aria-pressed`; disabled actions use native `disabled`.
- The newest played tile adds “最新” to its accessible name.
- Available actions are native buttons in a stable action region.
- Dialogs retain the shared name, description, trap, safe initial focus,
  dismiss, and focus-return contract.

## Acceptance boundary

Automated role/state inspection is supplemental. A `VOICEOVER_PASS` requires
VoiceOver actually enabled in stable Safari and human-observable spoken
operation. Playwright WebKit, AX inspection, or another screen reader cannot
inherit that result.

