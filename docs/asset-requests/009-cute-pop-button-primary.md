# Asset Request: Cute Pop メインCTAボタン面 (button.primary.background)

## Skin / Slot

- skin: `cute-pop`
- slot: `button.primary.background`
- generation method: **Codex CLI起点画像生成**(docs/IMAGE-ASSET-WORKFLOW.md 8工程)
- status: **closed(final昇格済み)**。candidate D(ジェリーキャンディCTA)採用
- final path: `generated/final/button-primary-background-2x.png`
  (cute-pop skin.json version 4、intrinsicSize 480x96)
- round 1(A/B/C)は全却下。round 2のE/Fはnot-selected

## Round 1 Rejection (2026-07-16, approvalSource: user-provided-human-decision)

候補A/B/Cを人間レビューで却下。理由は request 008 と同一:
CSSで再現可能な単純フラット面のため。round 2はcandy/jelly/icing/macaron等、
画像生成でしか実現できない質感・立体感のCTAへ方向転換する。
9-slice安全性(中央帯の水平一様性)・白文字コントラスト・文字焼き込み禁止は維持。
round 1候補はrejected recordとしてarchiveに保持。

## Round 2 Approval and Promotion (2026-07-16, approvalSource: user-provided-human-decision)

```text
button.primary.background: D (ジェリーキャンディCTA) を採用
  理由: 3候補中もっともメインCTAとしての主役感が強い。CSS gradientだけ
  では出しにくい厚み・透明感・内部発光・柔らかい反射を持つ。secondary
  buttonとの差が明確で、押せそうな弾力と光沢があり主要操作として
  直感的に認識しやすい。水平gloss帯が一様で9-sliceの横伸縮に適し、
  長文でもseamが出ないことをレビュー時に確認済み
  E(アイシングパイピング)は牌表面D(アイシングクッキー)と素材表現が
  重なりすぎ画面全体がお菓子の縁取りだらけになりやすいため、
  F(マカロン)はfilling線と白文字が交差する可能性がありラベル配置の
  自由度を下げるため不採用
```

Promotion技術検証(final化直前に実ファイルを再検査、合格):

```text
- record.contentHashと実ファイルhashの一致確認
- validate_candidate.py再検査(issues: [])
- gloss帯・下辺の厚みが水平方向に一様であることを目視確認(9-slice安全性)
- min幅(72px)/通常/長文/2行ラベルすべてでseamが出ないことを
  実TileCard/Buttonでのレビュー時に確認済み(evidence/r1-round2/)
```

Runtime統合確認: cute-pop skin.json version 4でbutton.primary.background
(nine-slice, intrinsicSize 480x96, pixelDensity 2, nineSlice 32,
nineSliceRender 16, contentSafeArea 16, minRenderSize 72x44)を登録。
ブラウザでTOP/MatchSetup(対局開始CTA)/Match(捨てる/ツモ/ロン)で
ジェリー光沢が適用され、disabled状態(捨てる牌未選択時)でも視認できる
ことを確認。secondary(白カード)との階層差は明確。Yorunoshirubeは
未登録(CSS fallbackのまま、回帰なし)。

## Purpose

ほぼ全画面で使われるメインCTA(primary button)の背景。現在cute-popで
final未制作の最重要ギャップ(docs/ASSET-PRODUCTION-ROADMAP.md Batch 2先行分。
ユーザー指示によりBatch 1と同時に着手)。

## Used By

- `Button`(variant="primary"、slot経由)
- 画面: TOP/DeckList/DeckEditor/MatchSetup/Match(捨てる・ロン・ツモ)/Result等
- 状態: 通常 / hover(brightness 1.12) / pressed / focus-visible /
  disabledは別slot(button.disabled.background)へ分岐するため本画像は不担当
- 文字: DOMで白文字(--sp-text-on-primary #ffffff)+subLabel2行目が乗る。
  **文字・アイコンを画像へ焼き込まない**
- 階層: secondary(白カード+暖ボーダー、final済み)より明確に強い面。
  cute-popのCTA色は濃ピンク(--sp-color-crimson #c22f57、白文字で4.5:1以上)

## Render Contract

- renderMode: nine-slice / pixelDensity: 2
- 1x契約(base manifest): intrinsicSize 240x72, nineSlice(source) 16,
  contentSafeArea(source) 8, minRenderSize(CSS) 72x44
- 2x候補: intrinsicSize 480x(候補ごとに96/104/128), nineSlice(source) 32,
  nineSliceRender(CSS) 16, contentSafeArea(source) 16, minRenderSize(CSS) 72x44(不変)
- 処理パラメータの試行記録: 当初480x144 / margin 0.08で処理したところ、
  生成pillのアスペクト(3.8〜5.1:1)が契約10:3より横長のため高さfillが
  55〜74%となり、nine-sliceのslice領域(source 32px)が透明余白で占められて
  CTA面が痩せて見える問題を確認。canvasを生成pillの実アスペクトへ合わせ
  (480x96/104/128)、margin 0.05(min-padding 4px確保)へ調整して再処理した。
  採用候補のintrinsicSizeはskin.json登録時にこの実寸を使う
  (validatorは宣言intrinsicSizeと実ファイル寸法の一致を検査する)
- 透過PNG。角丸は均一・上下左右対称。中央帯は完全に無地
  (水平・垂直stretchでseamが出ない9-slice安全設計)

## Codex CLI Command

```
pnpm asset:image:generate \
  --prompt-file tools/asset-factory/soro-pon-ui/prompts/button-primary-background/<candidate>.txt \
  --output-name <output>.png
```

## Prompt

Prompt本文: `tools/asset-factory/soro-pon-ui/prompts/button-primary-background/*.txt`

必須要素: Cute Pop UI asset, primary CTA button background, deep pink
(#c22f57系), white text will be overlaid later, no text, no letters,
no icon, no watermark, isolated object, flat solid chroma-key background,
sufficient transparent margin, 9-slice safety(角/辺の責務分離、中央無地)。

## Background Color

`#00ff00`(高彩度グリーン。被写体はピンク系のため色分離可)

## Processing Command

```
pnpm asset:image:prepare --skin cute-pop --slot button.primary.background \
  --input <raw-green内のraw画像> --request 009-cute-pop-button-primary \
  --output-name button-primary-background-candidate-<a|b|c>.png \
  --fit-width 480 --fit-height 144 --fit-margin-ratio 0.08 \
  --background-color '#00ff00' --hard-threshold 0.12 --soft-threshold 0.35 \
  --despill-strength 0.6 --expected-width 480 --expected-height 144 \
  --min-padding 4 --prompt-file <該当prompt>
```

## Visual Direction

- cute-popのCTA: 濃ピンク基調(白文字コントラストWCAG AA以上を維持)
- secondary(白+暖ボーダー)と一目で区別できる「押すべき」強さ
- フラット基調。過剰光沢・3Dベベル・強グラデ禁止(軽い上下トーン差まで)
- 既存final群(白カード+暖色ボーダー言語)の中で主役として浮く

## Must Avoid

- 文字・アイコン焼き込み / 中央帯の固有ディテール(9-slice seamの原因)
- secondaryと紛らわしい白面・薄い面
- 白文字が読めなくなる明るい面・強パターン
- focusリング(#b35c00+白halo)と衝突する縁色

## Fallback If Missing

CSSグラデーション(--sp-gradient-button-primary)+白文字で表示済み。

## Acceptance Checklist

- [ ] minRenderSize 72x44で四隅・縁が破綻しない
- [ ] 白文字コントラスト4.5:1以上(中央面の実測)
- [ ] 長い日本語ラベル・subLabel2行でもseamが出ない
- [ ] secondaryとの階層差が明確
- [ ] focus-visibleリングと干渉しない
- [ ] 5サイズ×両スキンで確認(cute-pop以外は変化しないこと)
- [ ] 透明境界にフリンジ・背景色残りがない

## Approval Status(承認状態)

- [ ] candidate(レビュー待ち)
- [x] approved(final昇格可) — candidate D
- [ ] rejected(修正指示: )

Request closed 2026-07-16. final: `generated/final/button-primary-background-2x.png`(cute-pop v4)。
