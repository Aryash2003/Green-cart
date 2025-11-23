#!/usr/bin/env bash
set -euo pipefail

# demo.sh - Build the whole project and run a demo of the build
# Usage: ./demo.sh

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"

echo "[demo] Root: $ROOT_DIR"

echo "[demo] Building frontend (Vite)..."
cd "$ROOT_DIR/carbon"
if [ -f package-lock.json ] || [ -f pnpm-lock.yaml ] || [ -f yarn.lock ]; then
  if command -v npm >/dev/null 2>&1; then
    npm ci || npm install
  else
    echo "npm not found — please install Node.js/npm or build the frontend manually" >&2
    exit 1
  fi
else
  npm install
fi
npm run build

echo "[demo] Frontend build complete -> $ROOT_DIR/carbon/dist"

echo "[demo] Preparing backend environment..."
cd "$ROOT_DIR/server"
PY=v-venv
# Use existing venv if present, else create one named 'venv'
if [ -d "venv" ]; then
  VENV_DIR="venv"
elif [ -d "$PY" ]; then
  VENV_DIR="$PY"
else
  VENV_DIR="venv"
  python3 -m venv "$VENV_DIR"
fi

echo "[demo] Activating virtualenv: $VENV_DIR"
source "$VENV_DIR/bin/activate"

echo "[demo] Upgrading pip and installing requirements..."
pip install --upgrade pip
if [ -f requirements.txt ]; then
  pip install -r requirements.txt
fi

echo "[demo] Installing build/test tools..."
pip install pytest build wheel

echo "[demo] Running backend tests (pytest)..."
python -m pytest -q

echo "[demo] Building backend package (wheel + sdist)..."
if python -m build >/dev/null 2>&1; then
  python -m build
else
  python setup.py sdist bdist_wheel
fi

echo "[demo] Starting backend (gunicorn) and frontend static server..."

# Start backend with gunicorn on port 8000
if command -v gunicorn >/dev/null 2>&1 || [ -f "$VENV_DIR/bin/gunicorn" ]; then
  echo "[demo] Launching gunicorn (backend) on http://127.0.0.1:8000"
  # Run in background and redirect logs
  "$VENV_DIR/bin/gunicorn" -w 2 -b 127.0.0.1:8000 main:app --log-file - &
else
  echo "[demo] gunicorn not available — launching Flask dev server on port 8000"
  nohup "$VENV_DIR/bin/python" main.py > backend.log 2>&1 &
fi

# Serve frontend dist via simple http.server on port 5000
if [ -d "$ROOT_DIR/carbon/dist" ]; then
  echo "[demo] Serving frontend dist at http://127.0.0.1:5000"
  (cd "$ROOT_DIR/carbon/dist" && nohup python -m http.server 5000 > "$ROOT_DIR/frontend.log" 2>&1 &)
else
  echo "[demo] Frontend dist not found: $ROOT_DIR/carbon/dist" >&2
fi

echo "[demo] Build + demo started. Backend: http://127.0.0.1:8000  Frontend: http://127.0.0.1:5000"
echo "[demo] To stop background processes, run: pkill -f gunicorn || pkill -f http.server || kill <pid>"
