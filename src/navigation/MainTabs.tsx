// src/navigation/MainTabs.tsx

import {
  createBottomTabNavigator
} from "@react-navigation/bottom-tabs"

import Ionicons
from "@expo/vector-icons/Ionicons"

import HomeScreen
from "../screens/home/HomeScreen"

import RankingsScreen
from "../screens/rankings/RankingsScreen"

import SettingsScreen
from "../screens/settings/SettingsScreen"

import {
  design,
} from "../styles/design"

type Props = {
  logout: () => Promise<void>
  deleteAccount: () => Promise<void>
}

const Tab =
  createBottomTabNavigator()

export default function MainTabs({
  logout,
  deleteAccount,
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

            if (
              route.name === "Rankings"
            ) {

              iconName = focused
                ? "trophy"
                : "trophy-outline"

            } else {

              iconName = focused
                ? "settings"
                : "settings-outline"
            }
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

      {/* Rankings */}

      <Tab.Screen
        name="Rankings"
        component={RankingsScreen}
      />

      {/* Settings */}

      <Tab.Screen
        name="Settings"
      >
        {() => (

          <SettingsScreen
            logout={logout}
            deleteAccount={
              deleteAccount
            }
          />
        )}

      </Tab.Screen>

    </Tab.Navigator>
  )
}
