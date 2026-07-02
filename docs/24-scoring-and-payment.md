# Scoring and Payment

## Purpose

MVPの点数計算と支払い方式を固定する。

結論:

```text
MVP初期は勝者加点方式にする。
敗者からの減点はしない。
ただし将来のロン支払い/ツモ支払いに拡張できる型を持たせる。
```

## Why

ロン支払い・ツモ支払いを最初から本格実装すると、以下が増える。

- 放銃者の点数管理
- 全員払いの端数処理
- マイナス点
- 箱割れ
- 最終順位
- 連続対局の収支

MVPで大事なのは、まず以下。

```text
上がれる
得点内訳が分かる
勝った気持ちよさがある
デッキ調整に戻れる
```

そのため、MVP初期は勝者加点方式にする。

## Fixed MVP Rule

### Ron

```text
ロン成立
↓
winnerにtotalPointsを加点
sourcePlayerIdは記録する
敗者からは減点しない
```

### Tsumo

```text
ツモ成立
↓
winnerにtotalPointsを加点
敗者からは減点しない
```

### Draw

```text
山が空になったら流局
得点変動なし
Resultに流局を表示
```

## Score Formula

```text
totalPoints = selectedWinRole.points
            + sum(specialBonus.points)
            + sum(scoreBonus.points)
```

固定:

- win_roleは最高点1つだけ採用
- special_bonusは成立分を加点
- score_bonusは成立分を加点
- scoreBonusにはmaxPointsを推奨
- オールマイティ使用内容はResultに表示

## Multiple win_role

複数のwin_roleが成立した場合:

```text
1. pointsが高い役を採用
2. 同点ならspanが大きい役を採用
3. さらに同点ならvariant内の定義順が早い役を採用
```

採用しなかったwin_roleは、MVPでは得点に含めない。

Resultでは詳細表示に出してもよいが、主得点にはしない。

## MatchResult Type

```ts
type WinMethod = 'tsumo' | 'ron' | 'draw';

type PaymentRecord = {
  fromPlayerId?: string;
  toPlayerId: string;
  points: number;
  reason: 'win' | 'tsumo' | 'ron' | 'bonus' | 'system';
};

type MatchResult = {
  resultType: 'win' | 'draw';
  winnerPlayerId?: string;
  winMethod: WinMethod;
  sourcePlayerId?: string;
  selectedWinRole?: {
    roleId: string;
    name: string;
    points: number;
    span: number;
  };
  matchedWinRoles: Array<{
    roleId: string;
    name: string;
    points: number;
    span: number;
    selected: boolean;
  }>;
  specialBonuses: Array<{
    roleId: string;
    name: string;
    points: number;
    span: number;
  }>;
  scoreBonuses: Array<{
    bonusId: string;
    name: string;
    points: number;
  }>;
  wildcardAssignments: WildcardAssignment[];
  totalPoints: number;
  paymentRecords: PaymentRecord[];
};
```

## MVP PaymentRecord

MVPでは勝者加点のみ。

Ron:

```ts
paymentRecords: [
  {
    toPlayerId: winnerPlayerId,
    points: totalPoints,
    reason: 'ron'
  }
]
```

Tsumo:

```ts
paymentRecords: [
  {
    toPlayerId: winnerPlayerId,
    points: totalPoints,
    reason: 'tsumo'
  }
]
```

Draw:

```ts
paymentRecords: []
```

## Future Payment Modes

将来追加できるようにする。

```ts
type ScorePaymentMode =
  | 'winner_gain_only'
  | 'ron_discarder_pays'
  | 'tsumo_all_pay'
  | 'table_points';
```

MVP固定:

```ts
const MVP_SCORE_PAYMENT_MODE: ScorePaymentMode = 'winner_gain_only';
```

## Result UI

表示順:

```text
勝者
ツモ/ロン/流局
上がり役
特殊役
スコアボーナス
オールマイティ使用
合計点
```

Ronの場合:

```text
ロン: プレイヤーA → プレイヤーB
```

ただし減点はしない。

ツモの場合:

```text
ツモ: プレイヤーB
```

流局の場合:

```text
流局
山がなくなりました
得点変動なし
```

## Final Decision

- MVP初期は勝者加点方式
- ロンでも放銃者から減点しない
- ツモでも全員から減点しない
- sourcePlayerIdは記録する
- paymentRecordsは持つ
- 将来、支払い方式を切り替えられるようにする
- 流局は得点変動なし
