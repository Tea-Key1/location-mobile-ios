// src/store/onboardingStorage.ts

import AsyncStorage
from "@react-native-async-storage/async-storage"

const ONBOARDING_KEY =
  "roamie_onboarding_completed"

// ========================================
// save
// ========================================

export const setCompletedOnboarding =
  async () => {

    try {

      await AsyncStorage.setItem(
        ONBOARDING_KEY,
        "true"
      )

    } catch (error) {

      console.log(
        "save onboarding error:",
        error
      )
    }
  }

// ========================================
// get
// ========================================

export const hasCompletedOnboarding =
  async (): Promise<boolean> => {

    try {

      const value =
        await AsyncStorage.getItem(
          ONBOARDING_KEY
        )

      return value === "true"

    } catch (error) {

      console.log(
        "read onboarding error:",
        error
      )

      return false
    }
  }

// ========================================
// reset
// ========================================

export const resetOnboarding =
  async () => {

    try {

      await AsyncStorage.removeItem(
        ONBOARDING_KEY
      )

    } catch (error) {

      console.log(
        "reset onboarding error:",
        error
      )
    }
  }