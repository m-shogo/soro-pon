# AGENTS.md

このrepoでAIエージェントが作業するときの必須ルール。

## Project Status

現在は実装前の設計・資料整理フェーズ。  
実装を始める前に、必ず `docs/` を読む。

## Must Read

実装前に読むこと。

1. `README.md`
2. `docs/00-product-brief.md`
3. `docs/01-scope-and-non-goals.md`
4. `docs/02-game-rules.md`
5. `docs/03-data-model.md`
6. `docs/04-sharing-and-local-images.md`
7. `docs/05-ip-and-ugc-policy.md`
8. `docs/06-design-principles.md`
9. `docs/07-roadmap.md`
10. `docs/08-fable-implementation-prompt.md`
11. `docs/09-local-dev-fixtures-policy.md`

## Absolute Rules

- 旧repoを参考にしない
- 既存コードを移植しない
- 既存IPデータをrepoに入れない
- `src/`, `public/`, `docs/`, `README` に既存IP名を入れない
- 共有JSONに画像情報を入れない
- 画像付き共有を作らない
- 3〜4人用を前提にする
- 2人戦を先に作らない
- オンライン対戦を作らない
- ログインを作らない
- Supabaseを入れない
- PWAを作らない
- 実績・ランキング・公開ギャラリーを作らない

## Core Product

`soro-pon` は、プレイヤーが以下を自由に作れる3〜4人用カスタム牌ゲーム。

- デッキ
- 牌
- カテゴリ
- 役
- 得点

## Implementation Priority

実装開始時はこの順番。

1. 型定義
2. Zod schema
3. 3人戦/4人戦のMatchState
4. 山生成・配牌
5. ツモ・捨てる・ターン進行
6. 役判定
7. 得点計算
8. JSON import/export
9. Editor UI
10. Match UI

## Commit Policy

- 1コミット1目的
- 小さく進める
- build/testをこまめに確認する
- 大きい作業は分割する
- 実装前に短い計画を出す
- 作業後に変更内容・検証結果・次の作業を報告する

## Local-only Fixtures

ローカル検証用データは以下に置いてよいが、commit禁止。

```text
dev-fixtures/ip-local/
*.ip-local.json
*.local-deck.json
```

このデータはgit管理しない。

## Shared JSON Rule

共有JSONに入れてよい。

- deck name
- tile definitions
- categories
- emoji
- fallbackLabel
- counts
- roles
- points
- role conditions

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
