import {
  Alert,
  Linking,
  StyleSheet,
  Text,
  View,
} from "react-native"

import {
  useCallback,
  useState,
} from "react"

import {
  useFocusEffect,
} from "@react-navigation/native"

import PrimaryButton
from "../../components/common/PrimaryButton"

import ScreenShell
from "../../components/common/ScreenShell"

import {
  design,
} from "../../styles/design"

import {
  syncCurrentTrackingConsent,
} from "../../utils/trackingConsent"

import {
  StoredTrackingConsent,
} from "../../store/trackingConsentStorage"

import {
  getToken,
} from "../../store/authStorage"

import {
  syncWatchAccessToken,
} from "../../services/watchSession"

type Props = {
  logout: () => Promise<void>
  deleteAccount: () => Promise<void>
}

export default function SettingsScreen({
  logout,
  deleteAccount,
}: Props) {

  const [
    trackingStatus,
    setTrackingStatus,
  ] = useState<StoredTrackingConsent>(
    "not_determined"
  )

  const [
    deleting,
    setDeleting,
  ] = useState(false)

  const [
    syncingWatch,
    setSyncingWatch,
  ] = useState(false)

  useFocusEffect(
    useCallback(() => {

      let active = true

      const loadTrackingStatus = async () => {

        const status =
          await syncCurrentTrackingConsent()

        if (active) {
          setTrackingStatus(status)
        }
      }

      loadTrackingStatus()

      return () => {
        active = false
      }
    }, [])
  )

  const handleLogout = async () => {

    Alert.alert(
      "Logout",
      "End this session on the server and return to sign in?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },

        {
          text: "Logout",

          style: "destructive",

          onPress: async () => {

            try {

              await logout()

            } catch (error) {

              Alert.alert(
                "Logout failed",
                error instanceof Error
                  ? error.message
                  : "Please try again."
              )
            }
          },
        },
      ]
    )
  }

  const handleOpenTrackingSettings = async () => {

    try {

      await Linking.openSettings()

    } catch (error) {

      Alert.alert(
        "Settings unavailable",
        error instanceof Error
          ? error.message
          : "Open iOS Settings to change tracking permission."
      )
    }
  }

  const handleDeleteAccount = async () => {

    Alert.alert(
      "Delete account",
      "This permanently deletes your Roamie account, profile, saved home area, and location history. This cannot be undone.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },

        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {

            try {

              setDeleting(true)

              await deleteAccount()

            } catch (error) {

              Alert.alert(
                "Delete failed",
                error instanceof Error
                  ? error.message
                  : "Please try again."
              )

            } finally {

              setDeleting(false)
            }
          },
        },
      ]
    )
  }

  const handleSyncWatch = async () => {

    try {

      setSyncingWatch(true)

      const token =
        await getToken()

      if (!token) {
        Alert.alert(
          "Sign in required",
          "Sign in on iPhone before syncing Apple Watch."
        )
        return
      }

      await syncWatchAccessToken(token)

      Alert.alert(
        "Apple Watch synced",
        "Open Roamie on Apple Watch again."
      )

    } catch (error) {

      Alert.alert(
        "Watch sync failed",
        error instanceof Error
          ? error.message
          : "Make sure the Apple Watch simulator is paired and running."
      )

    } finally {

      setSyncingWatch(false)
    }
  }

  return (
    <ScreenShell
      eyebrow="Settings"
      title="Keep Roamie tidy."
      subtitle="A quiet little control room for your session."
      scroll
    >
      <View style={styles.panel}>
        <Text style={styles.panelTitle}>
          Data sharing
        </Text>

        <Text style={styles.panelText}>
          Partner mobility insights are {formatTrackingStatus(trackingStatus)}.
        </Text>

        <Text style={styles.panelText}>
          Roamie syncs this choice for partner insight sharing. Location features still work when sharing is not allowed.
        </Text>
      </View>

      <View style={styles.buttonWrap}>
        <PrimaryButton
          title="Manage tracking permission"
          variant="outline"
          onPress={handleOpenTrackingSettings}
        />
      </View>

      <View style={styles.panelGap}>
        <View style={styles.panel}>
          <Text style={styles.panelTitle}>
            Apple Watch
          </Text>

          <Text style={styles.panelText}>
            Send this iPhone session to Roamie on Apple Watch.
          </Text>
        </View>
      </View>

      <View style={styles.buttonWrap}>
        <PrimaryButton
          title="Sync Apple Watch"
          variant="outline"
          loading={syncingWatch}
          disabled={syncingWatch}
          onPress={handleSyncWatch}
        />
      </View>

      <View style={styles.panelGap}>
        <View style={styles.panel}>
          <Text style={styles.panelTitle}>
            Account
          </Text>

          <Text style={styles.panelText}>
            Logout revokes active sessions through the API before this device clears local data.
          </Text>
        </View>
      </View>

      <View style={styles.buttonWrap}>
        <PrimaryButton
          title="Logout"
          variant="outline"
          onPress={handleLogout}
        />
      </View>

      <View style={styles.dangerWrap}>
        <PrimaryButton
          title="Delete account"
          variant="outline"
          loading={deleting}
          disabled={deleting}
          onPress={handleDeleteAccount}
        />
      </View>
    </ScreenShell>
  )
}

function formatTrackingStatus(
  status: StoredTrackingConsent
) {

  switch (status) {
    case "authorized":
      return "allowed"
    case "denied":
      return "not allowed"
    case "restricted":
      return "restricted"
    case "unavailable":
      return "unavailable"
    case "not_determined":
    default:
      return "not decided"
  }
}

const styles = StyleSheet.create({
  panel: {
    borderRadius: design.radius.card,
    borderWidth: 1,
    borderColor: design.colors.softLine,
    backgroundColor: design.colors.surface,
    padding: 18,
    ...design.shadow,
  },
  panelTitle: {
    color: design.colors.ink,
    fontSize: 18,
    fontWeight: "800",
  },
  panelText: {
    marginTop: 8,
    color: design.colors.muted,
    fontSize: 14,
    lineHeight: 21,
  },
  buttonWrap: {
    marginTop: 18,
  },
  panelGap: {
    marginTop: 24,
  },
  dangerWrap: {
    marginTop: 12,
  },
})
