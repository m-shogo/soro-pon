# Asset Request: Cute Pop 牌面・牌裏 (tile.face.base / tile.back.base)

## Skin / Slot

- skin: `cute-pop`
- slots: `tile.face.base`, `tile.back.base`
- generation method: **Codex CLI起点画像生成**(docs/IMAGE-ASSET-WORKFLOW.md 8工程)
- status: **round 1(A/B/C)は人間レビューで全却下。round 2(D/E/F)生成済み・
  人間レビュー待ち(final昇格前で停止)**
- target files (candidates): `generated/candidates/tile-face-base-candidate-*.png`,
  `generated/candidates/tile-back-base-candidate-*.png`

## Round 1 Rejection (2026-07-16, approvalSource: user-provided-human-decision)

両slotの候補A/B/Cを人間レビューで却下。理由:

```text
CSSで再現できるデザイン(単純フラット面・単純な線フレーム・単純ドット)に
留まっており、画像生成を使う価値がない。ドットやボーダーであっても
「画像生成でしか実現できない」質感・手描き感・立体感へ振り切ること。
売れているカジュアルゲームの可愛いデザイン水準を様式の参考にしてよい
(既存IPのキャラクター・ロゴ・アセットの直接コピーは従来通り禁止)。
```

Round 2への追加制約:

```text
- フラットベクター縛りを撤廃。airbrush陰影・手描き線・光沢・立体感・
  質感(icing/candy/watercolor/quilt等)を必須とする
- 「no gradient / no gloss / no 3D」系のnegative指示をround 2 promptから除去
- DOM上乗せ契約(中央・上部無地、文字焼き込み禁止)と24px可読性、
  chroma-key工程、9-slice安全性(該当slot)は維持
- round 1候補はrejected recordとしてarchiveに保持(復活させない)
```

## Purpose

そろぽんの製品アイデンティティを最も強く決める牌の表面・裏面。
Batch 1(docs/ASSET-PRODUCTION-ROADMAP.md)の対象。表面は手牌・捨て牌・
デッキ詳細・リザルトの全域で使われ、裏面は相手手牌・山で常時見える。

## Used By

- `TileCard`(slot経由、ADR-015のbase合成レイヤー)
- 画面: MatchScreen(手牌/捨て牌/相手牌)、DeckDetailScreen、ResultScreen、Gallery
- 実表示サイズ: 42x56(Result) / 44x59(DeckDetail) / 54x72(Gallery) /
  MatchScreenは動的(相手牌は0.55倍で最小約24px幅まで縮む)
- DOM上乗せ: 上部22%はカテゴリ帯(不透明)、中央は絵文字
  (tile高の34%)、下部は名前テキスト。**画像へ文字・絵柄・帯を焼き込まない**
- 状態(selected/ron/tsumo)はCSS+状態レイヤーで表現する(ADR-015)。
  この画像は「状態なしのbase面」だけを描く

## Render Contract

- renderMode: stretch(100% 100%) / transparent: true
- 1x契約(base manifest): intrinsicSize 300x400(3:4固定)
- 2x候補: 600x800で生成し、`pixelDensity: 2`で登録予定
- CSS側でborder-radius+overflow hiddenのクリップと1pxインク枠が乗る
- 検査契約上、四辺に透明余白が必須(min-padding 4px/600x800比で約0.7%)。
  stretchでも縁がほぼ見えない薄さに収める

## Codex CLI Command

```
pnpm asset:image:generate \
  --prompt-file tools/asset-factory/soro-pon-ui/prompts/tile-face-base/<candidate>.txt \
  --output-name <output>.png
```

## Prompt

Prompt本文: `tools/asset-factory/soro-pon-ui/prompts/tile-face-base/*.txt`,
`tools/asset-factory/soro-pon-ui/prompts/tile-back-base/*.txt`

全プロンプト共通の必須要素: Cute Pop UI asset, card tile background,
no text, no letters, no icon in center, no watermark, isolated object,
flat solid chroma-key background(#00ff00), sufficient transparent margin,
front-facing, clean silhouette, readable at 24px width, no mockup,
no screenshot。表面は「中央〜上部をほぼ無地に保つ」制約を明記
(帯・絵文字・名前がDOMで乗るため)。

## Background Color

`#00ff00`(高彩度グリーン。被写体は白〜暖色系のため色分離可)

## Processing Command

```
pnpm asset:image:prepare --skin cute-pop --slot <tile.face.base|tile.back.base> \
  --input <raw-green内のraw画像> --request 008-cute-pop-tile-face-back \
  --output-name <slot名kebab>-candidate-<a|b|c>.png \
  --fit-width 600 --fit-height 800 --fit-margin-ratio 0.02 \
  --background-color '#00ff00' --hard-threshold 0.12 --soft-threshold 0.35 \
  --despill-strength 0.6 --expected-width 600 --expected-height 800 \
  --min-padding 4 --prompt-file <該当prompt>
```

## Visual Direction

- Cute Pop: 明るい・可愛い・ポップ・一般向け(tokens.css参照)
- 表面: 白いカード面+暖色(クリーム〜サニーオレンジ)の柔らかな縁飾り。
  中央と上部22%は無地に近く保つ。フラットベクター、光沢・3D・影焼き込み禁止
- 裏面: 表面と一目で区別できる濃度。パステル基調の幾何パターン等。
  中央はDOMの◆マークが乗るため主張しすぎない
- 既存final(button-secondary/panel-paper/badge-info)と同一の
  白+暖色ボーダー言語に調和させる

## Must Avoid

- 文字・数字・アイコンの焼き込み / 中央の濃い模様(表面)
- 麻雀牌・ドンジャラの直接コピー / 既存IPモチーフ
- 過剰光沢・3Dベベル・ドロップシャドウ焼き込み・ガチャ風高彩度
- 被写体の画像端接触(検査で機械的に不合格)

## Fallback If Missing

CSSグラデーション+インク枠(--sp-gradient-tile-face / --sp-gradient-tile-back)
で表示済み。fallbackでも操作不能にはならない。

## Acceptance Checklist

- [ ] 24px幅(相手牌最小)まで縮小しても面と縁が破綻しない
- [ ] カテゴリ帯(上22%)・中央絵文字・名前テキストと干渉しない
- [ ] 表裏が一目で区別できる
- [ ] 5サイズ×両スキンでレイアウト回帰なし(cute-pop以外は変化しないこと)
- [ ] 透明境界にフリンジ・背景色残りがない
- [ ] selected(-18% translate+lantern枠)状態でも読める

## Approval Status(承認状態)

- [x] candidate(レビュー待ち)
- [ ] approved(final昇格可)
- [ ] rejected(修正指示: )
