// src/components/common/LoadingScreen.tsx

import React from "react"

import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
} from "react-native"

import {
  design,
} from "../../styles/design"

type Props = {
  message?: string
}

export default function LoadingScreen({
  message = "読み込み中...",
}: Props) {

  return (
    <View style={styles.container}>

      <ActivityIndicator
        size="large"
        color={design.colors.greenDark}
      />

      <Text style={styles.text}>
        {message}
      </Text>

    </View>
  )
}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: design.colors.paper,
    paddingHorizontal: 24,
  },

  text: {
    marginTop: 18,
    fontSize: 16,
    color: design.colors.greenDark,
    fontWeight: "600",
  },
})
