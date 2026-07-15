"""prepare_asset.pyのトランザクション・archive attempt・rollbackのpytest。

docs/IMAGE-ASSET-WORKFLOW.md/record_schema.pyの契約:
  - 自動検査に合格した候補は、生成の都度raw/candidate/compareの監査原本を
    git管理のarchive/<skin>/<slot>/candidate-<id>/attempt-<key>/へ永続保存する
  - record schema違反時はarchive/public/recordへ一切の副作用を残さない
    (トランザクション+rollback)
  - 自動画像検査の不合格はrejected-validationとして監査物とrecordを保存し、
    publicへは配置せず終了コード1
  - 同一candidate IDを再生成しても旧attemptを上書きしない
  - public candidatesの同名候補は既定でエラー、--replace-public-candidate
    明示時のみ差し替える(旧recordはnot-selected supersededへ更新)

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


def _tree_snapshot(root: Path) -> dict[str, str]:
    """root配下の全ファイルの相対パス→hashスナップショット。"""
    return {
        str(p.relative_to(root)): _sha256(p) for p in sorted(root.glob("**/*")) if p.is_file()
    }


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


def _make_input_png(tmp_path: Path, name: str = "input-raw.png", size: int = 64) -> Path:
    input_path = tmp_path / name
    fixture_green_round_subject(size, size).save(input_path)
    return input_path


def _base_args(input_path: Path, output_name: str, size: int = 64) -> list[str]:
    return [
        "--skin", "pytest-fixture-skin",
        "--slot", "fixture.badge",
        "--input", str(input_path),
        "--output-name", output_name,
        "--expected-width", str(size),
        "--expected-height", str(size),
        "--min-padding", "2",
    ]


def _candidate_dir(isolated_repo, candidate_id: str) -> Path:
    return (
        isolated_repo["archive_root"]
        / "pytest-fixture-skin"
        / "fixture.badge"
        / f"candidate-{candidate_id}"
    )


def _attempt_dirs(isolated_repo, candidate_id: str) -> list[Path]:
    base = _candidate_dir(isolated_repo, candidate_id)
    if not base.is_dir():
        return []
    return sorted(p for p in base.iterdir() if p.is_dir() and p.name.startswith("attempt-"))


def _records(isolated_repo) -> list[Path]:
    return sorted(isolated_repo["records_dir"].glob("*.json"))


def _load_single_record(isolated_repo) -> dict:
    records = _records(isolated_repo)
    assert len(records) == 1, records
    return json.loads(records[0].read_text(encoding="utf-8"))


def _public_candidate(isolated_repo, output_name: str) -> Path:
    return (
        isolated_repo["skins_root"]
        / "pytest-fixture-skin"
        / "generated"
        / "candidates"
        / output_name
    )


class TestCandidateArchivedAtGeneration:
    """通常の候補生成(approval既定=candidate)がattempt付きでarchiveへ保存されることを検証する。"""

    def test_candidate_record_references_archive_attempt(self, isolated_repo, monkeypatch, tmp_path):
        input_path = _make_input_png(tmp_path)
        exit_code = _run_prepare_asset(
            monkeypatch, _base_args(input_path, "fixture-badge-candidate-x.png")
        )
        assert exit_code == 0

        record = _load_single_record(isolated_repo)
        assert record["approval"] == "candidate"
        assert "archive/" in record["sourceFile"] and record["sourceFile"].endswith("/raw.png")
        assert "/attempt-" in record["sourceFile"]
        assert record["processedFile"].endswith("/candidate.png")
        assert record["compareFile"].endswith("/compare.png")
        assert "raw-green" not in record["sourceFile"]
        assert "processed/" not in record["processedFile"]
        assert "generated/candidates/" in record["placedAt"]
        assert record["promotedTo"] is None
        assert record["promotedAt"] is None
        assert record["skinVersionAtPromotion"] is None
        assert record["archivedAt"] is not None
        assert record["attemptKey"]
        # record名からattemptを識別できる
        assert f"attempt-{record['attemptKey']}" in _records(isolated_repo)[0].name
        assert "pending" not in record["license"].lower()

    def test_archive_files_exist_and_public_candidate_placed(self, isolated_repo, monkeypatch, tmp_path):
        input_path = _make_input_png(tmp_path)
        exit_code = _run_prepare_asset(
            monkeypatch, _base_args(input_path, "fixture-badge-candidate-x.png")
        )
        assert exit_code == 0

        attempts = _attempt_dirs(isolated_repo, "x")
        assert len(attempts) == 1
        for name in ("raw.png", "candidate.png", "compare.png"):
            assert (attempts[0] / name).is_file()
        assert _public_candidate(isolated_repo, "fixture-badge-candidate-x.png").is_file()

    def test_default_license_has_no_approval_wording(self):
        assert prepare_asset.DEFAULT_LICENSE == "original project asset generated via Codex CLI"
        issues = record_schema._validate_license({"license": prepare_asset.DEFAULT_LICENSE})
        assert issues == []

    def test_attempt_key_prefers_session_id(self):
        key = prepare_asset._attempt_key("019F59D7-47DE-7DB3-BC3F-A7F2C95C6557", "deadbeef" * 8)
        assert key == "019f59d7-47de-7db3-bc3f-a7f2c95c6557"
        key = prepare_asset._attempt_key(None, "deadbeefcafe" + "0" * 52)
        assert key == "deadbeefcafe"
        key = prepare_asset._attempt_key(None, None)
        assert len(key) == 12  # UUIDフォールバック


class TestSchemaViolationRollback:
    """schema違反時にarchive/public/recordへ副作用が残らないことを検証する。"""

    @pytest.mark.parametrize(
        "extra_args",
        [
            # 不正license(承認状態語を含む)
            ["--license", "original project asset (Codex CLI generation, pending human review)"],
            # seedへsession IDを誤指定
            ["--seed", "019f59d7-47de-7db3-bc3f-a7f2c95c6557"],
            # generationSessionId形式不正
            ["--generation-session-id", "not-a-session-id"],
            # 不正generationCommand(#がコメント化され再実行不能)
            ["--generation-command", "pnpm asset:image:generate --color #00ff00"],
        ],
        ids=["bad-license", "seed-session-id", "bad-session-id", "bad-generation-command"],
    )
    def test_no_side_effects_on_schema_violation(
        self, isolated_repo, monkeypatch, tmp_path, extra_args
    ):
        # 先に正常な候補を1つ作り、既存ファイルが不変であることも確認する
        first_input = _make_input_png(tmp_path, "first.png")
        assert (
            _run_prepare_asset(monkeypatch, _base_args(first_input, "fixture-badge-candidate-a.png"))
            == 0
        )
        snapshot_before = _tree_snapshot(isolated_repo["repo_root"])

        bad_input = _make_input_png(tmp_path, "second.png", size=48)
        exit_code = _run_prepare_asset(
            monkeypatch,
            _base_args(bad_input, "fixture-badge-candidate-b.png", size=48) + extra_args,
        )
        assert exit_code == 1

        # archive/public/record追加なし、既存ファイルのhash不変
        assert _tree_snapshot(isolated_repo["repo_root"]) == snapshot_before
        # 一時ファイルが残らない(リポジトリ内に.tmp-*が存在しない)
        leftovers = [p for p in isolated_repo["repo_root"].glob("**/*") if ".tmp-" in p.name]
        assert leftovers == []


class TestRejectedValidationAudit:
    """自動画像検査の不合格がrejected-validationとして監査保存されることを検証する。"""

    def _run_failing(self, isolated_repo, monkeypatch, tmp_path) -> int:
        # expected-widthを実画像(64)と食い違わせて自動検査を確実に失敗させる
        input_path = _make_input_png(tmp_path)
        args = _base_args(input_path, "fixture-badge-candidate-f.png")
        idx = args.index("--expected-width")
        args[idx + 1] = "999"
        return _run_prepare_asset(monkeypatch, args)

    def test_rejected_validation_record_and_archive(self, isolated_repo, monkeypatch, tmp_path):
        exit_code = self._run_failing(isolated_repo, monkeypatch, tmp_path)
        assert exit_code == 1  # 終了コード1でも監査物は確定保存される

        record = _load_single_record(isolated_repo)
        assert record["approval"] == "rejected-validation"
        assert record["validation"]["ok"] is False
        assert record["validation"]["issues"]
        assert record["rejectionReason"]
        assert record["placedAt"] is None
        assert record["promotedTo"] is None
        assert record["promotedAt"] is None
        assert record["skinVersionAtPromotion"] is None
        assert record["archivedAt"] is not None

        attempts = _attempt_dirs(isolated_repo, "f")
        assert len(attempts) == 1
        for name in ("raw.png", "candidate.png", "compare.png"):
            assert (attempts[0] / name).is_file()

        assert not _public_candidate(isolated_repo, "fixture-badge-candidate-f.png").exists()

    def test_rejected_validation_passes_schema_after_fresh_clone(
        self, isolated_repo, monkeypatch, tmp_path
    ):
        assert self._run_failing(isolated_repo, monkeypatch, tmp_path) == 1

        attempts = _attempt_dirs(isolated_repo, "f")
        hashes_before = {
            name: _sha256(attempts[0] / name)
            for name in ("raw.png", "candidate.png", "compare.png")
        }

        # raw-green/processedを削除してfresh clone相当を再現する
        for d in (isolated_repo["raw_green_dir"], isolated_repo["processed_dir"]):
            for f in d.glob("**/*"):
                if f.is_file():
                    f.unlink()

        record = _load_single_record(isolated_repo)
        assert record_schema.validate_record(record) == []
        for name, digest in hashes_before.items():
            assert _sha256(attempts[0] / name) == digest


class TestAttemptUniqueness:
    """同一candidate IDの再生成が旧attemptを上書きしないことを検証する。"""

    def test_regeneration_creates_second_attempt_without_overwrite(
        self, isolated_repo, monkeypatch, tmp_path
    ):
        input1 = _make_input_png(tmp_path, "gen1.png", size=64)
        assert (
            _run_prepare_asset(monkeypatch, _base_args(input1, "fixture-badge-candidate-r.png"))
            == 0
        )
        attempts1 = _attempt_dirs(isolated_repo, "r")
        assert len(attempts1) == 1
        first_hashes = {
            name: _sha256(attempts1[0] / name)
            for name in ("raw.png", "candidate.png", "compare.png")
        }
        first_record_paths = _records(isolated_repo)
        first_record_texts = {p: p.read_text(encoding="utf-8") for p in first_record_paths}
        public = _public_candidate(isolated_repo, "fixture-badge-candidate-r.png")
        public_hash_1 = _sha256(public)

        # 内容の異なる再生成(同じcandidate ID・同じoutput name)。
        # publicの無言上書きは拒否され、archiveにも新attemptは追加されない
        input2 = _make_input_png(tmp_path, "gen2.png", size=48)
        exit_code = _run_prepare_asset(
            monkeypatch, _base_args(input2, "fixture-badge-candidate-r.png", size=48)
        )
        assert exit_code == 1
        assert len(_attempt_dirs(isolated_repo, "r")) == 1
        assert _sha256(public) == public_hash_1
        for p, text in first_record_texts.items():
            assert p.read_text(encoding="utf-8") == text

        # 明示replace時のみ差し替えられ、両attemptのarchiveが残る
        exit_code = _run_prepare_asset(
            monkeypatch,
            _base_args(input2, "fixture-badge-candidate-r.png", size=48)
            + ["--replace-public-candidate"],
        )
        assert exit_code == 0
        attempts_after = _attempt_dirs(isolated_repo, "r")
        assert len(attempts_after) == 2
        # 1回目のattemptのhashが変わっていない
        for name, digest in first_hashes.items():
            assert _sha256(attempts1[0] / name) == digest
        # publicは新しい内容へ更新されている
        assert _sha256(public) != public_hash_1

        # recordは2つ(上書きされていない)。旧recordはnot-selected(superseded)へ更新され、
        # 現在のpublic candidateがどのattemptかはcandidate状態のrecordから一意に辿れる
        records = [json.loads(p.read_text(encoding="utf-8")) for p in _records(isolated_repo)]
        assert len(records) == 2
        current = [r for r in records if r["approval"] == "candidate"]
        superseded = [r for r in records if r["approval"] == "not-selected"]
        assert len(current) == 1 and len(superseded) == 1
        assert current[0]["placedAt"] is not None
        assert superseded[0]["placedAt"] is None
        assert superseded[0]["supersededByAttempt"] == current[0]["attemptKey"]
        assert record_schema.validate_record(current[0]) == []
        assert record_schema.validate_record(superseded[0]) == []

    def test_identical_rerun_dedupes_without_overwrite(self, isolated_repo, monkeypatch, tmp_path):
        input1 = _make_input_png(tmp_path, "same.png")
        args = _base_args(input1, "fixture-badge-candidate-d.png")
        assert _run_prepare_asset(monkeypatch, args) == 0
        attempts = _attempt_dirs(isolated_repo, "d")
        assert len(attempts) == 1
        record_texts = {p: p.read_text(encoding="utf-8") for p in _records(isolated_repo)}

        # 完全同一の再実行は同一attemptへdedupeされ、冪等成功する
        assert _run_prepare_asset(monkeypatch, args) == 0
        assert len(_attempt_dirs(isolated_repo, "d")) == 1
        assert len(_records(isolated_repo)) == 1
        for p, text in record_texts.items():
            assert p.read_text(encoding="utf-8") == text


class TestNotSelectedAtGenerationTime:
    """生成時点で--approval not-selectedを明示した場合、publicへは配置されない。"""

    def test_not_selected_is_archived_but_not_placed_publicly(self, isolated_repo, monkeypatch, tmp_path):
        input_path = _make_input_png(tmp_path)
        exit_code = _run_prepare_asset(
            monkeypatch,
            _base_args(input_path, "fixture-badge-candidate-y.png")
            + ["--approval", "not-selected", "--rejection-reason", "test fixture: 意図的に不採用にする"],
        )
        assert exit_code == 0

        record = _load_single_record(isolated_repo)
        assert record["approval"] == "not-selected"
        assert record["placedAt"] is None
        assert record["promotedTo"] is None
        assert record["rejectionReason"] == "test fixture: 意図的に不採用にする"
        assert record["processedFile"].endswith("/candidate.png")
        assert not _public_candidate(isolated_repo, "fixture-badge-candidate-y.png").exists()


class TestFreshCloneEquivalence:
    """raw-green/processedを削除してもrecord schema validationが成立することを確認する。"""

    def test_record_still_validates_after_deleting_gitignored_working_dirs(
        self, isolated_repo, monkeypatch, tmp_path
    ):
        input_path = _make_input_png(tmp_path)
        exit_code = _run_prepare_asset(
            monkeypatch, _base_args(input_path, "fixture-badge-candidate-z.png")
        )
        assert exit_code == 0

        record = _load_single_record(isolated_repo)
        attempts = _attempt_dirs(isolated_repo, "z")
        assert len(attempts) == 1
        attempt_dir = attempts[0]
        hash_raw = _sha256(attempt_dir / "raw.png")
        hash_candidate = _sha256(attempt_dir / "candidate.png")
        hash_compare = _sha256(attempt_dir / "compare.png")
        assert hash_candidate == record["contentHash"]

        # 1. raw-green/とprocessed/を削除する(gitignore対象のローカル作業領域を
        #    fresh cloneでは存在しない状態として再現する)
        for d in (isolated_repo["raw_green_dir"], isolated_repo["processed_dir"]):
            for f in d.glob("**/*"):
                if f.is_file():
                    f.unlink()

        # 2. archive/、public candidates、recordsだけを残す(削除後も残っていること)
        for name in ("raw.png", "candidate.png", "compare.png"):
            assert (attempt_dir / name).is_file()

        # 3-4. record schema validation(候補recordが合格する)
        assert record_schema.validate_record(record) == []

        # 5. archive内3ファイルのhashが生成時のものと一致する
        assert _sha256(attempt_dir / "raw.png") == hash_raw
        assert _sha256(attempt_dir / "candidate.png") == hash_candidate
        assert _sha256(attempt_dir / "compare.png") == hash_compare
