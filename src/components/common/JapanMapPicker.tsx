import {
  useState,
} from "react"

import Ionicons
from "@expo/vector-icons/Ionicons"

import {
  Alert,
  StyleSheet,
  Text,
  View,
} from "react-native"

import MapView, {
  Marker,
  MapPressEvent,
  Region,
} from "react-native-maps"

import {
  Coordinate,
} from "../../types/location"

import {
  isJapanAdministrativeCoordinate,
} from "../../utils/location"

import {
  design,
} from "../../styles/design"

const JAPAN_REGION: Region = {
  latitude: 36.2048,
  longitude: 138.2529,
  latitudeDelta: 18,
  longitudeDelta: 18,
}

export type JapanMapMarker = {
  id: string
  coordinate: Coordinate
  title: string
  description?: string
  pinColor?: string
}

type Props = {
  title: string
  value: Coordinate | null
  onChange?: (coordinate: Coordinate) => void
  onCenterChange?: (coordinate: Coordinate) => void
  markerTitle?: string
  helperText?: string
  extraMarkers?: JapanMapMarker[]
  fullScreen?: boolean
  selectionMode?: "tap" | "center"
}

export default function JapanMapPicker({
  title,
  value,
  onChange,
  onCenterChange,
  markerTitle = "Selected area",
  helperText,
  extraMarkers = [],
  fullScreen = false,
  selectionMode = "tap",
}: Props) {

  const [
    validating,
    setValidating,
  ] = useState(false)

  const isCenterSelection =
    selectionMode === "center"

  const handlePress = async (
    event: MapPressEvent
  ) => {

    if (
      !onChange ||
      validating ||
      isCenterSelection
    ) {
      return
    }

    const coordinate = {
      lat:
        event.nativeEvent.coordinate.latitude,

      lng:
        event.nativeEvent.coordinate.longitude,
    }

    try {

      setValidating(true)

      const valid =
        await isJapanAdministrativeCoordinate(
          coordinate
        )

      if (!valid) {
        Alert.alert(
          "Choose an area in Japan",
          "Please select a land area within Japan's administrative regions."
        )

        return
      }

      onChange(coordinate)

    } catch (error) {

      console.log(
        "validate map selection error:",
        error
      )

      Alert.alert(
        "Could not select area",
        "Please choose another area in Japan."
      )

    } finally {

      setValidating(false)
    }
  }

  const handleRegionChangeComplete = (
    region: Region
  ) => {

    if (!isCenterSelection) {
      return
    }

    onCenterChange?.({
      lat:
        region.latitude,

      lng:
        region.longitude,
    })
  }

  return (
    <View
      style={[
        styles.wrap,
        fullScreen && styles.fullScreenWrap,
      ]}
    >
      <View style={styles.header}>
        <Text style={styles.title}>
          {title}
        </Text>

        <Text style={styles.value}>
          {helperText ??
            (value
              ? formatCoordinate(value)
              : onChange
                ? isCenterSelection
                  ? "Move the map to place the area under the center pin."
                  : "Tap the map to choose an area."
                : "Move and zoom the map.")}
        </Text>
      </View>

      <View
        style={[
          styles.mapFrame,
          fullScreen && styles.fullScreenMapFrame,
        ]}
      >
        <MapView
          style={[
            styles.map,
            fullScreen && styles.fullScreenMap,
          ]}
          initialRegion={JAPAN_REGION}
          zoomEnabled
          scrollEnabled
          rotateEnabled
          pitchEnabled
          onPress={
            onChange && !isCenterSelection
              ? handlePress
              : undefined
          }
          onRegionChangeComplete={
            isCenterSelection
              ? handleRegionChangeComplete
              : undefined
          }
        >
          {extraMarkers.map((marker) => (
            <Marker
              key={marker.id}
              title={marker.title}
              description={marker.description}
              pinColor={marker.pinColor}
              coordinate={{
                latitude:
                  marker.coordinate.lat,
                longitude:
                  marker.coordinate.lng,
              }}
            />
          ))}

          {value && !isCenterSelection ? (
            <Marker
              title={markerTitle}
              pinColor={design.colors.green}
              coordinate={{
                latitude:
                  value.lat,
                longitude:
                  value.lng,
              }}
            />
          ) : null}
        </MapView>

        {isCenterSelection ? (
          <View
            pointerEvents="none"
            style={styles.centerPinWrap}
          >
            <View style={styles.centerPin}>
              <Ionicons
                name="location-sharp"
                size={38}
                color={design.colors.greenDark}
              />
            </View>
          </View>
        ) : null}
      </View>
    </View>
  )
}

function formatCoordinate(
  coordinate: Coordinate
): string {

  return `${coordinate.lat.toFixed(4)}, ${coordinate.lng.toFixed(4)}`
}

const styles = StyleSheet.create({
  wrap: {
    borderRadius: design.radius.card,
    borderWidth: 1,
    borderColor: design.colors.softLine,
    backgroundColor: design.colors.surface,
    overflow: "hidden",
    ...design.shadow,
  },
  fullScreenWrap: {
    flex: 1,
    borderRadius: 0,
    borderWidth: 0,
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  header: {
    paddingHorizontal: 14,
    paddingTop: 13,
    paddingBottom: 11,
    borderBottomWidth: 1,
    borderBottomColor: design.colors.softLine,
  },
  title: {
    color: design.colors.ink,
    fontSize: 15,
    fontWeight: "800",
  },
  value: {
    marginTop: 3,
    color: design.colors.muted,
    fontSize: 12,
  },
  mapFrame: {
    position: "relative",
  },
  fullScreenMapFrame: {
    flex: 1,
  },
  map: {
    height: 230,
    width: "100%",
  },
  fullScreenMap: {
    flex: 1,
    height: undefined,
  },
  centerPinWrap: {
    position: "absolute",
    top: "50%",
    left: "50%",
    width: 52,
    height: 52,
    marginLeft: -26,
    marginTop: -45,
    alignItems: "center",
    justifyContent: "center",
  },
  centerPin: {
    alignItems: "center",
    justifyContent: "center",
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "rgba(255, 255, 255, 0.92)",
    borderWidth: 1,
    borderColor: design.colors.softLine,
    shadowColor: design.colors.ink,
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.16,
    shadowRadius: 10,
    elevation: 4,
  },
})
