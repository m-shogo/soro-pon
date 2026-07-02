# CODEX.md

Codex向けの作業指示。

## Read First

```text
README.md
AGENTS.md
docs/34-mvp-implementation-prompt.md
docs/35-mvp-test-cases.md
```

画面/UI/世界観を扱う場合は追加で必ず読む。

```text
docs/10-screen-design-spec.md
docs/37-visual-design-direction.md
docs/38-screen-generation-plan.md
docs/45-vampon-reference-gate.md
docs/46-landscape-first-web-responsive-policy.md
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
MVP実装準備完了。
仕様docsは整備済み。
実装は小さいコミットで進める。
```

## Fixed Orientation

```text
soro-ponは横画面固定が正
All main screens: 844x390 landscape-first
Web: responsive scale / adaptive layout
Portrait: rotate prompt or limited utility only
```

過去の `TOP / Editor / Result / Collection は portrait-first` 方針は使わない。

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
通常版は8枚手牌、引いて9枚
拡張版は13枚手牌、引いて14枚
ポン/カン/チーなし
ロン/ツモ判定はwin_roleのみ
special_bonus/score_bonusはロン候補にしない
全主要画面を844x390 landscape-firstで設計する
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
