# Skin Distribution Contract (P2-3)

インストール型／販売スキンを導入する前に確定させる契約です。
現時点では公式同梱スキンの安全な読み込み基盤と、runtime loaderがmanifest外から
信頼区分を渡す境界まで実装済みです。外部packageのinstall・署名・entitlement・
配布元検証は未実装で、Gate 7は未達です。

## Package Identity

```text
identity = (id, version, trustedOrigin, author)
id: 小文字英数字とハイフン。公式と衝突するidのインストールは拒否
version: 単調増加のsafe integer。asset URLの?v=に使う
trustedOrigin: official | external
```

**重要:** `trustedOrigin` はmanifest自身に決めさせません。
manifestの `origin` は記述値にすぎず、loader／将来のinstaller／registryが署名・
配布元・予約済みIDを検証した後に付与する信頼区分を正本とします。外部packageが
`origin: official` と自己申告してもofficial権限へ昇格してはいけません。

現在のruntime validatorは、loaderから渡された `expectedOrigin` とmanifestの
`origin` が不一致ならpackageを拒否します。外部として分類された読み込み元では、
manifestがofficialを自己申告してもSVG制限を回避できません。公式同梱fetch経路は
loader側でofficial分類されます。

これは「manifest自己申告を信用しない」ためのruntime境界です。誰をexternal／
officialとして分類するかを署名・配布元・予約IDから決める外部installer自体は未実装
であり、cryptographic package identityではありません。

## Contract Version

```text
skinContractVersion: アプリ側より新しいregistry/skinは受理しない
古いスキンで不足するslotはbase skinへfallbackする
registry内のskin IDは一意でなければならない
継承はbaseを除いて最大3段。上限ちょうどは有効、4段目が必要なら拒否
```

contract更新時は、slot追加を後方互換として扱い、slot削除・意味・幾何契約の
破壊的変更ではcontractVersionを上げます。

## Integrity / Signature Strategy

```text
配布パッケージにはmanifest+tokens+画像のcontent hash一覧(SHA-256)を含める
installerが展開前に全ファイルhashを検証する
公式扱いは公式store署名／予約ID／配布元検証を全て通ったpackageだけ
1件でも不一致ならpackage全体を拒否する
ロード時にもmanifest schema・token allowlist・file policyを毎回検証する
```

現在実装済み:

```text
公式同梱packageのfilesystem validator
runtime manifest schema validation
runtime token allowlist
loader-owned expectedOrigin binding
manifest originとtrusted source分類の不一致拒否
external評価時のSVG拒否
safe filename / path traversal / external URL拒否
versioned URL / preload / atomic visual application
```

未実装:

```text
外部package installer
署名・配布元・予約IDからtrustedOriginを決めるauthority
署名／公開鍵管理
content-hash manifestのinstall-time検証
package保存領域
entitlement
外部package upgrade / uninstall UI
```

## Installation / Entitlement Boundary

```text
installed skinはアプリ管理領域にのみ展開する
package自身は所有権・公式性・署名成功を主張できない
entitlementはpackage外で管理する
skinはengine/game state/records/storage/payment/networkへアクセスできない
検証済みtoken値と登録済み画像だけをpresentationへ渡す
```

## Upgrade / Rollback / Uninstall

将来の実装順:

```text
1. 新versionを隔離領域へ展開
2. identity / trustedOrigin / contract / hash / signatureを検証
3. required assetをpreload
4. tokens/assetsをatomic切替
5. 成功後だけactive pointerを更新
6. 失敗時は直前versionを維持
7. uninstall時に選択中ならdefaultへ復旧
```

`git checkout`、manifest文字列の変更、manifestの `origin: official`、または
loaderへ未検証の分類を渡すことは、trust付与・package rollback・install成功の
証明ではありません。

## Trust-level File Policy

```text
official（同梱build／将来のinstaller authorityが信頼を付与）:
  PNG / WebP / review済みSVG

external:
  PNG / WebPのみ
  SVG / CSS slot / JS / HTML / 外部URL / 外部fontは拒否
```

runtime validatorとfilesystem validatorの両方でexternal SVGを拒否します。
runtimeはloader-owned origin分類にも拘束されます。ただし、その分類を安全に決める
外部installer authority、署名、配布元検証、entitlementは未実装であり、Gate 7
READYを名乗ってはいけません。
