#!/bin/sh
set -e
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

# On hosts that only check out the backend/ folder (e.g. Hostinger with
# root directory = backend), frontend/ won't exist — dist/ is expected to
# already be committed by CI in that case, so just skip the build.
if [ ! -d "$SCRIPT_DIR/../frontend" ]; then
  echo "No frontend/ folder found — skipping frontend build (using committed backend/dist)."
  exit 0
fi

cd "$SCRIPT_DIR/../frontend"
npm install --include=dev
npm run build
