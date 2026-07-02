# soro-pon

`soro-pon` は、プレイヤーが **デッキ・牌・役・得点** を自由に決められる、3〜4人用のカスタム牌ゲームです。

現時点では実装を急がず、まずは仕様・制約・共有方針・AI実装プロンプト・画面デザイン生成情報を固める段階です。

## このゲームの核

- 最終ルールはドンジャラと同じ構造で固定
- 3〜4人用
- 2人戦は作らない
- 通常手牌8枚
- 自分の番で1枚引くと9枚
- あがり形は3枚セット×3組
- MVPはローカル対戦のみ
- 最初は人間1人 + CPU2〜3人
- オンライン対戦、ログイン、ランキング、公開ギャラリーは後回し
- 牌・カテゴリ・役・得点をユーザーが自由に作れる
- 共有は画像なしJSON
- 画像は各ユーザーが自分の端末で設定する

## 重要方針

このrepoでは、旧repoや過去実装は参考にしません。  
完全新規で、仕様から整理して作ります。

また、開発中のローカル検証で既存IP題材を使うことはありますが、以下には入れません。

- `src/`
- `public/`
- `docs/`
- `README`
- build成果物
- 公式サンプル
- 公式スクリーンショット

公式サンプルは、動物・国・歴史人物・旅行・オリジナルテーマなどで作ります。

## 拡張ルール方針

標準ルールはドンジャラ互換で固定します。

ただし将来的に、以下のような拡張ルールを入れられるように、データモデルには最初から余地を持たせます。

- 13枚手牌 + 14枚あがり
- 2〜14枚役
- 2枚役はツモ/ロン可能
- 2枚役のポンはなし
- 同じ牌/同じキャラが多いほど得点反映
- リーチ
- ポンなし
- カンなし
- チーなし

これらはMVPの対局UIには最初から入れず、`docs/12-advanced-rule-modules.md` でexperimental扱いにします。

## デザイン生成方針

最終的には、対戦画面・Editor画面・結果画面などのデザインも、このrepo内の情報をもとに生成します。

そのため、画面生成に必要な情報は `docs/10-screen-design-spec.md` と `docs/11-design-generation-prompt.md` に集約します。

AIは、デザインを作るためにルールを変えてはいけません。

## ドキュメント

- [Product Brief](docs/00-product-brief.md)
- [Scope and Non-goals](docs/01-scope-and-non-goals.md)
- [Game Rules](docs/02-game-rules.md)
- [Data Model](docs/03-data-model.md)
- [Sharing and Local Images](docs/04-sharing-and-local-images.md)
- [IP and UGC Policy](docs/05-ip-and-ugc-policy.md)
- [Design Principles](docs/06-design-principles.md)
- [Roadmap](docs/07-roadmap.md)
- [Fable Implementation Prompt](docs/08-fable-implementation-prompt.md)
- [Local Dev Fixtures Policy](docs/09-local-dev-fixtures-policy.md)
- [Screen Design Spec](docs/10-screen-design-spec.md)
- [Design Generation Prompt](docs/11-design-generation-prompt.md)
- [Advanced Rule Modules](docs/12-advanced-rule-modules.md)

## 現時点でやらないこと

- 実装開始
- UI作り込み
- オンライン対戦
- ログイン
- Supabase導入
- PWA
- 実績
- デイリー
- 公開ギャラリー
- ランキング
- 画像付き共有
- 拡張ルールの対局UI実装

まずは仕様をブラッシュアップし、Fable / Claude Code / Codex が間違えない状態にします。
