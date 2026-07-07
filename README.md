# soro-pon

`soro-pon` は、プレイヤーが **デッキ・牌・役・得点** を自由に作れる、3〜4人用のカスタム牌ゲームです。

Vamp-pon世界の中で遊ばれている「記憶札遊び」として扱います。

## Current Status

```text
MVP Phase 1 implementation-ready.
Design/spec docs are intentionally heavy because custom decks, import safety, and rule clarity are core product risks.
```

ただし、実装はすぐFull UIへ入りません。

最初は以下を固めます。

```text
domain
schema
validation
engine
tests
```

Full Match UI は、engine/schema/tests が通ってから進めます。

## Product Core

このアプリは「麻雀そのもの」ではありません。

ルールは **ドンジャラ構造** です。

```text
3〜4人用
2人戦なし
ポン/チー/カンなし
通常手牌8枚
自分の番で1枚引いて9枚
あがり形は3枚グループ×3組
ロン = 8枚手牌 + 捨て牌 = 9枚
ツモ = 引いた後の9枚
```

UIの雰囲気・卓の触り心地は麻雀卓に寄せます。

ただし、ルールを麻雀化しません。

## First Read For AI Agents

作業前に必ず以下を読むこと。

```text
README.md
AGENTS.md
CODEX.md or CLAUDE.md
docs/README.md
docs/MASTER-SPEC.md
docs/IMPLEMENTATION.md
docs/GLOSSARY.md
docs/IMPLEMENTATION-GOVERNANCE.md
```

現在仕様の正本は以下です。

```text
docs/MASTER-SPEC.md
```

実装順序の正本は以下です。

```text
docs/IMPLEMENTATION.md
```

番号付きdocsに古い仕様が残っている場合は、`docs/MASTER-SPEC.md` を優先します。

## Required Governance Docs

実装を始める前に、関係する領域のdocsを読むこと。

### Architecture / API / Rule Contracts

```text
docs/ARCHITECTURE-BOUNDARIES.md
docs/ENGINE-API.md
docs/MATCH-STATE-MACHINE.md
docs/ERROR-CODES.md
docs/TESTING-STRATEGY.md
docs/PERFORMANCE-GUARDRAILS.md
docs/TECHNICAL-RISK-REGISTER.md
docs/MIGRATIONS.md
docs/ADR.md
```

### Implementation Governance

```text
docs/IMPLEMENTATION-STRUCTURE.md
docs/FIXTURE-STRATEGY.md
docs/CODING-RULES.md
docs/DEPENDENCY-POLICY.md
docs/CI-GATES.md
docs/ACCEPTANCE-CRITERIA.md
docs/THREAT-MODEL.md
docs/MANUAL-QA.md
docs/RELEASE-DEMO-GATES.md
```

## UI / Design Read

UI実装に入る前は、必ず以下を読むこと。

```text
docs/48-responsive-crisp-ui-system.md
docs/49-ui-quality-gate-and-codex-design-rules.md
docs/50-pro-ui-production-quality-checklist.md
docs/design-targets/generated/soro-pon-landscape-vampon-ui-v1/README.md
```

デザイン基準画像:

```text
/Users/m-shogo/Developer/personal/soro-pon/docs/design-targets/generated/soro-pon-landscape-vampon-ui-v1
```

## Visual Direction

```text
Vamp-pon世界の夜の机
紙札
黒インク
小さな灯り
記憶の欠片
手帳
静かな通常画面
勝負どころだけ少し漫画的
麻雀卓のような触り心地
```

Genericな白いWebアプリにしないこと。

## Layout Policy

```text
844x390 reference
phone landscape = 100svw x 100svh
PC = centered game table + outer support / night desk background
portrait = rotate prompt or limited utility
```

844x390は実寸固定キャンバスではなく、デザイン基準です。

画面全体を `transform: scale()` で引き伸ばしません。

## Stack Policy

MVP初期の固定stack:

```text
TypeScript
React
Vite
Zod
Vitest
CSS / CSS Modules
localStorage first
```

MVP初期では入れない:

```text
Next.js
Supabase
Firebase
Unity
Godot
Phaser
Redux
Zustand
TanStack Query
Tailwind
```

新しい依存を追加する場合は、先に以下を確認すること。

```text
docs/DEPENDENCY-POLICY.md
docs/ADR.md
```

## Three.js Policy

「気持ち良さ」は Three.js 的な奥行き・光・牌の滑り・卓上感を目指してよい。

ただし、Three.jsはMVP初期の必須依存ではありません。

導入する場合は:

```text
docs/DEPENDENCY-POLICY.md を確認する
ADRに導入理由を書く
UI演出層に隔離する
engine/schema/domainには入れない
Three.jsなしでもゲームが動くfallbackを持つ
```

最初からThree.jsありきでルールやUI全体を作らないこと。

## Implementation Order

必ずこの順番で進めること。

```text
1. package setup
2. domain ID/tile/category/variant types
3. strict Zod schemas
4. samples/animal-starter.deck.json parse test
5. import unsafe key scan tests
6. deck validation tests
7. group enumeration
8. 9-tile partitioning
9. wildcard group resolution
10. normal win role matching
11. tsumo 9-tile check
12. ron 8+discard check
13. wait context
14. selectedWinRole and scoreBudget validation
15. score breakdown
16. discard preview purity
17. match state reducer
18. CPU minimum policy
19. localStorage recovery
20. UI foundation / Component Gallery
21. full screens
```

## Hard Blocks Before Full Match UI

Full Match UIを始める前に、少なくとも以下を通すこと。

```text
animal starter strict parse
unsafe import fields rejected
normalThreeGroups schema tests
3-group partition tests
sameCategory/specificSet group tests
wildcard max tests
tsumo 9-tile tests
ron 8+discard tests
special_bonus cannot win tests
ScoreBonus cannot win tests
scoreBudget validation tests
score breakdown tests
discard preview does not mutate state
match reducer invalid action preserves state
custom deck adversarial fixtures
```

## Coding Rules Summary

```text
UIは役判定しない
UIは点数計算しない
UIはwildcard割当しない
engineはReact/DOM/localStorage/CSSを知らない
importはstrict allowlist
unknown fieldsは拒否
shared JSONに画像/URL/base64/path/blobUrl/html/script/styleを入れない
localStorageはschema parseしてから使う
Math.randomをengineで直接使わない
Date.nowをengineで直接使わない
src/utilsに何でも入れない
```

詳細は以下。

```text
docs/CODING-RULES.md
docs/ARCHITECTURE-BOUNDARIES.md
docs/ENGINE-API.md
```

## Current Sample

```text
samples/animal-starter.deck.json
```

このsampleは current group-backed schema の基準です。

## Vamp-pon Reference Policy

`soro-pon` 側へ Vamp-pon本体の世界観・キャラ・敵・ステージ・武器・アイテム資料を丸コピーしません。

参照元:

```text
/Users/m-shogo/Developer/personal/vamp-pon/docs/shared-vampon-master-index.md
/Users/m-shogo/Developer/personal/soro-pon/docs/42-shared-vampon-source-policy.md
/Users/m-shogo/Developer/personal/soro-pon/docs/45-vampon-reference-gate.md
```

`vamp-pon` 側は読み取り専用です。

## IP / Asset Safety

開発中のローカル検証で既存IP題材を使う場合も、以下には入れません。

```text
src/
public/
docs/
README.md
build成果物
公式サンプル
公式スクリーンショット
production export payload
```

公式サンプルは、動物・国・歴史人物・旅行・オリジナルテーマなどの安全テーマで作ります。

## Commit / Report Policy

こまめにコミットすること。

```text
1コミット1目的
大きすぎる差分にしない
docsと実装がズレる場合はdocsも同時に更新
テストが通る単位で区切る
```

作業後は以下を報告すること。

```text
変更ファイル
commit SHA
実装した範囲
実行した検証
未対応範囲
次にやること
```

## Final Decision

最優先は、バグなく、破綻なく、長期運用できる実装にすること。

迷ったら、まず以下を読む。

```text
docs/MASTER-SPEC.md
docs/IMPLEMENTATION.md
docs/IMPLEMENTATION-GOVERNANCE.md
docs/TECHNICAL-RISK-REGISTER.md
```
