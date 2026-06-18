// src/types/location.ts

export interface Coordinate {

  lat: number

  lng: number
}

export interface CurrentLocation {

  coordinate: Coordinate

  timestamp?: string

  accuracy?: number | null
}

export interface HomeLocation {

  coordinate: Coordinate

  prefecture?: string

  city?: string

  district?: string
}

export interface SimilarityRequest {

  home_lat: number

  home_lng: number

  current_lat: number

  current_lng: number

  source?: "device" | "manual"
}

export interface SimilarityResponse {

  similarity: number

  home_area: AreaInfo

  current_area: AreaInfo
}

export interface AreaInfo {

  prefecture?: string | null

  city?: string | null

  district?: string | null
}

export interface NearbyArea {

  id: string

  name: string

  lat: number

  lng: number

  similarity: number

  area: AreaInfo
}
