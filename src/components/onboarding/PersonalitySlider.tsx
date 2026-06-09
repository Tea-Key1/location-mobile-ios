// src/components/onboarding/PersonalitySlider.tsx

import React from "react"

import {
  View,
  Text,
  StyleSheet,
} from "react-native"

import Slider from "@react-native-community/slider"

import {
  design,
} from "../../styles/design"

type Props = {
  value: number
  onChange: (value: number) => void
}

export default function PersonalitySlider({
  value,
  onChange,
}: Props) {

  const getLabel = () => {

    if (value <= 25) {
      return "穏やか"
    }

    if (value <= 50) {
      return "落ち着き"
    }

    if (value <= 75) {
      return "アクティブ"
    }

    return "冒険好き"
  }

  return (
    <View style={styles.container}>

      <Text style={styles.title}>
        あなたの性格
      </Text>

      <Text style={styles.label}>
        {getLabel()}
      </Text>

      <Slider
        minimumValue={0}
        maximumValue={100}
        step={1}
        value={value}
        onValueChange={onChange}
        minimumTrackTintColor={design.colors.greenDark}
        maximumTrackTintColor={design.colors.softLine}
        thumbTintColor={design.colors.greenDark}
      />

      <View style={styles.row}>

        <Text style={styles.small}>
          穏やか
        </Text>

        <Text style={styles.small}>
          冒険
        </Text>

      </View>
    </View>
  )
}

const styles = StyleSheet.create({

  container: {
    width: "100%",
    marginTop: 24,
  },

  title: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 12,
    color: design.colors.ink,
  },

  label: {
    fontSize: 24,
    fontWeight: "800",
    color: design.colors.greenDark,
    textAlign: "center",
    marginBottom: 24,
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },

  small: {
    fontSize: 12,
    color: design.colors.muted,
  },
})
