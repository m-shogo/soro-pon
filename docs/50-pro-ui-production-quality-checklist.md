# Pro UI Production Quality Checklist

## Purpose

`soro-pon` のUIを、ただ崩れない・ダサくない状態で止めず、プロダクトとして気持ちよく見える品質まで磨き込むためのチェックリストを固定する。

このファイルは、UI foundation / Component Gallery / 各画面実装 / polish pass / merge前レビューで必ず参照する。

## Final Decision

```text
docs/48 = ボケない・崩れないための実装方針
docs/49 = Codexが勝手にダサいデザインを発明しないための制約
docs/50 = プロ品質まで磨くための状態・動き・文字・検証・仕上げの基準
```

UI実装時は、以下をセットで扱う。

```text
docs/37-visual-design-direction.md
docs/46-landscape-first-web-responsive-policy.md
docs/47-mvp-implementation-final-gate.md
docs/48-responsive-crisp-ui-system.md
docs/49-ui-quality-gate-and-codex-design-rules.md
docs/50-pro-ui-production-quality-checklist.md
```

## 1. Production UI Quality Principles

優先順位:

```text
1. 読める
2. 押せる
3. 迷わない
4. 画面ごとの温度感が揃う
5. 操作した時に気持ちいい
6. Vamp-pon世界の紙/黒インク/灯りが自然に効いている
7. 装飾が邪魔をしない
```

プロ品質のUIは、派手な装飾ではなく、以下で決まる。

```text
状態差分が明確
余白が一貫している
色が増えない
押した感触がある
重要操作がすぐ分かる
結果表示に余韻がある
PC/スマホ横で体験が破綻しない
```

## 2. UI State Matrix

すべての主要UI componentは、状態を先に定義する。

対象:

```text
Button
TileCard
PaperPanel
PlayerPanel
ActionPanel
RoleCard
CategoryChip
Tab
Modal
Dialog
```

最低状態:

```text
normal
hover
pressed
focus-visible
disabled
selected
active
warning
danger
success
```

ゲーム固有状態:

```text
drawable
discardable
ronAvailable
tsumoAvailable
newlyUnlocked
completed
comboRelated
wildcardUsed
```

禁止:

```text
状態差分を色だけで表す
disabledなのに押せそうに見える
selectedとactiveが同じ見た目になる
warning/dangerを常に強い赤で出す
ロン可能/あがり可能が他ボタンと同じ強さに見える
```

推奨:

```text
押せる状態 = ふち/光/濃度/わずかな浮き
押せない状態 = 彩度/明度/影/カーソル/aria-disabledで明確化
ロン/あがり = 周囲より一段だけ強いランタン光
警告 = 赤一色ではなく紙/インク文脈の警告表現
```

## 3. Motion and Animation Rules

動きは少なく、意味がある場所だけ使う。

基本duration:

```text
micro feedback: 80-120ms
button press: 80-100ms
hover/focus glow: 120-180ms
modal open/close: 160-220ms
tile move/discard: 180-260ms
ron/tsumo emphasis: 300-600ms
result count-up: 600-1200ms
```

easing方針:

```text
通常UI: ease-out
押下: quick ease-in
牌移動: ease-in-out
Result/解放演出: gentle ease-out
```

禁止:

```text
全ボタン常時発光
全画面で派手な入場アニメーション
UI操作のたびに大きな揺れ
ロン/あがり以外の過剰な漫画演出
文字が読めない速度のcount-up
```

`prefers-reduced-motion` に対応する。

```text
reduced motionでは大きな移動/点滅/揺れを抑える
意味のある状態変化は、色・枠・文言で残す
```

## 4. Typography Rules

文字はゲームUIの品質を決める。

分類:

```text
screenTitle
sectionTitle
body
caption
buttonLabel
tileName
roleName
scoreNumber
scoreUnit
warningText
logText
```

ルール:

```text
文字はHTML text
画像に焼き込まない
サイズはtokensで管理
行間もtokensで管理
点数/数字は等幅寄りを検討
牌名は最小可読サイズを下回らない
長い役名は2行まで、それ以上は省略/詳細表示
```

禁止:

```text
画面ごとにfont-sizeを直書きする
同じ意味のラベルでサイズが違う
点数が揺れて読みにくい
文字を光らせすぎる
背景テクスチャで文字が埋もれる
```

## 5. Icon and Frame Grid Rules

SVG icon / frame は、統一グリッドで設計する。

推奨:

```text
icon viewBox: 24x24 or 32x32
button icon safe area: 80%以内
stroke width: token化
角丸: token化
SVG strokeは可能ならnon-scaling-stroke
```

禁止:

```text
アイコンごとに線幅が違う
余白が違う
ランダムな角丸
塗りと線のルールが混在
```

## 6. Touch Target and Focus Rules

スマホ横では押しやすさを優先する。

目安:

```text
minimum touch target: 44x44px相当
primary action height: 52-56px相当推奨
small utility action: 36-44px相当
close/back/menu: 44x44px相当を確保
```

キーボード/PC操作:

```text
focus-visibleを必ず出す
Tab移動で主要操作に到達できる
Escapeでmodalを閉じられる
Enter/Spaceでbutton操作できる
```

禁止:

```text
スマホ横で小さすぎる閉じるボタン
ロン/あがるが他ボタンより小さい
focus-visibleを消す
押せる見た目なのにbutton要素ではない
```

## 7. UI Density Modes

端末サイズ差を、自由な崩れではなくdensity modeで吸収する。

```text
compact: 小さいスマホ横
normal: 844x390前後
wide: 大きめスマホ/タブレット横
desktop: PCブラウザ
```

compactで減らすもの:

```text
装飾
補足説明
常時表示の詳細ログ
余白
弱い背景演出
```

compactで減らさないもの:

```text
手牌
捨て牌
ロン/あがる/捨てる/パス
ターン表示
最低限の候補役
```

PCで増やしてよいもの:

```text
役候補詳細
操作説明
ショートカット
履歴ログ
デッキ情報
雰囲気背景
```

PCで外側へ逃がさないもの:

```text
手牌
捨て牌
ターン表示
ロン/あがる/捨てる/パス
```

## 8. Screenshot Regression Plan

UI変更時は、最低限以下を確認する。

```text
844x390   design reference
932x430   phone landscape wide
852x393   phone landscape compact
1024x600  tablet landscape
1366x768  desktop
```

保存先の推奨:

```text
docs/design-targets/generated/implementation-screenshots/<phase>/
```

将来的にPlaywrightを入れる場合:

```text
npm run ui:screenshot
npm run ui:visual-check
```

MVP初期では自動化前でもよいが、UI変更報告には確認サイズを必ず書く。

## 9. Performance Budget

紙質感・影・発光・SVGが増えすぎると、スマホ横で重くなる。

方針:

```text
常時動くエフェクトを増やしすぎない
大きいblurを多用しない
巨大PNG/WebPを直接表示しない
SVG filterを乱用しない
box-shadowを大量の牌に付けない
背景テクスチャは軽量化する
```

目安:

```text
通常対局中は60fpsを目標
ロン/Result演出中も操作不能時間を長くしすぎない
画像は表示サイズに近い解像度を使う
@2x/@3xは用途を決めて使う
```

禁止:

```text
全牌に重いblur/glow
常時パーティクル
巨大背景画像の無圧縮使用
```

## 10. Accessibility and Readability Rules

ゲームUIでも最低限の読みやすさを守る。

```text
重要テキストは背景と十分なコントラストを持つ
色だけで状態を伝えない
focus-visibleを消さない
主要buttonはbutton要素にする
modalは閉じ方が分かる
エラー/警告は文言でも伝える
```

色の意味:

```text
カテゴリ色 = 牌/役分類
ランタン光 = 重要/操作可能/祝福
赤系 = 危険/警告のみ
緑系 = 成功/完了のみ
```

## 11. Polish Pass Checklist

UI実装後に、画面ごとに確認する。

```text
1. 余白が画面ごとに揃っているか
2. 角丸が揃っているか
3. 影が強すぎないか
4. 文字サイズが揃っているか
5. 主要ボタンがすぐ分かるか
6. 押せないものが押せそうに見えないか
7. 紙UIに見えるか
8. 白いWebアプリに見えないか
9. 色が増えすぎていないか
10. ランタン光が強すぎないか
11. PCで間延びしていないか
12. compactで情報が潰れていないか
13. Resultに余韻があるか
14. ロン/あがりだけ特別感があるか
15. 参照画像10枚から大きくズレていないか
```

## 12. Merge Gate for UI Changes

UI変更の報告には必ず以下を含める。

```text
変更したscreen/component
追加/変更したtokens
新しく追加した色
追加したvariant/state
確認したdensity mode
確認したスクショサイズ
スクショ保存先
Performance上の懸念
未調整polish項目
```

UI変更で以下がある場合は、merge前に判断待ちにする。

```text
新しい色を追加した
新しいButton variantを追加した
新しいPanel variantを追加した
Component Galleryに未反映
参照画像10枚と方向が違う
PC/compactのどちらかだけ破綻している
```

## 13. Codex Prompt Rule

CodexへUI polish / UI実装を依頼する時は、必ず以下を入れる。

```text
Codexはデザインを発明しないでください。
docs/48 / docs/49 / docs/50 を必ず読み、tokens / primitives / components / Component Gallery に沿って実装してください。
UI状態、motion、typography、touch target、density mode、screenshot reviewを守ってください。
新しい色・影・角丸・button variant・panel variantを勝手に追加しないでください。
追加が必要な場合はdocsとtokensに理由を残してください。
UI変更後は指定サイズのスクリーンショット確認結果を報告してください。
```

## Final Gate

UIを「完成」と呼ぶ前に、以下を満たす。

```text
Component Galleryで基本部品が揃っている
主要componentのstate matrixが揃っている
tokens.cssで色/余白/角丸/影/文字が管理されている
指定5サイズでスクリーンショット確認している
compact/normal/wide/desktopのdensity方針が破綻していない
ロン/あがり/Resultだけが特別に見える
通常画面は静かに見える
Vamp-pon世界の紙/黒インク/灯りが自然に見える
```

それでも迷う場合は、実装で足さずに判断待ちにする。
