import {
  useNavigation,
  useRoute,
} from "@react-navigation/native"

import ChoiceCard
from "../../components/common/ChoiceCard"

import ScreenShell
from "../../components/common/ScreenShell"

const genders = [
  {
    label: "Male",
    value: "male",
    detail: "Keep recommendations quietly personal.",
    tone: "green" as const,
  },
  {
    label: "Female",
    value: "female",
    detail: "Shape the match with a softer signal.",
    tone: "pink" as const,
  },
  {
    label: "Other",
    value: "other",
    detail: "Use a broad, flexible profile.",
    tone: "blue" as const,
  },
]

export default function GenderScreen() {

  const navigation = useNavigation<any>()

  const route = useRoute<any>()

  return (
    <ScreenShell
      eyebrow="Step 2"
      title="How should we tune it?"
      subtitle="Choose the profile setting that feels closest today."
      scroll
    >
      {genders.map((gender) => (
        <ChoiceCard
          key={gender.value}
          title={gender.label}
          detail={gender.detail}
          tone={gender.tone}
          onPress={() =>
            navigation.navigate(
              "Personality",
              {
                age_group:
                  route.params?.age_group,

                gender:
                  gender.value,
              }
            )
          }
        />
      ))}
    </ScreenShell>
  )
}
