# CODEX.md

Codex向けの作業指示。

## Read First

```text
README.md
AGENTS.md
docs/34-mvp-implementation-prompt.md
docs/35-mvp-test-cases.md
docs/47-mvp-implementation-final-gate.md
docs/48-responsive-crisp-ui-system.md
```

画面/UI/世界観を扱う場合は追加で必ず読む。

```text
docs/10-screen-design-spec.md
docs/37-visual-design-direction.md
docs/38-screen-generation-plan.md
docs/45-vampon-reference-gate.md
docs/46-landscape-first-web-responsive-policy.md
docs/48-responsive-crisp-ui-system.md
docs/design-targets/generated/soro-pon-landscape-vampon-ui-v1/README.md
```

世界観・キャラ・敵・ステージ・武器・アイテム・ビジュアルルールを扱う場合は、必ず先に以下を読む。

```text
/Users/m-shogo/Developer/personal/vamp-pon/docs/shared-vampon-master-index.md
/Users/m-shogo/Developer/personal/soro-pon/docs/42-shared-vampon-source-policy.md
/Users/m-shogo/Developer/personal/soro-pon/docs/45-vampon-reference-gate.md
```

作業対象は `soro-pon`。`vamp-pon` 側は読み取り専用。`vamp-pon` 側を変更しない。

## Current Status

```text
MVP Phase 1 実装開始可能。
最初は UI ではなく domain / schema / engine / tests を固める。
```

## Fixed Orientation

```text
soro-ponは横画面固定が正
All main screens: 844x390 landscape design reference
Phone landscape: 100svw x 100svh
Web: responsive layout / adaptive layout
Portrait: rotate prompt or limited utility only
```

過去の `TOP / Editor / Result / Collection は portrait-first` 方針は使わない。
844x390は実寸固定キャンバスではなく、デザイン基準として扱う。
画面全体を `transform: scale()` で引き伸ばさない。

## Crisp Responsive UI

UI実装時は `docs/48-responsive-crisp-ui-system.md` を正とする。

```text
UI枠/アイコン/線/札枠はSVG優先
絵/背景/紙質感/インク汚れは高解像度PNG/WebP
文字は画像に焼き込まずHTML textで描画
重要UI寸法は整数pxへ丸める
紙パネルや手描き縁が必要な箇所だけ9-slice
PCでは中央ゲーム卓 + 外側補助/夜机背景
必須UIはゲーム卓内に置く
```

## Best Use of Codex

Codexは主に以下を担当する。

```text
TypeScript実装
Zod schema実装
Vitestテスト追加
純粋関数のルールエンジン実装
小さなUIコンポーネント実装
差分レビュー
```

## Fixed Stack

```text
TypeScript + React + Vite + Zod + Vitest
```

MVP初期では以下を入れない。

```text
Next.js
Unity
Godot
Phaser
Supabase
Firebase
Redux
Zustand
TanStack Query
Tailwind
```

## Do Not Change Rules

```text
3〜4人用
2人戦なし
RuleConfig.supportedPlayerCounts で3/4人対応
minPlayers / maxPlayers はMVPでは使わない
通常版は8枚手牌、引いて9枚
拡張版は13枚手牌、引いて14枚
ポン/カン/チーなし
Role.kind は win_role / special_bonus のみ
score_bonus は Role.kind に入れず ScoreBonus[] で扱う
ロン/ツモ判定はwin_roleのみ
special_bonus / ScoreBonus[] はロン候補にしない
全主要画面を844x390 landscape基準で設計する
844x390は実寸固定キャンバスとして扱わない
スマホ横では100svw x 100svhへフィットさせる
画面全体をtransform scaleで引き伸ばさない
UI枠/アイコン/線/札枠はSVG優先
絵/背景/紙質感/インク汚れは高解像度PNG/WebP
文字は画像に焼き込まない
重要UI寸法は整数pxへ丸める
必要箇所だけ9-sliceを使う
縦画面に本UIを無理に詰めない
Vamp-pon側は読み取り専用
世界観を扱う時はVamp-pon shared master indexを読む
```

## First Implementation Target

最初の実装単位はこれ。

```text
package.json
Vite React TS setup
src/domain/*
src/schemas/*
samples/animal-starter.deck.json parse test
Vitest setup
```

## Validation

```text
npm test
npm run build
```

## Report

作業後は以下を報告する。

```text
変更ファイル
コミットSHA
実行した検証
残タスク
```
