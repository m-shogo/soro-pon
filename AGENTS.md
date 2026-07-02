# AGENTS.md

このrepoでAIエージェントが作業するときの必須ルール。

## Project Status

```text
MVP実装準備完了。
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

## Must Read

仕様確認で読むこと。

1. `README.md`
2. `AGENTS.md`
3. `CLAUDE.md` or `CODEX.md`
4. `docs/03-data-model.md`
5. `docs/17-screen-actions-and-requirements.md`
6. `docs/23-deck-editor-ux-and-category-colors.md`
7. `docs/24-scoring-and-payment.md`
8. `docs/25-role-evaluation-engine.md`
9. `docs/26-deck-validation-and-balance-rules.md`
10. `docs/27-cpu-minimum-strategy-and-match-flow.md`
11. `docs/28-release-safety-checklist.md`
12. `docs/29-result-progression-collection.md`
13. `docs/30-first-run-and-playtest-loop.md`
14. `docs/31-implementation-stack-decision.md`
15. `docs/32-zod-schema-spec.md`
16. `docs/33-official-animal-starter-deck.md`
17. `docs/34-mvp-implementation-prompt.md`
18. `docs/35-mvp-test-cases.md`
19. `docs/36-doc-consistency-audit.md`

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
- Deck Editorは主役級機能として扱う
- カテゴリごとに色を持たせ、牌の外枠/帯/チップで見せる
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

## Implementation Priority

実装開始時はこの順番。

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
- 相手3人はミニ表示
- 牌の一番下に必ず名前
- 画像がなければ絵文字
- 絵文字がなければfallbackLabel
- fallbackLabelがなければ名前
- TOP/Editor/Resultは縦対応
- Matchは横向き前提

## Commit Policy

- 1コミット1目的
- 小さく進める
- build/testをこまめに確認する
- 大きい作業は分割する
- 実装前に短い計画を出す
- 作業後に変更内容・検証結果・次の作業を報告する
