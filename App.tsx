import {
  ActivityIndicator,
  AppState,
  StyleSheet,
  View,
} from "react-native"

import {
  useEffect,
} from "react"

import RootNavigator from "./src/navigation/RootNavigator"

import {
  useAuth,
} from "./src/hooks/useAuth"

import {
  design,
} from "./src/styles/design"

import {
  syncCurrentTrackingConsent,
} from "./src/utils/trackingConsent"

export default function App() {

  const {
    loading,
    isAuthenticated,
    onboardingCompleted,
    loginWithApple,
    completeOnboarding,
    logout,
    deleteAccount,
  } = useAuth()

  useEffect(() => {

    if (!isAuthenticated) {
      return
    }

    const subscription =
      AppState.addEventListener(
        "change",
        (state) => {

          if (state === "active") {
            syncCurrentTrackingConsent()
          }
        }
      )

    return () => {
      subscription.remove()
    }
  }, [isAuthenticated])

  // ==========================================
  // loading
  // ==========================================

  if (loading) {

    return (

      <View
        style={styles.loading}
      >

        <ActivityIndicator
          size="large"
          color={design.colors.greenDark}
        />

      </View>
    )
  }

  // ==========================================
  // app
  // ==========================================

  return (
    <RootNavigator
      isLoggedIn={isAuthenticated}
      onboardingCompleted={
        onboardingCompleted
      }
      loginWithApple={
        loginWithApple
      }
      completeOnboarding={
        completeOnboarding
      }
      logout={logout}
      deleteAccount={deleteAccount}
    />
  )
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: design.colors.paper,
  },
})
