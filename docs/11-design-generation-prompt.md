# Design Generation Prompt

このファイルは、将来ChatGPT / Fable / Claude Code / image generation / UI generation に画面デザインを作らせるためのプロンプト素材。

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

重要:
- ルールはドンジャラと同じ構造で固定
- 通常手牌8枚
- 引いた後9枚
- あがり形は3枚セット×3組
- 3〜4人用
- 2人戦UIにしない
- 自分の手牌を主役にする
- 相手3人はミニ表示
- 牌の下部に必ず名前を表示
- imageがない場合はemoji
- emojiがない場合はfallbackLabel
- fallbackLabelがない場合はname
- 画像付き共有は作らない
- 共有JSONは画像なし
- 公式UIに既存IP名や既存IP画像を出さない

対象画面:
[ここに対象画面を入れる]

基準サイズ:
390x844 スマホ縦

デザイン方針:
- 見やすさ優先
- 牌を大きく
- 情報を詰め込みすぎない
- 主要アクションを下部に大きく配置
- 色数を抑える
- 画像なしでも成立する
- Editor画面では入力順を分かりやすく

出力してほしいもの:
- 画面構成
- ワイヤーフレーム
- コンポーネント一覧
- 情報優先度
- 実装時の注意点
```

## Match Screen Prompt

```text
soro-pon の対戦画面をデザインしてください。

前提:
- 3〜4人用
- 自分以外の最大3人をミニ表示
- 通常手牌8枚
- 自分の番で1枚引くと9枚
- 9枚であがり判定
- あがらない場合は1枚捨てる
- あがり形は3枚セット×3組
- 自分の手牌が画面の主役
- 牌の下部には必ず名前を表示
- 画像がなければemojiを表示
- 390x844スマホ縦

画面に必要な要素:
- 相手3人のミニパネル
- 現在ターン表示
- 山/捨て牌エリア
- 自分の手牌8〜9枚
- 引くボタン
- 捨てるボタン
- あがるボタン
- 状態メッセージ
- 成立候補役の小さな表示

禁止:
- 相手の手牌を大きく表示しない
- 役一覧を画面の主役にしない
- 2人戦レイアウトにしない
- 小さい文字を詰め込まない
- 画像がないと破綻するUIにしない
```

## Deck Editor Prompt

```text
soro-pon のDeck Editorをデザインしてください。

目的:
デッキ = 牌一覧 + 役一覧 + 得点ルール を作る画面。

必要な要素:
- デッキ名
- 3人戦/4人戦対応設定
- 牌の種類数
- 総牌枚数
- 役数
- 最高点役
- 牌一覧
- 役一覧
- JSON export
- JSON import

重要:
- 画像は共有JSONに含めないことを説明
- Editorはこのゲームの主役なので見やすく
- 1画面に詰め込みすぎない
```

## Tile Editor Prompt

```text
soro-pon のTile Editorをデザインしてください。

牌の情報:
- name 必須
- categories 複数可
- emoji 任意
- fallbackLabel 任意
- count 必須
- local image 任意、共有対象外

必要なUI:
- 名前入力
- 絵文字入力
- fallbackLabel入力
- カテゴリ複数入力
- 枚数入力
- ローカル画像設定
- プレビュー

プレビューでは、画像/絵文字/fallbackLabel/nameの優先順位を確認できるようにする。
```

## Role Editor Prompt

```text
soro-pon のRole Editorをデザインしてください。

役の情報:
- name
- points
- condition
- description optional

対応条件:
- contains_all
- same_name_count
- same_category_count
- all_different_categories
- exact_group

必要なUI:
- 役名入力
- 得点入力
- 条件タイプ選択
- 条件詳細入力
- 条件の自然文プレビュー
- 対象牌/カテゴリの選択

重要:
ユーザーが「この役は何をそろえたら成立するか」を迷わないUIにする。
```

## Result Screen Prompt

```text
soro-pon のResult Screenをデザインしてください。

必要な表示:
- 勝者
- 成立役一覧
- 各役の点数
- 合計点
- もう一局
- デッキ編集
- 結果コピー

重要:
- 何の役で勝ったかすぐ分かる
- 点数が気持ちよく見える
- もう一局に戻りやすい
- IP画像やIP名を公式UIに出さない
```

## Design Output Checklist

デザイン生成後は以下を確認する。

- ルールを変えていない
- 3〜4人用に見える
- 8枚/9枚手牌が成立する
- 3枚セット×3組の思想が崩れていない
- 自分の手牌が主役
- 牌の名前が下に出る
- 画像なしでも成立する
- 共有JSONが画像なしであることが分かる
- Editorが作りやすい
- 情報が詰まりすぎていない
```
