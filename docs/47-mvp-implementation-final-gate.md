# MVP Implementation Final Gate

## Purpose

MVP本実装へ入る直前に、実装AIが迷いやすい仕様差分を最終固定する。

このファイルは、古い記述が残っている場合の上書きルールとして扱う。

## Final Gate Status

```text
MVP Phase 1 implementation may start after reading this file.
```

ただし、UI本実装は domain / schema / engine / tests が通ってから進める。

## 1. Orientation Is Landscape-first Everywhere

全主要画面は横画面を正とする。

```text
base design reference: 844x390 landscape
main screens: landscape-first
actual display: responsive 100svw x 100svh in phone landscape
portrait: rotate prompt or limited utility only
```

844x390 は実寸固定キャンバスではなく、デザイン基準サイズとして扱う。
スマホ横では端末画面にフィットさせ、PCでは中央ゲーム卓 + 外側補助/夜机背景で扱う。

対象:

```text
TOP
Deck List
Deck Detail
Deck Editor
Tile Editor
Role Editors
Rule Settings
Balance Check
Import / Export
Match Setup
Match
Result
Collection
Clear Board
Dialogs
```

古い `TOP/Editor/Resultは縦画面にも対応` のような記述は使わない。

Portraitでは、対戦画面・編集画面を無理に詰め込まない。

## 2. Crisp Responsive UI System

UI実装時は、`docs/48-responsive-crisp-ui-system.md` を必ず読む。

固定:

```text
844x390はデザイン基準であり、実寸固定ではない
スマホ横は100svw x 100svhへフィット
画面全体を transform: scale() で拡大縮小しない
UI枠・アイコン・線はSVG優先
絵・背景・紙質感・インク汚れは高解像度PNG/WebP
文字は画像に焼き込まずHTML textで描画
重要UIの寸法は整数pxへ丸める
紙パネルや手描き縁が必要な箇所だけ9-sliceを使う
```

禁止:

```text
低解像度PNGを拡大してUIに使う
文字入り画像を量産する
必須操作をPC専用外側パネルへ逃がす
札のaspect-ratioを崩す
```

## 3. UI Quality Gate

UI実装時は、`docs/49-ui-quality-gate-and-codex-design-rules.md` を必ず読む。

固定:

```text
Codexはデザインを発明しない
採用済みデザインターゲット10枚を品質基準にする
tokens.css以外へ新しい色を勝手に追加しない
画面ごとの独自ボタン/独自パネルを作らない
UIはprimitives/components経由で実装する
Component Galleryを先に作る
UI変更時は指定サイズでスクリーンショット確認する
```

禁止:

```text
白い汎用WebアプリUI
明るい量産ボードゲームUI
Material Design風
Tailwind demo風
色数が多いカードゲームUI
角丸/影/余白が画面ごとに違うUI
```

## 4. Pro UI Production Quality Checklist

UIを「完成」と呼ぶ前に、`docs/50-pro-ui-production-quality-checklist.md` を必ず読む。

固定:

```text
主要componentはstate matrixを持つ
motion / animationは意味がある場所だけに使う
typographyは分類とtokensで管理する
touch target / focus-visibleを守る
compact / normal / wide / desktop のdensity modeを考慮する
UI変更時は指定5サイズでscreenshot reviewする
performance budgetを守る
polish pass checklistを通す
```

禁止:

```text
状態差分を色だけで表す
全ボタンを常時発光させる
文字サイズ/影/角丸を画面ごとに直書きする
focus-visibleを消す
compactで手牌/捨て牌/主要操作を削る
重いblur/glow/常時パーティクルを増やす
```

## 5. Adopted Design Targets

画面デザイン・UI実装の品質基準は以下。

```text
docs/design-targets/generated/soro-pon-landscape-vampon-ui-v1/README.md
docs/design-targets/generated/soro-pon-landscape-vampon-ui-v1/01-top.png
docs/design-targets/generated/soro-pon-landscape-vampon-ui-v1/02-deck-list.png
docs/design-targets/generated/soro-pon-landscape-vampon-ui-v1/03-deck-detail.png
docs/design-targets/generated/soro-pon-landscape-vampon-ui-v1/04-match-setup.png
docs/design-targets/generated/soro-pon-landscape-vampon-ui-v1/05-deck-editor.png
docs/design-targets/generated/soro-pon-landscape-vampon-ui-v1/06-tile-editor.png
docs/design-targets/generated/soro-pon-landscape-vampon-ui-v1/07-match-discard-phase.png
docs/design-targets/generated/soro-pon-landscape-vampon-ui-v1/08-match-win-or-ron-phase.png
docs/design-targets/generated/soro-pon-landscape-vampon-ui-v1/09-result.png
docs/design-targets/generated/soro-pon-landscape-vampon-ui-v1/10-collection.png
```

参照画像は直接runtime素材として使わない。色、余白、紙UI、黒インク、ランタン光、情報密度の基準にする。

## 6. Supported Player Counts

3人/4人対応は、`RuleConfig.supportedPlayerCounts` で持つ。

```ts
type SupportedPlayerCount = 3 | 4;

type RuleConfig = {
  id: string;
  name: string;
  supportedPlayerCounts: SupportedPlayerCount[];
  handSizeNormal: number;
  handSizeAfterDraw: number;
  winHandSize: number;
  roleSpanMin: number;
  roleSpanMax: number;
  allowRon: boolean;
  allowPon: false;
  allowReach: boolean;
  allowScoreBonus: boolean;
  allowWildcard: boolean;
  allowKan: false;
  allowChi: false;
};
```

MVP公式サンプルは以下。

```ts
supportedPlayerCounts: [3, 4]
```

`minPlayers` / `maxPlayers` はMVPでは使わない。

## 7. Score Bonus Is Separate From Role

MVPでは `score_bonus` を `Role.kind` に入れない。

固定:

```ts
type RoleKind = 'win_role' | 'special_bonus';
```

`score_bonus` は `ScoreBonus[]` で扱う。

```ts
type ScoreBonus = {
  id: string;
  name: string;
  type: 'duplicate_tile' | 'duplicate_name' | 'duplicate_category';
  minCount: number;
  points: number;
  maxPoints?: number;
  description?: string;
  allowWildcard?: boolean;
};
```

`DeckVariant` は以下。

```ts
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

## 8. Ron / Tsumo Candidate Rule

ロン/ツモ候補にするのは `Role.kind = 'win_role'` だけ。

```text
win_role: tsumo/ron candidate
special_bonus: after-win points only
scoreBonuses: after-win points only
```

禁止:

```text
special_bonusでロン
special_bonusでツモ
scoreBonusだけで勝利
scoreBonusをロン候補にする
```

## 9. Implementation Order

最初にUIへ入らない。

```text
Phase 1: Vite + React + TypeScript + Vitest + Zod setup
Phase 2: domain types / Zod schema / animal starter parse test
Phase 3: role evaluation / wildcard assignment / scoring / deck validation
Phase 4: match flow / CPU minimum strategy
Phase 5: localStorage / import-export
Phase 6: UI foundation: tokens / primitives / Component Gallery / responsive metrics / state matrix
Phase 7: landscape UI implementation based on adopted references, crisp responsive UI system, UI quality gate, and pro production checklist
Phase 8: screenshot review / polish pass / performance check
```

## 10. Asset Generation Workflow

UIパーツを画像生成する場合は以下を使う。

```text
tools/asset-factory/soro-pon-ui/
```

固定フロー:

```text
緑背景で生成
Pythonで緑背景を透過
透過PNGだけ public/assets/ui/soro-pon/v1/ へ置く
```

ただし、UI枠・アイコン・線・札枠はSVG優先。PNG/WebPは絵・背景・紙質感・インク汚れに使う。
9-sliceは紙パネルや手描き縁を守りたい箇所だけ使う。

## Final Decision

MVP実装時に迷った場合は、このファイルを優先する。

```text
docs/47-mvp-implementation-final-gate.md
```

UIのレスポンシブ・鮮明さ・9-slice/SVG/PNG/WebP使い分けで迷った場合は、以下を優先する。

```text
docs/48-responsive-crisp-ui-system.md
```

UI品質・Codexのデザイン境界・ダサくならないための実装制約で迷った場合は、以下を優先する。

```text
docs/49-ui-quality-gate-and-codex-design-rules.md
```

UIの状態・motion・typography・touch target・density・performance・polishで迷った場合は、以下を優先する。

```text
docs/50-pro-ui-production-quality-checklist.md
```
