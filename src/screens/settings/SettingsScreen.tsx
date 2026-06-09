// src/screens/settings/SettingsScreen.tsx

import {
  Alert,
  StyleSheet,
  Text,
  View,
} from "react-native"

import PrimaryButton
from "../../components/common/PrimaryButton"

import ScreenShell
from "../../components/common/ScreenShell"

import {
  design,
} from "../../styles/design"

type Props = {
  logout: () => Promise<void>
}

export default function SettingsScreen({
  logout,
}: Props) {

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

  return (
    <ScreenShell
      eyebrow="Settings"
      title="Keep Roamie tidy."
      subtitle="A quiet little control room for your session."
    >
      <View style={styles.panel}>
        <Text style={styles.panelTitle}>
          Account
        </Text>

        <Text style={styles.panelText}>
          Logout revokes active sessions through the API before this device clears local data.
        </Text>
      </View>

      <View style={styles.buttonWrap}>
        <PrimaryButton
          title="Logout"
          variant="outline"
          onPress={handleLogout}
        />
      </View>
    </ScreenShell>
  )
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
})
