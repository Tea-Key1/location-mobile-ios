import {
  StyleSheet,
  Text,
  View,
} from "react-native"

import AmbientMap
from "../../components/common/AmbientMap"

import PrimaryButton
from "../../components/common/PrimaryButton"

import {
  design,
} from "../../styles/design"

type Props = {
  completeOnboarding: () => Promise<void>
}

export default function CompleteScreen({
  completeOnboarding,
}: Props) {

  const handleContinue = async () => {

    try {

      await completeOnboarding()

    } catch (error) {

      console.log(
        "complete onboarding error:",
        error
      )
    }
  }

  return (
    <View style={styles.container}>
      <AmbientMap />

      <View style={styles.badge}>
        <View style={styles.badgeLine} />
        <Text style={styles.badgeText}>
          Profile ready
        </Text>
      </View>

      <Text style={styles.title}>
        Your map has a mood now.
      </Text>

      <Text style={styles.subtitle}>
        Roamie will use your home area and personality signal to compare places as you move.
      </Text>

      <View style={styles.buttonWrap}>
        <PrimaryButton
          title="Enter Roamie"
          onPress={handleContinue}
        />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: design.colors.paper,
    paddingHorizontal: 24,
  },
  badge: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    marginTop: 32,
    borderRadius: design.radius.pill,
    backgroundColor: design.colors.surface,
    borderWidth: 1,
    borderColor: design.colors.softLine,
    paddingHorizontal: 13,
    paddingVertical: 8,
  },
  badgeLine: {
    width: 20,
    height: 3,
    borderRadius: design.radius.pill,
    backgroundColor: design.colors.green,
    marginRight: 9,
  },
  badgeText: {
    color: design.colors.greenDark,
    fontSize: 12,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.7,
  },
  title: {
    marginTop: 18,
    color: design.colors.ink,
    fontSize: 36,
    lineHeight: 41,
    fontWeight: "800",
  },
  subtitle: {
    marginTop: 13,
    color: design.colors.muted,
    fontSize: 16,
    lineHeight: 24,
  },
  buttonWrap: {
    marginTop: 34,
  },
})
