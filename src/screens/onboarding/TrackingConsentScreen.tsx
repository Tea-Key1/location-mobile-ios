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
      title="Partner mobility insights"
      subtitle="Roamie will show Apple's App Tracking Transparency request next."
      scroll
    >
      <View style={styles.panel}>
        <Text style={styles.panelTitle}>
          Apple tracking permission
        </Text>

        <Text style={styles.panelText}>
          Roamie uses your Apple ATT choice to decide whether your user ID, home area, location history, and travel mood may be used for partner mobility insights, including sharing with data brokers.
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
