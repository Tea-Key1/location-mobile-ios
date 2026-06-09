// src/navigation/OnboardingNavigator.tsx

import {
  createNativeStackNavigator
} from "@react-navigation/native-stack"

import WelcomeScreen
from "../screens/onboarding/WelcomeScreen"

import AgeScreen
from "../screens/onboarding/AgeScreen"

import GenderScreen
from "../screens/onboarding/GenderScreen"

import PersonalityScreen
from "../screens/onboarding/PersonalityScreen"

import HomeLocationScreen
from "../screens/onboarding/HomeLocationScreen"

import CompleteScreen
from "../screens/onboarding/CompleteScreen"

const Stack =
  createNativeStackNavigator()

type Props = {
  completeOnboarding: () => Promise<void>
}

export default function OnboardingNavigator({
  completeOnboarding,
}: Props) {

  return (

    <Stack.Navigator

      screenOptions={{
        headerShown: false,
      }}
    >

      <Stack.Screen
        name="Welcome"
        component={WelcomeScreen}
      />

      <Stack.Screen
        name="Age"
        component={AgeScreen}
      />

      <Stack.Screen
        name="Gender"
        component={GenderScreen}
      />

      <Stack.Screen
        name="Personality"
        component={
          PersonalityScreen
        }
      />

      <Stack.Screen
        name="HomeLocation"
        component={
          HomeLocationScreen
        }
      />

      <Stack.Screen
        name="Complete"
      >
        {() => (
          <CompleteScreen
            completeOnboarding={
              completeOnboarding
            }
          />
        )}
      </Stack.Screen>

    </Stack.Navigator>
  )
}
