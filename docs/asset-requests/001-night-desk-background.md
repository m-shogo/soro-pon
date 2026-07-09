# Asset Request: 夜机背景 (table.background)

## Purpose

対局卓の背景。夜の机・古い木目・ランタンの淡い光だまり。

## Used By

GameTableLayout(slot: `table.background`)

## Required Size / Format

- 1920x1080 WebP/PNG(@2x相当)。中央60%が卓面として使える構図
- 文字なし・キャラなし

## Visual Direction

- design target 07/08 の卓面トーン(焦げ茶〜黒、中央がわずかに明るい)
- 上右にランタン光のにじみ

## Must Avoid

- 既存IP要素 / 明るい色 / ビビッドな彩度 / 文字

## Fallback If Missing

CSSグラデーション(sp-fallback-table-bg)で表示済み

## Acceptance Checklist

- [ ] 844x390に縮小しても牌と文字の可読性を邪魔しない
- [ ] 中央にコントラストの強い模様がない
