import {
  useEffect,
  useRef,
} from "react"

import {
  Animated,
  StyleSheet,
  View,
} from "react-native"

import Svg, {
  Circle,
  Defs,
  G,
  LinearGradient,
  Path,
  Rect,
  Stop,
} from "react-native-svg"

import {
  design,
} from "../../styles/design"

type Props = {
  compact?: boolean
}

export default function AmbientMap({
  compact = false,
}: Props) {

  const drift =
    useRef(new Animated.Value(0)).current

  useEffect(() => {

    const animation =
      Animated.loop(
        Animated.sequence([
          Animated.timing(drift, {
            toValue: 1,
            duration: 5200,
            useNativeDriver: true,
          }),
          Animated.timing(drift, {
            toValue: 0,
            duration: 5200,
            useNativeDriver: true,
          }),
        ])
      )

    animation.start()

    return () => {
      animation.stop()
    }
  }, [drift])

  const translateY =
    drift.interpolate({
      inputRange: [0, 1],
      outputRange: [0, compact ? -8 : -14],
    })

  const rotate =
    drift.interpolate({
      inputRange: [0, 1],
      outputRange: ["0deg", "1.5deg"],
    })

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.container,
        compact && styles.compact,
        {
          transform: [
            { translateY },
            { rotate },
          ],
        },
      ]}
    >
      <View style={styles.sheet}>
        <Svg
          width="100%"
          height="100%"
          viewBox="0 0 340 230"
        >
          <Defs>
            <LinearGradient
              id="paper"
              x1="0"
              y1="0"
              x2="1"
              y2="1"
            >
              <Stop
                offset="0"
                stopColor="#FFFFFF"
              />
              <Stop
                offset="1"
                stopColor="#F7F0E5"
              />
            </LinearGradient>
          </Defs>

          <Rect
            x="2"
            y="2"
            width="336"
            height="226"
            rx="8"
            fill="url(#paper)"
            stroke={design.colors.line}
            strokeWidth="1.5"
          />

          <G opacity="0.78">
            <Path
              d="M-8 72 C42 48 66 96 110 78 C154 60 166 18 224 36 C270 50 284 96 350 78"
              fill="none"
              stroke={design.colors.blue}
              strokeWidth="18"
              strokeLinecap="round"
            />
            <Path
              d="M-12 152 C48 132 78 166 122 142 C166 118 194 144 236 126 C284 106 300 138 352 120"
              fill="none"
              stroke={design.colors.mint}
              strokeWidth="20"
              strokeLinecap="round"
            />
            <Path
              d="M42 18 L88 220"
              stroke={design.colors.softLine}
              strokeWidth="8"
              strokeLinecap="round"
            />
            <Path
              d="M154 -8 L132 240"
              stroke={design.colors.softLine}
              strokeWidth="7"
              strokeLinecap="round"
            />
            <Path
              d="M248 0 L222 236"
              stroke={design.colors.softLine}
              strokeWidth="7"
              strokeLinecap="round"
            />
            <Path
              d="M12 44 C76 62 96 34 148 52 C214 76 246 54 326 68"
              fill="none"
              stroke={design.colors.yellow}
              strokeWidth="5"
              strokeLinecap="round"
            />
            <Path
              d="M36 196 C102 170 140 210 202 178 C246 156 286 172 326 146"
              fill="none"
              stroke={design.colors.pink}
              strokeWidth="5"
              strokeLinecap="round"
            />
          </G>

          <Circle
            cx="198"
            cy="102"
            r="11"
            fill={design.colors.green}
          />
          <Circle
            cx="198"
            cy="102"
            r="21"
            fill="none"
            stroke={design.colors.green}
            strokeOpacity="0.18"
            strokeWidth="9"
          />
          <Circle
            cx="94"
            cy="154"
            r="7"
            fill={design.colors.pink}
          />
          <Circle
            cx="274"
            cy="62"
            r="7"
            fill={design.colors.yellow}
          />
        </Svg>
      </View>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    height: 230,
  },
  compact: {
    height: 156,
  },
  sheet: {
    flex: 1,
    borderRadius: design.radius.card,
    overflow: "hidden",
    ...design.shadow,
  },
})
