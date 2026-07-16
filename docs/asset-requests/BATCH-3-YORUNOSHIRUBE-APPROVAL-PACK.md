# Batch 3 Approval Pack (request 012 / 013 / 014 / 015)

ヨルノシルベの中核8slot(table.background / panel.paper.default /
panel.modal.background / panel.result.frame / button.primary.background /
button.secondary.background / tile.face.base / tile.back.base)の
候補24点(各slot最大3案)の人間レビュー用資料。ここだけ読めば承認判断と
承認後のpromotion操作ができる状態を目指している。

- 対象request: [012](012-yorunoshirube-table-background.md)(table.background) /
  [013](013-yorunoshirube-panel-family.md)(panel.paper.default /
  panel.modal.background / panel.result.frame) /
  [014](014-yorunoshirube-button-pair.md)(button.primary.background /
  button.secondary.background) /
  [015](015-yorunoshirube-tile-face-back.md)(tile.face.base / tile.back.base)
- art direction: [BATCH-3-YORUNOSHIRUBE-ART-DIRECTION.md](BATCH-3-YORUNOSHIRUBE-ART-DIRECTION.md)
- 状態: **candidates配置済み・自動検査合格・人間承認待ち**
- **final昇格・manifest登録・skin version変更は未実施**
  (yorunoshirube skin.jsonは引き続きversion 1・`slots: {}`のまま。
  Cute Pop final(9件、version 5)は無変更)

## 何を見るか

1. `pnpm dev` → `#/gallery` → SkinをヨルノシルベへV切り替え →
   「Batch 3候補レビュー」セクション(8slot、各3候補、実PaperPanel/
   TileCard/Buttonへ実際に適用した状態)
2. または静的証跡: `evidence/batch-3-yorunoshirube-round1/*.png`
3. 判断基準はrequest 012-015のAcceptance Checklist、および下記の
   機械レビュー所見

## 候補一覧と機械レビュー所見

### table.background(cover、1920x1080、opaque、request 012)

| 候補 | コンセプト | 所見 |
|---|---|---|
| A | 夜の地図帳 | 深い黒紺の紙+手描きの街路線+隅の小さな街灯。中央は完全に静か。3案中もっとも周辺密度が低い |
| B | 黒インクの街(和風要素除外版) | 墨の濃淡+紙の折れ+川筋。**初回生成案はtorii(鳥居)/pagoda(五重塔)風建築を含み、和風モチーフ禁止に抵触したため機械レビューで却下・和風建築を明示除外したpromptで再生成(B2)**。周辺detailが3案中やや高密度(known concern) |
| C | 旅のノートと蝋引き紙 | 蝋引きの半透明感+鉛筆線+旅の記録片(荷札・山・星の落書き)。最も物語性が強く、中央は静か |

3案ともCSSでは再現不可能な質感(紙繊維/墨の滲み/蝋引きの半透明感)を実現。緑色モチーフなし、chroma-key誤爆なし。牌・ボタンを実際に重ねて可読性を確認。

### panel.paper.default(nine-slice、384x256、nineSlice 24、transparent、request 013)

| 候補 | コンセプト | 所見 |
|---|---|---|
| A | 記録用紙 | 紙繊維+軽いインク縁。3案中もっとも静か・日常的 |
| B | 蝋引き地図片 | 半透明層+折り線。落ち着いた質感 |
| C | 糸綴じメモカード | 紙の積層+糸綴じ跡。手仕事感が強い |

3案ともminRenderSize(64x64)で破綻せず、長文・list・emptyで中央帯が静かなまま。

### panel.modal.background(nine-slice、512x384、nineSlice 24、transparent、request 013)

| 候補 | コンセプト | 所見 |
|---|---|---|
| A | 黒い封筒からの記録紙 | 封蝋跡+中央明るい。paper.defaultより明確に可読性優先 |
| B | 挟み込まれた半透明紙 | 淡い街路線(隅のみ)+黒インク縁。地図帳との世界観連続性が強い |
| C | 夜の旅行ノート | 紙の重なり+糸綴じ+角の小さな光 |

3案ともtall表示(長い本文でのcontent safe area確認)で四隅装飾の変形なし・中央帯のseamなしを目視確認。

### panel.result.frame(nine-slice、512x384、nineSlice 32、transparent、request 013)

| 候補 | コンセプト | 所見 |
|---|---|---|
| A | 旅の記録帳の表紙 | 複数の小さな街灯+黒インクの地図線。Batch 3中もっとも物語性が強い |
| B | 夜明け前の記念台紙 | 淡い紫+紙の積層+小さな光。落ち着いた華やかさ |
| C | 忘れ物の標本箱(フラット版) | 薄い硝子質感+糸綴じ+単一の小さな光。**初回生成案は浮き彫りベゼル+リベット+宝石調コーナー装飾を含み、「黒金高級UI」という明示的禁止印象に近すぎたため機械レビューで却下・フラットな紙+薄い硝子質感へ変更したpromptで再生成(C2)** |

3案とも勝敗どちらの文脈でも使える中立的なデザイン(WIN/LOSE文字・王冠・特定役の焼き込みなし)。

### button.primary.background(nine-slice、240x72、nineSlice 16、transparent、request 014)

| 候補 | コンセプト | 所見 |
|---|---|---|
| A | 街灯の光を閉じ込めた硝子 | 最も強い光。ink-black housing+暖色の発光。3案中もっとも直接的な「押せる」印象 |
| B | ランタンの札 | 紙+薄い硝子、内側から発光。paper系の質感を保ちつつ強い光 |
| C | 夜明け前の標識 | 縁の導光ライン。暗い面+縁の発光という構成 |

3案とも中央帯(horizontal middle band)が均一でnine-slice水平伸縮時にseamが出ない。黒金高級UIになっていないことを確認。

### button.secondary.background(nine-slice、240x72、nineSlice 16、transparent、request 014)

| 候補 | コンセプト | 所見 |
|---|---|---|
| A | 消えかけた鉛筆標識 | 鉛筆線+淡い灰青の陰影。発光なし、3案中もっとも静か |
| B | 夜の切符 | 小さな切り欠き+印刷ずれ。実用品的な質感 |
| C | 古いタグ | 糸穴+蝋引き紙 |

3案ともprimaryと並べたとき明確に「弱い」光であることを確認(primaryとの階層差が明瞭)。**candidate A初回prepareは自動検査でtop/bottom側の透明余白不足によりrejected-validation、fit-margin-ratioを広げて同一rawから再prepareし合格**(生成のやり直しではなく処理パラメータ調整)。

### tile.face.base(stretch、300x400、transparent、request 015)

| 候補 | コンセプト | 所見 |
|---|---|---|
| A | 明るい記憶の紙片 | 古紙アイボリー+隅の小さな光。中央がもっとも静かで数字/柄オーバーレイの可読性が高い |
| B | 地図帳の切り抜き | 淡い街路線+デッケル(手切り)エッジ。**街路線が縁の広い範囲を回っており、24px縮小時にノイズ化するリスクがやや高い(known concern)** |
| C | 古い写真の台紙 | 乳剤感+隅のみ手描きフレーム。中央が静かで可読性が高い |

3案とも24/30/42/54/96pxで実際にTileCardへ適用して確認。selected/ron/tsumo/dimmed状態はADR-015のbase合成レイヤーで表現されるため別画像は生成していない。

### tile.back.base(stretch、300x400、transparent、request 015)

| 候補 | コンセプト | 所見 |
|---|---|---|
| A | 封蝋紙+型押しの輪 | 黒紺+中央の型押しリング+糸綴じ跡。型押し(emboss)であり印刷線ではないことを確認 |
| B | 地図の裏面(型押し) | 型押しのルート線、印刷ではなく凹凸。faceのB案(地図帳の切り抜き)と世界観は連続するが、表現方法(型押し vs 印刷線)で明確に異なる |
| C | 蝋引きカード(フラット版) | 単一の琥珀点+薄い縁の型押し、中央は無地。**初回生成案は全面ダイヤモンドキルト柄で、(1)均一な繰り返しパターンとしてCSSでも再現可能、(2)Cute Popのtile.back.base(R1候補E、キルトクッション)と酷似、の二重の理由で機械レビューにより却下。中央を無地に保ち装飾を単一の隅アクセントへ絞ったpromptで再生成(C2)** |

3案ともfaceの単純な色反転に見えない(黒紺 vs アイボリー、型押し vs 印刷線という異なる素材表現)。24px縮小でも◆状態オーバーレイの視認性を損なわない。

## 機械レビュー総評(推奨、最終判断は人間に委ねる)

```text
table.background:            推奨なし(3案とも高品質。世界観のトーンで選択)
                              A(親しみやすい灯り)/ B(墨絵の街、装飾やや密)/
                              C(旅のノート、最も物語性が強い) — 用途に応じて選択可
panel.paper.default:         A(記録用紙)が最も静かで汎用性が高く推奨。
                              B/Cも実用上問題なし
panel.modal.background:      B(挟み込まれた半透明紙)を推奨
                              (table.backgroundとの世界観連続性が最も強い)
panel.result.frame:          B(夜明け前の記念台紙)を推奨
                              (9-slice安全性・落ち着いた華やかさのバランス)。
                              Aも魅力的、Cは技術的問題を修正済みだが
                              最もシンプルな表現
button.primary.background:   A(街灯の光を閉じ込めた硝子)を推奨
                              (「押せる」という機能訴求が最も強い)
button.secondary.background: A(消えかけた鉛筆標識)を推奨
                              (primaryとの階層差が最も明瞭)
tile.face.base:               A(明るい記憶の紙片)またはC(古い写真の台紙)を推奨
                              (中央が最も静かで数字オーバーレイの可読性が高い)。
                              Bは縁のdetailがやや広く小型時のノイズ化リスクあり
tile.back.base:                A(封蝋紙+型押しの輪)を推奨
                              (型押し表現が最も明確、faceとの対比が強い)
```

## Batch 1/2/R1との統一感・Cute Pop差別化

Yorunoshirubeの8slotは深い黒紺・煤けた青・古紙アイボリー・街灯の琥珀という
共通色相を維持し、手描きの線・黒インクの濃度・角の丸み・光の色・紙の温度・
影の柔らかさ・輪郭の太さ・ノイズ密度をslot間で共有している。Cute Popの
アイシング/ジェリー/キルト/刺繍モチーフは一切流用せず、素材語彙を完全に
分離した(Cute Pop = 昼の玩具箱、Yorunoshirube = 夜の記録帳)。この分離は
機械レビューでも2件の実際の違反(table B初回案の和風建築、tile back C初回案の
キルト柄)を検出・修正する形で機能した。

## 証跡

- Gallery全体・8slot別section: `evidence/batch-3-yorunoshirube-round1/
  *-gallery-overview.png`, `batch3-*-section.png`
- production画面でのcandidate非漏洩確認: `production-*-no-candidate-leak.png`
- Cute Pop回帰(production final v5・Gallery fallback表示):
  `cutepop-regression-*.png`, `cutepop-gallery-batch3-fallback-message.png`
- skin切替のreload後永続化: `skin-switch-persists-after-reload.png`
- 自動検査: 24候補中24候補合格(寸法/透明余白or不透明契約/端接触/フリンジ/
  背景残り)。button.secondary候補Aは初回automated validation不合格
  (rejected-validation、余白不足)、margin調整により再prepareで合格。
  recordは`tools/asset-factory/soro-pon-ui/records/`、attempt archiveは
  `tools/asset-factory/soro-pon-ui/archive/yorunoshirube/`
- 機械コンテンツレビューによる却下・再生成: table.background B(和風建築)、
  panel.result.frame C(黒金高級UI風ベゼル)、tile.back.base C(全面キルト柄)
  の3件。いずれも却下理由と再生成後の差し替えをrecordの`rejectionReason`
  に記録済み
- visual regression: Gallery baselineは意図更新予定(このPack作成時点では
  未実行。実行後にこの節を更新する)

## 人間判断記入欄

```text
table.background: [A / B / C / REJECT]
panel.paper.default: [A / B / C / REJECT]
panel.modal.background: [A / B / C / REJECT]
panel.result.frame: [A / B / C / REJECT]
button.primary.background: [A / B / C / REJECT]
button.secondary.background: [A / B / C / REJECT]
tile.face.base: [A / B / C / REJECT]
tile.back.base: [A / B / C / REJECT]

Review note:
```

## 承認後のpromotion手順(候補1つにつき)

1. 採用candidateを `generated/candidates/` から `generated/final/` へ移動
2. 不採用candidateをcandidates/から除去し、recordの`approval`を
   `not-selected`(rejectionReason付き)へ、採用分を`promoted`へ更新
   (`placedAt`/`processedFile`/`promotedTo`/`promotedAt`/
   `skinVersionAtPromotion`を更新)
3. `yorunoshirube/skin.json` へ8slot定義を追加(status: final):
   - table.background: renderMode cover, intrinsicSize 1920x1080
     (transparentフィールドなし=不透明)
   - panel.paper.default: renderMode nine-slice, intrinsicSize 384x256,
     nineSlice 24, contentSafeArea 12, minRenderSize 64x64, transparent true
   - panel.modal.background: renderMode nine-slice, intrinsicSize 512x384,
     nineSlice 24, contentSafeArea 16, minRenderSize 96x96, transparent true
   - panel.result.frame: renderMode nine-slice, intrinsicSize 512x384,
     nineSlice 32, contentSafeArea 16, minRenderSize 96x96, transparent true
   - button.primary.background / button.secondary.background: renderMode
     nine-slice, intrinsicSize 240x72, nineSlice 16, contentSafeArea 8,
     minRenderSize 72x44, transparent true
   - tile.face.base / tile.back.base: renderMode stretch,
     intrinsicSize 300x400, transparent true
4. yorunoshirube skin version 1 -> 2(初のfinal資産)
5. GalleryのBatch 3レビューセクション(`Batch3YorunoshirubeCandidateReview.tsx`)
   を削除
6. `pnpm skin:validate` / `pnpm test` / `pnpm typecheck` / `pnpm build`
7. `pnpm test:visual`(対象画面のみ差分が出るのでdiff確認の上baseline更新。
   yorunoshirube側にfinal資産が入るとTOP/MatchSetup/Matchのbaselineにも
   影響する可能性があるため、Gallery以外の差分も丁寧に確認すること)
8. request 012-015のApproval Statusを更新、このPackへ結果を追記
9. commit / push / CI確認

## 却下時

- 各requestのApproval Statusへ`rejected(修正指示)`を記録し、
  修正prompt生成から再実行(candidate上限3を維持、不要になった候補は
  not-selectedへ)
- 技術的懸念(tile.face.base Bの小型時ノイズ化リスクなど)は、却下ではなく
  「修正指示付き再生成」または軽微な追加加工での解消を推奨
