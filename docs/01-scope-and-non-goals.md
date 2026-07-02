# Scope and Non-goals

## Current Phase

このrepoは、まだ実装フェーズではない。

現在の目的は、Fable / Claude Code / Codex が実装時に迷わないように、仕様・制約・進行順を固定すること。

## MVP Scope

MVPで作るもの。

### Core

- 3人戦
- 4人戦
- 人間1人 + CPU2〜3人
- 共通山
- 共通役表
- ツモ
- 捨てる
- あがる
- 役判定
- 得点計算
- 結果表示

### Creation

- デッキ作成
- 牌作成
- カテゴリ複数設定
- 絵文字設定
- fallback label設定
- 役作成
- 得点設定
- 役条件設定

### Persistence / Sharing

- localStorage保存
- JSON export
- JSON import
- 画像情報除外
- import validation

### UI

- Home
- Deck Editor
- Tile Editor
- Role Editor
- Match Screen
- Result Screen

## Non-goals

MVPではやらないこと。

- 2人戦
- オンライン対戦
- ログイン
- Supabase
- Firebase
- PWA
- 実績
- デイリー
- ランキング
- 公開ギャラリー
- アプリ内検索
- IPデッキ検索
- 画像付き共有
- 画像URL共有
- base64画像共有
- X API連携
- AI画像生成
- 課金
- アカウント
- フレンド機能

## Design Non-goals

- 最初から豪華な演出を作らない
- 牌UIを過剰装飾しない
- 画面に説明を詰め込みすぎない
- App.tsxを巨大化させない

## AI Implementation Guardrails

AIエージェントは以下を守る。

1. 旧repoを見ない
2. 既存コードを移植しない
3. 実装を勝手に広げない
4. 1コミットで大量変更しない
5. まず型とルールエンジンを作る
6. UIは後から載せる
7. build/testをこまめに確認する

## Priority Order

優先順位は以下。

1. データモデル
2. 3〜4人対応のMatchState
3. 山生成・配牌・ターン進行
4. 役判定
5. 得点計算
6. JSON import/export
7. Editor UI
8. Match UI
9. Share UI

これ以外は後回し。
