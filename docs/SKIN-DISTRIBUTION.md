# Skin Distribution Contract (P2-3)

インストール型/販売スキンを導入する前に確定させる契約。現時点では設計のみで、課金・配信の実装は行わない。

## Package Identity

```text
identity = (id, version, origin, author)
id: 小文字英数字とハイフン。公式と衝突するidのインストールは拒否
version: 単調増加のinteger。asset URLの?v=に使われる(P2-2実装済み)
origin: official | external。externalはtrust制限が常に適用される
```

## Contract Version

```text
skinContractVersion: アプリ側のSKIN_CONTRACT_VERSIONより新しいスキンは受理しない(実装済み)
古いスキンで不足するslotはbase skinへfallbackする(実装済み)
contract更新時: slot追加は後方互換、slot削除・幾何変更はcontractVersionを上げる
```

## Integrity / Signature Strategy

```text
配布パッケージにはmanifest+tokens+画像のcontent hash一覧(SHA-256)を含める
インストール時に全ファイルのhashを検証し、1件でも不一致なら全体を拒否する
署名(公式ストア鍵)は配信基盤導入時に追加。hash検証はその前提となる
インストール後もロード時にmanifestのschema検証+token allowlist検証を毎回行う(実装済みの検証を再利用)
公式アセットのhashは生成記録(docs/IMAGE-ASSET-WORKFLOW.md参照)のcontentHashと一致させる
```

## Installation / Entitlement Boundary

```text
installed skinはアプリ管理領域(将来: IndexedDB/専用ディレクトリ)にのみ置く
entitlement(所有権)はスキンパッケージの外で管理する。スキン自身は自分の
  所有状態を主張できない
スキンはengine/game state/records/storage/payment/networkへアクセスできない
  (検証済みtoken値と登録済み画像のみ。実装済みの境界を維持)
```

## Upgrade / Rollback / Uninstall

```text
upgrade: 新versionを別領域へ展開→hash検証→atomic切替(P2-2のpreload+一括適用)
rollback: 直前versionのパッケージを保持し、切替失敗時は前スキン維持(実装済み)
uninstall: パッケージ削除+選択中だった場合はdefaultスキンへ復旧(sanitizeSkinIdが処理)
```

## Trust-level File Policy (P2-1)

```text
official(レビュー済み): PNG/WebP/SVG(SVGはレビュー必須)
external/販売: PNG/WebPのみ。SVG/CSS/JS/HTML/外部URL/外部フォントは常に拒否
(pnpm skin:validateとparseSkinTokens/validateSkinManifestで実装済み)
```
