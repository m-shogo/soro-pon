# Roadmap

## Philosophy

実装は小さく進める。

いきなり完成形を作らない。  
まずは3〜4人の対局ループ、次に役判定、その後Editorと共有を作る。

## Phase 0: Documentation

目的: Fable / Claude Code / Codex が間違えない状態を作る。

- README
- product brief
- scope / non-goals
- game rules
- data model
- sharing policy
- IP / UGC policy
- design principles
- implementation prompt

## Phase 1: Project Skeleton

目的: 実装の土台を作る。

- Vite + React + TypeScript
- Zustand
- Zod
- Vitest
- lint / format 方針
- basic folder structure

まだUIを作り込まない。

## Phase 2: Core Types and Engine

目的: UIなしでゲームが回る状態を作る。

- Tile
- TileInstance
- Role
- RoleCondition
- DeckDefinition
- PlayerState
- MatchState
- 山生成
- 配牌
- 3人戦初期化
- 4人戦初期化
- ツモ
- 捨てる
- ターン進行
- CPU簡易行動

テスト必須。

## Phase 3: Role and Scoring

目的: 役と得点を成立させる。

- contains_all
- same_name_count
- same_category_count
- all_different_categories
- exact_group
- 得点計算
- 勝利判定
- Result model

テスト必須。

## Phase 4: Minimal UI

目的: まず遊べるUIを作る。

- Home
- Match Screen
- Result Screen
- 牌表示
- 相手ミニ表示
- 引く / 捨てる / あがる

デザインは凝らない。  
視認性を優先。

## Phase 5: Editors

目的: 自作ができる状態にする。

- Deck Editor
- Tile Editor
- Role Editor
- 得点編集
- カテゴリ複数編集
- localStorage保存

## Phase 6: JSON Sharing

目的: 作る手間を共有できるようにする。

- export shared deck JSON
- import shared deck JSON
- Zod validation
- 画像フィールド除外
- 画像フィールド拒否/strip
- local image override分離

## Phase 7: Local Images

目的: 各ユーザーが自分の端末で画像を入れられるようにする。

- ローカル画像設定
- 画像がなければemoji
- emojiがなければfallbackLabel
- fallbackLabelがなければname
- 共有JSONには画像を含めない

## Phase 8: Social Share

目的: Xでデッキを試してもらう導線を作る。

- X投稿文コピー
- 結果投稿文コピー
- デッキ概要テキスト
- 画像なし共有カード案

X API連携はしない。

## Explicitly Later

以下は、MVP後に判断する。

- オンライン対戦
- 公開ギャラリー
- ランキング
- アカウント
- 通報/削除申請導線
- PWA
- 実績
- デイリー
- 課金

## Commit Policy

1コミット1目的。

良い例:

- `core: TileとRoleの型を追加`
- `core: 3人戦と4人戦の初期化を追加`
- `core: ツモと捨てる処理を追加`
- `sharing: 画像なしJSON exportを追加`

悪い例:

- `全部作る`
- `UIとルールと共有をまとめて追加`
- `なんとなく改善`
