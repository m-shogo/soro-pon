# soro-pon UI Asset Factory

## Purpose

`soro-pon` のUIパーツを、Codex / 画像生成AI / Python処理で作るための作業場。

ここは **生成・透過・確認のための工房** であり、runtimeが直接読む場所ではない。

## Canonical Design Reference

デザインを作る前に必ず見る。

```text
docs/design-targets/generated/soro-pon-landscape-vampon-ui-v1/
```

このディレクトリの画像品質を基準にする。

## Core Workflow

Codexや画像生成AIでUIパーツを作る時は、背景透過を直接期待しない。

固定フロー:

```text
1. 参考デザインを見る
2. 必要パーツを分解する
3. 緑背景でパーツを生成する
4. Pythonで緑背景を透過する
5. 透過PNGを確認する
6. 実装用パーツだけ public/assets/ui/soro-pon/v1/ へ移す
```

## Directory Roles

```text
tools/asset-factory/soro-pon-ui/
├─ README.md
├─ prompts/
│  └─ prompt-template.md
├─ scripts/
│  └─ chroma-key-green-to-alpha.py
├─ raw-green/       # local only, gitignore recommended
└─ processed/       # local only, gitignore recommended
```

## Asset Output Destination

実装で読み込む透過PNGはここに置く。

```text
public/assets/ui/soro-pon/v1/
```

## Chroma Key Rule

生成時の背景色は、できるだけ単色の明るい緑にする。

推奨:

```text
#00ff00
```

避ける:

```text
被写体に緑を使う
背景に影やグラデーションを入れる
背景に紙テクスチャを入れる
緑の反射光を被写体に強く入れる
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

## Do Not Commit Here

以下は原則コミットしない。

```text
大量の生成途中画像
既存IP入り検証画像
失敗生成
ローカル検証専用素材
```

必要なら `.local-design/` か、このディレクトリ配下の local-only ignored folder に置く。

## Final Decision

- このディレクトリはUIパーツ生成工房
- 完成した実装用素材は `public/assets/ui/soro-pon/v1/` へ置く
- 画面全体の参考画像は `docs/design-targets/generated/soro-pon-landscape-vampon-ui-v1/` を見る
