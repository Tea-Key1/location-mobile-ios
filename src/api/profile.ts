// src/api/profile.ts

import { apiFetch } from "./client"

export type ProfileResponse = {
  age_group: string
  gender: string

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

export type UpdateHomeRequest = {
  home_lat: number
  home_lng: number
}

export type HomeLocationResponse = {
  profile_completed: boolean
  profile: ProfileResponse
}

export type DeleteProfileResponse = {
  deleted: boolean
}

export type ProfileCompletionResponse = {
  profile_completed: boolean
}

export async function getMyProfile(): Promise<ProfileResponse> {

  return await apiFetch<ProfileResponse>(
    "/profiles/me",
    {
      method: "GET",
    }
  )
}

export async function getProfileCompletion(): Promise<ProfileCompletionResponse> {

  return await apiFetch<ProfileCompletionResponse>(
    "/profiles/completion",
    {
      method: "GET",
    }
  )
}

export async function updateHomeLocation(
  payload: UpdateHomeRequest
): Promise<HomeLocationResponse> {

  return await apiFetch<HomeLocationResponse>(
    "/profiles/home",
    {
      method: "POST",

      body: JSON.stringify(payload),
    }
  )
}

export async function deleteProfile(): Promise<DeleteProfileResponse> {

  return await apiFetch<DeleteProfileResponse>(
    "/profiles/me",
    {
      method: "DELETE",
    }
  )
}
