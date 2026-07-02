# Doc Consistency Audit

## Purpose

README / AGENTS / CLAUDE / CODEX / docs の正本関係を固定し、古い情報・重複・矛盾で実装が破綻しないようにする。

## Current Status

```text
MVP Phase 1 実装開始可能
```

最初はUIではなく、domain / schema / engine / tests から進める。

## Canonical Sources

### Project overview

```text
README.md
```

### AI rules

```text
AGENTS.md
CLAUDE.md
CODEX.md
```

### Implementation prompt

```text
docs/34-mvp-implementation-prompt.md
```

### Test cases

```text
docs/35-mvp-test-cases.md
```

### Final gate

```text
docs/47-mvp-implementation-final-gate.md
```

古いdocsと迷った場合は `docs/47-mvp-implementation-final-gate.md` を優先する。

### Data model

```text
docs/03-data-model.md
```

### Zod schema

```text
docs/32-zod-schema-spec.md
```

### Official sample

```text
samples/animal-starter.deck.json
docs/33-official-animal-starter-deck.md
```

### Adopted UI target

```text
docs/design-targets/generated/soro-pon-landscape-vampon-ui-v1/
```

## Deprecated / Resolved Docs

以下は履歴用。実装の正本として使わない。

```text
docs/08-fable-implementation-prompt.md
docs/21-remaining-spec-gaps-and-next-decisions.md
```

- `docs/08` は `docs/34` へ誘導する
- `docs/21` は解決済みメモとして残す

## Fixed Stack

```text
TypeScript + React + Vite + Zod + Vitest
```

MVP初期で使わない。

```text
Next.js
Unity
Godot
Phaser
Supabase
Firebase
Redux
Zustand
TanStack Query
Tailwind
```

## Final Data-model Fixes

実装前に以下を固定済み。

```text
RuleConfig.supportedPlayerCounts で 3/4 人対応を表す
minPlayers / maxPlayers はMVPでは使わない
Role.kind は win_role / special_bonus のみ
score_bonus は Role.kind に入れず ScoreBonus[] で扱う
```

## Final Orientation Fixes

```text
All main screens: 844x390 landscape-first
Portrait: rotate prompt or limited utility only
```

`TOP/Editor/Resultは縦画面にも対応` のような古い方針は使わない。

## Safety Fixes Applied

public repoに残すべきでない一時IP fixtureを削除済み。

現在のtreeでは、以下を残さない。

```text
dev-fixtures/ip-local/*.json
*.ip-local.json
*.local-deck.json
*.local-fixture.json
```

## Consistency Rules

新しい仕様を追加するときは、以下の順で更新する。

```text
1. 詳細docs
2. docs/47-mvp-implementation-final-gate.md に関わるなら更新
3. docs/03-data-model.md または docs/32-zod-schema-spec.md が関係するなら更新
4. docs/34-mvp-implementation-prompt.md が関係するなら更新
5. docs/35-mvp-test-cases.md が関係するなら更新
6. README.md
7. AGENTS.md
8. CLAUDE.md / CODEX.md が関係するなら更新
```

## Do Not Duplicate Full Specs

`.claude/README.md` と `.codex/README.md` には、正本への誘導だけを書く。

理由:

```text
同じ仕様を複数箇所に長文で持つとズレるため
```

## Pre-Implementation Check

実装開始前に確認する。

```text
READMEがMVP Phase 1実装開始可能になっている
AGENTSのMust Readにdocs/47が入っている
CLAUDE.mdがdocs/47へ誘導している
CODEX.mdがdocs/47へ誘導している
docs/08がdeprecated redirectになっている
docs/21がresolved memoになっている
local IP fixtureが残っていない
samples/animal-starter.deck.json が公式サンプルになっている
animal-starter の ruleConfig に supportedPlayerCounts がある
```

## Final Decision

今後の実装では、古いプロンプトや解決済みメモを直接使わない。

実装AIには必ず以下を読ませる。

```text
README.md
AGENTS.md
CLAUDE.md or CODEX.md
docs/34-mvp-implementation-prompt.md
docs/35-mvp-test-cases.md
docs/47-mvp-implementation-final-gate.md
```
