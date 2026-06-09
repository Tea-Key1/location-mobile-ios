import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native"

import Ionicons
from "@expo/vector-icons/Ionicons"

import {
  design,
} from "../../styles/design"

type Props = {
  title: string
  detail?: string
  tone?: "green" | "pink" | "blue" | "yellow"
  onPress: () => void
}

const toneColor = {
  green: design.colors.green,
  pink: design.colors.pink,
  blue: design.colors.blue,
  yellow: design.colors.yellow,
}

export default function ChoiceCard({
  title,
  detail,
  tone = "green",
  onPress,
}: Props) {

  return (
    <TouchableOpacity
      activeOpacity={0.84}
      onPress={onPress}
      style={styles.card}
    >
      <View
        style={[
          styles.mark,
          {
            backgroundColor:
              toneColor[tone],
          },
        ]}
      />

      <View style={styles.copy}>
        <Text style={styles.title}>
          {title}
        </Text>

        {detail ? (
          <Text style={styles.detail}>
            {detail}
          </Text>
        ) : null}
      </View>

      <Ionicons
        name="chevron-forward"
        size={18}
        color={design.colors.faint}
      />
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  card: {
    minHeight: 72,
    borderRadius: design.radius.card,
    backgroundColor: design.colors.surface,
    borderWidth: 1,
    borderColor: design.colors.softLine,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 12,
    ...design.shadow,
  },
  mark: {
    width: 7,
    alignSelf: "stretch",
    borderRadius: design.radius.pill,
    marginRight: 14,
  },
  copy: {
    flex: 1,
  },
  title: {
    color: design.colors.ink,
    fontSize: 18,
    fontWeight: "700",
  },
  detail: {
    marginTop: 4,
    color: design.colors.muted,
    fontSize: 13,
    lineHeight: 18,
  },
})
