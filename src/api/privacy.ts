import { apiFetch } from "./client"

export type TrackingConsentStatus =
  | "authorized"
  | "denied"
  | "restricted"
  | "not_determined"
  | "unavailable"

export type TrackingConsentSource =
  | "ios_att"

export type TrackingConsentResponse = {
  tracking_authorized: boolean
  tracking_status: TrackingConsentStatus
  tracking_updated_at?: string | null
  tracking_source?: TrackingConsentSource | null
}

export type UpdateTrackingConsentRequest = {
  status: TrackingConsentStatus
  source: TrackingConsentSource
}

export async function getTrackingConsent():
  Promise<TrackingConsentResponse> {

  return await apiFetch<TrackingConsentResponse>(
    "/privacy/tracking-consent",
    {
      method: "GET",
    }
  )
}

export async function updateTrackingConsent(
  payload: UpdateTrackingConsentRequest
): Promise<TrackingConsentResponse> {

  return await apiFetch<TrackingConsentResponse>(
    "/privacy/tracking-consent",
    {
      method: "POST",

      body: JSON.stringify(payload),
    }
  )
}
