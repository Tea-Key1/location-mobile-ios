// src/navigation/MainTabs.tsx

import {
  useCallback,
  useEffect,
  useState,
} from "react"

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

import {
  getMyProfile,
} from "../api/profile"

import {
  hasUsableHomeLocation,
} from "../utils/apiErrors"

import {
  getLastHomeUpdateDate,
  saveLastHomeUpdateDate,
} from "../store/homeLocationUpdateStorage"

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

  const [
    hasHomeLocation,
    setHasHomeLocation,
  ] = useState(false)

  const [
    lastHomeUpdateDate,
    setLastHomeUpdateDate,
  ] = useState<string | null>(null)

  const [
    homeStatusLoaded,
    setHomeStatusLoaded,
  ] = useState(false)

  const todayKey =
    getTodayKey()

  const canUpdateHomeToday =
    homeStatusLoaded &&
    lastHomeUpdateDate !== todayKey

  const refreshHomeStatus =
    useCallback(async () => {

      try {

        setHomeStatusLoaded(false)

        const profile =
          await getMyProfile()

        const usableHome =
          hasUsableHomeLocation(profile)

        setHasHomeLocation(usableHome)

        const nextHomeCoordinate =
          usableHome
            ? {
              lat:
                profile.home_lat,
              lng:
                profile.home_lng,
            }
            : null

        const storedDate =
          await getLastHomeUpdateDate(
            nextHomeCoordinate?.lat,
            nextHomeCoordinate?.lng
          )

        setLastHomeUpdateDate(storedDate)
        setHomeStatusLoaded(true)

      } catch (error) {

        setHasHomeLocation(false)
        setLastHomeUpdateDate(null)
        setHomeStatusLoaded(true)

        console.log(
          "refresh home status error:",
          error
        )
      }
    }, [])

  useEffect(() => {
    void refreshHomeStatus()
  }, [refreshHomeStatus])

  const handleHomeLocationUpdated =
    useCallback(async (
      coordinate: {
        lat: number
        lng: number
      }
    ) => {

      await saveLastHomeUpdateDate(
        todayKey,
        coordinate.lat,
        coordinate.lng
      )

      setLastHomeUpdateDate(todayKey)
      setHasHomeLocation(true)
      setHomeStatusLoaded(true)
    }, [todayKey])

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
          // Rankings / Settings
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
      >
        {() => (
          <HomeScreen
            hasHomeLocation={
              hasHomeLocation
            }
            homeStatusLoaded={
              homeStatusLoaded
            }
            canUpdateHomeToday={
              canUpdateHomeToday
            }
            onHomeLocationUpdated={
              handleHomeLocationUpdated
            }
          />
        )}
      </Tab.Screen>

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

function getTodayKey(): string {

  const date =
    new Date()

  const year =
    date.getFullYear()

  const month =
    String(date.getMonth() + 1)
      .padStart(2, "0")

  const day =
    String(date.getDate())
      .padStart(2, "0")

  return `${year}-${month}-${day}`
}
