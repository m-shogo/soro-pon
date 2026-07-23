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
Batch 5(full-screen integration / 自動化QA / public demo gate review)は
  完了(2026-07-21、内部ステータス値: COMPLETE_PUBLIC_DEMO_READY。
  **この値は「検証済みのChromiumブラウザ範囲においてPublic Demo Ready」を
  意味し、Safari/Firefox/WebKit/実モバイル端末の対応を保証するものでは
  ない**)。新規asset生成は行っていない(Batch 5の目的は個別assetでは
  なく製品全体のQA)。両skin・全screen(TOP/DeckList/DeckDetail/
  DeckEditor/Collection/MatchSetup/Match/Result/Gallery)・5viewport
  (844x390/852x393/932x430/1024x600/1366x768)・keyboard/focus/
  touch target・deck import(valid/invalid JSON/unknown field/
  unsafe field/unsafe image URL/oversized)・deck editor validation・
  boot/recovery(fresh/corrupt/invalid skin/missing deck/ErrorBoundary/reset)・
  skin switching(state保持/asset version/404・candidate leakage 0)・
  対局(3人戦/4人戦×両skin、計4件のQAスクリプト駆動自動対局+Playwright
  visual regression側の10件、計14件をResultまで完走。**全てChromium
  browser automationによる操作であり、人間の手動操作や実端末操作では
  ない**。reload idempotency確認済み)を自動化スクリプト
  (scripts/batch5-qa-0{1,2,3}-*.mjs)とPlaywright visual regression拡張
  (34->56 cases、Result/DeckList/DeckEditor/きせかえModalを追加、
  Result画面は対局seedが非決定的なためstrict baseline対象外とし
  到達性+overflowのみ機械検証)で実施。発見した問題は全て自スクリプトの
  不具合または既存の意図した設計(SkinSelectorはTOP/Galleryのみ配置が
  H4の意図通り、対局中reloadでTOPへ戻るのは対局状態を永続化しない設計
  通り)であり、製品コード側のP0/P1は0件。Gate 4: PASS。Gate 5: PASS
  (browser scope: Chromium/Desktop Chromeのみ。本プロジェクトの
  playwright.config.tsが元々定義する対象browserと同一であり、
  WebKit/Firefox/実Safari/実モバイル端末は今回未検証・対応保証なし)。
  README.mdへpublic demo limitations copyを追加。証跡ファイル数は
  最終報告で131 PNG + 7 JSON = 138件と再集計・訂正済み(旧報告の
  「121+7=128」は集計ミス、docs/qa/BATCH-5-MANUAL-QA-REPORT.mdの
  Corrections節参照)。証跡:
  docs/qa/BATCH-5-QA-MATRIX.md、docs/qa/BATCH-5-MANUAL-QA-REPORT.md、
  docs/qa/evidence/batch-5/(PNGスクリーンショット131枚+JSON証跡7件、
  計138件、全てgit管理下)。
Batch 6(Gate 6: Release Candidate hardening)は完了(2026-07-21)。
  migration(deck storeのper-deck salvage。1件の壊れた/旧schemaのdeckが
  他の正常なdeckを道連れにしない。既存のmigrateLegacyDeck再利用、新規
  frameworkなし)・storage recovery(quota超過write失敗をStorageWriteError
  へ変換しToastで通知、DeckEditor/importモーダルはdraftを保持したまま
  留まる)の2件は実際に発見された製品コード側のP1不具合として修正
  (修正前: 1件の壊れたdeckでdeck一覧全体が消去され得た/quota超過保存が
  無言で失敗しUIは保存成功したかのように振る舞っていた)。
  performance(cold boot ~96ms、画面遷移19-82ms、CDP経由での正確な
  heap計測、bundle/asset実サイズ)・caching(content hashが無変更時は
  安定・実変更時は変化することを実際のrebuildで確認)・rollback
  (git worktreeで旧commit 9b9ba1a をbuildし別portで起動、新旧buildの
  データ相互読み込みを実際に確認、7/7 PASS)・accessibility acceptance
  (heading階層/accessible name/dialog aria-modal・aria-labelledby/
  tile aria-pressed/200%zoom相当viewport/reduced-motion、semantic
  DOM検査のみで実VoiceOver等は未実施と明記)は全て実ブラウザ自動化
  スクリプト(scripts/gate6-qa-0{1,2,3,4}-*.mjs)で検証。import拒否
  理由リストにaria-live欠落を発見しrole="status" aria-live="polite"
  を追加(trivial、既存sp-issue-listクラス全体には広げず該当箇所のみ)。
  visual regressionを70件へ拡張(+14、reset確認/quota超過toast/
  部分救済toast/invalid skin fallback)。Result画面の非決定的
  screenshotがgit管理下evidenceを毎回汚す設計問題も発見・修正
  (test-results/へ書き先変更)。P0/P1: 0件(発見2件は両方修正・再検証
  済み)。Gate 6: PASS(browser scope: Chromium/Desktop Chromeのみ、
  Gate 4/5から拡張なし)。RC readiness: LIMITED READY(未実施:
  実screen reader検証、非Chromium browser検証、長時間memory soak
  test、実deploy環境でのrollback——いずれもGate 6のblockerではなく
  明示的にtracked)。証跡: docs/qa/BATCH-6-GATE-6-QA-MATRIX.md、
  docs/qa/BATCH-6-GATE-6-REPORT.md、
  docs/release/STORAGE-RECOVERY-POLICY.md、
  docs/release/CACHE-AND-ROLLBACK-RUNBOOK.md、
  docs/qa/evidence/batch-6/。
  Batch 6訂正(2026-07-21、同日中): 初回報告の自動チェック総数
  「430」は二重集計なしだったがasset:image:test(92件)を集計から
  漏らしていた誤りで、単純合計「540」はskin:validateの18件を
  pnpm testの330件と二重計上した誤りだった。両者を訂正した正しい
  独立チェック総数は**522件**(330+92+70+5+7+18、typecheck/buildは
  test caseでなくverification resultとして別扱い)。同時に
  「lossless」という表現も、quota超過時(セッション内draftは保持・
  永続データは破壊しないが、reload後のdraft復元は保証しない)と
  corrupted entry salvage(健全な他deckを道連れにしないだけで、
  救済不能な当該entry自体の完全復元は保証しない)を区別する
  正確な表現へ訂正した。詳細: docs/qa/BATCH-6-GATE-6-REPORT.mdの
  Verification節/Storage Recovery節。
Batch 7(Cross-Browser & Screen Reader Acceptance)は完了(2026-07-21、
  COMPLETE)。新しいGateではない — Gate 6はPASSのまま変更なし。RC
  readinessのbrowser scopeをChromium限定からChromium+Firefox+
  Playwright WebKit(3エンジンとも0 P0/P1/P2、機能/visual/accessibility
  すべてparity達成)へ拡張した。「Playwright WebKit」はPlaywright独自の
  WebKit build であり実Safariではない — 実Safari/iOS Safari実機/
  Android実機は今回も未検証・対応保証なし。macOS VoiceOverの実受入は
  試行したがBLOCKED(computer-useでSafariへアクセスする許可を
  ユーザーが明示的に拒否したため。NVDA/JAWSはWindows環境がなく未使用)。
  発見した3件はすべてQAスクリプト側の手法上の欠陥であり製品コード側の
  修正は0件(getByRole名前マッチングのsubstring誤検出、WebKitでの
  二重navigation起因fetch中断の見せかけのエラー、Firefox/WebKitでは
  localStorage.setItemの直接再代入が黙って無効化される問題——
  いずれも修正しFirefox/WebKit両エンジンで機能・visual・accessibility
  ともにChromiumと完全なparityを再確認済み)。visual regressionを
  cross-browser suiteとして新設(Firefox 48件+WebKit 48件=96件、
  Tier A・8画面・両skin・優先3viewport、既存Chromium 70件は
  playwright.crossbrowser.config.tsを別ファイルにすることで無傷)。
  RC readiness: LIMITED READY継続(browser engine scopeは拡張したが、
  実端末・実screen readerの検証は引き続きopen)。証跡:
  docs/qa/BATCH-7-CROSS-BROWSER-A11Y-MATRIX.md、
  docs/qa/BATCH-7-CROSS-BROWSER-A11Y-REPORT.md、
  docs/qa/evidence/batch-7/(PNG38+JSON4=42件)。
Batch 8(macOS VoiceOver Acceptance)はBLOCKED(2026-07-21)。Batch 7の
  open item中「実screen reader受入」を対象に実施を試みた。
  computer-useでのSafariアクセスはread tier(画面閲覧のみ、
  click/type不可)のため、ユーザーの明示的な推奨に基づき
  Claude in Chrome(実インタラクション可能)でChromeを操作しつつ、
  computer-useのシステムショートカット(Cmd+F5、非ブラウザアプリを
  frontmostにして送信)でVoiceOverを起動、キャプションパネルを
  スクリーンショットで観測する方針(=VoiceOver + Chrome。Safariでは
  ない)へ切り替えて実施。VoiceOverユーティリティでキャプションパネル
  既に有効を確認・Chrome側でyorunoshirube skin+animal starter deckを
  seed済みの状態まで到達したが、VoiceOver起動直後に表示される
  「VoiceOverクイックスタート」ダイアログがSpotlightインデックス未登録
  のためrequest_accessで許可対象に追加できず、以後の全computer-use
  操作(Return/Cmd+F5再送/直接click)が同一エラーで3回連続ブロックされた
  時点で、指示通りこれ以上のリトライを行わずBLOCKEDと判定。20フロー中
  0フローが実施され、実VoiceOver信号は一切取得できなかった(自動検査
  結果での代替や部分PASSとしての記載はしていない)。この試行により
  ユーザーの実機でVoiceOverがONのままダイアログが残っている可能性が
  あることをセッション内で明示的に警告済み(Cmd+F5または手動で解除を
  依頼)。
  同日中に2回の再挑戦を実施(いずれもBLOCKED維持)。Attempt 2:
  ユーザーがquickstartダイアログを手動で解除・再表示無効化した状態で
  再試行したが、今度はVoiceOverダイアログ個別ではなくVoiceOver自体が
  frontmost appとしてcomputer-useに認識され、以後の全click/key操作が
  ブロック(request_accessは"VoiceOver"名でも解決不能)。Claude in Chrome
  経由でのTabキー送信もVoiceOverのフォーカスをDockへ逸らす結果となり、
  キャプションパネルの実内容は観測できず。ユーザーへ人間操作+記録の
  協調方式を提案したが、ユーザーはClaude Code単独での続行を希望。
  Attempt 3: computer-useを使わずmacOS Accessibility API
  (AXIsProcessTrusted=false)・AppleScript/System Events
  (Apple Events送信権限なし、エラー-1743)・システム設定への
  request_access(拒否)・CGEventPost(Accessibility trust前提のため
  実効性確認不能)の4経路を検証したが、いずれもこのセッションの
  プロセスに必要なmacOS TCC権限(Accessibility/Automation)が
  付与されておらず、GUIでの人間の許可なしに自己解決する経路が
  存在しないことを確認。Playwright/CDPのaccessibility snapshotは
  利用可能だが、実VoiceOver出力の代替とはしない(今回の受入基準通り)。
  3回の試行全てで20フロー中0フローが実施され、real VoiceOver focus/
  caption出力は一度も観測できなかった。製品コードの変更は0件
  (何も検証できなかったため修正対象も0件)。既存の全自動検証
  (typecheck/unit 330/skin:validate 18/asset:image:test 92/build/
  Chromium visual 70/Firefox機能25/WebKit機能25/Firefox a11y 21/
  WebKit a11y 21/cross-browser visual 96)は全て再実行し無退行を確認。
  (attempts 1-3時点の判定はBLOCKED)。
  attempt 4(2026-07-23、CONDITIONAL): ユーザーがmacOS TCC権限
  (Accessibility/Automation)をSystem Settings GUIで付与したため、
  attempt 3で特定したblockerが解消。osascript経由のSystem Eventsで
  実VoiceOverコマンド(VO+矢印=ctrl+opt+key code124、VO+Space activate=
  ctrl+opt+key code49、Tab/Escape)を送信し、各操作後にChromeプロセスの
  AXFocusedUIElementのrole/name/valueを読み取ることで、VoiceOverカーソル
  追従を実証跡化。VoiceOver + Chrome(Safariではない。Safariはread tier
  のまま)。20フローは監査上 `VOICEOVER_PASS 9 /
  SUPPLEMENTAL_ONLY 5 / BLOCKED 6 / NOT_APPLICABLE 0` に確定:
  実VoiceOver PASSはTOP(
  主要5ボタンがAXButtonとして正しいaccessible name付きでDOM順に到達)、
  JSON import(textareaのdescription=デッキJSON、validation error I2002)、
  Deck Editor(tab stripがAXRadioButton群・件数付き名称・roving selected、
  form fieldがdescription=デッキ名/説明+現在値)、未保存変更dialog
  (もどるで開き初期focusが名前付きボタンへ)。Escapeキャンセルとfocus復帰は
  実VoiceOverでは同期観測できず、Dialog.tsxと既存unit testによる
  SUPPLEMENTAL_ONLY。**実VoiceOverで走査できたTOP、JSON Import、
  Deck Editor、未保存dialogの範囲では、accessible name/role欠落、
  読み上げ不能なcontrol、明確なfocus trapは確認されなかった。**
  この記述はMatch Setup/Match/Resultを保証しない。走査済み範囲の
  製品defect(P0/P1/P2/P3)は0件。Match Setup画面は到達したが、
  Match/ResultはcleanなVoiceOver cursor下では未到達。CDP経由の画面遷移後にVoiceOverカーソル/
  AXFocusedUIElement/DOM focusが非同期化(AXFocusedUIElementがnull)した
  ため、VoiceOverカーソルでのcleanな走査が記録できず(=tooling limitation、
  製品defectではない)。VoiceOverはセッション終了時にCmd+F5でOFFにし
  プロセス停止を確認。attempt 4判定: CONDITIONAL(core screensで
  実質的な実VoiceOver受入達成・製品defect 0件、ただしgame-play screensの
  実screen-reader走査は未完)。
  RC readiness: LIMITED READY変更なし(attempt 4でscreen-reader gapは
  core screens分だけ縮小したが、game-play screens分が未完のため昇格なし。
  製品defect 0件のため降格もなし)。証跡:
  docs/qa/BATCH-8-VOICEOVER-ACCEPTANCE-MATRIX.md、
  docs/qa/BATCH-8-VOICEOVER-ACCEPTANCE-REPORT.md、
  docs/qa/evidence/batch-8/(JSON3件: attempt-log/attempt-3/attempt-4)。
  次の固定タスク(未着手・要明示指示): 実screen reader受入の残り
  (Match Setup/Match/Resultをread時にVoiceOverカーソルとの同期を保つ経路
  ——CDPクリックを使わずVoiceOverカーソル操作のみで画面遷移する、または
  ユーザーが実VoiceOverを操作しエージェントが記録に専念する)、
  実iPhone/iPad Safari検証、実Android検証、長時間memory soak、
  実deploy環境rollback rehearsalのいずれかを明示指示で着手するか、
  Gate 7/8を対象機能が実際に計画された時点で開始する。
  docs/qa/BATCH-8-VOICEOVER-ACCEPTANCE-REPORT.mdのNext Fixed Task参照。
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
