import {
  ActivityIndicator,
  AppState,
  Pressable,
  StyleSheet,
  Text,
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
    authStatusMessage,
    clearAuthStatusMessage,
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

  useEffect(() => {

    if (!authStatusMessage) {
      return
    }

    const timeout =
      setTimeout(
        clearAuthStatusMessage,
        6500
      )

    return () => {
      clearTimeout(timeout)
    }
  }, [
    authStatusMessage,
    clearAuthStatusMessage,
  ])

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
    <View style={styles.appRoot}>
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

      {authStatusMessage ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Dismiss account status"
          onPress={clearAuthStatusMessage}
          style={[
            styles.statusToast,
            authStatusMessage.tone === "success"
              ? styles.statusToastSuccess
              : styles.statusToastInfo,
          ]}
        >
          <Text style={styles.statusTitle}>
            {authStatusMessage.title}
          </Text>

          <Text style={styles.statusMessage}>
            {authStatusMessage.message}
          </Text>
        </Pressable>
      ) : null}
    </View>
  )
}

const styles = StyleSheet.create({
  appRoot: {
    flex: 1,
    backgroundColor: design.colors.paper,
  },

  loading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: design.colors.paper,
  },

  statusToast: {
    position: "absolute",
    left: 18,
    right: 18,
    bottom: 28,
    borderRadius: design.radius.card,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
    shadowColor: "#000",
    shadowOpacity: 0.16,
    shadowRadius: 14,
    shadowOffset: {
      width: 0,
      height: 8,
    },
    elevation: 6,
  },

  statusToastSuccess: {
    backgroundColor: design.colors.greenDark,
    borderColor: design.colors.greenDark,
  },

  statusToastInfo: {
    backgroundColor: design.colors.ink,
    borderColor: design.colors.ink,
  },

  statusTitle: {
    color: "#FFFFFF",
    fontSize: 15,
    lineHeight: 20,
    fontWeight: "800",
    letterSpacing: 0,
  },

  statusMessage: {
    marginTop: 3,
    color: "rgba(255, 255, 255, 0.86)",
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "600",
    letterSpacing: 0,
  },
})
