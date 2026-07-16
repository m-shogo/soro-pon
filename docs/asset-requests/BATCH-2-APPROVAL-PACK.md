# Batch 2 Approval Pack (request 010 / 011)

Cute PopのBatch 2候補9点(table.background 3案、panel.modal.background 3案、
panel.result.frame 3案)の人間レビュー用資料。ここだけ読めば承認判断と
承認後のpromotion操作ができる状態を目指している。

- 対象request: [010](010-cute-pop-table-background.md)(table.background) /
  [011](011-cute-pop-panel-modal-result.md)(panel.modal.background /
  panel.result.frame)
- art direction: [BATCH-2-ART-DIRECTION.md](BATCH-2-ART-DIRECTION.md)
- 状態: **candidates配置済み・自動検査合格・人間承認待ち**
- **final昇格・manifest登録・skin version変更は未実施**
  (cute-pop skin.jsonは引き続き**version 4**のまま。R1 final
  (tile.face.base/tile.back.base/button.primary.background)は無変更)

## 何を見るか

1. `pnpm dev` → `#/gallery` → SkinをCute Popへ切り替え →
   「Batch 2候補レビュー」セクション(table.background/panel.modal.background/
   panel.result.frameの3小節、各3候補)
2. または静的証跡: `evidence/batch-2-round1/*.png`
3. 判断基準はrequest 010/011のAcceptance Checklist、および下記の
   機械レビュー所見

## 候補一覧と機械レビュー所見

### table.background(cover、1920x1080、opaque)

| 候補 | コンセプト | 所見 |
|---|---|---|
| A | パステル布プレイマット | 繊維の織り目・軽い縫い目・四隅の玩具箱ディテール(星/クラウド/ハートのステッチアップリケ)が明確。中央は完全に静か。3 viewport crop全てで牌の可読性を妨げない |
| B | クラフト紙ゲームマット | 紙繊維+手描きの点線円・星スタンプ・washi tape風の角飾りが自然な絵本感。中央は淡いグラデーションのみで静か |
| C | フェルト+刺繍マット | フェルトの起毛質感+破線ステッチ全周+四隅のみ刺繍アップリケ(星/花)。中央はほぼ無地で最も落ち着いている |

3案ともCSSでは再現不可能な質感(繊維/紙目/フェルト起毛)を実現。緑色モチーフなし、chroma-key誤爆なし(全面alpha=255を確認済み)。牌・ボタンを実際に重ねた3 viewport(844x390/932x430/1366x768 crop相当)で可読性を確認、いずれも問題なし。

### panel.modal.background(nine-slice、512x384、nineSlice 24、transparent)

| 候補 | コンセプト | 所見 |
|---|---|---|
| A | 絵本カード | 色鉛筆の二重線+角のみ小花飾り。線がやや細く、修正前のレンダリング検証で装飾がR1候補A(却下済みのシンプル系)に近い印象を受けた。9-slice edge-band variance: top/bottom 18.7/20.2, left/right 24.0/22.5(3候補中もっとも不均一) |
| B | クッションパイピングパネル | 立体的なクッション膨らみ+パイピング+角のみ刺繍X印。陰影のグラデーションが視覚的に最も豊か。edge-band variance: top/bottom 3.6/2.6(最も均一)、left/right 43.0/42.4(ただし目視では角の丸み由来で装飾自体は角に収まっている) |
| C | 玩具箱ラベルカード | クラフト紙+ステッカー跡(角のみ)+手描きの縁。edge-band variance: top/bottom 12.1/12.6, left/right 26.8/26.3(中間) |

**「長い本文でのcontent safe area確認」表示(高さ引き伸ばし)で3案とも
四隅装飾の変形なし・中央帯のseamなしを目視確認**。B の左右variance
数値が高いのは角の丸み(border-radius)によるサンプリング境界の影響で、
実際の装飾範囲はcorner zone内に収まっている(視覚的に確認済み)。

### panel.result.frame(nine-slice、512x384、nineSlice 32、transparent)

| 候補 | コンセプト | 所見 |
|---|---|---|
| A | 玩具箱リボンフレーム | 四隅のリボン+ビーズ+紙吹雪で3案中もっとも華やか。**「長い役リスト+スコア+ボタン(tall)」表示でリボンの結び目部分が縦伸縮により歪む/尖る挙動を実機で確認(9-slice seam)**。edge-band variance: left/right 42.3/42.7(3候補中最大)。装飾がnineSlice=32の corner領域を超えて中央帯へ食い込んでいる可能性が高い |
| B | 刺繍ワッペン風フレーム | 全周に均一な破線ステッチ+四隅の星パッチ。**tall表示でも変形なし、9-slice挙動が3候補中もっとも安全**。edge-band variance: top/bottom 5.9/8.6, left/right 18.8/18.8(最小) |
| C | 絵本見開きフレーム | 手描きの祝福装飾(星/渦巻き/紙吹雪)を角に集中。落ち着いた華やかさ。edge-band variance: top/bottom 12.8/14.2, left/right 16.4/16.3 |

3案とも勝敗どちらの文脈でも使える中立的なデザイン(WIN/LOSE文字・王冠・特定役の焼き込みなし)。**候補Aは9-slice安全性の観点で技術的懸念があり、採用する場合はcontentSafeArea/nineSlice値の見直しか、候補自体の再生成が必要**。

## 機械レビュー総評(推奨、最終判断は人間に委ねる)

```text
table.background:            推奨なし(3案とも高品質。世界観のトーンで選択)
                              A(親しみやすい玩具箱)/ B(絵本的な温かさ)/
                              C(最も静かで上品) — 用途に応じて選択可
panel.modal.background:      B(クッションパイピング)が立体感・可読性の
                              バランスで優位。ただしA/Cも実用上問題なし
panel.result.frame:          B(刺繍ワッペン風)を機械レビュー推奨
                              (9-slice安全性が最も高く、華やかさも十分)。
                              Aは魅力的だが採用前にtall表示での変形を
                              人間が実際に確認すること
```

## R1 finalとの統一感

table.background(A/B/Cいずれも cream/paper系ベース+寒色差し色)は
R1のアイシングクッキー(暖色クリーム)・キルトクッション(ローズピンク)と
色相を分けつつ、暖かい焦げ茶の輪郭線という共通作法を維持。
panel.result.frame(特にA)のrose-pink/pastel-yellow装飾はR1のCTA色と
呼応するが、背景全面には使っておらず主役性を奪わない。3slotとも
「全部お菓子」に見えないよう、玩具箱・布・紙という異なる素材を採用。

## 証跡

- 候補行別スクリーンショット: `evidence/batch-2-round1/desktop-1366x768-row1..9-*.png`
  (row1-3=table A/B/C、row4-6=modal A/B/C、row7-9=result A/B/C)
- 小型横画面: `evidence/batch-2-round1/phone-844x390-row1..9-*.png`
- 5 viewport overview: `evidence/batch-2-round1/*-overview-viewport.png`
- production R1 finalの回帰なし確認: `evidence/batch-2-round1/production-top-r1-regression.png`,
  `production-matchsetup-r1-regression.png`
- ヨルノシルベ回帰なし: `evidence/batch-2-round1/yorunoshirube-gallery-regression-check.png`
- 自動検査: 全9候補合格(寸法/透明余白or全面不透明/端接触/フリンジ/背景残り)。
  recordは `tools/asset-factory/soro-pon-ui/records/`、
  attempt archiveは `tools/asset-factory/soro-pon-ui/archive/cute-pop/`
- visual regression: 32/32 green(Gallery baselineは意図更新、TOP/MatchSetup無変更)

## 人間判断記入欄

```text
table.background: [A / B / C / REJECT]
panel.modal.background: [A / B / C / REJECT]
panel.result.frame: [A / B / C / REJECT]

Review note:
```

## 承認後のpromotion手順(候補1つにつき)

1. 採用candidateを `generated/candidates/` から `generated/final/` へ移動
2. 不採用candidateをcandidates/から除去し、recordの`approval`を
   `not-selected`(rejectionReason付き)へ、採用分を`promoted`へ更新
   (`placedAt`/`processedFile`/`promotedTo`/`promotedAt`/
   `skinVersionAtPromotion`を更新)
3. `cute-pop/skin.json` へslot定義を追加(status: final):
   - table.background: renderMode cover, intrinsicSize 1920x1080
     (transparentフィールドなし=不透明)
   - panel.modal.background: renderMode nine-slice, intrinsicSize 512x384,
     nineSlice 24, contentSafeArea 16, minRenderSize 96x96, transparent true
   - panel.result.frame: renderMode nine-slice, intrinsicSize 512x384,
     nineSlice 32, contentSafeArea 16, minRenderSize 96x96, transparent true
   (候補Aが採用され9-slice問題が実際に確認された場合は、昇格前に
   再生成または軽微な追加加工で解消してから昇格すること)
4. skin version 4 -> 5
5. GalleryのBatch 2レビューセクション(`Batch2CandidateReview.tsx`)を削除
   (`Batch2CandidateReview.tsx`内で使用しているレビュー専用の明示
   `borderWidth`補完はGallery専用コードのため、セクション削除と同時に
   不要になる)
6. `pnpm skin:validate` / `pnpm test` / `pnpm typecheck` / `pnpm build`
7. `pnpm test:visual`(対象画面のみ差分が出るのでdiff確認の上baseline更新。
   table.backgroundが加わるとMatchScreen/Matchのbaselineにも影響する
   可能性があるため、Gallery以外の差分も丁寧に確認すること)
8. request 010/011のApproval Statusを更新、このPackへ結果を追記
9. commit / push / CI確認

## 却下時

- 各requestのApproval Statusへ`rejected(修正指示)`を記録し、
  修正prompt生成から再実行(candidate上限3を維持、不要になった候補は
  not-selectedへ)
- panel.result.frame候補Aのような9-slice技術的懸念は、却下ではなく
  「修正指示付き再生成」または「同コンセプトの縮小版corner decoration」
  での再挑戦を推奨
