# Shared Vamp-pon Source Policy

## Purpose

`soro-pon` が Vamp-pon 世界内の遊びとして成立するように、世界観・キャラ・敵・ステージ・武器・アイテムを共有する方針を固定する。

## Core Decision

```text
Vamp-pon repo = 世界観の正本
soro-pon repo = 世界観を読む側
```

`soro-pon` 側にキャラ設定や世界観設定をコピペしない。

## Mandatory Source

今後の第一入口は以下。

```text
m-shogo/vamp-pon
docs/shared-vampon-master-index.md
```

ローカル作業では以下を先に読む。

```text
/Users/m-shogo/Developer/personal/vamp-pon/docs/shared-vampon-master-index.md
/Users/m-shogo/Developer/personal/soro-pon/docs/42-shared-vampon-source-policy.md
```

作業対象は `soro-pon`。Vamp-pon 側は読み取り専用として扱う。

## Why

Vamp-pon側は今後も変わる。

そのため、soro-pon側に独立コピーを持つと以下が起きる。

```text
設定が古くなる
キャラ名や敵名がズレる
ステージやアイテムの意味が変わっても追従できない
同じ修正を2repoに入れる必要が出る
AIが古い方を読んで実装する
```

## What soro-pon Can Use

`soro-pon` は以下を参照してよい。

```text
世界観の基調
キャラの雰囲気
敵/影/記憶の扱い
ステージモチーフ
武器/アイテムのモチーフ
紙/黒インク/小さな光/ランタン/朝のビジュアルルール
```

## What soro-pon Must Not Do

```text
Vamp-ponの本編ストーリーを勝手に進めない
Vamp-pon本編の重要ネタバレをカード化しない
Vamp-ponの戦闘バランスをsoro-pon側で変更しない
Vamp-ponのキャラ設定をsoro-pon側で上書きしない
Vamp-ponの素材ファイルを無断コピーしない
```

## soro-pon Design Mapping

Vamp-pon要素をsoro-pon内では以下のように変換する。

```text
character -> 記憶札 / 称号 / 対戦相手アバター候補
enemy -> 影札 / 妨害ではなくテーマ牌
stage -> 札卓背景 / Deck theme / 盤面スキン
item -> 牌モチーフ / 報酬 / コレクション
weapon -> 役名 / 札モチーフ / Result演出
```

## Sync Policy

`soro-pon` 側では、参照元を明記するだけにする。

```text
参照元: m-shogo/vamp-pon docs/shared-vampon-master-index.md
```

Vamp-pon側に変更が入ったら、soro-pon側は以下だけ確認する。

```text
デザイン方針に影響するか
公式サンプルに影響するか
カード名/カテゴリ名に影響するか
ネタバレや未確定設定を使っていないか
```

## AI Instruction

AIに作業させる場合:

```text
soro-ponの世界観やカードテーマを作る前に、Vamp-pon repo の docs/shared-vampon-master-index.md を読むこと。
ただし、その内容をsoro-pon側に丸ごとコピーしないこと。
必要な引用/要約は最小限にして、参照元を明記すること。
```

## Final Decision

- 世界観正本はVamp-pon repoの `docs/shared-vampon-master-index.md`
- soro-pon側はコピーせず参照する
- 入口はVamp-pon側の1資料に集約する
- キャラ/敵/ステージ/アイテム/武器の共有は、その資料を通す
- soro-ponはVamp-pon世界内の遊びとして、世界観を借りる側にする
