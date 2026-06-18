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

  const handleContinue = async () => {

    if (!selectedHome) {
      Alert.alert(
        "Choose a home area",
        "Tap the map to choose your home area, or use your current location."
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

      Alert.alert(
        "Location unavailable",
        error instanceof Error
          ? error.message
          : "Could not save your home location."
      )

    } finally {

      setRequestingConsent(false)
    }
  }

  const handleSkip = async () => {

    try {

      setSaving(true)

      await submitProfile()

    } catch (error) {

      console.log(
        "submit onboarding without location error:",
        error
      )

      navigation.navigate(
        "Complete"
      )

    } finally {

      setSaving(false)
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

  return (
    <ScreenShell
      eyebrow="Step 5"
      title="Set your home area"
      subtitle="Choose anywhere in Japan from the map. Location Services are only needed if you use your device location."
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

      <View style={styles.secondaryButtonWrap}>
        <PrimaryButton
          title="Use current location"
          variant="outline"
          disabled={saving || requestingConsent}
          loading={requestingConsent}
          onPress={handleUseCurrentLocation}
        />
      </View>

      <View style={styles.secondaryButtonWrap}>
        <PrimaryButton
          title="Skip for now"
          variant="outline"
          disabled={saving || requestingConsent}
          onPress={handleSkip}
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
  secondaryButtonWrap: {
    marginTop: 12,
  },
  caption: {
    marginTop: 15,
    color: design.colors.faint,
    fontSize: 13,
    textAlign: "center",
  },
})
