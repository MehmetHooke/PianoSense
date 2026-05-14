import { useAppTheme } from "@/src/theme/useTheme";
import { Ionicons } from "@expo/vector-icons";
import { Pressable, Text, View } from "react-native";

type Props = {
  onStartPractice: () => void;
};

export function InsightsEmptyState({ onStartPractice }: Props) {
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
          backgroundColor: colors.primarySoft,
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 16,
        }}
      >
        <Ionicons name="analytics" size={34} color={colors.primary} />
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
        Henüz analiz yok
      </Text>

      <Text
        style={{
          color: colors.mutedText,
          fontSize: 14,
          fontWeight: "600",
          lineHeight: 21,
          textAlign: "center",
          marginTop: 8,
          maxWidth: 280,
        }}
      >
        Bir egzersiz seçip kaydını analiz ettiğinde skorların ve gelişim
        özetin burada görünecek.
      </Text>

      <Pressable
        onPress={onStartPractice}
        style={({ pressed }) => ({
          marginTop: 18,
          backgroundColor: colors.primary,
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
          name="play-circle"
          size={19}
          color={colors.primaryForeground}
        />

        <Text
          style={{
            color: colors.primaryForeground,
            fontSize: 14,
            fontWeight: "900",
          }}
        >
          Çalışmaya başla
        </Text>
      </Pressable>
    </View>
  );
}