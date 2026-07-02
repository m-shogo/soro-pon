# Implementation Stack Decision

## Purpose

`soro-pon` のMVP実装に使う言語・フレームワーク・ライブラリ方針を固定する。

## Final Decision

MVPの実装スタックは以下で固定する。

```text
TypeScript
React
Vite
Zod
Vitest
CSS Modules または通常CSS
localStorage
```

## Why TypeScript

`soro-pon` は以下が中核。

```text
デッキ定義
牌定義
カテゴリ
役条件
得点
JSON import/export
Deck Editor
ローカル対戦
```

この性質にはTypeScriptが最も合う。

理由:

```text
・型でルールを固定しやすい
・Zodと相性が良い
・JSON import/exportを安全に扱える
・ReactでEditor UIを作りやすい
・ブラウザゲームとしてすぐ確認できる
・Claude Code / Codex / Cursorが扱いやすい
```

## Why React

Deck Editorが主役級機能のため、状態管理・フォーム・プレビュー・バリデーションが多い。

Reactは以下に向いている。

```text
・Deck Editor
・Tile Editor
・Role Builder
・Balance Check
・Result / Collection
・Match UI
```

## Why Vite

MVPではNext.jsは不要。

```text
ログインなし
SSR不要
DBなし
公開ギャラリーなし
SEO重要ではない
ローカルブラウザゲーム
```

そのため、Viteで軽く作る。

## Why Zod

共有JSONとlocalStorage保存データの安全性が重要。

Zodで以下を守る。

```text
・壊れたJSONを読み込ませない
・画像情報を共有JSONに入れない
・role.kindの誤りを防ぐ
・special_bonusをロン候補にしない
・拡張ルールのspan範囲を検証する
```

## Why Vitest

ルールエンジンのテストが最重要。

```text
・2〜14枚役
・13枚役
・14枚役
・オールマイティ
・ロン/ツモ
・特殊役
・スコアボーナス
・Deck validation
```

これらはUIより先にテストする。

## Alternatives Considered

### Unity

不採用。

理由:

```text
・Deck Editorを作るには重い
・JSON import/exportやフォームUIがWebより面倒
・スマホブラウザで触って共有する用途に不向き
・MVP検証が遅くなる
```

将来、リッチな演出アプリにする時は検討可。

### Godot

不採用。

理由:

```text
・ゲーム部分は作れるがEditor/共有/フォームが主役のMVPには遠い
・WebフォームUIはReactの方が速い
```

### Phaser

MVPでは不採用。

理由:

```text
・対戦画面は牌UI中心であり、物理/アニメーション主体ではない
・Deck Editorが主役なのでReact単体の方が自然
```

将来、演出が増えた時だけ一部導入を検討。

### Next.js

MVPでは不採用。

理由:

```text
・SSR不要
・ログインなし
・DBなし
・APIなし
・静的アプリで十分
```

### Svelte

不採用。

理由:

```text
・軽いが、AI実装支援/ライブラリ/チーム理解ではReactの方が安全
```

## Suggested Project Structure

```text
src/
  app/
    App.tsx
    routes.ts
  domain/
    deck.ts
    tile.ts
    role.ts
    rule-config.ts
    match.ts
    progression.ts
  schemas/
    deck-project.schema.ts
    role.schema.ts
    tile.schema.ts
    match-result.schema.ts
    progression.schema.ts
  engine/
    evaluate-hand.ts
    wildcard-assignment.ts
    scoring.ts
    deck-validation.ts
    cpu-strategy.ts
    match-flow.ts
  data/
    animal-starter.deck.ts
  storage/
    local-storage.ts
  ui/
    components/
    screens/
  test/
    fixtures/
```

## Dependency Policy

最初は依存を増やしすぎない。

MVP必須:

```text
react
react-dom
vite
typescript
zod
vitest
```

入れてよい:

```text
@vitejs/plugin-react
```

最初は入れない:

```text
Redux
Zustand
TanStack Query
Supabase
Firebase
Three.js
Phaser
GSAP
Tailwind
```

Tailwindは後から検討可。MVP初期は通常CSSで十分。

## Final Decision

- TypeScript + React + Viteで実装する
- Zodで共有JSON/localStorageを検証する
- Vitestでルールエンジンを先に固める
- Next.js/Unity/Godot/PhaserはMVPでは使わない
- Deck Editorを最優先できるWeb実装にする
