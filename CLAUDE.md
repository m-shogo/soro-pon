# CLAUDE.md

Claude Code向けの作業指示。

## Current Status

```text
Gameplay MVP phases 1-14: complete
Multi-skin runtime baseline: complete
Skin foundation hardening H1-H11: complete
  (H6 render-mode追加は必要性が証明されたときのみ / visual regressionは
  Playwright 32ケース・5サイズ・両スキンで実装済み)
All P0/P1/P2 gates: passed
Image production pipeline: 稼働中・実証済み(request 007 closed)
Official skins: yorunoshirube / cute-pop
  (cute-pop final資産9件・v5 / yorunoshirube final資産9件・v4)
Current phase: 公式アセット生産(candidates -> 人のレビュー -> final)。
  正本ロードマップ: docs/ASSET-PRODUCTION-ROADMAP.md
  (slot分類・バッチ順・次タスク)。着手前にdocs/ASSET-PIPELINE.md、
  docs/IMAGE-ASSET-WORKFLOW.md、docs/SKIN-DISTRIBUTION.mdも読むこと
R1(request 008/009: cute-pop牌表/牌裏/primary CTA)は完了(2026-07-16)。
  round 1(A/B/C)は人間レビューで全却下(CSS再現可能なデザインのため)。
  round 2(D/E/F、画像生成でしか実現できない質感)からtile.face.base:D
  (アイシングクッキー枠)/tile.back.base:E(キルトクッション)/
  button.primary.background:D(ジェリーキャンディCTA)が承認・final昇格
  (skin.json v4)・実画面統合済み。docs/asset-requests/R1-APPROVAL-PACK.md参照。
  tile状態slot(selected/ron/tsumo)はADR-015でbase合成レイヤー化済み
  (状態用の別full画像は作らない)
Batch 2(request 010/011: cute-pop table.background/panel.modal.background/
  panel.result.frame)は完了(2026-07-16)。人間承認: table.background=A、
  panel.modal.background=B、panel.result.frame=B(候補Aは9-slice伸縮時の
  変形という技術的理由で不採用)。3件ともfinal昇格・skin.json v4→v5・
  実画面統合(GameTableLayout/Modal/ResultFrame)済み。
  docs/asset-requests/BATCH-2-APPROVAL-PACK.md参照。
  Batch 1+2でCute Popの対象A分類6slot全てがfinal化完了。
Batch 3(request 012-015: ヨルノシルベ中核8slot)は完了(2026-07-16、
  技術修正込み)。人間承認: table.background=C、panel.paper.default=A、
  panel.modal.background=B、panel.result.frame=B、
  button.primary.background=A、button.secondary.background=B、
  tile.face.base=A、tile.back.base=A。8slot全てfinal昇格・
  skin.json v1→v2→v3・実画面統合済み。
  panel.paper.default(A)とpanel.result.frame(B)は初回promotionで
  BLOCKED_BY_TECHNICAL_VALIDATIONとなった(fit-to-canvasの不透明領域が
  canvas幅の43-48%しかなく、実nine-slice描画でパネル内に縮小したカードが
  浮く不具合をMatchSetup実画面で確認)が、承認済みの意匠を変更せず
  landscape full-bleed構図のみを修正した再生成(A2/B2、幅比率95.8%/96.1%)
  により同日中に解消。再発防止のためalpha bounding-box occupancy検査を
  validate_candidate.pyへ追加(docs/IMAGE-ASSET-WORKFLOW.md参照)。
  docs/asset-requests/BATCH-3-YORUNOSHIRUBE-APPROVAL-PACK.md参照。
  機械コンテンツレビューにより生成時点で3候補(table.background Bの和風建築、
  panel.result.frame Cの黒金高級UI風装飾、tile.back.base Cの
  Cute Popキルト柄類似)を却下・再生成済み。
  Official finals across skins(Batch 3時点): 17(cute-pop 9 + yorunoshirube 8)。
Batch 4(request 016: ヨルノシルベ badge.info.background)は完了
  (2026-07-17、COMPLETE)。最初に装飾/effects対象5slot(badge.info.background/
  badge.warning.background/table.overlay.ink/table.overlay.light/
  panel.paper.emphasis)を実画面再監査し、badge.info.backgroundのみ
  A-class(Cute Pop parity gap)と確定。残り4slotはCSS-token/shared
  overlayのまま実画面評価でPASS(badge.warning contrast 7.36:1、
  overlay opacity契約値と実装一致、panel emphasisのfocus-visible非衝突)、
  変更なし。badge.info.background候補3案(A:夜の索引タブ/B:グラシン紙の
  記録ラベル/C:写真フィルムの見出し片)を生成・自動検査(寸法/透過/
  フリンジ/badge専用occupancy閾値/24x20縮小proof)全て通過。
  human decision: A(夜の索引タブ、approvalSource:
  user-provided-human-decision、2026-07-17)。候補Aをfinal昇格、
  B/Cはnot-selectedとして理由記録・archive保持。yorunoshirube
  skin.json v3→v4をatomic publish、全9slotが?v=4で解決。production
  consumer(DeckList/DeckDetail/DeckEditor/Collection/Gallery)実画面検証・
  一時レビューUI撤去済み。docs/asset-requests/BATCH-4-YORUNOSHIRUBE-APPROVAL-PACK.md
  参照。
  **現在の状態: cute-pop final9件・v5 / yorunoshirube final9件・v4 /
  Official finals across skins: 18。両スキンとも9 official finals。**
Batch 5(full-screen integration / manual QA / public demo gate review)は
  完了(2026-07-21、COMPLETE_PUBLIC_DEMO_READY)。新規asset生成は行っていない
  (Batch 5の目的は個別assetではなく製品全体のQA)。両skin・全screen
  (TOP/DeckList/DeckDetail/DeckEditor/Collection/MatchSetup/Match/Result/
  Gallery)・5viewport(844x390/852x393/932x430/1024x600/1366x768)・
  keyboard/focus/touch target・deck import(valid/invalid JSON/unknown field/
  unsafe field/unsafe image URL/oversized)・deck editor validation・
  boot/recovery(fresh/corrupt/invalid skin/missing deck/ErrorBoundary/reset)・
  skin switching(state保持/asset version/404・candidate leakage 0)・
  実対局(3人戦/4人戦×両skin、計4対局をResultまで完走、reload idempotency
  確認済み)を自動化スクリプト(scripts/batch5-qa-0{1,2,3}-*.mjs)と
  Playwright visual regression拡張(34->56 cases、Result/DeckList/
  DeckEditor/きせかえModalを追加、Result画面は対局seedが非決定的なため
  strict baseline対象外とし到達性+overflowのみ機械検証)で実施。
  発見した問題は全て自スクリプトの不具合または既存の意図した設計
  (SkinSelectorはTOP/Galleryのみ配置がH4の意図通り、対局中reloadで
  TOPへ戻るのは対局状態を永続化しない設計通り)であり、製品コード側の
  P0/P1は0件。Gate 4: PASS。Gate 5: PASS(browser scope: Chromium/
  Desktop Chrome。本プロジェクトのplaywright.config.tsが元々定義する
  対象browserと同一であり、WebKit/Firefox/実Safariは今回未検証)。
  README.mdへpublic demo limitations copyを追加。証跡:
  docs/qa/BATCH-5-QA-MATRIX.md、docs/qa/BATCH-5-MANUAL-QA-REPORT.md、
  docs/qa/evidence/batch-5/(スクリーンショット121枚+network/console JSON)。
  次の固定タスク(未着手・要明示指示): Release Candidate track — Gate 6
  (migration/storage recovery/performance caps/asset caching/rollback/
  a11y acceptance等)。
```

過去の「Phase 1開始」「まずengineから」「H1から順に」は現在地ではありません。既存機能を壊さず、`docs/IMPLEMENTATION-WORKFLOW.md` と `docs/SKIN-FOUNDATION-HARDENING.md` の残項目・ゲートを確認して進めてください。

## Read First

```text
README.md
AGENTS.md
docs/README.md
docs/MASTER-SPEC.md
docs/IMPLEMENTATION.md
docs/IMPLEMENTATION-WORKFLOW.md
docs/SKIN-FOUNDATION-HARDENING.md
```

## Mandatory UI / Design / Skin Read

UI、CSS、token、component、asset、motion、responsive、skin loadingを扱う場合は必ず読む。

```text
docs/DESIGN-SYSTEM.md
docs/SKIN-SYSTEM.md
docs/SKIN-FOUNDATION-HARDENING.md
docs/UI-COMPONENT-CONTRACT.md
docs/SKIN-AUTHORING-GUIDE.md
docs/DESIGN-IMPLEMENTATION-POLICY.md
docs/ASSET-PIPELINE.md
docs/IMAGE-ASSET-WORKFLOW.md
docs/ASSET-PRODUCTION-ROADMAP.md
docs/48-responsive-crisp-ui-system.md
docs/49-ui-quality-gate-and-codex-design-rules.md
docs/50-pro-ui-production-quality-checklist.md
docs/design-targets/generated/soro-pon-landscape-vampon-ui-v1/README.md
```

Claude Codeは画面ごとにデザインを発明しません。

```text
one layout and component system
multiple validated skins
no skin-specific screen copies
shared components before screen-local markup
Design Tokens before raw visual values
asset slots before hardcoded image paths
Component Gallery before broad screen rollout
```

## Hardening Order

Do not skip ahead or combine all work into one change.

```text
H1 explicit typed skin-token allowlist
H2 full contract validator and pnpm skin:validate / CI
H3 semantic contrast and Cute Pop correction
H4 user-facing and Gallery SkinSelector
H5 layered SkinSurface and real nine-slice proof
H6 additional renderer modes only with tests and examples
H7 shared component and CSS responsibility migration
H8 DOM/accessibility/recovery tests and implementation
H9 Playwright visual regression and five-size QA
H10 installed/paid skin trust, versioned preload, atomic switching
H11 persistent matchSessionId idempotency before replay/restore
```

Each H item must finish tests, docs, commit, and push before moving on.

## Current Skin Rules

```text
yorunoshirube and cute-pop use the same screens and DOM responsibility
layout, hit areas, touch size, z-index, responsive behavior, focus, state meaning are immutable
skins change only explicit allowlisted typed presentation values
nine-slice/three-slice/repeat/cover/contain/overlay/mask use shared renderers
installed/paid skins cannot execute arbitrary CSS, JS, HTML, URLs, SVG by default, or external fonts
```

## Asset Production (Image Generation)

画像生成系アセットの正本は `docs/IMAGE-ASSET-WORKFLOW.md`。追加の口頭指示なしで従う。

```text
Codex CLIで生成(高彩度の単色グリーン背景)
-> Python透過(色距離+2段しきい値+despill。完全一致削除は禁止)
-> 検査(寸法/余白/透明境界/端接触)
-> generated/candidates
-> Gallery/実画面適用レビュー
-> 人間の承認後のみ generated/final
```

固定ルール:

```text
do not write generated output into generated/final(直接final禁止)
candidatesはmanifest未登録。finalは必ずskin.json経由で参照
プログラム生成(単純な面/枠/幾何/検証素材)はscripts/の決定的スクリプト
質感・手描き感・イラスト・エフェクトは画像生成系(上記フロー)
生成記録(prompt/背景色/透過パラメータ/hash/承認状態)を
  tools/asset-factory/soro-pon-ui/records/ に残す(raw画像はgitignoreのローカル領域)
final昇格時はversion繰り上げ+skin:validate+visual regression確認
実行コマンド: pnpm asset:image:prepare(工程3-6を一括実行) /
  pnpm asset:image:test(Pythonのfixtureテスト)
```

## Shared Component Rule

Do not add screen-local generic controls. Use or extend centrally:

```text
Button / IconButton
SkinSurface / SkinBackground / SkinOverlay / SkinIcon
PaperPanel
Modal / Dialog
Tabs / Badge / Toast / Tooltip
TileCard / TileRow
SectionHeader
ValidationIssueList
shared form fields
EmptyState / ErrorState
SkinSelector / SkinPreviewCard
```

Every reusable variant/state goes into Component Gallery and is checked in both official skins.

## Architecture Boundary

```text
UI does not implement role/scoring/wildcard logic
engine does not import React/DOM/localStorage/CSS
skin does not access engine/schema/storage/records/network
shared deck JSON does not contain images/URLs/executable display data
```

## Orientation

```text
844x390 reference
phone landscape: 100svw x 100svh
PC: centered table + outer support
portrait: rotate prompt or limited utility
```

Do not use whole-screen `transform: scale()`.

## Stack

```text
TypeScript
React
Vite
Zod
Vitest
CSS / CSS Modules
localStorage first
```

Review `docs/DEPENDENCY-POLICY.md` and add ADR before major dependencies, including DOM-test and visual-regression tools.

## Vamp-pon Reference

When using world/visual lore:

```text
/Users/m-shogo/Developer/personal/vamp-pon/docs/shared-vampon-master-index.md
docs/42-shared-vampon-source-policy.md
docs/45-vampon-reference-gate.md
```

The `vamp-pon` repository is read-only.

## Work and Report

Use small, testable commits and push each completed purpose.

Report:

```text
changed files
commit SHA
implementation scope
commands and local results
CI status or unavailable
skin/screen impact
screenshots/manual QA where relevant
remaining risks
next hardening item
```
