# AGENTS.md

このrepoでAIエージェントが作業するときの必須ルール。

## Project Status

```text
MVP実装準備完了。
ただし、MVP本実装前に全主要画面のデザイン生成を行う。
```

実装または画面デザイン生成を始める前に、必ず `README.md` とこのファイルを読む。

## Implementation Entry

実装開始時の正本。

```text
README.md
AGENTS.md
CLAUDE.md or CODEX.md
docs/34-mvp-implementation-prompt.md
docs/35-mvp-test-cases.md
```

画面生成時の正本。

```text
docs/10-screen-design-spec.md
docs/11-design-generation-prompt.md
docs/37-visual-design-direction.md
docs/38-screen-generation-plan.md
docs/41-vampon-in-world-game-direction.md
docs/42-shared-vampon-source-policy.md
docs/44-vampon-character-generation-gate.md
docs/45-vampon-reference-gate.md
```

## Mandatory Vamp-pon World Read

世界観・キャラ・敵・ステージ・武器・アイテム・ビジュアルルールを扱う作業では、必ず先に以下を読む。

```text
/Users/m-shogo/Developer/personal/vamp-pon/docs/shared-vampon-master-index.md
/Users/m-shogo/Developer/personal/soro-pon/docs/42-shared-vampon-source-policy.md
/Users/m-shogo/Developer/personal/soro-pon/docs/45-vampon-reference-gate.md
```

作業対象は `soro-pon`。

```text
vamp-pon 側は読み取り専用
vamp-pon 側を変更しない
Vamp-pon設定をsoro-pon側へ丸コピーしない
必要な場合は最小限の要約と参照元だけを書く
```

## Vamp-pon Reference Gate

Vamp-pon由来の情報を使う場合は、キャラだけでなく以下すべてで `docs/45-vampon-reference-gate.md` に従う。

```text
Characters
Enemies
Stages
Items
Weapons
Visual Rules
UI/UX In-world Rules
Spoiler Boundary
Derived Game Usage
```

記憶や雰囲気だけで判断しない。必ずVamp-pon側の master index から読み、必要なリンク先まで確認する。

## Vamp-pon Character Generation Gate

Vamp-ponキャラを画像生成・画面デザイン・対戦相手アバターに出す場合は、必ず `docs/44-vampon-character-generation-gate.md` に従う。

必ず読む。

```text
/Users/m-shogo/Developer/personal/vamp-pon/data/character-assets/core5-character-master-assets.json
/Users/m-shogo/Developer/personal/vamp-pon/src/game/data/characterCanon.ts
/Users/m-shogo/Developer/personal/vamp-pon/docs/core5-runtime-loadout-map.md
```

顔を出すことは許可する。ただし、`masterBoardPath` と `spriteSheetPath` を確認し、可能なら実画像を参照する。実画像参照ができない場合は汎用AI顔で代用せず、器物モチーフ・札入れ・小アイコン枠に逃がす。

## Must Read

仕様確認で読むこと。

1. `README.md`
2. `AGENTS.md`
3. `CLAUDE.md` or `CODEX.md`
4. `docs/03-data-model.md`
5. `docs/10-screen-design-spec.md`
6. `docs/11-design-generation-prompt.md`
7. `docs/17-screen-actions-and-requirements.md`
8. `docs/23-deck-editor-ux-and-category-colors.md`
9. `docs/24-scoring-and-payment.md`
10. `docs/25-role-evaluation-engine.md`
11. `docs/26-deck-validation-and-balance-rules.md`
12. `docs/27-cpu-minimum-strategy-and-match-flow.md`
13. `docs/28-release-safety-checklist.md`
14. `docs/29-result-progression-collection.md`
15. `docs/30-first-run-and-playtest-loop.md`
16. `docs/31-implementation-stack-decision.md`
17. `docs/32-zod-schema-spec.md`
18. `docs/33-official-animal-starter-deck.md`
19. `docs/34-mvp-implementation-prompt.md`
20. `docs/35-mvp-test-cases.md`
21. `docs/36-doc-consistency-audit.md`
22. `docs/37-visual-design-direction.md`
23. `docs/38-screen-generation-plan.md`
24. `docs/41-vampon-in-world-game-direction.md`
25. `docs/42-shared-vampon-source-policy.md`
26. `docs/44-vampon-character-generation-gate.md`
27. `docs/45-vampon-reference-gate.md`

## Deprecated / History Only

以下は履歴用。実装の正本として使わない。

```text
docs/08-fable-implementation-prompt.md
docs/21-remaining-spec-gaps-and-next-decisions.md
```

## Absolute Rules

- 旧repoを参考にしない
- 既存コードを移植しない
- 共有JSONに画像情報を入れない
- 画像付き共有を作らない
- 3〜4人用を前提にする
- 2人戦を作らない
- 最終ルールはドンジャラと同じ構造にする
- 通常手牌8枚、引いた後9枚、あがり形は3枚セット×3組
- 拡張ルールは型で考慮してよいが、MVP対局UIには勝手に入れない
- 2枚役はツモ/ロン可能だが、ポンは作らない
- ポン、カン、チーを作らない
- デッキ入口は1つにし、通常版/拡張版は同じDeckProject内のvariantとして扱う
- 通常版/拡張版が両方ある場合はワンクリックで切り替え可能にする
- ロン/ツモ判定は上がり役だけを対象にする
- 特殊役とスコアボーナスはロン候補にしない
- オールマイティ牌は入れるが無制限にしない
- オールマイティは基本1役につき1枚まで
- 捨てられたオールマイティでロンは原則不可
- オールマイティはスコアボーナスに原則含めない
- オールマイティは基本自動割当。毎回クリック選択式にしない
- 対戦画面はスマホ横向き前提で設計する
- 画面デザイン生成が終わるまでMVP本実装に入らない
- soro-ponはVamp-pon世界内で流行っている記憶札遊びとして扱う
- 単体の漫画風アプリとしてデザインしない
- 紙/黒インク/小さな灯り/夜の机/記憶を軸にする
- Vamp-pon側を変更しない。Vamp-pon側は読み取り専用
- 世界観・キャラ・敵・ステージ・武器・アイテム・ビジュアルルールを扱う時は必ずVamp-pon shared master indexを読む
- Vamp-pon由来の情報を使う時は `docs/45-vampon-reference-gate.md` を守る
- Vamp-ponキャラを出す時は `docs/44-vampon-character-generation-gate.md` を守る
- 実画像参照なしでVamp-ponキャラを汎用AI顔にしない
- 敵/ステージ/武器/アイテム/Visual Rulesも記憶だけで補完しない
- Deck Editorは主役級機能として扱う
- カテゴリごとに色を持たせ、牌の外枠/ラベル/チップで見せる
- 役はテンプレートとビジュアル選択で作れるようにする
- 得点には目安と警告を出す
- コインで強さを買わせない
- コインは見た目・称号・作成補助・コレクションに使う
- 実装スタックは TypeScript + React + Vite + Zod + Vitest
- MVP初期で Next.js / Unity / Godot / Phaser / Supabase / Firebase を使わない
- MVP初期で Redux / Zustand / TanStack Query / Tailwind を使わない
- 公式サンプルは `samples/animal-starter.deck.json` を使う
- local IP fixtureをproduction/publicへ入れない
- 画面やボタンを追加する場合は、先に `docs/17-screen-actions-and-requirements.md` に仕様を追記する
- オンライン対戦を作らない
- ログインを作らない
- Supabaseを入れない
- PWAを作らない
- ランキング・公開ギャラリーを作らない

## Design Direction

```text
soro-pon = Vamp-pon世界の中で流行っている記憶札遊び
```

Visual keywords:

```text
夜の机
記憶札
黒インク
手帳
小さな灯り
紙の遊び
静かな魔法
手作りの盤面
```

Orientation:

```text
TOP / Deck / Editor / Result / Collection: 390x844 portrait-first
Match: 844x390 landscape-first
Portrait match: rotate prompt
```

## Implementation Priority

本実装開始時はこの順番。

1. Vite + React + TypeScript setup
2. 型定義
3. Zod schema
4. `samples/animal-starter.deck.json` parse test
5. DeckProject / variant model
6. Role evaluation engine
7. Wildcard assignment
8. Scoring / MatchResult
9. Deck validation
10. Result progression model
11. MatchState / match flow
12. CPU minimum strategy
13. localStorage
14. JSON import/export
15. Deck Editor UI
16. Match UI
17. Result / Collection UI

## Test Policy

実装時は `docs/35-mvp-test-cases.md` を基準にする。

最低限:

- animal starter deck parse
- forbidden image fields reject
- special_bonus / score_bonus cannot ron
- wildcard auto assignment
- 13枚役 allow extra tile
- 14枚役 must cover full hand
- deck validation thresholds
- progression coin cap
- npm test
- npm run build

## Shared JSON Rule

共有JSONに入れてよい。

- deck name
- category definitions
- category colors
- tile definitions
- categories
- emoji
- fallbackLabel
- counts
- roles
- points
- role conditions
- wildcard rule

共有JSONに入れてはいけない。

- image
- imageUrl
- remoteImage
- imageBase64
- localImageId
- external asset URL
- blob URL
- file path

## UI Principle

- 1画面1目的
- 自分の手牌が主役
- 捨て牌は全員分見える
- 山は大きく出さず、残り枚数を小さく表示する
- 相手3人はミニ表示
- 牌の一番下に必ず名前
- 画像がなければ絵文字
- 絵文字がなければfallbackLabel
- fallbackLabelがなければ名前
- 牌の外枠/ラベル/チップでカテゴリ色を見せる
- TOP/Editor/Resultは縦対応
- Matchは横向き前提

## Commit Policy

- 1コミット1目的
- 小さく進める
- build/testをこまめに確認する
- 大きい作業は分割する
- 実装前に短い計画を出す
- 作業後に変更内容・検証結果・次の作業を報告する
