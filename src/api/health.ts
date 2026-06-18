import { apiFetch } from "./client"

export type HealthResponse =
  Record<string, unknown>

export async function getHealth(): Promise<HealthResponse> {

  return await apiFetch<HealthResponse>(
    "/health",
    {
      method: "GET",
      auth: false,
    }
  )
}
