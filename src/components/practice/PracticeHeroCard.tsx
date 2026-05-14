import { useAppTheme } from "@/src/theme/useTheme";
import { Ionicons } from "@expo/vector-icons";
import { Text, View } from "react-native";

export function PracticeHeroCard() {
  const { colors } = useAppTheme();

  return (
    <View
      style={{
        backgroundColor: colors.card,
        borderRadius: 30,
        padding: 20,
        borderWidth: 1,
        borderColor: colors.softBorder,
        shadowColor: colors.shadow,
        shadowOpacity: 1,
        shadowRadius: 18,
        shadowOffset: { width: 0, height: 10 },
        elevation: 8,
      }}
    >
      <View
        style={{
          width: 56,
          height: 56,
          borderRadius: 20,
          backgroundColor: colors.primarySoft,
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 16,
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
          letterSpacing: -0.5,
        }}
      >
        Çalışmak istediğin egzersizi seç
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
        Önce orijinal melodiyi dinle, sonra kendi performansını kaydet ve
        analiz sonucunu gör.
      </Text>
    </View>
  );
}