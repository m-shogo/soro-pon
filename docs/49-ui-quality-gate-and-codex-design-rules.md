# UI Quality Gate and Codex Design Rules

## Purpose

`soro-pon` のUI実装で、画面ごとのブレ・汎用Webアプリ化・ダサい独自デザイン化を防ぐ。

Codex / Claude Code / Cursor は、このファイルを読んだうえでUIを実装する。

## Final Decision

```text
Codexはデザインを発明しない。
Codexは、採用済みデザインターゲット・tokens・primitives・components・layout contract に従って実装する。
```

UI実装では、以下を正とする。

```text
docs/design-targets/generated/soro-pon-landscape-vampon-ui-v1/
docs/37-visual-design-direction.md
docs/46-landscape-first-web-responsive-policy.md
docs/47-mvp-implementation-final-gate.md
docs/48-responsive-crisp-ui-system.md
docs/49-ui-quality-gate-and-codex-design-rules.md
```

## 1. Codex Design Boundary

Codexに任せること:

```text
UI tokensに沿ったCSS実装
SVG primitiveのReact component化
共通UI componentsの実装
CSS Grid / flex / responsive metrics
Component Gallery作成
画面構造の実装
スクリーンショット検証導線
差分整理
```

Codexに任せすぎないこと:

```text
新しい色の発明
画面ごとの独自ボタン発明
画面ごとの独自パネル発明
紙UIの質感方向の変更
ランタン光の強さの判断
Result / ロン / あがり演出のテンション判断
Vamp-pon世界観の再解釈
```

禁止:

```text
いい感じにするために独自デザインを足す
画面ごとに新しい色・影・角丸・ボタン形を足す
採用画像10枚と違う方向へ寄せる
白いWebアプリ風へ寄せる
Tailwind demo風へ寄せる
Material Design風へ寄せる
```

## 2. Adopted Design Target Rule

採用済み横画面デザインターゲットをUI品質基準にする。

```text
docs/design-targets/generated/soro-pon-landscape-vampon-ui-v1/01-top.png
docs/design-targets/generated/soro-pon-landscape-vampon-ui-v1/02-deck-list.png
docs/design-targets/generated/soro-pon-landscape-vampon-ui-v1/03-deck-detail.png
docs/design-targets/generated/soro-pon-landscape-vampon-ui-v1/04-match-setup.png
docs/design-targets/generated/soro-pon-landscape-vampon-ui-v1/05-deck-editor.png
docs/design-targets/generated/soro-pon-landscape-vampon-ui-v1/06-tile-editor.png
docs/design-targets/generated/soro-pon-landscape-vampon-ui-v1/07-match-discard-phase.png
docs/design-targets/generated/soro-pon-landscape-vampon-ui-v1/08-match-win-or-ron-phase.png
docs/design-targets/generated/soro-pon-landscape-vampon-ui-v1/09-result.png
docs/design-targets/generated/soro-pon-landscape-vampon-ui-v1/10-collection.png
```

これらはruntime素材として直接使わない。実装時は以下へ分解する。

```text
layout contract
color tokens
spacing tokens
SVG frames/icons
PaperPanel / TileCard / Button / RoleCard components
high-resolution texture assets
HTML text
```

## 3. Design Principles

優先順位:

```text
1. 可読性
2. タップしやすさ
3. 画面ごとの統一感
4. 崩れにくさ
5. Vamp-pon世界の紙/黒インク/灯り
6. 装飾
```

通常画面:

```text
静か
色数を増やさない
必要なものだけ小さく光らせる
紙・黒インク・ランタン光を軸にする
```

勝負どころ:

```text
ロン / あがり / 初達成 / Resultだけ少し強める
常時派手にしない
全ボタンを光らせない
```

## 4. Token Rules

UI実装では `src/ui/styles/tokens.css` を先に作る。

Codexは、原則として画面CSSへ直接色コードを書かない。

禁止:

```css
.some-screen-button {
  background: #ffcc33;
  box-shadow: 0 0 18px #ffcc33;
}
```

許可:

```css
.some-screen-button {
  background: var(--sp-color-lantern-0);
  box-shadow: var(--sp-shadow-lantern-soft);
}
```

必須tokenカテゴリ:

```text
color
spacing
radius
shadow
typography
z-index
motion duration
layout size
```

色追加ルール:

```text
新しい色はtokens.cssに追加する
追加理由をコメントで書く
カテゴリ色以外は増やしすぎない
画面単位の一時色は禁止
```

## 5. Component Rules

画面は、共通componentsを通して作る。

最初に作るべきUI層:

```text
src/ui/styles/tokens.css
src/ui/layout/useResponsiveMetrics.ts
src/ui/primitives/SvgPanel.tsx
src/ui/primitives/SvgButtonFrame.tsx
src/ui/primitives/SvgTileFrame.tsx
src/ui/primitives/InkDivider.tsx
src/ui/primitives/LanternGlow.tsx
src/ui/components/Button.tsx
src/ui/components/PaperPanel.tsx
src/ui/components/TileCard.tsx
src/ui/components/PlayerPanel.tsx
src/ui/components/ActionPanel.tsx
src/ui/components/RoleCard.tsx
src/ui/components/ScoreBreakdown.tsx
src/ui/components/CategoryChip.tsx
src/ui/components/Modal.tsx
src/ui/components/Tab.tsx
```

禁止:

```text
画面ファイル内で独自ボタンを都度作る
画面ファイル内で独自パネルを都度作る
同じ用途のButtonが複数系統になる
TileCardを画面ごとに別実装する
```

許可:

```text
共通Buttonのvariantを増やす
PaperPanelのvariantを増やす
TileCardのstateを増やす
ただしvariant追加はtokens / docsに合わせる
```

## 6. Component Gallery Requirement

UI画面実装の前に、Component Galleryを作る。

目的:

```text
画面ごとのブレを早期に発見する
ボタン/札/紙パネル/チップの統一感を見る
ダサい方向へ寄っていないか確認する
```

最低限表示するもの:

```text
Button variants
PaperPanel variants
TileCard states
CategoryChip states
PlayerPanel states
ActionPanel states
RoleCard / ScoreBreakdown
Modal / Dialog
InkDivider / LanternGlow
```

推奨path:

```text
src/ui/gallery/ComponentGallery.tsx
```

MVP中はStorybookを入れない。必要ならアプリ内の開発用routeまたはhidden debug viewでよい。

## 7. Layout Rules

844x390は実寸固定キャンバスではない。

```text
844x390 = design reference
phone landscape = 100svw x 100svh
PC = central play table + support/desk area
```

禁止:

```text
全体をtransform scaleで引き伸ばす
PCで横幅いっぱいに手牌とボタンを散らす
必須操作をPC専用外側パネルへ逃がす
```

必須:

```text
CSS Grid / flex / clamp / responsive metricsで再配置
safe-area対応
重要UIサイズは整数px
札はaspect-ratio固定
```

## 8. Asset Format Rules

詳細は `docs/48-responsive-crisp-ui-system.md` を正とする。

```text
UI枠 / アイコン / 線 / 札枠 = SVG優先
絵 / 背景 / 紙質感 / インク汚れ = 高解像度PNG/WebP
紙パネルや手描き縁 = 必要箇所だけ9-slice
文字 = HTML text
```

禁止:

```text
文字入り画像を量産する
低解像度PNGを拡大する
画面参照画像をruntime素材にする
```

## 9. Screenshot Review Sizes

UI変更時は、最低限以下のサイズで確認する。

```text
844x390   design reference
932x430   phone landscape wide
852x393   phone landscape compact
1024x600  tablet landscape
1366x768  desktop
```

確認項目:

```text
牌名が読める
自分の手牌が潰れていない
主要ボタンが押せそう
相手3人が邪魔しない
捨て牌が読める
余白が間延びしていない
色が増えていない
紙UIに見える
ランタン光が強すぎない
白いWebアプリに見えない
```

## 10. Forbidden Looks

以下に見えたら不採用。

```text
白い汎用WebアプリUI
明るい量産ボードゲームUI
Material Design風
Tailwind demo風
色数が多いカードゲームUI
角丸/影/余白が画面ごとに違うUI
文字入り画像だらけ
全体scale前提のぼやけたUI
PCで横に間延びしたUI
Vamp-ponの紙/インク/灯りがただの飾りになったUI
常に全ボタンが発光しているUI
```

## 11. Required UI Review Before Merge

UI変更をmergeする前に、報告へ以下を含める。

```text
変更したcomponents
追加/変更したtokens
新しく追加した色があるか
SVG/PNG/WebP/9-sliceの使い分け
確認した画面サイズ
スクショ保存先
採用画像10枚との差分
気になるダサさ/未調整箇所
```

## 12. Codex Prompt Rule

CodexへUI実装を依頼する時は、必ず以下を入れる。

```text
Codexはデザインを発明しないでください。
採用済みデザインターゲット、tokens.css、共通components、docs/48、docs/49に従って実装してください。
新しい色・影・角丸・ボタン形を勝手に追加しないでください。
画面全体をtransform scaleで引き伸ばさないでください。
文字は画像に焼き込まずHTML textで描画してください。
UI変更後は指定サイズのスクリーンショットで確認してください。
```

## Final Gate

UI実装で迷った場合は、センスで足さずに以下の順で確認する。

```text
1. 採用済みデザインターゲット10枚
2. docs/48-responsive-crisp-ui-system.md
3. この docs/49
4. tokens.css
5. 既存primitives/components
```

それでも迷う場合は、実装せずに判断待ちにする。
