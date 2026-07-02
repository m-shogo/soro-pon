# Game Rules

## Rule Feel

`soro-pon` は、絵柄の牌を集めて役を作る3〜4人用の牌ゲーム。

開発上の説明としては「ドンジャラと同じルール感」とする。  
ただし、公開物では既存商品名や既存IPに依存しない。

## Players

- 3人戦
- 4人戦
- 2人戦は作らない
- MVPは人間1人 + CPU2〜3人

## Deck / RuleSet

このゲームにおける「デッキ」は、カードゲームの個人デッキではなく、その卓で使うルールセットを意味する。

```text
Deck = Tiles + Roles + Scoring Rules
```

全員が同じ山、同じ役表を使う。

## Turn Loop

基本ループ。

1. 現在プレイヤーが山から1枚引く
2. 手牌から1枚捨てる
3. あがれる場合は「あがる」を選べる
4. 次のプレイヤーへターンが移る

MVPでは、ロン・ポン・鳴き・リーチなどは後回しでよい。

## Hand / Win

最初はシンプルにする。

- 手牌から役条件を満たす組み合わせを判定する
- 成立役の合計点で結果を出す
- 複数役が成立する場合は、合計するか最大役のみかを後で決める

未決定事項は `TODO` として残し、勝手に複雑化しない。

## MVP Role Conditions

最初に対応する役条件。

### contains_all

指定した牌IDをすべて含む。

例:

```json
{
  "type": "contains_all",
  "tileIds": ["tile_a", "tile_b", "tile_c"]
}
```

### same_name_count

同じ名前の牌が指定枚数ある。

```json
{
  "type": "same_name_count",
  "name": "きつね",
  "count": 3
}
```

### same_category_count

特定カテゴリを持つ牌が指定枚数ある。

```json
{
  "type": "same_category_count",
  "category": "森",
  "count": 3
}
```

### all_different_categories

指定枚数の牌がすべて異なるカテゴリ条件を満たす。

### exact_group

指定した牌セットが完全に揃う。

## CPU

MVPのCPUは賢くなくてよい。

優先事項:

1. 合法手を必ず選ぶ
2. 進行不能にならない
3. 3〜4人戦が成立する
4. 後から思考改善できる構造にする

## Open Questions

- 初期手牌枚数
- あがり条件の厳密な形
- 複数役成立時の得点計算
- 捨て牌からのロン対応時期
- ポン/鳴き対応時期
- 役の重複許可

これらは実装前に追加検討する。
