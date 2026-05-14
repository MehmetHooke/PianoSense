import { useAppTheme } from "@/src/theme/useTheme";
import {
    getWeakAreaContent,
    type WeakArea,
} from "@/src/utils/insights";
import { Ionicons } from "@expo/vector-icons";
import { Text, View } from "react-native";

type Props = {
  weakestArea: WeakArea;
};

function getWeakAreaIcon(weakestArea: WeakArea): keyof typeof Ionicons.glyphMap {
  switch (weakestArea) {
    case "timing":
      return "timer";

    case "pitch":
      return "musical-notes";

    case "missed":
      return "remove-circle";

    case "extra":
      return "add-circle";

    case "none":
    default:
      return "sparkles";
  }
}

export function WeakAreaCard({ weakestArea }: Props) {
  const { colors } = useAppTheme();
  const content = getWeakAreaContent(weakestArea);

  return (
    <View
      style={{
        backgroundColor: colors.card,
        borderRadius: 24,
        padding: 16,
        borderWidth: 1,
        borderColor: colors.softBorder,
        marginTop: 16,
        shadowColor: colors.shadow,
        shadowOpacity: 0.05,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 6 },
        elevation: 2,
      }}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "flex-start",
          gap: 13,
        }}
      >
        <View
          style={{
            width: 46,
            height: 46,
            borderRadius: 17,
            backgroundColor:
              weakestArea === "none" ? colors.successSoft : colors.warningSoft,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Ionicons
            name={getWeakAreaIcon(weakestArea)}
            size={22}
            color={
              weakestArea === "none"
                ? colors.successForeground
                : colors.warningForeground
            }
          />
        </View>

        <View style={{ flex: 1 }}>
          <Text
            style={{
              color: colors.mutedText,
              fontSize: 12,
              fontWeight: "800",
              textTransform: "uppercase",
              letterSpacing: 0.7,
            }}
          >
            Geliştirme Alanı
          </Text>

          <Text
            style={{
              color: colors.text,
              fontSize: 17,
              fontWeight: "900",
              marginTop: 4,
            }}
          >
            {content.title}
          </Text>

          <Text
            style={{
              color: colors.mutedText,
              fontSize: 13,
              fontWeight: "600",
              lineHeight: 20,
              marginTop: 6,
            }}
          >
            {content.description}
          </Text>
        </View>
      </View>
    </View>
  );
}