# Asset Request: ヨルノシルベ 街灯ボタン対 (button.primary.background / button.secondary.background)

## Skin / Slot

- skin: `yorunoshirube`
- slots: `button.primary.background`, `button.secondary.background`
- generation method: **Codex CLI起点画像生成**
- status: **closed — final昇格済み(2026-07-16)**
- 採用: button.primary.background=A, button.secondary.background=B
- yorunoshirube skin.json: **version 2**、両slot登録済み
- candidate limit: 最大3/slot(合計最大6)
- art direction: [BATCH-3-YORUNOSHIRUBE-ART-DIRECTION.md](BATCH-3-YORUNOSHIRUBE-ART-DIRECTION.md)
- 承認結果・promotion記録: [BATCH-3-YORUNOSHIRUBE-APPROVAL-PACK.md](BATCH-3-YORUNOSHIRUBE-APPROVAL-PACK.md)

## Purpose

primaryは「強い導きの光」(街灯・ランタン)、secondaryは「弱まりつつある光/
鉛筆描きの道標」。同じ形状契約を共有しつつ、光の強さで役割を区別する。

## Used By

- `Button.tsx`(variant `primary` / `secondary`)
- 全画面のCTA/セカンダリアクション

## Render Contract

```text
button.primary.background / button.secondary.background:
  renderMode: nine-slice / intrinsicSize 240x72
  nineSlice: {top:16,right:16,bottom:16,left:16}
  contentSafeArea: {top:8,right:8,bottom:8,left:8}
  minRenderSize: {width:72,height:44} / transparent
```

focus/disabled状態は共有`Button`コンポーネントのCSS状態レイヤー
(focus ring token `--sp-focus-ring-color`、disabled opacity)で処理する。
別画像は作らない(Cute Popの`button.primary.background`と同じ扱い)。

## Codex CLI Command

```
pnpm asset:image:generate \
  --prompt-file tools/asset-factory/soro-pon-ui/prompts/button-primary-background/<candidate>.txt \
  --output-name <output>.png

pnpm asset:image:generate \
  --prompt-file tools/asset-factory/soro-pon-ui/prompts/button-secondary-background/<candidate>.txt \
  --output-name <output>.png
```

## Prompt

共通必須要素: game UI asset, Yorunoshirube original skin (original
setting, not real commercial IP), a wide landscape rounded-rectangle
button background (roughly 10:3), front-facing, isolated object only, no
text/letters/numerals/icon glyph/watermark/logo, no known character, the
horizontal middle band must stay uniform/seamless for 9-slice horizontal
stretch, all four corners uniform and symmetric, chroma-key green
background (`#00ff00`), generous even margin, material value from ink
edge, paper/lacquer sheen, hand-drawn unevenness -- not CSS-reproducible.

`button.primary.background`追加要素: a lit streetlamp/lantern glass
housing, warm amber glow (`#e8a23c` direction) strong enough to read as
"press this," ink-black housing frame, face must stay dark enough for
`--sp-text-on-primary` (`#f4ead2`) overlay text to reach strong contrast.

`button.secondary.background`追加要素: an unlit signpost or pencil-sketched
lamp outline, cooler and visibly dimmer than primary, aged paper/ink body
(`#241a10`/`#4a3a26` direction), quieter presence -- must not compete with
primary when placed side by side.

## Background Color

`#00ff00`

## Processing Command

```
pnpm asset:image:prepare --skin yorunoshirube --slot button.primary.background \
  --input <raw> --request 014-yorunoshirube-button-pair \
  --output-name button-primary-background-candidate-<a|b|c>.png \
  --fit-width 240 --fit-height 72 --fit-margin-ratio 0.02 \
  --background-color '#00ff00' --hard-threshold 0.12 --soft-threshold 0.35 \
  --despill-strength 0.6 --expected-width 240 --expected-height 72 \
  --min-padding 4 --prompt-file <該当prompt>

pnpm asset:image:prepare --skin yorunoshirube --slot button.secondary.background \
  --input <raw> --request 014-yorunoshirube-button-pair \
  --output-name button-secondary-background-candidate-<a|b|c>.png \
  --fit-width 240 --fit-height 72 --fit-margin-ratio 0.02 \
  --background-color '#00ff00' --hard-threshold 0.12 --soft-threshold 0.35 \
  --despill-strength 0.6 --expected-width 240 --expected-height 72 \
  --min-padding 4 --prompt-file <該当prompt>
```

## Visual Direction

primary/secondaryは同じ「街灯」語彙を共有しつつ、光の強さのみで差をつける
(primaryが点灯、secondaryが消灯/鉛筆描き)。Cute Popのジェリーキャンディ
CTAの語彙(グロス・ハイライト帯)は流用しない。

## Must Avoid

- 文字焼き込み、既存IPコピー、green fringe
- 中央帯への固有detail侵入(9-slice水平伸縮でseamになる)
- Cute Popのジェリー/アイシング語彙の流用
- primaryとsecondaryが同じ明るさに見える(役割が区別できない)
- 純黒ベタ塗りボタン(素材感がない)

## Fallback If Missing

CSSトークン(`--sp-gradient-button-primary`/`--sp-gradient-button-paper`)で
表示済み(未変更)。

## Acceptance Checklist

- [ ] minRenderSize 72x44で四隅・縁が破綻しない
- [ ] primary/secondaryを並べたとき光の強弱で役割が判別できる
- [ ] 9-slice中央帯が均一でseamが出ない
- [ ] `--sp-text-on-primary`/本文色との4.5:1コントラストを損なわない
- [ ] 透明境界にフリンジ・背景色残りがない

## Approval Status(承認状態)

- [x] approved(final昇格済み)
- [ ] candidate
- [ ] rejected

`approvalSource: user-provided-human-decision`(2026-07-16)。
人間承認: button.primary.background=A, button.secondary.background=B。

Review note(人間レビュー原文の要旨): primaryは街灯の光を閉じ込めた硝子
(A)が「押せる」印象と視覚的優先度を最も強く持ち、街灯・琥珀の光という
Yorunoshirubeの象徴を直接表現できる。secondaryは夜の切符(B)が切り欠きと
印刷ずれによって画像を使用する意味が明確で、primary Aの硝子と発光に対し
紙の実用品として明確に弱く見える。

## Promotion Record(2026-07-16)

- 採用: button-primary-background-candidate-a →
  `generated/final/button-primary-background.png`(無加工)
- 採用: button-secondary-background-candidate-b →
  `generated/final/button-secondary-background.png`(無加工)
- 不採用: primary B, C / secondary A, C(`not-selected`、rejectionReason
  記録済み。secondary A初回prepareはfit margin不足でrejected-validation
  となった履歴を保持し、margin調整による再prepare後の合格版を人間承認・
  not-selectedとして記録)
- skin version: 1 → 2
- production証跡: `evidence/batch-3-yorunoshirube-final/*-matchsetup.png`
  (対局開始ボタンのランタン発光)、TOP画面(まず遊ぶ等のsecondaryボタン)
- visual regression: 33/33 green
