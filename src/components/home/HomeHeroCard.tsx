import { useAppTheme } from "@/src/theme/useTheme";
import { Ionicons } from "@expo/vector-icons";
import { Pressable, Text, View } from "react-native";

type Props = {
  onStartPractice: () => void;
};

export function HomeHeroCard({ onStartPractice }: Props) {
  const { colors } = useAppTheme();

  return (
    <View
      style={{
        backgroundColor: colors.card,
        borderRadius: 30,
        padding: 22,
        borderWidth: 1,
        borderColor: colors.softBorder,
        shadowColor: colors.shadow,
        shadowOpacity: 1,
        shadowRadius: 20,
        shadowOffset: { width: 0, height: 12 },
        elevation: 10,
      }}
    >
      <View
        style={{
          width: 58,
          height: 58,
          borderRadius: 22,
          backgroundColor: colors.primarySoft,
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 18,
        }}
      >
        <Ionicons name="musical-notes" size={28} color={colors.primary} />
      </View>

      <Text
        style={{
          color: colors.text,
          fontSize: 28,
          lineHeight: 34,
          fontWeight: "900",
          letterSpacing: -0.6,
        }}
      >
        Piyano performansını analiz et
      </Text>

      <Text
        style={{
          color: colors.mutedText,
          fontSize: 15,
          lineHeight: 22,
          fontWeight: "600",
          marginTop: 10,
        }}
      >
        Bir egzersiz seç, çal ve hangi notalarda gelişmen gerektiğini anlaşılır
        şekilde gör.
      </Text>

      <Pressable
        onPress={onStartPractice}
        style={({ pressed }) => ({
          marginTop: 22,
          backgroundColor: pressed ? colors.primaryPressed : colors.primary,
          borderRadius: 18,
          paddingVertical: 15,
          paddingHorizontal: 18,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          opacity: pressed ? 0.92 : 1,
        })}
      >
        <Ionicons
          name="play"
          size={18}
          color={colors.primaryForeground}
        />

        <Text
          style={{
            color: colors.primaryForeground,
            fontSize: 15,
            fontWeight: "900",
          }}
        >
          Çalışmaya başla
        </Text>
      </Pressable>
    </View>
  );
}