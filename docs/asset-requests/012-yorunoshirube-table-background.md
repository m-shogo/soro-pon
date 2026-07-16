# Asset Request: ヨルノシルベ 夜の地図帳・対局卓背景 (table.background)

## Skin / Slot

- skin: `yorunoshirube`
- slot: `table.background`
- generation method: **Codex CLI起点画像生成**(docs/IMAGE-ASSET-WORKFLOW.md 8工程)
- status: **closed — final昇格済み(2026-07-16)**
- 採用candidate: C(旅のノートと蝋引き紙) → `generated/final/table-background.png`
- 不採用candidate: A(夜の地図帳)、B(黒インクの街) → `not-selected`
- yorunoshirube/skin.json: **version 2**、`table.background`登録済み
  (renderMode: cover, intrinsicSize 1920x1080)
- art direction: [BATCH-3-YORUNOSHIRUBE-ART-DIRECTION.md](BATCH-3-YORUNOSHIRUBE-ART-DIRECTION.md)
- 承認結果・promotion記録: [BATCH-3-YORUNOSHIRUBE-APPROVAL-PACK.md](BATCH-3-YORUNOSHIRUBE-APPROVAL-PACK.md)

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

- [x] approved(final昇格済み)
- [ ] candidate
- [ ] rejected

`approvalSource: user-provided-human-decision`(2026-07-16)。人間承認: C。

Review note(人間レビュー原文の要旨): Batch 3の3案中、Yorunoshirubeの物語性が
最も強い。蝋引き紙の半透明感・鉛筆線・荷札・記録片などCSSでは再現しにくい
素材情報があり、「夜の記録帳」「旅の記憶」というスキンの中核を一枚で伝えられる。
中央の対局領域は静かに保たれている。

## Promotion Record(2026-07-16)

- 採用: table-background-candidate-c → `generated/final/table-background.png`
- final PNGがSKIN-CONTRACT.json `maxAssetFileBytes`(2MB)を超過したため、
  256色パレット+Floyd-Steinberg ditheringで再エンコード
  (2890050 bytes → 1655281 bytes、視覚的差異なしを目視確認)
- 不採用: candidate A, B(`not-selected`、rejectionReason記録済み。
  B初回案はtorii/pagoda(和風建築)混入により機械却下・再生成した履歴を保持)
- promotion前の技術再検査: cover crop時に荷札・記録片が牌/捨て牌へ
  侵入しないことを5 viewport + DPR2で確認、問題なし
- skin version: 1 → 2
- production証跡: `evidence/batch-3-yorunoshirube-final/*-matchsetup.png`,
  `*-match-table.png`(5 viewport)
- visual regression: 33/33 green
