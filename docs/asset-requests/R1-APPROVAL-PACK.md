# R1 Approval Pack (request 008 / 009)

cute-popのR1候補の人間レビュー用資料。R1は**完了**(3slotともfinal昇格済み)。

- 対象request: [008](008-cute-pop-tile-face-back.md) / [009](009-cute-pop-button-primary.md)
- 状態: **COMPLETE — 3slotとも人間承認・final昇格・runtime統合・検証済み**

## 最終承認結果 (2026-07-16, approvalSource: user-provided-human-decision)

```text
cute-pop/tile.face.base:            D (アイシングクッキー枠)
cute-pop/tile.back.base:            E (キルトクッション)
cute-pop/button.primary.background: D (ジェリーキャンディCTA)
```

採用理由の詳細は各requestのRound 2 Approval and Promotionセクション参照。
不採用(E/F face, D/F back, E/F button)はnot-selectedとしてrecordに理由付きで記録。
round 1(A/B/C、全9候補)はCSSで再現可能なデザインとして却下済み(下記履歴)。

final path:

```text
tile.face.base:            generated/final/tile-face-base.png
tile.back.base:             generated/final/tile-back-base.png
button.primary.background:  generated/final/button-primary-background-2x.png
skin version: 3 -> 4
```

production証跡: `evidence/r1-final/`(Gallery TileCard states/Button variants、
実MatchSetup/Match画面、Yorunoshirube回帰確認)。candidateレビュー時の証跡は
`evidence/r1-round1/`(却下済み)・`evidence/r1-round2/`(採用元)に保持。

## Round 1 結果 (2026-07-16)

round 1 (A/B/C、9候補)は人間レビューで**全slot却下**
(approvalSource: user-provided-human-decision)。

```text
却下理由: CSSで再現できるデザイン(単純フラット面・単純枠・単純ドット)に
留まっており画像生成を使う価値がない。画像生成でしか実現できない質感・
手描き感・立体感のある可愛いデザイン(売れているカジュアルゲーム水準の
様式参考。IPコピーは不可)へ振り切ること。
```

処理: 9候補のrecordをrejected(理由付き)へ更新しpublic candidatesから除去。
attempt archiveと証跡(evidence/r1-round1/)は監査のため保持。
round 1の候補表・推奨は履歴としてこの下に残すが、**現行レビュー対象は
round 2 (D/E/F)** である。

## 完了後の実物確認方法

R1候補レビュー専用のGalleryセクションはfinal昇格に伴い削除済み。
実際の見た目は標準コンポーネントで確認する:

1. `pnpm dev` → `#/gallery` → SkinをCute Popへ切り替え →
   「TileCard states」「Button variants」セクション(標準表示)
2. または `#/`(TOP)→ まず遊ぶ → 対局開始 → 実際の手牌/捨て牌/CTAで確認
3. 静的証跡: `evidence/r1-final/*.png`

## Round 2 候補一覧と所見(採用元。history)

### tile.face.base(牌表面)

| 候補 | コンセプト | 所見(機械レビュー) |
|---|---|---|
| D | アイシングクッキー枠 | 立体的なicing質感。24pxでもクッキー縁として成立。中央無地でDOM上乗せと干渉なし |
| E | 水彩ブラッシュ四隅+手描き線 | 水彩の有機的な滲み。上品で軽い。24pxではブラッシュがほぼ見えなくなる |
| F | キャンディビーズ枠 | ビーズ1粒ずつに光沢。四隅の星が可愛い。24pxでビーズがやや点ノイズ化する懸念 |

### tile.back.base(牌裏面)

| 候補 | コンセプト | 所見(機械レビュー) |
|---|---|---|
| D | 手描きトイモチーフ柄 | 星・ハート・花の手描きパターン。表面との区別明確。中央もモチーフが乗るため◆の視認は要確認 |
| E | キルトクッション | ふかふかの立体キルト。均一パターンで中央静か。表裏の区別・質感とも最良のバランス |
| F | ジェリー+スプリンクル | 光沢ジェリー+スプリンクル。最も菓子的で目立つ。24-30pxでスプリンクルが点ノイズ化する懸念 |

### button.primary.background(メインCTA)

| 候補 | コンセプト | intrinsic | 所見(機械レビュー) |
|---|---|---|---|
| D | ジェリーキャンディCTA | 480x96 | gloss帯が水平一様で9-slice安全。長文でもseamなし。candy質感が最も強い |
| E | アイシングパイピングCTA | 480x120 | icing縁が均一幅で9-slice安全。secondaryとの階層差明確 |
| F | マカロンCTA | 480x136 | 全帯水平一様で9-slice安全。filling線が可愛いが、白文字がfilling線と交差する高さでは要確認 |

機械レビュー上は3slotとも9-slice/可読性の失格候補なし。選定は人間レビューに委ねる。

## Round 1 候補一覧(履歴・全却下済み)

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

- round 2行別スクリーンショット: `evidence/r1-round2/desktop-1280x800-row1..9-*.png`
  (row1-3=face D/E/F、row4-6=back D/E/F、row7-9=button D/E/F)
- round 2小型横画面: `evidence/r1-round2/phone-844x390-row1..9-*.png`
- ヨルノシルベ回帰なし: `evidence/r1-round2/yorunoshirube-gallery-regression-check.png`
- round 1証跡(却下済み履歴): `evidence/r1-round1/`
- 自動検査: 全candidate合格(寸法/透明余白/端接触/フリンジ/背景残り)。
  recordは `tools/asset-factory/soro-pon-ui/records/`、
  attempt archiveは `tools/asset-factory/soro-pon-ui/archive/cute-pop/`
- visual regression: 32/32 green(Gallery baselineは意図更新、TOP/MatchSetup無変更)

## 実施したpromotion手順(記録)

1. 採用candidate(face D / back E / button D)を `generated/candidates/`
   から `generated/final/` へ移動(final化直前に hash 照合・
   validate_candidate.py 再検査を実施、3件とも合格)
2. 不採用候補(face E/F, back D/F, button E/F)をcandidates/から除去し、
   recordの`approval`を`not-selected`(rejectionReason付き)へ、
   採用分を`promoted`へ更新
   (`placedAt`/`processedFile`/`promotedTo`/`promotedAt`/
   `skinVersionAtPromotion=4`を記録)
3. `cute-pop/skin.json` へslot定義を追加(status: final):
   - tile.face.base / tile.back.base: renderMode stretch,
     intrinsicSize 600x800, pixelDensity 2, transparent true
   - button.primary.background: renderMode nine-slice,
     intrinsicSize 480x96(候補Dの実寸), pixelDensity 2,
     nineSlice 32, nineSliceRender 16, contentSafeArea 16,
     minRenderSize 72x44, transparent true
4. skin version 3 -> 4
5. Gallery の R1レビューセクション(`R1TileButtonCandidateReview.tsx`)を削除
6. `pnpm skin:validate` / `pnpm test` / `pnpm typecheck` / `pnpm build` 全green
7. `pnpm test:visual`: 現行baselineに対し実行しGallery(両skin x 5サイズ、
   レビューセクション削除によるレイアウト下移動のみ)以外ゼロdiffを確認。
   diff画像を目視確認した上でGalleryのみbaseline更新、再実行で32/32 green
8. ブラウザでruntime統合確認(TOP→スキン切替→対局→手牌/selected/捨て牌/
   CTA全状態、Yorunoshirube回帰なし)、production証跡取得
9. request 008/009 のApproval Statusを更新、このPackへ結果を追記
10. commit(4分割)・push・CI確認
