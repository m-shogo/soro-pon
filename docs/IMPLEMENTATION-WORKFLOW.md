# Implementation Workflow

## Purpose

MVP完成までの実装ワークフローと現在地を1枚で管理する。

実装順の正本は `docs/IMPLEMENTATION.md`。
このファイルは「今どこまで終わっていて、次に何をやり、何が終われば完成か」を追跡する。

各Phaseの完了条件は「テスト・typecheck・buildが全て通り、コミットされている」こと。

## Current Status

```text
Phase 1-11: 完了(Phase 11はCollection画面と磨き込みをPhase 12へ持ち越し)
Phase 12: 進行中
```

| Phase | 内容 | 状態 | 完了コミット |
|---|---|---|---|
| 1 | package setup (Vite/React/TS/Zod/Vitest, pnpm) | 完了 | 3a50861 |
| 2 | domain型 + strict Zodスキーマ + parseテスト | 完了 | 0a64f59 |
| 3 | strict import + unsafe key scan + deck validation + fixtures | 完了 | 4663167 |
| 4 | group engine (enumerate / partition / wildcard) | 完了 | cd2d7db |
| 5 | role analysis (matchRole / analyzeHand / waits / ranking) | 完了 | caca9cd |
| 6 | scoring (tsumo / ron / selectedWinRole / breakdown) | 完了 | 1ad7dec |
| 7 | insights + discard preview (純関数) | 完了 | 4eea582 |
| 8 | match reducer + CPU + seeded RNG(フル対局シミュレーション込み) | 完了 | 1efe9fd |
| 9 | storage (localStorage schema parse / recovery) | 完了 | 8aa22c7 |
| 10 | UI foundation (tokens / asset slot方式 / Component Gallery) | 完了 | 452b54f |
| 11 | screens (TOP / Deck List / Detail / Editor最小 / Setup / Match / Result) | 完了 | 5645471 |
| 12 | Collection / アセット統合 / 磨き込み / QA / release gate | 進行中 | - |

Phase 10で確定した追加契約:

```text
UIはasset slot方式必須(画像パス直書き禁止)
slot一覧: public/assets/ui/soro-pon/asset-slots.json + ASSET-MANIFEST.md
PNG未作成時はCSS/SVG fallbackで全操作可能
差し替えはgenerated/final/配置 + manifest更新のみ(DOM/ロジック不変)
```

## Verification Commands

各Phase完了時に必ず実行する。

```text
pnpm typecheck
pnpm test
pnpm build
```

## Phase 4: Group Engine

Read: docs/62, docs/63, docs/ENGINE-API.md, docs/PERFORMANCE-GUARDRAILS.md

作るもの:

```text
src/engine/rng/createSeededRng.ts
src/engine/tiles/createTileInstances.ts
src/engine/groups/enumerateGroups.ts
src/engine/groups/partitionHand.ts
src/engine/wildcards/resolveWildcards.ts
```

Gate(テスト):

```text
sameTile/sameCategory/sameTag/specificSet/freeSet group検出
wildcard補完group検出(1group最大1枚)
9枚 -> 3group分割 / 全instance重複なし使用
8枚・10枚はcompleted winにならない
partition cap時にP8001系warning
```

## Phase 5: Role Analysis

Read: docs/63, docs/66, docs/ENGINE-API.md

作るもの:

```text
src/engine/roles/matchRole.ts
src/engine/analysis/analyzeHand.ts
src/engine/analysis/analyzeWaits.ts
src/engine/analysis/rankCandidates.ts
src/engine/analysis/explainCandidate.ts
```

Gate(テスト):

```text
completed/tenpai/near/bonusOnly/invalidButExplainable分類
primaryCandidates <= 3 / hiddenCandidateCount
wait: 不完全group + 埋める条件(tile/category/tag/wildcard)
WaitContext 3種
手牌順序に依存しない結果
決定的ranking
```

## Phase 6: Scoring

Read: docs/62, docs/70, docs/72

作るもの:

```text
src/engine/scoring/calculateScore.ts
```

Gate(テスト):

```text
tsumo=draw後9枚 / ron=8枚+捨て牌
selectedWinRole tie-break(点数->wildcard少->自然group->priority->deck順)
複数win_roleのbasePoints非スタック
special_bonus/ScoreBonus単体であがれない
捨てwildcardロンはデフォルト不可
scoreBudget警告 / ResultBreakdown内訳
```

## Phase 7: Insights / Discard Preview

Read: docs/53, docs/66 (9章), docs/ENGINE-API.md

作るもの:

```text
src/engine/analysis/analyzeDiscardImpact.ts
src/engine/analysis/buildBoardInsights.ts
```

Gate(テスト):

```text
previewはmatch stateを変更しない(purity)
breaks/keeps/unused facts
insightにbest/correct/should系の文言なし
beginner/normal/advanced圧縮
```

## Phase 8: Match Reducer + CPU

Read: docs/MATCH-STATE-MACHINE.md, docs/27

作るもの:

```text
src/engine/match/createInitialMatchState.ts
src/engine/match/applyMatchAction.ts
src/engine/cpu/chooseCpuAction.ts
```

Gate(テスト):

```text
setup->deal->turnStart->draw->afterDrawAction->discardSelect->reactionRon->turnEnd happy path
invalid actionはok:falseで元stateを返す
2人戦はE7005
ron席順 / 全員パス / 山切れ流局
CPU: ツモ>ロン>寄せ>ランダム(seed付き決定的)
CPUは相手の手牌を見ない
```

## Phase 9: Storage

Read: docs/MIGRATIONS.md, docs/THREAT-MODEL.md

作るもの:

```text
src/storage/localStorageDeckStore.ts
src/storage/localStorageSettingsStore.ts
src/storage/recovery.ts
```

Gate(テスト):

```text
読み込みは必ずZod parse経由
corrupt localStorageで起動が壊れない(L9001回復)
共有exportにローカル画像なし
```

## Phase 10: UI Foundation

Read必須: docs/48, docs/49, docs/50, docs/DESIGN-IMPLEMENTATION-POLICY.md, docs/ASSET-PIPELINE.md, design-targets README

作るもの:

```text
src/ui/styles/tokens.css
src/ui/layout/useResponsiveMetrics.ts
src/ui/primitives/*
src/ui/components/*
src/ui/gallery/ComponentGallery.tsx
```

Gate:

```text
tokens.css以外の新色なし
Component Galleryに全state matrix(default/hover/active/selected/focused/disabled)
Full Match UIハードブロック解除条件(MASTER-SPEC)を全て満たしている
844x390/932x430/852x393/1024x600/1366x768 スクリーンショットレビュー
portrait rotate prompt
```

## Phase 11: Screens

順序:

```text
Deck List -> Deck Detail -> Deck Editor minimal -> Match Setup -> Match UI -> Result -> Collection(最小)
```

Gate:

```text
UIは役判定/点数計算/wildcard割当をしない(engine出力のみ描画)
gameplay stateの変更はapplyMatchAction経由のみ
design target 10枚との構図/余白/雰囲気比較
fact-not-advice UX(MASTER-SPEC UX Rules)
```

## Phase 12: Polish / QA / Release

やること:

```text
1. アセットリクエスト作成(docs/asset-requests/、不足分はCSS/SVG fallbackで先に完成)
2. アセット統合 + public/assets/ASSET-MANIFEST.md更新
3. モーション磨き込み(CSS transform/light、reduced-motion対応)
4. Three.js導入判断(必要ならADR + UI隔離 + fallback。不要ならCSSのまま)
5. CI追加(.github/workflows: install/typecheck/test/build、CI-GATES.md準拠)
6. docs/MANUAL-QA.md の手動QA実施
7. docs/ACCEPTANCE-CRITERIA.md 突き合わせ
8. docs/RELEASE-DEMO-GATES.md のdemo gate確認
```

完成の定義(MVP "完璧" の条件):

```text
全自動テストgreen + typecheck + build
animal starterで3人/4人対局が最後まで破綻なく遊べる(ツモ/ロン/流局)
カスタムデッキ作成->検証->対局->結果が一連で動く
不正JSON/破損localStorageでもクラッシュしない
横画面5サイズでレイアウト破綻なし
MANUAL-QA / ACCEPTANCE-CRITERIA / RELEASE-DEMO-GATES 全通過
```

## Manual QA Report (Phase 12)

```text
Date: 2026-07-09
Commit: 7d31224
Browser/device: Chromium (Claude Preview) / macOS
Viewport: 844x390 / 852x393 / 932x430 / 1024x600 / 1366x768
```

Passed:

```text
TOP -> 対局設定 -> 対局 -> Result の一連フロー(ブラウザ実機)
牌選択 -> 捨てる -> CPU2人の手番 -> 自分の番のループ
Result: 勝者/選択役/3グループ/ボーナス内訳/獲得コイン表示
記憶帳: コイン/あがった役/高得点Top10/最近の記録
デッキ一覧 -> 詳細(検証結果表示) -> 編集
エディタ: タブ(基本/カテゴリ/牌/役)、テンプレート役追加、live検証(R4007即検出)
未保存離脱の確認ダイアログ(U9502)
unsafe JSON importのUI拒否(I2004コード表示)
schema不正デッキの保存ブロック(store全消し防止)
縦画面でrotate prompt
844x390/852x393でレイアウト・可読性・タップ性OK
932x430/1024x600はDOMメトリクスでshellフィル確認(スクショツールのキャプチャ領域は要再確認)
1366x768で間延びなし
```

Known issues / 未対応:

```text
specificSetテンプレートは未提供(役エディタは3テンプレートのみ)
special_bonus / scoreBonusのエディタ編集は未対応(import/公式デッキ経由のみ)
クリアボード(実績25マス)/称号は未実装(docs/29のMVP項目、次フェーズ)
アセットは全slot placeholder(CSS/SVG fallback)。リクエストはdocs/asset-requests/に5件
Result count-up演出などのモーション磨き込みは未着手
```

Decision: pass(MVPコアフロー成立。上記known issuesは次の磨き込みへ)

## Standing Rules

```text
1コミット1目的 / テストが通る単位で区切る
コミット後にpush
docsと実装がズレたらdocsも同時更新
仕様の大変更は先にADR
エンジンにMath.random/Date.now/React/DOM/localStorageを入れない
UIにルールロジックを入れない
```

## Deviation Log

実装中に確定した仕様補完(docs更新済み):

```text
tile.tags を許可フィールドに追加(sameTag役に必要) -> docs/74更新済み
エラーコード追加: I2010(JSON深すぎ), V3010(ID重複), V3011(牌名重複), V3012(牌のカテゴリ参照不整合) -> docs/ERROR-CODES.md更新済み
schemaのwinRolesはmin 0(拡張variantの空配列を許可)、V3001でvalidationが1個以上を強制(docs/65のmin 1はvariant共通schemaとしてはサンプルと矛盾するため)
DeckValidationStatus: 構造的に遊べない(V3003/E7008)はblocked、内容エラーはdraft
R4010追加: 通常win_roleのrequiredGroups合計はちょうど3グループ必須(docs/68のblocking条件を明文化) -> docs/ERROR-CODES.md更新済み
```
