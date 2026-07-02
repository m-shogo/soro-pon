# Vamp-pon Character Generation Gate

## Purpose

soro-ponでVamp-ponキャラを画面デザインや画像生成に出す前の必須確認を固定する。

## Strict Rule

Vamp-ponキャラを出す場合、汎用AIキャラで代用しない。

```text
顔を出すことは許可する。
ただし、Vamp-pon側の正本と参照画像に寄せることを必須にする。
```

## Required Read Order

Vamp-ponキャラを扱う前に、必ず以下を読む。

```text
/Users/m-shogo/Developer/personal/vamp-pon/docs/shared-vampon-master-index.md
/Users/m-shogo/Developer/personal/vamp-pon/data/character-assets/core5-character-master-assets.json
/Users/m-shogo/Developer/personal/vamp-pon/src/game/data/characterCanon.ts
/Users/m-shogo/Developer/personal/vamp-pon/docs/core5-runtime-loadout-map.md
/Users/m-shogo/Developer/personal/soro-pon/docs/42-shared-vampon-source-policy.md
```

## Required Image Reference

画像生成でCore5キャラの顔や立ち絵を出す場合は、各キャラの以下を確認する。

```text
masterBoardPath
spriteSheetPath
```

可能な環境では、master board と sprite sheet の実画像を両方参照する。

実画像を参照できない場合は、キャラ顔を作り込まない。

## Fallback When Image Reference Is Not Available

実画像参照ができない場合は、以下だけを使う。

```text
キャラ名
器物モチーフ
札入れ
小アイコン枠
灯り
シルエット
```

Core5の器物モチーフ:

```text
ユイ = ランタン
アサ = 名札 / 紙片
ナギ = 月箱 / 鍵
ミチル = コンパス / 地図線
トモリ = 修理ランプ / 道具袋
```

## Prohibited

```text
資料を読まずにキャラを出す
汎用AI顔をVamp-ponキャラとして扱う
キャラ名だけを使って顔を生成する
Vamp-ponキャラ設定をsoro-pon側で上書きする
Vamp-ponの素材をsoro-pon側へ無断コピーする
```

## Required Report Before Generation

Vamp-ponキャラ入り画像を作る前に、作業者は最低限以下を確認してから進める。

```text
読んだVamp-pon資料
使うキャラ
参照できたmasterBoardPath
参照できたspriteSheetPath
実画像参照の可否
顔を出すか、器物モチーフだけにするか
```

## Final Decision

- 顔生成は許可する
- ただしVamp-pon正本と参照画像に寄せる
- 実画像参照なしで汎用顔を作らない
- 迷ったら顔を出さず、器物モチーフに逃がす
