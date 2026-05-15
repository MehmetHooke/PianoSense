import type { AppColors } from "@/src/theme/colors";
import { Ionicons } from "@expo/vector-icons";
import { Pressable, Text, View } from "react-native";

type Props = {
  title: string;
  description?: string;
  bpm: number;
  onBackPress: () => void;
  colors: AppColors;
};

export function RecordingHeader({
  title,
  description,
  bpm,
  onBackPress,
  colors,
}: Props) {
  return (
    <View style={{ marginBottom: 22 }}>
      <Pressable
        onPress={onBackPress}
        style={{
          width: 44,
          height: 44,
          borderRadius: 16,
          backgroundColor: colors.card,
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 24,
          borderWidth: 1,
          borderColor: colors.border,
          shadowColor: colors.shadow,
          shadowOpacity: 1,
          shadowRadius: 12,
          shadowOffset: { width: 0, height: 6 },
          elevation: 2,
        }}
      >
        <Ionicons name="chevron-back" size={24} color={colors.text} />
      </Pressable>

      <Text
        style={{
          fontSize: 13,
          fontWeight: "800",
          color: colors.primary,
          marginBottom: 8,
          letterSpacing: 0.6,
        }}
      >
        ÇALIŞMA AKIŞI
      </Text>

      <Text
        style={{
          fontSize: 30,
          fontWeight: "900",
          color: colors.text,
          marginBottom: 8,
        }}
      >
        {title}
      </Text>

      <Text
        style={{
          fontSize: 15,
          color: colors.mutedText,
          lineHeight: 22,
        }}
      >
        {description ??
          "Önce orijinal melodiyi dinle. Sonra metronomla hazırlanıp kendi performansını kaydet."}
      </Text>

      <View
        style={{
          marginTop: 14,
          alignSelf: "flex-start",
          paddingHorizontal: 12,
          paddingVertical: 8,
          borderRadius: 999,
          backgroundColor: colors.primarySoft,
          borderWidth: 1,
          borderColor: colors.softBorder,
          flexDirection: "row",
          alignItems: "center",
          gap: 6,
        }}
      >
        <Ionicons name="musical-notes" size={15} color={colors.primary} />

        <Text
          style={{
            color: colors.primary,
            fontSize: 13,
            fontWeight: "800",
          }}
        >
          {bpm} BPM · 4/4
        </Text>
      </View>
    </View>
  );
}