// src/utils/location.ts

import * as Location from "expo-location"

import {
  Coordinate,
  CurrentLocation,
  HomeLocation,
} from "../types/location"


// =========================================
// 現在地取得
// =========================================
export async function requestLocationPermission(): Promise<void> {

  const { status } =
    await Location.requestForegroundPermissionsAsync()

  if (status !== "granted") {
    throw new Error(
      "位置情報の権限が許可されていません。iPhoneの設定からRoamieの位置情報を許可してください。"
    )
  }
}

export async function getCurrentLocation(): Promise<CurrentLocation> {

  // 権限確認
  await requestLocationPermission()

  // GPS取得
  const location =
    await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.High,
    })

  return {
    coordinate: {
      lat: location.coords.latitude,
      lng: location.coords.longitude,
    },
    timestamp:
      location.timestamp
        ? new Date(location.timestamp).toISOString()
        : new Date().toISOString(),
    accuracy:
      location.coords.accuracy,
  }
}


// =========================================
// 住所変換
// lat/lng → prefecture/city
// =========================================
export async function reverseGeocode(
  coordinate: Coordinate
): Promise<HomeLocation> {

  const result =
    await Location.reverseGeocodeAsync({
      latitude: coordinate.lat,
      longitude: coordinate.lng,
    })

  if (!result || result.length === 0) {
    return {
      coordinate,
    }
  }

  const geo = result[0]

  return {
    coordinate,

    prefecture:
      geo.region || "",

    city:
      geo.city || "",

    district:
      geo.district || "",
  }
}


// =========================================
// 距離計算 (km)
// =========================================
export function calculateDistanceKm(
  a: Coordinate,
  b: Coordinate
): number {

  const R = 6371

  const dLat = toRad(b.lat - a.lat)
  const dLng = toRad(b.lng - a.lng)

  const lat1 = toRad(a.lat)
  const lat2 = toRad(b.lat)

  const x =
    Math.sin(dLat / 2) *
      Math.sin(dLat / 2) +
    Math.sin(dLng / 2) *
      Math.sin(dLng / 2) *
      Math.cos(lat1) *
      Math.cos(lat2)

  const y =
    2 *
    Math.atan2(
      Math.sqrt(x),
      Math.sqrt(1 - x)
    )

  return R * y
}


function toRad(value: number): number {
  return (value * Math.PI) / 180
}
