import {
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

  const handleContinue = async () => {

    try {

      setRequesting(true)

      await requestCommercialTrackingConsent()

      goNext()

    } finally {

      setRequesting(false)
    }
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
