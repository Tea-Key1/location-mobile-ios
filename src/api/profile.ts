// src/api/profile.ts

import { apiFetch } from "./client"

export type ProfileResponse = {
  age_group: string | null
  gender: string | null

  home_lat: number | null
  home_lng: number | null

  calm: number
  vivid: number
  roamer: number
  luxury: number
  nature: number
  nightlife: number
  local: number
  creative: number
}

export type HomeLocationRequest = {
  home_lat: number
  home_lng: number
}

export type UpdateHomeRequest =
  HomeLocationRequest

export type HomeLocationResponse = {
  profile: ProfileResponse
  profile_completed: boolean
}

type UpdateHomeResponse =
  | ProfileResponse
  | HomeLocationResponse

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
  payload: HomeLocationRequest
): Promise<ProfileResponse> {

  const response =
    await apiFetch<UpdateHomeResponse>(
    "/profiles/me",
    {
      method: "PATCH",

      body: JSON.stringify(payload),
    }
  )

  if (isHomeLocationResponse(response)) {
    return response.profile
  }

  return response
}

export async function setHomeLocation(
  payload: HomeLocationRequest
): Promise<HomeLocationResponse> {

  return await apiFetch<HomeLocationResponse>(
    "/profiles/home",
    {
      method: "POST",

      body: JSON.stringify(payload),
    }
  )
}

function isHomeLocationResponse(
  response: UpdateHomeResponse
): response is HomeLocationResponse {

  return "profile" in response
}

export async function deleteProfile(): Promise<DeleteProfileResponse> {

  return await apiFetch<DeleteProfileResponse>(
    "/profiles/me",
    {
      method: "DELETE",
    }
  )
}
