# Fixed MVP Decisions

## Purpose

MVP実装前の未確定項目を固定する。

このファイルは、`docs/18-mvp-readiness-checklist.md` の残TODOに対する最終判断をまとめる。

## Final Fixed Decisions

### 1. Standard Deck Size

固定:

```text
標準総牌枚数: 81枚
1種類あたり: 3枚推奨
```

理由:

- 3枚セット役と相性がよい
- 標準ルールの8枚手牌 + 9枚あがりに合う
- 3人/4人どちらでも山が枯れにくい
- 自作デッキでも説明しやすい

### 2. 3人戦/4人戦の牌数

固定:

```text
3人戦/4人戦は同じデッキで対応
```

3人用と4人用で別デッキを作らせない。

バランス差はDeck Editorの警告で扱う。

### 3. Normal / Extended Deck Entry

固定:

```text
デッキ入口は1つ
通常版と拡張版は同じDeckProject内のvariantとして持つ
両方ある場合はワンクリックで切り替え可能にする
```

ユーザーに「通常デッキ」と「拡張デッキ」を別々に探させない。

### 4. DeckProject Model

固定:

```ts
type DeckProject = {
  version: 1;
  id: string;
  name: string;
  description?: string;
  tiles: Tile[];
  variants: DeckVariant[];
  activeVariantId: string;
};

type DeckVariant = {
  id: string;
  name: string;
  label: '通常版' | '拡張版';
  ruleConfig: RuleConfig;
  roles: Role[];
  scoreBonuses?: ScoreBonus[];
  isExperimental?: boolean;
};
```

### 5. Variant Switching UI

固定:

Deck Detail / Match Setup / Deck Editor に以下のUIを持つ。

```text
[通常版] [拡張版]
```

表示条件:

- 通常版だけある場合: 通常版のみ表示
- 拡張版だけある場合: 拡張版のみ表示
- 両方ある場合: ワンクリックで切り替え
- 拡張版は experimental ラベルを表示

### 6. Create Extended Variant

固定:

通常版だけ存在するDeckProjectには以下のボタンを出す。

```text
[拡張版を作成]
```

挙動:

- tilesは同じものを使う
- 通常版rolesをコピーする
- ruleConfigを `extended-hand` にする
- 拡張版variantを同じDeckProjectに追加する
- デッキ一覧上は1つのデッキカードのまま

### 7. Sample Deck Policy

固定:

```text
ローカル検証サンプル: 既存IP題材を使ってよい
公式/公開サンプル: 既存IP題材を使わない
```

重要:

- 既存IP題材のサンプルはローカル検証専用
- repoにコミットしない
- `src/`, `public/`, `docs/`, `README` に既存IP名や既存IPデータを入れない
- 公式サンプル/公開スクショ/共有JSONには使わない
- `.gitignore`対象の `dev-fixtures/ip-local/` に置く

この会話上の開発検証では、ユーザー指定の既存IPテーマをローカルサンプルとして使う。

### 8. Public Sample Deck

固定:

```text
公式/公開用サンプル: 動物スターター
```

理由:

- IPリスクがない
- カテゴリが作りやすい
- 画像なしでもemoji/fallbackLabelで成立する
- 通常版/拡張版の両方を安全に作れる

### 9. Multiple Ron

固定:

```text
複数人ロンは席順優先で1人だけ
```

捨てた人の次の席から順に見て、最初にロンできるプレイヤーを優先する。

理由:

- UIが簡単
- テンポが良い
- CPU処理が簡単
- MVPで同時ロン演出を作らなくてよい

### 10. Multiple win_role

固定:

```text
複数のwin_roleが同時成立した場合、最高点のwin_roleを主役として採用
```

得点方針:

```text
win_role: 最高点1つ
special_bonus: 加点
score_bonus: 加点
```

理由:

- 上がり役候補の爆発を抑える
- リザルトが読みやすい
- 特殊役/ボーナスの役割が明確になる

### 11. CPU Logic

固定:

MVPでは強いAIを作らない。

最低限:

```text
1. 自分があがれるならあがる
2. あと1枚の上がり役があるなら関連牌を残す
3. それ以外はランダム寄りに捨てる
4. 危険牌の高度な読みは後回し
```

### 12. Storage

固定:

```text
MVP初期: localStorage
画像対応が必要になったら: IndexedDB
```

MVP初期はemoji/fallbackLabel中心で進める。

### 13. Local Images

固定:

```text
MVP初期は画像なしでも成立させる
local image対応は後からでもよい
```

優先順位:

```text
emoji / fallbackLabel / name
↓
local image
↓
image import/exportなし
```

### 14. MVP Sample Variant Set

ローカル検証サンプルも公式サンプルも、以下を持てる形にする。

```text
DeckProject
  ├─ 通常版 variant
  └─ 拡張版 variant
```

通常版:

```text
8枚手牌
引いて9枚
3枚役中心
```

拡張版:

```text
13枚手牌
引いて14枚
2〜14枚役
リーチ experimental
```

MVPで拡張版を対局可能にするかは別判断。  
ただし、データ構造とUI切替は最初から対応する。

## Updated MVP Definition of Done

```text
・DeckProjectとしてデッキ入口が1つ
・通常版/拡張版variantを同じデッキ内で切り替えられる
・通常版だけある場合は拡張版作成ボタンが出る
・通常版/拡張版が両方ある場合はワンクリックで切替できる
・公式サンプルは安全テーマ
・ローカル検証サンプルはgit管理外で扱える
・標準総牌枚数81枚/1種類3枚推奨で警告できる
・複数人ロンは席順優先で1人
・複数win_roleは最高点1つ
```

## Final Status

これでMVP前提は固定済み。

以後、MVP実装プロンプトではこのファイルを必読にする。
