# Asset Request: Yorunoshirube 情報バッジ面 (badge.info.background)

## Skin / Slot

- skin: `yorunoshirube`
- slot: `badge.info.background`
- target files (candidates): `generated/candidates/badge-info-background-candidate-{a,b,c}.png`
- status: **closed(final昇格済み・候補A採用・2026-07-17)**

## Purpose

Cute Pop側はすでにfinal(request 007, candidate B, v3)。Yorunoshirube側の
`badge.info.background`はA-class parity gapとして、Batch 4 consumer audit
(`docs/asset-requests/BATCH-4-YORUNOSHIRUBE-APPROVAL-PACK.md`参照)で
画像生成対象と判定された唯一のslot。他の装飾slot(badge.warning /
table.overlay.ink / table.overlay.light / panel.paper.emphasis)は同audit
でCSS-token/shared overlayのまま十分と判定されたため、この request の
対象外。

## Used By

- `Badge.tsx`(`variant="info"`) 経由
- 実consumer: `CollectionScreen`(記憶コイン/称号)、`DeckEditorScreen`・
  `DeckDetailScreen`・`DeckListScreen`・`ValidationIssueList`(検証結果の
  info行)、`AppRoot`、Component Gallery

## Generation Method(生成方式)

- [x] 画像生成系(Codex CLI起点。docs/IMAGE-ASSET-WORKFLOW.md の8工程に従う)

- 背景色: `#00ff00`(被写体は暖色/紙質のため緑との衝突なし。request 007と同じ判断)
- 透過処理: 色距離+2段しきい値+despill(chroma_key.py既定値、request 007/012-015と同一)
- 実行コマンド:
  ```
  pnpm asset:image:prepare --skin yorunoshirube --slot badge.info.background \
    --input <raw-green内のraw画像> --request 016-yorunoshirube-badge-info-background \
    --fit-width 240 --fit-height 80 --fit-margin-ratio 0.08 \
    --background-color '#00ff00' --hard-threshold 0.12 --soft-threshold 0.35 \
    --despill-strength 0.6 --expected-width 240 --expected-height 80 --min-padding 4 \
    --min-content-width-ratio 0.40 --max-content-width-ratio 0.98 \
    --min-content-height-ratio 0.30 --max-content-height-ratio 0.95 \
    --max-content-center-offset-ratio 0.06 \
    --prompt-file <該当prompt>
  ```
  (検査成功時のみcandidatesへ配置。詳細はdocs/IMAGE-ASSET-WORKFLOW.md)
- 生成記録: `tools/asset-factory/soro-pon-ui/records/yorunoshirube-badge-info-background-*.json`(自動生成)

## Render Contract

Cute Pop final(request 007)・SKIN-CONTRACT.jsonを正本として再確認した契約:

```
renderMode: nine-slice
pixelDensity: 2
intrinsicSize: 240x80 (2x候補。1x契約は120x40)
transparent: true
nineSlice (source): 16,16,16,16
nineSliceRender (CSS): 8,8,8,8
contentSafeArea (source): 8,8,8,8
minRenderSize (CSS): 24x20
```

このslotは非常に小さく表示される(minRenderSize 24x20)。大画面で美しくても
24x20で輪郭が潰れたら失格。

## Content Occupancy Threshold(badge専用・panelとは異なる)

Batch 3 remediationで追加したalpha bbox occupancy validatorをそのまま
panel用の90%閾値で流用しない(badgeはpanelと違い、意図的な小さな切り欠き・
非対称なタブ形状があり得るため)。

Cute Pop既存final/archived candidatesを実測し、健全な分布から閾値を決定した:

| 対象 | widthRatio | heightRatio | centerOffsetX | centerOffsetY |
|---|---|---|---|---|
| Cute Pop final(candidate B, ribbon tab) | 0.8417 | 0.4750 | 0.0000 | 0.0000 |
| Cute Pop archived candidate A(rounded paper label, not-selected) | 0.6792 | 0.8375 | 0.0021 | 0.0063 |
| Cute Pop archived candidate C(small ticket, not-selected) | 0.5708 | 0.8375 | 0.0021 | 0.0063 |

観測範囲: width比率 57-84%、height比率 47.5-84%、center offset ≤0.63%。
panel(92-96%)よりはるかに広い分布であることを確認した上で、以下を
badge専用閾値として採用する(明らかな欠陥だけを検出し、正当な形状の
多様性は誤検出しない、余裕を持たせた下限/上限):

```
min_content_width_ratio: 0.40
max_content_width_ratio: 0.98
min_content_height_ratio: 0.30
max_content_height_ratio: 0.95
max_content_center_offset_ratio: 0.06
```

検査項目(最低限):

- 小さなbadgeがcanvas中央に浮かない(center offset閾値で検出)
- 左右に過大な透明領域がない(width比率下限で検出)
- 24x20で輪郭が残る(別途small-size raster proofで目視確認、閾値だけでは
  保証できない)
- marginが非対称でない(center offset閾値で検出)
- deep notchがcollapsed shapeにならない(small-size raster proofで確認)

## Visual Direction

Batch 3の世界観(黒インク・地図帳・紙・小さな光)を維持し、装飾層のみを
定義した addendum を参照: `BATCH-4-YORUNOSHIRUBE-DECORATION-DIRECTION.md`

### Candidate A — 夜の索引タブ

薄い蝋引き紙。地図帳のページ端に付けた小さな索引。黒インクの不均一な縁。
ごく小さな琥珀の点。中央は完全に静か。最も汎用的で小型耐性重視。
button/panelに見えない直線的な索引構造(Cute Popのリボンとは異なる)。

### Candidate B — グラシン紙の記録ラベル

半透明のグラシン紙。薄い紙の積層。煤けた青灰。片隅に小さなインク印。
柔らかな紙繊維。画像生成でしか出しにくい透明紙質。
`panel.modal.background`(candidate B、グラシン紙質)との素材連続性。
小型でも輪郭が単純。

### Candidate C — 写真フィルムの見出し片

古い写真フィルムの乳剤感。黒紺の薄いタブ。片端に小さな光点。微細な印刷
ずれ。文字なし。記憶・記録の意味が強い。tile.face.baseの古写真候補とは
別の小型ラベル用途。ノッチや穴を多用しない。

## Must Avoid

- Cute Popと同じリボンタブ / 色替えコピー
- 大きな切符、左右に深いノッチ、丸いpill
- 通常buttonに見える立体感、大きなpanel frameに見える枠
- 大きな封蝋の紋章、本の表紙、複雑な地図、細かい街路線
- 文字・数字・アイコンの焼き込み
- 過剰な光沢・強い3Dベベル・過剰なグラデーション
- ノイズ状の質感、意味のない細密装飾
- nine-slice中央帯への非対称な装飾(スライス破綻の原因)
- CSSで再現可能な単純な単色・グラデーション・角丸・box-shadowだけの見た目
  (蝋引き紙/グラシン紙/写真乳剤/不規則インク/印刷ずれ等、手作り質感由来の
  価値が必須)

## Fallback If Missing

`--sp-color-paper-aged` / `--sp-color-ink-soft` トークンによるCSS面
(`Badge.tsx` / `.sp-badge--info`)で表示済み。severityはBadgeの文言
(`INFO`/`WARN`ラベル、`ValidationIssueList.tsx`)でも常に区別されるため、
このslotがplaceholderのままでも機能的な欠落はない。

## Acceptance Checklist

- [ ] 24x20 / 32x20 / 48x24 / 72x28 / 120x40 で縁・四隅が破綻しない
- [ ] 上に載る文字のコントラスト(意味色token基準) — DOM側でテキストを
  重ねるため、badge自体には文字を焼き込まない
- [ ] 5 viewport実画面(DeckEditor/DeckDetail/Collection/DeckList/Gallery)
- [ ] 透明境界にフリンジ・背景色残りがない
- [ ] badge専用occupancy閾値をpass
- [ ] Cute Popリボンの色違いになっていない(machine review)

## Promotion Procedure

1. 最大3候補生成・検査・Gallery比較・production-context preview・evidence
2. Approval Pack(`BATCH-4-YORUNOSHIRUBE-APPROVAL-PACK.md`)へ機械レビュー
   結果と候補一覧を記録
3. **human reviewで1候補選択、またはREJECT** — このrequestの範囲では
   実行しない
4. 承認後: `generated/final/`へ配置、`yorunoshirube/skin.json`へ登録、
   skin version bump、Gallery review UI削除、production consumer検証

## Approval Status(承認状態)

- [x] candidate — 3案(A: 夜の索引タブ / B: グラシン紙の記録ラベル /
      C: 写真フィルムの見出し片)すべて自動検査(寸法/透過/フリンジ/
      occupancy/nine-slice/24x20縮小proof)を通過。
- [x] **approved(final昇格済み)** — Human decision: **A(夜の索引タブ)**。
      `approvalSource: user-provided-human-decision` /
      `approvalDate: 2026-07-17`。
- [ ] rejected(修正指示: )

## Human Decision(2026-07-17)

```text
yorunoshirube/badge.info.background: A
concept: 夜の索引タブ
approvalSource: user-provided-human-decision
approvalDate: 2026-07-17
```

採用理由: 24x20の最小表示で輪郭が最も明確、occupancy width 84.17% /
height 82.50%・center offset X/Yともに0、細長すぎず長いラベルでも
nine-slice伸縮が安定、panel.paper.defaultの記録用紙と素材語彙が自然に
つながる、buttonや大きなpanelには見えない、Cute Popのリボンタブと
素材・形状が明確に異なる、中央content領域が完全に静かでDOM文字・iconを
妨げない。

## Promotion Record(2026-07-17)

```text
Candidate A: promoted
  Final path: public/assets/ui/soro-pon/skins/yorunoshirube/generated/final/badge-info-background.png
  Final hash: 2643f17472a1b9274f1ea5a88e5e650e3102feaf7ee5e7bc370cc71036736fe1
  Promoted version: yorunoshirube skin.json v3 -> v4
  Record: tools/asset-factory/soro-pon-ui/records/
    yorunoshirube-badge-info-background-badge-info-background-candidate-a-attempt-019f6df2-0e33-7a63-93b1-3cf64f284cb3.json
    (approval: promoted, skinVersionAtPromotion: 4)

Candidate B: not-selected
  Reason: 候補Aの方が24x20最小表示で輪郭が明確で、幅occupancyにも余裕があり、
    高頻度かつ可変幅のinfo badgeとして汎用性が高いため。Bの半透明グラシン紙質は
    魅力的だが、width ratio 61.7%と狭く、長いラベルでは左右の伸縮部分が
    相対的に大きくなりやすい。
  raw/compare/prompt/record/archive: 保持
    (tools/asset-factory/soro-pon-ui/archive/yorunoshirube/badge.info.background/candidate-b/)

Candidate C: not-selected
  Reason: 候補Aの方が既存の記録用紙panelとの素材連続性と小型可読性で優位なため。
    Cは記憶・記録の意味は強いが、暗い写真フィルム形状がwarningや状態ラベル寄りに
    見える可能性があり、汎用info badgeとしてはAが適切。
  raw/compare/prompt/record/archive: 保持
    (tools/asset-factory/soro-pon-ui/archive/yorunoshirube/badge.info.background/candidate-c/)

Production evidence:
  docs/asset-requests/evidence/batch-4-yorunoshirube-badge-info-final/

Validation (pre-promotion re-check): ok=true, issues=[]
Occupancy (re-measured, identical to original candidate measurement):
  widthRatio 0.8417 / heightRatio 0.8250 / centerOffsetX 0 / centerOffsetY 0
Minimum-size result: 24x20/32x20/48x24/72x28/120x40/長文幅すべてで
  輪郭・黒インク縁・琥珀点が破綻なし(BLOCKED_BY_TECHNICAL_VALIDATION該当なし)

Request status: closed
```
