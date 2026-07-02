# soro-pon

`soro-pon` は、プレイヤーが **デッキ・牌・役・得点** を自由に決められる、3〜4人用のカスタム牌ゲームです。

現時点では実装を急がず、まずは仕様・制約・共有方針・AI実装プロンプトを固める段階です。

## このゲームの核

- ドンジャラと同じルール感の、絵柄をそろえて役を作る牌ゲーム
- 3〜4人用
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

まずは仕様をブラッシュアップし、Fable / Claude Code が間違えない状態にします。
