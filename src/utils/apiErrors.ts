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
      return "Check the selected locations and try again."

    case 429:
      return retryMessage(
        "Too many checks.",
        error
      )

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
      return retryMessage(
        "Too many refreshes.",
        error
      )

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

function retryMessage(
  prefix: string,
  error: ApiError
): string {

  if (
    typeof error.retryAfterMs === "number" &&
    Number.isFinite(error.retryAfterMs) &&
    error.retryAfterMs > 0
  ) {
    const minutes =
      Math.max(
        1,
        Math.ceil(error.retryAfterMs / 60000)
      )

    return `${prefix} Try again in about ${minutes} min.`
  }

  return `${prefix} Try again in a moment.`
}

export function hasUsableHomeLocation(
  profile: {
    home_lat?: number | null
    home_lng?: number | null
  }
): profile is {
  home_lat: number
  home_lng: number
} {

  return typeof profile.home_lat === "number" &&
    Number.isFinite(profile.home_lat) &&
    typeof profile.home_lng === "number" &&
    Number.isFinite(profile.home_lng)
}
