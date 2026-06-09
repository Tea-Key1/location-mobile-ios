import {
  createLocation,
} from "../api/location"

import {
  CurrentLocation,
} from "../types/location"

export async function recordCurrentLocation(
  location: CurrentLocation
) {

  try {

    await createLocation({
      lat:
        location.coordinate.lat,

      lng:
        location.coordinate.lng,

      accuracy:
        location.accuracy,

      timestamp:
        location.timestamp,
    })

  } catch (error) {

    console.log(
      "record current location error:",
      error
    )
  }
}
