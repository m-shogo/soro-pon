# MVP Readiness Checklist

## Status

MVP開始前の主要判断は固定済み。

このファイルは、実装前の最終チェックとして使う。

詳細なテストケースは `docs/35-mvp-test-cases.md` を正とする。

## Fixed Decisions

```text
実装スタック: TypeScript + React + Vite + Zod + Vitest
標準総牌枚数: 81枚
1種類あたり: 3枚推奨
3人/4人: 同じデッキで対応
複数人ロン: 席順優先で1人
複数win_role: points desc, span desc, definition order asc で1つ採用
点数: MVP初期は勝者加点方式
保存: localStorage
画像: MVP初期はemoji/fallbackLabel優先
公式サンプル: samples/animal-starter.deck.json
```

## Must Read Before Implementation

```text
README.md
AGENTS.md
docs/03-data-model.md
docs/31-implementation-stack-decision.md
docs/32-zod-schema-spec.md
docs/33-official-animal-starter-deck.md
docs/34-mvp-implementation-prompt.md
docs/35-mvp-test-cases.md
```

## Must Not Add Before MVP

```text
オンライン対戦
ログイン
Supabase
Firebase
PWA
公開ギャラリー
ランキング
画像付き共有
課金
強さに関係する購入
```

Note:

```text
称号 / クリアボード / 役コレクション / Result Album は、軽量な継続導線としてMVP最小構成に含めてよい。
ただし、デイリー任務・期間限定イベント・ランキング・課金・ガチャは入れない。
```

## MVP Build Order

```text
1. Vite + React + TypeScript setup
2. domain型定義
3. Zod schema
4. animal-starter parse test
5. DeckProject / variant model
6. role evaluation engine
7. wildcard assignment
8. scoring / MatchResult
9. deck validation
10. progression model
11. match flow
12. CPU minimum strategy
13. localStorage
14. JSON import/export
15. Deck List / Deck Detail
16. Deck Editor minimal
17. Match Setup
18. Match Landscape UI
19. Result UI
20. Collection / Clear Board minimal
```

## Definition of Done

```text
TOPから動物スターターで遊べる
3人戦/4人戦を開始できる
人間1人 + CPU2〜3人で進行できる
ツモ/捨てる/ロン/あがるが動く
上がり役で勝てる
特殊役が加点される
スコアボーナスが加点される
オールマイティが1役1枚まで使える
リザルトで点数・コイン・内訳が分かる
クリアボード/役コレクションが最低限更新される
デッキを作成/編集/保存できる
カテゴリ色が牌表示に反映される
JSON export/importができる
画像は共有JSONに入らない
縦向き対戦では横向き案内が出る
npm testが通る
npm run buildが通る
```

## Final Assessment

```text
MVP実装に入ってよい。
```

残りの調整は、実装しながらテストケースとUIの手触りで詰める。
