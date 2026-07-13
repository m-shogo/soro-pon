#!/usr/bin/env bash
# pnpm asset:image:generate から呼ばれるラッパー。venvのpythonを使う。
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
FACTORY_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
VENV_PYTHON="$FACTORY_ROOT/.venv/bin/python3"

if [ ! -x "$VENV_PYTHON" ]; then
  echo "ERROR: Python venvが見つかりません: $VENV_PYTHON" >&2
  exit 1
fi

exec "$VENV_PYTHON" "$SCRIPT_DIR/codex_generate_raw.py" "$@"
