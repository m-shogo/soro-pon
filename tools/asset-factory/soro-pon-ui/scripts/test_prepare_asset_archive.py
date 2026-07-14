"""prepare_asset.pyのcandidate生成時archive保存をfresh clone相当で検証するpytest。

docs/IMAGE-ASSET-WORKFLOW.md/record_schema.pyの契約:
  - 自動検査に合格しcandidateとして配置される時点で、raw/candidate/compare
    の監査原本をgit管理のarchive/へ永続保存する
  - sourceFile/processedFile/compareFileはraw-green/processed
    (gitignore対象のローカル作業領域)ではなく、常にarchive/を指す
  - これにより、raw-green/processedが存在しないfresh cloneでも
    record schema validationが成立する

このテストは実際のリポジトリを一切変更しない。prepare_asset/record_schemaの
モジュール定数(RAW_GREEN_DIR等)をmonkeypatchし、すべての入出力をtmp_path配下
に閉じ込める。
"""

from __future__ import annotations

import hashlib
import json
import sys
from pathlib import Path

import pytest

import prepare_asset
import record_schema
from fixtures import fixture_green_round_subject


def _sha256(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


@pytest.fixture
def isolated_repo(tmp_path, monkeypatch):
    """prepare_asset/record_schemaの参照先をすべてtmp_path配下へ差し替える。"""
    repo_root = tmp_path / "repo"
    factory_root = repo_root / "tools" / "asset-factory" / "soro-pon-ui"
    raw_green_dir = factory_root / "raw-green"
    processed_dir = factory_root / "processed"
    records_dir = factory_root / "records"
    archive_root = factory_root / "archive"
    skins_root = repo_root / "public" / "assets" / "ui" / "soro-pon" / "skins"
    asset_requests_dir = repo_root / "docs" / "asset-requests"

    for d in (raw_green_dir, processed_dir, records_dir, archive_root, skins_root, asset_requests_dir):
        d.mkdir(parents=True, exist_ok=True)

    monkeypatch.setattr(prepare_asset, "REPO_ROOT", repo_root)
    monkeypatch.setattr(prepare_asset, "RAW_GREEN_DIR", raw_green_dir)
    monkeypatch.setattr(prepare_asset, "PROCESSED_DIR", processed_dir)
    monkeypatch.setattr(prepare_asset, "RECORDS_DIR", records_dir)
    monkeypatch.setattr(prepare_asset, "ARCHIVE_ROOT", archive_root)
    monkeypatch.setattr(prepare_asset, "SKINS_ROOT", skins_root)
    monkeypatch.setattr(prepare_asset, "ASSET_REQUESTS_DIR", asset_requests_dir)
    # validate_record()内のファイル実在検査はrecord_schema.REPO_ROOT基準なので
    # 同じtmp_pathへ揃える(prepare_asset.REPO_ROOTとは別定数のため個別に必要)
    monkeypatch.setattr(record_schema, "REPO_ROOT", repo_root)

    return {
        "repo_root": repo_root,
        "raw_green_dir": raw_green_dir,
        "processed_dir": processed_dir,
        "records_dir": records_dir,
        "archive_root": archive_root,
        "skins_root": skins_root,
    }


def _run_prepare_asset(monkeypatch, argv: list[str]) -> int:
    monkeypatch.setattr(sys, "argv", ["prepare_asset.py", *argv])
    return prepare_asset.main()


def _make_input_png(tmp_path: Path) -> Path:
    input_path = tmp_path / "input-raw.png"
    fixture_green_round_subject(64, 64).save(input_path)
    return input_path


class TestCandidateArchivedAtGeneration:
    """通常の候補生成(approval既定=candidate)がarchiveへ保存されることを検証する。"""

    def test_candidate_record_references_archive_not_working_dirs(
        self, isolated_repo, monkeypatch, tmp_path
    ):
        input_path = _make_input_png(tmp_path)
        exit_code = _run_prepare_asset(
            monkeypatch,
            [
                "--skin", "pytest-fixture-skin",
                "--slot", "fixture.badge",
                "--input", str(input_path),
                "--output-name", "fixture-badge-candidate-x.png",
                "--expected-width", "64",
                "--expected-height", "64",
                "--min-padding", "2",
            ],
        )
        assert exit_code == 0

        record_path = (
            isolated_repo["records_dir"]
            / "pytest-fixture-skin-fixture-badge-fixture-badge-candidate-x.json"
        )
        assert record_path.is_file()
        record = json.loads(record_path.read_text(encoding="utf-8"))

        assert record["approval"] == "candidate"
        assert "archive/" in record["sourceFile"] and record["sourceFile"].endswith("/raw.png")
        assert "archive/" in record["processedFile"] and record["processedFile"].endswith(
            "/candidate.png"
        )
        assert "archive/" in record["compareFile"] and record["compareFile"].endswith(
            "/compare.png"
        )
        assert "raw-green" not in record["sourceFile"]
        assert "processed/" not in record["processedFile"]
        assert "processed/" not in record["compareFile"]
        assert "generated/candidates/" in record["placedAt"]
        assert record["promotedTo"] is None
        assert record["promotedAt"] is None
        assert record["skinVersionAtPromotion"] is None
        assert record["archivedAt"] is not None
        assert "pending" not in record["license"].lower()
        assert "review" not in record["license"].lower()

    def test_archive_files_exist_and_public_candidate_placed(self, isolated_repo, monkeypatch, tmp_path):
        input_path = _make_input_png(tmp_path)
        exit_code = _run_prepare_asset(
            monkeypatch,
            [
                "--skin", "pytest-fixture-skin",
                "--slot", "fixture.badge",
                "--input", str(input_path),
                "--output-name", "fixture-badge-candidate-x.png",
                "--expected-width", "64",
                "--expected-height", "64",
                "--min-padding", "2",
            ],
        )
        assert exit_code == 0

        archive_dir = (
            isolated_repo["archive_root"] / "pytest-fixture-skin" / "fixture.badge" / "candidate-x"
        )
        assert (archive_dir / "raw.png").is_file()
        assert (archive_dir / "candidate.png").is_file()
        assert (archive_dir / "compare.png").is_file()

        public_candidate = (
            isolated_repo["skins_root"]
            / "pytest-fixture-skin"
            / "generated"
            / "candidates"
            / "fixture-badge-candidate-x.png"
        )
        assert public_candidate.is_file()

    def test_default_license_has_no_approval_wording(self, isolated_repo, monkeypatch, tmp_path):
        input_path = _make_input_png(tmp_path)
        exit_code = _run_prepare_asset(
            monkeypatch,
            [
                "--skin", "pytest-fixture-skin",
                "--slot", "fixture.badge",
                "--input", str(input_path),
                "--output-name", "fixture-badge-candidate-default.png",
                "--expected-width", "64",
                "--expected-height", "64",
                "--min-padding", "2",
            ],
        )
        assert exit_code == 0
        assert prepare_asset.DEFAULT_LICENSE == "original project asset generated via Codex CLI"
        issues = record_schema._validate_license({"license": prepare_asset.DEFAULT_LICENSE})
        assert issues == []

    def test_explicit_pending_review_license_is_rejected(self, isolated_repo, monkeypatch, tmp_path):
        input_path = _make_input_png(tmp_path)
        exit_code = _run_prepare_asset(
            monkeypatch,
            [
                "--skin", "pytest-fixture-skin",
                "--slot", "fixture.badge",
                "--input", str(input_path),
                "--output-name", "fixture-badge-candidate-badlicense.png",
                "--expected-width", "64",
                "--expected-height", "64",
                "--min-padding", "2",
                "--license", "original project asset (Codex CLI generation, pending human review)",
            ],
        )
        # schema違反(license)によりrecordは保存されず異常終了する
        assert exit_code == 1
        record_path = (
            isolated_repo["records_dir"]
            / "pytest-fixture-skin-fixture-badge-fixture-badge-candidate-badlicense.json"
        )
        assert not record_path.is_file()


class TestNotSelectedAtGenerationTime:
    """生成時点で--approval not-selectedを明示した場合、publicへは配置されない。"""

    def test_not_selected_is_archived_but_not_placed_publicly(self, isolated_repo, monkeypatch, tmp_path):
        input_path = _make_input_png(tmp_path)
        exit_code = _run_prepare_asset(
            monkeypatch,
            [
                "--skin", "pytest-fixture-skin",
                "--slot", "fixture.badge",
                "--input", str(input_path),
                "--output-name", "fixture-badge-candidate-y.png",
                "--expected-width", "64",
                "--expected-height", "64",
                "--min-padding", "2",
                "--approval", "not-selected",
                "--rejection-reason", "test fixture: 意図的に不採用にする",
            ],
        )
        assert exit_code == 0

        record_path = (
            isolated_repo["records_dir"]
            / "pytest-fixture-skin-fixture-badge-fixture-badge-candidate-y.json"
        )
        record = json.loads(record_path.read_text(encoding="utf-8"))
        assert record["approval"] == "not-selected"
        assert record["placedAt"] is None
        assert record["promotedTo"] is None
        assert record["rejectionReason"] == "test fixture: 意図的に不採用にする"
        assert "archive/" in record["processedFile"] and record["processedFile"].endswith(
            "/candidate.png"
        )

        public_candidate = (
            isolated_repo["skins_root"]
            / "pytest-fixture-skin"
            / "generated"
            / "candidates"
            / "fixture-badge-candidate-y.png"
        )
        assert not public_candidate.exists()


class TestFreshCloneEquivalence:
    """raw-green/processedを削除してもrecord schema validationが成立することを確認する。"""

    def test_record_still_validates_after_deleting_gitignored_working_dirs(
        self, isolated_repo, monkeypatch, tmp_path
    ):
        input_path = _make_input_png(tmp_path)
        exit_code = _run_prepare_asset(
            monkeypatch,
            [
                "--skin", "pytest-fixture-skin",
                "--slot", "fixture.badge",
                "--input", str(input_path),
                "--output-name", "fixture-badge-candidate-z.png",
                "--expected-width", "64",
                "--expected-height", "64",
                "--min-padding", "2",
            ],
        )
        assert exit_code == 0

        record_path = (
            isolated_repo["records_dir"]
            / "pytest-fixture-skin-fixture-badge-fixture-badge-candidate-z.json"
        )
        record = json.loads(record_path.read_text(encoding="utf-8"))

        archive_dir = (
            isolated_repo["archive_root"] / "pytest-fixture-skin" / "fixture.badge" / "candidate-z"
        )
        hash_raw_at_generation = _sha256(archive_dir / "raw.png")
        hash_candidate_at_generation = _sha256(archive_dir / "candidate.png")
        hash_compare_at_generation = _sha256(archive_dir / "compare.png")
        assert hash_candidate_at_generation == record["contentHash"]

        # 1. raw-green/とprocessed/を削除する(gitignore対象のローカル作業領域を
        #    fresh cloneでは存在しない状態として再現する)
        for d in (isolated_repo["raw_green_dir"], isolated_repo["processed_dir"]):
            for f in d.glob("**/*"):
                if f.is_file():
                    f.unlink()

        # 2. archive/、public candidates、recordsだけを残す(削除後も残っていること)
        assert (archive_dir / "raw.png").is_file()
        assert (archive_dir / "candidate.png").is_file()
        assert (archive_dir / "compare.png").is_file()
        assert record_path.is_file()

        # 3. record schema validationを実行する
        issues = record_schema.validate_record(record)

        # 4. candidate recordが合格する
        assert issues == []

        # 5. archive内3ファイルのhashが生成時のものと一致する
        assert _sha256(archive_dir / "raw.png") == hash_raw_at_generation
        assert _sha256(archive_dir / "candidate.png") == hash_candidate_at_generation
        assert _sha256(archive_dir / "compare.png") == hash_compare_at_generation
