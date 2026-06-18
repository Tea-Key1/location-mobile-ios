import AsyncStorage
from "@react-native-async-storage/async-storage"

import * as Location
from "expo-location"

import * as TaskManager
from "expo-task-manager"

import {
  ApiError,
} from "../api/client"

import {
  getSimilarity,
} from "../api/location"

import {
  getMyProfile,
} from "../api/profile"

import {
  hasUsableHomeLocation,
} from "../utils/apiErrors"

import {
  isJapanAdministrativeCoordinate,
} from "../utils/location"

const BACKGROUND_SIMILARITY_TASK =
  "roamie-background-similarity"

export const BACKGROUND_SIMILARITY_INTERVAL_MS =
  3 * 60 * 1000

const LAST_BACKGROUND_CHECK_KEY =
  "roamie:last-background-similarity-check"

type BackgroundLocationTaskData = {
  locations?: Location.LocationObject[]
}

TaskManager.defineTask<BackgroundLocationTaskData>(
  BACKGROUND_SIMILARITY_TASK,
  async ({
    data,
    error,
  }) => {

    if (error) {
      console.log(
        "background similarity location error:",
        error
      )

      return
    }

    const location =
      data.locations?.[data.locations.length - 1]

    if (!location) {
      return
    }

    try {

      await recordBackgroundSimilarity(location)

    } catch (error) {

      if (
        error instanceof ApiError &&
        error.status === 429
      ) {
        console.log(
          "background similarity skipped: rate limited"
        )

        return
      }

      console.log(
        "background similarity skipped:",
        error
      )
    }
  }
)

export async function ensureBackgroundSimilarityUpdates() {

  try {

    const available =
      await TaskManager.isAvailableAsync()

    if (!available) {
      return
    }

    const foregroundPermission =
      await Location.getForegroundPermissionsAsync()

    if (foregroundPermission.status !== "granted") {
      await stopBackgroundSimilarityUpdates()

      return
    }

    const profile =
      await getMyProfile()

    if (!hasUsableHomeLocation(profile)) {
      await stopBackgroundSimilarityUpdates()

      return
    }

    let backgroundPermission =
      await Location.getBackgroundPermissionsAsync()

    if (backgroundPermission.status !== "granted") {
      backgroundPermission =
        await Location.requestBackgroundPermissionsAsync()
    }

    if (backgroundPermission.status !== "granted") {
      await stopBackgroundSimilarityUpdates()

      return
    }

    const registered =
      await Location.hasStartedLocationUpdatesAsync(
        BACKGROUND_SIMILARITY_TASK
      )

    if (registered) {
      return
    }

    await Location.startLocationUpdatesAsync(
      BACKGROUND_SIMILARITY_TASK,
      {
        accuracy:
          Location.Accuracy.Balanced,
        timeInterval:
          BACKGROUND_SIMILARITY_INTERVAL_MS,
        deferredUpdatesInterval:
          BACKGROUND_SIMILARITY_INTERVAL_MS,
        distanceInterval:
          0,
        deferredUpdatesDistance:
          0,
        activityType:
          Location.ActivityType.Other,
        pausesUpdatesAutomatically:
          false,
        showsBackgroundLocationIndicator:
          false,
      }
    )

  } catch (error) {

    console.log(
      "ensure background similarity updates error:",
      error
    )
  }
}

export async function stopBackgroundSimilarityUpdates() {

  try {

    const started =
      await Location.hasStartedLocationUpdatesAsync(
        BACKGROUND_SIMILARITY_TASK
      )

    if (started) {
      await Location.stopLocationUpdatesAsync(
        BACKGROUND_SIMILARITY_TASK
      )
    }

  } catch (error) {

    console.log(
      "stop background similarity updates error:",
      error
    )
  }
}

async function recordBackgroundSimilarity(
  location: Location.LocationObject
) {

  const shouldRun =
    await shouldRunBackgroundCheck()

  if (!shouldRun) {
    return
  }

  const coordinate = {
    lat:
      location.coords.latitude,
    lng:
      location.coords.longitude,
  }

  const valid =
    await isJapanAdministrativeCoordinate(coordinate)

  if (!valid) {
    return
  }

  await AsyncStorage.setItem(
    LAST_BACKGROUND_CHECK_KEY,
    String(Date.now())
  )

  const profile =
    await getMyProfile()

  if (!hasUsableHomeLocation(profile)) {
    return
  }

  await getSimilarity(
    {
      home_lat:
        profile.home_lat,
      home_lng:
        profile.home_lng,
      current_lat:
        coordinate.lat,
      current_lng:
        coordinate.lng,
      source:
        "device",
    },
    {
      suppressDevLog:
        true,
    }
  )
}

async function shouldRunBackgroundCheck():
  Promise<boolean> {

  const lastCheckedAt =
    await AsyncStorage.getItem(
      LAST_BACKGROUND_CHECK_KEY
    )

  if (!lastCheckedAt) {
    return true
  }

  const elapsed =
    Date.now() - Number(lastCheckedAt)

  return !Number.isFinite(elapsed) ||
    elapsed >= BACKGROUND_SIMILARITY_INTERVAL_MS
}
