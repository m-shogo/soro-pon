# Remaining Spec Gaps and Next Decisions

## Status

このファイルで挙げていた主要な未確定項目は、後続docsで解決済み。

現在の正は以下。

```text
点数支払い: docs/24-scoring-and-payment.md
役判定エンジン: docs/25-role-evaluation-engine.md
デッキ検証/バランス: docs/26-deck-validation-and-balance-rules.md
CPU/対局フロー: docs/27-cpu-minimum-strategy-and-match-flow.md
リリース安全チェック: docs/28-release-safety-checklist.md
リザルト後の継続導線: docs/29-result-progression-collection.md
初回導線/プレイテスト循環: docs/30-first-run-and-playtest-loop.md
実装スタック: docs/31-implementation-stack-decision.md
Zod schema: docs/32-zod-schema-spec.md
公式サンプル: docs/33-official-animal-starter-deck.md
MVP実装プロンプト: docs/34-mvp-implementation-prompt.md
テストケース: docs/35-mvp-test-cases.md
```

## Resolved Decisions

```text
MVP初期は勝者加点方式
流局は得点変動なし
複数人ロンは席順優先で1人
複数win_roleは points desc, span desc, definition order asc
オールマイティは基本自動割当
same_tile_countをRoleConditionへ追加
Deck validation thresholdsを固定
CPUは最低限の役寄せ + ランダム
対戦中メニューは危険操作に確認を出す
ローカルIP fixtureはproduction/publicへ入れない
```

## Current Recommendation

新しく実装を始める場合、このファイルを起点にしない。

以下を起点にする。

```text
README.md
AGENTS.md
docs/34-mvp-implementation-prompt.md
docs/35-mvp-test-cases.md
```

## Final Decision

このファイルは履歴用の解決済みメモとして残す。

未確定事項の正本としては使わない。
