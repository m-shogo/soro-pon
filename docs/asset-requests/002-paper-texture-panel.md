# Asset Request: 紙パネル背景 (panel.paper.default / emphasis)

## Purpose

紙パネルの質感。標準と、ランタンに照らされた強調(emphasis)の2種。

## Used By

PaperPanel / Modal(slot: `panel.paper.default`, `panel.paper.emphasis`)

## Required Size / Format

- 9-slice可能な透過PNG(例 384x256, slice 24px)または敷き詰め用テクスチャ
- 文字なし

## Visual Direction

- design target 02/03 の古紙(黄ばみ・繊維・端の汚れ)
- emphasisは少し明るく暖色寄り

## Must Avoid

- 真っ白 / 強い黄色 / 印刷風の均一さ

## Fallback If Missing

CSSグラデーション+影(sp-paper-panel)で表示済み

## Acceptance Checklist

- [ ] 上に黒インク文字を置いて十分なコントラスト
- [ ] 9-slice引き伸ばしで縁が破綻しない
