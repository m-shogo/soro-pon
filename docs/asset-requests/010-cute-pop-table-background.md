# Asset Request: Cute Pop 対局卓背景 (table.background)

## Skin / Slot

- skin: `cute-pop`
- slot: `table.background`
- generation method: **Codex CLI起点画像生成**(docs/IMAGE-ASSET-WORKFLOW.md 8工程)
- status: **candidates生成予定・人間レビュー前提(final昇格前で停止)**
- target files (candidates): `generated/candidates/table-background-candidate-*.png`
- art direction: [BATCH-2-ART-DIRECTION.md](BATCH-2-ART-DIRECTION.md)

## Purpose

対局画面(MatchScreen)で最も広い面積を占める背景。派手な一枚絵ではなく、
牌・捨て牌・操作UIを支える静かな土台。Batch 2素材ファミリーの中で
「最も静か・最も低密度」の役割を担う。

## Used By

- `GameTableLayout`(slot: `table.background`、`background-size: cover`)
- 画面: MatchScreen(手牌/捨て牌/player area/board/actionsのgrid背景)
- `table.overlay.ink`/`table.overlay.light`は別slot(yorunoshirube専用、
  cute-popはdefer済み)としてこの背景の上に重なるが、cute-popでは
  現状CSS token由来のoverlayは無効(D分類、対象外)

## Render Contract

- renderMode: **cover**(SKIN-CONTRACT.json準拠。`transparent`フィールドなし
  = **不透明背景**。isolated object契約ではない)
- intrinsicSize: 1920x1080(16:9)
- `background-size: cover; background-position: center` で敷かれる。
  viewportのaspect比によって上下または左右がcropされる
  (844x390〜1366x768の横長比率が中心。極端な縦長cropは想定外)
- 中央〜下部(牌が置かれる領域)は密度を落とす。四隅・周辺にのみ
  軽いディテールを配置し、cropで消えても破綻しない設計にする

## Codex CLI Command

```
pnpm asset:image:generate \
  --prompt-file tools/asset-factory/soro-pon-ui/prompts/table-background/<candidate>.txt \
  --output-name <output>.png
```

## Prompt

Prompt本文: `tools/asset-factory/soro-pon-ui/prompts/table-background/*.txt`

必須要素: Cute Pop UI asset, full-bleed opaque game table background,
no text, no letters, no logo, no watermark, no known/existing game
characters, isolated from any UI chrome, chroma-key green background is
NOT used for this asset(全面塗り + 生成側でchroma処理不要。緑色を
モチーフに含めない指示を明記), horizontal mobile landscape readability,
low-density/quiet center-to-bottom area, decorative detail only near
edges/corners, material value must come from tactile hand-crafted detail
that cannot be reproduced as a simple CSS gradient/dot pattern/stripe
pattern/box shadow(日本語: CSSの単純な塗り・グラデーション・ドット・
ストライプでは再現できない、触感のある手作り素材の価値を持たせること)。

## Background Color / Processing Note

このslotは**opaque background契約**(`--opaque-background`)。他slotの
ような単色グリーン背景での被写体分離は行わない。生成物自体が
1920x1080相当の全面塗り背景として生成されることを想定し、
`pnpm asset:image:prepare` は `chroma_key.process()` を通すが
(pipeline共通化のため)、生成物に緑系統の色を含めないことで
誤透過を防ぐ。取り込みは `--cover-width 1920 --cover-height 1080`
(fit_to_canvasではなくcover_to_canvas。透明余白を作らず全面を埋める)。

## Processing Command

```
pnpm asset:image:prepare --skin cute-pop --slot table.background \
  --input <raw内のraw画像> --request 010-cute-pop-table-background \
  --output-name table-background-candidate-<a|b|c>.png \
  --cover-width 1920 --cover-height 1080 \
  --background-color '#00ff00' --hard-threshold 0.12 --soft-threshold 0.35 \
  --despill-strength 0.6 --expected-width 1920 --expected-height 1080 \
  --opaque-background --prompt-file <該当prompt>
```

## Visual Direction

- 素材: 柔らかな布のプレイマット、または手描きクラフト紙のゲームマット
  (候補ごとに異なる方向。BATCH-2-ART-DIRECTION.md参照)
- 色: cream/paper系ベース(`#fff9f0`〜`#fff3e2`方向)、寒色差し色として
  light blue(`#bcdcf0`系)を少量。R1のCTA濃ピンクを背景全面には使わない
- 手描きの繊維・縫い目・淡い印刷ずれなど、画像生成でしか出せない質感

## Must Avoid

- 全面ドット・全面ストライプ・全面キャンディ・スプリンクル大量配置
- 中央に大きなキャラクター/絵柄、牌の下の強い模様
- 色コントラストが高すぎる背景、文字・ロゴ
- ボードゲーム盤の固定マス、3人/4人専用の固定位置焼き込み
- gameplay情報の焼き込み
- 緑色のモチーフ(chroma-key誤爆の原因になるため)

## Fallback If Missing

CSSグラデーション(`sp-fallback-table-bg`)で表示済み。

## Acceptance Checklist

- [ ] 844x390で牌・捨て牌の可読性を邪魔しない(手牌ありで確認)
- [ ] selected牌の視認性を損なわない
- [ ] modal open時に背景が透けて見えても違和感がない
- [ ] tablet/desktopでcoverによるcropが破綻しない(重要ディテールが
      不自然に切れない)
- [ ] 中央〜下部が低密度で視線を奪わない
- [ ] CSSだけで再現可能な単純な塗り・パターンになっていない

## Approval Status(承認状態)

- [ ] candidate(レビュー待ち)
- [ ] approved(final昇格可)
- [ ] rejected(修正指示: )
