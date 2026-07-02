# CODEX.md

Codex向けの作業指示。

## Read First

```text
README.md
AGENTS.md
docs/34-mvp-implementation-prompt.md
docs/35-mvp-test-cases.md
```

世界観・キャラ・敵・ステージ・武器・アイテム・ビジュアルルールを扱う場合は、必ず先に以下を読む。

```text
/Users/m-shogo/Developer/personal/vamp-pon/docs/shared-vampon-master-index.md
/Users/m-shogo/Developer/personal/soro-pon/docs/42-shared-vampon-source-policy.md
```

作業対象は `soro-pon`。`vamp-pon` 側は読み取り専用。`vamp-pon` 側を変更しない。

## Current Status

```text
MVP実装準備完了。
仕様docsは整備済み。
実装は小さいコミットで進める。
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
通常版は8枚手牌、引いて9枚
拡張版は13枚手牌、引いて14枚
ポン/カン/チーなし
ロン/ツモ判定はwin_roleのみ
special_bonus/score_bonusはロン候補にしない
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
