import { useAppTheme } from "@/src/theme/useTheme";
import type { InsightsSummary } from "@/src/utils/insights";
import { Ionicons } from "@expo/vector-icons";
import { Text, View } from "react-native";

type Props = {
  summary: InsightsSummary;
};

function getHeroTitle(summary: InsightsSummary) {
  if (summary.totalAnalyses === 0) {
    return "Gelişimini takip etmeye başla";
  }

  if (summary.averageScore >= 85) {
    return "Harika gidiyorsun";
  }

  if (summary.averageScore >= 65) {
    return "İyi bir ilerleme var";
  }

  return "Çalıştıkça netleşecek";
}

function getHeroDescription(summary: InsightsSummary) {
  if (summary.totalAnalyses === 0) {
    return "İlk egzersiz analizinden sonra skorların, nota doğruluğun ve zamanlama gelişimin burada görünecek.";
  }

  return "Tamamlanan analizlerine göre genel performansını, güçlü yanlarını ve gelişim alanlarını buradan takip edebilirsin.";
}

export function InsightsHeroCard({ summary }: Props) {
  const { colors } = useAppTheme();

  return (
    <View
      style={{
        backgroundColor: colors.elevatedCard,
        borderRadius: 28,
        padding: 18,
        borderWidth: 1,
        borderColor: colors.softBorder,
        overflow: "hidden",
      }}
    >
      <View
        style={{
          position: "absolute",
          right: -34,
          top: -34,
          width: 120,
          height: 120,
          borderRadius: 60,
          backgroundColor: colors.primarySoft,
        }}
      />

      <View
        style={{
          position: "absolute",
          right: 28,
          bottom: -42,
          width: 100,
          height: 100,
          borderRadius: 50,
          backgroundColor: colors.glassBackground,
          borderWidth: 1,
          borderColor: colors.glassBorder,
        }}
      />

      <View
        style={{
          width: 50,
          height: 50,
          borderRadius: 18,
          backgroundColor: colors.primary,
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 16,
        }}
      >
        <Ionicons
          name="analytics"
          size={24}
          color={colors.primaryForeground}
        />
      </View>

      <Text
        style={{
          color: colors.text,
          fontSize: 25,
          fontWeight: "900",
          letterSpacing: -0.6,
        }}
      >
        {getHeroTitle(summary)}
      </Text>

      <Text
        style={{
          color: colors.mutedText,
          fontSize: 14,
          fontWeight: "600",
          lineHeight: 21,
          marginTop: 8,
          maxWidth: "92%",
        }}
      >
        {getHeroDescription(summary)}
      </Text>

      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 8,
          marginTop: 18,
        }}
      >
        <View
          style={{
            paddingHorizontal: 12,
            paddingVertical: 8,
            borderRadius: 999,
            backgroundColor: colors.card,
            borderWidth: 1,
            borderColor: colors.softBorder,
            flexDirection: "row",
            alignItems: "center",
            gap: 6,
          }}
        >
          <Ionicons name="pulse" size={15} color={colors.primary} />

          <Text
            style={{
              color: colors.text,
              fontSize: 12,
              fontWeight: "800",
            }}
          >
            {summary.totalAnalyses > 0
              ? `%${summary.averageScore} genel skor`
              : "Henüz analiz yok"}
          </Text>
        </View>

        {summary.totalAnalyses > 0 ? (
          <View
            style={{
              paddingHorizontal: 12,
              paddingVertical: 8,
              borderRadius: 999,
              backgroundColor: colors.card,
              borderWidth: 1,
              borderColor: colors.softBorder,
              flexDirection: "row",
              alignItems: "center",
              gap: 6,
            }}
          >
            <Ionicons name="checkmark-circle" size={15} color={colors.success} />

            <Text
              style={{
                color: colors.text,
                fontSize: 12,
                fontWeight: "800",
              }}
            >
              {summary.totalAnalyses} analiz
            </Text>
          </View>
        ) : null}
      </View>
    </View>
  );
}