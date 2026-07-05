# MVP Implementation Prompt

## Status

This document is kept as historical context.

The current implementation entry points are:

```text
docs/MASTER-SPEC.md
docs/IMPLEMENTATION.md
docs/README.md
```

If this file conflicts with `docs/MASTER-SPEC.md`, `docs/MASTER-SPEC.md` wins.

## Current Prompt

```text
このrepoは m-shogo/soro-pon です。
旧repoや過去実装は参考にしないでください。
完全新規で、現在仕様docsを正として実装してください。

最初に必ず以下を読んでください。

- README.md
- AGENTS.md
- docs/MASTER-SPEC.md
- docs/IMPLEMENTATION.md
- docs/README.md

実装スタックは以下で固定です。

- TypeScript
- React
- Vite
- Zod
- Vitest
- CSS / CSS Modules
- localStorage first

MVP初期では以下を入れないでください。

- Next.js
- Supabase
- Firebase
- Unity
- Godot
- Phaser
- Redux
- Zustand
- TanStack Query
- Tailwind

絶対ルール:

- 3〜4人用
- 2人戦なし
- 通常MVPは 8枚手牌、引いて9枚
- あがり形は3枚グループ×3組
- normalThreeGroups がMVPエンジン対象
- extendedRoleSpan はschema予約・engine pending
- ポン/カン/チーなし
- 通常MVPの win_role は group-backed
- count-only normal win_role は作らない
- selectedWinRole だけが basePoints を持つ
- special_bonus だけではロン/ツモできない
- ScoreBonus だけではロン/ツモできない
- オールマイティは候補ごとに別々に解析する
- MVP標準では1つのwin_roleに使えるオールマイティは最大1枚
- 捨てられたオールマイティでロンは原則不可
- 手札の並び順は役判定に影響させない
- UIはルール判定・点数計算・wildcard割当をしない
- 共有JSONに画像/URL/base64/path/blobUrl/HTML/script/unknown fieldを入れない
- importはstrict allowlistで検証する
- scoreBudgetはvariantごとに持つ
- coinや課金で強さを買わせない
- 全主要画面は 844x390 landscape-first をデザイン基準にする
- 画面全体をtransform scaleで引き伸ばさない
- Component Galleryを先に作る

実装順序は docs/IMPLEMENTATION.md を正としてください。

最初の作業単位:

1. package setup
2. domain ID/tile/category/variant types
3. strict Zod schemas
4. samples/animal-starter.deck.json parse test
5. import unsafe key scan tests
6. deck validation tests
7. group enumeration
8. 9-tile partitioning
9. wildcard group resolution
10. normal win role matching

Full Match UI は、docs/MASTER-SPEC.md と docs/IMPLEMENTATION.md の hard block を満たすまで開始しないでください。

作業後は以下を報告してください。

- 変更ファイル
- コミットSHA
- 実装した範囲
- 実行した検証
- 未対応範囲
```

## Final Decision

Use this file only as a compact prompt wrapper.

The source of truth is:

```text
docs/MASTER-SPEC.md
docs/IMPLEMENTATION.md
```
