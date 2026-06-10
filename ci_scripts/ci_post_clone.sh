#!/bin/sh
set -eu

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"

cd "$ROOT_DIR"

if [ -f package-lock.json ]; then
  npm ci
else
  npm install
fi

cd ios
pod install --repo-update
