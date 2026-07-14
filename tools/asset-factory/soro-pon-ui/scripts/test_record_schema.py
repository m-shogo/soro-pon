"""生成記録の監査schema(record_schema.py)のpytestテスト。

docs/IMAGE-ASSET-WORKFLOW.md「監査・再生成性」契約の検証:
  - seedへCodexのsession idを誤って代入していないか
  - generationCommand/processingCommandがシェル上で安全にラウンドトリップ
    できるか(`#00ff00`のような`#`を含む値がコメント化されて消える等の
    破損を防ぐ)
"""

from __future__ import annotations

import json
import shlex
from pathlib import Path

import pytest

from record_schema import (
    GENERATION_COMMAND_PREFIX,
    PROCESSING_COMMAND_PREFIX,
    build_shell_command,
    command_round_trips,
    looks_like_session_id,
    validate_record,
)

RECORDS_DIR = Path(__file__).resolve().parent.parent / "records"


ARCHIVE_DIR = RECORDS_DIR.parent / "archive" / "cute-pop" / "badge.info.background"
# schemaのファイル参照検証はrepoに実在するパスを要求するため、テストのfixtureも
# 既存のarchive済みファイルを指す(架空のraw-green/processedパスは使わない)。
_EXISTING_RAW = str(
    (ARCHIVE_DIR / "candidate-b" / "raw.png").relative_to(RECORDS_DIR.parent.parent.parent.parent)
)
_EXISTING_COMPARE = str(
    (ARCHIVE_DIR / "candidate-b" / "compare.png").relative_to(RECORDS_DIR.parent.parent.parent.parent)
)
_EXISTING_CANDIDATE_PNG = str(
    (ARCHIVE_DIR / "candidate-a" / "candidate.png").relative_to(RECORDS_DIR.parent.parent.parent.parent)
)
_EXISTING_FINAL_PNG = (
    "public/assets/ui/soro-pon/skins/cute-pop/generated/final/badge-info-background.png"
)


def _valid_record(**overrides) -> dict:
    base = {
        "skinId": "cute-pop",
        "slot": "badge.info.background",
        "assetRequest": "007-cute-pop-badge-info-background",
        "sourceFile": _EXISTING_RAW,
        "prompt": "...",
        "tool": "codex-cli",
        "provider": "openai",
        "model": "gpt-5.6-sol",
        "seed": None,
        "generationSessionId": "019f59d7-47de-7db3-bc3f-a7f2c95c6557",
        "generationCommand": build_shell_command(
            GENERATION_COMMAND_PREFIX, ["--prompt-file", "p.txt", "--output-name", "o.png"]
        ),
        "processingCommand": build_shell_command(
            PROCESSING_COMMAND_PREFIX,
            ["--skin", "cute-pop", "--slot", "badge.info.background", "--background-color", "#00ff00"],
        ),
        "backgroundColor": "#00ff00",
        "method": "codex-cli-chroma-key",
        "processedFile": _EXISTING_CANDIDATE_PNG,
        "compareFile": _EXISTING_COMPARE,
        "processParams": {},
        "dimensions": {"width": 240, "height": 80},
        "contentHash": "deadbeef",
        "placedAt": None,
        "promotedTo": None,
        "generatedAt": "2026-07-13",
        "approval": "not-selected",
        "rejectionReason": "test fixture rejection reason",
        "archivedAt": "2026-07-14",
        "validation": {"ok": True, "issues": []},
        "license": "original project asset generated via Codex CLI",
    }
    base.update(overrides)
    return base


def _valid_promoted_record(**overrides) -> dict:
    base = _valid_record(
        processedFile=_EXISTING_FINAL_PNG,
        placedAt=_EXISTING_FINAL_PNG,
        promotedTo=_EXISTING_FINAL_PNG,
        approval="promoted",
        rejectionReason=None,
        promotedAt="2026-07-14",
        skinVersionAtPromotion=3,
    )
    base.update(overrides)
    return base


class TestLooksLikeSessionId:
    def test_recognizes_codex_session_id(self):
        assert looks_like_session_id("019f59d7-47de-7db3-bc3f-a7f2c95c6557") is True

    def test_rejects_plain_integer_seed(self):
        assert looks_like_session_id("42") is False

    def test_rejects_short_hex_string(self):
        assert looks_like_session_id("abcd-1234") is False


class TestCommandRoundTrip:
    def test_hash_containing_value_round_trips(self):
        command = build_shell_command(
            PROCESSING_COMMAND_PREFIX, ["--background-color", "#00ff00"]
        )
        # 素朴な空白結合と違い、#00ff00が丸ごと1トークンとして残ること
        assert "#00ff00" in shlex.split(command)
        assert command_round_trips(command, PROCESSING_COMMAND_PREFIX)

    def test_naive_join_would_have_broken_on_hash(self):
        # 修正前の実装(素朴な空白結合)を再現する。Python側のshlex.splitは
        # comments=False既定のため#00ff00をトークンとして残すが、実際に
        # このコマンドをシェルへ貼り付けて実行すると#以降はコメント扱いで
        # 消える(=見た目のtoken列と実行結果が食い違う=再実行不能)。
        # command_round_trips()は実シェル経由で検証するため、この不整合を
        # 正しく不合格として検出する。
        naive = "pnpm asset:image:prepare --background-color #00ff00"
        assert not command_round_trips(naive, PROCESSING_COMMAND_PREFIX)

    def test_round_trips_with_spaces_and_quotes(self):
        command = build_shell_command(
            GENERATION_COMMAND_PREFIX,
            ["--prompt-file", "a file with spaces.txt", "--note", "it's a test"],
        )
        assert command_round_trips(command, GENERATION_COMMAND_PREFIX)
        tokens = shlex.split(command)
        assert "a file with spaces.txt" in tokens
        assert "it's a test" in tokens

    def test_round_trips_with_dollar_and_semicolon(self):
        command = build_shell_command(
            PROCESSING_COMMAND_PREFIX, ["--license", "cost $5; rm -rf /"]
        )
        assert command_round_trips(command, PROCESSING_COMMAND_PREFIX)
        assert shlex.split(command)[-1] == "cost $5; rm -rf /"

    def test_wrong_prefix_fails(self):
        command = build_shell_command(GENERATION_COMMAND_PREFIX, ["--x", "1"])
        assert not command_round_trips(command, PROCESSING_COMMAND_PREFIX)


class TestValidateRecord:
    def test_valid_record_passes(self):
        assert validate_record(_valid_record()) == []

    def test_missing_field_detected(self):
        record = _valid_record()
        del record["contentHash"]
        issues = validate_record(record)
        assert any("contentHash" in i for i in issues)

    def test_seed_containing_session_id_is_rejected(self):
        record = _valid_record(seed="019f59d7-47de-7db3-bc3f-a7f2c95c6557")
        issues = validate_record(record)
        assert any("generationSessionId" in i for i in issues)

    def test_plain_numeric_seed_is_accepted(self):
        record = _valid_record(seed=42)
        assert validate_record(record) == []

    def test_unescaped_hash_command_is_rejected(self):
        record = _valid_record(
            processingCommand="pnpm asset:image:prepare --background-color #00ff00"
        )
        issues = validate_record(record)
        assert any("processingCommand" in i for i in issues)


class TestFileReferencesMustExist:
    """clone直後のリポジトリでファイル参照先が実在することを検証する。"""

    def test_missing_source_file_is_rejected(self):
        record = _valid_record(sourceFile="tools/asset-factory/soro-pon-ui/raw-green/does-not-exist.png")
        issues = validate_record(record)
        assert any("sourceFile" in i for i in issues)

    def test_missing_processed_file_is_rejected(self):
        record = _valid_record(processedFile="tools/asset-factory/soro-pon-ui/processed/does-not-exist.png")
        issues = validate_record(record)
        assert any("processedFile" in i for i in issues)

    def test_missing_compare_file_is_rejected(self):
        record = _valid_record(compareFile="tools/asset-factory/soro-pon-ui/processed/does-not-exist.compare.png")
        issues = validate_record(record)
        assert any("compareFile" in i for i in issues)

    def test_missing_placed_at_is_rejected(self):
        record = _valid_promoted_record(placedAt="public/does-not-exist.png")
        issues = validate_record(record)
        assert any("placedAt" in i for i in issues)

    def test_null_placed_at_is_allowed_when_not_promoted(self):
        record = _valid_record(placedAt=None)
        assert validate_record(record) == []


class TestApprovalConsistency:
    """approvalの状態ごとにファイル参照フィールドが矛盾しないことを検証する。"""

    def test_valid_promoted_record_passes(self):
        assert validate_record(_valid_promoted_record()) == []

    def test_promoted_without_placed_at_is_rejected(self):
        record = _valid_promoted_record(placedAt=None)
        issues = validate_record(record)
        assert any("placedAt" in i for i in issues)

    def test_promoted_placed_at_must_match_promoted_to(self):
        record = _valid_promoted_record(
            placedAt=_EXISTING_FINAL_PNG, promotedTo=_EXISTING_CANDIDATE_PNG
        )
        issues = validate_record(record)
        assert any("promotedTo" in i for i in issues)

    def test_promoted_processed_file_must_match_placed_at(self):
        record = _valid_promoted_record(processedFile=_EXISTING_CANDIDATE_PNG)
        issues = validate_record(record)
        assert any("processedFile" in i for i in issues)

    def test_promoted_with_rejection_reason_is_rejected(self):
        record = _valid_promoted_record(rejectionReason="should not be here")
        issues = validate_record(record)
        assert any("rejectionReason" in i for i in issues)

    def test_promoted_without_promoted_at_is_rejected(self):
        record = _valid_promoted_record(promotedAt=None)
        issues = validate_record(record)
        assert any("promotedAt" in i for i in issues)

    def test_not_selected_with_placed_at_is_rejected(self):
        record = _valid_record(placedAt=_EXISTING_FINAL_PNG)
        issues = validate_record(record)
        assert any("placedAt" in i for i in issues)

    def test_not_selected_without_rejection_reason_is_rejected(self):
        record = _valid_record(rejectionReason=None)
        issues = validate_record(record)
        assert any("rejectionReason" in i for i in issues)

    def test_not_selected_processed_file_outside_archive_is_rejected(self):
        record = _valid_record(processedFile=_EXISTING_FINAL_PNG)
        issues = validate_record(record)
        assert any("processedFile" in i for i in issues)

    def test_archive_source_without_archived_at_is_rejected(self):
        record = _valid_record(archivedAt=None)
        issues = validate_record(record)
        assert any("archivedAt" in i for i in issues)


class TestLicenseApprovalConsistency:
    """licenseへ承認状態を示す語を混ぜていないことを検証する。"""

    def test_pending_review_in_license_is_rejected(self):
        record = _valid_promoted_record(
            license="original project asset (Codex CLI generation, pending human review)"
        )
        issues = validate_record(record)
        assert any("license" in i for i in issues)

    def test_clean_license_passes(self):
        record = _valid_promoted_record(license="original project asset generated via Codex CLI")
        assert validate_record(record) == []

    def test_rejected_word_in_license_is_rejected(self):
        record = _valid_record(license="original project asset (rejected in review)")
        issues = validate_record(record)
        assert any("license" in i for i in issues)


class TestExistingRecordsComplyWithSchema:
    """コミット済みのbadge.info.background記録(A/B/C)が監査schemaへ準拠していることを確認する。"""

    @pytest.mark.parametrize("candidate", ["a", "b", "c"])
    def test_record_passes_schema(self, candidate):
        path = (
            RECORDS_DIR
            / f"cute-pop-badge-info-background-badge-info-background-candidate-{candidate}.json"
        )
        if not path.is_file():
            pytest.skip(f"record not present yet: {path}")
        record = json.loads(path.read_text(encoding="utf-8"))
        issues = validate_record(record)
        assert issues == [], f"{path}: {issues}"
