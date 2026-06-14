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

import ScreenShell
from "../../components/common/ScreenShell"

import {
  requestCommercialTrackingConsent,
  syncCurrentTrackingConsent,
} from "../../utils/trackingConsent"

import {
  design,
} from "../../styles/design"

export default function TrackingConsentScreen() {

  const navigation = useNavigation<any>()

  const route = useRoute<any>()

  const [
    requesting,
    setRequesting,
  ] = useState(false)

  const goNext = () => {

    navigation.navigate(
      "HomeLocation",
      route.params
    )
  }

  const handleAskPermission = async () => {

    try {

      setRequesting(true)

      const status =
        await requestCommercialTrackingConsent()

      if (status !== "authorized") {

        Alert.alert(
          "Data sharing not enabled",
          "Roamie will not use your location or profile data for partner mobility insights unless tracking permission is allowed in iOS Settings."
        )
      }

      goNext()

    } finally {

      setRequesting(false)
    }
  }

  const handleSkip = async () => {

    await syncCurrentTrackingConsent()

    goNext()
  }

  return (
    <ScreenShell
      eyebrow="Step 4"
      title="Choose data sharing"
      subtitle="This is optional. Your answer will not block the main Roamie experience."
      scroll
    >
      <View style={styles.panel}>
        <Text style={styles.panelTitle}>
          Partner mobility insights
        </Text>

        <Text style={styles.panelText}>
          If you allow tracking, Roamie may use your user ID, home area, location history, and travel mood to create and share mobility insights with partners, including data brokers.
        </Text>

        <Text style={styles.panelText}>
          If you decline, Roamie can still save your home area and compare nearby places for app functionality, but your data will not be used for partner mobility insight sharing.
        </Text>
      </View>

      <View style={styles.buttonWrap}>
        <PrimaryButton
          title="Ask permission"
          loading={requesting}
          disabled={requesting}
          onPress={handleAskPermission}
        />
      </View>

      <View style={styles.secondaryButtonWrap}>
        <PrimaryButton
          title="Continue without sharing"
          variant="outline"
          disabled={requesting}
          onPress={handleSkip}
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
  secondaryButtonWrap: {
    marginTop: 12,
  },
})
