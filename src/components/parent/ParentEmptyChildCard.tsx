import type { AppColors } from "@/src/theme/colors";
import { alpha } from "@/src/utils/color";
import { Ionicons } from "@expo/vector-icons";
import { Pressable, Text, View } from "react-native";

type Props = {
  colors: AppColors;
  onAddChild: () => void;
};

export function ParentEmptyChildCard({ colors, onAddChild }: Props) {
  return (
    <View
      style={{
        marginTop: 26,
        backgroundColor: colors.card,
        borderRadius: 30,
        padding: 20,
        borderWidth: 1,
        borderColor: colors.softBorder,
        shadowColor: colors.shadow,
        shadowOpacity: 0.08,
        shadowRadius: 20,
        shadowOffset: { width: 0, height: 10 },
        elevation: 3,
        overflow: "hidden",
      }}
    >
      <View
        style={{
          position: "absolute",
          right: -36,
          top: -36,
          width: 120,
          height: 120,
          borderRadius: 60,
          backgroundColor: alpha(colors.primary, 0.08),
        }}
      />

      <View
        style={{
          position: "absolute",
          right: 28,
          bottom: -42,
          width: 110,
          height: 110,
          borderRadius: 55,
          backgroundColor: alpha(colors.secondary, 0.07),
        }}
      />

      <View
        style={{
          width: 58,
          height: 58,
          borderRadius: 22,
          backgroundColor: alpha(colors.primary, 0.12),
          alignItems: "center",
          justifyContent: "center",
          borderWidth: 1,
          borderColor: alpha(colors.primary, 0.14),
          marginBottom: 18,
        }}
      >
        <Ionicons name="people-outline" size={27} color={colors.primary} />
      </View>

      <Text
        style={{
          color: colors.text,
          fontSize: 23,
          fontWeight: "900",
          letterSpacing: -0.5,
          lineHeight: 29,
        }}
      >
        Henüz bir çocuk eklenmemiş
      </Text>

      <Text
        style={{
          color: colors.mutedText,
          fontSize: 14,
          fontWeight: "600",
          lineHeight: 21,
          marginTop: 9,
        }}
      >
        Çocuğunun piyano çalışmalarını takip etmek için öğrenci kodu ile
        bağlantı isteği gönderebilirsin.
      </Text>

      <Pressable
        onPress={onAddChild}
        style={({ pressed }) => ({
          marginTop: 20,
          backgroundColor: pressed ? colors.primaryPressed : colors.primary,
          borderRadius: 18,
          paddingVertical: 14,
          paddingHorizontal: 16,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          shadowColor: colors.primary,
          shadowOpacity: 0.18,
          shadowRadius: 16,
          shadowOffset: { width: 0, height: 8 },
          elevation: 3,
          transform: [{ scale: pressed ? 0.98 : 1 }],
        })}
      >
        <Ionicons name="add-circle-outline" size={20} color={colors.inverseText} />

        <Text
          style={{
            color: colors.primaryForeground,
            fontSize: 14,
            fontWeight: "900",
          }}
        >
          Çocuk ekle
        </Text>
      </Pressable>

      <View
        style={{
          marginTop: 16,
          backgroundColor: colors.elevatedCard,
          borderRadius: 18,
          padding: 13,
          borderWidth: 1,
          borderColor: colors.softBorder,
          flexDirection: "row",
          gap: 10,
          alignItems: "flex-start",
        }}
      >
        <Ionicons
          name="shield-checkmark-outline"
          size={19}
          color={colors.primary}
        />

        <Text
          style={{
            flex: 1,
            color: colors.mutedText,
            fontSize: 12,
            fontWeight: "700",
            lineHeight: 18,
          }}
        >
          Bağlantı isteği onaylandıktan sonra çalışma geçmişi ve analiz
          sonuçları burada görünür.
        </Text>
      </View>
    </View>
  );
}