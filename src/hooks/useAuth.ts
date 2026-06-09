// src/hooks/useAuth.ts

import { useEffect, useState }
from "react"

import {
  loginWithApple as appleLoginApi,
  logoutAll as logoutAllApi,
} from "../api/auth"

import {
  ApiError,
} from "../api/client"

import {
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

          setIsAuthenticated(true)

          if (response.profile_completed) {

            await saveCompletedOnboarding()

          } else {

            await resetOnboarding()
          }

          setOnboardingCompleted(
            response.profile_completed
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

      const response =
        await getProfileCompletion()

      if (!response.profile_completed) {

        await resetOnboarding()

        setOnboardingCompleted(false)

        throw new Error(
          "Profile is not complete yet."
        )
      }

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

    } catch (error) {

      console.log(
        "logout error",
        error
      )

      if (isAuthExpiredError(error)) {

        await clearLocalAuthState()

        return
      }

      throw error
    }
  }

  const clearLocalAuthState = async () => {

    await removeToken()

    await resetOnboarding()

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
