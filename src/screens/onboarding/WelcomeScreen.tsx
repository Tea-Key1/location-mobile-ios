// src/screens/onboarding/WelcomeScreen.tsx

import {
  View,
  Text,
  StyleSheet,
} from "react-native"

import AmbientMap
from "../../components/common/AmbientMap"

import PrimaryButton
from "../../components/common/PrimaryButton"

import {
  design,
} from "../../styles/design"

type Props = {
  navigation: any
}

export default function WelcomeScreen({
  navigation,
}: Props) {

  return (

    <View style={styles.container}>

      <AmbientMap />

      <Text style={styles.title}>
        Roamie
      </Text>

      <Text style={styles.subtitle}>
        Places that feel quietly right, matched from your home rhythm and where you stand now.
      </Text>

      <View style={styles.buttonWrap}>
        <PrimaryButton
          title="Start"
          onPress={() =>
            navigation.navigate("Age")
          }
        />
      </View>

      <Text style={styles.note}>
        A small guide for softer wandering.
      </Text>

    </View>
  )
}

const styles = StyleSheet.create({

  container: {

    flex: 1,

    justifyContent: "center",

    paddingHorizontal: 24,

    backgroundColor: design.colors.paper,
  },

  title: {

    marginTop: 34,

    fontSize: 44,

    lineHeight: 50,

    fontWeight: "800",

    color: design.colors.ink,
  },

  subtitle: {

    marginTop: 14,

    fontSize: 17,

    lineHeight: 25,

    color: design.colors.muted,
  },

  buttonWrap: {

    marginTop: 38,
  },

  note: {

    marginTop: 18,

    color: design.colors.faint,

    fontSize: 13,

    textAlign: "center",
  },
})
