# Stylish Three.js Experiment Plan

## Purpose

Three.js / WebGL の経験を得るために、MVP本体とは別にスタイリッシュUI演出の実験を行う。

## Core Decision

```text
Three.jsは経験目的で試す。
ただし、MVP本体UIの土台にはしない。
```

MVP本体:

```text
React + CSS
```

Three.js実験:

```text
Result / TOP / Match背景 / Tile FX / Clear Board FX
```

## Style Direction

既存作品のUIをそのまま再現しない。

`soro-pon` 独自のスタイリッシュ方向として以下を採用する。

```text
黒 × 白 × ビビッド赤/青/黄
斜めパネル
漫画的スピード線
ハーフトーン
強い影
大きい数字
バシッと出るResult
3D牌が回転して着地
```

## Why It Fits Three.js

Three.jsは以下に向いている。

```text
牌が3Dで回転する
コインが飛ぶ
バッジが回る
背景に立体的な図形が流れる
Resultで役カードが奥から飛び出す
Clear Boardのマスが光って開く
```

## What Not To Do

```text
Deck Editor全体をThree.jsで作らない
入力フォームをcanvas上に作らない
日本語テキストをWebGL描画にしない
Matchの操作UIを全部canvasにしない
3D牌を全局面で常時動かさない
```

## Experiment Routes

実装するなら、production UIとは分ける。

候補:

```text
/lab/stylish-fx
/lab/result-fx
/lab/tile-3d
```

MVP本線に混ぜる前に、labで確認する。

## First Three.js Experiment

最初に作るならこれ。

```text
Stylish Result FX
```

内容:

```text
黒/白/赤/黄色の斜め背景
3D牌カードが回転して中央に着地
合計点が大きく斜めに表示
コイン粒子が飛ぶ
実績バッジが回転する
DOMのResult UIにThree.js canvasを背面レイヤーとして重ねる
```

理由:

```text
対局操作を壊さない
Deck Editorに影響しない
短時間演出なので性能リスクが小さい
ワクワク感が分かりやすい
Three.jsの経験が得られる
```

## Implementation Architecture

```text
React screen
  ├─ DOM UI layer
  └─ FX canvas layer
        └─ Three.js scene
```

CSS:

```text
position: absolute
pointer-events: none
```

Three.js canvasは操作を奪わない。

## Suggested Components

```text
src/fx/FxLayer.tsx
src/fx/stylish/StylishResultFx.ts
src/fx/stylish/createTileMesh.ts
src/fx/stylish/createCoinParticles.ts
src/fx/stylish/useThreeScene.ts
```

## Dependency Policy

通常MVPでは `three` を入れない方針だったが、経験目的の実験では許可する。

ただし、条件:

```text
lab routeに閉じる
core engineに依存させない
Deck Editorに依存させない
Three.jsなしでも基本UIが動く
```

最初は `three` のみ。

```text
three
```

最初は入れない:

```text
@react-three/fiber
@react-three/drei
postprocessing
```

理由:

```text
Three.jsそのものを理解する経験を優先する
依存を増やしすぎない
```

## Visual Design Rules

```text
斜めの黒パネル
白い太字タイトル
赤/青/黄色のアクセント
背景にハーフトーン
牌はカテゴリ色の縁を持つ3Dカード
点数は大きく強く
演出は短く0.8〜1.5秒程度
```

## Performance Guard

```text
低性能端末ではFX offできる
prefers-reduced-motionではCSS/Three.js演出を弱める
canvasはpointer-events: none
Resultや解放演出など短時間だけ動かす
```

## Acceptance Criteria

```text
React DOMのResult UIが読める
Three.js演出がなくてもResultが成立する
演出が操作を邪魔しない
スマホで重くなりすぎない
牌/点数/コインが気持ちよく見える
```

## Final Decision

- 経験目的でThree.js実験はやってよい
- 最初はStylish Result FXが最適
- MVPのDeck EditorやMatch操作UIはReact/CSSのまま
- Three.jsは背面/短時間/演出レイヤーとして使う
- 既存作品のUI丸コピーではなく、soro-pon独自のスタイリッシュUIにする
