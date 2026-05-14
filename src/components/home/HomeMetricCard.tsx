import { useAppTheme } from "@/src/theme/useTheme";
import { Ionicons } from "@expo/vector-icons";
import { Text, View } from "react-native";

type Props = {
  label: string;
  value: string;
  icon: keyof typeof Ionicons.glyphMap;
};

export function HomeMetricCard({ label, value, icon }: Props) {
  const { colors } = useAppTheme();

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.card,
        borderRadius: 22,
        padding: 14,
        borderWidth: 1,
        borderColor: colors.softBorder,
        minHeight: 108,
      }}
    >
      <View
        style={{
          width: 36,
          height: 36,
          borderRadius: 14,
          backgroundColor: colors.primarySoft,
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 12,
        }}
      >
        <Ionicons name={icon} size={18} color={colors.primary} />
      </View>

      <Text
        style={{
          color: colors.text,
          fontSize: 20,
          fontWeight: "900",
        }}
      >
        {value}
      </Text>

      <Text
        numberOfLines={2}
        style={{
          color: colors.mutedText,
          fontSize: 12,
          lineHeight: 16,
          fontWeight: "700",
          marginTop: 3,
        }}
      >
        {label}
      </Text>
    </View>
  );
}