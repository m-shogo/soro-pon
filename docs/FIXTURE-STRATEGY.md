# Fixture Strategy

## Purpose

Soro-pon depends on custom decks, so fixtures are part of the product safety system.

This document defines where fixtures live, how they are named, and what each fixture must prove.

## Directory Layout

```text
fixtures/
  decks/
    valid/
    invalid/
    adversarial/
    migration/
  hands/
    normal-three-groups/
    ron-tsumo/
    wildcard/
  matches/
    reducer/
    replay/
  imports/
    safe/
    unsafe/
  expected/
    validation/
    analysis/
    scoring/
```

Do not scatter fixtures across random test folders.

## Naming Convention

Use stable descriptive names:

```text
valid-minimal.deck.json
animal-starter.deck.json
invalid-no-win-role.deck.json
adversarial-wildcard-heavy.deck.json
import-unsafe-nested-image-url.json
hand-tsumo-three-mammal-groups.json
match-basic-round-seed-001.json
expected-animal-starter-validation.json
```

Avoid vague names:

```text
test1.json
bad.json
sample-new.json
final.json
```

## Fixture Metadata

Each deck fixture should include or be paired with test metadata:

```ts
type FixtureExpectation = {
  fixture: string;
  expectedStatus: 'blocked' | 'draft' | 'playableWithWarnings' | 'playable';
  expectedCodes: string[];
  notes?: string;
};
```

Do not rely on comments inside JSON.

## Required Deck Fixtures

### Valid

```text
valid-minimal.deck.json
animal-starter.deck.json
valid-many-roles.deck.json
valid-wildcard-one.deck.json
valid-score-budget-edge.deck.json
```

### Invalid

```text
invalid-no-version.deck.json
invalid-unknown-field.deck.json
invalid-no-win-role.deck.json
invalid-bonus-only.deck.json
invalid-count-only-normal-role.deck.json
invalid-specific-set-wrong-size.deck.json
invalid-unknown-category-ref.deck.json
invalid-unknown-tile-ref.deck.json
invalid-missing-score-budget.deck.json
```

### Adversarial

```text
adversarial-wildcard-heavy.deck.json
adversarial-candidate-explosion.deck.json
adversarial-score-explosion.deck.json
adversarial-duplicate-roles.deck.json
adversarial-too-easy.deck.json
adversarial-impossible-role.deck.json
adversarial-deep-json.deck.json
adversarial-large-json.deck.json
adversarial-unicode-confusable-ids.deck.json
```

### Migration

```text
migration-v0-safe-add-score-budget.deck.json
migration-v0-count-only-reject.deck.json
migration-newer-version-reject.deck.json
migration-missing-version-reject.deck.json
```

## Required Import Fixtures

```text
import-unsafe-image-url.json
import-unsafe-image-base64.json
import-unsafe-file-path.json
import-unsafe-blob-url.json
import-unsafe-url.json
import-unsafe-src.json
import-unsafe-html.json
import-unsafe-style.json
import-unsafe-script.json
import-unsafe-nested-code.json
import-unsafe-prototype-pollution.json
```

## Required Hand Fixtures

```text
hand-tsumo-same-category.json
hand-tsumo-specific-set.json
hand-ron-8-plus-discard.json
hand-wildcard-completes-group.json
hand-wildcard-too-many-blocked.json
hand-bonus-only-no-win.json
hand-order-invariance-a.json
hand-order-invariance-b.json
```

## Required Match Fixtures

```text
match-basic-seed-001.json
match-invalid-discard-phase.json
match-ron-window-seat-order.json
match-empty-draw-pile.json
match-replay-seed-001-actions.json
```

## Expected Outputs

Golden expected outputs should exist for:

```text
validation issues
analysis primaryCandidates
score breakdown
match replay final state
```

Use expected files when output is stable enough.
Use inline assertions when output is intentionally compact.

## Fixture Versioning

When schema changes:

```text
add migration fixture
keep at least one old fixture
update expected output in same commit
record reason in docs/ADR.md if architecture-level
```

## Existing Official Sample

Current official sample:

```text
samples/animal-starter.deck.json
```

Tests may copy or reference it, but should not mutate it.

## Final Decision

Fixtures are not throwaway files.

They are proof that custom decks cannot casually break the game.
