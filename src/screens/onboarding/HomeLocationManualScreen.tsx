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

import Ionicons
from "@expo/vector-icons/Ionicons"

import {
  useNavigation,
  useRoute,
} from "@react-navigation/native"

import {
  SafeAreaView,
} from "react-native-safe-area-context"

import JapanMapPicker
from "../../components/common/JapanMapPicker"

import PrimaryButton
from "../../components/common/PrimaryButton"

import {
  Coordinate,
} from "../../types/location"

import {
  isJapanAdministrativeCoordinate,
} from "../../utils/location"

import {
  design,
} from "../../styles/design"

import {
  submitHomeLocationOnboarding,
} from "./homeLocationSubmission"

const INITIAL_CENTER: Coordinate = {
  lat: 36.2048,
  lng: 138.2529,
}

export default function HomeLocationManualScreen() {

  const navigation = useNavigation<any>()

  const route = useRoute<any>()

  const [
    saving,
    setSaving,
  ] = useState(false)

  const [
    centerHome,
    setCenterHome,
  ] = useState<Coordinate | null>(null)

  const handleContinue = async () => {

    try {

      setSaving(true)

      const coordinate =
        centerHome ?? INITIAL_CENTER

      const valid =
        await isJapanAdministrativeCoordinate(
          coordinate
        )

      if (!valid) {
        Alert.alert(
          "Choose an area in Japan",
          "Move the map so the center pin is on a land area in Japan, then try again."
        )

        return
      }

      await submitHomeLocationOnboarding(
        route.params,
        coordinate
      )

      navigation.navigate(
        "Complete"
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

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel="Back"
          activeOpacity={0.78}
          style={styles.backButton}
          onPress={() => {
            navigation.goBack()
          }}
        >
          <Ionicons
            name="chevron-back"
            size={24}
            color={design.colors.ink}
          />
        </TouchableOpacity>

        <View style={styles.headerCopy}>
          <Text style={styles.eyebrow}>
            Step 5
          </Text>

          <Text style={styles.title}>
            Select manually
          </Text>

          <Text style={styles.subtitle}>
            Move the map to place your home area under the center pin.
          </Text>
        </View>
      </View>

      <View style={styles.mapWrap}>
        <JapanMapPicker
          title="Japan map"
          value={centerHome ?? INITIAL_CENTER}
          markerTitle="Home area"
          helperText="Move the map and place the area you care about under the center pin."
          onCenterChange={setCenterHome}
          selectionMode="center"
          fullScreen
        />
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerHelp}>
          When the pin is centered on your home area, tap the button below.
        </Text>

        <PrimaryButton
          title="Select this area"
          loading={saving}
          disabled={saving}
          onPress={handleContinue}
        />
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: design.colors.paper,
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
    backgroundColor: design.colors.surface,
    borderWidth: 1,
    borderColor: design.colors.softLine,
  },
  headerCopy: {
    flex: 1,
    paddingTop: 1,
  },
  eyebrow: {
    color: design.colors.green,
    fontSize: 11,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  title: {
    color: design.colors.ink,
    fontSize: 25,
    lineHeight: 30,
    fontWeight: "800",
  },
  subtitle: {
    color: design.colors.muted,
    fontSize: 13,
    lineHeight: 18,
    marginTop: 4,
  },
  mapWrap: {
    flex: 1,
    minHeight: 300,
  },
  footer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderTopColor: design.colors.softLine,
    backgroundColor: design.colors.paper,
  },
  footerHelp: {
    color: design.colors.muted,
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 10,
    textAlign: "center",
  },
})
