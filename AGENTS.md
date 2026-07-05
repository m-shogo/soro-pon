# AGENTS.md

このrepoでAIエージェントが作業するときの必須ルール。

## Project Status

```text
MVP Phase 1 実装開始可能。
ただし、最初はUIではなく domain / schema / engine / tests を固める。
```

## Read First

作業前に必ず以下を読む。

```text
README.md
AGENTS.md
docs/MASTER-SPEC.md
docs/IMPLEMENTATION.md
docs/README.md
```

`docs/MASTER-SPEC.md` が現在仕様の正本。

番号付きdocsや古い実装プロンプトと衝突した場合は、`docs/MASTER-SPEC.md` を優先する。

## UI / Design Read

画面生成・UI実装時は追加で以下を読む。

```text
docs/48-responsive-crisp-ui-system.md
docs/49-ui-quality-gate-and-codex-design-rules.md
docs/50-pro-ui-production-quality-checklist.md
docs/design-targets/generated/soro-pon-landscape-vampon-ui-v1/README.md
```

## Mandatory Vamp-pon World Read

世界観・キャラ・敵・ステージ・武器・アイテム・ビジュアルルールを扱う作業では、必ず先に以下を読む。

```text
/Users/m-shogo/Developer/personal/vamp-pon/docs/shared-vampon-master-index.md
/Users/m-shogo/Developer/personal/soro-pon/docs/42-shared-vampon-source-policy.md
/Users/m-shogo/Developer/personal/soro-pon/docs/45-vampon-reference-gate.md
```

作業対象は `soro-pon`。

```text
vamp-pon 側は読み取り専用
vamp-pon 側を変更しない
Vamp-pon設定をsoro-pon側へ丸コピーしない
必要な場合は最小限の要約と参照元だけを書く
```

## Implementation Order

実装順は `docs/IMPLEMENTATION.md` を正とする。

基本順序:

```text
schema -> validation -> engine -> insights -> UI
```

禁止:

```text
pretty UI -> patch rules later
```

## Landscape-first Gate

`soro-pon` は横画面固定を正とする。

```text
primary design reference: 844x390 landscape
actual phone landscape display: 100svw x 100svh
web: responsive layout / adaptive layout
portrait: rotate prompt or limited utility only
```

## Hard Blocks Before Full Match UI

Full Match UI は、`docs/MASTER-SPEC.md` と `docs/IMPLEMENTATION.md` の hard block を満たすまで開始しない。

最低限必要:

```text
animal starter strict parse
unsafe import fields rejected
normalThreeGroups schema tests
3-group partition tests
sameCategory/specificSet group tests
wildcard max tests
tsumo 9-tile tests
ron 8+discard tests
special_bonus cannot win tests
ScoreBonus cannot win tests
scoreBudget validation tests
score breakdown tests
custom deck adversarial fixtures
```
