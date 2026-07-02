# Sharing and Local Images

## Goal

デッキ共有では、作成の手間を省く。  
ただし画像は共有しない。

共有するのは、ルール・役・得点・カテゴリなどの構造情報だけ。

## Shared Deck JSON

共有JSONに含めるもの。

```json
{
  "version": 1,
  "id": "animal-starter",
  "name": "どうぶつスターター",
  "minPlayers": 3,
  "maxPlayers": 4,
  "tiles": [
    {
      "id": "fox",
      "name": "きつね",
      "categories": ["森", "すばやい"],
      "emoji": "🦊",
      "fallbackLabel": "狐",
      "count": 4
    }
  ],
  "roles": [
    {
      "id": "forest_trio",
      "name": "森のなかま",
      "points": 20,
      "condition": {
        "type": "same_category_count",
        "category": "森",
        "count": 3
      }
    }
  ]
}
```

## Do Not Include

共有JSONには以下を絶対に含めない。

- image
- imageUrl
- remoteImage
- imageBase64
- localImageId
- blob URL
- file path
- third-party asset URL

## Local Image Overrides

画像は各ユーザーの端末で設定する。

```ts
type LocalTileOverride = {
  tileId: string;
  displayName?: string;
  emoji?: string;
  localImageId?: string;
};
```

これは共有対象外。

## Display Priority

牌の表示優先順位。

1. local image override
2. emoji
3. fallbackLabel
4. name

ただし、名前は牌の下部に必ず表示する。

## Export Rules

export時にやること。

- 画像情報を除外する
- unknown image fieldsを含めない
- local overrideを含めない
- JSON schema versionを入れる
- deck id / deck name / tiles / roles を含める

## Import Rules

import時にやること。

- Zod schemaで検証
- 画像系フィールドを拒否または削除
- versionを確認
- 3〜4人用か確認
- tile countを確認
- role conditionを確認

## X / Social Sharing

初期はX API連携をしない。  
投稿文コピーだけでよい。

安全なテンプレ:

```text
soro-ponで自作デッキ作った！
役と点数のバランス、試してみて👇

{deckUrlOrCode}

#soropon #自作デッキ
```

避けるテンプレ:

```text
好きなアニメキャラで作ろう
推しキャラデッキを作ろう
IP作品名を含むテンプレ
```

## Initial Policy

- 公開ギャラリーは作らない
- ランキングは作らない
- アプリ内検索は作らない
- ユーザー共有は画像なしJSONのみ
- 画像は本人の端末で設定する
