# Deck Validation and Balance Rules

## Purpose

Deck Editorで表示するエラー/警告/情報のしきい値を固定する。

## Final Gate Alignment

このファイルは `docs/47-mvp-implementation-final-gate.md` と整合する。

固定:

```text
3人/4人対応は RuleConfig.supportedPlayerCounts で検証する
minPlayers / maxPlayers はMVPでは使わない
score_bonus は Role.kind に入れず ScoreBonus[] で検証する
```

## Severity

```ts
type ValidationSeverity = 'error' | 'warning' | 'info';
```

### Error

保存または対戦開始を止める。

### Warning

保存・対戦は可能だが注意を出す。

### Info

改善提案。操作は止めない。

## Hard Errors

以下はError。

```text
デッキ名が空
variantが0件
activeVariantIdが存在しない
tilesが0件
総牌枚数が40枚未満
supportedPlayerCountsが空
supportedPlayerCountsに3/4以外が含まれている
開始しようとした人数がsupportedPlayerCountsに含まれていない
win_roleが0件
ruleConfig.allowPonがtrue
ruleConfig.allowKanがtrue
ruleConfig.allowChiがtrue
special_bonus.canRonがtrue
special_bonus.canTsumoがtrue
Role.kindにscore_bonusが入っている
role.spanがruleConfig範囲外
role.spanがwinHandSizeを超える
画像URL/base64/file path/blob URLが共有JSONに含まれている
```

## Warnings

以下はWarning。

```text
総牌枚数が60枚未満
総牌枚数が120枚超
標準推奨81枚から大きく外れている
1種類あたりcountが1
1種類あたりcountが5超
win_roleが3件未満
ron可能win_roleが20件超
2枚win_roleが50点超
3枚win_roleが100点超
14枚win_roleが200点未満
special_bonusが150点超
scoreBonusにmaxPointsがない
scoreBonus.allowWildcardがtrue
wildcardが総牌数の15%超
最高点win_roleでwildcard許可
同じカテゴリ色が似すぎている
未使用カテゴリがある
```

## Info

以下はInfo。

```text
カテゴリ色を設定すると見やすくなります
primaryCategoryIdを設定すると牌色が安定します
特殊役を追加するとファンデッキ感が強くなります
Result確認用のテスト手札を作れます
拡張版を作ると2〜14枚役を試せます
```

## Numeric Thresholds

### Deck Size

```text
推奨: 81枚
warning low: 60枚未満
error low: 40枚未満
warning high: 120枚超
```

### Tile Count

```text
推奨: 1種類3枚
warning: 1枚
warning: 5枚超
```

### Player Count

```text
supportedPlayerCounts: [3, 4] 推奨
空配列: error
3/4以外: error
2人戦開始: error
```

### Role Count

```text
win_role 0件: error
win_role 1〜2件: warning
win_role 3件以上: OK
ron可能win_role 20件超: warning
```

### Role Points

標準版:

```text
9枚系win_role: 150〜300推奨
special_bonus: 30〜150推奨
scoreBonus: 10〜50推奨
```

拡張版:

```text
2枚役: 10〜40推奨 / 50超warning
3枚役: 40〜80推奨 / 100超warning
4〜6枚役: 70〜130推奨
7〜9枚役: 120〜180推奨
10〜12枚役: 170〜240推奨
13枚役: 220〜280推奨
14枚役: 260〜350推奨 / 200未満warning
```

### Wildcard

```text
総牌数の15%超: warning
maxUsePerRole 2以上: warning
countsForScoreBonus true: warning
canTriggerRonWhenDiscarded true: warning
```

## Validation Output

```ts
type ValidationIssue = {
  severity: 'error' | 'warning' | 'info';
  code: string;
  message: string;
  path?: string;
  relatedId?: string;
  actionLabel?: string;
};
```

例:

```ts
{
  severity: 'warning',
  code: 'TWO_TILE_ROLE_TOO_EXPENSIVE',
  message: '2枚役の点数が高すぎる可能性があります。10〜40点が推奨です。',
  relatedId: 'role_id',
  actionLabel: '役を編集'
}
```

## Editor UX

Editor上部に常に表示する。

```text
エラー: 0件 / 警告: 3件 / 情報: 2件
```

押すとBalance Checkへ移動。

Balance Checkでは、各issueに修正導線を出す。

```text
[役を編集]
[牌を編集]
[カテゴリを編集]
[警告を無視して保存]
```

Errorがある場合:

```text
[このデッキで遊ぶ] disabled
```

Warningだけの場合:

```text
[このデッキで遊ぶ] enabled
```

## Category Color Validation

カテゴリ色は共有JSONに含めてよい。

チェック:

```text
colorが空: info
同じ色が多すぎる: warning
背景と文字のコントラストが低い: warning
primaryCategoryIdが存在しないカテゴリを指す: error
```

## Final Decision

- Errorは遊べない/保存不可レベル
- Warningは遊べるが危険
- Infoは改善提案
- supportedPlayerCountsは3/4だけ許可する
- 2人戦は開始不可
- 総牌枚数81枚推奨
- 40枚未満はError
- 60枚未満はWarning
- 2枚役50点超はWarning
- wildcard 15%超はWarning
- scoreBonus maxPointsなしはWarning
- Role.kindにscore_bonusがあればError
- Deck Editor上部に常時サマリを表示する
