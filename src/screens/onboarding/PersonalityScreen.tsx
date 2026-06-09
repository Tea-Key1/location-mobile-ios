import {
  useNavigation,
  useRoute,
} from "@react-navigation/native"

import ChoiceCard
from "../../components/common/ChoiceCard"

import ScreenShell
from "../../components/common/ScreenShell"

const personalities = [
  {
    label: "Still",
    detail: "Quiet streets, soft light, room for your thoughts.",
    tone: "green" as const,
  },
  {
    label: "Bright",
    detail: "Color, movement, and places with a small spark.",
    tone: "pink" as const,
  },
  {
    label: "Roaming",
    detail: "A little less planned, a little more alive.",
    tone: "blue" as const,
  },
  {
    label: "Polished",
    detail: "Clean details, comfort, and a touch of ceremony.",
    tone: "yellow" as const,
  },
]

export default function PersonalityScreen() {

  const navigation = useNavigation<any>()

  const route = useRoute<any>()

  const getPersonalityScores = (
    personality: string
  ) => {

    return {
      calm:
        personality === "Still"
          ? 1
          : 0.25,

      vivid:
        personality === "Bright"
          ? 1
          : 0.25,

      roamer:
        personality === "Roaming"
          ? 1
          : 0.25,

      luxury:
        personality === "Polished"
          ? 1
          : 0.25,

      nature:
        personality === "Still"
          ? 0.75
          : 0.35,

      nightlife:
        personality === "Bright"
          ? 0.7
          : 0.2,

      local:
        personality === "Roaming"
          ? 0.8
          : 0.45,

      creative:
        personality === "Bright"
          ? 0.85
          : 0.4,
    }
  }

  return (
    <ScreenShell
      eyebrow="Step 3"
      title="Pick a travel mood"
      subtitle="No need to overthink it. Choose the shape that feels most like you."
      scroll
    >
      {personalities.map((item) => (
        <ChoiceCard
          key={item.label}
          title={item.label}
          detail={item.detail}
          tone={item.tone}
          onPress={() =>
            navigation.navigate(
              "HomeLocation",
              {
                age_group:
                  route.params?.age_group,

                gender:
                  route.params?.gender,

                ...getPersonalityScores(
                  item.label
                ),
              }
            )
          }
        />
      ))}
    </ScreenShell>
  )
}
