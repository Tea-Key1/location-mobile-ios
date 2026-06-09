// src/components/onboarding/SelectCard.tsx

import React from "react"

import {
  TouchableOpacity,
  Text,
  StyleSheet,
} from "react-native"

import {
  design,
} from "../../styles/design"

type Props = {
  title: string
  selected?: boolean
  onPress: () => void
}

export default function SelectCard({
  title,
  selected = false,
  onPress,
}: Props) {

  return (
    <TouchableOpacity
      style={[
        styles.card,
        selected && styles.selected,
      ]}
      onPress={onPress}
      activeOpacity={0.8}
    >

      <Text
        style={[
          styles.text,
          selected && styles.selectedText,
        ]}
      >
        {title}
      </Text>

    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({

  card: {
    width: "100%",
    paddingVertical: 18,
    paddingHorizontal: 20,

    borderRadius: design.radius.card,

    borderWidth: 1,
    borderColor: design.colors.softLine,

    backgroundColor: design.colors.surface,

    marginBottom: 14,
  },

  selected: {
    backgroundColor: design.colors.greenDark,
    borderColor: design.colors.greenDark,
  },

  text: {
    fontSize: 16,
    fontWeight: "600",
    color: design.colors.ink,
  },

  selectedText: {
    color: "#FFF",
  },
})
