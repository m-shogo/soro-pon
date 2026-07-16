# Asset Request: ヨルノシルベ 紙パネル三部作 (panel.paper.default / panel.modal.background / panel.result.frame)

## Skin / Slot

- skin: `yorunoshirube`
- slots: `panel.paper.default`, `panel.modal.background`, `panel.result.frame`
- generation method: **Codex CLI起点画像生成**
- status: **closed(2026-07-16、technical remediation完了)**: 3slotとも
  final昇格済み。`panel.paper.default`(candidate A)と`panel.result.frame`
  (candidate B)は初回promotion時にBLOCKED_BY_TECHNICAL_VALIDATIONと
  なったが、承認済みの意匠を変更せずlandscape full-bleed構図のみを修正した
  corrected attempt(A2/B2)を再生成し、2026-07-16にfinal昇格した
  (下記Technical Remediation Record参照)
- candidate limit: 最大3/slot(合計最大9)
- 1request統合の理由: 3slotとも nine-slice 紙パネル系で、
  render契約・9-slice安全性要件・content safe area責務が同型のため
  (Cute Pop request 011と同じ統合方針)
- art direction: [BATCH-3-YORUNOSHIRUBE-ART-DIRECTION.md](BATCH-3-YORUNOSHIRUBE-ART-DIRECTION.md)
- 承認結果・promotion記録: [BATCH-3-YORUNOSHIRUBE-APPROVAL-PACK.md](BATCH-3-YORUNOSHIRUBE-APPROVAL-PACK.md)

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

- [x] partially approved / partially blocked(下記参照)
- [ ] candidate
- [ ] rejected

`approvalSource: user-provided-human-decision`(2026-07-16)。
人間承認: panel.paper.default=A, panel.modal.background=B, panel.result.frame=B。

Review note(人間レビュー原文の要旨): panel.paper.defaultは最も頻繁に
使われる共通パネルとして最も静かである必要があり、紙繊維+軽いインク縁の
Aがlist/long text/empty/formなど多用途対応と静けさのバランスで優位。
panel.modal.backgroundは地図帳に挟まれた重要な記録という役割にBが最も合い、
table.background Cとの世界観連続性がある。panel.result.frameは夜明け前の
淡い紫と小さな光による対局終了時の余韻、勝敗中立性、nine-slice安全性の
バランスでBが優位。

## Promotion Record(2026-07-16)

- **panel.modal.background: 昇格済み**。採用: candidate-b →
  `generated/final/panel-modal-background.png`(無加工)。不採用: A, C
  (`not-selected`)。skin version 1→2、production証跡確認済み
- **panel.paper.default: BLOCKED_BY_TECHNICAL_VALIDATION**。人間承認(A)は
  記録・保持しているが、promotion前の技術再検査でcandidate Aのalpha
  bounding boxがcanvas幅の43%しかないことが判明(他昇格slotは92-96%)。
  実際のnine-slice fill描画をMatchSetup実画面(380px幅パネル)で確認した
  ところ、パネル内に縮小したカードが浮いて見える不具合を確認(border-image
  計算とPIL alpha bbox測定の両方で検証)。**候補を勝手に別案へ差し替えず**、
  final化を見送り既存CSS tokenフォールバックを維持。修正要件: 同コンセプトで
  不透明領域がcanvas幅/高さの90%以上を占める構図で再生成すること
- **panel.result.frame: BLOCKED_BY_TECHNICAL_VALIDATION**。人間承認(B)は
  記録・保持しているが、panel.paper.defaultと同じ理由(alpha bbox幅48%)で
  final化を見送り。修正要件は同上
- production証跡: `evidence/batch-3-yorunoshirube-final/
  modal-skin-select-yorunoshirube-final.png`(panel.modal.background),
  `matchsetup-paper-panel-fallback.png` / `result-screen-paper-fallback.png`
  (panel.paper.default/panel.result.frameのfallbackが破綻なく表示されることの確認。
  この時点ではまだBLOCKED状態)
- visual regression: 33/33 green(この時点での状態)

## Technical Remediation Record(2026-07-16)

panel.paper.default(A)とpanel.result.frame(B)のBLOCKED_BY_TECHNICAL_
VALIDATIONを解消。新規に追加したalpha bounding-box occupancy検査
(`--min/max-content-width-ratio`等、`validate_candidate.py`)を用いて
根本原因(portrait被写体がlandscape canvas中央に小さく配置される欠陥)を
再現・修正した。

```text
panel.paper.default:
  human decision: A(変更なし、再選択を求めていない)
  original attempt: candidate A(blocked technical)
  corrected attempt: A2
  correction type: landscape full-bleed geometry(意匠・素材・配色は不変)
  old bbox width ratio: 42.97%
  new bbox width ratio: 95.83%
  old bbox height ratio: 96.09%
  new bbox height ratio: 94.53%
  final path: generated/final/panel-paper-default.png
  final hash: 1e7a8242d62076e3a0156d0e33db0196ecc9d97c2244954d3a6a2f29bdf6905a
  promoted version: v3
  result: promoted

panel.result.frame:
  human decision: B(変更なし、再選択を求めていない)
  original attempt: candidate B(blocked technical)
  corrected attempt: B2
  correction type: landscape full-bleed geometry(意匠・素材・配色は不変)
  old bbox width ratio: 47.66%
  new bbox width ratio: 96.09%
  old bbox height ratio: 96.09%
  new bbox height ratio: 94.53%
  final path: generated/final/panel-result-frame.png
  final hash: a49b6aadeba75888c5690579306ee7604b61431daf2b0c349cb0db15a141fffb
  promoted version: v3
  result: promoted
```

visual identity retained: true(同じ古紙アイボリー+黒インク縁 / 同じ淡い紫
+紙の積層+複数の小さな金の光。old-vs-new比較証跡:
`evidence/batch-3-blocker-remediation/panel-paper-old-vs-a2.png`,
`panel-result-old-vs-b2.png`)。HUMAN_REVIEW_REQUIRED_FOR_VISUAL_DRIFTには
該当しなかったため、standing human approvalをそのまま適用してpromotion。

旧blocked candidate(A, B)のrecordは`not-selected`
(rejectionReason: superseded-by-corrected-attempt)へ更新、元の技術的欠陥は
`technicalBlocker`フィールドに保持。archiveのraw/candidate/compareは
削除せず保持。

yorunoshirube skin version: 2 → 3。全8slot(Batch 3 core全て)がfinal。
production証跡: `evidence/batch-3-blocker-remediation/`。
visual regression: 33/33 green(remediation後の最終確認)。
