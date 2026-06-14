# Similarity Rankings QA

Use this checklist before release when `GET /similarity/rankings?period=<week|month|year>` is available in production.

## Preconditions

- Install a Debug or release candidate build on a paired iPhone and Apple Watch.
- Use the production API base URL: `https://location-platform.onrender.com`.
- Sign in with Apple on iPhone so the app has a valid `access_token`.
- Set a home location on iPhone before checking similarity.
- Keep ATT as a feature eligibility signal only for commercial tracking. Rankings must stay available when ATT is denied.

## iPhone Similarity History

1. Open Roamie on iPhone and complete Apple Login.
2. On Home, run `Check current similarity` at least three times.
3. Confirm each check returns a user-visible similarity percentage and does not crash.
4. Confirm the FastAPI production database has new rows in `similarity_checks` for the signed-in user.
5. Open the Rankings tab.
6. Switch `Week`, `Month`, and `Year`.
7. Confirm each period calls `GET /similarity/rankings?period=<period>`.
8. Confirm ranking rows show:
   - rank starting at `#1`
   - area text from `prefecture`, `city`, and `district` when available
   - `average_similarity` as a percent
   - `check_count`
   - optional `best_similarity` as a percent
   - optional latest checked date

## Apple Watch Rankings

1. After iPhone login, open Roamie on Apple Watch.
2. Confirm the Watch receives the token from iPhone. If not, it should show `Sign in on iPhone, then open Roamie again.`
3. Tap `Check` and allow location permission when prompted.
4. Confirm Similarity displays as a percentage.
5. In `Best towns`, switch `Week`, `Month`, and `Year`.
6. Confirm ranking rows show average similarity as a percent and do not crash.
7. Confirm refresh works for each selected period.

## Empty History User

1. Sign in with a user that has a home location but no similarity history.
2. Open iPhone Rankings.
3. Confirm `items: []` is displayed as an empty state, not an error.
4. Open Apple Watch `Best towns`.
5. Confirm the Watch displays `No ranking history yet.` and does not crash.

## Error Handling

Use API stubs, server logs, or a test account to confirm these states:

- `401` or `403`: show a sign-in/session message.
- `404`: show `Ranking history is not ready yet.`
- `422`: show a short ranking configuration message.
- `429`: show a retry-later message.
- `503`: show a busy/unavailable retry-later message.
- Network failure: show a short connection message.

## ATT Denied

1. On iPhone, deny ATT in the system dialog or disable tracking permission in Settings.
2. Reopen Roamie.
3. Confirm Home similarity still works.
4. Confirm iPhone Rankings still load.
5. Confirm Apple Watch `Best towns` still loads.
6. Confirm only users with ATT `authorized` are eligible for third-party partner sharing, data broker sharing, advertising, or commercial analytics.

## Account Deletion

1. Sign in with a test user that has similarity history.
2. Confirm Rankings has at least one item.
3. Delete the account from Roamie settings.
4. Confirm local token, user, profile, location display cache, and Watch token state are cleared.
5. Confirm the app returns to logged-out state.
6. Confirm FastAPI deleted the user's `similarity_checks` rows.
7. Sign in again with the same Apple account flow if supported by the test backend.
8. Confirm Rankings returns `items: []` or an unauthorized response until a new account/session is available.

## App Review Note

Rankings are user-facing feedback based on the signed-in user's own similarity check history. They are not gated by ATT. ATT authorization only controls commercial tracking eligibility such as third-party partner sharing, data broker sharing, advertising, and commercial analytics.
