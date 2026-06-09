// src/components/common/ErrorView.tsx

import React from "react"

import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from "react-native"

import {
  design,
} from "../../styles/design"

type Props = {
  title?: string
  message?: string
  buttonTitle?: string
  onRetry?: () => void
}

export default function ErrorView({
  title = "エラーが発生しました",
  message = "通信環境をご確認ください。",
  buttonTitle = "再試行",
  onRetry,
}: Props) {

  return (
    <View style={styles.container}>

      <View style={styles.signal}>
        <View style={styles.signalLine} />
      </View>

      <Text style={styles.title}>
        {title}
      </Text>

      <Text style={styles.message}>
        {message}
      </Text>

      {
        onRetry && (
          <TouchableOpacity
            style={styles.button}
            onPress={onRetry}
            activeOpacity={0.85}
          >
            <Text style={styles.buttonText}>
              {buttonTitle}
            </Text>
          </TouchableOpacity>
        )
      }

    </View>
  )
}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
    backgroundColor: design.colors.paper,
  },

  signal: {
    width: 64,
    height: 64,
    borderRadius: design.radius.card,
    borderWidth: 1,
    borderColor: design.colors.softLine,
    backgroundColor: design.colors.surface,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    ...design.shadow,
  },

  signalLine: {
    width: 34,
    height: 5,
    borderRadius: design.radius.pill,
    backgroundColor: design.colors.danger,
  },

  title: {
    fontSize: 22,
    fontWeight: "800",
    color: design.colors.ink,
    marginBottom: 10,
    textAlign: "center",
  },

  message: {
    fontSize: 15,
    color: design.colors.muted,
    lineHeight: 24,
    textAlign: "center",
  },

  button: {
    marginTop: 28,
    backgroundColor: design.colors.greenDark,
    paddingVertical: 16,
    paddingHorizontal: 28,
    borderRadius: design.radius.button,
  },

  buttonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "700",
  },
})
