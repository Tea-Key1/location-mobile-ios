// src/utils/similarity.ts

import {
  SimilarityRequest,
  SimilarityResponse,
  Coordinate,
} from "../types/location"

import {
  getSimilarity,
} from "../api/location"


// =========================================
// similarity API
// =========================================
export async function fetchSimilarity(
  home: Coordinate,
  current: Coordinate
): Promise<SimilarityResponse> {

  const payload: SimilarityRequest = {
    home_lat:
      home.lat,

    home_lng:
      home.lng,

    current_lat:
      current.lat,

    current_lng:
      current.lng,
  }

  return await getSimilarity(payload)
}


// =========================================
// similarity score → label
// =========================================
export function similarityLabel(
  score: number
): string {

  if (score >= 0.9) {
    return "かなり似ている"
  }

  if (score >= 0.75) {
    return "似ている"
  }

  if (score >= 0.5) {
    return "少し似ている"
  }

  return "あまり似ていない"
}


// =========================================
// similarity color
// =========================================
export function similarityColor(
  score: number
): string {

  if (score >= 0.9) {
    return "#00C896"
  }

  if (score >= 0.75) {
    return "#4F8CFF"
  }

  if (score >= 0.5) {
    return "#FFB020"
  }

  return "#FF5A5A"
}
