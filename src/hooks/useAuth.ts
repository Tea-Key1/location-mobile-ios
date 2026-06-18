// src/hooks/useAuth.ts

import { useCallback, useEffect, useState }
from "react"

import {
  loginWithApple as appleLoginApi,
  logoutAll as logoutAllApi,
} from "../api/auth"

import {
  ApiError,
} from "../api/client"

import {
  deleteProfile as deleteProfileApi,
  getProfileCompletion,
} from "../api/profile"

import {
  saveToken,
  getToken,
  removeToken,
} from "../store/authStorage"

import {
  hasCompletedOnboarding,
  resetOnboarding,
  setCompletedOnboarding as saveCompletedOnboarding,
}
from "../store/onboardingStorage"

import {
  resetTrackingConsentStatus,
} from "../store/trackingConsentStorage"

import {
  clearLastHomeUpdateDate,
} from "../store/homeLocationUpdateStorage"

import {
  clearWatchAccessToken,
  syncWatchAccessToken,
} from "../services/watchSession"

import {
  stopBackgroundSimilarityUpdates,
} from "../services/backgroundLocation"

import {
  hydrateTrackingConsentFromServer,
  syncCurrentTrackingConsent,
} from "../utils/trackingConsent"

export type AuthStatusMessage = {
  title: string
  message: string
  tone: "success" | "info"
}

// ==========================================
// useAuth
// ==========================================

export const useAuth = () => {

  // ========================================
  // state
  // ========================================

  const [loading, setLoading] =
    useState(true)

  const [isAuthenticated,
    setIsAuthenticated] =
    useState(false)

  const [
    onboardingCompleted,
    setOnboardingCompleted,
  ] = useState(false)

  const [
    authStatusMessage,
    setAuthStatusMessage,
  ] = useState<AuthStatusMessage | null>(
    null
  )

  const clearAuthStatusMessage =
    useCallback(() => {
      setAuthStatusMessage(null)
    }, [])

  // ========================================
  // init
  // ========================================

  useEffect(() => {

    bootstrap()

  }, [])

  // ========================================
  // bootstrap
  // ========================================

  const bootstrap = async () => {

    try {

      // ====================================
      // JWT check
      // ====================================

      const token =
        await getToken()

      // ====================================
      // authenticated
      // ====================================

      if (token) {

        try {

          const response =
            await getProfileCompletion()

          await syncWatchAccessToken(
            token
          )

          setIsAuthenticated(true)

          await syncTrackingConsentAfterAuth()

          const completed =
            response.profile_completed ||
            await hasCompletedOnboarding()

          if (completed) {
            await saveCompletedOnboarding()

          } else {

            await resetOnboarding()
          }

          setOnboardingCompleted(
            completed
          )

        } catch (error) {

          if (isAuthExpiredError(error)) {

            await clearLocalAuthState()

            return
          }

          const completed =
            await hasCompletedOnboarding()

          setOnboardingCompleted(
            completed
          )

          setIsAuthenticated(true)

          await syncTrackingConsentAfterAuth()

          console.log(
            "profile completion check failed; keeping local session",
            error
          )
        }

      } else {

        const completed =
          await hasCompletedOnboarding()

        setOnboardingCompleted(
          completed
        )

        setIsAuthenticated(false)
      }

    } catch (error) {

      console.log(
        "bootstrap error",
        error
      )

      await clearLocalAuthState()

    } finally {

      setLoading(false)
    }
  }

  // ========================================
  // Apple Login
  // ========================================

  const loginWithApple =
    async (
      identityToken: string
    ) => {

      try {

        // ==================================
        // FastAPI login
        // ==================================

        const response =
          await appleLoginApi(
            identityToken
          )

        // ==================================
        // JWT save
        // ==================================

        await saveToken(
          response.access_token
        )

        await syncWatchAccessToken(
          response.access_token
        )

        await syncTrackingConsentAfterAuth()

        if (
          response.profile_completed
        ) {

          await saveCompletedOnboarding()

          setOnboardingCompleted(true)

        } else {

          await resetOnboarding()

          setOnboardingCompleted(false)
        }

        // ==================================
        // login success
        // ==================================

        setIsAuthenticated(true)

        setAuthStatusMessage({
          title: "Signed in",
          message: response.profile_completed
            ? "You are signed in to your Roamie account."
            : "You are signed in. Finish setup to start using Roamie.",
          tone: "success",
        })

      } catch (error) {

        console.log(
          "loginWithApple hook error",
          error
        )

        throw error
      }
    }

  // ========================================
  // Complete onboarding
  // ========================================

  const completeOnboarding = async () => {

    try {

      await getProfileCompletion()

      await saveCompletedOnboarding()

      setOnboardingCompleted(true)

    } catch (error) {

      console.log(
        "complete onboarding error",
        error
      )

      throw error
    }
  }

  // ========================================
  const logout = async () => {

    try {

      await logoutAllApi()

      await clearLocalAuthState()

      setAuthStatusMessage({
        title: "Logged out",
        message: "You have been logged out of this Roamie session.",
        tone: "info",
      })

    } catch (error) {

      console.log(
        "logout error",
        error
      )

      if (isAuthExpiredError(error)) {

        await clearLocalAuthState()

        setAuthStatusMessage({
          title: "Logged out",
          message: "Your session had expired, so Roamie cleared this device.",
          tone: "info",
        })

        return
      }

      throw error
    }
  }

  const deleteAccount = async () => {

    try {

      await deleteProfileApi()

      await clearLocalAuthState()

      setAuthStatusMessage({
        title: "Account deleted",
        message: "Your account and associated data have been deleted.",
        tone: "success",
      })

    } catch (error) {

      console.log(
        "delete account error",
        error
      )

      if (isAuthExpiredError(error)) {

        await clearLocalAuthState()

        setAuthStatusMessage({
          title: "Signed out",
          message: "Your session had expired, so Roamie cleared this device.",
          tone: "info",
        })

        return
      }

      throw error
    }
  }

  const clearLocalAuthState = async () => {

    await removeToken()

    await clearWatchAccessToken()

    await stopBackgroundSimilarityUpdates()

    await resetOnboarding()

    await resetTrackingConsentStatus()

    await clearLastHomeUpdateDate()

    setIsAuthenticated(false)

    setOnboardingCompleted(false)
  }

  return {

    loading,

    isAuthenticated,

    onboardingCompleted,

    loginWithApple,

    completeOnboarding,

    logout,

    deleteAccount,

    authStatusMessage,

    clearAuthStatusMessage,
  }
}

async function syncTrackingConsentAfterAuth() {

  try {

    await hydrateTrackingConsentFromServer()

    await syncCurrentTrackingConsent()

  } catch (error) {

    console.log(
      "sync tracking consent after auth error",
      error
    )
  }
}

function isAuthExpiredError(
  error: unknown
): boolean {

  return error instanceof ApiError &&
    (
      error.status === 401 ||
      error.status === 403
    )
}
