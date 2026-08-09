# Asset Request: <タイトル> (<slot名>)

## Skin / Slot

- skin: `<skin-id>`
- slots: `<slot名>`
- target files (candidates): `generated/candidates/<file>`

## Purpose

<何のためのアセットか。どの画面のどの部品か>

## Used By

<使用コンポーネント/画面(slot経由)>

## Generation Method(生成方式)

- [ ] プログラム生成(scripts/ の決定的スクリプト)
- [ ] 画像生成系(Codex CLI起点。docs/IMAGE-ASSET-WORKFLOW.md の8工程に従う)

画像生成系の場合:

- 背景色: `#00ff00`(素材に緑が含まれるなら分離可能な単色へ変更し、ここへ記録)
- 透過処理: 色距離+2段しきい値+despill(IMAGE-ASSET-WORKFLOW.mdの契約に従う)
- 実行コマンド:
  `pnpm asset:image:prepare --skin <skin-id> --slot <slot名> --input <raw画像>
  --request <この request-id> [--background-color '#rrggbb']
  [--hard-threshold 0.12] [--soft-threshold 0.35] [--despill-strength 0.6]
  [--expected-width N --expected-height N] [--min-padding N]
  [--prompt '...'] [--seed ...]`
  (検査成功時のみcandidatesへ配置。詳細はdocs/IMAGE-ASSET-WORKFLOW.md)
- 生成記録: `tools/asset-factory/soro-pon-ui/records/<skin>-<slot>.json`(自動生成)

## Render Contract

- renderMode / pixelDensity / intrinsicSize / nineSlice / nineSliceRender /
  contentSafeArea / minRenderSize / transparent

## Visual Thesis

1文で「この素材が何に見えるべきか」を固定する。

例:

```text
古い夜行列車の机に置かれた、使い込まれた記憶帳の紙面。
```

`modern / premium / cute / game-like / cinematic` のような形容詞だけは禁止。
具体的な物質・時代感・用途・光源・加工痕まで決める。

## Visual Direction

<方向性。design target参照があれば明記>

次を具体化する:

- material / surface: 紙、木、インク、布、樹脂など
- lighting: 光源の位置・強さ・色温度。光源は原則1主光源+必要最小限
- silhouette: 小サイズでも識別できる外形
- focal hierarchy: 最初/次/最後に見せる要素
- negative space: 文字・牌・UIが載る静かな領域
- craft cues: 擦れ、版ズレ、紙繊維、筆圧差など「手で作った痕跡」
- saturation budget: 高彩度を使う箇所を限定する
- edge treatment: 枠・端・切り抜きの処理

## Composition Contract

```text
primary focal point: <1個>
secondary focal point: <最大2個>
quiet area: <UI/文字用の静かな領域>
forbidden focal zones: <タップ/文字/牌を邪魔してはいけない領域>
thumbnail read: <25%縮小でも何が残るべきか>
```

焦点を3個以上同じ強さで作らない。全面を装飾しない。

## Candidate Diversity

画像生成候補は「同じ絵の微差」を3枚作らない。
候補A/B/Cは少なくとも次のうち2軸を明確に変える:

```text
composition / material treatment / silhouette / ornament density /
lighting / edge treatment / focal placement
```

各候補に1行のdesign intentを残す。

## Must Avoid

最低限、以下を毎回チェックする:

```text
generic AI / SaaS card aesthetic
意味のない紫・青・金のgradient
全面bloom / neon rim / cyberpunk化
同じ角丸を何重にも重ねる
中央対称で全部を均等に置く
過剰な粒子・星・キラキラ・光条
fake 3D glossy plastic unless the skin explicitly requires it
文字・ロゴ・UI文言の焼き込み
小物を埋め尽くす collage / sticker-wall 構成
既存の生成候補を少し変えただけの再生成
画面上のテキストや牌より強い装飾
```

## Prior Failure Check

生成前に関連する過去record / approval pack / `docs/design/SOROPON-VISUAL-QUALITY-LEARNINGS.md` を読む。

- previous rejected/not-selected candidates reviewed: `<record/path>`
- do-not-repeat reason codes: `<codes>`
- current generation changes from prior attempt: `<具体的な差分>`

「前回と同じprompt + seed変更だけ」は禁止。

## Fallback If Missing

<CSS/token fallbackの現状>

## Acceptance Checklist

- [ ] 最小〜最大サイズで縁・四隅が破綻しない
- [ ] 上に載る文字のコントラスト(意味色token基準)
- [ ] 5サイズ×両スキンで確認
- [ ] 透明境界にフリンジ・背景色残りがない(画像生成系)
- [ ] 25% thumbnailでもprimary focal pointが読める
- [ ] 画面へ載せた時、素材単体よりUI全体が良くなっている
- [ ] primary/secondary/quiet areaの階層が守られている
- [ ] AIっぽいgeneric card/gradient/glow/collageへ収束していない
- [ ] 過去rejected理由を再発していない
- [ ] 最弱3点を言語化し、重大なものを修正してから承認候補にする

## Review Notes / Learning Capture

人間レビュー後、採否だけで終わらせず次を残す:

```text
strongest quality:
weakest 3 qualities:
rejection/not-selected reason codes:
what to preserve next time:
what to change next time:
```

学びが再利用可能なら `docs/design/SOROPON-VISUAL-QUALITY-LEARNINGS.md` へ追記する。

## Approval Status(承認状態)

- [ ] candidate(レビュー待ち)
- [ ] approved(final昇格可)
- [ ] rejected(修正指示: )