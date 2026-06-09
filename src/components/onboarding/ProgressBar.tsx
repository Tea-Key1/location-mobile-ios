// src/components/onboarding/ProgressBar.tsx

import React from "react"
import {
  View,
  StyleSheet,
} from "react-native"

import {
  design,
} from "../../styles/design"

type Props = {
  currentStep: number
  totalSteps: number
}

export default function ProgressBar({
  currentStep,
  totalSteps,
}: Props) {

  const progress =
    (currentStep / totalSteps) * 100

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.progress,
          {
            width: `${progress}%`,
          },
        ]}
      />
    </View>
  )
}

const styles = StyleSheet.create({

  container: {
    width: "100%",
    height: 8,
    backgroundColor: design.colors.softLine,
    borderRadius: 999,
    overflow: "hidden",
  },

  progress: {
    height: "100%",
    backgroundColor: design.colors.greenDark,
    borderRadius: 999,
  },
})
