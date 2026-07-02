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
- 捨てられたオールマイティでロンは原則不可
- 共有JSONに画像情報を入れない
- 既存IPデータをsrc/public/docs/README/公式サンプル/公式スクショへ入れない
- 全主要画面は 844x390 landscape-first
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
10. progression model
11. match flow
12. CPU minimum strategy
13. localStorage保存
14. JSON import/export
15. Deck List / Deck Detail
16. Deck Editor 最小版
17. Match Setup
18. Match Landscape UI
19. Result UI
20. Collection / Clear Board 最小版

コミット方針:

- 1コミット1目的
- 小さく進める
- まず型/Zod/エンジン/テストを優先
- UIは型とルールエンジンが通ってから

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
- test cases

Phase 3:
- localStorage
- Deck List
- Deck Detail
- Match Setup
- Result minimal

Phase 4:
- Deck Editor minimal
- category color preview
- role template builder minimal
- balance check

Phase 5:
- Match UI
- CPU
- Result progression
- Collection minimal

検証:

- npm test
- npm run build
- animal starter deckをZod parseできる
- normal variantで9枚手札のwin_role判定ができる
- extended variantで2/3/10/13/14枚役の判定ができる
- special_bonusだけではロンできない
- ScoreBonus[]だけではロンできない
- wildcardを使った上がりがResultに表示される
- shared JSONに画像fieldが入っていたら拒否する
- supportedPlayerCounts が [3, 4] でparseできる
- 2人戦を開始できない

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
