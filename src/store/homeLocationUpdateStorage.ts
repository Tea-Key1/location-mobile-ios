import AsyncStorage
from "@react-native-async-storage/async-storage"

const LAST_HOME_UPDATE_KEY =
  "roamie:last-home-location-update"

type HomeUpdateRecord = {
  date: string
  homeLat: number
  homeLng: number
}

export async function getLastHomeUpdateDate(
  homeLat?: number | null,
  homeLng?: number | null
): Promise<string | null> {

  const value =
    await AsyncStorage.getItem(
      LAST_HOME_UPDATE_KEY
    )

  if (!value) {
    return null
  }

  const legacyDate =
    parseLegacyDate(value)

  if (legacyDate) {
    return legacyDate
  }

  const record =
    parseHomeUpdateRecord(value)

  if (!record) {
    return null
  }

  if (
    typeof homeLat === "number" &&
    typeof homeLng === "number" &&
    (
      !coordinatesAreClose(record.homeLat, homeLat) ||
      !coordinatesAreClose(record.homeLng, homeLng)
    )
  ) {
    return null
  }

  return record.date
}

export async function saveLastHomeUpdateDate(
  date: string,
  homeLat: number,
  homeLng: number
) {

  const record: HomeUpdateRecord = {
    date,
    homeLat,
    homeLng,
  }

  await AsyncStorage.setItem(
    LAST_HOME_UPDATE_KEY,
    JSON.stringify(record)
  )
}

export async function clearLastHomeUpdateDate() {

  await AsyncStorage.removeItem(
    LAST_HOME_UPDATE_KEY
  )
}

function parseLegacyDate(
  value: string
): string | null {

  return /^\d{4}-\d{2}-\d{2}$/.test(value)
    ? value
    : null
}

function parseHomeUpdateRecord(
  value: string
): HomeUpdateRecord | null {

  try {

    const parsed =
      JSON.parse(value) as Partial<HomeUpdateRecord>

    if (
      typeof parsed.date !== "string" ||
      typeof parsed.homeLat !== "number" ||
      typeof parsed.homeLng !== "number"
    ) {
      return null
    }

    return {
      date:
        parsed.date,
      homeLat:
        parsed.homeLat,
      homeLng:
        parsed.homeLng,
    }

  } catch {

    return null
  }
}

function coordinatesAreClose(
  first: number,
  second: number
): boolean {

  return Math.abs(first - second) < 0.0008
}
