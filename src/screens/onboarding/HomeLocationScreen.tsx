import {
  useCallback,
  useState,
} from "react"

import {
  Alert,
  StyleSheet,
  Text,
  View,
} from "react-native"

import {
  useFocusEffect,
  useNavigation,
  useRoute,
} from "@react-navigation/native"

import PrimaryButton
from "../../components/common/PrimaryButton"

import ScreenShell
from "../../components/common/ScreenShell"

import {
  getCurrentLocation,
  hasForegroundLocationPermission,
  isJapanAdministrativeCoordinate,
} from "../../utils/location"

import {
  design,
} from "../../styles/design"

import ChoiceCard
from "../../components/common/ChoiceCard"

import {
  submitHomeLocationOnboarding,
} from "./homeLocationSubmission"

export default function HomeLocationScreen() {

  const navigation = useNavigation<any>()

  const route = useRoute<any>()

  const [
    saving,
    setSaving,
  ] = useState(false)

  const [
    hasLocationPermission,
    setHasLocationPermission,
  ] = useState(false)

  useFocusEffect(
    useCallback(() => {
      let active = true

      hasForegroundLocationPermission()
        .then((permitted) => {
          if (active) {
            setHasLocationPermission(
              permitted
            )
          }
        })
        .catch((error) => {
          console.log(
            "check location permission error:",
            error
          )

          if (active) {
            setHasLocationPermission(false)
          }
        })

      return () => {
        active = false
      }
    }, [])
  )

  const handleUseCurrentLocation = async () => {

    try {

      setSaving(true)

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

      await submitHomeLocationOnboarding(
        route.params,
        currentLocation.coordinate
      )

      navigation.navigate(
        "Complete"
      )

    } catch (error) {

      console.log(
        "submit current home error:",
        error
      )

      Alert.alert(
        "Choose your home area",
        "Select your home area from the map to continue."
      )

      navigation.navigate(
        "HomeLocationManual",
        route.params
      )

    } finally {

      setSaving(false)
    }
  }

  const handleSelectManually = () => {
    navigation.navigate(
      "HomeLocationManual",
      route.params
    )
  }

  return (
    <ScreenShell
      eyebrow="Step 5"
      title="Set your home area"
      subtitle="Choose your home area so Roamie can compare nearby places with the area that matters to you."
    >
      {hasLocationPermission ? (
        <View style={styles.buttonWrap}>
          <PrimaryButton
            title="Use device location"
            loading={saving}
            disabled={saving}
            onPress={handleUseCurrentLocation}
          />
        </View>
      ) : null}

      <View style={styles.options}>
        <ChoiceCard
          title="Select manually"
          detail="Open the Japan map, center your home area under the pin, and select it."
          tone="blue"
          onPress={handleSelectManually}
        />
      </View>

      <Text style={styles.caption}>
        You can set or update this later from Home.
      </Text>
    </ScreenShell>
  )
}

const styles = StyleSheet.create({
  options: {
    marginTop: 12,
  },
  buttonWrap: {
    marginTop: 2,
  },
  caption: {
    marginTop: 15,
    color: design.colors.faint,
    fontSize: 13,
    lineHeight: 18,
    textAlign: "center",
  },
})
