import {
  useCallback,
  useEffect,
  useState,
} from "react"

import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native"

import {
  SafeAreaView,
} from "react-native-safe-area-context"

import {
  getSimilarityRankings,
  SimilarityRankingItem,
  SimilarityRankingPeriod,
} from "../../api/location"

import {
  formatRankingError,
} from "../../utils/apiErrors"

import {
  design,
} from "../../styles/design"

const periods: Array<{
  label: string
  value: SimilarityRankingPeriod
}> = [
  {
    label: "Week",
    value: "week",
  },
  {
    label: "Month",
    value: "month",
  },
  {
    label: "Year",
    value: "year",
  },
]

export default function RankingsScreen() {

  const [
    period,
    setPeriod,
  ] = useState<SimilarityRankingPeriod>("week")

  const [
    items,
    setItems,
  ] = useState<SimilarityRankingItem[]>([])

  const [
    loading,
    setLoading,
  ] = useState(false)

  const [
    refreshing,
    setRefreshing,
  ] = useState(false)

  const [
    errorText,
    setErrorText,
  ] = useState<string | null>(null)

  const loadRankings =
    useCallback(async (
      nextPeriod: SimilarityRankingPeriod,
      refresh = false
    ) => {

      try {

        if (refresh) {
          setRefreshing(true)
        } else {
          setLoading(true)
        }

        setErrorText(null)

        const response =
          await getSimilarityRankings(
            nextPeriod
          )

        setItems(response.items)

      } catch (error) {

        console.log(
          "load rankings error:",
          error
        )

        setItems([])

        setErrorText(
          formatRankingError(error)
        )

      } finally {

        setLoading(false)
        setRefreshing(false)
      }
    }, [])

  useEffect(() => {
    loadRankings(period)
  }, [
    loadRankings,
    period,
  ])

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() =>
              loadRankings(period, true)
            }
          />
        }
      >
        <View style={styles.header}>
          <Text style={styles.kicker}>
            History
          </Text>

          <Text style={styles.title}>
            Best matching towns.
          </Text>
        </View>

        <View style={styles.segment}>
          {periods.map((item) => {
            const selected =
              item.value === period

            return (
              <Pressable
                key={item.value}
                style={[
                  styles.segmentButton,
                  selected &&
                    styles.segmentButtonActive,
                ]}
                onPress={() =>
                  setPeriod(item.value)
                }
              >
                <Text
                  style={[
                    styles.segmentText,
                    selected &&
                      styles.segmentTextActive,
                  ]}
                >
                  {item.label}
                </Text>
              </Pressable>
            )
          })}
        </View>

        {loading ? (
          <View style={styles.loading}>
            <ActivityIndicator
              color={design.colors.green}
            />
          </View>
        ) : null}

        {!loading && errorText ? (
          <Text style={styles.message}>
            {errorText}
          </Text>
        ) : null}

        {!loading &&
          !errorText &&
          items.length === 0 ? (
            <Text style={styles.message}>
              Check similarity in a few places to build your ranking.
            </Text>
          ) : null}

        <View style={styles.list}>
          {items.map((item) => (
            <RankingRow
              key={`${item.rank}-${formatArea(item.area)}`}
              item={item}
            />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

function RankingRow({
  item,
}: {
  item: SimilarityRankingItem
}) {

  const average =
    Math.round(
      item.average_similarity * 100
    )

  const best =
    typeof item.best_similarity === "number"
      ? Math.round(
          item.best_similarity * 100
        )
      : null

  const latest =
    formatLatestCheckedAt(
      item.latest_checked_at
    )

  return (
    <View style={styles.row}>
      <Text style={styles.rank}>
        #{item.rank}
      </Text>

      <View style={styles.rowBody}>
        <Text style={styles.area}>
          {formatArea(item.area)}
        </Text>

        <Text style={styles.meta}>
          {item.check_count} checks
          {best === null
            ? ""
            : ` · best ${best}%`}
          {latest
            ? ` · ${latest}`
            : ""}
        </Text>
      </View>

      <Text style={styles.score}>
        {average}%
      </Text>
    </View>
  )
}

function formatArea(
  area: SimilarityRankingItem["area"]
): string {

  const values = [
    area.prefecture,
    area.city,
    area.district,
  ].filter(Boolean)

  return values.length > 0
    ? values.join(" ")
    : "Unknown"
}

function formatLatestCheckedAt(
  value?: string | null
): string | null {

  if (!value) {
    return null
  }

  const date =
    new Date(value)

  if (Number.isNaN(date.getTime())) {
    return null
  }

  const year =
    date.getFullYear()

  const month =
    String(date.getMonth() + 1)
      .padStart(2, "0")

  const day =
    String(date.getDate())
      .padStart(2, "0")

  return `${year}-${month}-${day}`
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: design.colors.paper,
  },
  content: {
    paddingHorizontal: 22,
    paddingTop: 12,
    paddingBottom: 32,
  },
  header: {
    marginBottom: 18,
  },
  kicker: {
    color: design.colors.green,
    fontSize: 12,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0,
    marginBottom: 8,
  },
  title: {
    color: design.colors.ink,
    fontSize: 32,
    lineHeight: 37,
    fontWeight: "800",
  },
  segment: {
    flexDirection: "row",
    padding: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: design.colors.softLine,
    backgroundColor: design.colors.surface,
    marginBottom: 16,
  },
  segmentButton: {
    flex: 1,
    minHeight: 42,
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  segmentButtonActive: {
    backgroundColor: design.colors.green,
  },
  segmentText: {
    color: design.colors.muted,
    fontSize: 13,
    fontWeight: "700",
  },
  segmentTextActive: {
    color: design.colors.surface,
  },
  loading: {
    minHeight: 80,
    alignItems: "center",
    justifyContent: "center",
  },
  message: {
    color: design.colors.muted,
    fontSize: 14,
    lineHeight: 20,
    marginTop: 8,
  },
  list: {
    gap: 10,
  },
  row: {
    minHeight: 78,
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: design.colors.softLine,
    backgroundColor: design.colors.surface,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  rank: {
    width: 42,
    color: design.colors.greenDark,
    fontSize: 16,
    fontWeight: "800",
  },
  rowBody: {
    flex: 1,
    paddingRight: 10,
  },
  area: {
    color: design.colors.ink,
    fontSize: 15,
    lineHeight: 20,
    fontWeight: "800",
  },
  meta: {
    color: design.colors.muted,
    fontSize: 12,
    lineHeight: 17,
    marginTop: 2,
  },
  score: {
    color: design.colors.ink,
    fontSize: 22,
    fontWeight: "800",
  },
})
