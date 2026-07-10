# Asset Manifest (soro-pon UI)

UIコンポーネントは **asset slot名** だけを知る。画像パスの直書きは禁止。

## Skin Package方式(現行)

アセットはスキン単位で管理する。正本は以下。

```text
skins/<skinId>/skin.json     … slotごとの画像と描画契約(renderMode/nineSlice/safeArea)
skins/<skinId>/tokens.css    … 検証済みdesign token(--sp-*のみ)
skins/<skinId>/generated/final/ … 画像本体
SKIN-MANIFEST.json           … 公式スキン一覧とdefault
SKIN-CONTRACT.json           … slot契約・token制約・容量上限の正本
```

設計と安全要件は `docs/SKIN-SYSTEM.md` を参照。

## 画像差し替え手順

```text
1. Codex画像生成などでPNG/WebPを作る(文字焼き込み禁止 / 透過推奨)
2. skins/<skinId>/generated/final/ に置く
3. skins/<skinId>/skin.json の該当slotを status: "final" / file: "<ファイル名>" に更新
4. DOM構造・ロジック・レイアウトは変更しない(背景として重なるだけ)
```

fileがnullの間は、tokens + CSS/SVG fallbackで表示される(base skinは常に完全動作)。

## Codex画像生成の対象(placeholder一覧)

各スキンの `skin.json` で `status: "placeholder"` のslotが生成対象。
slotの推奨サイズ・nine-slice・safeAreaは `SKIN-CONTRACT.json` の `slots` を正とする。

```text
yorunoshirube: 全21slot(視覚方向は docs/asset-requests/ の5件を正とする)
cute-pop:      全21slot(明るい/可愛い/ポップ。docs/SKIN-SYSTEM.md参照)
```

## Rules

```text
- デザインターゲット画像(docs/design-targets/)は参照専用。runtime素材にしない
- クリック判定/状態管理/レイアウトは画像に依存しない
- 文字は画像に焼き込まない
- shared deck JSONに画像情報を入れない
- user import由来の画像/URLを公式UI assetにしない
- 既存IP素材を置かない
- スキンにJavaScript/任意CSS/外部URL/外部フォントを含めない
```
