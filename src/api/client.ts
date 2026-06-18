import { getToken } from "../store/authStorage"

import {
  API_BASE_URL,
} from "../constants/config"

type ApiFetchOptions = RequestInit & {
  auth?: boolean
  suppressDevLog?: boolean
}

export class ApiError extends Error {
  status: number
  body: unknown
  retryAfterMs?: number | null

  constructor(
    message: string,
    status: number,
    body: unknown,
    retryAfterMs?: number | null
  ) {
    super(message)
    this.name = "ApiError"
    this.status = status
    this.body = body
    this.retryAfterMs = retryAfterMs
  }
}

// =====================================================
// API FETCH
// =====================================================

export async function apiFetch<T = unknown>(

  endpoint: string,

  options: ApiFetchOptions = {}

): Promise<T> {

  try {

    const {
      auth,
      suppressDevLog,
      ...requestOptions
    } = options

    // ===============================================
    // JWT
    // ===============================================

    const token =
      auth === false
        ? null
        : await getToken()

    // ===============================================
    // headers
    // ===============================================

    const headers = {

      "Content-Type": "application/json",

      ...(token
        ? {
            Authorization:
              `Bearer ${token}`
          }
        : {}),

      ...(options.headers || {}),
    }

    // ===============================================
    // request
    // ===============================================

    const response = await fetch(

      `${API_BASE_URL}${endpoint}`,

      {
        ...requestOptions,
        headers,
      }
    )

    // ===============================================
    // parse json
    // ===============================================

    const text =
      await response.text()

    const data =
      parseResponseBody(text)

    // ===============================================
    // api error
    // ===============================================

    if (!response.ok) {

      const message =
        getApiErrorMessage(
          data,
          text,
          response.status
        )

      const retryAfterMs =
        getRetryAfterMs(
          response,
          data
        )

      throw new ApiError(
        message,
        response.status,
        data,
        retryAfterMs
      )
    }

    return data as T

  } catch (error) {

    if (
      __DEV__ &&
      !options.suppressDevLog &&
      error instanceof ApiError
    ) {

      console.log(
        "apiFetch error:",
        {
          endpoint,
          status:
            error.status,
          message:
            error.message,
          body:
            error.body,
        }
      )
    }

    throw error
  }
}

function getRetryAfterMs(
  response: Response,
  data: unknown
): number | null {

  const retryAfterHeader =
    response.headers.get("Retry-After")

  const headerMs =
    parseRetryAfterValue(
      retryAfterHeader
    )

  if (headerMs !== null) {
    return headerMs
  }

  if (
    data &&
    typeof data === "object"
  ) {
    const retryAfter =
      (data as {
        retry_after?: unknown
        retry_after_seconds?: unknown
      }).retry_after ??
      (data as {
        retry_after_seconds?: unknown
      }).retry_after_seconds

    const bodyMs =
      parseRetryAfterValue(retryAfter)

    if (bodyMs !== null) {
      return bodyMs
    }
  }

  return null
}

function parseRetryAfterValue(
  value: unknown
): number | null {

  if (
    typeof value !== "string" &&
    typeof value !== "number"
  ) {
    return null
  }

  const numeric =
    typeof value === "number"
      ? value
      : Number(value)

  if (Number.isFinite(numeric)) {
    return Math.max(0, numeric * 1000)
  }

  if (typeof value !== "string") {
    return null
  }

  const dateMs =
    Date.parse(value)

  if (Number.isNaN(dateMs)) {
    return null
  }

  return Math.max(0, dateMs - Date.now())
}

function parseResponseBody(
  text: string
) {

  if (!text) {
    return null
  }

  try {

    return JSON.parse(text)

  } catch {

    return text
  }
}

function getApiErrorMessage(
  data: unknown,
  text: string,
  status: number
): string {

  if (
    data &&
    typeof data === "object" &&
    "detail" in data
  ) {
    const detail =
      (data as { detail?: unknown }).detail

    if (typeof detail === "string") {
      return detail
    }

    if (Array.isArray(detail)) {
      const messages =
        detail
          .map((item) =>
            formatValidationError(item)
          )
          .filter(Boolean)

      if (messages.length > 0) {
        return messages.join("\n")
      }
    }
  }

  return text
    ? `${text} (${status})`
    : `API Error (${status})`
}

function formatValidationError(
  item: unknown
): string | null {

  if (
    !item ||
    typeof item !== "object"
  ) {
    return null
  }

  const error =
    item as {
      loc?: unknown
      msg?: unknown
    }

  if (typeof error.msg !== "string") {
    return null
  }

  const location =
    Array.isArray(error.loc)
      ? error.loc
          .map(String)
          .join(".")
      : null

  return location
    ? `${location}: ${error.msg}`
    : error.msg
}
