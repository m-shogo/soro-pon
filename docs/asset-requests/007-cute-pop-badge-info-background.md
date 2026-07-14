# Asset Request: Cute Pop 情報バッジ面 (badge.info.background)

## Skin / Slot

- skin: `cute-pop`
- slot: `badge.info.background`
- generation method: **Codex CLI起点画像生成**(docs/IMAGE-ASSET-WORKFLOW.md 8工程)
- status: **final昇格済み(候補B採用)**

## Purpose

Cute Pop向け情報バッジ(小型ラベルチップ)の背景。button/panelのプログラム生成面と異なり、
Cute Pop固有の軽い装飾性を持たせる最初の画像生成系実証対象。

## Used By

- Badge(`badge.info.background` slot経由)、`--sp-badge--info`
- 用途: 対局中の状況説明・スコア内訳の補足ラベル等

## Render Contract

- renderMode: nine-slice / pixelDensity: 2
- 1x契約(base manifest): intrinsicSize 120x40, nineSlice(source) 8,
  contentSafeArea(source) 4, minRenderSize(CSS) 24x20
- 2x候補: intrinsicSize 240x80, nineSlice(source) 16, nineSliceRender(CSS) 8,
  contentSafeArea(source) 8, minRenderSize(CSS) 24x20(不変)
- 透過PNG。文字・「i」アイコン・動的ラベルは焼き込まない(DOM側で重ねる)

## Codex CLI Command

```
pnpm asset:image:generate \
  --prompt-file tools/asset-factory/soro-pon-ui/prompts/badge-info-background/<candidate>.txt \
  --output-name <output>.png
```

内部で `codex exec --sandbox workspace-write --skip-git-repo-check --cd <repo外tmp> <prompt>`
を実行し、Codexが `~/.codex/generated_images/<session>/*.png` に保存した実ファイルを
`raw-green/` へコピーする(手動生成の持ち込みではなく、Codex CLI自身が呼び出し元)。

provider: openai / model: 実行時ログから記録(records/参照)
seed: 非公開(Codex CLI側でseed取得APIなし)のため常にnull。
**session idはseedへ代入しない**。`generationSessionId`という別フィールドで
追跡する(records/参照。監査schema契約はrecord_schema.py)。

## Prompt

Prompt本文: `tools/asset-factory/soro-pon-ui/prompts/badge-info-background/*.txt`
(candidate-a-rounded-paper-label / candidate-b-ribbon-tab / candidate-c-small-ticket)

必須要素を全プロンプトに含める: Cute Pop UI asset, information badge background,
no text, no letters, no icon, no watermark, isolated object, flat solid
chroma-key background, sufficient transparent margin, front-facing, clean
silhouette, UI readability at small size, no mockup, no screenshot,
no surrounding interface。加えて9-slice安全性(角/辺の責務分離)を明記。

## Background Color

`#00ff00`(高彩度グリーン、被写体は暖色のため緑との衝突なし。マゼンタ等への
切替は不要と判断)

## Processing Command

```
pnpm asset:image:prepare --skin cute-pop --slot badge.info.background \
  --input <raw-green内のraw画像> --request 007-cute-pop-badge-info-background \
  --fit-width 240 --fit-height 80 --fit-margin-ratio 0.08 \
  --background-color '#00ff00' --hard-threshold 0.12 --soft-threshold 0.35 \
  --despill-strength 0.6 --expected-width 240 --expected-height 80 --min-padding 4 \
  --prompt-file <該当prompt>
```

`--background-color`の値は必ずシェルクォート(`'#00ff00'`)する。クォートなしだと
`#`以降がシェル上でコメント化され、記録したコマンドが再実行不能になる
(実際に遭遇した不具合。修正後はrecord_schema.pyのshell round-tripテストで検出する)。

provider/model/generationSessionId/generationCommandは、`codex_generate_raw.py`が
raw画像と同じ場所へ残すサイドカー(`<raw>.generation.json`)から自動補完される
(`--provider`/`--model`/`--generation-session-id`/`--generation-command`で
明示上書きも可能)。

## Thresholds / Despill

- hard threshold: 0.12 / soft threshold: 0.35 / despill strength: 0.6
  (chroma_key.pyの既定値。プログラム生成candidatesと同一で一貫性を持たせる)

## Candidates

| ID | 方向性 | raw | candidate | comparison | content hash |
|---|---|---|---|---|---|
| A | 丸みのある紙ラベル | archive/candidate-a/raw.png | archive/candidate-a/candidate.png(not-selected) | archive/candidate-a/compare.png | 884ab08d… |
| B | 控えめなリボンタブ(採用) | archive/candidate-b/raw.png | public/.../generated/final/badge-info-background.png | archive/candidate-b/compare.png | 9058c7df… |
| C | 小さなチケット形 | archive/candidate-c/raw.png | archive/candidate-c/candidate.png(not-selected) | archive/candidate-c/compare.png | 0818a037… |

archiveパスは `tools/asset-factory/soro-pon-ui/archive/cute-pop/badge.info.background/` 配下。
詳細は `tools/asset-factory/soro-pon-ui/records/cute-pop-badge-info-background-badge-info-background-candidate-*.json` を参照。

## Automated Validation Status

`pnpm asset:image:prepare` 実行時の`validate_candidate.py`結果を参照
(records/内の`validation`フィールド)。

## Approval Status(承認状態)

- [x] B: promoted(final昇格。cute-pop version 3で`badge.info.background`へ登録)
- [x] A: not-selected(既存button/panel(プログラム生成)と形状が近く、画像生成系候補としての
      差別化が弱いため不採用)
- [x] C: not-selected(24x20px最小表示時に左右ノッチが潰れる/輪郭ノイズになるリスクが
      候補Bより高いため不採用)

**final promotion status: promoted (candidate B, cute-pop skin version 3)**

A/Cのraw・comparison・metadataは削除せず
`tools/asset-factory/soro-pon-ui/archive/cute-pop/badge.info.background/candidate-{a,c}/`
へ保存し、production manifestからは参照しない。

## Must Avoid

- 過剰な光沢・強い3Dベベル・過剰なグラデーション
- 安価なソーシャルゲーム風の装飾
- ノイズ状の質感、意味のない細密装飾
- 縮小時に潰れる細部
- nine-slice中央帯への非対称な装飾(スライス破綻の原因)

## Fallback If Missing

tokens(`--sp-color-paper-aged` / `--sp-color-ink-soft`)によるCSS面(Badge component)で表示済み
