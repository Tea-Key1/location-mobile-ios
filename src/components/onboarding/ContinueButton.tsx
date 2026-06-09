// src/components/onboarding/ContinueButton.tsx

import React from "react"

import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
} from "react-native"

import {
  design,
} from "../../styles/design"

type Props = {
  title?: string
  onPress: () => void
  loading?: boolean
  disabled?: boolean
}

export default function ContinueButton({
  title = "続ける",
  onPress,
  loading = false,
  disabled = false,
}: Props) {

  return (
    <TouchableOpacity
      style={[
        styles.button,
        disabled && styles.disabled,
      ]}
      onPress={onPress}
      activeOpacity={0.85}
      disabled={disabled || loading}
    >

      {
        loading ? (
          <ActivityIndicator color="#FFF" />
        ) : (
          <Text style={styles.text}>
            {title}
          </Text>
        )
      }

    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({

  button: {
    width: "100%",
    height: 58,

    backgroundColor: design.colors.greenDark,

    borderRadius: design.radius.button,

    justifyContent: "center",
    alignItems: "center",

    marginTop: 24,
  },

  disabled: {
    opacity: 0.5,
  },

  text: {
    color: "#FFF",
    fontSize: 17,
    fontWeight: "700",
  },
})
