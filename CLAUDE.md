# CLAUDE.md

Claude Code向けの作業指示。

## Read First

作業前に必ず読む。

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

詳細仕様が必要な場合は、AGENTS.mdのMust Readを順に確認する。

## Current Status

```text
MVP実装準備完了。
実装は TypeScript + React + Vite + Zod + Vitest で進める。
```

## Role

Claude Codeは、主に以下を担当する。

```text
仕様整合性レビュー
実装計画
小さいコミット単位の実装
リファクタリング
テスト追加
破綻チェック
```

## Absolute Rules

```text
旧repoや過去実装を参考にしない
既存IPデータをsrc/public/docs/README/公式サンプルへ入れない
共有JSONに画像情報を入れない
2人戦を作らない
ポン/カン/チーを作らない
special_bonus / score_bonus をロン候補にしない
オールマイティを毎回クリック選択式にしない
コインで強さを買わせない
Vamp-pon側は読み取り専用
世界観を扱う時はVamp-pon shared master indexを読む
```

## Implementation Stack

```text
TypeScript
React
Vite
Zod
Vitest
通常CSSまたはCSS Modules
localStorage
```

MVP初期では使わない。

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

## Implementation Order

```text
1. Vite + React + TypeScript setup
2. domain型定義
3. Zod schema
4. animal-starter parse test
5. DeckProject / variant model
6. role evaluation engine
7. wildcard assignment
8. scoring / MatchResult
9. deck validation
10. progression model
11. match flow
12. CPU minimum strategy
13. localStorage
14. JSON import/export
15. Deck Editor UI
16. Match UI
17. Result / Collection UI
```

## Validation

作業後は最低限以下を実行する。

```text
npm test
npm run build
```

まだscriptが存在しない段階では、その理由と次に追加するscriptを報告する。

## Reporting

作業後の報告形式。

```text
変更ファイル
コミットSHA
実装範囲
検証結果
未対応範囲
次にやるべきこと
```
