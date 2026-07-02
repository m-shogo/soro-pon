# soro-pon Landscape Vamp-pon UI v1

## Purpose

このディレクトリは、soro-pon の横画面固定UIデザイン画像の置き場。

基準:

```text
844x390 landscape-first
Vamp-pon世界内の記憶札遊び
夜の机 / 紙UI / 黒インク / ランタン光 / 記憶帳
```

## Use As

```text
実装前のデザインターゲット
AI画像生成の参照先
Claude Code / Codex / Cursor に見せるUI品質基準
画面ごとの差を出さないためのビジュアル基準
```

## Naming

採用画像は以下の名前で置く。

```text
00-ui-system.png
01-top.png
02-deck-list.png
03-deck-detail.png
04-match-setup.png
05-deck-editor.png
06-tile-editor.png
07-match-discard-phase.png
08-match-win-or-ron-phase.png
09-result.png
10-collection.png
```

追加する場合:

```text
11-clear-board.png
12-confirm-dialog.png
13-error-dialog.png
14-rotate-prompt.png
15-role-editor.png
16-category-editor.png
17-balance-check.png
18-import-export.png
```

## Quality Bar

このディレクトリに置く画像は、以下を満たすこと。

```text
横画面固定である
Vamp-pon踏襲が強い
紙UI / 黒インク / ランタン光がある
麻雀/ドンジャラベースの情報配置が分かる
自分の手牌が主役になっている
全員の捨て牌が見える
牌の名前が読める
カテゴリ色が分かる
画面ごとのUI言語に差がない
```

## Do Not Store Officially

以下を含む画像は、この `docs/` 配下にコミットしない。

```text
既存IPキャラ画像
既存IP名が中心に見える画像
個人写真
未許諾素材
ローカル検証専用素材
```

既存IP入りの検証画像は、ローカル専用に置く。

```text
.local-design/soro-pon-landscape-vampon-ui-v1/
```

## Local-only Raw References

今回のように、ユーザー自由デッキの例として既存IP風の牌画像が混ざる場合は、公式docsには入れず、ローカル専用参照にする。

```text
/Users/m-shogo/Developer/personal/soro-pon/.local-design/soro-pon-landscape-vampon-ui-v1/
```

## Source Policy

Vamp-pon由来の世界観・キャラ・敵・ステージ・武器・アイテム・Visual Rulesを使う場合は、必ず以下を読む。

```text
/Users/m-shogo/Developer/personal/vamp-pon/docs/shared-vampon-master-index.md
/Users/m-shogo/Developer/personal/soro-pon/docs/45-vampon-reference-gate.md
```

## Final Decision

このディレクトリを、soro-pon横画面UIデザイン画像の公式置き場にする。

既存IP入りの検証画像は公式置き場に入れず、`.local-design/` に分離する。
