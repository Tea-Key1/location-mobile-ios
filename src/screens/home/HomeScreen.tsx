// src/screens/home/HomeScreen.tsx

import {
  useEffect,
  useRef,
  useState,
} from "react"

import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native"

import {
  SafeAreaView,
} from "react-native-safe-area-context"

import PrimaryButton
from "../../components/common/PrimaryButton"

import JapanMapPicker
from "../../components/common/JapanMapPicker"

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
  isJapanAdministrativeCoordinate,
  reverseGeocode,
} from "../../utils/location"

import {
  Coordinate,
  CurrentLocation,
} from "../../types/location"

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
  3 * 60 * 1000

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

type Props = {
  hasHomeLocation: boolean
  homeStatusLoaded: boolean
  canUpdateHomeToday: boolean
  onHomeLocationUpdated: (
    coordinate: Coordinate
  ) => Promise<void>
}

export default function HomeScreen({
  hasHomeLocation,
  homeStatusLoaded,
  canUpdateHomeToday,
  onHomeLocationUpdated,
}: Props) {

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
    retryAt,
    setRetryAt,
  ] = useState<number | null>(null)

  const [
    lastPlace,
    setLastPlace,
  ] = useState<Coordinate | null>(null)

  const [
    lastPlaceArea,
    setLastPlaceArea,
  ] = useState<SimilarityResponse["current_area"] | null>(
    null
  )

  const [
    manualHomePlace,
    setManualHomePlace,
  ] = useState<Coordinate | null>(null)

  const [
    manualCurrentPlace,
    setManualCurrentPlace,
  ] = useState<Coordinate | null>(null)

  const [
    homePickerVisible,
    setHomePickerVisible,
  ] = useState(!hasHomeLocation)

  const [
    currentPickerVisible,
    setCurrentPickerVisible,
  ] = useState(false)

  const [
    savingHome,
    setSavingHome,
  ] = useState(false)

  const cacheRef =
    useRef<CachedSimilarity | null>(null)

  const homeUpdateLocked =
    !homeStatusLoaded ||
    (
      hasHomeLocation &&
      !canUpdateHomeToday
    )

  useEffect(() => {

    if (hasHomeLocation) {
      setHomePickerVisible(false)
    }
  }, [hasHomeLocation])

  const handleCheckDeviceLocation = async () => {

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
          "Set your home location on Home first."
        )
      }

      const currentLocation =
        await getCurrentLocation()

      const valid =
        await isJapanAdministrativeCoordinate(
          currentLocation.coordinate
        )

      if (!valid) {
        throw new Error(
          "Choose a place in Japan manually."
        )
      }

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

      await submitSimilarity(
        fallbackInput,
        {
          source:
            "device",
          currentLocation,
        }
      )

      setLastPlace(
        currentLocation.coordinate
      )

    } catch (error) {

      console.log(
        "check device similarity error:",
        error
      )

      if (
        error instanceof ApiError &&
        error.status === 429
      ) {
        if (fallbackInput) {
          const fallbackResult =
            await buildFallbackSimilarity(
              fallbackInput
            )

          setLastPlaceArea(
            fallbackResult.current_area
          )

          setLastPlace({
            lat:
              fallbackInput.currentLat,
            lng:
              fallbackInput.currentLng,
          })

          cacheRef.current = {
            ...fallbackInput,
            checkedAt:
              Date.now(),
            result:
              fallbackResult,
          }

          setResult(fallbackResult)

          setRetryAt(
            getRateLimitRetryAt(error)
          )

          return
        }

        setRetryAt(
          getRateLimitRetryAt(error)
        )
      }

      Alert.alert(
        "Could not check similarity",
        formatSimilarityError(error)
      )

    } finally {

      setLoading(false)
    }
  }

  const handleCheckManualLocation = async () => {

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

    if (!manualCurrentPlace) {
      Alert.alert(
        "Choose a place",
        "Tap the map to choose the area you want to compare with Home."
      )

      return
    }

    try {

      setLoading(true)

      const profile =
        await getMyProfile()

      if (!hasUsableHomeLocation(profile)) {
        throw new Error(
          "Set your home location on Home first."
        )
      }

      const valid =
        await isJapanAdministrativeCoordinate(
          manualCurrentPlace
        )

      if (!valid) {
        throw new Error(
          "Choose a land area in Japan."
        )
      }

      fallbackInput = {
        homeLat:
          profile.home_lat,
        homeLng:
          profile.home_lng,
        currentLat:
          manualCurrentPlace.lat,
        currentLng:
          manualCurrentPlace.lng,
      }

      await submitSimilarity(
        fallbackInput,
        {
          source:
            "manual",
        }
      )

      setLastPlace(
        manualCurrentPlace
      )

      setCurrentPickerVisible(false)

    } catch (error) {

      console.log(
        "check manual similarity error:",
        error
      )

      if (
        error instanceof ApiError &&
        error.status === 429
      ) {
        if (fallbackInput) {
          const fallbackResult =
            await buildFallbackSimilarity(
              fallbackInput
            )

          setLastPlaceArea(
            fallbackResult.current_area
          )

          setLastPlace({
            lat:
              fallbackInput.currentLat,
            lng:
              fallbackInput.currentLng,
          })

          cacheRef.current = {
            ...fallbackInput,
            checkedAt:
              Date.now(),
            result:
              fallbackResult,
          }

          setResult(fallbackResult)

          setRetryAt(
            getRateLimitRetryAt(error)
          )

          setCurrentPickerVisible(false)

          return
        }

        setRetryAt(
          getRateLimitRetryAt(error)
        )
      }

      Alert.alert(
        "Could not check similarity",
        formatSimilarityError(error)
      )

    } finally {

      setLoading(false)
    }
  }

  const handleSetHomeFromDevice = async () => {

    if (homeUpdateLocked) {
      showHomeUpdateLimitAlert()

      return
    }

    try {

      setSavingHome(true)

      const currentLocation =
        await getCurrentLocation()

      const valid =
        await isJapanAdministrativeCoordinate(
          currentLocation.coordinate
        )

      if (!valid) {
        throw new Error(
          "Choose a place in Japan manually."
        )
      }

      await saveHomeLocation(
        currentLocation.coordinate
      )

    } catch (error) {

      console.log(
        "set home from device error:",
        error
      )

      if (error instanceof ApiError) {
        Alert.alert(
          "Could not update home",
          error.message || "Please try again."
        )

        return
      }

      setHomePickerVisible(true)

      Alert.alert(
        "Could not use device location",
        error instanceof Error
          ? error.message
          : "Select your Home area from the map."
      )

    } finally {

      setSavingHome(false)
    }
  }

  const handleSaveManualHome = async () => {

    if (homeUpdateLocked) {
      showHomeUpdateLimitAlert()

      return
    }

    if (!manualHomePlace) {
      Alert.alert(
        "Choose a home area",
        "Tap the map to choose the area you want to save as Home."
      )

      return
    }

    try {

      setSavingHome(true)

      await saveHomeLocation(
        manualHomePlace
      )

    } catch (error) {

      console.log(
        "save manual home error:",
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

  const saveHomeLocation = async (
    coordinate: Coordinate
  ) => {

    await updateHomeLocation({
      home_lat:
        coordinate.lat,
      home_lng:
        coordinate.lng,
    })

    await onHomeLocationUpdated(coordinate)

    setHomePickerVisible(false)
    setManualHomePlace(null)
    setResult(null)
    cacheRef.current = null
    setRetryAt(null)

    Alert.alert(
      "Home location updated",
      "Your Home location has been saved."
    )
  }

  const submitSimilarity = async (
    fallbackInput: SimilarityFallbackInput,
    options: {
      source: "device" | "manual"
      currentLocation?: CurrentLocation
    }
  ) => {

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
      setLastPlaceArea(
        cached.current_area
      )

      return
    }

    const response =
      await getSimilarity({
        home_lat:
          fallbackInput.homeLat,
        home_lng:
          fallbackInput.homeLng,
        current_lat:
          fallbackInput.currentLat,
        current_lng:
          fallbackInput.currentLng,
        source:
          options.source,
      })

    const similarity =
      await fillMissingSimilarityAreas(
        response,
        fallbackInput
      )

    cacheRef.current = {
      ...fallbackInput,
      checkedAt:
        Date.now(),
      result:
        similarity,
    }

    setResult(similarity)
    setLastPlaceArea(
      similarity.current_area
    )

    if (options.currentLocation) {
      void recordCurrentLocation(
        options.currentLocation
      )
    }
  }

  const score =
    result
      ? Math.round(result.similarity * 100)
      : null

  const compareAreaName =
    formatArea(
      result?.current_area ??
      lastPlaceArea ??
      {}
    )

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.kicker}>
            Today
          </Text>

          <Text style={styles.title}>
            Find the nearby feeling.
          </Text>

          <Text style={styles.subtitle}>
            Compare your current area, or choose a place manually.
          </Text>
        </View>

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
              : hasHomeLocation
                ? "Use your current location or choose a place on the map."
                : "Set Home below before checking your current location."}
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
            title="Check current location"
            loading={loading}
            disabled={
              loading ||
              !homeStatusLoaded ||
              !hasHomeLocation
            }
            onPress={handleCheckDeviceLocation}
          />

          <PrimaryButton
            title="Choose place manually"
            variant="outline"
            disabled={
              loading ||
              !homeStatusLoaded ||
              !hasHomeLocation
            }
            onPress={() => {
              setCurrentPickerVisible(true)
            }}
          />

          {currentPickerVisible ? (
            <View style={styles.currentPicker}>
              <JapanMapPicker
                title="Choose place"
                value={manualCurrentPlace}
                markerTitle="Selected place"
                onChange={setManualCurrentPlace}
                helperText={
                  manualCurrentPlace
                    ? undefined
                    : "Tap a land area in Japan to compare with Home."
                }
              />

              <View style={styles.currentPickerActions}>
                <PrimaryButton
                  title="Check selected place"
                  loading={loading}
                  disabled={!manualCurrentPlace || loading}
                  onPress={handleCheckManualLocation}
                />
              </View>
            </View>
          ) : null}
        </View>

        <View style={styles.placeCard}>
          <Text style={styles.placeTitle}>
            Current area
          </Text>

          <Text style={styles.placeValue}>
            {compareAreaName !== "Unknown"
              ? compareAreaName
              : lastPlace
                ? "行政区名を確認中"
            : "Not checked yet"}
          </Text>
        </View>

        <View style={styles.homeCard}>
          <View style={styles.homeCardHeader}>
            <View>
              <Text style={styles.homeLabel}>
                Home location
              </Text>

              <Text style={styles.homeStatus}>
                {!homeStatusLoaded
                  ? "Checking"
                  : hasHomeLocation
                    ? "Ready"
                    : "Needs to be set"}
              </Text>
            </View>

            {homeStatusLoaded &&
              hasHomeLocation &&
              !canUpdateHomeToday ? (
              <Text style={styles.lockBadge}>
                Today done
              </Text>
            ) : null}
          </View>

          <Text style={styles.homeHelp}>
            {!homeStatusLoaded
              ? "Checking Home update status."
              : hasHomeLocation
                ? "Home can be updated once per day."
                : "Set Home first to check your current location."}
          </Text>

          <View style={styles.homeActions}>
            <PrimaryButton
              title={
                hasHomeLocation
                  ? "Update Home with device"
                  : "Set Home with device"
              }
              variant="outline"
              loading={savingHome}
              disabled={savingHome || homeUpdateLocked}
              onPress={handleSetHomeFromDevice}
            />

            <PrimaryButton
              title="Choose Home manually"
              variant="outline"
              disabled={savingHome || homeUpdateLocked}
              onPress={() => {
                setHomePickerVisible(true)
              }}
            />
          </View>

          {homePickerVisible ? (
            <View style={styles.homePicker}>
              <JapanMapPicker
                title="Choose Home"
                value={manualHomePlace}
                markerTitle="Home"
                onChange={setManualHomePlace}
                helperText={
                  manualHomePlace
                    ? undefined
                    : "Tap a land area in Japan to set Home."
                }
              />

              <View style={styles.homePickerActions}>
                <PrimaryButton
                  title="Save Home"
                  loading={savingHome}
                  disabled={!manualHomePlace || savingHome || homeUpdateLocked}
                  onPress={handleSaveManualHome}
                />
              </View>
            </View>
          ) : null}
        </View>
      </ScrollView>
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

function showHomeUpdateLimitAlert() {

  Alert.alert(
    "Home update limit",
    "Home location can be updated once per day. Try again tomorrow."
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

function getRateLimitRetryAt(
  error: ApiError
): number {

  return Date.now() +
    (
      typeof error.retryAfterMs === "number" &&
      Number.isFinite(error.retryAfterMs) &&
      error.retryAfterMs > 0
        ? error.retryAfterMs
        : RATE_LIMIT_COOLDOWN_MS
    )
}

async function buildFallbackSimilarity(
  input: SimilarityFallbackInput
): Promise<SimilarityResponse> {

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

  const [
    homeArea,
    currentArea,
  ] =
    await Promise.all([
      reverseGeocodeArea({
        lat:
          input.homeLat,
        lng:
          input.homeLng,
      }),
      reverseGeocodeArea({
        lat:
          input.currentLat,
        lng:
          input.currentLng,
      }),
    ])

  return {
    similarity,
    home_area:
      homeArea,
    current_area:
      currentArea,
  }
}

async function fillMissingSimilarityAreas(
  response: SimilarityResponse,
  input: SimilarityFallbackInput
): Promise<SimilarityResponse> {

  if (
    hasArea(response.home_area) &&
    hasArea(response.current_area)
  ) {
    return response
  }

  const [
    homeArea,
    currentArea,
  ] =
    await Promise.all([
      hasArea(response.home_area)
        ? Promise.resolve(response.home_area)
        : reverseGeocodeArea({
          lat:
            input.homeLat,
          lng:
            input.homeLng,
        }),
      hasArea(response.current_area)
        ? Promise.resolve(response.current_area)
        : reverseGeocodeArea({
          lat:
            input.currentLat,
          lng:
            input.currentLng,
        }),
    ])

  return {
    ...response,
    home_area:
      homeArea,
    current_area:
      currentArea,
  }
}

async function reverseGeocodeArea(
  coordinate: Coordinate
): Promise<SimilarityResponse["home_area"]> {

  try {

    const location =
      await reverseGeocode(coordinate)

    return {
      prefecture:
        location.prefecture || null,
      city:
        location.city || null,
      district:
        location.district || null,
    }

  } catch (error) {

    console.log(
      "reverse geocode similarity area error:",
      error
    )

    return {}
  }
}

function hasArea(
  area: SimilarityResponse["home_area"]
): boolean {

  return Boolean(
    area.prefecture ||
    area.city ||
    area.district
  )
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
    flexGrow: 1,
    paddingHorizontal: 22,
    paddingTop: 12,
    paddingBottom: 28,
    backgroundColor: design.colors.paper,
  },
  header: {
    marginBottom: 22,
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
  subtitle: {
    marginTop: 10,
    color: design.colors.muted,
    fontSize: 16,
    lineHeight: 23,
    fontWeight: "600",
  },
  resultCard: {
    borderRadius: design.radius.card,
    backgroundColor: design.colors.surface,
    borderWidth: 1,
    borderColor: design.colors.softLine,
    padding: 18,
    ...design.shadow,
  },
  homeCard: {
    marginTop: 16,
    borderRadius: design.radius.card,
    borderWidth: 1,
    borderColor: design.colors.softLine,
    backgroundColor: design.colors.surface,
    padding: 16,
    ...design.shadow,
  },
  homeCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  homeLabel: {
    color: design.colors.faint,
    fontSize: 13,
    fontWeight: "800",
  },
  homeStatus: {
    marginTop: 4,
    color: design.colors.ink,
    fontSize: 22,
    lineHeight: 28,
    fontWeight: "900",
  },
  lockBadge: {
    overflow: "hidden",
    borderRadius: design.radius.pill,
    backgroundColor: design.colors.softLine,
    paddingHorizontal: 11,
    paddingVertical: 7,
    color: design.colors.muted,
    fontSize: 12,
    fontWeight: "800",
  },
  homeHelp: {
    marginTop: 9,
    color: design.colors.muted,
    fontSize: 14,
    lineHeight: 21,
    fontWeight: "600",
  },
  homeActions: {
    gap: 10,
    marginTop: 14,
  },
  homePicker: {
    marginTop: 14,
  },
  homePickerActions: {
    marginTop: 12,
  },
  currentPicker: {
    marginTop: 2,
  },
  currentPickerActions: {
    marginTop: 12,
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
  placeCard: {
    marginTop: 16,
    borderRadius: design.radius.card,
    borderWidth: 1,
    borderColor: design.colors.softLine,
    backgroundColor: design.colors.surface,
    padding: 16,
  },
  placeTitle: {
    color: design.colors.faint,
    fontSize: 13,
    fontWeight: "800",
  },
  placeValue: {
    marginTop: 6,
    color: design.colors.ink,
    fontSize: 18,
    fontWeight: "800",
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
