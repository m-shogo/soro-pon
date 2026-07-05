# Soro-pon Glossary

## Purpose

This glossary fixes the meaning of core terms so humans, Codex, Claude Code, and tests use the same language.

If a term here conflicts with another document, follow `docs/MASTER-SPEC.md` and then this glossary.

## Core Game Terms

| Term | Definition |
|---|---|
| Soro-pon | A local-first custom tile game set inside the Vamp-pon world. |
| DeckProject | The full deck JSON object: categories, tiles, variants, activeVariantId, and metadata. |
| DeckVariant | A playable ruleset inside a deck, such as normalThreeGroups or extendedRoleSpan. |
| RuleConfig | Variant-level rule configuration: hand size, win size, player counts, evaluation mode, and allowed actions. |
| normalThreeGroups | Current MVP evaluation mode: 8 tiles before draw, 9 after draw, win by 3 groups of 3 tiles. |
| extendedRoleSpan | Reserved future mode for 13/14 tile hands and 2-14 tile roles. Engine support is pending. |
| TileDefinition | Deck-level tile definition. It has tileId, name, categories, count, and optional wildcard behavior. |
| TileInstance | A physical tile created from a TileDefinition during a match. Match actions use tileInstanceId. |
| TileId | Stable deck-level identifier for a tile definition. Rules use this. |
| TileInstanceId | Runtime identifier for one physical tile in hand, draw pile, discard, or result. Actions use this. |
| Category | Player-facing group label used for roles and tile readability. Primary rule grouping for beginners. |
| Tag | Secondary metadata for advanced rules. Tags should not dominate beginner role templates. |
| Wildcard | A tile that can fill a missing group condition when allowed. Assignment is candidate-specific. |

## Role Terms

| Term | Definition |
|---|---|
| Role | A broad design word. In implementation, use winRole, specialBonus, or scoreBonus explicitly. |
| WinRole | A group-backed rule that can produce a legal win. Only winRole can enable ron/tsumo. |
| SpecialBonus | A bonus role that can add points after a selectedWinRole exists. It cannot win alone. |
| ScoreBonus | A non-role scoring adjustment that can add points after a selectedWinRole exists. It cannot win alone. |
| Group | A 3-tile unit used by normalThreeGroups wins. |
| CandidateGroup | A possible group inside one candidate, with tile instances, group type, and wildcard assignments. |
| GroupRequirement | A rule requirement for one or more groups, such as sameCategory mammal x3. |
| RoleCondition | Data-only condition grammar used for whole-hand conditions and bonuses. No custom JavaScript. |
| Group-backed | A role can be explained through concrete groups, not only count checks. |
| Count-only role | A role defined only by counts such as mammal >= 6. Not allowed as normal MVP winRole. |
| selectedWinRole | The one matching winRole chosen to provide basePoints in a result. Other winRoles do not stack. |

## Analysis Terms

| Term | Definition |
|---|---|
| HandCandidate | A possible interpretation of a hand: state, role, groups, waits, wildcard assignments, points, and explanations. |
| Candidate | Short name for HandCandidate. |
| completed | Candidate state meaning a winRole is complete and can potentially win. |
| tenpai | Candidate state meaning one future tile/change away from completion in the current wait context. |
| near | Candidate state meaning close, but more than one condition away. |
| bonusOnly | Candidate state where only bonus conditions are satisfied or close. It cannot win. |
| invalidButExplainable | Candidate state blocked by a clear rule, such as too many wildcards. |
| Partition | A 9-tile division into 3 non-overlapping groups for normalThreeGroups. |
| Wait | A missing tile/category/tag/group condition that can complete a candidate. |
| WaitContext | The context for wait calculation: afterDrawNineTiles, afterDiscardEightTiles, or ronCheckNineTiles. |
| Insight | A short factual UI message derived from engine facts. It must not command the player. |
| DiscardPreview | Pure analysis of what changes if a selected tile is discarded. It must not mutate match state. |
| RankScore | Deterministic internal ordering score for candidates. It does not represent player intent. |
| HiddenCandidateCount | Number of candidates not shown in compressed UI output. |

## Scoring Terms

| Term | Definition |
|---|---|
| basePoints | Points from selectedWinRole. Replaces old points on win_role. |
| points | Points for specialBonus or scoreBonus. |
| scoreBudget | Variant-level budget profile for validation and warnings. It is not a hidden score clamp. |
| softResultCap | Budget threshold where validation should warn. |
| hardResultCap | Strong budget warning threshold. Do not silently clamp unless a future visible policy says so. |
| ResultBreakdown | Trustable scoring output: selectedWinRole, groups, wildcard assignments, bonuses, total, coins, collection updates. |
| Coins | Progression/cosmetic reward. Coins must not affect match strength. |

## Import and Security Terms

| Term | Definition |
|---|---|
| Shared JSON | Portable deck rules and safe display metadata. It must not contain images, URLs, local state, or unknown fields. |
| Strict import | Allowlist-based import that rejects unknown and unsafe fields. |
| Unsafe key scan | Recursive pre-parse scan for image/url/script/html/path/style-like keys. |
| LocalImageMap | Future local-only mapping from deckId/tileId to sanitized local image key. Not exported. |
| Official deck | App-owned trusted sample deck. Imported decks are never official. |
| Imported deck | User-provided deck accepted through strict import. It may be draft/playable/playableWithWarnings. |
| Draft deck | Editable deck that may be invalid and cannot start a match. |
| Playable deck | Deck that passes errors and can start a match. |
| Playable with warnings | Deck that can start but has balance/clarity warnings. |

## UI Terms

| Term | Definition |
|---|---|
| Component Gallery | Hidden/debug view showing primitives and components before full screen implementation. |
| Density mode | Layout mode such as compact, normal, wide, or desktop. |
| Landscape-first | Main screens are designed around landscape 844x390 reference, not portrait-first. |
| Rotate prompt | Portrait fallback asking the user to rotate the device. |
| Fact-not-advice UI | UI explains current facts without telling the user the best move. |

## Final Decision

Use these terms consistently in code, tests, docs, UI copy, and reports.
