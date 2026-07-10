# Skin System

## Purpose

soro-ponのUIを、ゲーム機能・ルール・操作性を一切変えずに、複数のデザインスキンへ
切り替えられる構造にする。

公式スキン:

```text
yorunoshirube: 夜の机 / 紙 / 黒インク / ランタン光 / 記憶帳(design target 10枚が基準)
cute-pop:      一般向け / 明るい / 可愛い / 親しみやすい / ポップ
```

将来、季節スキン・販売スキンを追加できる独立パッケージ構造とする。

## Audit Result (S1, 2026-07-10)

### スキンで変更すべき場所

```text
src/ui/styles/tokens.css        -> 全tokenがヨルノシルベ直書き。base + skin別tokensへ分離
src/ui/components/components.css -> rgba/hex直書き15箇所(境界線/オーバーレイ/グロー)をtokens化
src/ui/styles/base.css          -> game-shell背景グラデーション直書き1箇所
src/ui/gallery/gallery.css     -> 区切り線色直書き1箇所
src/ui/assets/*                 -> flat asset-slots.json方式をskin package方式へ拡張
src/ui/screens/DeckEditorScreen -> インラインborder色1箇所
フォント指定                     -> tokens経由だが許可済みセット制約なし -> 許可セット検証を追加
```

### スキンで変更してはいけない場所(固定契約)

```text
src/engine / src/schemas / src/storage / src/domain(スキンから参照不可)
useResponsiveMetrics(整数px牌メトリクス・density)
.sp-match-layout のgrid契約(docs/48 §5)
牌のaspect-ratio 3/4、タッチ最小44px/主要54px
DOM構造・画面遷移・状態管理・テキスト内容
focus-visible / disabled / selected / warningの意味
prefers-reduced-motion対応
```

### 直書き(修正対象)

```text
色: components.css 15箇所 / base.css 1 / gallery.css 1 / DeckEditorScreen 1
画像パス: なし(全てasset slot経由。監査grepで確認済み)
画像サイズへのレイアウト依存: なし(全てCSS/tokensでサイズ管理)
クリック判定: 全てbutton要素。画像形状依存なし
```

### 画面固有の重複実装(共通化対象)

```text
確認ダイアログ: MatchScreen(中断)/DeckEditorScreen(離脱)で重複 -> Dialog
検証issue一覧: DeckDetail/DeckEditorで重複 -> ValidationIssueList
画面ヘッダ: 全画面で手書き -> SectionHeader
フォーム: DeckEditorに生input/select/textarea 21箇所 -> TextField/NumberField/SelectField/FormField
空状態文言: Collection等に散在 -> EmptyState
importモーダル: AppRoot内に直書き -> Dialog + TextField
```

## Architecture

### 2層分離

```text
Layout層(スキン不変):
  width / height / grid / flex / gap / padding / positioning /
  touch area / aspect-ratio / responsive behavior / DOM構造

Skin層(スキンで変更可):
  background / image / border / color / texture / ornament /
  shadow / glow / radius見た目 / font-family(許可セット内) / effect素材
```

CSSは全てtokens(--sp-*)参照とし、スキンはtokenの値とasset slotの画像だけを差し替える。

### Skin Package構造

```text
public/assets/ui/soro-pon/
  skins/
    base/
      skin.json          # slot定義(全slotのfallback契約)
      tokens.css         # 全tokenの既定値(=操作可能な無画像スキン)
      generated/final/   # 画像(baseは原則空)
    yorunoshirube/
      skin.json
      tokens.css         # 夜の机token(現行tokens.cssから移行)
      generated/final/
    cute-pop/
      skin.json
      tokens.css
      generated/final/
  SKIN-MANIFEST.json     # 公式スキン一覧 + default + contractVersion
  SKIN-CONTRACT.json     # slot契約(サイズ/renderMode/safeArea)とtoken許可リスト
```

### TypeScript構造

```text
src/ui/skins/
  skinTypes.ts            # SkinManifest / SkinAssetDefinition / ResolvedSkin
  validateSkinManifest.ts # strict検証(純関数)
  parseSkinTokens.ts      # tokens.cssの安全パース(純関数)
  resolveSkin.ts          # 継承merge・循環検出(純関数)
  getSkinAssetUrl.ts      # slot -> URL解決(パス検証込み、純関数)
  skinRegistry.ts         # 公式スキン定数 + manifest fetch
  SkinProvider.tsx        # context / tokens適用 / localStorage永続化
  useSkin.ts              # useSkin() / useSkinAsset(slot)
  SkinSurface.tsx         # renderMode描画の集約(nine-slice等はここだけ)
```

## Skin Manifest

```ts
type SkinManifest = {
  id: string;                 // [a-z0-9-]
  label: string;
  version: number;
  skinContractVersion: number; // アプリのSKIN_CONTRACT_VERSION以下のみ受理
  origin: 'official' | 'external'; // 公式同梱 / 将来の販売・外部
  author?: string;
  inherits?: string;          // 省略時はbaseへfallback
  tokensFile: string;         // パッケージ内相対ファイル名のみ
  slots: Partial<Record<AssetSlotName, SkinAssetDefinition>>;
};

type SkinAssetDefinition = {
  file: string | null;        // パッケージ内ファイル名のみ(パス区切り/../URL拒否)
  status: 'placeholder' | 'final';
  renderMode: 'cover' | 'contain' | 'stretch' | 'repeat' | 'nine-slice' | 'overlay';
  intrinsicSize?: { width: number; height: number };
  transparent?: boolean;
  nineSlice?: { top: number; right: number; bottom: number; left: number };
  contentSafeArea?: { top: number; right: number; bottom: number; left: number };
  opacity?: number;           // 0..1
  blendMode?: string;         // 許可リスト内のみ
};
```

## 安全要件

```text
- tokens.cssは行単位で厳格パース: `--sp-<name>: <value>;` のみ受理。
  url() / @import / expression / javascript: / 外部参照を含む値は拒否
- --sp-font-family は許可済みフォントセット(APPROVED_FONT_STACKS)からのみ選択可
- slot fileはファイル名のみ(`/` `\\` `..` `:` を含むと拒否)-> 外部URL実行不可
- blendModeは許可リスト(normal/multiply/screen/overlay/soft-light)のみ
- 画像上限: 1ファイル2MB / intrinsicSize最大2048px / skin全体16MB(契約に記載)
- 継承: 循環・存在しない親・自分自身継承は拒否しbaseへfallback
- contractVersionがアプリより新しいスキンは拒否しdefaultへfallback
- 不正manifest/壊れたlocalStorage skinId -> defaultスキンへ安全復旧(起動不能にしない)
- スキンはengine/game state/score/save dataへアクセス不可(データのみ、コード実行なし)
```

## パーツ契約(抜粋。正本はSKIN-CONTRACT.json)

```text
Button:  最小高44px/主要54px。nine-slice可。文字はHTML text。文字安全領域8px
Panel:   サイズは親が管理。nine-slice/repeat可。本文safeArea 12px
Tile:    aspect-ratio 3/4固定。帯22%/フェイス/名前領域固定。状態はCSS/透過overlay。
         クリック領域はスキンで不変
Table:   cover。中央60%に重要コントラストを置かない
Effect:  overlayのみ。レイアウト非干渉。常時発光禁止。reduced-motionでも意味を保持
```

## Skin切り替え

```ts
const { activeSkinId, setActiveSkin } = useSkin();
setActiveSkin('cute-pop'); // reload不要。tokens<style>とdata-skinを差し替えるだけ
```

```text
- activeSkinIdはsettings(localStorage)へ保存
- 未知ID/壊れた値はdefault skinへ復旧
- defaultはSKIN-MANIFEST.jsonのdefaultSkinIdで管理(現在: yorunoshirube)
```

## 新機能追加時の手順(必須)

```text
1. 既存の共通コンポーネントで構成できるか確認
2. 不足があれば共通コンポーネントへvariant追加(画面独自ボタン/パネル禁止)
3. 新しい視覚パーツが必要ならasset slot追加(slots.ts + SKIN-CONTRACT.json)
4. slotへサイズ・safeArea・renderModeを定義
5. base / yorunoshirube / cute-pop のfallback(token/CSS)を用意
6. Component Galleryへ状態追加
7. 両スキン×5サイズで確認
8. その後、実画面へ導入
```

## 禁止事項

```text
画面CSSへの色コード直書き / コンポーネントへのPNGパス直書き
画像サイズをDOMサイズとして使用 / 画像透明部分をクリック判定に使用
文字の画像焼き込み / skinごとの画面コンポーネント分岐(cute-pop専用MatchScreen等)
skinからengine/schema/storageへのアクセス / manifestでの外部URL・JS許可
tokensを使わない一時色 / 既存IP素材
```

## Final Decision

スキンは「検証済みtoken + 検証済みasset slot」だけを差し替えるデータパッケージである。
コードも、レイアウトも、ルールも、判定も持たない。
