# Asset Request: Cute Pop メインCTAボタン面 (button.primary.background)

## Skin / Slot

- skin: `cute-pop`
- slot: `button.primary.background`
- generation method: **Codex CLI起点画像生成**(docs/IMAGE-ASSET-WORKFLOW.md 8工程)
- status: **candidates生成済み・人間レビュー待ち(final昇格前で停止)**
- target files (candidates): `generated/candidates/button-primary-2x-*.png`

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
- 2x候補: intrinsicSize 480x144, nineSlice(source) 32, nineSliceRender(CSS) 16,
  contentSafeArea(source) 16, minRenderSize(CSS) 72x44(不変)
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

- [x] candidate(レビュー待ち)
- [ ] approved(final昇格可)
- [ ] rejected(修正指示: )
