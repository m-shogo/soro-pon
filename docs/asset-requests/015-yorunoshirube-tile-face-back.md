# Asset Request: ヨルノシルベ 記憶の欠片・封じられた記憶 (tile.face.base / tile.back.base)

## Skin / Slot

- skin: `yorunoshirube`
- slots: `tile.face.base`, `tile.back.base`
- generation method: **Codex CLI起点画像生成**
- status: **candidates配置済み・自動検査合格・人間承認待ち**
- candidate limit: 最大3/slot(合計最大6)
- art direction: [BATCH-3-YORUNOSHIRUBE-ART-DIRECTION.md](BATCH-3-YORUNOSHIRUBE-ART-DIRECTION.md)
- 昇格禁止: このroundではfinal昇格を行わない

## Purpose

`tile.face.base`は「記憶の欠片」— 最も明るい紙材質で、数字/柄オーバーレイの
可読性を最優先する。`tile.back.base`は「封じられた記憶」— 黒い封蝋紙に
地図の逆刻印(faceとは異なるモチーフ)。

範囲外(明示): `tile.face.selected` / `tile.face.ronAvailable` /
`tile.face.tsumoAvailable`はADR-015によりbase合成レイヤー化済みのため
このrequestでは生成しない。

## Used By

- `TileCard.tsx`
- 画面: Match(手牌/捨て牌/相手手牌/壁牌)、Gallery

## Render Contract

```text
tile.face.base / tile.back.base:
  renderMode: stretch / intrinsicSize 300x400 (3:4)
  transparent: true
```

## Codex CLI Command

```
pnpm asset:image:generate \
  --prompt-file tools/asset-factory/soro-pon-ui/prompts/tile-face-base/<candidate>.txt \
  --output-name <output>.png

pnpm asset:image:generate \
  --prompt-file tools/asset-factory/soro-pon-ui/prompts/tile-back-base/<candidate>.txt \
  --output-name <output>.png
```

## Prompt

共通必須要素: game UI asset, Yorunoshirube original skin (original
setting, not real commercial IP), a portrait rounded-rectangle mahjong-tile
-like game-tile background (3:4), front-facing, isolated object only, no
text/letters/numerals/pip glyph/watermark/logo (numerals/pips are
overlaid by the app later), no known character, chroma-key green
background, generous even margin, material value from paper fiber/ink
edge/hand-drawn unevenness -- not CSS-reproducible.

`tile.face.base`追加要素: the brightest paper material in the family, a
clean ink-edge border, the center area must stay quiet/low-detail so a
dark numeral/pip overlay stays highly legible at 24-96px render sizes.

`tile.back.base`追加要素: sealed black paper, a faint pressed/embossed
relief (not printed ink) suggesting the reverse of a map -- must look
like a *relief/emboss*, not a printed line drawing, and must be visually
distinct from `table.background`'s printed street-line motif.

## Background Color

`#00ff00`

## Processing Command

```
pnpm asset:image:prepare --skin yorunoshirube --slot tile.face.base \
  --input <raw> --request 015-yorunoshirube-tile-face-back \
  --output-name tile-face-base-candidate-<a|b|c>.png \
  --fit-width 300 --fit-height 400 --fit-margin-ratio 0.02 \
  --background-color '#00ff00' --hard-threshold 0.12 --soft-threshold 0.35 \
  --despill-strength 0.6 --expected-width 300 --expected-height 400 \
  --min-padding 4 --prompt-file <該当prompt>

pnpm asset:image:prepare --skin yorunoshirube --slot tile.back.base \
  --input <raw> --request 015-yorunoshirube-tile-face-back \
  --output-name tile-back-base-candidate-<a|b|c>.png \
  --fit-width 300 --fit-height 400 --fit-margin-ratio 0.02 \
  --background-color '#00ff00' --hard-threshold 0.12 --soft-threshold 0.35 \
  --despill-strength 0.6 --expected-width 300 --expected-height 400 \
  --min-padding 4 --prompt-file <該当prompt>
```

## Visual Direction

face/backは同じ紙ファミリーの表裏として一貫させつつ、faceは明るく静か、
backは暗く「封じられた」質感。24px(最小)から96px(最大)まで判読性を保つ。

## Must Avoid

- 文字・数字・柄の焼き込み(アプリ側でオーバーレイされるため)
- 既存IPコピー、green fringe
- 中央領域への強い装飾(数字オーバーレイの可読性を損なう)
- Cute Popのアイシングクッキー枠/キルトクッションモチーフの流用
- backがfaceの単純な色反転に見える(封蝋紙の質感が必要)
- 純黒ベタ塗り(素材感がない)

## Fallback If Missing

CSSトークン(`--sp-gradient-tile-face`/`--sp-gradient-tile-back`)で
表示済み(未変更)。

## Acceptance Checklist

- [ ] 24px/30px/42px/54px/96pxで判読性を保つ(縮小時に潰れない)
- [ ] face中央が静かで数字/柄オーバーレイのコントラストを損なわない
- [ ] back がfaceの単純な色反転に見えない(異なるモチーフ)
- [ ] selected/ron/tsumo/dimmed/discard状態(CSS合成)を想定して破綻しない
- [ ] 透明境界にフリンジ・背景色残りがない

## Approval Status(承認状態)

- [x] candidate(レビュー待ち)
- [ ] approved
- [ ] rejected

`approvalSource: pending-human-decision`。人間レビュー未実施
(Batch 3 round 1)。
