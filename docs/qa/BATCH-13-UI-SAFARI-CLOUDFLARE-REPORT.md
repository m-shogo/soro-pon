# Batch 13 — UI / Safari / Cloudflare Release Report

## 判定

```text
BATCH 13 RESULT: CONDITIONAL
RC STATUS: LIMITED READY
Start HEAD: 37110de0f5dda98411123cf0aed86069e5e97011
Product frozen SHA: 1c37c5200ad00ed6df72e5483b5af1e2aa34ff23
Preview branch: codex/batch13-preview
Preview PR: #10
Preview candidate SHA: e6bcb82c035b52a2cfed5b7f062da5581a9ca070
Preview candidate CI run: 30253119733 SUCCESS
Preview candidate Integrity run: 30253119813 SUCCESS
```

UI刷新、両skin × 3人/4人、ローカル品質ゲート、実Safari主要4経路、
修正後Safari rotation/soak、変更影響範囲の実VoiceOver確認はPASSした。
Cloudflare Pages Preview / production / rollback / current復帰は登録完了
確認待ちであり、未実施をPASSとして扱わない。このためCOMPLETEおよび
RC READYへは昇格しない。

物理iPhone Safariは要件どおり `KNOWN UNVERIFIED` /
`POST-RELEASE DEVICE GATE` とし、RC/production blockerではない。

## 実装結果

- shared `GameTableLayout` を導入し、utility / stage / seat / center /
  discard / self hand / action / overlay / modal の責務を分離した。
- 4人戦は left / top / right / self、3人戦は left / right / self の専用
  gridを持つ。3人戦に空の4人目seatを残さない。
- player名、識別記号、現在状態、残り手牌、公開済み履歴、最新捨て牌を
  seat所有領域へまとめた。現在のゲームモデルに存在しない点数・リーチは
  捏造していない。
- 自分の手牌と実在actionを下部へ集約し、44px target、selected、
  disabled、focus-visible、safe areaを共通契約化した。
- Cute Popとヨルノシルベは同一DOM/構造を使い、skinはpresentation
  tokenと登録assetだけを差し替える。
- portraitのRotatePrompt表示中も`AppRoot`を維持し、進行中対局を破棄
  しないよう修正した（`b9efbe0`）。
- 表示専用牌をbuttonではなくimage semanticsにし、捨て牌には所有者名を
  含めた。自分の手牌は操作可能な切り替えボタンを維持した
  (`7465bf4`, `1c37c52`)。

詳細契約:

- `docs/UI-READABILITY-CONTRACT.md`
- `docs/GAME-TABLE-LAYOUT.md`
- `docs/RESPONSIVE-CONTRACT.md`
- `docs/ACCESSIBILITY-CONTRACT.md`
- `docs/qa/BATCH-13-UI-AUDIT.md`
- `docs/qa/BATCH-13-VISUAL-REVIEW-PACK.md`

## UI監査

Before/Afterのmachine-readable監査は両skin、3/4人、6 viewport、合計
24ケースを対象とする。

```text
viewports: 844×390 / 812×375 / 932×430 / 1024×576 /
           1280×720 / 1440×900
Before opponent-row overflow findings: 24
After document overflow: 0
After element overflow: 0
After viewport escape: 0
After enabled target <44px: 0
After top-level region collision: 0
reviewed Batch 13 snapshots: 12
REGRESSION: 0
UNKNOWN: 0
```

「修正した文字被り/overflow 24件」は、旧相手行で各監査ケースに1件
再現したtext-bearing region overflowを指す。独立collision detectorは
Before/Afterとも0であり、別の24 collisionを捏造しない。

## ローカル検証

凍結SHA `1c37c52`のproduct/test/build内容に対し、次を実行した。
未コミットの文書変更は実行対象コードへ影響しない。

| Gate | Result |
|---|---:|
| `pnpm install --frozen-lockfile` | PASS |
| Integrity Contracts | 102/102 PASS |
| `pnpm typecheck` | PASS |
| unit | 434/434 PASS |
| skin | 18/18 PASS |
| visual | 80/80 PASS |
| Firefox + Playwright WebKit supplemental | 96/96 PASS |
| production build | PASS |
| deterministic rebuild | PASS |
| Python asset fixtures | 92/92 PASS |
| preview-candidate GitHub CI | 30253119733 SUCCESS |
| preview-candidate GitHub Integrity | 30253119813 SUCCESS |
| preview-candidate CI Python 3.13 + `pip check` | PASS |
| secret scan | 0 high-risk matches; 59 UUID false positives classified |
| Markdown relative-link scan | 181 files / 0 missing |
| source maps in `dist` | 0 |

Toolchain:

```text
Node: v24.15.0
pnpm: 11.1.2
Python local supplement: 3.14.5
Vite: 6.4.3
pnpm-lock.yaml SHA-256:
  59585c15d19cd347571e229ce7ec8cbc1b5f1adeeb9829d9657f68f889098629
build aggregate SHA-256:
  db7c527e9dcbbd7545d806045f34486ac69aaf0d5d4b922cda947946f6c1b582
JS SHA-256:
  349278594d5643b679435b746ff35c4b0d6cd03f12696b5863daddb8b49c8670
CSS SHA-256:
  426c7335e758157a6c9a1f444b50451e680b946be4f5d61fa000dd2cd83a1cfa
HTML SHA-256:
  e573f91d49438e461b34cca5c4fa11ef31440878398a47378a3c22d95ed328aa
dist files: 48
dist bytes: 7,540,688
feature flags: none
required environment variables: none
```

macOSの未追跡`.DS_Store` 4ファイルはGit/Cloudflare Linux buildに存在
しないため、正式な`dist` inventoryから除外した。

## 実Safari

```text
Safari: stable 26.4
macOS: 26.4.1
Yorunoshirube 3p -> Result: PASS
Cute Pop 4p -> Result: PASS
Cute Pop 3p -> Result: PASS
Yorunoshirube 4p -> Result: PASS
Safari 4経路: 4/4 PASS
```

実SafariをmacOS accessibility automationで操作した。これはPlaywright
WebKitではない。4経路のResult画像を保存した。一方、Safariの
accessibility windowが途中で0件となり、その後の完全チェックリストは
継続不能だった。

```text
rotation: PASS
completed cycles: 24 / required 20
observed window: 1,854秒 / required 1,200秒
portrait rotate-prompt: 24 / 24
landscape game: 22 / 24
landscape Result: 2 / 24
HTTP 200: 24 / 24
Safari process present: 24 / 24
product failure / dead-end / corruption: 0 / 0 / 0
console errors: NOT TESTED
page errors: NOT TESTED
network errors: NOT TESTED
```

修正後ビルドで24cycleを最初から実行した。portrait
`rotate-prompt`からlandscapeの`game`または`Result`へ戻り、Result後は
同じメンバーで再戦した。1cycleの`wait`は次cycleで正常進行し、停止、
dead-end、harness failureには至らなかった。

## 実VoiceOver

VoiceOverを実際にONにし、Safariのcaption panelで変更影響範囲を観測
した。

```text
TOP action: VOICEOVER_PASS
Match Setup 3人戦 toggle: VOICEOVER_PASS
Game static discard:
  "フクロウ、最新の捨て牌、イメージ" — VOICEOVER_PASS
Game owner context:
  "相手、トモリ、待機中、手牌8枚、捨て牌1枚、グループ"
  — VOICEOVER_PASS
Game interactive hand:
  "イルカ、切り替えボタン" — VOICEOVER_PASS
Deck Detail / Result static TileCard:
  shared component + focused/visual tests — SUPPLEMENTAL_ONLY
overwrite dialog / focus return:
  unchanged Dialog contract tests — SUPPLEMENTAL_ONLY
change-affected real VoiceOver gate: VOICEOVER_PASS
```

全要素の再巡回は行わず、修正対象と完成必須のTOP / Match Setup / Game
へ限定した。Deck Detail / Resultは同じ`TileCard interactive={false}`の
DOM契約、dialog / focus returnは既存focused testで補助確認したため、
実VoiceOverの直接観測へ昇格しない。終了時にVoiceOverアプリを終了し、
process不在を確認した。

## Cloudflare Pages

```text
provider: Cloudflare Pages
Git provider: GitHub
repository: m-shogo/soro-pon
production branch: main
build command: pnpm build
output directory: dist
Node: 24
environment variables: none
Preview URL: BLOCKED — Cloudflare account sign-in waiting
Production URL: BLOCKED — Preview未完了
Production deployment ID: NOT TESTED
Formal rollback: NOT TESTED
Current restore: NOT TESTED
```

`public/_headers`はHTML再検証、hashed assets immutable、CSPその他の
security headersを宣言する。実deploy smokeはasset/MIME/deep link/
両skin/3p/4p/import/same-ID cancel+confirm/storage/Result/CSP/cache/
source-map/console/page/networkを検証する。Cloudflareの認証完了後にのみ
実URLの結果へ更新する。

## Defect accounting

```text
PRODUCT_DEFECT fixed during Batch 13: 3
  skin readability tokens missing from structural registry
  Match-only player styles leaked into setup screens
  RotatePrompt unmounted AppRoot and reset an active game
open PRODUCT_DEFECT: 0 within executed scope
HARNESS_DEFECT fixed: 2
  layout audit target URL was not selectable
  Safari rotation harness did not resume the active transition
DOCUMENTATION_DEFECT fixed: 1
  visual pack initially counted 8 instead of 12 reviewed snapshots
data corruption: 0 within executed integrity/import/storage flows
dead-end: 0 within executed automated flows and Safari Result paths
```

未実施Safari/VoiceOver/Cloudflare範囲を「0件」とは数えない。

## 物理iPhone Safari

```text
Result: KNOWN UNVERIFIED
Gate: POST-RELEASE DEVICE GATE
RC blocker: NO
Production blocker: NO
```

未証明リスクはiOS Safari固有viewport、safe area、touch、storage、
orientation、browser chromeである。macOS Safari、Playwright WebKit、
responsive visual、safe-area、touch-target testはmitigationであり、
物理iPhoneの代替PASSではない。

解除手順:

1. 物理iPhoneを接続・unlock・trustする。
2. production URLをiPhone Safariで開く。
3. 両skin × 3人/4人、import、storage reload、orientation、Resultを実行する。
4. safe area、browser chrome、tap target、dialogを人間が確認する。
5. 可能ならiPhone VoiceOverを実際にONにして追加確認する。
6. 端末、OS、Safari version、結果、非機密証跡をpost-release reportへ残す。

## Exact claim scope / non-claims

Claimする範囲は、凍結候補のローカル自動検証、real stable macOS Safariの
4 Result経路と修正後24cycle、real VoiceOverのTOP / Match Setup /
Gameにおける静的捨て牌・所有者文脈・操作可能手牌までである。

Claimしない:

- Safari console/page/network error 0
- Deck Detail / Result / overwrite dialog / focus returnを今回の実VoiceOver
  直接観測として扱うこと
- 物理iPhone Safari PASS
- Playwright WebKitをSafariとして扱うこと
- local previewをCloudflare deployとして扱うこと
- Cloudflare Previewをproductionとして扱うこと
- rehearsalをformal production rollbackとして扱うこと
