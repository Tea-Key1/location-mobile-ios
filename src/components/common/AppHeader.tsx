// src/components/common/AppHeader.tsx

import React from "react"

import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from "react-native"

import {
  Ionicons,
} from "@expo/vector-icons"

import {
  design,
} from "../../styles/design"

type Props = {
  title: string
  showBackButton?: boolean
  onBackPress?: () => void
}

export default function AppHeader({
  title,
  showBackButton = false,
  onBackPress,
}: Props) {

  return (
    <View style={styles.container}>

      <View style={styles.side}>

        {
          showBackButton && (
            <TouchableOpacity
              onPress={onBackPress}
              style={styles.backButton}
              activeOpacity={0.8}
            >
              <Ionicons
                name="chevron-back"
                size={24}
                color={design.colors.ink}
              />
            </TouchableOpacity>
          )
        }

      </View>

      <Text style={styles.title}>
        {title}
      </Text>

      <View style={styles.side} />

    </View>
  )
}

const styles = StyleSheet.create({

  container: {
    width: "100%",
    height: 64,

    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",

    paddingHorizontal: 16,

    backgroundColor: design.colors.paper,
  },

  side: {
    width: 48,
    alignItems: "flex-start",
  },

  backButton: {
    width: 42,
    height: 42,

    borderRadius: 999,

    justifyContent: "center",
    alignItems: "center",

    backgroundColor: design.colors.surface,
  },

  title: {
    flex: 1,
    textAlign: "center",

    fontSize: 20,
    fontWeight: "800",

    color: design.colors.ink,
  },
})
