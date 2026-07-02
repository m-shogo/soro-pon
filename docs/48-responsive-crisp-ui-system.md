# Responsive Crisp UI System

## Purpose

`soro-pon` の横画面UIを、スマホ横・タブレット・PCで崩さず、文字・札・線・紙UIがボケないようにするための実装方針を固定する。

このファイルは、UI本実装・UIパーツ生成・画像素材整理・CSS設計で必ず参照する。

## Final Decision

```text
844x390 は実寸固定キャンバスではなく、デザイン基準サイズ。
実表示は端末の横画面に 100svw x 100svh で合わせる。
画面全体を transform: scale() で引き伸ばさない。
UI枠・アイコン・線は SVG 優先。
絵・背景・紙質感・インク汚れは高解像度 PNG/WebP。
文字は画像に焼き込まず、HTML text として描画する。
重要UIの寸法は整数pxへ丸める。
紙パネルや手描き縁が必要な箇所だけ 9-slice を使う。
```

## 1. Design Basis vs Actual Display

### Design Basis

```text
base design reference: 844x390 landscape
```

844x390 は、画面密度・比率・情報優先度を揃えるための基準であり、実機表示サイズを固定する意味ではない。

### Actual Display

```text
phone landscape: 100svw x 100svh
PC browser: central play table + surrounding desk/support area
tablet: full landscape shell with safe-area padding
portrait: rotate prompt or limited utility only
```

スマホ横では画面いっぱいに表示する。PCでは中央のゲーム卓を中心に置き、余った領域は夜机背景・任意補助情報・装飾に使う。

## 2. No Global Bitmap-like Scaling

禁止:

```css
.game-root {
  width: 844px;
  height: 390px;
  transform: scale(var(--scale));
}
```

理由:

```text
文字がボケる
細い線がにじむ
PNG素材が荒れる
タップ位置やsafe-area調整が難しくなる
PCで間延びしやすい
```

実装では、実画面サイズに合わせて `CSS Grid` / `flex` / `clamp()` / responsive metrics で再配置する。

## 3. Game Shell

基本構造:

```css
.game-shell {
  width: 100svw;
  height: 100svh;
  overflow: hidden;
  position: relative;
  background: var(--sp-color-night);
}

.game-safe-area {
  position: absolute;
  inset: 0;
  padding:
    env(safe-area-inset-top)
    env(safe-area-inset-right)
    env(safe-area-inset-bottom)
    env(safe-area-inset-left);
}
```

`game-shell` は端末画面にフィットさせる。ノッチ・ホームバー対策は `game-safe-area` で行う。

## 4. Responsive Layout Rule

画面全体を均等拡大しない。

代わりに、各エリアごとに伸び方を決める。

```text
背景: いくらでも伸ばしてよい
夜机/紙テクスチャ: 伸ばしてよい
中央盤面: 伸ばしてよい
捨て牌エリア: 伸ばしてよい
手牌: 高さ基準でサイズ管理
札: aspect-ratio固定
主要ボタン: 最小タップサイズ保証
紙パネル: SVG / 9-slice / texture overlay
文字: clampで下限と上限を固定
```

## 5. Match Layout Grid Example

対戦画面は、領域名を固定する。

```css
.match-layout {
  width: 100%;
  height: 100%;
  display: grid;
  grid-template-columns: minmax(88px, 14%) 1fr minmax(96px, 15%);
  grid-template-rows: minmax(48px, 14%) 1fr minmax(76px, 24%);
  grid-template-areas:
    "left top actions"
    "left board actions"
    "hand hand actions";
  gap: clamp(4px, 1vw, 10px);
}
```

配置方針:

```text
top: ターン / 相手 / 状態
board: 全員の捨て牌 / 盤面
hand: 自分の手牌
actions: ロン / あがる / 捨てる / パス
left: 候補役 / 残り枚数 / 補助
```

必須UIはスマホ横とPCで同じゲーム卓内に置く。PC専用の外側領域へ、ロン・あがる・捨てるなどの必須操作を逃がさない。

## 6. SVG-first UI Policy

SVGを優先するもの:

```text
ボタン枠
紙パネルの基本外枠
札の基本枠
カテゴリチップ
アイコン
矢印
タブ
装飾ライン
ロン/ツモ演出フレーム
単純なランタン光の輪
```

理由:

```text
拡大縮小してもボケにくい
色替えしやすい
線が綺麗
PC/スマホで破綻しにくい
CSSとReact componentで扱いやすい
```

SVGの線は可能なら `vector-effect="non-scaling-stroke"` を使う。

```svg
<svg viewBox="0 0 100 40" preserveAspectRatio="none">
  <path
    d="M8 2 H92 Q98 2 98 8 V32 Q98 38 92 38 H8 Q2 38 2 32 V8 Q2 2 8 2 Z"
    vector-effect="non-scaling-stroke"
  />
</svg>
```

## 7. PNG/WebP Policy

PNG/WebPに向くもの:

```text
夜机背景
紙のザラつき
黒インク汚れ
ランタンのにじみ
札の中のイラスト
キャラ/アイテム絵
複雑な手描き素材
```

PNG/WebPにしないもの:

```text
小さい文字
ボタン文字
状態ラベル
単純な線だけの枠
小さいアイコン
```

文字は必ずHTMLテキストとして描画する。文字入り画像は、ロゴや特別演出を除いて避ける。

## 8. High-density Raster Assets

PNG/WebP素材を使う場合は、拡大でボケないように高解像度版を用意できる設計にする。

```text
asset.png
asset@2x.png
asset@3x.png
```

CSSでは `image-set()` を使える。

```css
.paper-texture {
  background-image: image-set(
    url("/assets/ui/soro-pon/v1/textures/paper-grain.webp") 1x,
    url("/assets/ui/soro-pon/v1/textures/paper-grain@2x.webp") 2x
  );
}
```

## 9. 9-slice Policy

9-sliceは採用するが、万能扱いしない。

9-slice向き:

```text
紙パネル
モーダル
Resultカード
警告パネル
札箱
大きめボタン
```

9-slice不要またはSVG優先:

```text
単純なボタン枠
アイコン
細い装飾ライン
小さいチップ
札の基本形
```

判断基準:

```text
手描きの角や紙の縁を守りたい -> 9-slice
線と形が中心 -> SVG
質感や絵が中心 -> 高解像度 PNG/WebP
```

CSS例:

```css
.paper-panel-nine {
  border-style: solid;
  border-width: 16px;
  border-image-source: url("/assets/ui/soro-pon/v1/panels/paper-panel-9slice.png");
  border-image-slice: 16 fill;
  border-image-repeat: stretch;
}
```

## 10. Texture Overlay Policy

紙感は、巨大な1枚画像を引き伸ばすより、色面 + 薄いテクスチャ overlay で作る。

```css
.paper-panel {
  position: relative;
  background: var(--sp-color-paper);
}

.paper-panel::after {
  content: "";
  position: absolute;
  inset: 0;
  pointer-events: none;
  opacity: 0.18;
  background-image: image-set(
    url("/assets/ui/soro-pon/v1/textures/paper-grain.webp") 1x,
    url("/assets/ui/soro-pon/v1/textures/paper-grain@2x.webp") 2x
  );
  mix-blend-mode: multiply;
}
```

## 11. Integer Pixel Metrics

レスポンシブで重要UIが小数pxになると、札・線・境界がにじむ。

重要UIは、画面サイズから計算して整数pxに丸める。

対象:

```text
牌幅
牌高さ
手牌gap
主要ボタン高さ
パネルpadding
プレイヤーパネル高さ
```

例:

```ts
export function computeTileMetrics(containerWidth: number, containerHeight: number) {
  const tileHeight = Math.floor(Math.min(containerHeight * 0.22, 64));
  const tileWidth = Math.floor(tileHeight * 0.75);
  const gap = Math.max(4, Math.floor(tileWidth * 0.12));

  return {
    tileWidth,
    tileHeight,
    gap,
  };
}
```

React側ではCSS変数として渡す。

```tsx
<div
  className="match-layout"
  style={{
    "--tile-w": `${metrics.tileWidth}px`,
    "--tile-h": `${metrics.tileHeight}px`,
    "--tile-gap": `${metrics.gap}px`,
  } as React.CSSProperties}
/>
```

## 12. Tile Policy

札は最重要UIなので、自由に潰さない。

```text
aspect-ratio固定
高さ基準でサイズ管理
小さすぎる場合は装飾を減らす
牌名の最低可読サイズを守る
カテゴリ色は外枠/帯/チップで示す
```

CSS例:

```css
.tile {
  width: var(--tile-w);
  height: var(--tile-h);
  aspect-ratio: 3 / 4;
}
```

## 13. Text Policy

```text
文字はHTML text
画像に焼き込まない
font-sizeはclampで下限/上限を決める
主要ボタンは最低44px相当のタップ領域
ロン/あがるなどprimary actionは56px前後を推奨
```

例:

```css
:root {
  --sp-font-xs: clamp(10px, 1.15svh + 0.2rem, 12px);
  --sp-font-sm: clamp(12px, 1.35svh + 0.25rem, 14px);
  --sp-font-md: clamp(14px, 1.6svh + 0.3rem, 18px);
}
```

## 14. PC Shell Policy

PCでは画面全体を使ってよいが、ゲーム操作距離を壊さない。

```text
中央: プレイ卓
左右: 任意補助 / 役候補詳細 / 操作説明 / 夜机背景 / ログ
```

PC外側へ置いてよいもの:

```text
操作説明
デッキ情報
役候補の詳細
ショートカット
雰囲気装飾
履歴ログ
```

PC外側へ置かないもの:

```text
捨てる
ロン
あがる
手牌
捨て牌
ターン表示
```

必須UIは全端末でゲーム卓内に置く。

## 15. Recommended Runtime File Structure

```text
src/ui/styles/tokens.css
src/ui/layout/useResponsiveMetrics.ts
src/ui/primitives/SvgPanel.tsx
src/ui/primitives/SvgButtonFrame.tsx
src/ui/primitives/SvgTileFrame.tsx
src/ui/icons/
public/assets/ui/soro-pon/v1/textures/
public/assets/ui/soro-pon/v1/panels/
public/assets/ui/soro-pon/v1/backgrounds/
```

## 16. Asset Manifest Rule

`public/assets/ui/soro-pon/v1/manifest.json` には、素材種別と伸縮ルールを持たせる。

例:

```json
{
  "id": "paper-panel-primary",
  "src": "/assets/ui/soro-pon/v1/panels/paper-panel-primary.png",
  "type": "nine-slice",
  "slice": {
    "top": 16,
    "right": 16,
    "bottom": 16,
    "left": 16
  },
  "minSize": {
    "width": 72,
    "height": 48
  }
}
```

素材タイプ:

```text
svg-frame
svg-icon
nine-slice
texture
background
illustration
```

## 17. Do / Don't

Do:

```text
SVGで枠・アイコン・線を作る
PNG/WebPは絵と質感に使う
テキストはHTMLで描画する
safe-areaを考慮する
重要UIサイズを整数pxに丸める
PCでは外側に補助情報を出す
```

Don't:

```text
844x390の全体画面をtransform scaleで引き伸ばす
低解像度PNGを大きく拡大する
文字入り画像を量産する
必須操作をPC専用外側パネルへ逃がす
札のaspect-ratioを崩す
paper UIを1枚画像の単純拡大だけで作る
```

## Final Priority

UI実装時の優先順位:

```text
1. 可読性
2. タップしやすさ
3. 崩れにくさ
4. Vamp-pon世界の紙/黒インク/灯り
5. 装飾
```

見た目を強くする場合も、文字・札・主要操作がボケる実装は禁止する。
