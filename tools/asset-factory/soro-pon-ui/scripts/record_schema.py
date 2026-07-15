"""生成記録(records/*.json)の監査schema契約。

正本契約(docs/IMAGE-ASSET-WORKFLOW.md 監査・再生成性):
  - seedは実際のseed値のみ。取得できない場合はnull(Codexのsession idを
    代入してはならない)
  - generationSessionId はCodexのsession idを別フィールドで保持する
  - generationCommand は `pnpm asset:image:generate ...`(raw画像生成)を
    再実行可能な形で保持する
  - processingCommand は `pnpm asset:image:prepare ...`(透過〜検査〜
    candidates配置)を再実行可能な形で保持する
  - 両コマンドともshlexで安全にescapeし、shlex.splitで元のargv配列へ
    復元できること(`#00ff00` のような`#`を含む値がコメント化されて
    消える等の破損を防ぐ)

ファイル参照フィールドの意味(すべてリポジトリルート相対パス。clone直後に
実在すること):
  - sourceFile     透過処理前のraw画像。常にarchive/内のraw.png(自動検査に
                    合格しcandidateとして配置された時点でgit管理archiveへ
                    永続保存される。promotedになっても変更しない)
  - processedFile  この候補として実際にレビュー・採用判断された成果物。
                    promoted: production final PNG(placedAt/promotedToと同一)
                    それ以外(candidate/approved/not-selected/rejected):
                      archive/内のcandidate.png(永続保存)
  - compareFile    透過前後の比較画像。常にarchive/内のcompare.png(永続保存。
                    promotedになっても変更しない)
  - placedAt       production/レビュー用に配置されている場所。
                    candidate/approved: public/.../generated/candidates/内
                    promoted:            public/.../generated/final/内
                    not-selected/rejected: null(publicから取り除く)
  - promotedTo     final昇格時の配置先記録。promoted以外はnull。
                    promotedの場合、placedAt/processedFileと同一パスであること
  - archivedAt     raw/compare/candidate.pngをgit管理のarchive/へコピーした
                    日付。このrecordのsourceFile/compareFileがarchive/を
                    指す限り必須(=自動検査合格後は常に必須)

license は生成由来・権利情報のみを記録し、承認状態(pending/approved/
rejected等)を含めない。承認状態は approval / rejectionReason / promotedAt /
archivedAt / skinVersionAtPromotion でのみ管理する。

approval の意味:
  - candidate     自動生成・自動検査直後。人間レビュー前
  - approved      人間が候補として好ましいと判断したが、final昇格作業
                    (manifest登録・version繰り上げ等)はまだ行っていない。
                    ファイル配置契約はcandidateと同一
                    (archive参照 + public candidates配置)
  - rejected / not-selected  人間が不採用と判断した(rejectionReason必須。
                    publicからは取り除きarchiveにのみ残す)
  - rejected-validation  自動画像検査(validate_candidate)に不合格だった試行。
                    人間判断ではなく機械判断による不採用。監査のため
                    raw/candidate/compareはarchiveへ保存しrecordも残すが、
                    publicへは配置しない(placedAt/promotedTo null)。
                    validation.okはfalse、validation.issuesへ検査結果を全保存、
                    rejectionReasonは検査結果から人間可読に設定する
  - promoted      final昇格済み(promotedAt/skinVersionAtPromotion必須。
                    production final PNGのみ参照する)

検証APIは2層に分かれる:
  - validate_record_shape(record)   論理検証のみ(ファイルシステム非依存)
  - validate_record_files(record, path_exists=None)
                                    ファイル実在検証。path_existsを注入する
                                    ことで、prepare処理中は「一時領域に
                                    ビルド済みで最終パスへ配置予定」の
                                    ファイルを最終パス名で検証できる。
                                    未指定時はfresh checkout相当として
                                    REPO_ROOT上の実在を確認する
  - validate_record(record, path_exists=None)  両方を実行する(通常経路)
"""

from __future__ import annotations

import os
import shlex
import subprocess
from pathlib import Path
from typing import Callable

REQUIRED_FIELDS = [
    "skinId",
    "slot",
    "assetRequest",
    "sourceFile",
    "prompt",
    "tool",
    "provider",
    "model",
    "seed",
    "generationSessionId",
    "generationCommand",
    "processingCommand",
    "backgroundColor",
    "method",
    "processedFile",
    "compareFile",
    "processParams",
    "dimensions",
    "contentHash",
    "placedAt",
    "generatedAt",
    "approval",
    "validation",
    "license",
]

GENERATION_COMMAND_PREFIX = ["pnpm", "asset:image:generate"]
PROCESSING_COMMAND_PREFIX = ["pnpm", "asset:image:prepare"]

REPO_ROOT = Path(__file__).resolve().parents[4]

# licenseは生成由来・権利情報のみを記録する。承認状態を示す語を混ぜない。
BANNED_LICENSE_SUBSTRINGS = [
    "pending",
    "review",
    "approval",
    "approved",
    "rejected",
    "not-selected",
    "promoted",
    "candidate",
]

# 不採用の終端状態。rejected/not-selectedは人間判断、rejected-validationは
# 自動画像検査の不合格(いずれもpublicへ配置せずarchiveへのみ残す)
TERMINAL_REJECTED_STATES = {"rejected", "not-selected", "rejected-validation"}
CANDIDATE_LIKE_STATES = {"candidate", "approved"}


def build_shell_command(prefix_tokens: list[str], args: list[str]) -> str:
    """prefix_tokens + argsを、shlex.splitで安全に復元できる1行コマンドへ組み立てる。

    `--background-color #00ff00` のような引数を素朴に空白結合すると、
    シェル上で`#`以降がコメント扱いになり再実行不能になる。
    shlex.joinは各tokenを必要に応じてクォートするため、`#`・空白・
    引用符・`$`・`;`等を含む引数でも安全にラウンドトリップできる。
    """
    return shlex.join([*prefix_tokens, *args])


def _parse_with_real_shell(command: str) -> list[str] | None:
    """コマンド文字列を実際の/bin/shへ渡し、シェルが本当にどう単語分割するかを確認する。

    重要: Pythonのshlex.split()は既定でcomments=False(`#`をコメント扱いしない)
    だが、実際のPOSIXシェル(bash/zsh/sh)は単語の先頭が未クォートの`#`だと
    そこから行末までをコメントとして切り捨てる。shlexだけの検証では
    `--background-color #00ff00` のような壊れたコマンドを合格させてしまう
    (実際に遭遇した不具合)。`eval "set -- $VAR"` を使うことで、保存された
    文字列を実シェルへ流し込んだ場合と同じ単語分割・クォート除去・
    コメント処理を再現し、安全性を実測する。
    """
    env = {**os.environ, "SORO_PON_RECORD_CMD": command}
    script = 'eval "set -- $SORO_PON_RECORD_CMD"; printf "%s\\0" "$@"'
    try:
        result = subprocess.run(
            ["/bin/sh", "-c", script], capture_output=True, env=env, timeout=5
        )
    except (OSError, subprocess.TimeoutExpired):
        return None
    if result.returncode != 0:
        return None
    parts = result.stdout.split(b"\x00")[:-1]
    return [p.decode("utf-8", errors="replace") for p in parts]


def command_round_trips(command: str, prefix_tokens: list[str]) -> bool:
    """記録済みコマンド文字列が実シェルで安全に元のtoken列へ復元できるか確認する。"""
    try:
        expected_tokens = shlex.split(command)
    except ValueError:
        return False
    if expected_tokens[: len(prefix_tokens)] != prefix_tokens:
        return False
    actual_tokens = _parse_with_real_shell(command)
    if actual_tokens is None:
        return False
    return actual_tokens == expected_tokens


def looks_like_session_id(value: str) -> bool:
    """CodexのUUID形式session id(8-4-4-4-12の16進)らしい文字列かを判定する。"""
    parts = value.split("-")
    if len(parts) != 5:
        return False
    lengths = [8, 4, 4, 4, 12]
    return all(len(p) == length and _is_hex(p) for p, length in zip(parts, lengths))


def _is_hex(value: str) -> bool:
    try:
        int(value, 16)
        return True
    except ValueError:
        return False


def validate_record_shape(record: dict) -> list[str]:
    """論理検証のみを行う(ファイルシステムへ一切アクセスしない)。

    prepare処理のトランザクション中、永続領域へ何も書く前に「このrecordは
    そもそも保存に値するか」を判定するために使う。schemaの意味は
    validate_record()と同一で、ファイル実在確認だけを含まない。
    """
    issues: list[str] = []
    for field in REQUIRED_FIELDS:
        if field not in record:
            issues.append(f"missing field: {field}")
    if issues:
        return issues

    seed = record["seed"]
    if seed is not None and looks_like_session_id(str(seed)):
        issues.append(
            "seed appears to contain a Codex session id; use generationSessionId instead "
            f"(seed={seed!r})"
        )

    session_id = record["generationSessionId"]
    if session_id is not None and not looks_like_session_id(str(session_id)):
        issues.append(f"generationSessionId does not look like a session id: {session_id!r}")

    for field, prefix in (
        ("generationCommand", GENERATION_COMMAND_PREFIX),
        ("processingCommand", PROCESSING_COMMAND_PREFIX),
    ):
        value = record[field]
        if value is None:
            continue
        if not command_round_trips(value, prefix):
            issues.append(f"{field} does not shell round-trip safely: {value!r}")

    issues.extend(_validate_file_shapes(record))
    issues.extend(_validate_approval_consistency(record))
    issues.extend(_validate_license(record))

    return issues


def validate_record_files(
    record: dict, path_exists: Callable[[str], bool] | None = None
) -> list[str]:
    """ファイル参照フィールドの実在を検証する。

    path_existsを注入すると「最終予定パス→一時領域のビルド済みファイル」の
    対応で検証できる(prepare処理のトランザクション中に使う)。未指定時は
    fresh checkout相当としてREPO_ROOT上の実在を確認する(production record
    の通常検査経路。テストでschemaを弱める目的での注入は禁止)。
    """
    if path_exists is None:
        path_exists = _default_path_exists

    issues: list[str] = []
    if any(field not in record for field in ("sourceFile", "processedFile", "compareFile")):
        return ["cannot verify file references: required fields missing"]

    for field in ("sourceFile", "processedFile", "compareFile"):
        value = record[field]
        if value is None:
            issues.append(f"{field} must not be null")
            continue
        if not path_exists(value):
            issues.append(f"{field} does not exist in a fresh checkout: {value!r}")

    for field in ("placedAt", "promotedTo"):
        value = record.get(field)
        if value is not None and not path_exists(value):
            issues.append(f"{field} does not exist in a fresh checkout: {value!r}")

    return issues


def validate_record(
    record: dict, path_exists: Callable[[str], bool] | None = None
) -> list[str]:
    """生成記録の監査整合性を検査する(論理+ファイル実在)。空listなら合格。"""
    issues = validate_record_shape(record)
    if any(issue.startswith("missing field:") for issue in issues):
        return issues
    issues.extend(validate_record_files(record, path_exists))
    return issues


def _default_path_exists(relative_path: str) -> bool:
    return (REPO_ROOT / relative_path).is_file()


def _validate_file_shapes(record: dict) -> list[str]:
    """sourceFile/processedFile/compareFileがそれぞれの意味通りの場所を指しているか検証する。

    sourceFile/compareFileは承認状態に関わらず常にgit管理archive/内の
    raw.png/compare.pngでなければならない(自動検査合格後は変更しない)。
    processedFileはpromoted以外なら常にarchive/内のcandidate.pngで
    なければならない(promotedのみproduction final PNGを指す)。
    """
    issues: list[str] = []
    source_file = record.get("sourceFile")
    compare_file = record.get("compareFile")
    processed_file = record.get("processedFile")
    approval = record.get("approval")

    if source_file is not None and (
        "archive/" not in source_file or not source_file.endswith("/raw.png")
    ):
        issues.append(
            f"sourceFile must be the archived raw source (archive/.../raw.png): {source_file!r}"
        )

    if compare_file is not None and (
        "archive/" not in compare_file or not compare_file.endswith("/compare.png")
    ):
        issues.append(
            f"compareFile must be the archived comparison image (archive/.../compare.png): "
            f"{compare_file!r}"
        )

    if approval != "promoted" and processed_file is not None and (
        "archive/" not in processed_file or not processed_file.endswith("/candidate.png")
    ):
        issues.append(
            f"processedFile must be the archived candidate image (archive/.../candidate.png) "
            f"unless approval is promoted: {processed_file!r}"
        )

    return issues


def _validate_approval_consistency(record: dict) -> list[str]:
    issues: list[str] = []
    approval = record["approval"]
    processed_file = record.get("processedFile")
    placed_at = record.get("placedAt")
    promoted_to = record.get("promotedTo")

    if approval == "promoted":
        if placed_at is None:
            issues.append("promoted record must have placedAt set")
        elif "generated/final/" not in placed_at:
            issues.append(
                f"promoted record placedAt must be under generated/final/: {placed_at!r}"
            )
        if promoted_to is None:
            issues.append("promoted record must have promotedTo set")
        if placed_at is not None and promoted_to is not None and placed_at != promoted_to:
            issues.append(
                f"promoted record placedAt ({placed_at!r}) and promotedTo "
                f"({promoted_to!r}) must be identical"
            )
        if processed_file is not None and placed_at is not None and processed_file != placed_at:
            issues.append(
                f"promoted record processedFile ({processed_file!r}) must match "
                f"placedAt ({placed_at!r})"
            )
        if record.get("promotedAt") is None:
            issues.append("promoted record must have promotedAt set")
        if record.get("skinVersionAtPromotion") is None:
            issues.append("promoted record must have skinVersionAtPromotion set")
        if record.get("rejectionReason") is not None:
            issues.append("promoted record must not have a rejectionReason")

    elif approval in TERMINAL_REJECTED_STATES:
        if placed_at is not None:
            issues.append(f"{approval} record must not have placedAt set (got {placed_at!r})")
        if promoted_to is not None:
            issues.append(f"{approval} record must not have promotedTo set (got {promoted_to!r})")
        if record.get("promotedAt") is not None:
            issues.append(f"{approval} record must not have promotedAt set")
        if record.get("skinVersionAtPromotion") is not None:
            issues.append(f"{approval} record must not have skinVersionAtPromotion set")
        if record.get("rejectionReason") is None:
            issues.append(f"{approval} record must have a rejectionReason")
        if approval == "rejected-validation":
            validation = record.get("validation") or {}
            if validation.get("ok") is not False:
                issues.append(
                    "rejected-validation record must have validation.ok == false "
                    "(it means the automated image validation failed)"
                )
            if not validation.get("issues"):
                issues.append(
                    "rejected-validation record must preserve the automated validation issues"
                )

    elif approval in CANDIDATE_LIKE_STATES:
        validation = record.get("validation") or {}
        if validation.get("ok") is not True:
            issues.append(
                f"{approval} record must have validation.ok == true "
                "(validation failures must use rejected-validation)"
            )
        if placed_at is None:
            issues.append(
                f"{approval} record must have placedAt set (public generated/candidates/ path)"
            )
        elif "generated/candidates/" not in placed_at:
            issues.append(
                f"{approval} record placedAt must be under generated/candidates/: {placed_at!r}"
            )
        if promoted_to is not None:
            issues.append(f"{approval} record must not have promotedTo set")
        if record.get("promotedAt") is not None:
            issues.append(f"{approval} record must not have promotedAt set")
        if record.get("skinVersionAtPromotion") is not None:
            issues.append(f"{approval} record must not have skinVersionAtPromotion set")
        if record.get("rejectionReason") is not None:
            issues.append(f"{approval} record must not have a rejectionReason")

    for field in ("sourceFile", "compareFile"):
        value = record.get(field)
        if value is not None and "archive/" in value and record.get("archivedAt") is None:
            issues.append(
                f"{field} points into archive/ but archivedAt is not set: {value!r}"
            )

    return issues


def _validate_license(record: dict) -> list[str]:
    issues: list[str] = []
    license_value = str(record.get("license") or "")
    lowered = license_value.lower()
    for banned in BANNED_LICENSE_SUBSTRINGS:
        if banned in lowered:
            issues.append(
                f"license must not encode approval state (found {banned!r} in "
                f"license={license_value!r}); use approval/rejectionReason instead"
            )
    return issues
