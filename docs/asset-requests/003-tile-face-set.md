# Asset Request: 牌フェイス一式 (tile.face.* / tile.back.base)

## Purpose

牌の表面(base/selected/ronAvailable/tsumoAvailable)と裏面。

## Used By

TileCard(slot: `tile.face.base`, `tile.face.selected`, `tile.face.ronAvailable`, `tile.face.tsumoAvailable`, `tile.back.base`)

## Required Size / Format

- 3:4比率の透過PNG(例 300x400)。中央は絵文字/イラストが乗るため空ける
- 上部22%はカテゴリ帯が乗る(半透明でよい)
- 文字なし

## Visual Direction

- design target 07 の紙札(丸角・紙の厚み・薄い影)
- selected/ron/tsumoはランタン縁光の強さで差を出す(ron/tsumoが最も強い)
- 裏面は黒インクの菱形紋

## Must Avoid

- 文字焼き込み / 中央の濃い模様 / 麻雀牌の直接コピー

## Fallback If Missing

CSSグラデーション+border(sp-tile系)で表示済み

## Acceptance Checklist

- [ ] 44pxまで縮小しても選択状態が判別できる
- [ ] カテゴリ帯・名前テキストと干渉しない
