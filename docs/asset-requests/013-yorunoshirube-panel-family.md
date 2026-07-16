# Asset Request: ヨルノシルベ 紙パネル三部作 (panel.paper.default / panel.modal.background / panel.result.frame)

## Skin / Slot

- skin: `yorunoshirube`
- slots: `panel.paper.default`, `panel.modal.background`, `panel.result.frame`
- generation method: **Codex CLI起点画像生成**
- status: **candidates配置済み・自動検査合格・人間承認待ち**
- candidate limit: 最大3/slot(合計最大9)
- 1request統合の理由: 3slotとも nine-slice 紙パネル系で、
  render契約・9-slice安全性要件・content safe area責務が同型のため
  (Cute Pop request 011と同じ統合方針)
- art direction: [BATCH-3-YORUNOSHIRUBE-ART-DIRECTION.md](BATCH-3-YORUNOSHIRUBE-ART-DIRECTION.md)
- 昇格禁止: このroundではfinal昇格を行わない

## Purpose

- `panel.paper.default`: Top/MatchSetup/DeckEditor等で使う汎用の記録カード。
  最も出現頻度が高く、最も静か
- `panel.modal.background`: ページの間に挟まれた重要な記録。可読性優先の中密度
- `panel.result.frame`: 旅journalの締めくくりの表紙。Batch 3中もっとも高密度、
  複数の小さな光(before-dawn afterglow)

## Used By

- `panel.paper.default`: `PaperPanel.tsx`(default variant)。Top/MatchSetup/
  DeckEditorの汎用パネル
- `panel.modal.background`: `PaperPanel.tsx` via `Modal.tsx`
  (`assetSlot="panel.modal.background"`)。Dialog(確認/エラー)、
  Topのきせかえmodal
- `panel.result.frame`: `PaperPanel.tsx` via `ResultFrame.tsx`。ResultScreenのみ

## Render Contract

```text
panel.paper.default:
  renderMode: nine-slice / intrinsicSize 384x256
  nineSlice: {top:24,right:24,bottom:24,left:24}
  contentSafeArea: {top:12,right:12,bottom:12,left:12}
  minRenderSize: {width:64,height:64} / transparent

panel.modal.background:
  renderMode: nine-slice / intrinsicSize 512x384
  nineSlice: {top:24,right:24,bottom:24,left:24}
  contentSafeArea: {top:16,right:16,bottom:16,left:16}
  minRenderSize: {width:96,height:96} / transparent

panel.result.frame:
  renderMode: nine-slice / intrinsicSize 512x384
  nineSlice: {top:32,right:32,bottom:32,left:32}
  contentSafeArea: {top:16,right:16,bottom:16,left:16}
  minRenderSize: {width:96,height:96} / transparent
```

(数値はSKIN-CONTRACT.jsonおよびcute-pop request 011と同一契約形状)

## Codex CLI Command

```
pnpm asset:image:generate \
  --prompt-file tools/asset-factory/soro-pon-ui/prompts/<slot-dir>/<candidate>.txt \
  --output-name <output>.png
```

slot-dir: `panel-paper-default` / `panel-modal-background` / `panel-result-frame`

## Prompt

共通必須要素: game UI asset, Yorunoshirube original skin (original setting,
not any real commercial IP), front-facing, isolated panel/frame object, no
text, no letters, no logo, no watermark, no known character, chroma-key
green background, sufficient transparent margin, 9-slice safety(四隅固有
装飾はcorner領域内、top/bottom中央帯は水平一様、left/right中央帯は垂直
一様、中央領域は完全無地でcontent safe areaを侵さない)、small-screen
readability at minRenderSize、material value from paper fiber/black ink
bleed/hand-drawn line/soft light -- not CSS-reproducible.

`panel.paper.default`追加要素: quiet record-card paper, faint ruled/map
guide lines, restrained ink-edge border only, lowest density of the three.

`panel.modal.background`追加要素: an inserted paper/envelope-flap texture,
slightly brighter center than the record card for body-text readability,
restrained corner decoration only.

`panel.result.frame`追加要素: before-dawn commemorative journal cover,
several small quiet lantern-light accents distributed around the edge (not
one dominant burst), works for win/lose/draw contexts equally, no "WIN"/
"LOSE" text, no crown/trophy motif, quiet center for score/role-list/button
legibility.

## Background Color

`#00ff00`

## Processing Command

```
pnpm asset:image:prepare --skin yorunoshirube --slot panel.paper.default \
  --input <raw> --request 013-yorunoshirube-panel-family \
  --output-name panel-paper-default-candidate-<a|b|c>.png \
  --fit-width 384 --fit-height 256 --fit-margin-ratio 0.02 \
  --background-color '#00ff00' --hard-threshold 0.12 --soft-threshold 0.35 \
  --despill-strength 0.6 --expected-width 384 --expected-height 256 \
  --min-padding 4 --prompt-file <該当prompt>

pnpm asset:image:prepare --skin yorunoshirube --slot panel.modal.background \
  --input <raw> --request 013-yorunoshirube-panel-family \
  --output-name panel-modal-background-candidate-<a|b|c>.png \
  --fit-width 512 --fit-height 384 --fit-margin-ratio 0.02 \
  --background-color '#00ff00' --hard-threshold 0.12 --soft-threshold 0.35 \
  --despill-strength 0.6 --expected-width 512 --expected-height 384 \
  --min-padding 4 --prompt-file <該当prompt>

pnpm asset:image:prepare --skin yorunoshirube --slot panel.result.frame \
  --input <raw> --request 013-yorunoshirube-panel-family \
  --output-name panel-result-frame-candidate-<a|b|c>.png \
  --fit-width 512 --fit-height 384 --fit-margin-ratio 0.02 \
  --background-color '#00ff00' --hard-threshold 0.12 --soft-threshold 0.35 \
  --despill-strength 0.6 --expected-width 512 --expected-height 384 \
  --min-padding 4 --prompt-file <該当prompt>
```

## Visual Direction

BATCH-3-YORUNOSHIRUBE-ART-DIRECTION.md の material hierarchy / color
rules / light hierarchy / density hierarchy に従う。3slotとも同じ紙の
「温度」を共有しつつ、密度は table < paper.default < modal < result の順。

## Must Avoid

共通: 文字焼き込み、既存IPコピー、green fringe、9-slice中央帯への固有
detail侵入、content safe areaへの装飾侵入、Cute Popのアイシング/ジェリー/
キルト/刺繍モチーフの流用、純黒ベタ塗り、強い純白フィールド

`panel.result.frame`: 勝利専用演出の焼き込み、敗北時に不自然な祝勝表現、
紙吹雪過多、単一の巨大な光源(複数の小さな光であること)

## Fallback If Missing

CSSトークン(`--sp-gradient-panel-paper`等)+box-shadowで表示済み(未変更)。

## Acceptance Checklist

- [ ] minRenderSize(64x64 / 96x96 / 96x96)で四隅・縁が破綻しない
- [ ] 長文(きせかえ説明/役リスト+スコア内訳)でcontentSafeAreaを侵さない
- [ ] 9-slice中央帯が均一でseamが出ない
- [ ] 勝利/流局どちらの文脈でもresult.frameが不自然にならない
- [ ] 5サイズ×両skinで確認(cute-pop以外は変化しないこと)
- [ ] 透明境界にフリンジ・背景色残りがない
- [ ] 3slotが同じ紙材質ファミリーに見える(温度・光・粒度が揃う)

## Approval Status(承認状態)

- [x] candidate(レビュー待ち)
- [ ] approved
- [ ] rejected

`approvalSource: pending-human-decision`。人間レビュー未実施
(Batch 3 round 1)。
