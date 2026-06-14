import AsyncStorage
from "@react-native-async-storage/async-storage"

export type StoredTrackingConsent =
  | "authorized"
  | "denied"
  | "restricted"
  | "not_determined"
  | "unavailable"

const TRACKING_CONSENT_KEY =
  "roamie_tracking_consent_status"

export const saveTrackingConsentStatus =
  async (
    status: StoredTrackingConsent
  ) => {

    try {

      await AsyncStorage.setItem(
        TRACKING_CONSENT_KEY,
        status
      )

    } catch (error) {

      console.log(
        "save tracking consent error:",
        error
      )
    }
  }

export const getSavedTrackingConsentStatus =
  async (): Promise<StoredTrackingConsent | null> => {

    try {

      const value =
        await AsyncStorage.getItem(
          TRACKING_CONSENT_KEY
        )

      if (
        value === "authorized" ||
        value === "denied" ||
        value === "restricted" ||
        value === "not_determined" ||
        value === "unavailable"
      ) {
        return value
      }

      return null

    } catch (error) {

      console.log(
        "read tracking consent error:",
        error
      )

      return null
    }
  }

export const resetTrackingConsentStatus =
  async () => {

    try {

      await AsyncStorage.removeItem(
        TRACKING_CONSENT_KEY
      )

    } catch (error) {

      console.log(
        "reset tracking consent error:",
        error
      )
    }
  }
