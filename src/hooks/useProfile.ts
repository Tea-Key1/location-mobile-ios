// src/hooks/useProfile.ts

import {
  useEffect,
  useState,
} from "react"

import {
  getMyProfile,
  updateHomeLocation,
  ProfileResponse,
  UpdateHomeRequest,
} from "../api/profile"

export function useProfile() {

  // =========================================
  // state
  // =========================================

  const [
    profile,
    setProfile,
  ] = useState<ProfileResponse | null>(
    null
  )

  const [
    loading,
    setLoading,
  ] = useState(true)

  const [
    saving,
    setSaving,
  ] = useState(false)

  // =========================================
  // load profile
  // =========================================

  useEffect(() => {

    loadProfile()

  }, [])

  // =========================================
  // get profile
  // =========================================

  const loadProfile = async () => {

    try {

      setLoading(true)

      const data =
        await getMyProfile()

      setProfile(data)

    } catch (error) {

      console.log(
        "loadProfile error",
        error
      )

    } finally {

      setLoading(false)
    }
  }

  // =========================================
  // save profile
  // =========================================

  const saveProfile = async (
    values: UpdateHomeRequest
  ) => {

    try {

      setSaving(true)

      const updated =
        await updateHomeLocation(
          values
        )

      setProfile(
        updated.profile
      )

      console.log(
        "profile updated"
      )

    } catch (error) {

      console.log(
        "saveProfile error",
        error
      )

      throw error

    } finally {

      setSaving(false)
    }
  }

  // =========================================
  // update local state
  // =========================================

  const patchProfile = (
    values: Partial<ProfileResponse>
  ) => {

    setProfile((prev) =>
      prev
        ? {

            ...prev,

            ...values,
          }
        : null
    )
  }

  // =========================================
  // return
  // =========================================

  return {

    profile,

    loading,

    saving,

    loadProfile,

    saveProfile,

    patchProfile,
  }
}
