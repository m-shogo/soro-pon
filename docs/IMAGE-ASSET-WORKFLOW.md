# Image Asset Workflow(画像生成系アセットの正本)

画像生成系アセットの標準手順の正本。ここに書かれた手順が既定であり、
毎回のチャット指示は不要。矛盾する口頭指示がない限りこの文書に従う。

関連正本:

```text
docs/ASSET-PIPELINE.md        アセット全体のslot契約とcandidates/finalフロー
docs/SKIN-DISTRIBUTION.md     final昇格後のversion/hash/配布契約
docs/SKIN-AUTHORING-GUIDE.md  幾何・nine-slice・safe area契約
docs/asset-requests/TEMPLATE.md  リクエスト起票の書式
```

## 正式フロー(8工程)

画像生成系アセットは原則として次の順で作る。工程の省略・順序入れ替えはしない。

```text
1. Codex CLIから画像生成を実行する
2. 背景は高彩度の単色グリーンで生成する
3. Pythonスクリプトで背景を透過処理する
4. 輪郭のグリーンスピル(緑かぶり)を除去する
5. サイズ・余白・透明境界・画像端接触・透過破綻を検査する
6. 検査済みのものだけ generated/candidates/ に置く
7. Gallery/実画面へ適用して人間がレビューする
8. 承認後のみ generated/final/ へ昇格する
```

final昇格の判断は常に人間が行う。自動昇格は禁止。

## 実装済みコマンド(Codex CLI起点)

工程3〜7(透過処理〜candidates配置)は次の1コマンドで一括実行される
(画像生成API呼び出し自体は含まない。単色背景の元画像を`--input`で渡す)。

```text
pnpm asset:image:prepare --skin <skin-id> --slot <slot名> --input <raw画像>
  [--request <asset-request-id>]
  [--background-color '#rrggbb'] [--hard-threshold 0.12] [--soft-threshold 0.35]
  [--despill-strength 0.6] [--expected-width N --expected-height N]
  [--min-padding N] [--prompt '...' | --prompt-file <path>] [--seed ...]
  [--replace-public-candidate]
```

実行内容(トランザクション化): asset request確認 → 入力元画像確認 →
透過処理(chroma_key.py)・比較画像生成(compare_image.py)を一時作業領域
(tempfile)へ出力 → 自動検査(validate_candidate.py) → 最終配置パス決定・
record組み立て → record schemaの論理検証(validate_record_shape) →
一時ファイルと最終予定パスの対応でファイル検証(validate_record_files +
path_exists注入) → すべて成功した場合のみarchive/public/recordへ確定配置
(同一ディレクトリ内の一時名へコピー後os.replace()で原子的に確定。確定中に
失敗した場合は今回追加したファイルをrollbackし、永続領域へ変更を残さない)。

失敗の区別(transaction / rollback契約):

```text
record schema違反(不正license等): 永続変更を一切残さず終了コード1
自動画像検査の不合格: approval=rejected-validation として
  archive監査物(raw/candidate/compare)とrecordを確定保存し、
  publicへは配置せず終了コード1(終了1でも監査物は残る)
```

approvalがcandidate/approvedの場合のみ`generated/candidates/`へ配置する
(rejected/not-selectedを明示指定した場合はarchiveにのみ保存する)。

archiveの世代(attempt)は一意:

```text
archive/<skin>/<slot>/candidate-<id>/attempt-<key>/{raw,candidate,compare}.png
<key>の優先順位: (1)generationSessionIdの正規化値
  → (2)candidate content hashの短縮値 → (3)UUID
同一candidate IDを再実行しても旧attemptを上書きしない
同一attempt keyで内容も完全一致する再実行はdedupe(既存archive/recordを
  再利用する冪等成功)。内容が異なる場合はエラーで停止する(無言上書き禁止)
recordファイル名もattemptを含む(<skin>-<slot>-<stem>-attempt-<key>.json)
request 007以前の旧構造(candidate-<id>/直下)は破壊的移行せず、
  引き続きschemaに通る。新規生成分からattempt構造を適用する
```

public candidatesの同名衝突規則:

```text
既定: 同名public candidateが存在し内容が異なる場合はエラーで停止
  (内容が完全一致する場合のみ冪等成功)
--replace-public-candidate明示時のみ差し替える
差し替え前後のattempt archiveは両方残す
置き換えられた旧candidate recordはapproval=not-selected(superseded)へ
  更新され、supersededByAttemptに新attempt keyを記録する。現在のpublic
  candidateがどのattemptかは、candidate/approved状態でplacedAtがその
  publicパスを指すrecordから一意に辿れる
```

raw-green/processed/はgitignore対象のローカル作業領域のため、record内の
sourceFile/processedFile/compareFileはcandidate生成の時点でarchive/内の
パスを指す(raw-green/processedを直接参照しない)。これによりfresh clone
(raw-green/processedが存在しない状態)でもrecord schema validationが
成立する(`record_schema.py`の`validate_record()`がファイル実在・
approval状態別のファイル配置整合性を検証する)。

Pythonテスト(fixtureベース、外部APIなし)は `pnpm asset:image:test`。

実体は `tools/asset-factory/soro-pon-ui/scripts/` 配下(chroma_key.py /
validate_candidate.py / compare_image.py / fixtures.py / prepare_asset.py)。
実行にはvenvが必要:

```text
python3 -m venv tools/asset-factory/soro-pon-ui/.venv
tools/asset-factory/soro-pon-ui/.venv/bin/pip install \
  -r tools/asset-factory/soro-pon-ui/requirements.txt
```

## Codex CLIからの起動契約

「Codex CLI起点」とは、画像生成の呼び出し自体をCodex CLIから実行することを指す。
Codex CLI自身に画像生成モデルが内蔵されていない場合でも、次を満たすこと。

```text
リポジトリで許可された画像生成ツール/APIを呼び出すラッパースクリプトを用意する
  (例: tools/asset-factory/soro-pon-ui/scripts/ 配下)
そのスクリプトをCodex CLIから実行する(手動で別環境から生成して持ち込まない)
呼び出しコマンド・prompt・パラメータをrecords/(生成記録)へ残す
別環境/手動生成で作った画像をcandidatesへ直接持ち込むことは禁止
  (工程が不透明になり監査・再生成性の契約を満たせないため)
```

## 生成方式の使い分け

### プログラム生成でよいもの(scripts/*.mjs 等の決定的描画)

```text
単純な角丸パネル / 単純なボタン面 / 枠線
nine-slice検証用素材
単純な幾何学アイコン / マスク
寸法確認用素材
```

### 画像生成系(Codex CLI起点)を基本とするもの

```text
手描き感のある装飾
紙・和紙・インクなどの質感
Cute Pop固有のイラスト装飾
ヨルノシルベ風の背景や装飾
牌イラスト
エフェクト素材
幾何学生成だけでは無機質になりやすい素材
```

迷ったら: 「質感・手描き感・イラスト性」が要るなら画像生成系、
「幾何・枠・面」で足りるならプログラム生成。

## 背景色ルール

```text
原則: 高彩度の単色グリーン(例 #00ff00)
素材本体に緑が含まれる場合: マゼンタ/ブルーなど十分に色分離できる単色へ切り替える
背景は完全な単色。グラデーション・影・模様・ビネットは禁止
使用した背景色はアセットごとの生成記録(metadata)に残す
被写体を画像端に接触させない(全周に背景色の余白を確保する)
```

## Python透過処理の契約

「背景色と完全一致したピクセルだけ削除」は禁止。標準要件:

```text
色距離ベースで背景色を判定する(完全一致比較は使わない)
hard threshold(確実に背景) / soft threshold(境界域)の2段しきい値を使う
しきい値間はアルファを段階補間する(2値化しない)
半透明境界のグリーンスピル(緑かぶり)を除去する(despill)
元画像にアルファがある場合はそれも考慮して合成する
画像四辺に背景色が残っていないか検査する
輪郭に緑フリンジが残っていないか確認する
完全透明ピクセルのRGBを必要に応じて正規化する(premultiply境界の汚れ防止)
処理前後の比較画像(原画像 / 透過後 / 市松柄などの背景に重ねたプレビュー)を生成する
同じ入力・同じパラメータから同じ出力が得られる決定的処理にする
```

## Nine-slice content occupancy検査(shrunken-card欠陥の再発防止)

寸法一致検査(`expected-width`/`expected-height`)は**canvas自体のサイズ**
しか見ない。Yorunoshirube Batch 3(`panel.paper.default`/`panel.result.frame`)
で、canvas寸法は正しいのに被写体(portrait寄りの紙/フレーム)がcanvas中央に
小さく(幅比率43-48%)配置され、実際のnine-slice fill描画でパネル内に
縮小したカードが浮いて見える欠陥が、寸法検査・自動検査を通過したまま
human review(Gallery候補比較)でも見過ごされ、production実描画で初めて
顕在化した。この欠陥の再発防止として`validate_candidate.py`へ
content occupancy検査を追加した(`docs/asset-requests/
BATCH-3-YORUNOSHIRUBE-APPROVAL-PACK.md`のTechnical Remediation参照)。

```text
何を測るか:
  透過後画像のopaqueピクセル(alpha>200)の外接矩形(alpha bounding-box)を
  計測し、canvas幅・高さに対する占有率(widthRatio/heightRatio)と
  canvas中心からの被写体中心のずれ(centerOffsetXRatio/YRatio)を求める

なぜ寸法検査だけでは不十分か:
  寸法検査はcanvasのwidth/heightしか見ない。被写体がcanvas内のどこに
  どれだけの面積で存在するかは別軸の情報であり、portrait被写体を
  landscape canvasの中央に小さく置いても寸法検査は合格してしまう

nine-slice panelで必要な理由:
  nine-sliceのcorner/edge/fill領域はcanvas全体を基準に切り出される。
  被写体がcanvasの一部にしか存在しないと、corner領域が透明become、
  fill領域のstretchで被写体が不自然に拡大縮小される(shrunken-card欠陥)

適用対象:
  isolated nine-slice/stretch object契約の素材のみ(`ValidationParams`の
  `min/max-content-width/height-ratio`、`max-content-center-offset-ratio`
  を指定した場合のみ検査される。既定はNoneで検査しない=既存挙動不変)。
  table.backgroundのようなopaque cover契約の素材には適用しない
  (`opaque_background=True`の場合はcontent_bounds自体を計算しない。
  全面塗りに外接矩形という概念が意味を持たないため)

thresholdの決め方:
  実際に良好とみなされた候補(Batch 3の他6承認済みslot)の実測値が
  92-96%だったため、min=0.90, max=0.98を採用。上限を設けるのは
  余白ゼロ(透明境界フリンジの原因になりうる)を避けるため

false positiveを避ける方法:
  円形/不定形の被写体は外接矩形が本来の被写体サイズより大きく出るため、
  矩形パネル素材(紙/フレームのように輪郭自体がほぼ矩形)にのみ適用する。
  既存の円形被写体系テスト(TestValidateCandidate)はoption省略時のまま
  無影響であることをテストで確認済み

blocked候補の実例:
  panel.paper.default candidate A: widthRatio 42.97%(FAIL)
  panel.result.frame candidate B: widthRatio 47.66%(FAIL)

corrected候補の実例:
  panel.paper.default candidate A2: widthRatio 95.83%(PASS)
  panel.result.frame candidate B2: widthRatio 96.09%(PASS)
```

### thresholdはasset class単位で決める(panelとbadgeで別値)

panel家系(90-98%/88-98%/center offset≤2%)の閾値をそのまま他のasset
classへ流用しない。Batch 4(request 016、badge.info.background)では、
badgeが panelより小さく意図的な非対称タブ形状(索引タブ・ラベル・切り欠き)
を持ちうるため、まずCute Popの既存final/archived candidatesを実測し、
健全な分布(widthRatio 57-84%、heightRatio 47.5-84%)を確認したうえで、
その分布を包含する余裕を持った閾値(min/max-content-width-ratio
0.40/0.98、min/max-content-height-ratio 0.30/0.95、
max-content-center-offset-ratio 0.06)を新たに採用した。閾値をasset
生成前に決め打ちせず、同一slot系統の既存final/candidateを実測してから
決めるのが標準手順(詳細: `docs/asset-requests/
016-yorunoshirube-badge-info-background.md`)。

CLIオプション(`pnpm asset:image:prepare`): `--min-content-width-ratio` /
`--max-content-width-ratio` / `--min-content-height-ratio` /
`--max-content-height-ratio` / `--max-content-center-offset-ratio`
(全てOptional、float、0-1)。計測値は指定の有無にかかわらず常に
recordの`validation.contentBounds`へ保存される(閾値未指定時は情報記録のみ、
不合格化はしない)。

## スクリプトと保存領域の契約

```text
scripts/                     プログラム生成(決定的描画)スクリプト。git管理
tools/asset-factory/soro-pon-ui/
  prompts/                   生成指示テンプレート(prompt-template.md)。git管理
  scripts/                   透過・検査スクリプト(chroma-key-green-to-alpha.py等)。git管理
  records/                   生成記録metadata(下記)。git管理
  raw-green/                 グリーン背景の元画像。gitignore(ローカル保持)
  processed/                 透過処理の中間出力。gitignore(ローカル保持)
  archive/<skin>/<slot>/candidate-<id>/attempt-<key>/  監査用永続保存
                                (raw.png / candidate.png / compare.png)。
                                git管理。attempt単位で一意(上書きしない)
public/assets/ui/soro-pon/skins/<skin>/generated/
  candidates/                candidate/approvedのみ。git管理。manifest未登録
  final/                     人間承認済み(promoted)のみ。git管理。manifest登録必須
```

元画像(raw-green)と中間出力(processed/)はローカル作業領域(gitignore)。
比較画像(processed/内の`*.compare.png`)も同様にgit管理対象外の監査出力
(production manifestから参照しない)。

raw-green/processed/はgitignoreのため、リポジトリのclone単体では
監査原本(raw・comparison)を再現できない。そのため`pnpm asset:image:prepare`が
生成の都度(final昇格やnot-selected判定を待たず、自動検査に不合格だった
rejected-validation試行も含めて)、raw.png/candidate.png(透過後)/compare.pngを
`archive/<skin>/<slot>/candidate-<id>/attempt-<key>/`(git管理)へコピーする。
records/の`sourceFile`/`compareFile`は常にarchive内のraw.png/compare.pngを指し、
`processedFile`もpromoted以外は常にarchive内のcandidate.pngを指す
(promotedのみproduction final PNGを指す)。Git履歴だけを監査原本にしない。
not-selected/rejected/rejected-validationの候補は`candidates/`から
public領域を外すが、raw・comparison・candidate本体・metadataはarchiveへ
残し削除しない。

プログラム生成(scripts/の決定的スクリプト、単純な面・枠・幾何素材)は、
生成スクリプトと入力パラメータから完全再生成可能なため、元画像の保存を
省略してよい(生成スクリプト自体が再現手段を兼ねる)。

過去の既知課題(解消済み): 旧`chroma-key-green-to-alpha.py`は2値判定
のみだった。現在は`chroma_key.py`(色距離+2段しきい値+補間+despill+
決定的処理)へ統合され、旧ファイルは互換のための薄いラッパーになっている。

## 監査・再生成性(生成記録)

各候補について `tools/asset-factory/soro-pon-ui/records/<candidate-file>.json` に
可能な範囲で残す:

```text
sourceFile         透過処理前のraw画像。archive/内のraw.png(永続保存。
                     clone直後に実在すること)
prompt             生成指示
tool               生成手段(codex-cli等)
provider           画像生成provider(例: openai)
model              使用モデル
seed               実際のseed値のみ。取得できない場合はnull
                     (Codexのsession idを代入してはならない)
generationSessionId Codex execのsession id(seedとは別フィールド)
generationCommand  `pnpm asset:image:generate ...` の再実行可能なコマンド
processingCommand  `pnpm asset:image:prepare ...` の再実行可能なコマンド
                     (どちらもshlexで安全にescapeし、実シェルで元の
                     argv配列へ復元できること。`#00ff00`のような値を
                     素朴に空白結合すると`#`以降がコメント化され
                     再実行不能になるため、必ず標準的なshell escaping
                     関数[shlex.join等]を使う。record_schema.pyが
                     この契約をshell round-tripテストで検証する)
backgroundColor    背景色
processedFile      この候補として実際にレビュー・採用判断された成果物。
                     promoted: production final PNG(placedAt/promotedToと
                       同一パスであること)
                     not-selected/rejected: archive/内のcandidate.png
                       (永続保存。clone直後に実在すること)
compareFile        透過前後の比較画像。archive/内のcompare.png(永続保存。
                     clone直後に実在すること)
processParams      透過処理パラメータ(しきい値等)
dimensions         寸法
contentHash        SHA-256
placedAt           production manifestから参照される配置先。promoted以外は
                     null(clone直後に実在すること。null以外は必須)
promotedTo         final昇格時の配置先記録。promoted以外はnull。promotedの
                     場合はplacedAt/processedFileと同一パスであること
generatedAt        生成日時
approval           承認状態(candidate / approved / rejected / not-selected /
                     rejected-validation / promoted)。rejected-validationは
                     自動画像検査の不合格(機械判断)で、validation.ok=false・
                     validation.issuesの全保存が必須。publicへは配置しない
rejectionReason    不採用の場合の理由(rejected/not-selected/
                     rejected-validationで必須。それ以外はnull。
                     rejected-validationではvalidation.issuesから
                     人間可読に設定する)
attemptKey         archive attemptの一意キー(新規生成分のrecordに記録)
promotedAt         final昇格日(promotedで必須。それ以外はnull)
skinVersionAtPromotion 昇格時に上げたskin.jsonのversion(promotedで必須。
                     それ以外はnull)
archivedAt         raw/compare(とnot-selectedの場合はcandidate.png)を
                     git管理のarchive/へコピーした日付。sourceFile/
                     compareFileがarchive/を指す限り必須
license            生成由来・権利情報のみを記録する(例:
                     "original project asset generated via Codex CLI")。
                     pending/approved/rejected等の承認状態を示す語は
                     licenseへ混ぜない。承認状態はapproval /
                     rejectionReason / promotedAt / archivedAt /
                     skinVersionAtPromotionでのみ管理する
```

各フィールドの矛盾検査(promoted時のplacedAt/promotedTo/processedFile
一致、not-selected時のprocessedFile archive/配置、license/approval非混在等)
は`record_schema.py`の`validate_record()`がpytestで検証する
(`pnpm asset:image:test`)。

プログラム生成アセットは生成スクリプト自体が記録を兼ねる
(スクリプト名をasset requestへ書けばよい)。

## candidates / final の契約

```text
candidates はレビュー前の候補置き場。production manifestへ登録しない
final は人間承認済みの本採用のみ
final は必ず skin.json(manifest)へ登録し、共有resolver経路からのみ参照する
  (画面・コンポーネントへの直書きは禁止)
final昇格時に壊してはならない既存契約:
  - versioned URL(?v= はmanifest versionから付与される。昇格時にversionを上げる)
  - content hash(生成記録のcontentHashと実ファイルの一致)
  - atomic preload(切替時の一括preload。壊れたファイルは切替中止になる)
  - visual regression(baseline更新は意図した差分のみ。無関係画面の差分はゼロ)
```

## 実運用の基本手順(アセット着手時)

```text
1. asset request を作る/更新する(docs/asset-requests/TEMPLATE.md 準拠)
2. 対象slotを明確にする(slot契約=幾何・renderMode・safe area・minRenderSize)
3. 生成方式を決める(プログラム生成 or 画像生成系)
4. 候補を作る
   画像生成系: Codex CLIから画像生成 -> pnpm asset:image:prepare で
     透過〜検査〜candidates配置まで一括実行(本書「実装済みコマンド」参照)
   プログラム生成: scripts/へ決定的スクリプトを書き、candidatesへ直接出力
5. 候補を Gallery または実画面へ適用してレビューする
6. 人間の承認後のみ final/ へ昇格する
7. final登録後に確認する:
   skin manifest(slot登録・status: final・version繰り上げ)
   pnpm skin:validate / pnpm test / pnpm typecheck / pnpm build
   preload/atomic切替の動作
   pnpm test:visual(意図した差分のみbaseline更新。skin asset読込保証は
     tests/visual/skinAssetReady.ts参照)
```

## Final Decision

画像生成系アセットは「グリーン背景生成 → Python透過 → 検査 → candidates →
人間レビュー → final」の一本道のみ。近道(直接final、検査省略、手動透過)は禁止。
