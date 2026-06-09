// src/types/auth.ts

export interface AppleLoginRequest {
  identity_token: string
}

export interface AuthResponse {
  access_token: string
  token_type: string
  profile_completed: boolean
}
