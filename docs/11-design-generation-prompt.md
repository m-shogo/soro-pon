# Design Generation Prompt

## Purpose

画面生成AI / UI生成AI / Claude Code / Codex に、`soro-pon` の画面デザインを作らせるためのプロンプト素材。

全画面生成の順番は `docs/38-screen-generation-plan.md` を正とする。

## Master Prompt

```text
soro-pon の画面デザインを作ってください。

必ず以下のdocsを前提にしてください。

- docs/02-game-rules.md
- docs/03-data-model.md
- docs/04-sharing-and-local-images.md
- docs/05-ip-and-ugc-policy.md
- docs/06-design-principles.md
- docs/10-screen-design-spec.md
- docs/16-match-layout-orientation.md
- docs/17-screen-actions-and-requirements.md
- docs/22-wildcard-ux-and-mahjong-feel.md
- docs/23-deck-editor-ux-and-category-colors.md
- docs/29-result-progression-collection.md
- docs/30-first-run-and-playtest-loop.md
- docs/37-visual-design-direction.md
- docs/38-screen-generation-plan.md

重要:
- ルールはドンジャラと同じ構造で固定
- 通常手牌8枚
- 引いた後9枚
- あがり形は3枚セット×3組
- 3〜4人用
- 2人戦UIにしない
- Match画面は横向き844x390前提
- TOP/Editor/Result/Collectionは縦向き390x844前提
- 自分の手牌を主役にする
- 相手3人はミニ表示
- 牌の下部に必ず名前を表示
- 牌の外枠/帯でカテゴリ色を表示
- imageがない場合はemoji
- emojiがない場合はfallbackLabel
- fallbackLabelがない場合はname
- 画像付き共有は作らない
- 共有JSONは画像なし
- 公式UIに既存IP名や既存IP画像を出さない

デザイン方向性:
- 明るい卓上ボードゲームUI
- 麻雀アプリの操作感
- カード/デッキビルダーの作りやすさ
- クリアボードの収集感
- 暗すぎない
- 幼すぎない
- ソシャゲガチャUIにしない

対象画面:
[ここに対象画面を入れる]

基準サイズ:
[390x844 portrait または 844x390 landscape]

出力してほしいもの:
- 画面構成
- ワイヤーフレーム
- コンポーネント一覧
- 情報優先度
- 実装時の注意点
- 採用/不採用判断ポイント
```

## Component Sheet Prompt

```text
soro-pon のUIコンポーネントシートをデザインしてください。

基準:
- 明るい卓上ボードゲームUI
- 牌は角丸カード状
- カテゴリ色を外枠/上部帯/チップで表示
- 画像なしでもemoji/fallbackLabel/nameで成立

作るもの:
- Tile Card 通常/選択/捨て牌/オールマイティ
- Action Button enabled/disabled/primary/danger
- Player Mini Panel current/inactive
- Role Card win_role/special_bonus/score_bonus
- Score Breakdown Row
- Category Chip
- Achievement Tile locked/unlocked/rewarded

確認:
- 牌名が読める
- カテゴリ色が分かる
- オールマイティが分かる
- 押せるボタンだけ目立つ
```

## TOP Prompt

```text
soro-pon のTOP画面をデザインしてください。

基準サイズ:
390x844 portrait

目的:
初回ユーザーが迷わず「まず遊ぶ」「デッキを作る」「JSONを読み込む」に進める。

必要要素:
- soro-pon title
- 短い説明
- [まず遊ぶ]
- [デッキ一覧]
- [デッキを作る]
- [JSONを読み込む]
- 動物スターターのカード

禁止:
- ランキング
- 公開ギャラリー
- デイリー
- ログイン
```

## Deck List / Detail Prompt

```text
soro-pon のDeck List / Deck Detailをデザインしてください。

基準サイズ:
390x844 portrait

必要要素:
- デッキカード
- 通常版/拡張版対応表示
- 総牌枚数
- 役数
- 警告数
- 最終更新
- [遊ぶ]
- [編集]
- [複製]
- [Export]
- [Delete]

重要:
通常版/拡張版を別カードにしない。同じDeckProject内variantとして見せる。
```

## Deck Editor Prompt

```text
soro-pon のDeck Editorをデザインしてください。

基準サイズ:
390x844 portrait

目的:
デッキ = 牌一覧 + カテゴリ + 役一覧 + 得点ルール を作る画面。

タブ:
- 基本情報
- カテゴリ
- 牌
- 上がり役
- 特殊役
- ボーナス
- ルール
- バランス
- 共有

重要:
- Editorはこのゲームの主役
- カテゴリ色を常に見せる
- 牌プレビューを出す
- 役はテンプレートから作る
- 得点目安を出す
- Balance warningから修正に行ける
- 画像は共有JSONに含まれないことを説明
```

## Category Editor Prompt

```text
soro-pon のCategory Editorをデザインしてください。

基準サイズ:
390x844 portrait

必要要素:
- カテゴリ一覧
- 色選択
- アイコン/emoji
- priority
- 使用中の牌数
- 色が似ている警告
- [カテゴリ追加]
- [色を自動提案]

重要:
カテゴリ色が牌の外枠/帯に反映されることが分かるUIにする。
```

## Tile Editor Prompt

```text
soro-pon のTile Editorをデザインしてください。

基準サイズ:
390x844 portrait

牌の情報:
- name 必須
- primaryCategoryId
- categories 複数可
- emoji 任意
- fallbackLabel 任意
- count 必須
- local image 任意、共有対象外

必要なUI:
- 名前入力
- カテゴリ選択
- 絵文字入力
- fallbackLabel入力
- 枚数入力
- ローカル画像設定
- 牌プレビュー
- [この牌で役を作る]

プレビューでは、外枠/上部帯/名前/emoji/fallbackLabelを確認できるようにする。
```

## Role Editor Prompt

```text
soro-pon のRole Editorをデザインしてください。

基準サイズ:
390x844 portrait

対象:
- Win Role Editor
- Special Bonus Editor
- Score Bonus Editor

重要:
- win_roleはロン/ツモ候補
- special_bonusは上がった後の加点
- score_bonusも上がった後の加点
- special_bonus/score_bonusをロン候補に見せない

必要なUI:
- 役タイプ
- 役名入力
- 得点入力
- 条件タイプ選択
- 対象牌/カテゴリ選択
- 条件の自然文プレビュー
- テスト手札
- Result表示プレビュー

ユーザーが「何をそろえたら成立するか」を迷わないUIにする。
```

## Match Landscape Prompt

```text
soro-pon の対戦画面をデザインしてください。

基準サイズ:
844x390 landscape

前提:
- 3〜4人用
- 自分以外の最大3人をミニ表示
- 通常手牌8枚
- 自分の番で1枚引くと9枚
- 9枚であがり判定
- あがらない場合は1枚捨てる
- 自分の手牌が画面の主役
- 牌の下部には必ず名前を表示
- 牌の外枠/帯でカテゴリ色を表示

必要な状態:
- Draw Phase
- Discard Phase
- Ron Reaction
- Win Available
- Menu Overlay
- Rule Sheet Modal

画面に必要な要素:
- 相手3人のミニパネル
- 現在ターン表示
- 山/捨て牌エリア
- 直近捨て牌
- 自分の手牌8〜9枚
- 引くボタン
- 捨てるボタン
- あがるボタン
- ロンボタン
- パスボタン
- 状態メッセージ
- 成立候補役の小さな表示

禁止:
- portrait画面にしない
- 相手の手牌を大きく表示しない
- 役一覧を画面の主役にしない
- 2人戦レイアウトにしない
- 小さい文字を詰め込まない
- 画像がないと破綻するUIにしない
```

## Result Screen Prompt

```text
soro-pon のResult Screenをデザインしてください。

基準サイズ:
390x844 portrait

必要な表示:
- 勝者 / 流局
- ツモ/ロン
- 上がり役
- 特殊役
- スコアボーナス
- オールマイティ使用
- 合計点
- 獲得コイン
- 実績解除
- 称号進行
- コレクション進行

Actions:
- [もう一局]
- [デッキを調整]
- [コレクションを見る]
- [クリアボードを見る]
- [TOPへ]

重要:
- 何の役で勝ったかすぐ分かる
- 点数とコインが気持ちよく見える
- もう一局/デッキ調整に戻りやすい
```

## Collection / Clear Board Prompt

```text
soro-pon のCollection / Clear Boardをデザインしてください。

基準サイズ:
390x844 portrait

方向性:
カービィのエアライドのクリアチェッカー的なマス目。
ただしソシャゲ感は薄く、明るいボードゲーム調。

必要要素:
- 5x5 Clear Board
- locked / unlocked / rewarded state
- 役コレクション
- 最高得点Result Top 10
- 称号選択
- 報酬は見た目/称号/コレクション中心

禁止:
- 強さを買えるように見せない
- ガチャUIにしない
- 期間限定イベント感を出しすぎない
```

## Utility Prompt

```text
soro-pon の補助画面をデザインしてください。

対象:
- Rotate Prompt
- Confirm Dialog
- Error Dialog

基準:
- Rotate Prompt: portrait 390x844
- Dialog: reusable modal

重要:
- 短く分かる
- 操作を邪魔しすぎない
- 危険操作は確認できる
```

## Design Output Checklist

デザイン生成後は以下を確認する。

- ルールを変えていない
- 3〜4人用に見える
- Matchは844x390横向きになっている
- 8枚/9枚手牌が成立する
- 自分の手牌が主役
- 牌の名前が下に出る
- カテゴリ色が外枠/帯に出る
- 画像なしでも成立する
- 共有JSONが画像なしであることが分かる
- Editorが作りやすい
- Resultから継続導線が見える
- 情報が詰まりすぎていない
```
