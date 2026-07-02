# Three.js / WebGL Policy

## Purpose

`soro-pon` で Three.js / WebGL / WebGPU を使うべきかを固定する。

## Final Decision

```text
MVP本体UIは React + CSS で作る。
Three.js / WebGL はMVP初期の必須依存にしない。
ただし、将来の演出レイヤーとして差し込める余地を残す。
```

## Why

`soro-pon` の中核は以下。

```text
Deck Editor
牌/カテゴリ/役/得点の作成
JSON import/export
ルールエンジン
ローカル対戦UI
Result / Collection
```

これらは DOM / CSS / React の方が作りやすい。

Three.js/WebGLを最初から入れると、以下のリスクがある。

```text
UIフォームが作りにくい
文字/日本語/アクセシビリティが面倒
スマホ性能差が出る
実装コストが上がる
デバッグが難しくなる
Deck Editorの作りやすさから遠ざかる
```

## What Is WebGL

```text
WebGLはブラウザのcanvasでGPUを使って2D/3Dグラフィックを描くための低レベルAPI。
```

直接WebGLを書くのはMVPではしない。

## What Is Three.js

```text
Three.jsは、WebGL/WebGPUなどを扱いやすくするJavaScriptの3Dライブラリ。
```

`soro-pon` で使うなら、Three.jsを直接UI基盤にするのではなく、演出用canvasとして局所利用する。

## What Is WebGPU

```text
WebGPUはWebGLより新しいGPU API。
```

MVPでは採用しない。

理由:

```text
対応環境差がまだ気になる
学習/実装コストが高い
soro-ponのMVP要件に対して過剰
```

将来、重い演出や大量パーティクルを入れる段階で再検討する。

## Good Use Cases Later

Three.js/WebGLを使うなら、以下に限定する。

```text
Resultのコイン演出
Clear Board解放時の光演出
オールマイティ使用時の星演出
TOP背景の軽い3D牌
Match開始時の卓カメラ演出
高得点Resultの紙吹雪/パーティクル
称号解放のバッジ回転
```

## Bad Use Cases

MVPではやらない。

```text
Deck Editor全体をThree.jsで作る
牌を全部3Dオブジェクトにする
Match UIを全部canvasにする
テキストUIをWebGLで描く
入力フォームをcanvas上に作る
WebGPU前提で作る
```

## Recommended Architecture

```text
React DOM UI
  ├─ normal screens
  ├─ Deck Editor
  ├─ Match UI
  ├─ Result UI
  └─ optional FX layer
        └─ Three.js canvas / WebGL canvas
```

FX layerは後から追加可能にする。

```ts
type FxLayerMode = 'none' | 'css' | 'canvas2d' | 'three';
```

MVP初期:

```ts
const MVP_FX_LAYER_MODE: FxLayerMode = 'css';
```

## Design Policy

デザイン生成時は、Three.js前提にしない。

ただし、以下のような演出案は残してよい。

```text
この演出はCSSで実装
将来Three.jsに差し替え可能
```

## Dependency Policy

MVP初期では `three` をpackage.jsonに入れない。

入れるタイミング:

```text
1. 基本UIが動く
2. Result/Collectionが動く
3. performance budgetを決める
4. Three.js演出の目的が1つに絞れている
5. fallbackとしてCSS演出がある
```

## Performance Budget

将来Three.jsを入れる場合の目安。

```text
スマホで60fpsを目標
低性能端末ではFX off可能
canvasは画面全体を常時動かさない
Resultや解放演出など短時間だけ使う
```

## Final Decision

- Three.js/WebGLは気になるがMVP初期の土台にはしない
- React + CSSを主軸にする
- 演出だけ後からThree.js/WebGLで足せる構造にする
- WebGPUはMVPでは採用しない
- まず全画面デザイン生成とDOMベースUIを優先する
