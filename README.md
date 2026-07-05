# soro-pon

`soro-pon` は、プレイヤーが **デッキ・牌・役・得点** を自由に決められる、3〜4人用のカスタム牌ゲームです。

現在は **MVP Phase 1 実装開始可能** の状態です。

ただし、実装はすぐUIへ入らず、まず `domain / schema / engine / tests` を固めます。

## AI作業入口

AIエージェントは、作業前に必ず以下を読むこと。

```text
README.md
AGENTS.md
docs/MASTER-SPEC.md
docs/IMPLEMENTATION.md
docs/README.md
CLAUDE.md or CODEX.md
```

`docs/MASTER-SPEC.md` が現在仕様の正本です。

番号付きdocsに古い仕様が残っている場合は、`docs/MASTER-SPEC.md` を優先します。

画面生成・UI実装を行う場合は、追加で以下を読むこと。

```text
docs/48-responsive-crisp-ui-system.md
docs/49-ui-quality-gate-and-codex-design-rules.md
docs/50-pro-ui-production-quality-checklist.md
docs/design-targets/generated/soro-pon-landscape-vampon-ui-v1/README.md
```

`.claude/README.md` と `.codex/README.md` は補助メモです。仕様の正本は `docs/MASTER-SPEC.md` / `docs/IMPLEMENTATION.md` / `docs/README.md` に集約します。

## このゲームの核

- 最終ルールはドンジャラと同じ構造で固定
- 3〜4人用
- 2人戦は作らない
- 通常手牌8枚
- 自分の番で1枚引くと9枚
- あがり形は3枚セット×3組
- MVPはローカル対戦のみ
- 最初は人間1人 + CPU2〜3人
- オンライン対戦、ログイン、ランキング、公開ギャラリーは後回し
- 牌・カテゴリ・役・得点をユーザーが自由に作れる
- 共有は画像なしJSON
- 画像は各ユーザーが自分の端末で設定する

## 重要方針

このrepoでは、旧repoや過去実装は参考にしません。
完全新規で、仕様docsを正として作ります。

ただし、現在の仕様正本は常に以下です。

```text
docs/MASTER-SPEC.md
```

開発中のローカル検証で既存IP題材を使う場合も、以下には入れません。

- `src/`
- `public/`
- `docs/`
- `README.md`
- build成果物
- 公式サンプル
- 公式スクリーンショット
- production export payload

公式サンプルは、動物・国・歴史人物・旅行・オリジナルテーマなどの安全テーマで作ります。

## Vamp-pon共有資料

`soro-pon` は、Vamp-pon世界内で流行っている記憶札遊びとして扱います。

世界観・キャラ・敵・ステージ・武器・アイテムの正本は、soro-pon側へコピーせず、Vamp-pon repo側の共有資料を参照します。

今後の第一入口は以下です。

```text
m-shogo/vamp-pon
docs/shared-vampon-master-index.md
```

ローカル作業では以下を先に読みます。

```text
/Users/m-shogo/Developer/personal/vamp-pon/docs/shared-vampon-master-index.md
/Users/m-shogo/Developer/personal/soro-pon/docs/42-shared-vampon-source-policy.md
/Users/m-shogo/Developer/personal/soro-pon/docs/45-vampon-reference-gate.md
```

soro-pon側の参照ルールは `docs/42-shared-vampon-source-policy.md` / `docs/45-vampon-reference-gate.md` にまとめます。

## デザイン方針

MVPの見た目は以下で固定します。

```text
soro-pon = Vamp-pon世界の中で流行っている記憶札遊び
```

単体の漫画風アプリではなく、Vamp-pon世界の机の上で遊ばれている小さな牌ゲームとしてデザインします。

```text
夜の机
紙札
黒インク
小さな灯り
記憶の欠片
手帳
静かな通常画面
勝負どころだけ少し漫画的
```
