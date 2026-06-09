// src/api/onboarding.ts

import { apiFetch } from "./client"

import {
  ProfileResponse,
} from "./profile"

import {
  AgeRange,
  Gender,
} from "../types/profile"

export type OnboardingRequest = {
  age_group: AgeRange
  gender: Gender
  home_lat: number
  home_lng: number
  calm: number
  vivid: number
  roamer: number
  luxury: number
  nature: number
  nightlife: number
  local: number
  creative: number
}

export type OnboardingResponse = {
  profile_completed: boolean
  profile: ProfileResponse
}

export async function submitOnboarding(
  payload: OnboardingRequest
): Promise<OnboardingResponse> {

  return await apiFetch<OnboardingResponse>(
    "/profiles/onboarding",
    {
      method: "POST",

      body: JSON.stringify(payload),
    }
  )
}
