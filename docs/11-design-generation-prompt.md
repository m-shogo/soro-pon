# Design Generation Prompt

## Purpose

画面生成AI / UI生成AI / Claude Code / Codex に、`soro-pon` の画面デザインを作らせるためのプロンプト素材。

全画面生成の順番は `docs/38-screen-generation-plan.md` を正とする。

## Mandatory Read

画面生成前に必ず読む。

```text
docs/10-screen-design-spec.md
docs/37-visual-design-direction.md
docs/38-screen-generation-plan.md
docs/41-vampon-in-world-game-direction.md
docs/45-vampon-reference-gate.md
docs/46-landscape-first-web-responsive-policy.md
docs/design-targets/generated/soro-pon-landscape-vampon-ui-v1/README.md
```

Vamp-pon由来の表現を使う場合は、以下も必ず読む。

```text
/Users/m-shogo/Developer/personal/vamp-pon/docs/shared-vampon-master-index.md
```

## Master Prompt

```text
soro-pon の画面デザインを作ってください。

基準サイズ:
844x390 landscape

採用済み参照画像:
- docs/design-targets/generated/soro-pon-landscape-vampon-ui-v1/01-top.png
- docs/design-targets/generated/soro-pon-landscape-vampon-ui-v1/02-deck-list.png
- docs/design-targets/generated/soro-pon-landscape-vampon-ui-v1/03-deck-detail.png
- docs/design-targets/generated/soro-pon-landscape-vampon-ui-v1/04-match-setup.png
- docs/design-targets/generated/soro-pon-landscape-vampon-ui-v1/05-deck-editor.png
- docs/design-targets/generated/soro-pon-landscape-vampon-ui-v1/06-tile-editor.png
- docs/design-targets/generated/soro-pon-landscape-vampon-ui-v1/07-match-discard-phase.png
- docs/design-targets/generated/soro-pon-landscape-vampon-ui-v1/08-match-win-or-ron-phase.png
- docs/design-targets/generated/soro-pon-landscape-vampon-ui-v1/09-result.png
- docs/design-targets/generated/soro-pon-landscape-vampon-ui-v1/10-collection.png

参照画像の使い方:
- 新規画面は同じ紙UI / 黒インク / ランタン光 / 夜机の言語に合わせる
- 画面ごとの情報配置は近い参照画像を基準にする
- 参照画像をruntime素材として直接使わない
- 既存IP名や既存IP画像を公式UIへ混ぜない

最重要:
- soro-ponは横画面固定が正
- 全主要画面をまず横画面で設計する
- portrait-firstのスマホアプリ画面にしない
- Webではresponsive scale / adaptive layoutでよしなに対応する
- 縦画面はrotate promptまたは限定utilityだけ

世界観:
- soro-pon = Vamp-pon世界の中で流行っている記憶札遊び
- 横長の夜の机
- 紙札
- 黒インク
- ランタン光
- 手帳/対局帳
- 静かな通常画面
- 見せ場だけ少し派手

Vamp-pon踏襲:
- 紙UI / 黒インク / ランタン光を主軸にする
- 色数を増やしすぎない
- 通常画面は静かにする
- 文字可読性を最優先
- 生成画像をそのままruntimeへ混ぜない想定
- 漫画効果だけで世界観を作らない

ゲーム前提:
- ルールはドンジャラと同じ構造で固定
- 通常手牌8枚
- 引いた後9枚
- あがり形は3枚セット×3組
- 3〜4人用
- 2人戦UIにしない
- 自分の手牌を主役にする
- 全員の捨て牌が見える
- 山は大きく出さず、残り枚数だけ小さく表示
- 牌の下部に必ず名前を表示
- 牌の外枠/帯でカテゴリ色を表示
- imageがない場合はemoji
- emojiがない場合はfallbackLabel
- fallbackLabelがない場合はname
- 画像付き共有は作らない
- 共有JSONは画像なし
- 公式UIに既存IP名や既存IP画像を出さない

対象画面:
[ここに対象画面を入れる]

出力してほしいもの:
- 横画面の画面構成
- ワイヤーフレーム
- コンポーネント一覧
- 情報優先度
- Web responsive時の注意点
- 実装時の注意点
- 採用/不採用判断ポイント
```

## Component Sheet Prompt

```text
soro-pon の横画面UIコンポーネントシートをデザインしてください。

基準サイズ:
844x390 landscape

基準:
- Vamp-pon世界内の記憶札遊び
- 紙札 / 黒インク / ランタン光
- 横画面UIで使いやすい部品
- 牌は紙札状
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
- Vamp-pon踏襲が見える
```

## TOP / Entry Prompt

```text
soro-pon のTOP / Deck List / Deck Detail / Match Setupを横画面でデザインしてください。

基準サイズ:
844x390 landscape

目的:
初回ユーザーが迷わず「まず遊ぶ」「デッキを作る」「JSONを読み込む」に進める。

横画面構成:
- 左: title / 主要CTA
- 中央: 札箱 / デッキプレビュー / 動物スターター
- 右: 最近の記録 / 設定 / 簡単な説明

必要要素:
- soro-pon title
- [まず遊ぶ]
- [デッキ一覧]
- [デッキを作る]
- [JSONを読み込む]
- 動物スターターのカード
- 3人/4人選択
- 通常版/拡張版切替

禁止:
- portrait画面にしない
- ランキング
- 公開ギャラリー
- デイリー
- ログイン
```

## Deck Editor Prompt

```text
soro-pon のDeck Editor familyを横画面でデザインしてください。

基準サイズ:
844x390 landscape

対象:
- Deck Editor - Overview
- Category Editor
- Tile Editor
- Win Role Editor
- Special Bonus Editor
- Score Bonus Editor
- Rule Settings
- Balance Check
- Import / Export

横画面構成:
- 左: タブ / 一覧
- 中央: 編集フォーム
- 右: 牌プレビュー / 警告 / ライブテスト

目的:
デッキ = 牌一覧 + カテゴリ + 役一覧 + 得点ルール を作る。

重要:
- Editorはこのゲームの主役
- カテゴリ色を常に見せる
- 牌プレビューを出す
- 役はテンプレートから作る
- 得点目安を出す
- Balance warningから修正に行ける
- 画像は共有JSONに含まれないことを説明
- Vamp-ponの記憶札作業台として見せる
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
- 全員の捨て牌が見える
- 牌の下部には必ず名前を表示
- 牌の外枠/帯でカテゴリ色を表示
- Vamp-pon世界の夜机/紙札/黒インク/ランタン光を踏襲

必要な状態:
- Draw Phase
- Discard Phase
- Ron Reaction
- Win Available
- Menu Overlay
- Rule Sheet Modal

横画面構成:
- 中央: 全員の捨て牌
- 下: 自分の手牌8〜9枚
- 左右/上: 相手3人ミニパネル
- 右: 引く/捨てる/あがる/ロン/パス
- 左または上: 残り枚数/ターン/候補役

禁止:
- portrait画面にしない
- 相手の手牌を大きく表示しない
- 役一覧を画面の主役にしない
- 2人戦レイアウトにしない
- 小さい文字を詰め込まない
- 画像がないと破綻するUIにしない
```

## Result / Collection Prompt

```text
soro-pon のResult / Collection / Clear Boardを横画面でデザインしてください。

基準サイズ:
844x390 landscape

Result layout:
- 左: 勝者 / 順位 / 合計点
- 中央: 上がり役 / 特殊役 / ボーナス / オールマイティ使用
- 右: コイン / 実績 / 称号 / 次アクション

Collection layout:
- 左: フィルタ / カテゴリ
- 中央: 役コレクション / Clear Board
- 右: 詳細 / 報酬 / 次に狙う目標

必要要素:
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
- [もう一局]
- [デッキを調整]
- [コレクションを見る]
- [クリアボードを見る]
- [TOPへ]

重要:
- Vamp-ponの対局帳/記憶帳として見せる
- 何の役で勝ったかすぐ分かる
- 点数とコインが気持ちよく見える
- もう一局/デッキ調整に戻りやすい
```

## Utility Prompt

```text
soro-pon の補助画面をデザインしてください。

対象:
- Rotate Prompt
- Confirm Dialog
- Error Dialog

基準:
- Rotate Promptだけportrait可
- Dialogは横画面UI上に重ねる

重要:
- 横画面固定が分かる
- 短く分かる
- 操作を邪魔しすぎない
```

## Design Output Checklist

デザイン生成後は以下を確認する。

- 横画面になっている
- Vamp-pon世界内の遊びに見える
- ルールを変えていない
- 3〜4人用に見える
- 8枚/9枚手牌が成立する
- 自分の手牌が主役
- 全員の捨て牌が見える
- 牌の名前が下に出る
- カテゴリ色が外枠/帯に出る
- 画像なしでも成立する
- 共有JSONが画像なしであることが分かる
- Editorが作りやすい
- Resultから継続導線が見える
- 情報が詰まりすぎていない
```
