# Asset Manifest (soro-pon UI)

UIコンポーネントは **asset slot名** だけを知る。画像パスの直書きは禁止。

## 差し替え手順

```text
1. Codex画像生成などでPNGを作る(text焼き込み禁止 / 透過推奨)
2. public/assets/ui/soro-pon/generated/final/ に targetFile 名で置く
3. asset-slots.json の該当slotを status: "final" / file: "<ファイル名>" に更新する
4. DOM構造・ロジック・レイアウトは変更しない(背景として重なるだけ)
```

fileがnullの間は、コンポーネントのCSS/SVG fallbackで表示される。

## Slots

| Slot | 用途 | 使用コンポーネント | Target File | 状態 |
|---|---|---|---|---|
| `table.background` | 対局卓の夜机背景全体 | GameTableLayout | `generated/final/table-background.png` | placeholder |
| `table.overlay.ink` | 卓上の黒インク染みオーバーレイ | GameTableLayout | `generated/final/table-overlay-ink.png` | placeholder |
| `table.overlay.light` | ランタン光のにじみオーバーレイ | GameTableLayout | `generated/final/table-overlay-light.png` | placeholder |
| `panel.paper.default` | 標準の紙パネル背景 | PaperPanel, Modal | `generated/final/panel-paper-default.png` | placeholder |
| `panel.paper.emphasis` | 選択中/強調の紙パネル背景 | PaperPanel | `generated/final/panel-paper-emphasis.png` | placeholder |
| `panel.modal.background` | モーダルの紙背景 | Modal | `generated/final/panel-modal-background.png` | placeholder |
| `panel.result.frame` | Result画面の記憶帳フレーム | ResultFrame | `generated/final/panel-result-frame.png` | placeholder |
| `button.primary.background` | 主要CTA(深紅)ボタン背景 | Button variant=primary | `generated/final/button-primary-background.png` | placeholder |
| `button.secondary.background` | 紙ボタン背景 | Button variant=paper | `generated/final/button-secondary-background.png` | placeholder |
| `button.danger.background` | 危険操作ボタン背景 | Button variant=danger(将来) | `generated/final/button-danger-background.png` | placeholder |
| `button.disabled.background` | 無効ボタン背景 | Button disabled | `generated/final/button-disabled-background.png` | placeholder |
| `tile.face.base` | 牌の表面ベース | TileCard | `generated/final/tile-face-base.png` | placeholder |
| `tile.face.selected` | 選択中の牌表面 | TileCard selected | `generated/final/tile-face-selected.png` | placeholder |
| `tile.face.ronAvailable` | ロン対象牌の強調表面 | TileCard emphasis=ron | `generated/final/tile-face-ron-available.png` | placeholder |
| `tile.face.tsumoAvailable` | ツモあがり牌の強調表面 | TileCard emphasis=tsumo | `generated/final/tile-face-tsumo-available.png` | placeholder |
| `tile.back.base` | 牌の裏面 | TileCard faceDown | `generated/final/tile-back-base.png` | placeholder |
| `badge.warning.background` | 警告バッジ背景 | Badge variant=warning | `generated/final/badge-warning-background.png` | placeholder |
| `badge.info.background` | 情報バッジ背景 | Badge variant=info | `generated/final/badge-info-background.png` | placeholder |
| `effect.result.burst` | Result/あがり時のバースト演出 | ResultFrame, Match win演出 | `generated/final/effect-result-burst.png` | placeholder |
| `effect.wildcard.glow` | wildcard使用時の光演出 | TileCard, ScoreBreakdown | `generated/final/effect-wildcard-glow.png` | placeholder |
| `effect.score.pop` | 得点ポップ演出 | ScoreBreakdown | `generated/final/effect-score-pop.png` | placeholder |

## Rules

```text
- デザインターゲット画像(docs/design-targets/)は参照専用。runtime素材にしない
- クリック判定/状態管理/レイアウトは画像に依存しない
- 文字は画像に焼き込まない
- shared deck JSONに画像情報を入れない
- user import由来の画像/URLを公式UI assetにしない
- 既存IP素材を置かない
```
