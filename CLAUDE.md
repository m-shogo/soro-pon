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
docs/48-responsive-crisp-ui-system.md
docs/49-ui-quality-gate-and-codex-design-rules.md
```

画面/UI/世界観を扱う場合は追加で必ず読む。

```text
docs/10-screen-design-spec.md
docs/37-visual-design-direction.md
docs/38-screen-generation-plan.md
docs/45-vampon-reference-gate.md
docs/46-landscape-first-web-responsive-policy.md
docs/48-responsive-crisp-ui-system.md
docs/49-ui-quality-gate-and-codex-design-rules.md
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

## UI Quality Gate

UI実装時は `docs/49-ui-quality-gate-and-codex-design-rules.md` を正とする。

```text
Claude Codeはデザインを発明しない
採用済みデザインターゲット10枚をUI品質基準にする
tokens.css以外へ新しい色を勝手に追加しない
画面ごとの独自ボタン/独自パネルを作らない
UIはprimitives/components経由で実装する
Component Galleryを先に作る
UI変更時は指定サイズでスクリーンショット確認する
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
RuleConfig.supportedPlayerCounts で3/4人対応する
minPlayers / maxPlayers はMVPでは使わない
ポン/カン/チーを作らない
Role.kind は win_role / special_bonus のみ
score_bonus は Role.kind に入れず ScoreBonus[] で扱う
special_bonus / ScoreBonus[] をロン候補にしない
オールマイティを毎回クリック選択式にしない
コインで強さを買わせない
全主要画面を844x390 landscape基準で設計する
844x390は実寸固定キャンバスとして扱わない
スマホ横では100svw x 100svhへフィットさせる
画面全体をtransform scaleで引き伸ばさない
UI枠/アイコン/線/札枠はSVG優先
絵/背景/紙質感/インク汚れは高解像度PNG/WebP
文字は画像に焼き込まない
重要UI寸法は整数pxへ丸める
必要箇所だけ9-sliceを使う
Codex/Claude Codeはデザインを発明しない
tokens.css以外へ新しい色を勝手に追加しない
画面ごとの独自ボタン/独自パネルを作らない
UIはprimitives/components経由で実装する
Component Galleryを先に作る
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
15. UI foundation: tokens / primitives / responsive metrics / Component Gallery
16. Deck Editor UI
17. Match UI
18. Result / Collection UI
```

## Validation

作業後は最低限以下を実行する。

```text
npm test
npm run build
```

まだscriptが存在しない段階では、その理由と次に追加するscriptを報告する。

UI変更時は `docs/49-ui-quality-gate-and-codex-design-rules.md` のスクリーンショット確認サイズも報告する。

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
