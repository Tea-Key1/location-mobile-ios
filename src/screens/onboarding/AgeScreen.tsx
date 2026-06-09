import {
  useNavigation,
} from "@react-navigation/native"

import ChoiceCard
from "../../components/common/ChoiceCard"

import ScreenShell
from "../../components/common/ScreenShell"

const ages = [
  {
    label: "10s",
    detail: "Curious routes, light plans.",
    tone: "blue" as const,
  },
  {
    label: "20s",
    detail: "Fresh corners and flexible days.",
    tone: "pink" as const,
  },
  {
    label: "30s",
    detail: "Balanced pace, good discoveries.",
    tone: "green" as const,
  },
  {
    label: "40s",
    detail: "Comfort, texture, and room to breathe.",
    tone: "yellow" as const,
  },
  {
    label: "50s",
    detail: "Thoughtful places with a slower glow.",
    tone: "blue" as const,
  },
  {
    label: "60s",
    detail: "Gentle walks and familiar ease.",
    tone: "green" as const,
  },
  {
    label: "70s+",
    detail: "Calm paths and close-at-hand charm.",
    tone: "pink" as const,
  },
]

export default function AgeScreen() {

  const navigation = useNavigation<any>()

  return (
    <ScreenShell
      eyebrow="Step 1"
      title="Your age range"
      subtitle="This helps Roamie tune the pace and texture of each place."
      scroll
    >
      {ages.map((age) => (
        <ChoiceCard
          key={age.label}
          title={age.label}
          detail={age.detail}
          tone={age.tone}
          onPress={() =>
            navigation.navigate(
              "Gender",
              {
                age_group:
                  age.label,
              }
            )
          }
        />
      ))}
    </ScreenShell>
  )
}
