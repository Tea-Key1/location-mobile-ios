import {
  useState,
} from "react"

import {
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native"

import {
  useNavigation,
  useRoute,
} from "@react-navigation/native"

import Ionicons
from "@expo/vector-icons/Ionicons"

import PrimaryButton
from "../../components/common/PrimaryButton"

import ScreenShell
from "../../components/common/ScreenShell"

import {
  submitOnboarding,
} from "../../api/onboarding"

import {
  getCurrentLocation,
  requestLocationPermission,
} from "../../utils/location"

import {
  AgeRange,
  Gender,
} from "../../types/profile"

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
    consented,
    setConsented,
  ] = useState(false)

  const [
    requestingConsent,
    setRequestingConsent,
  ] = useState(false)

  const handleToggleConsent = async () => {

    if (saving || requestingConsent) {
      return
    }

    if (consented) {
      setConsented(false)

      return
    }

    try {

      setRequestingConsent(true)

      await requestLocationPermission()

      setConsented(true)

    } catch (error) {

      console.log(
        "location consent error:",
        error
      )

      setConsented(false)

      Alert.alert(
        "Location unavailable",
        error instanceof Error
          ? error.message
          : "Could not enable location access."
      )

    } finally {

      setRequestingConsent(false)
    }
  }

  const handleContinue = async () => {

    try {

      if (!consented) {

        Alert.alert(
          "Location consent required",
          "Please agree before using your current location."
        )

        return
      }

      setSaving(true)

      const currentLocation =
        await getCurrentLocation()

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

      const response =
        await submitOnboarding({
          age_group:
            ageGroup,

          gender:
            gender,

          home_lat:
            currentLocation.coordinate.lat,

          home_lng:
            currentLocation.coordinate.lng,

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

      if (!response.profile_completed) {
        throw new Error(
          "Profile was saved but is not complete yet."
        )
      }

      navigation.navigate(
        "Complete"
      )

    } catch (error) {

      console.log(
        "submit onboarding error:",
        error
      )

      Alert.alert(
        "Location unavailable",
        error instanceof Error
          ? error.message
          : "Could not save your home location."
      )

    } finally {

      setSaving(false)
    }
  }

  return (
    <ScreenShell
      eyebrow="Step 4"
      title="Set your home area"
      subtitle="Roamie compares nearby places against the feeling of home, not just distance."
    >
      <TouchableOpacity
        style={styles.consentRow}
        activeOpacity={0.8}
        disabled={saving || requestingConsent}
        onPress={handleToggleConsent}
      >
        <View
          style={[
            styles.checkbox,
            consented && styles.checkboxChecked,
          ]}
        >
          {consented ? (
            <Ionicons
              name="checkmark"
              size={17}
              color="#FFFFFF"
            />
          ) : null}
        </View>

        <Text style={styles.consentText}>
          Use my current location as my home area for matching.
        </Text>
      </TouchableOpacity>

      <View style={styles.buttonWrap}>
        <PrimaryButton
          title="Use current location"
          loading={saving || requestingConsent}
          disabled={!consented || saving || requestingConsent}
          onPress={handleContinue}
        />
      </View>

      <Text style={styles.caption}>
        You can update this later from Home.
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
  consentRow: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: design.radius.card,
    borderWidth: 1,
    borderColor: design.colors.softLine,
    backgroundColor: design.colors.surface,
    padding: 16,
    ...design.shadow,
  },
  checkbox: {
    width: 26,
    height: 26,
    borderRadius: 7,
    borderWidth: 1.5,
    borderColor: design.colors.greenDark,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  checkboxChecked: {
    backgroundColor: design.colors.greenDark,
  },
  consentText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 21,
    color: design.colors.ink,
  },
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
