# soro-pon

`soro-pon` は、プレイヤーが **デッキ・牌・役・得点** を自由に決められる、3〜4人用のカスタム牌ゲームです。

現在は **MVP実装準備完了** の状態です。  
ただし、MVP本実装に入る前に、`docs/38-screen-generation-plan.md` に沿って全主要画面のデザインを生成・採用します。

## AI作業入口

AIエージェントは、作業前に以下を読むこと。

```text
README.md
AGENTS.md
CLAUDE.md or CODEX.md
docs/34-mvp-implementation-prompt.md
docs/35-mvp-test-cases.md
```

画面生成を行う場合は、追加で以下を読むこと。

```text
docs/10-screen-design-spec.md
docs/11-design-generation-prompt.md
docs/37-visual-design-direction.md
docs/38-screen-generation-plan.md
docs/41-vampon-in-world-game-direction.md
docs/42-shared-vampon-source-policy.md
```

`.claude/README.md` と `.codex/README.md` は補助メモです。仕様の正本は `README.md` / `AGENTS.md` / `docs/` に集約します。

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

開発中のローカル検証で既存IP題材を使う場合も、以下には入れません。

- `src/`
- `public/`
- `docs/`
- `README.md`
- build成果物
- 公式サンプル
- 公式スクリーンショット
- production export payload

公式サンプルは、動物・国・歴史人物・旅行・オリジナルテーマなどの安全テーマで作ります。

## Vamp-pon共有資料

`soro-pon` は、Vamp-pon世界内で流行っている記憶札遊びとして扱います。

世界観・キャラ・敵・ステージ・武器・アイテムの正本は、soro-pon側へコピーせず、Vamp-pon repo側の共有資料を参照します。

```text
m-shogo/vamp-pon
docs/shared-world-bible.md
```

soro-pon側の参照ルールは `docs/42-shared-vampon-source-policy.md` にまとめます。

## デザイン方針

MVPの見た目は以下で固定します。

```text
soro-pon = Vamp-pon世界の中で流行っている記憶札遊び
```

単体の漫画風アプリではなく、Vamp-pon世界の机の上で遊ばれている小さな牌ゲームとしてデザインします。

```text
夜の机
紙札
黒インク
小さな灯り
記憶の欠片
手帳
静かな通常画面
勝負どころだけ少し漫画的
```

- TOP / Deck / Editor / Result / Collection は 390x844 portrait-first
- Match は 844x390 landscape-first
- Portrait match では横向き案内を出す
- 牌は記憶札として見せる
- 牌の外枠/ラベル/チップでカテゴリ色を見せる
- 捨て牌は全員分見える
- 山は大きく出さず、残り枚数だけ小さく表示する
- Three.jsは小さな灯り/札の浮き/インク/Result演出の補助に使う

詳細は `docs/37-visual-design-direction.md` / `docs/38-screen-generation-plan.md` / `docs/41-vampon-in-world-game-direction.md` にまとめます。

## 実装スタック方針

MVPは以下で固定します。

```text
TypeScript + React + Vite + Zod + Vitest
```

Next.js / Unity / Godot / Phaser / Supabase / Firebase はMVP初期では使いません。

詳細は `docs/31-implementation-stack-decision.md` にまとめます。

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

- 基本は1役につき1枚まで
- 手牌内のオールマイティは代用可
- 捨てられたオールマイティでロンは原則不可
- 特殊役の加点には使える
- スコアボーナスには原則含めない
- 使用した場合は結果画面に表示する
- 対戦中に毎回クリック選択式にはしない

詳細は `docs/15-wildcard-rules.md` と `docs/22-wildcard-ux-and-mahjong-feel.md` にまとめます。

## 拡張ルール方針

標準ルールはドンジャラ互換で固定します。

将来的に、以下のような拡張ルールを入れられるように、データモデルには最初から余地を持たせます。

- 13枚手牌 + 14枚あがり
- 2〜14枚役
- 2枚役はツモ/ロン可能
- 2枚役のポンはなし
- ポンなし
- カンなし
- チーなし

拡張ルール用デッキはゼロから作らせず、通常デッキからコピーして拡張版を作る導線にします。詳細は `docs/13-deck-variants-and-balance.md` と `docs/20-extended-role-span-and-db-policy.md` にまとめます。

## 画面・向き方針

TOP / デッキ作成 / 役編集 / リザルトは縦画面にも対応します。

対戦画面は、4人対戦・牌の見やすさ・捨て牌の見やすさを優先して、スマホ横向き前提で設計します。

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

## 公式サンプル

MVP公式サンプルは安全テーマの **動物スターター** です。

```text
samples/animal-starter.deck.json
```

詳細は `docs/33-official-animal-starter-deck.md` にまとめます。

## MVP実装入口

```text
docs/34-mvp-implementation-prompt.md
docs/35-mvp-test-cases.md
```

実装開始時はこの2つを正とします。

ただし、画面デザイン生成が終わるまでは、MVP本実装には入らない方針です。

## ドキュメント

- [Product Brief](docs/00-product-brief.md)
- [Scope and Non-goals](docs/01-scope-and-non-goals.md)
- [Game Rules](docs/02-game-rules.md)
- [Data Model](docs/03-data-model.md)
- [Sharing and Local Images](docs/04-sharing-and-local-images.md)
- [IP and UGC Policy](docs/05-ip-and-ugc-policy.md)
- [Design Principles](docs/06-design-principles.md)
- [Roadmap](docs/07-roadmap.md)
- [Deprecated Fable Implementation Prompt](docs/08-fable-implementation-prompt.md)
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
- [Resolved Spec Gaps](docs/21-remaining-spec-gaps-and-next-decisions.md)
- [Wildcard UX and Mahjong-like Feel](docs/22-wildcard-ux-and-mahjong-feel.md)
- [Deck Editor UX and Category Colors](docs/23-deck-editor-ux-and-category-colors.md)
- [Scoring and Payment](docs/24-scoring-and-payment.md)
- [Role Evaluation Engine](docs/25-role-evaluation-engine.md)
- [Deck Validation and Balance Rules](docs/26-deck-validation-and-balance-rules.md)
- [CPU Minimum Strategy and Match Flow](docs/27-cpu-minimum-strategy-and-match-flow.md)
- [Release Safety Checklist](docs/28-release-safety-checklist.md)
- [Result Progression and Collection](docs/29-result-progression-collection.md)
- [First Run and Playtest Loop](docs/30-first-run-and-playtest-loop.md)
- [Implementation Stack Decision](docs/31-implementation-stack-decision.md)
- [Zod Schema Spec](docs/32-zod-schema-spec.md)
- [Official Animal Starter Deck](docs/33-official-animal-starter-deck.md)
- [MVP Implementation Prompt](docs/34-mvp-implementation-prompt.md)
- [MVP Test Cases](docs/35-mvp-test-cases.md)
- [Doc Consistency Audit](docs/36-doc-consistency-audit.md)
- [Visual Design Direction](docs/37-visual-design-direction.md)
- [Screen Generation Plan](docs/38-screen-generation-plan.md)
- [Three.js / WebGL Policy](docs/39-threejs-webgl-policy.md)
- [Stylish Three.js Experiment Plan](docs/40-stylish-threejs-experiment-plan.md)
- [Vamp-pon In-world Game Direction](docs/41-vampon-in-world-game-direction.md)
- [Shared Vamp-pon Source Policy](docs/42-shared-vampon-source-policy.md)

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

実装は Claude Code / Codex / Cursor が間違えないよう、README / AGENTS / CLAUDE / CODEX / docs を正として進めます。
