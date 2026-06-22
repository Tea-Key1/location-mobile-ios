import {
  useState,
} from "react"

import {
  Alert,
  StyleSheet,
  Text,
  View,
} from "react-native"

import {
  useNavigation,
  useRoute,
} from "@react-navigation/native"

import PrimaryButton
from "../../components/common/PrimaryButton"

import JapanMapPicker
from "../../components/common/JapanMapPicker"

import ScreenShell
from "../../components/common/ScreenShell"

import {
  submitOnboarding,
} from "../../api/onboarding"

import {
  getCurrentLocation,
  isJapanAdministrativeCoordinate,
} from "../../utils/location"

import {
  AgeRange,
  Gender,
} from "../../types/profile"

import {
  Coordinate,
} from "../../types/location"

import {
  design,
} from "../../styles/design"

export default function HomeLocationScreen() {

  const navigation = useNavigation<any>()

  const route = useRoute<any>()

  const [
    saving,
    setSaving,
  ] = useState(false)

  const [
    requestingConsent,
    setRequestingConsent,
  ] = useState(false)

  const [
    selectedHome,
    setSelectedHome,
  ] = useState<Coordinate | null>(null)

  const [
    showManualFallback,
    setShowManualFallback,
  ] = useState(false)

  const handleContinue = async () => {

    if (!selectedHome) {
      Alert.alert(
        "Choose a home area",
        "Tap the map to choose your home area."
      )

      return
    }

    try {

      setSaving(true)

      await submitProfile(
        selectedHome.lat,
        selectedHome.lng
      )

    } catch (error) {

      console.log(
        "submit selected home error:",
        error
      )

      Alert.alert(
        "Could not save home",
        error instanceof Error
          ? error.message
          : "Please try again."
      )

    } finally {

      setSaving(false)
    }
  }

  const handleUseCurrentLocation = async () => {

    try {

      setRequestingConsent(true)

      const currentLocation =
        await getCurrentLocation()

      const valid =
        await isJapanAdministrativeCoordinate(
          currentLocation.coordinate
        )

      if (!valid) {
        throw new Error(
          "Choose a location within Japan from the map."
        )
      }

      await submitProfile(
        currentLocation.coordinate.lat,
        currentLocation.coordinate.lng
      )

    } catch (error) {

      console.log(
        "submit current home error:",
        error
      )

      setShowManualFallback(true)

      Alert.alert(
        "Choose your home area",
        "Select your home area from the map to continue."
      )

    } finally {

      setRequestingConsent(false)
    }
  }

  const submitProfile = async (
    homeLat?: number,
    homeLng?: number
  ) => {

    const ageGroup =
      parseAgeGroup(
        route.params?.age_group
      )

    const gender =
      parseGender(
        route.params?.gender
      )

    if (!ageGroup || !gender) {
      throw new Error(
        "Onboarding information is incomplete."
      )
    }

    const homePayload =
      typeof homeLat === "number" &&
      typeof homeLng === "number"
        ? {
          home_lat:
            homeLat,

          home_lng:
            homeLng,
        }
        : {}

    await submitOnboarding({
      age_group:
        ageGroup,

      gender:
        gender,

      ...homePayload,

      calm:
        normalizeScore(
          route.params?.calm
        ),

      vivid:
        normalizeScore(
          route.params?.vivid
        ),

      roamer:
        normalizeScore(
          route.params?.roamer
        ),

      luxury:
        normalizeScore(
          route.params?.luxury
        ),

      nature:
        normalizeScore(
          route.params?.nature
        ),

      nightlife:
        normalizeScore(
          route.params?.nightlife
        ),

      local:
        normalizeScore(
          route.params?.local
        ),

      creative:
        normalizeScore(
          route.params?.creative
        ),
    })

    navigation.navigate(
      "Complete"
    )
  }

  if (!showManualFallback) {
    return (
      <ScreenShell
        eyebrow="Step 5"
        title="See your compatibility with nearby places"
        subtitle="Roamie uses your location to show nearby places and compare them with your saved home area."
      >
        <View style={styles.buttonWrap}>
          <PrimaryButton
            title="Continue"
            loading={requestingConsent}
            disabled={saving || requestingConsent}
            onPress={handleUseCurrentLocation}
          />
        </View>
      </ScreenShell>
    )
  }

  return (
    <ScreenShell
      eyebrow="Step 5"
      title="Set your home area"
      subtitle="Choose anywhere in Japan from the map."
      scroll
    >
      <JapanMapPicker
        title="Home area"
        value={selectedHome}
        markerTitle="Home area"
        onChange={setSelectedHome}
      />

      <View style={styles.buttonWrap}>
        <PrimaryButton
          title="Use selected area"
          loading={saving}
          disabled={!selectedHome || saving || requestingConsent}
          onPress={handleContinue}
        />
      </View>

      <Text style={styles.caption}>
        You can set or update this later from Home.
      </Text>
    </ScreenShell>
  )
}

function parseAgeGroup(
  value: unknown
): AgeRange | null {

  const values: AgeRange[] = [
    "10s",
    "20s",
    "30s",
    "40s",
    "50s",
    "60s",
    "70s+",
  ]

  return values.includes(
    value as AgeRange
  )
    ? value as AgeRange
    : null
}

function parseGender(
  value: unknown
): Gender | null {

  const values: Gender[] = [
    "male",
    "female",
    "other",
  ]

  return values.includes(
    value as Gender
  )
    ? value as Gender
    : null
}

function normalizeScore(
  value: unknown
): number {

  if (typeof value !== "number") {
    return 0
  }

  return Math.min(
    1,
    Math.max(
      0,
      value
    )
  )
}

const styles = StyleSheet.create({
  buttonWrap: {
    marginTop: 22,
  },
  caption: {
    marginTop: 15,
    color: design.colors.faint,
    fontSize: 13,
    textAlign: "center",
  },
})
