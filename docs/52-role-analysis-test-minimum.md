# Role Analysis Minimum Tests

## Purpose

`docs/51-role-analysis-and-game-feel-ux.md` を実装で壊さないための最小テスト方針。

## Required Tests

- 手札順を入れ替えても役判定結果が変わらない
- 手札順を入れ替えても待ち候補が変わらない
- 手札の並び替えは表示順だけに影響する
- 候補プレビューは手札順を勝手に変更しない
- 明示的な整理操作だけが手札順を変更できる
- 候補は completed / tenpai / near / bonusOnly / invalidButExplainable に分類する
- completed は win_role 成立時だけ勝利候補になる
- special_bonus だけではロンできない
- special_bonus だけではツモできない
- ScoreBonus だけではロンできない
- ScoreBonus だけではツモできない
- オールマイティは複数枚持てる
- MVP標準では1つの win_role に使えるオールマイティは最大1枚
- 捨てられたオールマイティではロンできない
- オールマイティ割当は候補ごとに別々に評価する
- オールマイティ割当は最終結果前に固定扱いしない
- WaitAnalyzer は「あと1枚」だけでなく不足カテゴリ/タグ/牌条件を返す
- ExplainEngine は成立理由を返す
- ExplainEngine は未成立理由を返す
- ExplainEngine はオールマイティ上限超過理由を返す
- IntentRanker はユーザーの狙いを断定しない
- 候補表示は通常時最大3件を基本にする
- completed は tenpai より優先する
- tenpai は near より優先する
- 高得点だけで完成距離を上書きしない
- 同条件ならオールマイティ使用数が少ない候補を優先する
- デッキに win_role がない場合はエラー
- 条件なし役はエラー
- special_bonus だけのデッキはエラー
- ScoreBonus だけのデッキはエラー
- オールマイティ依存が強すぎる役は警告
- 似すぎた役条件は警告
- 長すぎる役名は警告

## Final Decision

役解析・待ち表示・オールマイティ・候補表示の実装は、`docs/51-role-analysis-and-game-feel-ux.md` とこの最小テスト方針を同時に満たすこと。
