# Asset Request: ヨルノシルベ 夜の地図帳・対局卓背景 (table.background)

## Skin / Slot

- skin: `yorunoshirube`
- slot: `table.background`
- generation method: **Codex CLI起点画像生成**(docs/IMAGE-ASSET-WORKFLOW.md 8工程)
- status: **planned — not yet generated**(このrequestはBatch 3の一部。
  art direction: [BATCH-3-YORUNOSHIRUBE-ART-DIRECTION.md](BATCH-3-YORUNOSHIRUBE-ART-DIRECTION.md))
- candidate limit: **最大3**(A/B/C)
- 昇格禁止: このround(round 1)ではfinal昇格を行わない。
  人間承認後、別途promotion手順を実施する
  ([BATCH-3-YORUNOSHIRUBE-APPROVAL-PACK.md](BATCH-3-YORUNOSHIRUBE-APPROVAL-PACK.md)参照)

## Purpose

対局画面で最も広い面積を占める背景。Yorunoshirubeの世界観(夜の地図帳)を
最も静かに、かつ最も広く伝える土台。牌・捨て牌・操作UIの可読性を最優先し、
中央〜下部は低密度に保つ。

## Used By

- `GameTableLayout.tsx`(`assetSlot="table.background"`、`background-size: cover`)
- 画面: MatchScreen

## Render Contract

- renderMode: **cover**(SKIN-CONTRACT.json準拠。opaque background契約。
  `transparent`フィールドなし)
- intrinsicSize: 1920x1080(16:9)
- 844x390〜1366x768の横長比率が中心。極端な縦長cropは想定外
- 中央〜下部(牌が置かれる領域)は密度を落とす。四隅・周辺にのみ
  軽いディテール(街灯の光・地図の線)を配置し、cropで消えても破綻しない

## Codex CLI Command

```
pnpm asset:image:generate \
  --prompt-file tools/asset-factory/soro-pon-ui/prompts/table-background/<candidate>.txt \
  --output-name <output>.png
```

## Prompt

Prompt本文: `tools/asset-factory/soro-pon-ui/prompts/table-background/yoru-*.txt`

必須要素: game UI asset, Yorunoshirube original skin (an original setting,
not any real commercial game/anime/manga), full-bleed opaque night atlas
game-table background, front-facing/isolated asset framing, no text, no
letters, no numerals, no logo, no watermark, no known/existing character,
no existing game UI copy, no screenshot/mockup/surrounding interface,
horizontal mobile landscape readability, low-density/quiet center-to-bottom
area, decorative detail (hand-drawn street/river lines, faint streetlamp
glow) only near edges/corners, material value must come from paper fiber,
black ink bleed, hand-drawn line unevenness, soft lantern light -- value
that a simple CSS solid/gradient/border/stripe/dot/grid/box-shadow could
NOT reproduce.

## Background Color / Processing Note

opaque background契約(`--opaque-background`)。他slotのような単色グリーン
背景での被写体分離は行わない。生成物自体が1920x1080相当の全面塗り背景
として生成されることを想定する。取り込みは
`--cover-width 1920 --cover-height 1080`(cover_to_canvas)。

## Processing Command

```
pnpm asset:image:prepare --skin yorunoshirube --slot table.background \
  --input <raw内のraw画像> --request 012-yorunoshirube-table-background \
  --output-name table-background-candidate-<a|b|c>.png \
  --cover-width 1920 --cover-height 1080 \
  --background-color '#00ff00' --hard-threshold 0.12 --soft-threshold 0.35 \
  --despill-strength 0.6 --expected-width 1920 --expected-height 1080 \
  --opaque-background --prompt-file <該当prompt>
```

## Visual Direction

- 深い紺〜黒の紙(`#120d08`〜`#241a10`方向)。手描きの街路・河川の線を
  淡く配置(地名文字は入れない)。1-2箇所の隅にランプの光暈
  (`#e8a23c`系、弱め)
- 中央〜下部は最も静かな領域(牌が置かれるため)

## Must Avoid

- 全面ドット・全面グリッド・均一な地図罫線パターン
- 中央に大きなモチーフ/キャラクター、牌の下の強い模様
- 純黒(#000000)ベタ塗り全面、強い純白フィールド
- サイバーパンク・ネオン・宇宙・和風モチーフ
- Cute Popのローズピンク・アイシング・ジェリー・キルトモチーフの流用
- gameplay情報の焼き込み、緑色のモチーフ(chroma-key誤爆の原因)

## Fallback If Missing

既存の`--sp-gradient-table`トークンによるCSSグラデーションで表示済み
(未変更)。

## Acceptance Checklist

- [ ] 844x390で牌・捨て牌の可読性を邪魔しない
- [ ] selected牌の視認性を損なわない
- [ ] modal open時に背景が透けて見えても違和感がない
- [ ] tablet/desktopでcoverによるcropが破綻しない
- [ ] 中央〜下部が低密度で視線を奪わない
- [ ] CSSだけで再現可能な単純な塗り・パターンになっていない
- [ ] Cute Popの素材(布/クラフト紙プレイマット)と混同されない

## Approval Status(承認状態)

- [x] candidate(レビュー待ち)
- [ ] approved
- [ ] rejected

`approvalSource: pending-human-decision`。人間レビュー未実施
(Batch 3 round 1)。
