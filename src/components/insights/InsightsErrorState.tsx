import { useAppTheme } from "@/src/theme/useTheme";
import { Ionicons } from "@expo/vector-icons";
import { Pressable, Text, View } from "react-native";

type Props = {
  onRetry: () => void;
};

export function InsightsErrorState({ onRetry }: Props) {
  const { colors } = useAppTheme();

  return (
    <View
      style={{
        backgroundColor: colors.card,
        borderRadius: 28,
        padding: 22,
        borderWidth: 1,
        borderColor: colors.softBorder,
        alignItems: "center",
        marginTop: 18,
      }}
    >
      <View
        style={{
          width: 76,
          height: 76,
          borderRadius: 28,
          backgroundColor: colors.dangerSoft,
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 16,
        }}
      >
        <Ionicons
          name="alert-circle"
          size={34}
          color={colors.dangerForeground}
        />
      </View>

      <Text
        style={{
          color: colors.text,
          fontSize: 20,
          fontWeight: "900",
          textAlign: "center",
          letterSpacing: -0.4,
        }}
      >
        Analizler yüklenemedi
      </Text>

      <Text
        style={{
          color: colors.mutedText,
          fontSize: 14,
          fontWeight: "600",
          lineHeight: 21,
          textAlign: "center",
          marginTop: 8,
          maxWidth: 290,
        }}
      >
        Geçmiş analizlerini getirirken bir sorun oluştu. Bağlantını kontrol
        edip tekrar deneyebilirsin.
      </Text>

      <Pressable
        onPress={onRetry}
        style={({ pressed }) => ({
          marginTop: 18,
          backgroundColor: colors.danger,
          paddingHorizontal: 18,
          paddingVertical: 13,
          borderRadius: 18,
          flexDirection: "row",
          alignItems: "center",
          gap: 8,
          opacity: pressed ? 0.9 : 1,
          transform: [{ scale: pressed ? 0.98 : 1 }],
        })}
      >
        <Ionicons
          name="refresh"
          size={18}
          color={colors.primaryForeground}
        />

        <Text
          style={{
            color: colors.primaryForeground,
            fontSize: 14,
            fontWeight: "900",
          }}
        >
          Tekrar dene
        </Text>
      </Pressable>
    </View>
  );
}