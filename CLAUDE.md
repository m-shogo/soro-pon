# CLAUDE.md

Claude Code向けの作業指示。

## Read First

作業前に必ず読む。

```text
README.md
AGENTS.md
docs/MASTER-SPEC.md
docs/IMPLEMENTATION.md
docs/README.md
```

`docs/MASTER-SPEC.md` が現在仕様の正本。

番号付きdocs・古い実装プロンプト・過去案と衝突した場合は、`docs/MASTER-SPEC.md` を優先する。

## Current Status

```text
MVP Phase 1 実装開始可能。
実装は TypeScript + React + Vite + Zod + Vitest。
最初は UI ではなく domain / schema / engine / tests を固める。
```

## Implementation Order

実装順は `docs/IMPLEMENTATION.md` を正とする。

```text
schema -> validation -> engine -> insights -> UI
```

Full Match UI は、`docs/MASTER-SPEC.md` と `docs/IMPLEMENTATION.md` の hard block を満たすまで開始しない。

## UI / Design Read

画面/UIを扱う場合は追加で必ず読む。

```text
docs/48-responsive-crisp-ui-system.md
docs/49-ui-quality-gate-and-codex-design-rules.md
docs/50-pro-ui-production-quality-checklist.md
docs/design-targets/generated/soro-pon-landscape-vampon-ui-v1/README.md
```

Claude Codeはデザインを発明しない。

```text
採用済みデザインターゲット10枚をUI品質基準にする
tokens.css以外へ新しい色を勝手に追加しない
画面ごとの独自ボタン/独自パネルを作らない
UIはprimitives/components経由で実装する
Component Galleryを先に作る
```

## Mandatory Vamp-pon World Read

世界観・キャラ・敵・ステージ・武器・アイテム・ビジュアルルールを扱う場合は、必ず先に以下を読む。

```text
/Users/m-shogo/Developer/personal/vamp-pon/docs/shared-vampon-master-index.md
/Users/m-shogo/Developer/personal/soro-pon/docs/42-shared-vampon-source-policy.md
/Users/m-shogo/Developer/personal/soro-pon/docs/45-vampon-reference-gate.md
```

作業対象は `soro-pon`。

```text
vamp-pon 側は読み取り専用
vamp-pon 側を変更しない
Vamp-pon設定をsoro-pon側へ丸コピーしない
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

## Fixed Stack

```text
TypeScript
React
Vite
Zod
Vitest
CSS / CSS Modules
localStorage first
```

MVP初期では以下を入れない。

```text
Next.js
Supabase
Firebase
Unity
Godot
Phaser
Redux
Zustand
TanStack Query
Tailwind
```

## Report

作業後は以下を報告する。

```text
変更ファイル
コミットSHA
実行した検証
残タスク
```
