// src/navigation/AuthNavigator.tsx

import {
  createNativeStackNavigator
} from "@react-navigation/native-stack"

import LoginScreen
from "../screens/auth/LoginScreen"

const Stack =
  createNativeStackNavigator()

type Props = {
  loginWithApple: (
    identityToken: string
  ) => Promise<void>
}

export default function AuthNavigator({
  loginWithApple,
}: Props) {

  return (

    <Stack.Navigator>

      <Stack.Screen

        name="Login"

        options={{
          headerShown: false,
        }}
      >

        {() => (

          <LoginScreen
            loginWithApple={
              loginWithApple
            }
          />
        )}

      </Stack.Screen>

    </Stack.Navigator>
  )
}