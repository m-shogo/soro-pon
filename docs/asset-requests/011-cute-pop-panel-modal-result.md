# Asset Request: Cute Pop モーダル面・結果フレーム (panel.modal.background / panel.result.frame)

## Skin / Slot

- skin: `cute-pop`
- slots: `panel.modal.background`, `panel.result.frame`
- generation method: **Codex CLI起点画像生成**(docs/IMAGE-ASSET-WORKFLOW.md 8工程)
- status: **candidates生成予定・人間レビュー前提(final昇格前で停止)**
- target files (candidates): `generated/candidates/panel-modal-background-candidate-*.png`,
  `generated/candidates/panel-result-frame-candidate-*.png`
- art direction: [BATCH-2-ART-DIRECTION.md](BATCH-2-ART-DIRECTION.md)
- 1request統合の理由: 両slotともnine-slice paperパネル系で、
  render契約・9-slice安全性要件・content safe area責務が同型のため

## Purpose

- `panel.modal.background`: きせかえ/確認/エラー等、複数種類のmodalで
  共用される中密度パネル。可読性優先
- `panel.result.frame`: 対局終了後の達成感・勝敗・スコア・再戦導線を
  支える高視認フレーム。Batch 2中もっとも華やか

## Used By

`panel.modal.background`:
- `PaperPanel`(`Modal.tsx`が`assetSlot="panel.modal.background"`で指定)
- consumer: `Dialog`(確認/中断/削除、MatchScreen/TopScreen/DeckEditorScreen
  から使用)、`TopScreen`のきせかえmodal(直接`Modal`使用)
- 内容差: 短い確認文(中断確認)、長文(きせかえのスキン説明)、
  primary/secondary/ghostボタンの組み合わせ

`panel.result.frame`:
- `PaperPanel`(`ResultFrame.tsx`が`assetSlot="panel.result.frame"`で指定)
- consumer: `ResultScreen`のみ
- 内容差: 勝利(ツモ/ロン、役リスト+スコア内訳)、流局(短文)、
  再戦/collection/back to topボタン

## Render Contract

両slotともSKIN-CONTRACT.json準拠:

```text
panel.modal.background:
  renderMode: nine-slice
  intrinsicSize: 512x384
  nineSlice: {top:24, right:24, bottom:24, left:24}
  contentSafeArea: {top:16, right:16, bottom:16, left:16}
  minRenderSize: {width:96, height:96}

panel.result.frame:
  renderMode: nine-slice
  intrinsicSize: 512x384
  nineSlice: {top:32, right:32, bottom:32, left:32}
  contentSafeArea: {top:16, right:16, bottom:16, left:16}
  minRenderSize: {width:96, height:96}
```

`transparent`フィールドはcontractに明記されていないが、`PaperPanel`は
角丸+box-shadowのCSSホスト上にnine-slice画像を重ねる構造のため、
既存final(panel.paper.default等)と同様に**透過PNG**として生成する
(角丸の外側を透明にし、CSS border-radiusとの二重描画を避ける)。

## Codex CLI Command

```
pnpm asset:image:generate \
  --prompt-file tools/asset-factory/soro-pon-ui/prompts/panel-modal-background/<candidate>.txt \
  --output-name <output>.png

pnpm asset:image:generate \
  --prompt-file tools/asset-factory/soro-pon-ui/prompts/panel-result-frame/<candidate>.txt \
  --output-name <output>.png
```

## Prompt

Prompt本文: `tools/asset-factory/soro-pon-ui/prompts/panel-modal-background/*.txt`,
`tools/asset-factory/soro-pon-ui/prompts/panel-result-frame/*.txt`

共通必須要素: Cute Pop UI asset, front-facing, isolated panel/frame object,
no text, no letters, no logo, no watermark, no known/existing game
characters, chroma-key green background, sufficient transparent margin,
9-slice safety(四隅の固有装飾はcorner領域内、top/bottom中央帯は水平一様、
left/right中央帯は垂直一様、中央领域は完全に無地でcontent safe areaを
侵さない)、small-screen readability at minRenderSize 96x96、material
value must come from tactile hand-crafted detail that cannot be
reproduced as a simple CSS border/gradient/dot pattern/stripe
pattern/box shadow。

panel.modal.background追加要素: quiet/low-contrast center for body text
readability, warm paper/craft-card material, restrained corner
decoration only。

panel.result.frame追加要素: celebratory but neutral(works for win/lose/
draw), toy-box/embroidery/storybook material, festive edge decoration,
quiet center for score/role-list/button legibility, no "WIN"/"LOSE" text,
no crown/trophy motif baked into the center。

## Background Color

`#00ff00`(高彩度グリーン)

## Processing Command

```
pnpm asset:image:prepare --skin cute-pop --slot panel.modal.background \
  --input <raw> --request 011-cute-pop-panel-modal-result \
  --output-name panel-modal-background-candidate-<a|b|c>.png \
  --fit-width 512 --fit-height 384 --fit-margin-ratio 0.02 \
  --background-color '#00ff00' --hard-threshold 0.12 --soft-threshold 0.35 \
  --despill-strength 0.6 --expected-width 512 --expected-height 384 \
  --min-padding 4 --prompt-file <該当prompt>

pnpm asset:image:prepare --skin cute-pop --slot panel.result.frame \
  --input <raw> --request 011-cute-pop-panel-modal-result \
  --output-name panel-result-frame-candidate-<a|b|c>.png \
  --fit-width 512 --fit-height 384 --fit-margin-ratio 0.02 \
  --background-color '#00ff00' --hard-threshold 0.12 --soft-threshold 0.35 \
  --despill-strength 0.6 --expected-width 512 --expected-height 384 \
  --min-padding 4 --prompt-file <該当prompt>
```

## Visual Direction

`panel.modal.background`: クラフト紙・絵本カードの素材感(紙繊維・淡い
印刷ずれ・鉛筆線)。中密度。cream/paper系ベース。

`panel.result.frame`: 玩具箱のフレーム(リボン・木製ビーズ・紙吹雪)。
Batch 2中最も高密度・華やか。rose-pink/pastel yellowの装飾を増量するが
中央content safe areaは静かに保つ。

## Must Avoid

共通: 文字焼き込み、既存IPコピー、green fringe、9-slice中央帯への
固有detail侵入、content safe areaへの装飾侵入

panel.modal.background: 本文領域を狭める過剰装飾、close buttonとの競合

panel.result.frame: 勝利専用の演出(WIN文字、王冠焼き込み)、敗北時に
不自然な祝勝表現、スコア/ボタン領域への装飾侵入、紙吹雪過多で中央が
華美になりすぎる

## Fallback If Missing

CSSグラデーション+box-shadow(`sp-paper-panel`)で表示済み。

## Acceptance Checklist

- [ ] minRenderSize 96x96で四隅・縁が破綻しない
- [ ] 長文(きせかえ説明/役リスト+スコア内訳)でcontentSafeAreaを侵さない
- [ ] 9-slice中央帯(top/bottom/left/right)が均一でseamが出ない
- [ ] 勝利/流局どちらの文脈でもresult.frameが不自然にならない
- [ ] 5サイズ×両skinで確認(cute-pop以外は変化しないこと)
- [ ] 透明境界にフリンジ・背景色残りがない

## Approval Status(承認状態)

- [ ] candidate(レビュー待ち)
- [ ] approved(final昇格可)
- [ ] rejected(修正指示: )
