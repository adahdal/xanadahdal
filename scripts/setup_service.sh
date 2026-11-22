#!/usr/bin/env bash
# Setup watermarks-remover service for each Claude Code session.
# Clones the repo if missing, creates the service symlink, and starts the HTTP server.
set -euo pipefail

REPO_URL="https://github.com/guillaumemeyer/watermarks-remover.git"
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SRC_DIR="$PROJECT_DIR/watermarks-remover-src"
SYMLINK="$PROJECT_DIR/service"
PORT=8765
SERVER_SCRIPT="$SRC_DIR/service/scripts/server.py"
PIDFILE="/tmp/watermarks-remover-server.pid"

# Clone if missing
if [ ! -d "$SRC_DIR" ]; then
  echo "watermarks-remover: cloning repository..." >&2
  git clone --depth 1 "$REPO_URL" "$SRC_DIR" >&2
fi

# Create symlink so hooks/run_hook.js resolves ../service/scripts/hook_written_file.py
if [ ! -L "$SYMLINK" ]; then
  ln -sf "$SRC_DIR/service" "$SYMLINK"
fi

# Stop any stale server on the same port
if [ -f "$PIDFILE" ]; then
  OLD_PID=$(cat "$PIDFILE")
  kill "$OLD_PID" 2>/dev/null || true
  rm -f "$PIDFILE"
fi

# Start the HTTP server in the background
python3 -I "$SERVER_SCRIPT" --host 127.0.0.1 --port "$PORT" >/tmp/watermarks-remover-server.log 2>&1 &
echo $! > "$PIDFILE"
echo "watermarks-remover: service started on port $PORT (PID $!)" >&2
