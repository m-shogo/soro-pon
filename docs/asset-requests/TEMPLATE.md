# Asset Request: <タイトル> (<slot名>)

## Skin / Slot

- skin: `<skin-id>`
- slots: `<slot名>`
- target files (candidates): `generated/candidates/<file>`

## Purpose

<何のためのアセットか。どの画面のどの部品か>

## Used By

<使用コンポーネント/画面(slot経由)>

## Generation Method(生成方式)

- [ ] プログラム生成(scripts/ の決定的スクリプト)
- [ ] 画像生成系(Codex CLI起点。docs/IMAGE-ASSET-WORKFLOW.md の8工程に従う)

画像生成系の場合:

- 背景色: `#00ff00`(素材に緑が含まれるなら分離可能な単色へ変更し、ここへ記録)
- 透過処理: 色距離+2段しきい値+despill(IMAGE-ASSET-WORKFLOW.mdの契約に従う)
- 生成記録: `tools/asset-factory/soro-pon-ui/records/<file>.json`

## Render Contract

- renderMode / pixelDensity / intrinsicSize / nineSlice / nineSliceRender /
  contentSafeArea / minRenderSize / transparent

## Visual Direction

<方向性。design target参照があれば明記>

## Must Avoid

<禁止事項(過剰光沢・文字焼き込み・端の暗いビネット等)>

## Fallback If Missing

<CSS/token fallbackの現状>

## Acceptance Checklist

- [ ] 最小〜最大サイズで縁・四隅が破綻しない
- [ ] 上に載る文字のコントラスト(意味色token基準)
- [ ] 5サイズ×両スキンで確認
- [ ] 透明境界にフリンジ・背景色残りがない(画像生成系)

## Approval Status(承認状態)

- [ ] candidate(レビュー待ち)
- [ ] approved(final昇格可)
- [ ] rejected(修正指示: )
