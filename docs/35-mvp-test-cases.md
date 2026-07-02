# MVP Test Cases

## Purpose

MVP実装時に必ず通すテストケースを固定する。

テストはUIより先に、domain / schema / engine を中心に作る。

## Final Gate Alignment

このファイルは `docs/47-mvp-implementation-final-gate.md` と整合する。

固定:

```text
全主要画面は landscape-first
RuleConfig.supportedPlayerCounts で3/4人対応を表す
Role.kind は win_role / special_bonus のみ
score_bonus は Role.kind に入れず ScoreBonus[] で扱う
```

## Test Stack

```text
Vitest
TypeScript
Zod
```

## Schema Tests

### DeckProject

```text
valid animal-starter.deck.json parses
missing version fails
activeVariantId not found fails
tiles empty fails
categories empty fails
variants empty fails
unknown tile category fails
unknown primaryCategoryId fails
```

### Forbidden Image Fields

```text
image field fails
imageUrl field fails
imageBase64 field fails
remoteImage field fails
localImageId field fails
blobUrl field fails
filePath field fails
externalAssetUrl field fails
```

### RuleConfig

```text
supportedPlayerCounts [3] passes
supportedPlayerCounts [4] passes
supportedPlayerCounts [3,4] passes
supportedPlayerCounts [] fails
supportedPlayerCounts [2] fails
supportedPlayerCounts [3,4,2] fails
allowPon true fails
allowKan true fails
allowChi true fails
handSizeAfterDraw not equal handSizeNormal + 1 fails
winHandSize not equal handSizeAfterDraw fails
roleSpanMin > roleSpanMax fails
```

### Role

```text
win_role canTsumo true passes
win_role canRon true passes
win_role with both canTsumo/canRon false fails
special_bonus canTsumo true fails
special_bonus canRon true fails
Role.kind score_bonus fails
span below roleSpanMin warning/error by validation
span above roleSpanMax warning/error by validation
```

### ScoreBonus

```text
ScoreBonus duplicate_tile passes
ScoreBonus duplicate_name passes
ScoreBonus duplicate_category passes
ScoreBonus minCount below 2 fails
ScoreBonus maxPoints missing is warning by validation
ScoreBonus allowWildcard true is warning by validation
```

## Role Evaluation Tests

### Normal Variant

```text
9枚手札でmammal 6枚なら どうぶつ王国 成立
9枚手札でsea 5枚なら 海のパレード 成立
9枚手札でbird 4枚なら 空のなかまたち 成立
9枚手札でinsect 4枚なら 小さなヒーロー 成立
9枚手札でstrong 5枚なら つよいものクラブ 成立
```

### Multiple win_role Priority

```text
複数win_role成立時はpointsが高い役をselectedWinRoleにする
points同点ならspanが大きい役をselectedWinRoleにする
points/span同点なら定義順が早い役をselectedWinRoleにする
```

### Special Bonus

```text
ライオン+ゾウ+キリンがあれば サバンナ三兄弟 加点
かわいい代表から3種で かわいいトリオ 加点
森の対象から3種で 森のなかまたち 加点
special_bonusだけではcanWin=false
special_bonusはロン候補にならない
```

### ScoreBonus

```text
同じ牌3枚で duplicate_tile bonus 加点
wildcardはduplicate_tile bonusに含めない
ScoreBonus[]だけではcanWin=false
ScoreBonus[]はロン候補にならない
```

## Wildcard Tests

```text
star can complete win_role in hand
star can complete special_bonus
star cannot trigger ron when discarded
star does not count for scoreBonus
maxUsePerRole 1 respected
wildcardAssignments contains usedAsTileId or usedAsCategory
Result displays wildcard assignment
```

## Extended Variant Tests

```text
2枚役 ライオンと星 が成立する
3枚役 サバンナ集合 が成立する
10枚役 どうぶつ大行進 が成立する
13枚役 もうすぐ動物園 は14枚中13枚条件で成立する
13枚役は余り1枚を許可する
14枚役 どうぶつ王国完成 は14枚全体条件で成立する
14枚役は余り牌を許可しない
14枚役はwildcard禁止ならstarで代用不可
```

## Scoring Tests

```text
totalPoints = selectedWinRole + specialBonuses + scoreBonuses
earnedCoins = min(totalPoints, 500)
draw earnedCoins = 10
loss participation coins = 10
ron result records sourcePlayerId
tsumo result has no sourcePlayerId
paymentRecords for ron contains winner gain only
paymentRecords for tsumo contains winner gain only
draw has paymentRecords empty
```

## Deck Validation Tests

```text
総牌枚数81枚 is OK
総牌枚数60未満 warning
総牌枚数40未満 error
supportedPlayerCounts [3,4] OK
supportedPlayerCounts empty error
supportedPlayerCounts includes 2 error
2人戦開始 error
win_role 0件 error
win_role 1〜2件 warning
Role.kind score_bonus error
2枚役50点超 warning
3枚役100点超 warning
14枚役200点未満 warning
wildcardが総牌数15%超 warning
scoreBonus maxPointsなし warning
unused category info/warning
similar category colors warning
```

## Match Flow Tests

```text
setup rejects 2 players
setup allows 3 players when supportedPlayerCounts includes 3
setup allows 4 players when supportedPlayerCounts includes 4
setup deals handSizeNormal tiles to each player
draw phase draws one tile
human discard requires selectedTileInstanceId
CPU tsumo wins if canWin true
reaction phase checks ron candidates in seat order
multiple ron selects first candidate only
after discard with no ron moves to next player
drawPile empty results in draw
```

## CPU Tests

```text
CPU wins when tsumo available
CPU rons when ron available
CPU keeps wildcard if possible
CPU keeps tiles related to near win_role
CPU does not keep tile only for special_bonus if better discard exists
CPU falls back to random among equal candidates
```

## Progression Tests

```text
win adds coins
coins capped at 500 per match
first win unlocks achievement
ron win unlocks ron achievement
tsumo win unlocks tsumo achievement
first role achievement creates RoleCollectionEntry
first scoreBonus achievement creates RoleCollectionEntry with kind score_bonus
bestPoints updates when higher result achieved
ResultAlbum keeps Top 10 by points
cosmetic unlock does not affect match strength
```

## JSON Import/Export Tests

```text
exported JSON excludes local image overrides
exported JSON includes category colors
exported JSON includes supportedPlayerCounts
exported JSON includes roles and scoreBonuses
import exported animal starter passes
import JSON with imageUrl fails
import JSON with allowPon true fails
import JSON with Role.kind score_bonus fails
```

## UI Smoke Tests

MVPで最低限手動確認する。

```text
TOP shows まず遊ぶ / デッキ一覧 / デッキを作る / JSONを読み込む
TOP is landscape-first
Deck List shows 動物スターター
Deck Detail switches 通常版/拡張版
Deck Editor shows category colors
Deck Editor is landscape-first
Tile card border uses category color
Role Builder can create win_role from selected tiles
Special Bonus Editor creates special_bonus only
Score Bonus Editor creates ScoreBonus[] only
Balance Check shows warnings
Match portrait shows rotate prompt
Match landscape shows hand/discards/actions
Result shows role breakdown, coins, collection progress
Collection is landscape-first
```

## Final Decision

- 先にschema/engine testsを作る
- UIはsmoke testで確認する
- animal-starter.deck.jsonは常にparse test対象
- wildcard / special_bonus / ScoreBonus[] / 13枚役 / release safetyは必須テストにする
- supportedPlayerCounts / 2人戦拒否は必須テストにする
