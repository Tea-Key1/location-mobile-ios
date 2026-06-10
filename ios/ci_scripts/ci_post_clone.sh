#!/bin/sh
set -eux

ROOT_DIR="$(cd "$(dirname "$0")/../.." && pwd)"

export HOMEBREW_NO_INSTALL_CLEANUP=1
export PATH="/opt/homebrew/bin:/usr/local/bin:$PATH"

if ! command -v node >/dev/null 2>&1 || ! command -v npm >/dev/null 2>&1; then
  if command -v brew >/dev/null 2>&1; then
    brew install node
  else
    echo "error: node/npm are not available and Homebrew was not found." >&2
    exit 127
  fi
fi

if ! command -v pod >/dev/null 2>&1; then
  if command -v brew >/dev/null 2>&1; then
    brew install cocoapods
  else
    echo "error: CocoaPods is not available and Homebrew was not found." >&2
    exit 127
  fi
fi

cd "$ROOT_DIR"

if [ -f package-lock.json ]; then
  npm ci
else
  npm install
fi

cd ios
pod install --repo-update
