# R1 Approval Pack (request 008 / 009)

cute-popのR1候補9点の人間レビュー用資料。ここだけ読めば承認判断と
承認後のpromotion操作ができる状態を目指している。

- 対象request: [008](008-cute-pop-tile-face-back.md) / [009](009-cute-pop-button-primary.md)
- 状態: **candidates配置済み・自動検査合格・人間承認待ち**
- final昇格・manifest登録・skin version変更は未実施(直接final禁止を維持)

## 何を見るか

1. Component Gallery (`#/gallery`) を開き、SkinをCute Popへ切り替える
2. 「R1候補レビュー」セクションで各候補を確認する
   (dev server: `pnpm dev`。静的証跡は `evidence/r1/*.png`)
3. 判断基準はrequest 008/009のAcceptance Checklist

## 候補一覧と推奨

### tile.face.base(牌表面)

| 候補 | コンセプト | 所見(機械レビュー) |
|---|---|---|
| A | 無地白+クリーム細フレーム | 最も安全。24pxでも破綻なし。装飾は最小 |
| B | 二重線+四隅ドット | ドットが54px以上で効く。24pxではほぼ見えない(ノイズ化はしない) |
| C | スカラップ(波形)フレーム | Cute Popらしさ最大。stretchで波形ピッチが牌サイズにより変わる点は要確認 |

推奨: **B**(存在感と安全性のバランス。Aは無難すぎてfallback CSSとの differentiationが弱く、Cはスカラップの縮小挙動が44px以下でやや不明瞭)。
最終判断は人間レビューに委ねる。

### tile.back.base(牌裏面)

| 候補 | コンセプト | 所見(機械レビュー) |
|---|---|---|
| A | パステル菱形格子 | 上品だが低コントラストで、表面との区別がやや弱い |
| B | 水玉(オレンジ) | 表面との区別が明確。24pxでもパターンが潰れない。◆マークと干渉しない |
| C | 斜めストライプ(ピンク) | 最も目立つが、24-30pxでストライプがモアレ気味になる |

推奨: **B**。却下条件: 相手牌サイズ(24-30px)で水玉がノイズに見える場合はA。

### button.primary.background(メインCTA)

| 候補 | コンセプト | intrinsic | 所見(機械レビュー) |
|---|---|---|---|
| A | フラット濃ピンク | 480x96 | 9-slice完全安全(中央無地)。白文字コントラスト良好 |
| B | 上半分ソフトトーン | 480x104 | トーン帯が水平に走り、伸縮してもseamなし。可愛さと立体感 |
| C | クリーム内側ライン | 480x128 | **内側ラインが中央帯で湾曲しており、横伸縮でラインが弓なりに変形する(9-slice安全性違反)。長文ボタンの証跡(row9)で確認可能** |

推奨: **B**(Aとの差: secondaryの白面に対しCTAの主役感が強い)。
**Cは9-slice契約違反のため非推奨**(採用するなら再生成が必要)。

## 証跡

- 行別スクリーンショット: `evidence/r1/desktop-1280x800-row1..9-*.png`
  (row1-3=face A/B/C、row4-6=back A/B/C、row7-9=button A/B/C)
- 小型横画面: `evidence/r1/phone-844x390-row1..9-*.png`
- ヨルノシルベ回帰なし: `evidence/r1/yorunoshirube-gallery-regression-check.png`
- 自動検査: 全candidate合格(寸法/透明余白/端接触/フリンジ/背景残り)。
  recordは `tools/asset-factory/soro-pon-ui/records/`、
  attempt archiveは `tools/asset-factory/soro-pon-ui/archive/cute-pop/`
- visual regression: 32/32 green(Gallery baselineは意図更新、TOP/MatchSetup無変更)

## 承認後のpromotion手順(候補1つにつき)

1. 採用candidateを `generated/candidates/` から `generated/final/` へ移動
2. 不採用candidateをcandidates/から除去し、recordの`approval`を
   `not-selected`(rejectionReason付き)へ、採用分を`promoted`へ更新
   (`placedAt`/`promotedTo`/`promotedAt`/`skinVersionAtPromotion`を更新)
3. `cute-pop/skin.json` へslot定義を追加(status: final):
   - tile.face.base / tile.back.base: renderMode stretch,
     intrinsicSize 600x800, pixelDensity 2, transparent true
   - button.primary.background: renderMode nine-slice,
     intrinsicSize 480x(96|104|128 採用候補の実寸), pixelDensity 2,
     nineSlice 32, nineSliceRender 16, contentSafeArea 16,
     minRenderSize 72x44, transparent true
4. skin version 3 -> 4
5. Gallery の R1レビューセクション(`R1TileButtonCandidateReview`)を削除
6. `pnpm skin:validate` / `pnpm test` / `pnpm typecheck` / `pnpm build`
7. `pnpm test:visual`(対象画面のみ差分が出るのでdiff確認の上baseline更新)
8. request 008/009 のApproval Statusを更新、このPackへ結果を追記
9. commit / push / CI確認

## 却下時

- 各requestのApproval Statusへ`rejected(修正指示)`を記録し、
  修正prompt生成から再実行(candidate上限3を維持、不要になった候補は
  not-selectedへ)
