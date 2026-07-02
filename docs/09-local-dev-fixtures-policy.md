# Local Dev Fixtures Policy

## Purpose

開発中は、分かりやすい題材でゲーム性を検証することがある。

ただし、それはローカル検証だけに限定する。

## Allowed Locally

ローカル検証では、以下のようなデータを一時的に作ってもよい。

- 理解しやすいキャラクター名
- 分かりやすいカテゴリ
- 分かりやすい役名
- 画像ありの見た目検証

目的は以下。

- 牌に画像があると楽しいか
- 名前が下にあると見やすいか
- 3〜4人対戦のテンポはよいか
- 役成立が分かりやすいか
- 点数が盛り上がるか
- 共有したくなるか

## Not Allowed in Repository

既存IP由来の検証データはrepoに入れない。

- srcに入れない
- publicに入れない
- docsに入れない
- READMEに入れない
- テストfixtureに入れない
- build成果物に入れない
- 公式スクリーンショットに出さない

## Suggested Local Paths

ローカルだけで使う場合は以下のようなパスに置く。

```text
dev-fixtures/ip-local/
  one-piece.local-deck.json
  naruto.local-deck.json
```

このフォルダは `.gitignore` 済み。

## Public-safe Replacement

公式サンプルは別に作る。

- 動物
- 国
- 歴史人物
- 旅行
- オリジナル

ローカル検証データを変換して公式サンプルにしない。  
公式サンプルは最初から安全テーマで作る。

## Final Rule

ローカル検証は自由。  
公開物はクリーン。  
この2つを混ぜない。
