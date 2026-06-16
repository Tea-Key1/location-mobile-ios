#!/bin/sh
set -eu

PHONE_UDID="${PHONE_UDID:-4B55EDB6-ED33-4A34-92C7-67FE65E2BBFC}"
WATCH_UDID="${WATCH_UDID:-5429275C-B38F-4D38-9E7C-8F9B4B76EE96}"
WATCH_BUNDLE_ID="${WATCH_BUNDLE_ID:-com.taikiyanada.roamie.watchkitapp}"
WORKSPACE="${WORKSPACE:-ios/Roamie.xcworkspace}"
SCHEME="${SCHEME:-RoamieWatchApp}"

echo "Pairing iPhone and Apple Watch simulators if needed..."
if ! xcrun simctl list pairs | grep -q "$WATCH_UDID"; then
  xcrun simctl pair "$WATCH_UDID" "$PHONE_UDID"
fi

echo "Booting paired simulators..."
xcrun simctl boot "$PHONE_UDID" 2>/dev/null || true
xcrun simctl boot "$WATCH_UDID" 2>/dev/null || true
xcrun simctl bootstatus "$WATCH_UDID"

echo "Building Watch app..."
xcodebuild \
  -workspace "$WORKSPACE" \
  -scheme "$SCHEME" \
  -configuration Debug \
  -sdk watchsimulator \
  -destination "platform=watchOS Simulator,id=$WATCH_UDID" \
  build

WATCH_APP_PATH="$(
  find "$HOME/Library/Developer/Xcode/DerivedData" \
    -path "*/Build/Products/Debug-watchsimulator/RoamieWatchApp.app" \
    ! -path "*/Index.noindex/*" \
    -type d \
    -print |
    sort |
    tail -n 1
)"

if [ -z "$WATCH_APP_PATH" ]; then
  echo "Could not find RoamieWatchApp.app after build." >&2
  exit 1
fi

echo "Installing Watch app: $WATCH_APP_PATH"
xcrun simctl install "$WATCH_UDID" "$WATCH_APP_PATH"

echo "Launching Watch app..."
xcrun simctl launch "$WATCH_UDID" "$WATCH_BUNDLE_ID"

echo "Apple Watch simulator is ready. Use Settings > Sync Apple Watch on iPhone."
