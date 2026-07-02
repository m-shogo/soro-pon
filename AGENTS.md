# AGENTS.md

このrepoでAIエージェントが作業するときの必須ルール。

## Project Status

現在は実装前の設計・資料整理フェーズ。  
実装または画面デザイン生成を始める前に、必ず `docs/` を読む。

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
12. `docs/10-screen-design-spec.md`
13. `docs/11-design-generation-prompt.md`
14. `docs/12-advanced-rule-modules.md`
15. `docs/13-deck-variants-and-balance.md`
16. `docs/14-role-taxonomy-and-scoring.md`

## Absolute Rules

- 旧repoを参考にしない
- 既存コードを移植しない
- 既存IPデータをrepoに入れない
- `src/`, `public/`, `docs/`, `README` に既存IP名を入れない
- 共有JSONに画像情報を入れない
- 画像付き共有を作らない
- 3〜4人用を前提にする
- 2人戦を作らない
- 最終ルールはドンジャラと同じ構造にする
- 通常手牌8枚、引いた後9枚、あがり形は3枚セット×3組
- 拡張ルールは最初から型で考慮してよいが、MVP対局UIには勝手に入れない
- 2枚役はツモ/ロン可能だが、ポンは作らない
- ポン、カン、チーを作らない
- 拡張ルール用デッキは通常デッキからコピーして作る導線にする
- ロン/ツモ判定は上がり役だけを対象にする
- 特殊役とスコアボーナスはロン候補にしない
- 同じキャラボーナスは上がった後の加点として扱う
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

## Rule Lock

AIは、見た目や実装都合でルールを変えてはいけない。

固定:

- 3〜4人用
- 2人戦なし
- 共通山
- 共通役表
- 通常手牌8枚
- 引いた後9枚
- 9枚であがり判定
- あがり形は3枚セット×3組
- 役と得点はデッキ定義

## Role Taxonomy

役は分類する。

```text
win_role: あがり判定に使う。ツモ/ロン対象
special_bonus: 上がった後に加点。ツモ/ロン対象外
score_bonus: 上がった後に加点。ツモ/ロン対象外
```

AIは `special_bonus` や `score_bonus` をロン候補にしてはいけない。

## Advanced Rule Policy

以下の拡張ルール案はある。

- 13枚手牌 + 14枚あがり
- 2〜14枚役
- 2枚役はツモ/ロン可能
- 2枚役のポンはなし
- 同じ牌/同じキャラが多いほど得点反映
- リーチ
- ポンなし
- カンなし
- チーなし

方針:

- データモデルでは将来拡張に耐えるようにする
- MVPでは `BASE_DONJARA_RULE` のみ遊べるようにする
- 拡張ルールを勝手にUIへ出さない
- experimentalとして明示する
- 通常版と拡張版はvariantとして分ける
- ユーザーには通常デッキからコピーして作れる導線を用意する

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

## Design Generation Priority

画面デザイン生成時はこの順番。

1. `docs/02-game-rules.md` でルールを確認
2. `docs/03-data-model.md` で必要データを確認
3. `docs/10-screen-design-spec.md` で画面要件を確認
4. `docs/11-design-generation-prompt.md` の対象画面プロンプトを使う

デザイン生成時も、ルールを変えない。

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
- 390x844スマホ縦を基準にする
