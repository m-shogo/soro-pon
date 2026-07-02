# CPU Minimum Strategy and Match Flow

## Purpose

MVPのCPU挙動と対局フローを固定する。

結論:

```text
CPUは強くなくてよい。
ただし完全ランダムにはしない。
最低限、あがり・ロン・1枚足りない役への寄せだけ行う。
```

## Match Flow

### Setup

```text
1. DeckProjectを選ぶ
2. variantを選ぶ
3. 3人戦/4人戦を選ぶ
4. human 1人 + CPU 2〜3人を作る
5. 山を生成してシャッフル
6. 各プレイヤーにhandSizeNormal枚を配る
7. 先手を決める
8. phase = draw
```

## Turn Flow

```text
draw phase
↓
current playerが1枚引く
↓
win check for tsumo
↓
あがれるなら humanはボタン表示 / CPUはあがる
↓
discard phase
↓
1枚捨てる
↓
reaction phase
↓
他プレイヤーのron check
↓
ロン候補があれば処理
↓
次プレイヤーへ
```

## Draw

山が空なら流局。

```text
drawPile.length === 0
=> resultType = draw
```

## Human Discard UX

```text
牌をタップして選択
選択牌が浮く
[捨てる] が有効化
押すと捨てる
```

## CPU Decision Order

CPUの優先順位。

```text
1. ツモであがれるならあがる
2. ロンできるならロンする
3. 捨てる時は1枚足りないwin_roleに関係する牌を残す
4. special_bonusだけのためには無理に残さない
5. wildcardはできるだけ残す
6. それ以外はランダムで捨てる
```

## CPU Tsumo

CPUのdraw後:

```text
EvaluateHand(winMethod='tsumo')
canWin === true
=> あがる
```

MVPでは、CPUは必ず最高点候補であがる。

## CPU Ron

reaction phase:

```text
捨てた人の次の席から順に走査
最初にcanRonできるCPUまたはhumanをcandidateにする
```

CPUがcandidateの場合:

```text
canWin === true
=> ロンする
```

Humanがcandidateの場合:

```text
[ロン] [パス] を表示
```

## CPU Discard Heuristic

### Step 1: Keep wildcard

```text
wildcard牌は基本捨てない
```

ただし、手牌がwildcardだらけの場合は低価値候補として扱ってもよい。

### Step 2: Find near win roles

near win role:

```text
あと1枚で成立するwin_role
```

CPUはnear win roleに含まれる牌を残す。

### Step 3: Discard unrelated tile

捨てる候補:

```text
near win roleに関係しない牌
special_bonusにしか関係しない牌
重複しすぎた牌
```

### Step 4: Random fallback

候補が同点ならランダム。

## CPU Does Not Do Yet

MVPではやらない。

```text
危険牌読み
相手の捨て牌から待ち推測
special_bonus狙いの高度判断
score_bonus狙いの保持
ブラフ
リーチ判断
長期得点期待値計算
```

## Ron Candidate Order

複数人ロンは席順優先で1人。

```ts
function getRonCheckOrder(discardOwnerIndex: number, playerCount: number): number[] {
  const order = [];
  for (let i = 1; i < playerCount; i++) {
    order.push((discardOwnerIndex + i) % playerCount);
  }
  return order;
}
```

最初にcanRonになったプレイヤーだけをcandidateにする。

## Phase Model

```ts
type MatchPhase =
  | 'setup'
  | 'draw'
  | 'discard'
  | 'reaction'
  | 'result';
```

## State Requirements

```ts
type MatchState = {
  deckProjectId: string;
  variantId: string;
  ruleConfigId: string;
  players: PlayerState[];
  drawPile: TileInstance[];
  currentPlayerIndex: number;
  phase: MatchPhase;
  lastDrawnTile?: TileInstance;
  lastDiscard?: {
    tile: TileInstance;
    ownerPlayerId: string;
  };
  reaction?: ReactionState;
  selectedTileInstanceId?: string;
  result?: MatchResult;
};
```

## Reaction State

```ts
type ReactionState = {
  discardOwnerId: string;
  discardedTile: TileInstance;
  candidatePlayerId?: string;
  type: 'ron';
};
```

MVPではcandidateは1人だけ。

## Match Menu

MVPの対戦メニュー。

```text
[続ける]
[役表]
[対戦を中断]
[TOPへ戻る]
```

危険操作は確認。

```text
対戦を中断しますか？
TOPへ戻ると現在の対戦は失われます。
```

## Final Decision

- CPUは完全ランダムにしない
- あがれるならあがる
- ロンできるならロンする
- 1枚足りないwin_roleに寄せる
- wildcardは残す
- special_bonusだけのためには無理に残さない
- 危険牌読みは後回し
- 複数人ロンは席順優先で1人
- 山切れは流局
