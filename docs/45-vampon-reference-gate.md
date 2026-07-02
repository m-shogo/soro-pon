# Vamp-pon Reference Gate

## Purpose

soro-ponでVamp-pon由来の情報を使う前に、必要な正本を読むための共通ゲート。

対象はキャラだけではない。

```text
Characters
Enemies
Stages
Items
Weapons
Visual Rules
UI/UX In-world Rules
Spoiler Boundary
Derived Game Usage
```

## Strict Rule

Vamp-pon由来の情報を使う時は、記憶や雰囲気だけで判断しない。

必ずVamp-pon側の正本入口から読み、必要なリンク先まで確認する。

## First Required Source

必ず最初に読む。

```text
/Users/m-shogo/Developer/personal/vamp-pon/docs/shared-vampon-master-index.md
```

## soro-pon Policy Source

次に読む。

```text
/Users/m-shogo/Developer/personal/soro-pon/docs/42-shared-vampon-source-policy.md
```

## Category-specific Read Requirements

### Characters

```text
/Users/m-shogo/Developer/personal/vamp-pon/data/character-assets/core5-character-master-assets.json
/Users/m-shogo/Developer/personal/vamp-pon/src/game/data/characterCanon.ts
/Users/m-shogo/Developer/personal/vamp-pon/docs/core5-runtime-loadout-map.md
/Users/m-shogo/Developer/personal/soro-pon/docs/44-vampon-character-generation-gate.md
```

### Enemies

master index の Enemies セクションで Canon / Runtime / Prototype / Tooling を確認する。

特に確認するもの:

```text
敵名
敵タイプ
影/記憶としての扱い
黒インク影の視覚ルール
怖すぎない制約
mobile scaleでの可読性
```

### Stages

master index の Stages セクションで Canon / Runtime / Generated を確認する。

特に確認するもの:

```text
Stage Selectの夜地図/ルート/旅記録表現
背景の可読性
プレイヤー/敵/ピックアップ/HP/UIの視認性
ステージごとのネタバレ境界
```

### Items / Weapons

master index の Items / Weapons セクションで Canon / Runtime / Prototype を確認する。

特に確認するもの:

```text
武器名
アイテム名
進化/合体/覚醒の扱い
通常画面とレア演出の強弱
runtime参照中prototypeかどうか
直接素材コピーしてよいかではなく、参照として使うだけか
```

### Visual Rules

master index の Visual Rules を優先する。

特に確認するもの:

```text
色数を増やしすぎない
紙UI / 黒インク / ランタン光を主軸にする
レア演出だけ派手にする
通常画面は静かにする
文字可読性を最優先
素材の質感を混ぜすぎない
生成画像をそのままruntimeへ混ぜない
```

### UI/UX In-world Rules

master index の UI/UX In-world Rules を確認する。

soro-ponでは以下に変換する。

```text
Vamp-ponの紙/インク/灯り -> 盤面スキン
キャラ/敵/ステージ/アイテム/武器 -> 牌テーマ/盤面/Result/Collectionの参照
本編HUD -> そのまま持ち込まない
麻雀ベースの操作性 -> soro-pon側で優先
```

### Spoiler Boundary

master index の Spoiler Boundary を確認する。

不明な場合は使わない。

```text
本編の重要ネタバレをカード化しない
未確定設定を断定しない
soro-pon側でVamp-pon本編を進めない
```

### Derived Game Usage

master index の Derived Game Usage を確認する。

soro-ponでは「Vamp-pon世界内の記憶札遊び」として使う。

## Required Report Before Using Vamp-pon Material

Vamp-pon由来の要素を使う前に、最低限以下を確認する。

```text
使うカテゴリ
読んだVamp-pon資料
使う要素名
参照元の行/ファイル
soro-ponでの変換先
ネタバレ問題の有無
素材コピーの有無
```

## Prohibited

```text
記憶だけでVamp-pon設定を使う
master indexを読まずに派生デザインを作る
キャラだけ読んで敵/ステージ/武器/アイテムを想像で補う
Vamp-pon素材を無断コピーする
soro-pon側でVamp-pon正本を上書きする
未確認設定を確定扱いする
```

## Final Decision

- キャラだけでなく全Vamp-pon要素に参照ゲートを適用する
- 最初に必ず shared-vampon-master-index.md を読む
- 必要に応じて各カテゴリのリンク先まで読む
- soro-pon側ではコピーではなく参照/変換として扱う
- 不明なものは使わない
