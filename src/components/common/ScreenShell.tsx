import {
  ReactNode,
} from "react"

import {
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native"

import {
  SafeAreaView,
} from "react-native-safe-area-context"

import AmbientMap
from "./AmbientMap"

import {
  design,
} from "../../styles/design"

type Props = {
  eyebrow?: string
  title: string
  subtitle?: string
  children: ReactNode
  map?: boolean
  scroll?: boolean
}

export default function ScreenShell({
  eyebrow,
  title,
  subtitle,
  children,
  map = true,
  scroll = false,
}: Props) {

  const content = (
    <>
      {map ? (
        <View style={styles.mapWrap}>
          <AmbientMap compact />
        </View>
      ) : null}

      <View style={styles.header}>
        {eyebrow ? (
          <Text style={styles.eyebrow}>
            {eyebrow}
          </Text>
        ) : null}

        <Text style={styles.title}>
          {title}
        </Text>

        {subtitle ? (
          <Text style={styles.subtitle}>
            {subtitle}
          </Text>
        ) : null}
      </View>

      {children}
    </>
  )

  return (
    <SafeAreaView style={styles.safe}>
      {scroll ? (
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
        >
          {content}
        </ScrollView>
      ) : (
        <View style={styles.content}>
          {content}
        </View>
      )}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: design.colors.paper,
  },
  content: {
    flex: 1,
    paddingHorizontal: 22,
    paddingTop: 14,
    paddingBottom: 28,
  },
  scroll: {
    paddingHorizontal: 22,
    paddingTop: 14,
    paddingBottom: 28,
  },
  mapWrap: {
    marginBottom: 24,
  },
  header: {
    marginBottom: 26,
  },
  eyebrow: {
    color: design.colors.green,
    fontSize: 12,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 9,
  },
  title: {
    color: design.colors.ink,
    fontSize: 35,
    lineHeight: 40,
    fontWeight: "800",
  },
  subtitle: {
    color: design.colors.muted,
    fontSize: 16,
    lineHeight: 23,
    marginTop: 11,
  },
})
