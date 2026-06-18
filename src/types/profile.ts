// src/types/profile.ts

export type AgeRange =
  | "10s"
  | "20s"
  | "30s"
  | "40s"
  | "50s"
  | "60s"
  | "70s+"

export type Gender =
  | "male"
  | "female"
  | "other"

export interface UserProfile {

  age_group: AgeRange

  gender: Gender

  home_lat?: number | null

  home_lng?: number | null

  calm: number

  vivid: number

  roamer: number

  luxury: number

  nature: number

  nightlife: number

  local: number

  creative: number
}
