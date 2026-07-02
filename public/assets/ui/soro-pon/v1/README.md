# soro-pon UI Assets v1

## Purpose

このディレクトリは、実装で直接読み込む soro-pon UI素材の置き場。

```text
public/assets/ui/soro-pon/v1/
```

## Runtime Rule

ここには **安全で実装に使う透過PNG** だけを置く。

入れてよい:

```text
透過PNGのUIパーツ
背景用PNG
インク/ランタン光などのエフェクトPNG
manifest.json
```

入れない:

```text
既存IP入り画像
生成途中画像
緑背景のraw画像
個人写真
失敗生成
ローカル検証専用素材
```

## Expected Structure

```text
public/assets/ui/soro-pon/v1/
├─ README.md
├─ manifest.json
├─ buttons/
├─ tiles/
├─ panels/
├─ effects/
└─ backgrounds/
```

Gitは空ディレクトリを保持しないため、各カテゴリは素材追加時に作る。

## Source Workflow

素材生成はここで行う。

```text
tools/asset-factory/soro-pon-ui/
```

画面全体のデザイン参照はここを見る。

```text
docs/design-targets/generated/soro-pon-landscape-vampon-ui-v1/
```

## Naming Rule

```text
buttons/button-primary.png
buttons/button-danger.png
tiles/tile-base.png
tiles/tile-selected.png
panels/panel-paper.png
effects/lantern-glow.png
backgrounds/night-desk-wide.png
```

## Final Decision

実装で使うUI画像はこのディレクトリを正とする。
