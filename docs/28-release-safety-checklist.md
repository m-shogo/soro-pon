# Release Safety Checklist

## Purpose

一時的なローカル検証データや既存IP由来の情報が、公開物・公式サンプル・ビルド成果物に混入しないようにする。

結論:

```text
リリース前に dev-fixtures/ip-local/ を削除または空にする。
既存IP名・既存IPデータ・第三者画像が公開物に入っていないか確認する。
```

## Must Delete Before Public Release

公開前に必ず削除する。

```text
dev-fixtures/ip-local/*.json
dev-fixtures/ip-local/*.md
*.ip-local.json
*.local-deck.json
*.local-fixture.json
```

## Must Not Appear In

既存IP由来の名前・画像・役名・説明は以下に入れない。

```text
src/
public/
docs/
README.md
AGENTS.md
build artifacts
official sample decks
official screenshots
export payloads
marketing copy
social posts
```

## Official Sample Deck Rule

公式/公開サンプルは安全テーマのみ。

候補:

```text
動物スターター
旅行スターター
おやつスターター
星座スターター
オリジナルキャラクター
```

固定:

```text
MVP公式サンプルは動物スターター
```

## Local Fixture Rule

開発中に一時的な検証データをgit管理する場合、以下を守る。

```text
localOnly: true
mustDeleteBeforePublic: true
notesに削除前提を書く
画像/ロゴ/引用/外部URLを入れない
src/publicへ移動しない
公式スクショに使わない
```

## Pre-release Search Checklist

リリース前に以下を検索する。

```text
dev-fixtures/ip-local
localOnly
mustDeleteBeforePublic
.ip-local
.local-deck
.local-fixture
imageUrl
imageBase64
remoteImage
localImageId
blob:
file://
```

さらに、既存IP固有名が残っていないか検索する。  
検索語はプロジェクト内の一時検証ファイルに含まれていた固有名を対象にする。

## JSON Export Safety

共有JSONに含めてよい:

```text
deck name
category definitions
category colors
tile names
emoji
fallbackLabel
counts
roles
role conditions
points
wildcard rules
```

共有JSONに含めてはいけない:

```text
image
imageUrl
imageBase64
remoteImage
localImageId
external asset URL
blob URL
file path
third-party image metadata
```

## Build Safety

ビルド対象から除外する。

```text
dev-fixtures/ip-local/
```

MVP実装時には、ローカル検証データを読み込む場合も以下に限定する。

```text
development mode only
explicit import only
never auto-bundle into production
```

## UI Safety

公式UIで避ける文言:

```text
推しキャラで作ろう
人気IPデッキ
アニメデッキ
漫画デッキ
画像をアップロードして遊ぼう
公式おすすめIPデッキ
```

使う文言:

```text
自分だけのデッキを作る
カテゴリと役を自由に作る
画像なしでも遊べる
ローカル画像は自分の端末だけ
共有JSONに画像は含まれません
```

## Release Blocking Conditions

以下が1つでもあればリリース不可。

```text
dev-fixtures/ip-local/ にファイルが残っている
公開サンプルに既存IP名がある
public/ に第三者画像がある
src/ に既存IP固有名がある
README/docsに既存IP固有名がある
export JSONに画像情報が含まれる
公式スクショに既存IPデッキが映っている
```

## Final Decision

- ローカル検証データは公開前に必ず削除
- 公式サンプルは安全テーマのみ
- 共有JSONに画像情報は入れない
- production buildにlocal fixtureを含めない
- 既存IP固有名がsrc/public/docs/READMEに残っていたらリリース不可
