import {
  submitOnboarding,
} from "../../api/onboarding"

import {
  Coordinate,
} from "../../types/location"

import {
  AgeRange,
  Gender,
} from "../../types/profile"

export async function submitHomeLocationOnboarding(
  params: Record<string, unknown> | undefined,
  coordinate?: Coordinate
): Promise<void> {

  const ageGroup =
    parseAgeGroup(
      params?.age_group
    )

  const gender =
    parseGender(
      params?.gender
    )

  if (!ageGroup || !gender) {
    throw new Error(
      "Onboarding information is incomplete."
    )
  }

  const homePayload =
    coordinate
      ? {
        home_lat:
          coordinate.lat,

        home_lng:
          coordinate.lng,
      }
      : {}

  await submitOnboarding({
    age_group:
      ageGroup,

    gender:
      gender,

    ...homePayload,

    calm:
      normalizeScore(
        params?.calm
      ),

    vivid:
      normalizeScore(
        params?.vivid
      ),

    roamer:
      normalizeScore(
        params?.roamer
      ),

    luxury:
      normalizeScore(
        params?.luxury
      ),

    nature:
      normalizeScore(
        params?.nature
      ),

    nightlife:
      normalizeScore(
        params?.nightlife
      ),

    local:
      normalizeScore(
        params?.local
      ),

    creative:
      normalizeScore(
        params?.creative
      ),
    })
}

function parseAgeGroup(
  value: unknown
): AgeRange | null {

  const values: AgeRange[] = [
    "10s",
    "20s",
    "30s",
    "40s",
    "50s",
    "60s",
    "70s+",
  ]

  return values.includes(
    value as AgeRange
  )
    ? value as AgeRange
    : null
}

function parseGender(
  value: unknown
): Gender | null {

  const values: Gender[] = [
    "male",
    "female",
    "other",
  ]

  return values.includes(
    value as Gender
  )
    ? value as Gender
    : null
}

function normalizeScore(
  value: unknown
): number {

  if (typeof value !== "number") {
    return 0
  }

  return Math.min(
    1,
    Math.max(
      0,
      value
    )
  )
}
