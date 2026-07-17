# Batch 4 Approval Pack: Yorunoshirube Decoration / Badge Info

Yorunoshirube Batch 4(装飾/effects監査 + badge.info.background候補)の
人間レビュー用資料。ここだけ読めば分類監査の結果とbadge候補の承認判断が
できる状態を目指している。

- 対象request: [016](016-yorunoshirube-badge-info-background.md)
  (badge.info.background、closed)
- art direction addendum:
  [BATCH-4-YORUNOSHIRUBE-DECORATION-DIRECTION.md](BATCH-4-YORUNOSHIRUBE-DECORATION-DIRECTION.md)
- 状態: **Batch 4 result: COMPLETE(2026-07-17)**
- **final昇格・manifest登録・skin version変更を実施済み**
  (yorunoshirube skin.jsonは**version 4**。Batch 3の8 final + badge.info.background
  final = 9slot全てfinal)
- Human decision: **badge.info.background = A(夜の索引タブ)**
  (`approvalSource: user-provided-human-decision`、`approvalDate: 2026-07-17`)
- Cute Pop: **version 5 / final 9**(無変更)
- Yorunoshirube final昇格数: 8 → **9**(21 contract slots中9)
- Official finals across skins: **18**(cute-pop 9 + yorunoshirube 9)
- Batch 4 promotion: **1**
- Human review pending: **0**
- Blocked: **0**

## 何を見るか

1. `pnpm dev` → `#/gallery` → Skinをヨルノシルベへ切り替え →
   「CategoryChip / InkDivider / LanternGlow」セクションのBadge(info)が
   final資産(badge-info-background.png、夜の索引タブ)で表示されることを確認
   (Batch 4専用の候補レビューUIは昇格後に撤去済み)
2. または静的証跡: `evidence/batch-4-yorunoshirube-badge-info-final/*.png`
   (round 1候補比較証跡は `evidence/batch-4-yorunoshirube-badge-info-round1/*.png`
   に保持)
3. B/C装飾監査の根拠: `evidence/batch-4-yorunoshirube-decoration-audit/*.png`
4. 判断基準はrequest 016のAcceptance Checklist、および下記の機械レビュー所見

## 1. Classification Audit(consumer再監査結果)

| slot | previous class | final class | consumer | current method | visual issue | change required | implemented change | reason |
|---|---|---|---|---|---|---|---|---|
| badge.info.background | A(未着手) | **A** | `Badge.tsx`(variant="info") → Collection/DeckEditor/DeckDetail/DeckList/ValidationIssueList/AppRoot/Gallery | CSS token(`.sp-badge--info`) | 機能的欠落なし。Cute Popは既にfinal(request 007)のためskin間parity gap | true(画像生成) | request 016で候補3案生成(本Approval Pack) | Cute Pop parity gap、複数頻出画面、24x20での紙質表現がCSSだけでは出せない |
| badge.warning.background | B | **B(変更なし)** | `Badge.tsx`(variant="warning") → ValidationIssueList(INFO/WARN prefix), AppRoot | CSS token(`.sp-badge--warning`) | なし。contrast比7.36:1(AAA相当)、`INFO`/`WARN`文言で色以外の区別も常時提供済み(H3実装) | false | なし | 実画面監査でPASS。CSS-tokenのまま製品品質を満たす |
| table.overlay.ink | B | **B(変更なし)** | `GameTableLayout.tsx` → MatchScreen(radial-gradient overlay, opacity 0.5) | CSS radial-gradient token(`--sp-overlay-table-ink`) | なし。中央のみの低密度演出、牌・捨て牌・ボタンとの視覚衝突なし | false | なし | 実画面監査でPASS。SKIN-CONTRACT記載opacity(0.5)と実装が一致 |
| table.overlay.light | B | **B(変更なし)** | `GameTableLayout.tsx` → MatchScreen(radial-gradient overlay, opacity 0.6) | CSS radial-gradient token(`--sp-overlay-table-light`) | なし。右上の弱い光暈のみ、主CTAとの競合なし、白飛びなし | false | なし | 実画面監査でPASS |
| panel.paper.emphasis | C | **C(変更なし)** | `PaperPanel.tsx`(selected) → ResultScreen「新しい実績」 | shared box-shadow token(`--sp-shadow-lantern-soft`) | なし。focus-visibleリング(unlayered, box-shadow 0 0 0 5px)と視覚的に衝突しない、通常panelとの差が明確 | false | なし | 実画面監査でPASS。専用画像不要 |

Consumer詳細:

```
badge.info.background:
  consumer: Badge.tsx (variant="info")
  screens: CollectionScreen(記憶コイン/称号) / DeckEditorScreen /
    DeckDetailScreen / DeckListScreen / ValidationIssueList(INFO行) /
    AppRoot / Gallery
  usage frequency: 高頻度(デッキ関連の全画面)
  actual render size: 実文言依存(padding駆動、~70-220px幅 x ~24-28px高)
  minimum size: 24x20(contract)
  renderMode: nine-slice / opacity: n/a(不透明素材) / runtime opacity: 1.0
  text/icon overlay: あり(DOM側、severity文言を必ず併記)
  state responsibility: なし(variant切り替えのみ)
  existing fallback: `--sp-color-paper-aged` / `--sp-color-ink-soft`
  current visual defect: なし(機能面)。Cute Popとの素材差別化が本request
  recommended production method: 画像生成(Codex CLI)
  image generation required: yes

badge.warning.background:
  consumer: Badge.tsx (variant="warning")
  screens: ValidationIssueList(WARN行) / AppRoot(拒否表示)
  usage frequency: 中(検証エラー発生時のみ)
  actual render size: 実文言依存
  minimum size: 24x20(contract)
  renderMode: nine-slice / runtime opacity: 1.0
  text/icon overlay: あり(`WARN`固定prefix、H3で色以外の区別を実装済み)
  state responsibility: なし
  existing fallback: `color-mix(in srgb, var(--sp-color-danger) 24%, var(--sp-color-paper))`
  current visual defect: なし
  recommended production method: CSS-token(現状維持)
  image generation required: no

table.overlay.ink:
  consumer: GameTableLayout.tsx
  screens: MatchScreen
  usage frequency: 対局中は常時表示
  actual render size: table.background全面(absolute inset:0)
  minimum size: n/a(overlay)
  renderMode: overlay / opacity: 0.5(SKIN-CONTRACT記載)
  runtime opacity: `rgba(10, 7, 4, 0.5)`中心のradial-gradient(実装値と契約値一致)
  text/icon overlay: なし(pointer-events: none)
  state responsibility: なし
  existing fallback: `--sp-overlay-table-ink` token
  current visual defect: なし
  recommended production method: CSS radial-gradient(現状維持)
  image generation required: no

table.overlay.light:
  consumer: GameTableLayout.tsx
  screens: MatchScreen
  usage frequency: 対局中は常時表示
  actual render size: table.background全面(absolute inset:0)
  minimum size: n/a(overlay)
  renderMode: overlay / opacity: 0.6(SKIN-CONTRACT記載)
  runtime opacity: `rgba(232, 162, 60, 0.14)`のradial-gradient(右上,実装値は
    契約のopacity上限0.6に対し十分低い実効値)
  text/icon overlay: なし(pointer-events: none)
  state responsibility: なし
  existing fallback: `--sp-overlay-table-light` token
  current visual defect: なし
  recommended production method: CSS radial-gradient(現状維持)
  image generation required: no

panel.paper.emphasis:
  consumer: PaperPanel.tsx (selected=true)
  screens: ResultScreen「新しい実績」パネルのみ(実consumer)
  usage frequency: 低(実績獲得時のみ)
  actual render size: panel.paper.default同等
  minimum size: panel.paper.defaultと同じ(64x64 minRenderSize)
  renderMode: shared overlay(box-shadow) / opacity: n/a
  text/icon overlay: なし(panelタイトル/本文はDOM)
  state responsibility: selected状態の視覚強調のみ
  existing fallback: `.sp-paper-panel--selected` box-shadow
    (`var(--sp-shadow-panel), var(--sp-shadow-lantern-soft)`)
  current visual defect: なし。focus-visibleリング(unlayered)と衝突しない
  recommended production method: shared token(現状維持、専用nine-slice画像は複製)
  image generation required: no
```

## 2. B/C Audit(実画面確認結果)

### badge.warning.background

```
Audit result: PASS
Change required: false
Evidence: evidence/batch-4-yorunoshirube-decoration-audit/badge-warning-current.png
Verification: contrast比 7.36:1(WCAG AAA相当、194,164,134文字色 vs
  36,26,16背景の実測値)。ValidationIssueList.tsxで`INFO`/`WARN`固定
  prefixが常に併記される実装(H3対応、コメント「severityは色だけでなく
  ラベル文字でも区別する」)を確認。infoとの区別は色のみに依存しない。
```

### table.overlay.ink

```
Audit result: PASS
Change required: false
Evidence: evidence/batch-4-yorunoshirube-decoration-audit/table-overlay-ink-current.png
Verification: 実MatchScreen(1366x768, DPR2)で牌8枚・スコアパネル・
  アクションボタンと重ねて確認。中央やや下の低密度radial-gradientのみで
  moiré・可読性低下なし。runtime opacity実測値(0.5)がSKIN-CONTRACT記載の
  契約値と一致。
```

### table.overlay.light

```
Audit result: PASS
Change required: false
Evidence: evidence/batch-4-yorunoshirube-decoration-audit/table-overlay-light-current.png
Verification: 同一画面で確認。右上(88%,10%)の弱い光暈のみで、primary CTA
  (画面下部)との競合なし、白飛びなし。runtime opacity実測値(0.6契約に対し
  実効alpha 0.14)は契約上限を下回り、十分に控えめ。
```

### panel.paper.emphasis

```
Audit result: PASS
Change required: false
Evidence: evidence/batch-4-yorunoshirube-decoration-audit/panel-emphasis-current.png
Verification: Gallery「選択中」panel(実CSS class `.sp-paper-panel--selected`)
  のcomputed box-shadowを実測: `rgba(0,0,0,0.55) 0 2px 10px, rgba(232,162,60,
  0.35) 0 0 12px`。focus-visibleリング(base.css、unlayered、box-shadow
  0 0 0 5px halo)は常に上位優先度を持つため、selected状態のambient glowと
  視覚的に衝突しない。通常panelとの差(琥珀の淡いglow)は明確。
```

## 3. badge.info.background 候補一覧と機械レビュー所見

Render contract: nine-slice / intrinsicSize 240x80(2x) / nineSlice(source)
16 / nineSliceRender(CSS) 8 / contentSafeArea(source) 8 / minRenderSize
24x20 / transparent。badge専用occupancy閾値(request 016参照):
widthRatio 0.40-0.98 / heightRatio 0.30-0.95 / centerOffset ≤0.06。

| 候補 | コンセプト | 素材 | occupancy | 機械レビュー所見 |
|---|---|---|---|---|
| A | 夜の索引タブ | 薄い蝋引き紙+黒インクの不均一な縁+小さな琥珀点 | widthRatio 0.8417 / heightRatio 0.8250 / centerOffset 0/0 | 最も汎用的。中央は完全に静か。24x20で矩形タブの輪郭が明確に判別可能。button/panelに見えない直線的な索引構造。Cute Popリボンとの類似性なし |
| B | グラシン紙の記録ラベル | 半透明グラシン紙+煤けた青灰+柔らかな紙繊維+片隅のインク印 | widthRatio 0.6167 / heightRatio 0.8375 / centerOffset 0/0.0063 | 画像生成でしか出しにくい半透明紙質を実現。panel.modal.background(candidate B、グラシン紙質)との素材連続性。3案中もっとも幅比率が低い(61.7%)が、badge専用閾値(下限40%)には十分な余裕があり、意図的な狭幅ラベル形状として妥当 |
| C | 写真フィルムの見出し片 | 黒紺の薄いタブ+片端の小さな光点+微細な印刷ずれ | widthRatio 0.8417 / heightRatio 0.7125 / centerOffset 0/0.0063 | 記憶・記録の意味が強い。tile.face.baseの古写真候補とは別の小型ラベル用途として差別化。ノッチ・穴なし、24x20で輪郭維持 |

3案とも:

- 自動検査(寸法/透過/フリンジ/edge接触/最小余白/content hash/occupancy)全項目pass
- 24x20/32x20/48x24/72x28/120x40の縮小proofでsilhouette維持、corner/notch collapse なし
- 文字・数字・ロゴの焼き込みなし
- Cute Popのribbon-tab(request 007候補B、final)と異なる素材・形状
- CSS単色/gradient/border/box-shadowでは再現不可能な質感(蝋引き紙の繊維、
  半透明紙の積層、写真乳剤のprint-registrationずれ)を実現
- machine rejection条件(黒金高級UI/ネオン/深いノッチ/文字焼き込み/緑フリンジ等)
  に該当する初回生成はなし(3案とも1回の生成で規定を満たした)

**machine recommendation: A(夜の索引タブ)**。理由:
最も汎用的な矩形silhouetteで24x20時の視認性が最も高く、他7つの
Yorunoshirube final(特にpanel.paper.default候補A「記録用紙」)と素材語彙が
直接連続する。ただしB/Cも技術的には全項目pass、意匠面での優劣は人間判断に
委ねる。

**Human decision(2026-07-17): A(夜の索引タブ)を採用**。machine
recommendationと一致。`approvalSource: user-provided-human-decision`。
候補B/Cは`not-selected`(理由をrecordへ記録済み。archive/raw/compare/
prompt/recordは削除せず保持)。**final昇格済み。**

## 4. Runtime Preview(promotion後・production final)

```
Gallery route: #/gallery → CategoryChip/InkDivider/LanternGlowセクションの
  標準Badge component(review UIは撤去済み、production final適用)
Badge consumers確認画面: DeckListScreen(遊べる) / DeckDetailScreen(遊べる) /
  DeckEditorScreen(ValidationIssueList、INFO/WARN複数バッジ) /
  CollectionScreen(記憶コイン/称号) / Gallery
Warning comparison: DeckEditorのValidationIssueListでINFO/WARNバッジが
  並んで表示され、色・prefix文言の両方で区別可能なことを確認済み
Screens: Gallery / DeckList / DeckDetail / DeckEditor / Collection
Viewports: 844x390 / 852x393 / 932x430 / 1024x600 / 1366x768(主にDPR2)
Versioned URL: 全9 Yorunoshirube final資産(badge.info.backgroundを含む)が
  ?v=4で200解決。candidateパス(badge-info-background-candidate-*.png)への
  requestは0件
Skin switching: リロード後もヨルノシルベv4が維持され、production画面へ
  candidateが漏洩しないことを確認
Cute Pop regression: version 5 / final 9のまま、無変更を確認
```

## 5. Evidence

```
Art direction: BATCH-4-YORUNOSHIRUBE-DECORATION-DIRECTION.md
Request: 016-yorunoshirube-badge-info-background.md
B/C audit: evidence/batch-4-yorunoshirube-decoration-audit/
  (badge-warning-current.png / table-overlay-ink-current.png /
  table-overlay-light-current.png / panel-emphasis-current.png)
Badge candidate round 1(比較用、保持): evidence/batch-4-yorunoshirube-badge-info-round1/
  (gallery-overview.png / candidate-{a,b,c}-small-sizes.png /
  deck-editor-context.png / deck-detail-context.png /
  collection-context.png / warning-comparison.png /
  cutepop-regression.png / skin-switch.png)
Badge production final: evidence/batch-4-yorunoshirube-badge-info-final/
  (badge-info-24x20.png / badge-info-deck-list.png / badge-info-deck-detail.png /
  badge-info-deck-editor.png / badge-info-validation-list.png /
  badge-info-collection.png / badge-info-gallery-production.png /
  badge-info-warning-comparison.png / skin-switch-yoru-v4-cutepop-v5.png /
  cutepop-v5-regression.png / network-v4-assets.json)
```

## 6. Rejection Criteria(参考・machine reject段階では未発動)

以下に該当した場合は候補をGalleryへ出さず再生成する
(request 016 Must Avoid節、および今回の指示section 18準拠):

```
24x20で輪郭が判別不能
buttonに見える / panelに見える
Cute Popリボンの色違い
CSS borderだけで再現可能
深いノッチが潰れる
中央detailが文字と競合
文字・数字・ロゴ入り
緑フリンジ / edge接触 / occupancy不足 / 非対称margin
nine-slice seam
黒金高級UI / ネオン
```

今回生成したA/B/C 3案はいずれも該当なし(1回の生成で全項目pass)。

## 7. Human Decision(記録済み)

```
badge.info.background: A

Review note: 24x20最小表示の輪郭明瞭さ、occupancy余裕、
  panel.paper.defaultとの素材連続性を理由に採用。machine recommendationと一致。
```

B/C分類の4slot(badge.warning.background / table.overlay.ink /
table.overlay.light / panel.paper.emphasis)には人間candidate選択欄を
設けなかった(画像候補ではなく、CSS-token/shared overlayのまま維持する
audit結果のため)。この方針は今回のpromotionでも変更していない。

## 8. Promotion Procedure(実施済み・2026-07-17)

1. ✅ 選択されたcandidate Aを`generated/final/badge-info-background.png`へ配置
   (final hash `2643f174...`、candidate hashと完全一致)
2. ✅ `yorunoshirube/skin.json`へ`badge.info.background`を登録
   (renderMode nine-slice, intrinsicSize 240x80, pixelDensity 2, nineSlice
   16, nineSliceRender 8, contentSafeArea 8, minRenderSize 24x20, transparent)
3. ✅ skin version bump(v3 → v4)
4. ✅ `Batch4YorunoshirubeBadgeInfoReview.tsx`とComponentGalleryへの配線を削除
5. ✅ production consumer(DeckList/DeckDetail/DeckEditor/Collection/Gallery)
   で実画面検証・5 viewport証跡取得
6. ✅ visual regression実行・baseline更新(意図差分2件のみ)・全検証コマンド実行
7. ✅ docs同期(request 016 / 本Approval Pack / roadmap / workflow / CLAUDE.md)
8. ✅ commit・push・CI success確認

## REJECT Procedure(参考・今回は未使用)

1. 却下理由をrequest 016 Approval Statusへ記録
2. 3案とも却下の場合、新たな方向性で再候補生成(このApproval Packを
   round 2として複製、新candidateを追加)
3. 一部却下の場合、却下candidateのrecordを`not-selected`へ更新
   (削除しない、archiveは保持)
