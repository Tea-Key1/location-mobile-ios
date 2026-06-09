// src/screens/home/HomeScreen.tsx

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
  SafeAreaView,
} from "react-native-safe-area-context"

import AmbientMap
from "../../components/common/AmbientMap"

import PrimaryButton
from "../../components/common/PrimaryButton"

import {
  getSimilarity,
  SimilarityResponse,
} from "../../api/location"

import {
  getMyProfile,
  updateHomeLocation,
} from "../../api/profile"

import {
  recordCurrentLocation,
} from "../../services/locationHistory"

import {
  getCurrentLocation,
} from "../../utils/location"

import {
  similarityLabel,
} from "../../utils/similarity"

import {
  design,
} from "../../styles/design"

export default function HomeScreen() {

  const [
    loading,
    setLoading,
  ] = useState(false)

  const [
    result,
    setResult,
  ] = useState<SimilarityResponse | null>(
    null
  )

  const [
    savingHome,
    setSavingHome,
  ] = useState(false)

  const handleCheckSimilarity = async () => {

    try {

      setLoading(true)

      const profile =
        await getMyProfile()

      const currentLocation =
        await getCurrentLocation()

      await recordCurrentLocation(
        currentLocation
      )

      const similarity =
        await getSimilarity({
          home_lat:
            profile.home_lat,

          home_lng:
            profile.home_lng,

          current_lat:
            currentLocation.coordinate.lat,

          current_lng:
            currentLocation.coordinate.lng,
        })

      setResult(similarity)

    } catch (error) {

      console.log(
        "check similarity error:",
        error
      )

      Alert.alert(
        "Could not check similarity",
        error instanceof Error
          ? error.message
          : "Please try again."
      )

    } finally {

      setLoading(false)
    }
  }

  const handleUpdateHomeLocation = async () => {

    try {

      setSavingHome(true)

      const currentLocation =
        await getCurrentLocation()

      await recordCurrentLocation(
        currentLocation
      )

      await updateHomeLocation({
        home_lat:
          currentLocation.coordinate.lat,

        home_lng:
          currentLocation.coordinate.lng,
      })

      setResult(null)

      Alert.alert(
        "Home location updated",
        "Your current location has been saved as your home area."
      )

    } catch (error) {

      console.log(
        "update home location error:",
        error
      )

      Alert.alert(
        "Could not update home",
        error instanceof Error
          ? error.message
          : "Please try again."
      )

    } finally {

      setSavingHome(false)
    }
  }

  const score =
    result
      ? Math.round(result.similarity * 100)
      : null

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.kicker}>
            Today
          </Text>

          <Text style={styles.title}>
            Find the nearby feeling.
          </Text>
        </View>

        <AmbientMap compact />

        <View style={styles.resultCard}>
          <View style={styles.scoreRow}>
            <View>
              <Text style={styles.scoreLabel}>
                Similarity
              </Text>

              <Text style={styles.score}>
                {score === null
                  ? "--"
                  : `${score}%`}
              </Text>
            </View>

            <View style={styles.meter}>
              <View
                style={[
                  styles.meterFill,
                  {
                    height:
                      score === null
                        ? "18%"
                        : `${Math.max(
                          12,
                          score
                        )}%`,
                  },
                ]}
              />
            </View>
          </View>

          <Text style={styles.label}>
            {result
              ? similarityLabel(result.similarity)
              : "Compare your current spot with the profile of home."}
          </Text>

          {result ? (
            <View style={styles.areaList}>
              <AreaLine
                title="Home"
                value={formatArea(result.home_area)}
              />

              <AreaLine
                title="Here"
                value={formatArea(result.current_area)}
              />
            </View>
          ) : null}
        </View>

        <View style={styles.actions}>
          <PrimaryButton
            title="Check current similarity"
            loading={loading}
            disabled={loading || savingHome}
            onPress={handleCheckSimilarity}
          />

          <PrimaryButton
            title="Set here as Home"
            variant="outline"
            loading={savingHome}
            disabled={loading || savingHome}
            onPress={handleUpdateHomeLocation}
          />
        </View>
      </View>
    </SafeAreaView>
  )
}

function AreaLine({
  title,
  value,
}: {
  title: string
  value: string
}) {

  return (
    <View style={styles.areaLine}>
      <Text style={styles.areaTitle}>
        {title}
      </Text>

      <Text style={styles.areaValue}>
        {value}
      </Text>
    </View>
  )
}

function formatArea(
  area: SimilarityResponse["home_area"]
): string {

  const values = [
    area.prefecture,
    area.city,
    area.district,
  ].filter(Boolean)

  return values.length > 0
    ? values.join(" ")
    : "Unknown"
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: design.colors.paper,
  },
  container: {
    flex: 1,
    paddingHorizontal: 22,
    paddingTop: 12,
    paddingBottom: 28,
    backgroundColor: design.colors.paper,
  },
  header: {
    marginBottom: 20,
  },
  kicker: {
    color: design.colors.green,
    fontSize: 12,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  title: {
    color: design.colors.ink,
    fontSize: 34,
    lineHeight: 39,
    fontWeight: "800",
  },
  resultCard: {
    marginTop: 18,
    borderRadius: design.radius.card,
    backgroundColor: design.colors.surface,
    borderWidth: 1,
    borderColor: design.colors.softLine,
    padding: 18,
    ...design.shadow,
  },
  scoreRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  scoreLabel: {
    color: design.colors.muted,
    fontSize: 13,
    fontWeight: "700",
  },
  score: {
    marginTop: 4,
    color: design.colors.ink,
    fontSize: 54,
    lineHeight: 60,
    fontWeight: "800",
  },
  meter: {
    width: 18,
    height: 84,
    borderRadius: design.radius.pill,
    backgroundColor: design.colors.softLine,
    justifyContent: "flex-end",
    overflow: "hidden",
  },
  meterFill: {
    width: "100%",
    borderRadius: design.radius.pill,
    backgroundColor: design.colors.pink,
  },
  label: {
    marginTop: 12,
    color: design.colors.muted,
    fontSize: 15,
    lineHeight: 22,
  },
  areaList: {
    marginTop: 16,
    borderTopWidth: 1,
    borderTopColor: design.colors.softLine,
    paddingTop: 10,
  },
  areaLine: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 7,
  },
  areaTitle: {
    color: design.colors.faint,
    fontSize: 13,
    fontWeight: "800",
  },
  areaValue: {
    flex: 1,
    color: design.colors.ink,
    fontSize: 14,
    textAlign: "right",
    marginLeft: 18,
  },
  actions: {
    gap: 12,
    marginTop: 18,
  },
})
