# Batch 13 — UI / Safari / Cloudflare Release Report

## 判定

```text
BATCH 13 RESULT: CONDITIONAL
RC STATUS: LIMITED READY
Start HEAD: 37110de0f5dda98411123cf0aed86069e5e97011
Frozen execution SHA: 2a447930ad6d1181dd0cc9c648b07ae3534dd081
Preview branch: codex/batch13-preview
Preview PR: #10
CI run: 30237605574 SUCCESS
Integrity run: 30237605563 SUCCESS
```

UI刷新、両skin × 3人/4人、ローカル品質ゲート、実Safari主要4経路は
PASSした。完成必須のSafari rotation/soak、Safari＋実VoiceOver主要
フローは環境制御チャネル喪失によりBLOCKEDである。Cloudflare Pages
Preview / production / rollback / current復帰はアカウント認証待ちであり、
未実施をPASSとして扱わない。このためCOMPLETEおよびRC READYへは昇格
しない。

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

凍結SHA `2a447930`のproduct/test/build内容に対し、次を実行した。
未コミットの文書変更は実行対象コードへ影響しない。

| Gate | Result |
|---|---:|
| `pnpm install --frozen-lockfile` | PASS |
| Integrity Contracts | 101/101 PASS |
| `pnpm typecheck` | PASS |
| unit | 432/432 PASS |
| skin | 18/18 PASS |
| visual | 80/80 PASS |
| Firefox + Playwright WebKit supplemental | 96/96 PASS |
| production build | PASS |
| deterministic rebuild | PASS |
| Python asset fixtures | 92/92 PASS |
| exact-SHA GitHub CI | 30237605574 SUCCESS |
| exact-SHA GitHub Integrity | 30237605563 SUCCESS |
| exact-SHA CI Python 3.13 + `pip check` | PASS |
| secret scan | 0 high-risk matches |
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
  75be0293df0b02dc773a3a093b885091861ff8accf1b9a0615140ca1690fed3c
JS SHA-256:
  17b1ffeaba6038d92811d7ba6d937fff045314e2703e68d0edef79cdd7793ef5
CSS SHA-256:
  82dfdbaf320f8ecd549e95e0f32f4f486fa63797de2cd1877c8e09096564a5ea
HTML SHA-256:
  5d20a1d2566b5efcd133083cd87e8050e0c700f3e583da9b3bd14e985ea2ad4a
dist files: 48
dist bytes: 7,540,295
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
rotation: BLOCKED
completed cycles: 4 / required 20
observed window: 190秒 / required 1,200秒
console errors: NOT TESTED
page errors: NOT TESTED
network errors: NOT TESTED
```

rotationの4完了cycleでは、portrait `rotate-prompt`からlandscape
`game`へ戻り、HTTP 200、Safari process、次のdiscard操作を確認した。
cycle 5前に制御チャネルを失ったため、20cycle/20分PASSは主張しない。

## 実VoiceOver

VoiceOverを実際にONにし、Safariのcaption panelで次を観測した。

```text
VOICEOVER_PASS:
  "soro-pon、Webコンテンツ"
VOICEOVER_PASS:
  "Vamp Pon 世界の中で流行っている記憶札遊び"
overall mandatory VoiceOver flow: BLOCKED
```

Safari accessibility window喪失後だったため、TOP以外のMatch Setup、
Deck Detail、JSON Import、overwrite dialog、Game、seat、hand、action、
live region、Result、focus returnを通しで操作・観測できなかった。終了時
にVoiceOverアプリを終了し、process不在を確認した。

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
4 Result経路、real VoiceOverのTOP静的読み上げ2項目までである。

Claimしない:

- Safari rotation 20cycle/20分PASS
- Safari console/page/network error 0
- Safari＋VoiceOver主要フローPASS
- 物理iPhone Safari PASS
- Playwright WebKitをSafariとして扱うこと
- local previewをCloudflare deployとして扱うこと
- Cloudflare Previewをproductionとして扱うこと
- rehearsalをformal production rollbackとして扱うこと
