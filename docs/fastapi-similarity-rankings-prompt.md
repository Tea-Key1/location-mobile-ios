# FastAPI Prompt: Similarity History Rankings

Roamie iOS and Apple Watch now expect a similarity history ranking API.

Please implement the following endpoint in the FastAPI repository.

Base URL:

`https://location-platform.onrender.com`

Authentication:

Use the existing Bearer token authentication.

```http
Authorization: Bearer <access_token>
```

Endpoint:

```http
GET /similarity/rankings?period=week
GET /similarity/rankings?period=month
GET /similarity/rankings?period=year
```

Allowed `period` values:

- `week`
- `month`
- `year`

Purpose:

Return the towns or areas that best matched the signed-in user's home profile based on that user's past similarity scores within the selected period.

Expected response:

```json
{
  "period": "week",
  "items": [
    {
      "rank": 1,
      "area": {
        "prefecture": "東京都",
        "city": "千代田区",
        "district": "丸の内"
      },
      "average_similarity": 0.86,
      "best_similarity": 0.94,
      "check_count": 5,
      "latest_checked_at": "2026-06-13T00:00:00Z"
    }
  ]
}
```

Schema requirements:

- `period` must echo the requested period.
- `items` must be sorted by `average_similarity` descending.
- `rank` starts at 1.
- `area.prefecture`, `area.city`, and `area.district` may be `null`.
- `average_similarity` must be a number from `0.0` to `1.0`.
- `best_similarity` may be `null`, but should be a number from `0.0` to `1.0` when available.
- `check_count` is the number of similarity checks contributing to that area during the period.
- `latest_checked_at` may be `null`.

Behavior:

- If there is no history for the selected period, return `200` with an empty `items` array.
- If `period` is invalid, return `422`.
- If the user is not authenticated, return `401` or `403`.
- This feature must remain available regardless of App Tracking Transparency status.
- ATT denied, restricted, not determined, or unavailable users must not be blocked from seeing their own ranking history.
- Do not include users in third-party partner sharing, data broker sharing, advertising, or commercial analytics unless their ATT status is `authorized`.

Implementation notes:

- The ranking should be computed from the signed-in user's own similarity check history.
- If similarity checks are not currently persisted, add persistence when `POST /similarity` is called, storing the user id, similarity score, current area, home area, request timestamp, and ATT state at collection if available.
- iOS and Apple Watch already handle `401`, `403`, `404`, `422`, `429`, and `503` without crashing.
- Please add or update Pydantic schemas, router, service, and tests.
