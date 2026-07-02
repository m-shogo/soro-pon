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
17. `docs/15-wildcard-rules.md`
18. `docs/16-match-layout-orientation.md`
19. `docs/17-screen-actions-and-requirements.md`
20. `docs/18-mvp-readiness-checklist.md`
21. `docs/19-fixed-mvp-decisions.md`
22. `docs/20-extended-role-span-and-db-policy.md`
23. `docs/21-remaining-spec-gaps-and-next-decisions.md`
24. `docs/22-wildcard-ux-and-mahjong-feel.md`
25. `docs/23-deck-editor-ux-and-category-colors.md`
26. `docs/24-scoring-and-payment.md`
27. `docs/25-role-evaluation-engine.md`
28. `docs/26-deck-validation-and-balance-rules.md`
29. `docs/27-cpu-minimum-strategy-and-match-flow.md`
30. `docs/28-release-safety-checklist.md`

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
- 画面やボタンを追加する場合は、先に `docs/17-screen-actions-and-requirements.md` に仕様を追記する
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
- 拡張版は13枚手牌、引いた後14枚
- 拡張版は2〜14枚役を扱える
- 13枚役は余り1枚を許可できる
- 役と得点はデッキ定義

## Deck Project Policy

デッキ入口は1つにする。

```text
DeckProject
  ├─ tiles: 共通牌セット
  ├─ variant: 通常版
  └─ variant: 拡張版
```

通常版と拡張版が両方ある場合は、Deck Detail / Match Setup / Deck Editorでワンクリック切替できるようにする。

## Role Taxonomy

役は分類する。

```text
win_role: あがり判定に使う。ツモ/ロン対象
special_bonus: 上がった後に加点。ツモ/ロン対象外
score_bonus: 上がった後に加点。ツモ/ロン対象外
```

AIは `special_bonus` や `score_bonus` をロン候補にしてはいけない。

## Scoring Policy

MVP初期は勝者加点方式。

```text
ロン: winnerにtotalPoints加点。sourcePlayerIdは記録。減点なし。
ツモ: winnerにtotalPoints加点。減点なし。
流局: 得点変動なし。
```

将来のために `paymentRecords` は持つ。

## Role Evaluation Policy

```text
1. win_roleだけで上がり判定
2. 複数win_role成立時は points desc, span desc, definition order asc
3. selectedWinRoleを1つ採用
4. special_bonusを加点
5. score_bonusを加点
6. wildcard使用内容をResultに表示
```

## Wildcard Policy

オールマイティ牌は入れる。

標準方針:

- 手牌内のオールマイティは代用可
- 基本は1役につき1枚まで
- 自動で一番得する使い方にする
- 手動変更UIは内訳/検証画面のみ
- 特殊役の加点にも使える
- 捨てられたオールマイティでロンは原則不可
- 同じキャラボーナスなどのスコアボーナスには原則含めない
- 使用した場合は結果画面で表示する

## Deck Editor Policy

Deck Editorはこのゲームの主役級機能。

- カテゴリごとに色を指定できる
- 牌の外枠/帯/チップでカテゴリ色を見せる
- 複数カテゴリ時はprimaryCategoryIdを優先する
- 役はテンプレートから作れる
- 牌を並べて役を作れる
- 点数には目安を出す
- 役作成時にライブテストを出す
- かんたん/詳細モードを分ける

## Validation Policy

固定:

```text
総牌枚数81枚推奨
40枚未満はError
60枚未満はWarning
win_role 0件はError
win_role 3件未満はWarning
2枚役50点超はWarning
wildcardが総牌数15%超はWarning
scoreBonus maxPointsなしはWarning
```

## CPU Policy

MVP CPUは強くなくてよいが、完全ランダムにしない。

```text
1. あがれるならあがる
2. ロンできるならロンする
3. 1枚足りないwin_roleに関係する牌を残す
4. wildcardは基本残す
5. special_bonusだけのためには無理に残さない
6. それ以外はランダム
```

## Match Layout Policy

対戦画面はスマホ横向き前提。

- 基準サイズは844x390
- 4人対戦の見やすさを優先
- 自分の手牌は下部に大きく表示
- 捨て牌は中央に分かりやすく表示
- 相手3人は上/左右のミニ表示
- 主要アクションは右下〜下部
- 役候補は常時大きく出さない
- portrait時は横向き案内を出す

## Release Safety Policy

公開前にローカル検証データを削除する。

```text
dev-fixtures/ip-local/*.json
dev-fixtures/ip-local/*.md
*.ip-local.json
*.local-deck.json
*.local-fixture.json
```

production buildにlocal fixtureを含めない。

共有JSONに画像情報を入れない。

## Implementation Priority

実装開始時はこの順番。

1. 型定義
2. Zod schema
3. DeckProject / variant model
4. Role evaluation engine
5. Scoring and MatchResult
6. Deck validation
7. 3人戦/4人戦のMatchState
8. 山生成・配牌
9. ツモ・捨てる・ターン進行
10. CPU minimum strategy
11. JSON import/export
12. Deck Editor UI
13. Match UI

## Commit Policy

- 1コミット1目的
- 小さく進める
- build/testをこまめに確認する
- 大きい作業は分割する
- 実装前に短い計画を出す
- 作業後に変更内容・検証結果・次の作業を報告する

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
