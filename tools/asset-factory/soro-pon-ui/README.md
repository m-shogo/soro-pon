# soro-pon UI Asset Factory

## Purpose

`soro-pon` のUIパーツを、Codex / 画像生成AI / Python処理で作るための作業場。

ここは **生成・透過・確認のための工房** であり、runtimeが直接読む場所ではない。
手順の正本は `docs/IMAGE-ASSET-WORKFLOW.md`(8工程)。

## Canonical Design Reference

デザインを作る前に必ず見る。

```text
docs/design-targets/generated/soro-pon-landscape-vampon-ui-v1/
```

このディレクトリの画像品質を基準にする。

## Core Workflow

Codexや画像生成AIでUIパーツを作る時は、背景透過を直接期待しない。

固定フロー(詳細はdocs/IMAGE-ASSET-WORKFLOW.md):

```text
1. 参考デザインとasset request(slot契約)を見る
2. 必要パーツを分解する
3. 緑背景でパーツを生成する(raw-green/へ保存)
4. Pythonで緑背景を透過する(processed/へ出力)
5. 透過PNGを検査する(寸法/余白/透明境界/フリンジ)
6. 検査済み候補だけ public/assets/ui/soro-pon/skins/<skin>/generated/candidates/ へ移す
7. Gallery/実画面レビュー -> 人間の承認後のみ generated/final/ へ
8. 生成記録を records/ に残す
```

## Directory Roles

```text
tools/asset-factory/soro-pon-ui/
├─ README.md
├─ prompts/     生成指示テンプレート(prompt-template.md)。git管理
├─ scripts/     透過処理等(chroma-key-green-to-alpha.py)。git管理
├─ records/     候補ごとの生成記録metadata JSON。git管理
├─ raw-green/   グリーン背景の元画像。local only(gitignore済み)
└─ processed/   透過処理の中間出力。local only(gitignore済み)
```

## Asset Output Destination

検査済み候補と承認済みfinalはskin packageへ置く(旧 `v1/` 直下配置は廃止)。

```text
public/assets/ui/soro-pon/skins/<skin-id>/generated/candidates/
public/assets/ui/soro-pon/skins/<skin-id>/generated/final/   (人間承認後のみ)
```

## Chroma Key Rule

生成時の背景色は、できるだけ単色の明るい緑にする。

推奨:

```text
#00ff00
```

避ける:

```text
被写体に緑を使う(必要ならマゼンタ/ブルー背景へ切り替え、recordsに記録)
背景に影やグラデーションを入れる
背景に紙テクスチャを入れる
緑の反射光を被写体に強く入れる
被写体を画像端に接触させる
```

## Vamp-pon / soro-pon Visual Rule

パーツ生成時も、以下を崩さない。

```text
横画面固定UI
紙UI
黒インク
ランタン光
夜の机
記憶札
静かな通常画面
見せ場だけ少し派手
文字可読性優先
```

Cute Popパーツは docs/asset-requests/ の該当requestのVisual Directionに従う。

## Do Not Commit Here

以下は原則コミットしない。

```text
大量の生成途中画像
既存IP入り検証画像
失敗生成
ローカル検証専用素材
```

必要なら `.local-design/` か、このディレクトリ配下の local-only ignored folder に置く。

## Known Gap

`scripts/chroma-key-green-to-alpha.py` は現状チャンネル条件の2値判定のみで、
docs/IMAGE-ASSET-WORKFLOW.md の透過契約(色距離・2段しきい値・アルファ補間・
despill)を満たしていない。画像生成系アセットの実生産開始前に改修すること。

## Final Decision

- このディレクトリはUIパーツ生成工房
- 完成した素材は skin package の candidates -> (承認) -> final へ置く
- 手順・契約の正本は docs/IMAGE-ASSET-WORKFLOW.md
