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
- build成果物
- 公式サンプル
- 公式スクリーンショット
- production export payload

公式サンプルは、動物・国・歴史人物・旅行・オリジナルテーマなどで作ります。

## 役分類方針

役候補の爆発とテンポ悪化を防ぐため、役は分類します。

```text
上がり役 = あがり判定に使う
特殊役 = 上がった後に加点する
スコアボーナス = 上がった後に加点する
```

ロン/ツモ判定の対象にするのは、原則として **上がり役だけ** です。

特殊役や同じキャラボーナスは、ロン候補にせず、上がった後の加点として扱います。詳細は `docs/14-role-taxonomy-and-scoring.md` にまとめます。

## オールマイティ牌方針

オールマイティ牌を入れます。

ただし、無制限に何でも代用できるとバランスが壊れるため、以下を標準方針にします。

- 基本は1役につき1枚まで
- 手牌内のオールマイティは代用可
- 捨てられたオールマイティでロンは原則不可
- 特殊役の加点には使える
- スコアボーナスには原則含めない
- 使用した場合は結果画面に表示する

詳細は `docs/15-wildcard-rules.md` と `docs/22-wildcard-ux-and-mahjong-feel.md` にまとめます。

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

拡張ルール用デッキはゼロから作らせず、通常デッキからコピーして拡張版を作る導線にします。詳細は `docs/13-deck-variants-and-balance.md` と `docs/20-extended-role-span-and-db-policy.md` にまとめます。

## 画面・向き方針

TOP / デッキ作成 / 役編集 / リザルトは縦画面にも対応します。

ただし、対戦画面は4人対戦、牌の見やすさ、捨て牌の見やすさを優先して、スマホ横向き前提で設計します。

- 対戦画面: 横向き前提
- 基準: 844x390
- 縦向き時: 横向き案内を表示
- orientation lockには依存しない
- 麻雀アプリの情報配置を参考にする
- ただし牌名・画像・カテゴリの見やすさを優先する

詳細は `docs/16-match-layout-orientation.md` にまとめます。

## Deck Editor 方針

このゲームの主役級機能は、デッキを気持ちよく作れることです。

- カテゴリごとに色を指定できる
- 牌の外枠/帯/チップでカテゴリ色を見せる
- 役はテンプレートとビジュアル選択で作る
- 得点には目安と警告を出す
- 役作成時にライブテストを出す
- かんたん/詳細モードを分ける

詳細は `docs/23-deck-editor-ux-and-category-colors.md` にまとめます。

## リザルト後の継続導線

対戦後は、勝敗だけで終わらせず、次に続く理由を作ります。

- 合計点に応じてコインを獲得する
- 称号を解放する
- クリアボード型の実績を進める
- 役コレクションを埋める
- Result Albumに高得点や初達成を残す
- コインは強さではなく見た目・称号・作成補助・コレクションに使う

詳細は `docs/29-result-progression-collection.md` にまとめます。

## MVP開始前チェック

固定済みのMVP判断は `docs/19-fixed-mvp-decisions.md` を正とします。

追加で、以下を固定済みです。

- 点数支払い: `docs/24-scoring-and-payment.md`
- 役判定エンジン: `docs/25-role-evaluation-engine.md`
- デッキ検証/バランス: `docs/26-deck-validation-and-balance-rules.md`
- CPU/対局フロー: `docs/27-cpu-minimum-strategy-and-match-flow.md`
- リリース安全チェック: `docs/28-release-safety-checklist.md`
- リザルト後の継続導線: `docs/29-result-progression-collection.md`

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
- [Deck Variants and Balance](docs/13-deck-variants-and-balance.md)
- [Role Taxonomy and Scoring](docs/14-role-taxonomy-and-scoring.md)
- [Wildcard Rules](docs/15-wildcard-rules.md)
- [Match Layout and Orientation](docs/16-match-layout-orientation.md)
- [Screen Actions and Requirements](docs/17-screen-actions-and-requirements.md)
- [MVP Readiness Checklist](docs/18-mvp-readiness-checklist.md)
- [Fixed MVP Decisions](docs/19-fixed-mvp-decisions.md)
- [Extended Role Span and DB Policy](docs/20-extended-role-span-and-db-policy.md)
- [Remaining Spec Gaps and Next Decisions](docs/21-remaining-spec-gaps-and-next-decisions.md)
- [Wildcard UX and Mahjong-like Feel](docs/22-wildcard-ux-and-mahjong-feel.md)
- [Deck Editor UX and Category Colors](docs/23-deck-editor-ux-and-category-colors.md)
- [Scoring and Payment](docs/24-scoring-and-payment.md)
- [Role Evaluation Engine](docs/25-role-evaluation-engine.md)
- [Deck Validation and Balance Rules](docs/26-deck-validation-and-balance-rules.md)
- [CPU Minimum Strategy and Match Flow](docs/27-cpu-minimum-strategy-and-match-flow.md)
- [Release Safety Checklist](docs/28-release-safety-checklist.md)
- [Result Progression and Collection](docs/29-result-progression-collection.md)

## 現時点でやらないこと

- オンライン対戦
- ログイン
- Supabase導入
- PWA
- デイリー任務
- 期間限定イベント
- 公開ギャラリー
- ランキング
- 画像付き共有
- productionへのローカル検証データ混入
- 強さに関係する購入

まずは仕様をブラッシュアップし、Fable / Claude Code / Codex が間違えない状態にします。
