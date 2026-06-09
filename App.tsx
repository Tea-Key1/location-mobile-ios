import {
  ActivityIndicator,
  StyleSheet,
  View,
} from "react-native"

import RootNavigator from "./src/navigation/RootNavigator"

import {
  useAuth,
} from "./src/hooks/useAuth"

import {
  design,
} from "./src/styles/design"

export default function App() {

  const {
    loading,
    isAuthenticated,
    onboardingCompleted,
    loginWithApple,
    completeOnboarding,
    logout,
  } = useAuth()

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
