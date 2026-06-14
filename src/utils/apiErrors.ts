import {
  ApiError,
} from "../api/client"

export function formatSimilarityError(
  error: unknown
): string {

  if (error instanceof ApiError) {

    switch (error.status) {
    case 401:
    case 403:
      return "Sign in again to refresh Roamie."

    case 400:
    case 404:
    case 422:
      return "Set your home location first."

    case 429:
      return "Too many checks. Try again in a moment."

    case 503:
      return "Roamie is busy. Try again later."

    default:
      return "Could not check similarity. Try again."
    }
  }

  if (error instanceof TypeError) {
    return "Check your connection and try again."
  }

  if (error instanceof Error) {
    return error.message || "Please try again."
  }

  return "Please try again."
}

export function formatRankingError(
  error: unknown
): string {

  if (error instanceof ApiError) {

    switch (error.status) {
    case 401:
    case 403:
      return "Sign in again to refresh Roamie."

    case 404:
      return "Ranking history is not ready yet."

    case 422:
      return "Choose a valid period."

    case 429:
      return "Too many refreshes. Try again in a moment."

    case 503:
      return "Roamie is busy. Try again later."

    default:
      return "Could not load rankings. Try again."
    }
  }

  if (error instanceof TypeError) {
    return "Check your connection and try again."
  }

  if (error instanceof Error) {
    return error.message || "Please try again."
  }

  return "Please try again."
}

export function hasUsableHomeLocation(
  profile: {
    home_lat?: number | null
    home_lng?: number | null
  }
): boolean {

  return typeof profile.home_lat === "number" &&
    Number.isFinite(profile.home_lat) &&
    typeof profile.home_lng === "number" &&
    Number.isFinite(profile.home_lng)
}
