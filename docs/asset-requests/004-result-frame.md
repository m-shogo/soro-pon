# Asset Request: Result記憶帳フレーム (panel.result.frame)

## Purpose

Result画面の記憶帳(ノート)風フレーム。

## Used By

ResultFrame(slot: `panel.result.frame`)

## Required Size / Format

- 9-slice可能な透過PNG(例 512x384, slice 32px)
- 文字なし

## Visual Direction

- design target 09 のリングノート/古紙の綴じ帳
- 勝者・得点が主役。フレームは静かに

## Must Avoid

- 派手な装飾 / 文字 / 強い赤

## Fallback If Missing

PaperPanel fallbackで表示済み

## Acceptance Checklist

- [ ] 内側に得点内訳テキストを置いて読みやすい
