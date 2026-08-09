# Release Deploy / Rollback Runbook

Batch 10 で作成。対象は **実deploy先へ配信し、問題時に配信中artifactを
以前の正常versionへ戻す**手順。

関連する既存文書との役割分担:

```text
docs/release/CACHE-AND-ROLLBACK-RUNBOOK.md
  cache方針とasset versioning、および「旧buildが新データを読めるか」の
  local rehearsal(Batch 6で7/7 PASS)。deploy先を前提としない。
docs/release/SOAK-RUNBOOK.md
  長時間soakの手動ゲート手順(Batch 9)。
このファイル
  実deploy先が用意された後の deploy / health check / smoke / rollback /
  rollback検証 の手順。現時点では未実行(下記STATUS参照)。
```

## STATUS: CLOUDFLARE PAGES SELECTED — ACCOUNT SIGN-IN REQUIRED

Batch 13で第一候補をCloudflare Pages、Git providerをGitHub、
repositoryを`m-shogo/soro-pon`、production branchを`main`として確定
した。repo側の契約は次のとおり。

```text
build command: pnpm build
output directory: dist
Node: 24
Vite base: /
SPA: Cloudflare Pagesのunknown path -> index.html fallbackを利用
environment variables: none
source maps: 0
security/cache headers: public/_headers
preview branch: codex/batch13-preview
deployed smoke: pnpm qa:batch13:deployed-smoke
```

Cloudflare account sign-inとGitHub repository連携は所有者の1回の人間
操作を必要とする。2026-07-27現在、login画面で待機中。Preview URL、
production URL、deployment ID、formal rollbackは未取得であり、local
preview/rollback rehearsalをその代用にしない。

### Cloudflare Pages setup

1. Cloudflare Dashboardへsign inする。
2. Workers & PagesでPages applicationを作成し、GitHub repository
   `m-shogo/soro-pon`を接続する。
3. production branchを`main`、build commandを`pnpm build`、output
   directoryを`dist`にする。
4. Node 24を選択し、不要なenvironment variable/secretを追加しない。
5. Preview deploymentを有効にする。
6. `codex/batch13-preview`のexact SHA deploymentを待ち、URLとdeployment
   IDを記録する。
7. 次を実行する。

```bash
B13_DEPLOY_URL=https://preview.example.pages.dev \
  pnpm qa:batch13:deployed-smoke
```

8. Preview PASS後だけ、同じexact SHAを`main`へfast-forward pushする。
9. production URLに同じsmokeを実行し、HTML/JS/CSS/hash/headerを記録する。

### Cloudflare formal rollback

Cloudflareのdeployment historyにsuccessful productionが2件以上ある場合
のみ実行する。Preview deploymentへの切替はformal rollbackではない。

1. current production deployment ID、source SHA、HTML/JS/CSS hashを記録。
2. 直前のknown-good **production** deploymentを選択。
3. Cloudflare Pagesの正式Rollback操作を実行。
4. production URLでroot/deep link/asset/header、両skin×3/4人Result、
   import、same-ID overwrite cancel/confirm、storage reloadをsmokeする。
5. currentで作成したlocalStorageをpreviousが読めることを確認し、
   corruption/dead-endを記録する。
6. deployment historyからcurrent deploymentへ正式に切り戻す。
7. current hashの復元と同じsmokeを確認する。
8. rollback開始、previous確認、current復帰のUTC timestampを保存する。

2026-07-24 時点で、このリポジトリには **deploy先が一切存在しない**。
Batch 10 の実測で確認した事実:

```text
hosting provider config: なし(vercel/netlify/firebase/wrangler/gh-pages
  いずれの設定ファイルも存在しない)
deploy script: なし(package.json に deploy 系 script なし)
service worker: なし
configured base path: なし(vite.config.ts に base 指定なし)
CI: .github/workflows/ci.yml は typecheck/test/skin:validate/build まで。
  deploy job なし
secrets / deploy 権限: 未設定
target URL: 未定
```

したがって `B10-DEPLOY-01` / `B10-DEPLOY-02` / `B10-ROLLBACK-01` /
`B10-ROLLBACK-02` は **BLOCKED_ENVIRONMENT**。

**local preview を deploy 成功として扱ってはならない。**
`vite preview` は production artifact を配信するが、deploy先ではない。
同様に、`git checkout` や `git worktree` で旧commitをbuildし直すことは
**artifact rollback ではない**(配信中の成果物を戻していないため)。

## Unblock（この順序で実施する）

```text
1. hosting provider を決定し、リポジトリ所有者が契約・権限付与を行う
   (エージェントが勝手に契約・作成してはならない)
2. staging と production を分離して定義する
3. deploy config をリポジトリへ追加する。secret は絶対にcommitしない
   (provider側のsecret storeまたはCI secretsを使う)
4. base path が必要なホスティング(サブパス配信)の場合、vite.config.ts の
   base を設定し、asset解決とskin manifestのURL解決を再検証する
5. target URL と health check エンドポイントを決定する
6. previous artifact の保持方法(immutable artifact / versioned path /
   provider の deployment history)を確認する。rollback はこれに依存する
7. 本runbookの Procedure を staging で通しで実施し、証跡を残す
```

## Preflight

```text
- worktree clean、HEAD == origin/main、CI success を確認
- pnpm typecheck / pnpm test / pnpm skin:validate が緑
- pnpm build が成功し、dist/ が生成されている
- artifact hash を記録(下記コマンド)
- 直前の正常 deploy の version / artifact hash を控える(rollback先)
- rollback 判断者(owner)と abort 条件を事前に合意しておく
```

artifact hash の記録:

```bash
find dist -type f \( -name "*.js" -o -name "*.css" -o -name "*.html" \) -exec shasum -a 256 {} \;
```

## Procedure

```text
1. 現在配信中の version と artifact hash を記録する(rollback先の確定)
2. production artifact を生成する(pnpm build)。build後にdist/を書き換えない
3. deploy する(provider の正規手順。手動FTP等の非再現手順は使わない)
4. health check: target URL が 200 を返し、index.html が新artifactの
   entry chunk を参照していることを確認する
5. smoke test(最低限):
   - TOP 表示
   - JSONを読み込む(モーダル開閉と拒否理由表示)
   - Match Setup 到達
   - 1 match を Result まで完走
   - asset 404 が 0 件
   - console error / page error が 0 件
6. cache 反映確認: 新しい content hash 付きファイルが取得され、旧chunkが
   混ざらないこと(mixed-version が起きていないこと)
7. 問題がなければ完了。問題があれば Rollback へ
```

## Rollback

```text
1. abort 条件に該当したことを owner が確認する
2. provider の deployment history、または保持している旧artifactを使い、
   直前の正常 version を再配信する
   (git revert / force push は rollback 手段ではない)
3. rollback 後の version が期待どおりであることを確認する
4. smoke test を再実施する(上記 Procedure 5 と同じ項目)
5. cache invalidation が必要な構成なら実施し、旧/新chunkの混在がないことを
   確認する
6. localStorage 互換確認: rollback 後のbuildが、新buildで書き込まれた
   soro-pon.decks.v1 / records.v1 / settings.v1 / skin.v1 を読めること。
   これはBatch 6でlocalに7/7 PASS済みだが、deploy後は実環境で再確認する
7. 証跡を保存する(下記)
```

## Evidence

```text
- deploy 実行時刻、実行者、commit hash、artifact hash
- target URL(secret を含まないもの)
- health check の応答
- smoke test 各項目の結果とスクリーンショット
- rollback 実施時刻、戻した version、理由
- rollback 後の smoke 結果
- localStorage 互換確認の結果
```

secret、token、deploy credential、個人情報は証跡にも出力しない。

## Abort 条件

```text
- health check が失敗する
- 主要導線(TOP / Match Setup / Match / Result)のいずれかが完了不能
- asset 404 が発生する
- 旧chunkと新chunkが混在する
- 既存ユーザーの localStorage データが読めなくなる
```

いずれかに該当したら追加調査より先に rollback を実行する。

## Ownership

```text
deploy 実行・rollback 判断: リポジトリ所有者
provider 契約・secret 管理: リポジトリ所有者
手順の維持: QA batch 実施時に本runbookを更新する
```
