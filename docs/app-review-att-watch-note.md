# App Review Notes: ATT and Apple Watch Similarity

Roamie requests App Tracking Transparency permission only for commercial tracking use cases such as third-party partner sharing, data broker workflows, advertising, or commercial analytics.

Core app features remain available when ATT is denied, restricted, not determined, or unavailable.

The Apple Watch similarity score is a user-facing feature. It compares the signed-in user's saved home coordinates with the Apple Watch's current location and displays a similarity score back to that same user.

This Apple Watch similarity feature:

- uses the same signed-in Roamie account token as the iOS app
- calls `GET /profiles/me` to read the user's saved home coordinates
- calls `POST /similarity` to calculate a 0-100% style similarity score
- does not require ATT authorization
- does not block users who deny ATT
- does not make a user eligible for third-party partner sharing, data broker sharing, advertising, or commercial analytics unless ATT status is `authorized`

If a user has not set a home location, Roamie asks the user to set it on iPhone first. If the API is unavailable or rate-limited, Roamie shows a short retry message and does not crash.
