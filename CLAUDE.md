# CLAUDE.md

Claude Code向けの作業指示。

## Read First

作業前に必ず読む。

```text
README.md
AGENTS.md
docs/34-mvp-implementation-prompt.md
docs/35-mvp-test-cases.md
docs/47-mvp-implementation-final-gate.md
```

画面/UI/世界観を扱う場合は追加で必ず読む。

```text
docs/10-screen-design-spec.md
docs/37-visual-design-direction.md
docs/38-screen-generation-plan.md
docs/45-vampon-reference-gate.md
docs/46-landscape-first-web-responsive-policy.md
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
実装は TypeScript + React + Vite + Zod + Vitest で進める。
最初は UI ではなく domain / schema / engine / tests を固める。
```

## Fixed Orientation

```text
soro-ponは横画面固定が正
All main screens: 844x390 landscape-first
Web: responsive scale / adaptive layout
Portrait: rotate prompt or limited utility only
```

過去の `TOP / Editor / Result / Collection は portrait-first` 方針は使わない。

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
RuleConfig.supportedPlayerCounts で3/4人対応する
minPlayers / maxPlayers はMVPでは使わない
ポン/カン/チーを作らない
Role.kind は win_role / special_bonus のみ
score_bonus は Role.kind に入れず ScoreBonus[] で扱う
special_bonus / ScoreBonus[] をロン候補にしない
オールマイティを毎回クリック選択式にしない
コインで強さを買わせない
全主要画面を844x390 landscape-firstで設計する
縦画面に本UIを無理に詰めない
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
