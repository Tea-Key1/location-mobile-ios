import {
  PermissionResponse,
  PermissionStatus,
  getTrackingPermissionsAsync,
  isAvailable,
  requestTrackingPermissionsAsync,
} from "expo-tracking-transparency"

import {
  StoredTrackingConsent,
  getSavedTrackingConsentStatus,
  saveTrackingConsentStatus,
} from "../store/trackingConsentStorage"

import {
  getTrackingConsent,
  updateTrackingConsent,
} from "../api/privacy"

export async function getTrackingConsentStatus():
  Promise<StoredTrackingConsent> {

  try {

    if (!isAvailable()) {
      return "unavailable"
    }

    const response =
      await getTrackingPermissionsAsync()

    return normalizeTrackingPermission(
      response
    )

  } catch (error) {

    console.log(
      "get tracking consent error:",
      error
    )

    return "unavailable"
  }
}

export async function requestCommercialTrackingConsent():
  Promise<StoredTrackingConsent> {

  try {

    if (!isAvailable()) {

      await syncTrackingConsentToServer(
        "unavailable",
        true
      )

      return "unavailable"
    }

    const response =
      await requestTrackingPermissionsAsync()

    const status =
      normalizeTrackingPermission(
        response
      )

    await syncTrackingConsentToServer(
      status,
      true
    )

    return status

  } catch (error) {

    console.log(
      "request tracking consent error:",
      error
    )

    await syncTrackingConsentToServer(
      "unavailable",
      true
    )

    return "unavailable"
  }
}

export async function syncCurrentTrackingConsent():
  Promise<StoredTrackingConsent> {

  const status =
    await getTrackingConsentStatus()

  await syncTrackingConsentToServer(
    status
  )

  return status
}

export async function hydrateTrackingConsentFromServer() {

  try {

    const response =
      await getTrackingConsent()

    await saveTrackingConsentStatus(
      response.tracking_status
    )

    return response

  } catch (error) {

    console.log(
      "hydrate tracking consent error:",
      error
    )

    return null
  }
}

async function syncTrackingConsentToServer(
  status: StoredTrackingConsent,
  force = false
) {

  try {

    const savedStatus =
      await getSavedTrackingConsentStatus()

    if (
      !force &&
      savedStatus === status
    ) {
      return
    }

    const response =
      await updateTrackingConsent({
        status,
        source: "ios_att",
      })

    await saveTrackingConsentStatus(
      response.tracking_status
    )

  } catch (error) {

    console.log(
      "sync tracking consent error:",
      error
    )
  }
}

function normalizeTrackingPermission(
  response: PermissionResponse
): StoredTrackingConsent {

  if (response.granted) {
    return "authorized"
  }

  if (
    response.status ===
    PermissionStatus.UNDETERMINED
  ) {
    return "not_determined"
  }

  if (
    response.status ===
    PermissionStatus.DENIED
  ) {
    return "denied"
  }

  if (
    String(response.status) ===
    "restricted"
  ) {
    return "restricted"
  }

  return "denied"
}
