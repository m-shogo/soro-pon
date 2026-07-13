#!/usr/bin/env bash
# pnpm asset:image:prepare から呼ばれるラッパー。
# tools/asset-factory/soro-pon-ui/.venv を自動検出して使う。
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
FACTORY_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
VENV_PYTHON="$FACTORY_ROOT/.venv/bin/python3"

if [ ! -x "$VENV_PYTHON" ]; then
  echo "ERROR: Python venvが見つかりません: $VENV_PYTHON" >&2
  echo "先に作成してください:" >&2
  echo "  python3 -m venv tools/asset-factory/soro-pon-ui/.venv" >&2
  echo "  tools/asset-factory/soro-pon-ui/.venv/bin/pip install -r tools/asset-factory/soro-pon-ui/requirements.txt" >&2
  exit 1
fi

exec "$VENV_PYTHON" "$SCRIPT_DIR/prepare_asset.py" "$@"
