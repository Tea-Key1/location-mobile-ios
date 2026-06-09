// src/navigation/MainTabs.tsx

import {
  createBottomTabNavigator
} from "@react-navigation/bottom-tabs"

import Ionicons
from "@expo/vector-icons/Ionicons"

import HomeScreen
from "../screens/home/HomeScreen"

import SettingsScreen
from "../screens/settings/SettingsScreen"

import {
  design,
} from "../styles/design"

type Props = {
  logout: () => Promise<void>
}

const Tab =
  createBottomTabNavigator()

export default function MainTabs({
  logout,
}: Props) {

  return (

    <Tab.Navigator

      screenOptions={({
        route
      }) => ({

        headerShown: false,

        tabBarActiveTintColor:
          design.colors.greenDark,

        tabBarInactiveTintColor:
          design.colors.faint,

        tabBarStyle: {

          height: 88,

          paddingBottom: 24,

          paddingTop: 10,

          backgroundColor:
            design.colors.surface,

          borderTopColor:
            design.colors.softLine,
        },

        tabBarLabelStyle: {

          fontSize: 12,

          fontWeight: "600",
        },

        tabBarIcon: ({
          color,
          size,
          focused,
        }) => {

          let iconName:
            keyof typeof
            Ionicons.glyphMap

          // =====================
          // Home
          // =====================

          if (
            route.name === "Home"
          ) {

            iconName = focused
              ? "home"
              : "home-outline"
          }

          // =====================
          // Settings
          // =====================

          else {

            iconName = focused
              ? "settings"
              : "settings-outline"
          }

          return (

            <Ionicons
              name={iconName}
              size={size}
              color={color}
            />
          )
        },
      })}
    >

      {/* Home */}

      <Tab.Screen
        name="Home"
        component={HomeScreen}
      />

      {/* Settings */}

      <Tab.Screen
        name="Settings"
      >
        {() => (

          <SettingsScreen
            logout={logout}
          />
        )}

      </Tab.Screen>

    </Tab.Navigator>
  )
}
