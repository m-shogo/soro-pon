# Batch 2 Art Direction (Cute Pop: table.background / panel.modal.background / panel.result.frame)

Batch 2の3slotを1つの背景・パネル素材ファミリーとして設計するための短い指針。
各asset requestとpromptはこの文書を参照する。R1(牌表/牌裏/CTA)を上書きしない。

## 世界観

Cute Popの対局空間は、パステル玩具箱の中に広げた小さな遊び場。
牌はお菓子(アイシングクッキー/キルトクッション)、CTAはジェリーキャンディという
「食べられそうな主役」が既に確定している。Batch 2はこの主役たちを引き立てる
「箱の中身」——布のプレイマット、紙のカード、玩具箱のフレーム——を作る。
背景は柔らかく静かに、パネルは読みやすく、結果画面だけは達成感で少し華やかに。

## 素材階層(密度と役割)

```text
table.background (最も静か・最も低密度・広い面積に耐える)
  -> 柔らかな布のプレイマット。牌・操作UIを支える土台。視線を奪わない

panel.modal.background (中密度・情報を囲う・可読性優先)
  -> クラフト紙のカード。きせかえ/確認/エラー等、複数用途のcontainer

panel.result.frame (最も高密度・祝祭感・達成感・スクリーンショット映え)
  -> 玩具箱のフレーム。対局終了時のみ表示される特別な瞬間
```

密度は「静か → 普通 → 華やか」の順で一段ずつ上げる。3つとも同じ密度にしない。

## 素材の使い分け(3slotを同じ画像の色違いにしない)

```text
table:  柔らかな布・プレイマット(繊維・軽い縫い目)
modal:  クラフト紙・絵本カード(紙繊維・淡い印刷ずれ・鉛筆線)
result: 玩具箱・リボン・木製ビーズ・紙吹雪(工作的な立体装飾)
```

素材は変えるが、色・線・陰影の「作法」は統一する(下記色ルール)。

## 色ルール

R1 final(アイシングクッキー: 暖色クリーム+オレンジ縁、キルトクッション: ローズピンク
+クリーム、ジェリーCTA: 濃いローズピンク #c22f57)およびCute Pop tokens.css
(`--sp-color-night: #fff3e2` 等)を踏まえ、Batch 2は次の色関係とする。

```text
primary rose-pink:    #c22f57 系(R1 CTAと同一系統) — Batch 2では小さな装飾
                       のアクセントとしてのみ使用。背景全面には使わない
                       (CTAの主役性を背景が食わないため)
cream / neutral paper: #fff9f0 - #fff3e2 系(tokens.cssの--sp-color-night/
                       --sp-color-paper系と親和) — table/modalのベース色
pastel yellow:         #ffe9a8 - #ffdc8a 系 — result frameのリボン/ビーズ
mint:                  #bfe8d4 系 — result frameの装飾アクセント(新規追加、
                       既存token外だが背景装飾なのでtoken契約に抵触しない)
light blue:            #bcdcf0 系 — table背景の縫い目/陰影の寒色差し色
                       (暖色一辺倒を避け、パステル玩具箱らしい多色感を出す)
lavender:              #ddd0f0 系 — modal装飾のアクセント(少量)
dark outline color:    #55402f 系(--sp-color-ink)相当 — 手描き線・縫い目の
                       輪郭。R1と共通の「暖かい焦げ茶」で統一感を保つ
text foreground:       DOM側で重ねるため画像に文字は焼き込まない
```

背景(table/modal)は上記のcream/paperを主体とし、CTAと同じ濃いピンクを
大面積に使わない。resultのみ、達成感の演出としてrose-pink/yellowの装飾を
増量してよいが、中央のスコア・文字領域は静かに保つ。

## 密度ルール(実装契約と対応)

```text
table.background (renderMode: cover, intrinsicSize 1920x1080):
  低密度。牌が置かれる中央〜下部エリアにノイズを置かない
  四隅・周辺にのみ玩具箱的な軽いディテール
  viewport cropで重要ディテールが切れないよう、密度は全体に分散させる
  (四隅だけに寄せすぎるとcrop次第で消える)

panel.modal.background (renderMode: nine-slice, intrinsicSize 512x384,
  nineSlice 24, contentSafeArea 16, minRenderSize 96x96):
  四隅・外周(nineSlice領域)にのみ装飾。contentSafeArea内側は完全に無地
  中央帯(top/bottom/left/right各辺の中央)は水平/垂直に一様
  (9-slice伸縮でseamを出さないため)

panel.result.frame (renderMode: nine-slice, intrinsicSize 512x384,
  nineSlice 32, contentSafeArea 16, minRenderSize 96x96):
  外周は3slot中もっとも華やか(リボン/ビーズ/紙吹雪の装飾)
  contentSafeArea内側(スコア・役リスト・ボタン領域)は静かに保つ
  勝敗のどれでも使える中立的な華やかさ(WIN/LOSE等の文字焼き込み禁止)
```

## 除外するデザイン(CSSだけで成立するもの)

以下は画像候補として生成しない。単色塗り/単純なlinear・radial-gradient/
均一なドット・ストライプ・格子/通常のborder・二重線・角丸/通常のbox-shadow/
CSS noiseだけの背景/pseudo-elementだけで作れる装飾/均一なスカラップ/
単純な紙色・布色の塗りつぶし。画像候補には必ず、手描きの微妙な揺らぎ・
紙や布の繊維・不均一な光沢・微細な凹凸・柔らかな立体感・刺繍や縫い目・
エンボス・空気を含んだクッション感のうち複数を含める。

## R1 finalとの関係

- R1(tile.face.base/tile.back.base/button.primary.background)は変更しない
- table.background/panel.modal.backgroundは「静かな土台」として、R1のお菓子
  質感より低密度・低彩度に保ち、牌とCTAの視認性を落とさない
- panel.result.frameのみ、達成感演出としてR1と並ぶ密度を許容するが、
  素材(玩具箱/リボン/ビーズ)をR1(食品/クッション)とは変え、画面全体が
  「全部お菓子」に見えないようにする

## 対象Slot

```text
cute-pop/table.background
cute-pop/panel.modal.background
cute-pop/panel.result.frame
```

Request: [010](010-cute-pop-table-background.md)(table.background)、
[011](011-cute-pop-panel-modal-result.md)(panel.modal.background /
panel.result.frame — ともにnine-slice paperパネル系のため1requestへ統合)。
