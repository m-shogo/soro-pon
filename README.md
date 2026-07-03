# soro-pon

`soro-pon` は、プレイヤーが **デッキ・牌・役・得点** を自由に決められる、3〜4人用のカスタム牌ゲームです。

現在は **MVP Phase 1 実装開始可能** の状態です。

ただし、実装はすぐUIへ入らず、まず `domain / schema / engine / tests` を固めます。

## AI作業入口

AIエージェントは、作業前に以下を読むこと。

```text
README.md
AGENTS.md
CLAUDE.md or CODEX.md
docs/34-mvp-implementation-prompt.md
docs/35-mvp-test-cases.md
docs/47-mvp-implementation-final-gate.md
docs/48-responsive-crisp-ui-system.md
docs/49-ui-quality-gate-and-codex-design-rules.md
docs/50-pro-ui-production-quality-checklist.md
```

画面生成・UI実装を行う場合は、追加で以下を読むこと。

```text
docs/10-screen-design-spec.md
docs/11-design-generation-prompt.md
docs/37-visual-design-direction.md
docs/38-screen-generation-plan.md
docs/41-vampon-in-world-game-direction.md
docs/42-shared-vampon-source-policy.md
docs/45-vampon-reference-gate.md
docs/46-landscape-first-web-responsive-policy.md
docs/48-responsive-crisp-ui-system.md
docs/49-ui-quality-gate-and-codex-design-rules.md
docs/50-pro-ui-production-quality-checklist.md
docs/design-targets/generated/soro-pon-landscape-vampon-ui-v1/README.md
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
完全新規で、仕様docsを正として作ります。

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

今後の第一入口は以下です。

```text
m-shogo/vamp-pon
docs/shared-vampon-master-index.md
```

ローカル作業では以下を先に読みます。

```text
/Users/m-shogo/Developer/personal/vamp-pon/docs/shared-vampon-master-index.md
/Users/m-shogo/Developer/personal/soro-pon/docs/42-shared-vampon-source-policy.md
/Users/m-shogo/Developer/personal/soro-pon/docs/45-vampon-reference-gate.md
```

soro-pon側の参照ルールは `docs/42-shared-vampon-source-policy.md` / `docs/45-vampon-reference-gate.md` にまとめます。

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

## 採用済み横画面デザインターゲット

```text
docs/design-targets/generated/soro-pon-landscape-vampon-ui-v1/
```

この10枚を、画面ごとの差を出さないためのUI品質基準にします。

```text
01-top.png
02-deck-list.png
03-deck-detail.png
04-match-setup.png
05-deck-editor.png
06-tile-editor.png
07-match-discard-phase.png
08-match-win-or-ron-phase.png
09-result.png
10-collection.png
```

参照画像はruntime素材として直接使いません。
色、余白、紙UI、黒インク、ランタン光、横画面の情報密度の基準にします。

## 画面・向き方針

`soro-pon` は **横画面固定を正** とします。

```text
primary design reference: 844x390 landscape
actual phone landscape display: 100svw x 100svh
web: responsive layout / adaptive layout
portrait: rotate prompt or limited utility only
```

- 全主要画面はまず 844x390 landscape をデザイン基準にする
- 844x390を実寸固定キャンバスとして扱わない
- スマホ横では画面いっぱいにフィットさせる
- TOP / Deck / Editor / Result / Collection も landscape-first にする
- 過去の portrait-first 方針は使わない
- Webでは端末幅に応じて余白・折りたたみ・responsive metricsで対応する
- 画面全体を `transform: scale()` で引き伸ばさない
- 縦画面に対戦UIや編集UIを無理に詰め込まない
- Portraitでは横向き案内、またはTOP/ヘルプ等の限定表示にする
- 牌は記憶札として見せる
- 牌の外枠/ラベル/チップでカテゴリ色を見せる
- 捨て牌は全員分見える
- 山は大きく出さず、残り枚数だけ小さく表示する
- Three.jsは小さな灯り/札の浮き/インク/Result演出の補助に使う

詳細は `docs/46-landscape-first-web-responsive-policy.md` / `docs/47-mvp-implementation-final-gate.md` / `docs/48-responsive-crisp-ui-system.md` を正とします。

## 鮮明レスポンシブUI方針

UI実装では、デザインがボケないことを重視します。

```text
UI枠 / アイコン / 線 / 札枠 = SVG優先
絵 / 背景 / 紙質感 / インク汚れ = 高解像度PNG/WebP
紙パネルや手描き縁 = 必要箇所だけ9-slice
文字 = 画像に焼き込まずHTML text
重要UI寸法 = 整数pxへ丸める
```

禁止:

```text
画面全体をtransform scaleで引き伸ばす
低解像度PNGを拡大して使う
文字入り画像を量産する
必須操作をPC専用外側パネルへ逃がす
札のaspect-ratioを崩す
```

詳細は `docs/48-responsive-crisp-ui-system.md` にまとめます。

## UI品質ゲート

Codex / Claude Code / Cursor は、デザインを発明せず、決めたUIシステムを実装します。

```text
Codexはデザインを発明しない
採用済みデザインターゲット10枚をUI品質基準にする
tokens.css以外へ新しい色を勝手に追加しない
画面ごとの独自ボタン/独自パネルを作らない
UIはprimitives/components経由で実装する
Component Galleryを先に作る
UI変更時は指定サイズでスクリーンショット確認する
```

避ける見た目:

```text
白い汎用WebアプリUI
明るい量産ボードゲームUI
Material Design風
Tailwind demo風
色数が多いカードゲームUI
角丸/影/余白が画面ごとに違うUI
```

詳細は `docs/49-ui-quality-gate-and-codex-design-rules.md` にまとめます。

## プロUI量産品質チェック

UIを完成扱いする前に、状態・動き・文字・操作性・密度・性能・磨き込みを確認します。

```text
主要componentはstate matrixを持つ
motion / animationは意味がある場所だけに使う
typographyは分類とtokensで管理する
touch target / focus-visibleを守る
compact / normal / wide / desktop のdensity modeを考慮する
performance budgetを守る
polish pass checklistを通す
```

禁止:

```text
状態差分を色だけで表す
全ボタンを常時発光させる
文字サイズ/影/角丸を画面ごとに直書きする
focus-visibleを消す
compactで手牌/捨て牌/主要操作を削る
重いblur/glow/常時パーティクルを増やす
```

詳細は `docs/50-pro-ui-production-quality-checklist.md` にまとめます。

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
上がり役 = win_role = あがり判定に使う
特殊役 = special_bonus = 上がった後に加点する
スコアボーナス = ScoreBonus[] = 上がった後に加点する
```

MVPでは `score_bonus` を `Role.kind` に入れません。

ロン/ツモ判定の対象にするのは、原則として **win_roleだけ** です。

詳細は `docs/14-role-taxonomy-and-scoring.md` にまとめます。

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

拡張ルール用デッキはゼロから作らせず、通常デッキからコピーして拡張版を作る導線にします。
詳細は `docs/13-deck-variants-and-balance.md` と `docs/20-extended-role-span-and-db-policy.md` にまとめます。

## Deck Editor 方針

このゲームの主役級機能は、デッキを気持ちよく作れることです。

横画面では以下を基本にします。

```text
左: タブ / カテゴリ / 一覧
中央: 編集フォーム
右: 牌プレビュー / 警告 / ライブテスト
```

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
docs/47-mvp-implementation-final-gate.md
docs/48-responsive-crisp-ui-system.md
docs/49-ui-quality-gate-and-codex-design-rules.md
docs/50-pro-ui-production-quality-checklist.md
```

実装開始時はこの6つを正とします。

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
- [Vamp-pon Character Generation Gate](docs/44-vampon-character-generation-gate.md)
- [Vamp-pon Reference Gate](docs/45-vampon-reference-gate.md)
- [Landscape-first Web Responsive Policy](docs/46-landscape-first-web-responsive-policy.md)
- [MVP Implementation Final Gate](docs/47-mvp-implementation-final-gate.md)
- [Responsive Crisp UI System](docs/48-responsive-crisp-ui-system.md)
- [UI Quality Gate and Codex Design Rules](docs/49-ui-quality-gate-and-codex-design-rules.md)
- [Pro UI Production Quality Checklist](docs/50-pro-ui-production-quality-checklist.md)

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
