# Asset Request: Cute Pop ボタン/紙パネル面 (button.secondary.background / panel.paper.default)

## Skin / Slot

- skin: `cute-pop`
- slots: `button.secondary.background`, `panel.paper.default`
- target files (candidates):
  - `generated/candidates/button-secondary-2x.png`
  - `generated/candidates/panel-paper-2x.png`

## Purpose

Cute Pop TOP画面の主構成要素。メニューボタン(paper variant)と白カードパネルを
CSS fallbackから実アセットへ置き換える第1レビュー単位。

## Used By

- Button(variant="paper" → `button.secondary.background`): TOP/一覧/編集の全所
- PaperPanel(default): MatchSetup/DeckDetail/Modal ほか

## Render Contract

- renderMode: nine-slice / pixelDensity: 2(高密度ソース)
- button: 480x144px(=240x72 CSS), nineSlice 32(source), render 16(CSS), safeArea 16, minRender 72x44
- panel: 768x512px(=384x256 CSS), nineSlice 48(source), render 24(CSS), safeArea 24, minRender 64x64
- 透過PNG(丸角の外側は透明)。文字・アイコンは焼き込まない

## Visual Direction

- 白ベースの柔らかいカード。丸み(button 14px / panel 20px相当)
- 縁は暖色ベージュの細線1.5px、下辺内側にわずかな厚み(シェード帯)で「押せる」感
- フラット基調。過剰な光沢・強いグラデーション・ドロップシャドウ焼き込みは禁止
  (影はCSS tokenが担当する)
- 四隅にごく控えめな装飾ドット可(corner領域内、伸縮しない位置)

## Must Avoid

- AI生成感のある不均一なテクスチャ / 立体的すぎるベベル
- 彩度の高いピンクの面(ピンクはCTA=primaryの役割)
- 端の暗いビネット(nine-slice伸縮で縞になる)

## Fallback If Missing

tokens(--sp-gradient-button-paper / --sp-gradient-panel-paper)によるCSS面で表示済み

## Acceptance Checklist

- [ ] min幅(72px)〜長文2行ボタンで縁が破綻しない
- [ ] 最小64x64〜大型パネルで四隅が変形しない
- [ ] 上に--sp-text-on-surfaceの文字を置いて4.5:1以上
- [ ] cute-pop/yorunoshirube切替で混在フラッシュなし
- [ ] 844x390〜1366x768の5サイズで確認

## Generation Method

`scripts/generate-cute-pop-candidates.mjs`(SDFベースのアンチエイリアス矩形描画、
機械生成・ライセンス問題なし)。再生成可能・決定的。
