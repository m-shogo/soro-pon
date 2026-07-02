# Remaining Spec Gaps and Next Decisions

## Purpose

MVP仕様はかなり固まっているが、実装時に迷いやすい残りの穴を整理する。

ここで扱うのは、実装前に詰めると手戻りが減る項目。

## Current Status

以下はすでに固定済み。

- 3〜4人用
- 2人戦なし
- 通常版は8枚手牌、引いて9枚
- 拡張版は13枚手牌、引いて14枚
- DeckProject内に通常版/拡張版variantを持つ
- 2〜14枚役に対応
- 13枚役は余り1枚を許可できる
- win_role / special_bonus / score_bonus を分離
- special_bonus / score_bonus はロン候補にしない
- オールマイティは1役1枚までを基本
- 対戦画面は横向き前提

## Remaining Areas to Refine

### 1. Score Payment Rules

まだ点数の「誰が誰に払うか」を固定していない。

候補:

```text
ロン: 放銃者が支払う
ツモ: 他プレイヤー全員が支払う
```

MVP推奨:

```text
ロン: sourcePlayerがwinnerへ totalPoints を支払う
ツモ: winner以外が totalPoints を均等または各自支払う
```

より簡単なMVP案:

```text
勝者に totalPoints を加点するだけ
敗者からの減点は後回し
```

推奨固定:

```text
MVP初期は勝者加点方式
将来、ロン支払い/ツモ支払いに拡張できるように MatchResult に sourcePlayerId と paymentRecords を持たせる
```

必要型:

```ts
type PaymentRecord = {
  fromPlayerId?: string;
  toPlayerId: string;
  points: number;
  reason: 'tsumo' | 'ron' | 'bonus' | 'system';
};
```

### 2. Round End and Draw

山がなくなった時の扱い。

固定候補:

```text
山が空になったら流局
流局時は得点変動なし
Resultに「流局」と表示
```

MVP推奨:

```text
流局あり / 得点変動なし
```

### 3. Multiple Ron Order

固定済みだが、実装詳細が必要。

```text
捨てた人の次の席から順にチェック
最初にロン可能な1人だけをcandidateにする
```

実装メモ:

```text
discardOwnerIndex + 1
↓
時計回りに走査
↓
canRonがtrueの最初のplayer
```

### 4. Role Evaluation Priority

複数win_role成立時の優先順位。

固定済み:

```text
最高点のwin_roleを1つ採用
```

追加で必要:

```text
同点の場合のtie-break
```

推奨:

```text
1. pointsが高い
2. spanが大きい
3. role定義順が早い
```

### 5. Wildcard Allocation Priority

オールマイティをどの役に使うか。

問題:

```text
同じ手札で複数の役にオールマイティを使える場合、どれを優先するか
```

推奨:

```text
1. 最高点win_roleを成立させるために使う
2. special_bonusの中で高点のものに使う
3. score_bonusには原則使わない
```

重要:

- 1つのオールマイティを複数役に重複使用してよいかは要注意
- MVPでは「同じwildcard instanceは1つのwin_role内でのみ使用」として扱う
- special_bonus計算では別途、表示上の使用を記録する

### 6. RoleCondition Semantics

`same_name_count` の `name: ANY` のようなテスト表現は実装時に曖昧。

推奨:

```ts
type RoleCondition =
  | { type: 'contains_all'; tileIds: string[] }
  | { type: 'same_tile_count'; count: number }
  | { type: 'same_name_count'; name: string; count: number }
  | { type: 'same_category_count'; category: string; count: number }
  | { type: 'all_different_categories'; count: number }
  | { type: 'exact_group'; tileIds: string[] }
  | { type: 'choose_n_from'; tileIds: string[]; choose: number };
```

追加したい:

```text
same_tile_count
```

理由:

- 同じ牌3枚ボーナスを明確に表現できる
- `name: ANY` のような曖昧表現を減らせる

### 7. Deck Validation Thresholds

バランス警告のしきい値を固定したい。

推奨初期値:

```text
総牌枚数: 81推奨
総牌枚数60未満: warning
総牌枚数40未満: error
win_role 0件: error
win_role 3件未満: warning
ron可能win_role 20件超: warning
2枚win_roleが50点超: warning
wildcardが総牌数の15%超: warning
scoreBonusにmaxPointsなし: warning
```

### 8. CPU Minimum Strategy

MVPでは強いAIは不要。

しかし最低限、完全ランダムだけは弱すぎる。

推奨:

```text
1. あがれるならあがる
2. ロンできるならロンする
3. 1枚足りないwin_roleに関係する牌は残す
4. special_bonusだけのためには無理に残さない
5. それ以外はランダムで捨てる
```

危険牌読みは後回し。

### 9. Match Menu

対戦中メニューの仕様がまだ薄い。

MVP推奨ボタン:

```text
[続ける]
[役表]
[対戦を中断]
[TOPへ戻る]
```

危険操作:

```text
対戦を中断
TOPへ戻る
```

は確認ダイアログを出す。

### 10. Local Fixture Cleanup

一時的にgit管理しているローカル検証ファイルは、公開前に必ず消す。

対象:

```text
dev-fixtures/ip-local/*.json
```

Release前チェックに以下を入れる。

```text
ip-local配下が空か
既存IP名がsrc/public/docs/READMEに入っていないか
公式サンプルが安全テーマか
```

## Recommended Next Fixed Docs

次に追加するとよい資料。

```text
docs/22-scoring-and-payment.md
docs/23-role-evaluation-engine.md
docs/24-deck-validation-rules.md
docs/25-cpu-minimum-strategy.md
docs/26-release-safety-checklist.md
```

## Priority

実装前に最優先で詰める順番。

```text
1. Scoring and Payment
2. Role Evaluation Engine
3. Deck Validation Rules
4. CPU Minimum Strategy
5. Release Safety Checklist
```

## Final Recommendation

次にやるべきことは、点数支払いと役判定エンジンを固定すること。

理由:

- UIよりもルールエンジンの手戻りが大きい
- ここが曖昧だとResult、CPU、Balance Checkが全部ぶれる
- 先に型とテスト観点を固定した方が安全
