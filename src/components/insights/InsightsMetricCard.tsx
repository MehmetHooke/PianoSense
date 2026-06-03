import { useAppTheme } from "@/src/theme/useTheme";
import { Ionicons } from "@expo/vector-icons";
import { Text, View } from "react-native";

type Props = {
  title: string;
  value: string;
  description?: string;
  icon: keyof typeof Ionicons.glyphMap;
};

export function InsightsMetricCard({
  title,
  value,
  description,
  icon,
}: Props) {
  const { colors } = useAppTheme();

  return (
    <View
      style={{
        flex: 1,
        minWidth: "47%",
        backgroundColor: colors.card,
        borderRadius: 22,
        padding: 14,
        borderWidth: 1,
        borderColor: colors.softBorder,
        shadowColor: colors.shadow,
        shadowOpacity: 0.06,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 6 },
        elevation: 2,
      }}
    >
      <View
        style={{
          width: 38,
          height: 38,
          borderRadius: 14,
          backgroundColor: colors.primarySoft,
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 12,
        }}
      >
        <Ionicons name={icon} size={19} color={colors.primary} />
      </View>

      <Text
        style={{
          color: colors.text,
          fontSize: 22,
          fontWeight: "900",
          letterSpacing: -0.4,
        }}
      >
        {value}
      </Text>

      <Text
        style={{
          color: colors.primary,
          fontSize: 13,
          fontWeight: "800",
          marginTop: 3,
        }}
        numberOfLines={1}
      >
        {title}
      </Text>

      {description ? (
        <Text
          style={{
            color: colors.mutedText,
            fontSize: 12,
            fontWeight: "600",
            lineHeight: 16,
            marginTop: 5,
          }}
          numberOfLines={2}
        >
          {description}
        </Text>
      ) : null}
    </View>
  );
}