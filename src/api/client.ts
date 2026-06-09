import { getToken } from "../store/authStorage"

import {
  API_BASE_URL,
} from "../constants/config"

type ApiFetchOptions = RequestInit & {
  auth?: boolean
}

export class ApiError extends Error {
  status: number
  body: unknown

  constructor(
    message: string,
    status: number,
    body: unknown
  ) {
    super(message)
    this.name = "ApiError"
    this.status = status
    this.body = body
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
    // unauthorized
    // ===============================================

    if (response.status === 401) {

      throw new ApiError(
        "Unauthorized"
        ,
        response.status,
        null
      )
    }

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

      throw new ApiError(
        message,
        response.status,
        data
      )
    }

    return data as T

  } catch (error) {

    if (
      __DEV__ &&
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
