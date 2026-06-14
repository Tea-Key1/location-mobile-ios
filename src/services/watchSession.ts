import {
  NativeModules,
  Platform,
} from "react-native"

const WatchSessionModule =
  NativeModules.WatchSessionModule

export async function syncWatchAccessToken(
  token: string
) {

  if (
    Platform.OS !== "ios" ||
    !WatchSessionModule?.sendAccessToken
  ) {
    return
  }

  try {

    await WatchSessionModule.sendAccessToken(
      token
    )

  } catch (error) {

    console.log(
      "sync watch token error:",
      error
    )
  }
}

export async function clearWatchAccessToken() {

  if (
    Platform.OS !== "ios" ||
    !WatchSessionModule?.clearAccessToken
  ) {
    return
  }

  try {

    await WatchSessionModule.clearAccessToken()

  } catch (error) {

    console.log(
      "clear watch token error:",
      error
    )
  }
}
