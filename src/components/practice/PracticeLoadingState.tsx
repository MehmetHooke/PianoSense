import { useAppTheme } from "@/src/theme/useTheme";
import { ActivityIndicator, Text, View } from "react-native";

export function PracticeLoadingState() {
  const { colors } = useAppTheme();

  return (
    <View
      style={{
        alignItems: "center",
        justifyContent: "center",
        paddingTop: 70,
      }}
    >
      <ActivityIndicator size="large" color={colors.primary} />

      <Text
        style={{
          marginTop: 12,
          color: colors.mutedText,
          fontSize: 14,
          fontWeight: "700",
        }}
      >
        Egzersizler yükleniyor...
      </Text>
    </View>
  );
}