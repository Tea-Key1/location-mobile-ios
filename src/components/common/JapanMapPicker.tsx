import {
  useState,
} from "react"

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
  markerTitle?: string
  helperText?: string
  extraMarkers?: JapanMapMarker[]
}

export default function JapanMapPicker({
  title,
  value,
  onChange,
  markerTitle = "Selected area",
  helperText,
  extraMarkers = [],
}: Props) {

  const [
    validating,
    setValidating,
  ] = useState(false)

  const handlePress = async (
    event: MapPressEvent
  ) => {

    if (!onChange || validating) {
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

  return (
    <View style={styles.wrap}>
      <View style={styles.header}>
        <Text style={styles.title}>
          {title}
        </Text>

        <Text style={styles.value}>
          {helperText ??
            (value
              ? formatCoordinate(value)
              : onChange
                ? "Tap the map to choose an area."
                : "Move and zoom the map.")}
        </Text>
      </View>

      <MapView
        style={styles.map}
        initialRegion={JAPAN_REGION}
        zoomEnabled
        scrollEnabled
        rotateEnabled
        pitchEnabled
        onPress={onChange ? handlePress : undefined}
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

        {value ? (
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
  map: {
    height: 230,
    width: "100%",
  },
})
