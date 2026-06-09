// src/navigation/RootNavigator.tsx

import {
  NavigationContainer
}
from "@react-navigation/native"

import {
  createNativeStackNavigator
}
from "@react-navigation/native-stack"

import AuthNavigator
from "./AuthNavigator"

import OnboardingNavigator
from "./OnboardingNavigator"

import MainTabs
from "./MainTabs"

const Stack =
  createNativeStackNavigator()

type Props = {
  isLoggedIn: boolean
  onboardingCompleted: boolean
  loginWithApple: (
    identityToken: string
  ) => Promise<void>
  completeOnboarding: () => Promise<void>
  logout: () => Promise<void>
}

export default function RootNavigator({
  isLoggedIn,
  onboardingCompleted,
  loginWithApple,
  completeOnboarding,
  logout,
}: Props) {

  return (

    <NavigationContainer>

      <Stack.Navigator
        screenOptions={{
          headerShown: false
        }}
      >

        {!isLoggedIn ? (

          <Stack.Screen
            name="Auth"
          >
            {() => (
              <AuthNavigator
                loginWithApple={
                  loginWithApple
                }
              />
            )}
          </Stack.Screen>

        ) : !onboardingCompleted ? (

          <Stack.Screen
            name="Onboarding"
          >
            {() => (
              <OnboardingNavigator
                completeOnboarding={
                  completeOnboarding
                }
              />
            )}
          </Stack.Screen>

        ) : (

          <Stack.Screen
            name="MainTabs"
          >
            {() => (
              <MainTabs
                logout={logout}
              />
            )}
          </Stack.Screen>

        )}

      </Stack.Navigator>

    </NavigationContainer>
  )
}
