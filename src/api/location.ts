// src/api/location.ts

import { apiFetch } from "./client"

export type AreaResponse = {
  prefecture?: string | null
  city?: string | null
  district?: string | null
}

export type LocationCreate = {
  lat: number
  lng: number
  accuracy?: number | null
  timestamp?: string | null
}

export type LocationItem = {
  id: number
  lat: number
  lng: number
  accuracy: number | null
  timestamp: string
  s2_level12_id: string
  prefecture: string | null
  city: string | null
  locality: string | null
  commercial_tracking_allowed_at_collection: boolean
  tracking_consent_status_at_collection: string | null
}

export type LocationListResponse = {
  items: LocationItem[]
}

export type SimilarityRequest = {
  home_lat: number
  home_lng: number
  current_lat: number
  current_lng: number
  source?: "device" | "manual" | null
}

export type SimilaritySearchRequest = {
  lat: number
  lng: number
  top_k?: number
}

export type SimilarityRankingPeriod =
  | "week"
  | "month"
  | "year"

export type SimilarityResponse = {
  similarity: number

  home_area: AreaResponse
  current_area: AreaResponse
}

export type SimilarPlaceItem = {
  id: string
  name: string
  lat: number
  lng: number
  similarity: number
  area: AreaResponse
}

export type SimilaritySearchResponse = {
  items: SimilarPlaceItem[]
}

export type SimilarityRankingItem = {
  rank: number
  area: AreaResponse
  home_area: AreaResponse | null
  current_area: AreaResponse | null
  lat: number | null
  lng: number | null
  average_similarity: number
  best_similarity: number | null
  check_count: number
  latest_checked_at: string | null
}

export type SimilarityRankingResponse = {
  period: SimilarityRankingPeriod
  items: SimilarityRankingItem[]
}

export async function getLocations(): Promise<LocationListResponse> {

  return await apiFetch<LocationListResponse>(
    "/locations",
    {
      method: "GET",
    }
  )
}

export async function createLocation(
  payload: LocationCreate
): Promise<LocationItem> {

  return await apiFetch<LocationItem>(
    "/locations",
    {
      method: "POST",

      body: JSON.stringify(payload),
    }
  )
}

export async function getSimilarity(
  payload: SimilarityRequest,
  options: {
    suppressDevLog?: boolean
  } = {}
): Promise<SimilarityResponse> {

  return await apiFetch<SimilarityResponse>(
    "/similarity",
    {
      method: "POST",
      suppressDevLog:
        options.suppressDevLog,

      body: JSON.stringify(payload),
    }
  )
}

export async function searchSimilarity(
  payload: SimilaritySearchRequest
): Promise<SimilaritySearchResponse> {

  return await apiFetch<SimilaritySearchResponse>(
    "/similarity/search",
    {
      method: "POST",

      body: JSON.stringify(payload),
    }
  )
}

export async function getSimilarityRankings(
  period: SimilarityRankingPeriod
): Promise<SimilarityRankingResponse> {

  return await apiFetch<SimilarityRankingResponse>(
    `/similarity/rankings?period=${period}`,
    {
      method: "GET",
    }
  )
}
