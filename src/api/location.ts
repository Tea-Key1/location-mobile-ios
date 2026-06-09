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
  accuracy?: number | null
  timestamp: string
  s2_level12_id: string
  prefecture?: string | null
  city?: string | null
  locality?: string | null
}

export type LocationListResponse = {
  items: LocationItem[]
}

export type SimilarityRequest = {
  home_lat: number
  home_lng: number
  current_lat: number
  current_lng: number
}

export type SimilaritySearchRequest = {
  lat: number
  lng: number
  top_k?: number
}

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
  payload: SimilarityRequest
): Promise<SimilarityResponse> {

  return await apiFetch<SimilarityResponse>(
    "/similarity",
    {
      method: "POST",

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
