import {
  useEffect,
  useRef,
  useState,
} from "react"

import {
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

import ScreenShell
from "../../components/common/ScreenShell"

import {
  requestCommercialTrackingConsent,
} from "../../utils/trackingConsent"

import {
  requestLocationPermission,
} from "../../utils/location"

import {
  design,
} from "../../styles/design"

export default function TrackingConsentScreen() {

  const navigation = useNavigation<any>()

  const route = useRoute<any>()

  const allowNavigationRef =
    useRef(false)

  const [
    requesting,
    setRequesting,
  ] = useState(false)

  const goNext = () => {

    allowNavigationRef.current = true

    navigation.replace(
      "HomeLocation",
      route.params
    )
  }

  const handleContinue = async () => {

    try {

      setRequesting(true)

      await requestCommercialTrackingConsent()

      try {
        await requestLocationPermission()
      } catch (error) {
        console.log(
          "request onboarding location permission error:",
          error
        )
      }

      goNext()

    } finally {

      setRequesting(false)
    }
  }

  useEffect(() => {

    const unsubscribe =
      navigation.addListener(
        "beforeRemove",
        (event: any) => {

          if (allowNavigationRef.current) {
            return
          }

          event.preventDefault()
        }
      )

    return unsubscribe
  }, [
    navigation,
  ])

  return (
    <ScreenShell
      eyebrow="Step 4"
      title="Permissions"
      subtitle="Roamie will ask for Apple tracking permission and location permission next."
      scroll
    >
      <View style={styles.panel}>
        <Text style={styles.panelTitle}>
          Apple tracking and location
        </Text>

        <Text style={styles.panelText}>
          Roamie uses your Apple ATT choice for partner mobility insights. Location permission lets you set Home with your device location and compare nearby places. You can still select areas manually if you do not allow location access.
        </Text>
      </View>

      <View style={styles.buttonWrap}>
        <PrimaryButton
          title="Continue"
          loading={requesting}
          disabled={requesting}
          onPress={handleContinue}
        />
      </View>
    </ScreenShell>
  )
}

const styles = StyleSheet.create({
  panel: {
    borderRadius: design.radius.card,
    borderWidth: 1,
    borderColor: design.colors.softLine,
    backgroundColor: design.colors.surface,
    padding: 18,
    ...design.shadow,
  },
  panelTitle: {
    color: design.colors.ink,
    fontSize: 18,
    fontWeight: "800",
  },
  panelText: {
    marginTop: 10,
    color: design.colors.muted,
    fontSize: 14,
    lineHeight: 21,
  },
  buttonWrap: {
    marginTop: 18,
  },
})
