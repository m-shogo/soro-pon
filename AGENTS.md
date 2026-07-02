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
- デッキ入口は1つにし、通常版/拡張版は同じDeckProject内のvariantとして扱う
- 通常版/拡張版が両方ある場合はワンクリックで切り替え可能にする
- 拡張ルール用デッキは通常版から同じDeckProject内に作成する
- ロン/ツモ判定は上がり役だけを対象にする
- 特殊役とスコアボーナスはロン候補にしない
- 同じキャラボーナスは上がった後の加点として扱う
- オールマイティ牌は入れるが無制限にしない
- オールマイティは基本1役につき1枚まで
- 捨てられたオールマイティでロンは原則不可
- オールマイティはスコアボーナスに原則含めない
- 対戦画面はスマホ横向き前提で設計する
- TOP/Editor/Resultは縦画面にも対応する
- 縦向きで対戦画面を無理に作らず、横向き案内を出す
- 画面やボタンを追加する場合は、先に `docs/17-screen-actions-and-requirements.md` に仕様を追記する
- MVP実装前に `docs/19-fixed-mvp-decisions.md` を確認する
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

## Wildcard Policy

オールマイティ牌は入れる。

標準方針:

- 手牌内のオールマイティは代用可
- 基本は1役につき1枚まで
- 特殊役の加点にも使える
- 捨てられたオールマイティでロンは原則不可
- 同じキャラボーナスなどのスコアボーナスには原則含めない
- 使用した場合は結果画面で表示する

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

## Screen Action Policy

画面やボタンを実装する時は `docs/17-screen-actions-and-requirements.md` を正とする。

- ボタンには押した時の挙動を持たせる
- 押せない状態を明確にする
- 危険操作は確認ダイアログを挟む
- 対戦中にEditor/JSON共有を目立たせない
- ResultからDeck Editorへ戻れるようにする
- Deck EditorにはBalance Checkを持たせる

## MVP Fixed Policy

MVP実装前に `docs/19-fixed-mvp-decisions.md` を確認する。

固定済み:

- 標準総牌枚数は81枚
- 1種類あたり3枚推奨
- 3人戦/4人戦は同じデッキで対応
- 複数人ロンは席順優先で1人
- 複数win_role成立時は最高点1つ
- CPUは最低限の役寄せ + ランダム
- MVP初期はlocalStorage
- 画像はMVP初期ではemoji/fallbackLabel優先
- 公式/公開サンプルは安全テーマ
- ローカル検証データはgit管理外

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
3. DeckProject / variant model
4. 3人戦/4人戦のMatchState
5. 山生成・配牌
6. ツモ・捨てる・ターン進行
7. 役判定
8. 得点計算
9. JSON import/export
10. Editor UI
11. Match UI

## Design Generation Priority

画面デザイン生成時はこの順番。

1. `docs/02-game-rules.md` でルールを確認
2. `docs/03-data-model.md` で必要データを確認
3. `docs/10-screen-design-spec.md` で画面要件を確認
4. `docs/16-match-layout-orientation.md` で対戦画面の向きを確認
5. `docs/17-screen-actions-and-requirements.md` で必要ボタンと挙動を確認
6. `docs/19-fixed-mvp-decisions.md` でMVP固定判断を確認
7. `docs/11-design-generation-prompt.md` の対象画面プロンプトを使う

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
