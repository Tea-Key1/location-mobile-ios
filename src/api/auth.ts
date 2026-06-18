// src/api/auth.ts

import { apiFetch } from "./client"

export type AppleLoginRequest = {
  identity_token: string
  authorization_code?: string | null
}

export type AppleLoginResponse = {
  access_token: string
  token_type: string
  profile_completed: boolean
}

export type LogoutResponse = {
  logged_out: boolean
}

export type LogoutAllResponse = {
  logged_out: boolean
  revoked_sessions: number
}

// =========================================
// Apple Login API
// =========================================

export async function loginWithApple(
  identityToken: string,
  authorizationCode?: string | null
): Promise<AppleLoginResponse> {

  try {

    const response =
      await apiFetch<AppleLoginResponse>(
        "/auth/apple",
        {
          method: "POST",
          auth: false,

          body: JSON.stringify({
            identity_token:
              identityToken,
            authorization_code:
              authorizationCode ?? null,
          }),
        }
      )

    return response

  } catch (error) {

    console.log(
      "loginWithApple api error",
      error
    )

    throw error
  }
}

export async function logout(): Promise<LogoutResponse> {

  return await apiFetch<LogoutResponse>(
    "/auth/logout",
    {
      method: "POST",
    }
  )
}

export async function logoutAll(): Promise<LogoutAllResponse> {

  return await apiFetch<LogoutAllResponse>(
    "/auth/logout-all",
    {
      method: "POST",
    }
  )
}
