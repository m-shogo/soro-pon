# MVP Implementation Prompt

## Purpose

Claude Code / Codex / Cursor にMVP実装を依頼するためのプロンプト。

## Prompt

```text
このrepoは m-shogo/soro-pon です。
旧repoや過去実装は参考にしないでください。
完全新規で、仕様docsを正として実装してください。

最初に必ず以下を読んでください。

- README.md
- AGENTS.md
- docs/02-game-rules.md
- docs/03-data-model.md
- docs/14-role-taxonomy-and-scoring.md
- docs/15-wildcard-rules.md
- docs/17-screen-actions-and-requirements.md
- docs/19-fixed-mvp-decisions.md
- docs/22-wildcard-ux-and-mahjong-feel.md
- docs/23-deck-editor-ux-and-category-colors.md
- docs/24-scoring-and-payment.md
- docs/25-role-evaluation-engine.md
- docs/26-deck-validation-and-balance-rules.md
- docs/27-cpu-minimum-strategy-and-match-flow.md
- docs/28-release-safety-checklist.md
- docs/29-result-progression-collection.md
- docs/30-first-run-and-playtest-loop.md
- docs/31-implementation-stack-decision.md
- docs/32-zod-schema-spec.md
- docs/33-official-animal-starter-deck.md
- docs/35-mvp-test-cases.md
- docs/37-visual-design-direction.md
- docs/38-screen-generation-plan.md
- docs/46-landscape-first-web-responsive-policy.md
- docs/47-mvp-implementation-final-gate.md
- docs/48-responsive-crisp-ui-system.md
- docs/49-ui-quality-gate-and-codex-design-rules.md
- docs/50-pro-ui-production-quality-checklist.md
- docs/51-role-analysis-and-game-feel-ux.md
- docs/52-role-analysis-test-minimum.md

画面/UI実装に入る場合は、追加で以下を必ず参照してください。

- docs/10-screen-design-spec.md
- docs/11-design-generation-prompt.md
- docs/design-targets/generated/soro-pon-landscape-vampon-ui-v1/README.md
- docs/design-targets/generated/soro-pon-landscape-vampon-ui-v1/01-top.png
- docs/design-targets/generated/soro-pon-landscape-vampon-ui-v1/02-deck-list.png
- docs/design-targets/generated/soro-pon-landscape-vampon-ui-v1/03-deck-detail.png
- docs/design-targets/generated/soro-pon-landscape-vampon-ui-v1/04-match-setup.png
- docs/design-targets/generated/soro-pon-landscape-vampon-ui-v1/05-deck-editor.png
- docs/design-targets/generated/soro-pon-landscape-vampon-ui-v1/06-tile-editor.png
- docs/design-targets/generated/soro-pon-landscape-vampon-ui-v1/07-match-discard-phase.png
- docs/design-targets/generated/soro-pon-landscape-vampon-ui-v1/08-match-win-or-ron-phase.png
- docs/design-targets/generated/soro-pon-landscape-vampon-ui-v1/09-result.png
- docs/design-targets/generated/soro-pon-landscape-vampon-ui-v1/10-collection.png

実装スタックは以下で固定です。

- TypeScript
- React
- Vite
- Zod
- Vitest
- 通常CSSまたはCSS Modules
- localStorage

Next.js、Supabase、Firebase、Unity、Godot、Phaser、Redux、Zustand、TanStack Query、TailwindはMVP初期では入れないでください。

絶対ルール:

- 3〜4人用
- 2人戦なし
- RuleConfig.supportedPlayerCounts で 3/4 人対応を表す
- minPlayers / maxPlayers はMVPでは使わない
- 通常版は8枚手牌、引いて9枚
- 拡張版は13枚手牌、引いて14枚
- ポン/カン/チーなし
- Role.kind は win_role / special_bonus のみ
- score_bonus は Role.kind に入れず、ScoreBonus[] で扱う
- ロン/ツモ判定はwin_roleのみ
- special_bonusとscoreBonusesはロン候補にしない
- オールマイティは基本自動割当
- オールマイティは候補ごとに別々に解析する
- MVP標準では1つのwin_roleに使えるオールマイティは最大1枚
- 捨てられたオールマイティでロンは原則不可
- 手札の並び順は役判定に影響させない
- ユーザーの狙いを1つに決め打ちしない
- 候補は全探索し completed / tenpai / near / bonusOnly / invalidButExplainable に分類する
- UIは「狙っています」と断定しない
- 共有JSONに画像情報を入れない
- 既存IPデータをsrc/public/docs/README/公式サンプル/公式スクショへ入れない
- 全主要画面は 844x390 landscape-first をデザイン基準にする
- 844x390を実寸固定キャンバスとして扱わない
- スマホ横では100svw x 100svhへフィットさせる
- 画面全体をtransform scaleで引き伸ばさない
- UI枠/アイコン/線/札枠はSVG優先
- 絵/背景/紙質感/インク汚れは高解像度PNG/WebP
- 文字は画像に焼き込まずHTML textで描画する
- 重要UI寸法は整数pxへ丸める
- 紙パネルや手描き縁が必要な箇所だけ9-sliceを使う
- Codexはデザインを発明しない
- 採用済みデザインターゲット10枚をUI品質基準にする
- tokens.css以外へ新しい色を勝手に追加しない
- 画面ごとの独自ボタン/独自パネルを作らない
- UIはprimitives/components経由で実装する
- Component Galleryを先に作る
- 主要componentはstate matrixを持つ
- motion / animationは意味がある場所だけに使う
- typographyは分類とtokensで管理する
- touch target / focus-visibleを守る
- compact / normal / wide / desktop のdensity modeを考慮する
- performance budgetを守る
- polish pass checklistを通す
- UI変更時は指定サイズでスクリーンショット確認する
- portraitはrotate promptまたは限定utilityのみ

実装順序:

1. Vite + React + TypeScriptの最小構成
2. domain型定義
3. Zod schema
4. samples/animal-starter.deck.json の読み込み
5. DeckProject / variant model
6. role evaluation engine
7. wildcard assignment
8. scoring / MatchResult
9. deck validation
10. role analysis: HandAnalyzer / WaitAnalyzer / IntentRanker / ExplainEngine / HandSorter
11. progression model
12. match flow
13. CPU minimum strategy
14. localStorage保存
15. JSON import/export
16. UI foundation: tokens / primitives / responsive metrics / Component Gallery / state matrix
17. Deck List / Deck Detail
18. Deck Editor 最小版
19. Match Setup
20. Match Landscape UI
21. Result UI
22. Collection / Clear Board 最小版
23. screenshot review / polish pass / performance check

コミット方針:

- 1コミット1目的
- 小さく進める
- まず型/Zod/エンジン/テストを優先
- UIは型とルールエンジンが通ってから
- UI実装はComponent Galleryを通してから各画面へ進める

最初のPRまたは作業単位:

Phase 1:
- package.json
- Vite React TS setup
- src/domain/*
- src/schemas/*
- samples/animal-starter.deck.json parse test
- Vitest setup

Phase 2:
- evaluateHand
- wildcard assignment
- scoring
- deck validation
- role analysis candidate classification
- wait analysis
- explanation payloads
- hand sorting proposal
- test cases

Phase 3:
- localStorage
- Deck List
- Deck Detail
- Match Setup
- Result minimal

Phase 4:
- UI foundation
- tokens.css
- responsive metrics
- primitives/components
- Component Gallery
- state matrix

Phase 5:
- Deck Editor minimal
- category color preview
- role template builder minimal
- balance check

Phase 6:
- Match UI
- CPU
- Result progression
- Collection minimal
- screenshot review
- polish pass

検証:

- npm test
- npm run build
- animal starter deckをZod parseできる
- normal variantで9枚手札のwin_role判定ができる
- extended variantで2/3/10/13/14枚役の判定ができる
- special_bonusだけではロンできない
- ScoreBonus[]だけではロンできない
- wildcardを使った上がりがResultに表示される
- 手札順を入れ替えても役判定結果が変わらない
- オールマイティ2枚保持時も1win_role最大1枚制限を守る
- candidate state が completed / tenpai / near / bonusOnly / invalidButExplainable に分かれる
- WaitAnalyzer が具体的な不足条件を返す
- ExplainEngine が成立理由/未成立理由を返す
- shared JSONに画像fieldが入っていたら拒否する
- supportedPlayerCounts が [3, 4] でparseできる
- 2人戦を開始できない
- UI変更時は 844x390 / 932x430 / 852x393 / 1024x600 / 1366x768 でスクリーンショット確認する
- UI変更時はstate / motion / typography / touch target / density / performance / polish passを報告する

作業後は以下を報告してください。

- 変更ファイル
- コミットSHA
- 実装した範囲
- 実行した検証
- 未対応範囲
```

## Final Decision

このプロンプトをMVP実装開始時の正とする。

古いdocsと迷った場合は `docs/47-mvp-implementation-final-gate.md` を優先する。

UIのレスポンシブ・鮮明さ・9-slice/SVG/PNG/WebP使い分けで迷った場合は `docs/48-responsive-crisp-ui-system.md` を優先する。

UI品質・Codexのデザイン境界・ダサくならないための実装制約で迷った場合は `docs/49-ui-quality-gate-and-codex-design-rules.md` を優先する。

UIの状態・motion・typography・touch target・density・performance・polishで迷った場合は `docs/50-pro-ui-production-quality-checklist.md` を優先する。

役解析・待ち表示・オールマイティ・候補ランキング・手札整理・説明UXで迷った場合は `docs/51-role-analysis-and-game-feel-ux.md` と `docs/52-role-analysis-test-minimum.md` を優先する。
