# Asset Request: 演出テクスチャ (effect.*)

## Purpose

勝負どころの演出素材3種: result burst / wildcard glow / score pop。

## Used By

ResultFrame・TileCard・ScoreBreakdown(slot: `effect.result.burst`, `effect.wildcard.glow`, `effect.score.pop`)

## Required Size / Format

- 透過PNG 512x512(burst)/ 256x256(glow, pop)
- 加算合成前提の明るい素材

## Visual Direction

- ランタン琥珀の光 / 黒インクの飛沫
- 常時表示ではなく一瞬の強調のみ

## Must Avoid

- 常時パーティクル前提の連番大量画像 / ビビッド色

## Fallback If Missing

CSS glow(sp-lantern-glow系)で表示済み

## Acceptance Checklist

- [ ] reduced-motion時は使用されない(CSS側で制御)
