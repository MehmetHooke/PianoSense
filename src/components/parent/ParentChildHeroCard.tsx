import type { AppColors } from "@/src/theme/colors";
import { alpha } from "@/src/utils/color";
import { Ionicons } from "@expo/vector-icons";
import { Text, View } from "react-native";

type Props = {
  colors: AppColors;
  childName: string;
  weeklyPracticeCount: number;
  lastPracticeLabel: string;
  noteAccuracy?: number;
};

export function ParentChildHeroCard({
  colors,
  childName,
  weeklyPracticeCount,
  lastPracticeLabel,
  noteAccuracy,
}: Props) {
  const hasAccuracy = typeof noteAccuracy === "number";

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
          right: -42,
          top: -46,
          width: 140,
          height: 140,
          borderRadius: 70,
          backgroundColor: alpha(colors.primary, 0.09),
        }}
      />

      <View
        style={{
          width: 54,
          height: 54,
          borderRadius: 21,
          backgroundColor: alpha(colors.primary, 0.12),
          alignItems: "center",
          justifyContent: "center",
          borderWidth: 1,
          borderColor: alpha(colors.primary, 0.14),
          marginBottom: 18,
        }}
      >
        <Ionicons name="sparkles-outline" size={25} color={colors.primary} />
      </View>

      <Text
        style={{
          color: colors.text,
          fontSize: 22,
          fontWeight: "900",
          letterSpacing: -0.45,
          lineHeight: 28,
        }}
      >
        {childName} bu hafta {weeklyPracticeCount} çalışma yaptı
      </Text>

      <Text
        style={{
          color: colors.mutedText,
          fontSize: 14,
          fontWeight: "600",
          lineHeight: 21,
          marginTop: 8,
        }}
      >
        {hasAccuracy
          ? `Son çalışmalarında nota doğruluğu %${Math.round(
              noteAccuracy
            )} seviyesinde. Düzenli tekrarlarla gelişim daha net görünür.`
          : "Çalışmalar başladığında nota doğruluğu ve zamanlama bilgileri burada görünecek."}
      </Text>

      <View
        style={{
          flexDirection: "row",
          gap: 10,
          marginTop: 20,
        }}
      >
        <HeroPill
          colors={colors}
          iconName="musical-notes-outline"
          label={`${weeklyPracticeCount} çalışma`}
        />

        <HeroPill
          colors={colors}
          iconName="time-outline"
          label={`Son: ${lastPracticeLabel}`}
        />
      </View>
    </View>
  );
}

function HeroPill({
  colors,
  iconName,
  label,
}: {
  colors: AppColors;
  iconName: keyof typeof Ionicons.glyphMap;
  label: string;
}) {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.elevatedCard,
        borderRadius: 18,
        paddingVertical: 12,
        paddingHorizontal: 12,
        borderWidth: 1,
        borderColor: colors.softBorder,
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
      }}
    >
      <Ionicons name={iconName} size={17} color={colors.primary} />

      <Text
        numberOfLines={1}
        style={{
          color: colors.text,
          fontSize: 12,
          fontWeight: "800",
        }}
      >
        {label}
      </Text>
    </View>
  );
}