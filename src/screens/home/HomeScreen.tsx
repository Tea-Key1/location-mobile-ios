// src/screens/home/HomeScreen.tsx

import {
  useRef,
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
  ApiError,
} from "../../api/client"

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
  formatSimilarityError,
  hasUsableHomeLocation,
} from "../../utils/apiErrors"

import {
  similarityLabel,
} from "../../utils/similarity"

import {
  design,
} from "../../styles/design"

const SIMILARITY_CACHE_MS =
  5 * 60 * 1000

const RATE_LIMIT_COOLDOWN_MS =
  10 * 60 * 1000

type CachedSimilarity = {
  homeLat: number
  homeLng: number
  currentLat: number
  currentLng: number
  checkedAt: number
  result: SimilarityResponse
}

type SimilarityFallbackInput = {
  homeLat: number
  homeLng: number
  currentLat: number
  currentLng: number
}

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

  const [
    retryAt,
    setRetryAt,
  ] = useState<number | null>(null)

  const cacheRef =
    useRef<CachedSimilarity | null>(null)

  const handleCheckSimilarity = async () => {

    const now = Date.now()
    let fallbackInput: SimilarityFallbackInput | null =
      null

    if (
      retryAt &&
      retryAt > now
    ) {
      Alert.alert(
        "Could not check similarity",
        cooldownMessage(retryAt)
      )

      return
    }

    try {

      setLoading(true)

      const profile =
        await getMyProfile()

      if (!hasUsableHomeLocation(profile)) {
        throw new Error(
          "Set your home location first."
        )
      }

      const currentLocation =
        await getCurrentLocation()

      fallbackInput = {
        homeLat:
          profile.home_lat,
        homeLng:
          profile.home_lng,
        currentLat:
          currentLocation.coordinate.lat,
        currentLng:
          currentLocation.coordinate.lng,
      }

      const cached =
        getCachedSimilarity(
          cacheRef.current,
          fallbackInput.homeLat,
          fallbackInput.homeLng,
          fallbackInput.currentLat,
          fallbackInput.currentLng
        )

      if (cached) {
        setResult(cached)
        setLoading(false)
        return
      }

      const similarity =
        await getSimilarity({
          home_lat:
            fallbackInput.homeLat,

          home_lng:
            fallbackInput.homeLng,

          current_lat:
            fallbackInput.currentLat,

          current_lng:
            fallbackInput.currentLng,
        })

      cacheRef.current = {
        homeLat:
          fallbackInput.homeLat,
        homeLng:
          fallbackInput.homeLng,
        currentLat:
          fallbackInput.currentLat,
        currentLng:
          fallbackInput.currentLng,
        checkedAt:
          Date.now(),
        result:
          similarity,
      }

      setResult(similarity)

      void recordCurrentLocation(
        currentLocation
      )

    } catch (error) {

      console.log(
        "check similarity error:",
        error
      )

      if (
        error instanceof ApiError &&
        error.status === 429
      ) {
        if (fallbackInput) {
          const fallbackResult =
            buildFallbackSimilarity(
              fallbackInput
            )

          cacheRef.current = {
            ...fallbackInput,
            checkedAt:
              Date.now(),
            result:
              fallbackResult,
          }

          setResult(fallbackResult)
        }

        setRetryAt(
          Date.now() + RATE_LIMIT_COOLDOWN_MS
        )
      }

      Alert.alert(
        "Could not check similarity",
        error instanceof ApiError &&
          error.status === 429
          ? fallbackInput
            ? "Area lookup is rate limited, so Roamie is showing a local estimate. Try again later to save this check."
            : "Roamie is rate limited right now. Try again in about 10 minutes."
          : formatSimilarityError(error)
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

      void recordCurrentLocation(
        currentLocation
      )

      setResult(null)
      cacheRef.current = null
      setRetryAt(null)

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

  const checkDisabled =
    loading ||
    savingHome

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
          {retryAt &&
            retryAt > Date.now() ? (
              <Text style={styles.cooldown}>
                {cooldownMessage(retryAt)}
              </Text>
            ) : null}

          <PrimaryButton
            title="Check current similarity"
            loading={loading}
            disabled={checkDisabled}
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

function getCachedSimilarity(
  cached: CachedSimilarity | null,
  homeLat: number,
  homeLng: number,
  currentLat: number,
  currentLng: number
): SimilarityResponse | null {

  if (!cached) {
    return null
  }

  const fresh =
    Date.now() - cached.checkedAt <
    SIMILARITY_CACHE_MS

  if (!fresh) {
    return null
  }

  const sameHome =
    coordinatesAreClose(
      cached.homeLat,
      homeLat
    ) &&
    coordinatesAreClose(
      cached.homeLng,
      homeLng
    )

  const sameCurrent =
    coordinatesAreClose(
      cached.currentLat,
      currentLat
    ) &&
    coordinatesAreClose(
      cached.currentLng,
      currentLng
    )

  return sameHome && sameCurrent
    ? cached.result
    : null
}

function coordinatesAreClose(
  first: number,
  second: number
): boolean {

  return Math.abs(first - second) < 0.0008
}

function cooldownMessage(
  retryAt: number
): string {

  const remainingMs =
    Math.max(
      0,
      retryAt - Date.now()
    )

  const minutes =
    Math.max(
      1,
      Math.ceil(remainingMs / 60000)
    )

  return `Roamie is rate limited. Try again in about ${minutes} min.`
}

function buildFallbackSimilarity(
  input: SimilarityFallbackInput
): SimilarityResponse {

  const distanceKm =
    haversineKm(
      input.homeLat,
      input.homeLng,
      input.currentLat,
      input.currentLng
    )

  const similarity =
    Math.max(
      0,
      Math.min(
        1,
        Math.exp(-distanceKm / 18)
      )
    )

  return {
    similarity,
    home_area: {},
    current_area: {},
  }
}

function haversineKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {

  const earthRadiusKm =
    6371

  const dLat =
    toRadians(lat2 - lat1)

  const dLng =
    toRadians(lng2 - lng1)

  const firstLat =
    toRadians(lat1)

  const secondLat =
    toRadians(lat2)

  const value =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(firstLat) *
      Math.cos(secondLat) *
      Math.sin(dLng / 2) ** 2

  return earthRadiusKm *
    2 *
    Math.atan2(
      Math.sqrt(value),
      Math.sqrt(1 - value)
    )
}

function toRadians(
  value: number
): number {

  return value * Math.PI / 180
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
  cooldown: {
    color: design.colors.muted,
    fontSize: 13,
    lineHeight: 19,
    textAlign: "center",
  },
})
