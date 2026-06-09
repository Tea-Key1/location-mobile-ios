import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
} from "react-native"

import {
  design,
} from "../../styles/design"

type Props = {
  title: string
  onPress: () => void
  loading?: boolean
  disabled?: boolean
  variant?: "filled" | "outline"
}

export default function PrimaryButton({
  title,
  onPress,
  loading = false,
  disabled = false,
  variant = "filled",
}: Props) {

  const isOutline =
    variant === "outline"

  return (
    <TouchableOpacity
      activeOpacity={0.86}
      disabled={disabled || loading}
      onPress={onPress}
      style={[
        styles.button,
        isOutline && styles.outline,
        (disabled || loading) && styles.disabled,
      ]}
    >
      {loading ? (
        <ActivityIndicator
          color={
            isOutline
              ? design.colors.greenDark
              : "#FFFFFF"
          }
        />
      ) : (
        <Text
          style={[
            styles.text,
            isOutline && styles.outlineText,
          ]}
        >
          {title}
        </Text>
      )}
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  button: {
    minHeight: 56,
    borderRadius: design.radius.button,
    backgroundColor: design.colors.greenDark,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 22,
    paddingVertical: 16,
  },
  outline: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: design.colors.greenDark,
  },
  disabled: {
    opacity: 0.55,
  },
  text: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  outlineText: {
    color: design.colors.greenDark,
  },
})
