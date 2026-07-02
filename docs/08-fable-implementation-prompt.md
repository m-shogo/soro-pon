# Fable Implementation Prompt

## Status

このファイルは旧プロンプトです。

現在の正は以下です。

```text
docs/34-mvp-implementation-prompt.md
```

## Important

実装開始時は、このファイルではなく `docs/34-mvp-implementation-prompt.md` を使うこと。

理由:

- 実装スタックが `TypeScript + React + Vite + Zod + Vitest` に固定された
- ZustandはMVP初期では使わない方針に変更された
- DeckProject / Variant / RoleKind / Wildcard / Result Progression / Animal Starter / Test Cases が追加された
- Zod schema仕様が `docs/32-zod-schema-spec.md` に固定された

## Redirect Prompt

```text
このrepoのMVP実装は docs/34-mvp-implementation-prompt.md を正として進めてください。
先に README.md と AGENTS.md を読み、Must Read のdocsを確認してください。
旧repoや過去実装は参考にしないでください。
```
