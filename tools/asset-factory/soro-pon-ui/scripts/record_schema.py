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
"""

from __future__ import annotations

import os
import shlex
import subprocess

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


def validate_record(record: dict) -> list[str]:
    """生成記録の監査整合性を検査する。問題があれば理由のlistを返す(空なら合格)。"""
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

    return issues
